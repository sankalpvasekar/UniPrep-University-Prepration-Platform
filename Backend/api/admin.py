from django.contrib import admin
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.shortcuts import redirect
from django.contrib import messages
from django.template.response import TemplateResponse
from django.conf import settings
import os
import pandas as pd
import re
import io
from .models import Branch, Subject, Question, Paper, Video, UserProfile, DatasetUpload

# Optional: analyzer reload after data update
try:
    from .uniprep_analyzer import reload_analyzer
except Exception:
    reload_analyzer = None

@staff_member_required
def upload_dataset_csv(request):
    """Admin page to upload CSV and append it into the dataset directory per branch.
    Required columns: branch, study_year, subject, mark_weightage, Qyear, question_text
    """
    context = admin.site.each_context(request)
    context.update({'title': 'Upload Dataset CSV'})

    if request.method == 'POST' and request.FILES.get('file'):
        up_file = request.FILES['file']
        if not up_file.name.lower().endswith('.csv'):
            messages.error(request, 'Please upload a .csv file.')
            return redirect(request.path)
        try:
            # Read uploaded CSV: decode bytes to text first to avoid bytes/regex issues
            raw = up_file.read()
            text = None
            for enc in ('utf-8-sig', 'utf-8', 'latin1'):
                try:
                    text = raw.decode(enc)
                    break
                except Exception:
                    continue
            if text is None:
                messages.error(request, 'Failed to decode CSV file. Please ensure it is saved as UTF-8.')
                return redirect(request.path)

            # First attempt with header autodetect and delimiter sniffing
            try:
                df = pd.read_csv(io.StringIO(text), sep=None, engine='python', keep_default_na=False)
            except Exception:
                # Retry assuming no header; then promote first row to header
                df = pd.read_csv(io.StringIO(text), header=None, sep=None, engine='python', keep_default_na=False)
                if not df.empty:
                    df.columns = df.iloc[0]
                    df = df.iloc[1:].reset_index(drop=True)

            # Normalize headers: lowercase, strip, replace spaces/dashes with underscores
            def _norm(s):
                return str(s).strip().lower().replace('-', '_').replace(' ', '_')

            cols = list(df.columns)
            norm_map = {_norm(c): c for c in cols}

            # Map aliases to canonical names
            # Canonical set we want: branch, study_year, subject, question_text, Qyear, mark_weightage
            alias_to_canonical = {}
            for norm, original in norm_map.items():
                if norm in {'branch'}:
                    alias_to_canonical[original] = 'branch'
                elif norm in {'year', 'study_year', 'studyyr'}:
                    alias_to_canonical[original] = 'study_year'
                elif norm in {'subject', 'sub'}:
                    alias_to_canonical[original] = 'subject'
                elif norm in {'question_text', 'question', 'qtext', 'qtest'}:
                    alias_to_canonical[original] = 'question_text'
                elif norm in {'qyear', 'question_year', 'q_year'}:
                    alias_to_canonical[original] = 'Qyear'
                elif norm in {'mark_weightage', 'mark', 'marks', 'weightage', 'mark_weight', 'mark__weightage', 'markweightage'}:
                    alias_to_canonical[original] = 'mark_weightage'
                elif norm in {'id'}:
                    alias_to_canonical[original] = 'id'

            # Apply rename
            if alias_to_canonical:
                df = df.rename(columns=alias_to_canonical)

            required = ['branch', 'study_year', 'subject', 'mark_weightage', 'Qyear', 'question_text']
            missing = [c for c in required if c not in df.columns]
            if missing:
                messages.error(
                    request,
                    f"Missing required columns: {', '.join(missing)}. Received columns: {list(df.columns)}"
                )
                return redirect(request.path)

            # Normalize
            df['branch'] = df['branch'].astype(str).str.strip().str.upper()
            data_dir = os.path.join(settings.BASE_DIR, 'data')
            os.makedirs(data_dir, exist_ok=True)

            total_before = 0
            total_after = 0
            files_touched = []

            for b in sorted(df['branch'].unique()):
                # Ensure branch value is str for filename creation
                if isinstance(b, bytes):
                    b_val = b.decode('utf-8', 'ignore')
                else:
                    b_val = str(b)
                bdf = df[df['branch'] == b].copy()
                safe_b = re.sub(r"[^A-Za-z0-9]+", "_", b_val).strip("_") or "DATA"

                # Prefer appending to an existing per-branch file, e.g., "CSE_UniPrep (1) (3).csv"
                candidates = []
                try:
                    pattern = re.compile(rf"^{re.escape(safe_b)}_UniPrep.*\.csv$", re.IGNORECASE)
                    for fname in os.listdir(data_dir):
                        if pattern.match(fname):
                            candidates.append(fname)
                except Exception:
                    candidates = []
                if candidates:
                    # Choose most recently modified existing file
                    chosen = max(candidates, key=lambda fn: os.path.getmtime(os.path.join(data_dir, fn)))
                    target = os.path.join(data_dir, chosen)
                else:
                    target = os.path.join(data_dir, f"{safe_b}_UniPrep.csv")

                # For appended files, handle optional 'id' continuity: drop incoming ids; we'll reassign if needed
                if 'id' in bdf.columns:
                    bdf = bdf.drop(columns=['id'])

                if os.path.exists(target):
                    existing = pd.read_csv(target)
                    total_before += len(existing)
                    merged = pd.concat([existing, bdf], ignore_index=True)
                    # Drop exact duplicate rows to avoid double counting
                    merged = merged.drop_duplicates()

                    # If 'id' exists in existing file, continue numbering for new rows only
                    if 'id' in existing.columns:
                        # Ensure 'id' column present and detect rows needing IDs
                        if 'id' not in merged.columns:
                            merged['id'] = pd.NA
                        max_id = pd.to_numeric(existing.get('id'), errors='coerce').fillna(0).astype(int).max()
                        # Identify rows that originated from bdf by lack of 'id'
                        need_ids = merged['id'].isna()
                        count_new = int(need_ids.sum())
                        if count_new > 0:
                            merged.loc[need_ids, 'id'] = range(max_id + 1, max_id + 1 + count_new)
                        # Reorder columns to keep 'id' first if it was first before
                        cols = list(merged.columns)
                        if cols[0] != 'id' and 'id' in cols:
                            cols = ['id'] + [c for c in cols if c != 'id']
                            merged = merged[cols]

                    merged.to_csv(target, index=False)
                    total_after += len(merged)
                else:
                    # Create a new per-branch file
                    bdf = bdf.drop_duplicates()
                    # If first time and uploader provided ids earlier, we keep as-is (no 'id' column now)
                    bdf.to_csv(target, index=False)
                    total_after += len(bdf)
                files_touched.append(os.path.basename(target))

            # Trigger analyzer reload if available
            if reload_analyzer is not None:
                try:
                    reload_analyzer()
                except Exception:
                    # Non-fatal if reload fails; user can reload via API
                    pass

            added = max(0, total_after - total_before)
            messages.success(
                request,
                f"Upload successful. Files updated: {', '.join(files_touched)}. Added {added} new rows."
            )
            return redirect(request.path)
        except Exception as e:
            messages.error(request, f"Upload failed: {e}")
            return redirect(request.path)

    return TemplateResponse(request, 'admin/upload_dataset.html', context)


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'icon']
    search_fields = ['name']


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'branch', 'icon']
    list_filter = ['branch']
    search_fields = ['name', 'code']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['subject', 'difficulty', 'marks', 'text_preview']
    list_filter = ['difficulty', 'subject__branch']
    search_fields = ['text']
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Question'


@admin.register(Paper)
class PaperAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'year', 'semester']
    list_filter = ['year', 'semester', 'subject__branch']
    search_fields = ['title']


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'duration']
    list_filter = ['subject__branch']
    search_fields = ['title']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'branch']
    list_filter = ['branch']
    search_fields = ['user__username', 'user__email']


@admin.register(DatasetUpload)
class DatasetUploadAdmin(admin.ModelAdmin):
    """Admin entry that forwards to the upload page so it's visible on admin home."""
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True

    def changelist_view(self, request, extra_context=None):
        return upload_dataset_csv(request)
