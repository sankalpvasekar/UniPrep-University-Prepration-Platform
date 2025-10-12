"""
RAG-based AI Study Assistant
Uses subject context to answer questions
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Subject, Question, Paper, Video
import os

# Simple RAG implementation without external API dependencies
def get_subject_context(subject_id):
    """Retrieve all relevant context for a subject"""
    try:
        subject = Subject.objects.get(id=subject_id)
        
        # Gather all subject-related information
        questions = Question.objects.filter(subject=subject)
        papers = Paper.objects.filter(subject=subject)
        videos = Video.objects.filter(subject=subject)
        
        context = {
            'subject_name': subject.name,
            'subject_code': subject.code,
            'description': subject.description,
            'questions': [
                {
                    'text': q.text,
                    'difficulty': q.difficulty,
                    'marks': q.marks
                } for q in questions
            ],
            'papers': [
                {
                    'title': p.title,
                    'year': p.year,
                    'semester': p.semester
                } for p in papers
            ],
            'videos': [
                {
                    'title': v.title,
                    'duration': v.duration
                } for v in videos
            ]
        }
        
        return context
    except Subject.DoesNotExist:
        return None

def generate_response(question, context):
    """Generate a response based on the question and context"""
    question_lower = question.lower()
    
    # Check for greetings
    greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']
    if any(greeting == question_lower.strip() or question_lower.startswith(greeting + ' ') for greeting in greetings):
        return f"Hello! I'm your AI study assistant for {context['subject_name']} ({context['subject_code']}). I can help you with questions about this subject, past papers, study materials, and exam preparation. How can I assist you today?"
    
    # Check for questions about past papers
    if any(word in question_lower for word in ['paper', 'exam', 'previous', 'past']):
        papers = context['papers']
        if papers:
            response = f"Here are the available past papers for {context['subject_name']}:\n\n"
            for paper in papers:
                response += f"• {paper['title']} ({paper['year']} - {paper['semester']})\n"
            response += "\nYou can access these papers from the 'Past Papers' tab."
            return response
        else:
            return f"Currently, there are no past papers available for {context['subject_name']}. However, I recommend:\n\n1. Check with your instructor for previous year papers\n2. Practice with the {len(context['questions'])} available questions\n3. Watch the {len(context['videos'])} video lectures to understand concepts better"
    
    # Check for questions about videos/resources
    if any(word in question_lower for word in ['video', 'lecture', 'tutorial', 'resource', 'watch', 'learn']):
        videos = context['videos']
        if videos:
            response = f"Here are the available video resources for {context['subject_name']}:\n\n"
            for video in videos:
                response += f"• {video['title']} ({video['duration']})\n"
            response += "\nYou can watch these videos from the 'Videos & Notes' tab. These are curated from top educational channels!"
            return response
        else:
            return f"Currently, there are no video resources available for {context['subject_name']}. Please check back later."
    
    # Check for questions about probable questions
    if any(word in question_lower for word in ['question', 'probable', 'important', 'topic', 'practice']):
        questions = context['questions']
        if questions:
            # Filter by difficulty if mentioned
            difficulty = None
            if 'easy' in question_lower:
                difficulty = 'easy'
            elif 'medium' in question_lower:
                difficulty = 'medium'
            elif 'hard' in question_lower or 'difficult' in question_lower:
                difficulty = 'hard'
            
            if difficulty:
                filtered = [q for q in questions if q['difficulty'] == difficulty]
                if filtered:
                    response = f"Here are {difficulty} level questions for {context['subject_name']}:\n\n"
                    for i, q in enumerate(filtered, 1):
                        response += f"{i}. {q['text']} ({q['marks']} marks)\n\n"
                    return response
                else:
                    return f"No {difficulty} level questions available. Try asking for 'easy', 'medium', or 'hard' questions."
            
            response = f"Here are important questions for {context['subject_name']}:\n\n"
            for i, q in enumerate(questions, 1):
                response += f"{i}. [{q['difficulty'].upper()}] {q['text']} ({q['marks']} marks)\n\n"
            response += "You can find these questions in the 'Questions' tab. Practice them to prepare for exams!"
            return response
        else:
            return f"Currently, there are no practice questions available for {context['subject_name']}."
    
    # Check for study tips
    if any(word in question_lower for word in ['how to study', 'tips', 'prepare', 'strategy', 'how do i', 'help me study']):
        return f"""Here are personalized study tips for {context['subject_name']}:

📚 **Study Strategy:**
1. **Watch Video Lectures First**: Start with the {len(context['videos'])} available videos to build foundation
2. **Practice Questions**: Solve the {len(context['questions'])} practice questions (start with easy, then medium, then hard)
3. **Review Past Papers**: Practice with {len(context['papers'])} past papers to understand exam patterns
4. **Make Notes**: Summarize key concepts in your own words
5. **Regular Revision**: Review topics daily for better retention
6. **Time Management**: Allocate 2-3 hours daily for this subject
7. **Ask Questions**: Use this AI assistant whenever you're stuck!

💡 **Pro Tip**: Focus on understanding concepts rather than memorizing. Good luck! 🎯"""
    
    # Check for specific topic questions
    if any(word in question_lower for word in ['explain', 'what is', 'define', 'how does', 'why']):
        # Try to provide topic-specific guidance
        return f"""Great question about {context['subject_name']}! 

While I can provide general guidance, for detailed explanations I recommend:

1. **Watch the video lectures** - Check the 'Videos & Notes' tab for {len(context['videos'])} curated videos
2. **Review practice questions** - The 'Questions' tab has {len(context['questions'])} questions that cover key topics
3. **Study past papers** - See how topics are tested in exams

Would you like me to show you the available videos, questions, or study tips instead?"""
    
    # Check for subject information - only when explicitly asked
    if question_lower in ['about', 'info', 'information', 'tell me about this subject', 'what is this subject']:
        return f"""{context['subject_name']} ({context['subject_code']})

{context['description']}

**Available Resources:**
• {len(context['questions'])} practice questions
• {len(context['papers'])} past papers
• {len(context['videos'])} video lectures

Ask me about videos, questions, study tips, or past papers!"""
    
    # Default response for unclear questions
    return f"""I can help you with {context['subject_name']}! Try asking:

• "Show me videos" - Get video lecture recommendations
• "Give me practice questions" - See important questions
• "Show me past papers" - Access previous exams
• "How to study?" - Get personalized study tips
• "Show me easy/medium/hard questions" - Filter by difficulty

What would you like to know?"""


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_ai(request):
    """AI chatbot endpoint with RAG - streaming response"""
    from django.http import StreamingHttpResponse
    import json
    import time
    
    question = request.data.get('question', '').strip()
    subject_id = request.data.get('subject_id')
    
    if not question:
        return Response(
            {'error': 'Question is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not subject_id:
        return Response(
            {'error': 'Subject ID is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get subject context
    context = get_subject_context(subject_id)
    
    if not context:
        return Response(
            {'error': 'Subject not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Generate response using RAG
    answer = generate_response(question, context)
    
    # Stream the response word by word for real-time effect
    def stream_response():
        words = answer.split(' ')
        for i, word in enumerate(words):
            chunk = {
                'word': word + ' ',
                'is_final': i == len(words) - 1,
                'subject': context['subject_name']
            }
            yield f"data: {json.dumps(chunk)}\n\n"
            time.sleep(0.05)  # Small delay for typing effect
    
    # Check if client wants streaming
    if request.data.get('stream', False):
        response = StreamingHttpResponse(
            stream_response(),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response
    
    # Regular response
    return Response({
        'question': question,
        'answer': answer,
        'subject': context['subject_name']
    })
