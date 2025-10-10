import React, { useMemo } from "react";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { profileName, email, initials, user, firstName, lastName } = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const first = stored?.first_name || stored?.firstName || "";
      const last = stored?.last_name || stored?.lastName || "";
      const fallbackName =
        stored?.name ||
        stored?.username ||
        (stored?.email ? stored.email.split("@")[0] : "User");
      const fullName = (first || last) ? `${first} ${last}`.trim() : fallbackName;
      const makeInitials = (n) => {
        if (!n) return "U";
        const parts = n.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      };
      return {
        user: stored,
        firstName: first,
        lastName: last,
        profileName: fullName,
        email: stored?.email || "",
        initials: makeInitials(fullName),
      };
    } catch (_) {
      return { user: {}, firstName: "", lastName: "", profileName: "User", email: "", initials: "U" };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">UniPrep</h1>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xl">{initials}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profileName}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-800 mb-2">Account</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div><span className="text-gray-500">Profile Name: </span>{profileName}</div>
                {user?.username && <div><span className="text-gray-500">Username: </span>{user.username}</div>}
                {email && <div><span className="text-gray-500">Email: </span>{email}</div>}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-800 mb-2">Preferences</h3>
              <p className="text-sm text-gray-600">Coming soon.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
