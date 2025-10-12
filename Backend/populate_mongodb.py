"""
Script to populate MongoDB with sample data
"""
import os
import sys
import django

# Add the Backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uniprep_backend.settings')
django.setup()

from api.mongodb_service import mongodb_service

def populate_sample_data():
    """Populate MongoDB with sample questions, papers, and videos"""
    
    # Sample questions for Data Structures
    data_structures_questions = [
        {
            'subject_id': 'data-structures',
            'text': 'What is a binary search tree and explain its properties?',
            'difficulty': 'easy',
            'marks': 5,
            'topic': 'Trees',
            'year': 2023
        },
        {
            'subject_id': 'data-structures',
            'text': 'Implement a function to find the height of a binary tree.',
            'difficulty': 'medium',
            'marks': 8,
            'topic': 'Trees',
            'year': 2023
        },
        {
            'subject_id': 'data-structures',
            'text': 'Compare and contrast different sorting algorithms in terms of time complexity.',
            'difficulty': 'hard',
            'marks': 10,
            'topic': 'Sorting',
            'year': 2023
        },
        {
            'subject_id': 'data-structures',
            'text': 'What is the difference between a stack and a queue?',
            'difficulty': 'easy',
            'marks': 5,
            'topic': 'Linear Data Structures',
            'year': 2023
        },
        {
            'subject_id': 'data-structures',
            'text': 'Explain the working of hash tables and collision resolution techniques.',
            'difficulty': 'medium',
            'marks': 8,
            'topic': 'Hashing',
            'year': 2023
        }
    ]
    
    # Sample questions for Algorithms
    algorithms_questions = [
        {
            'subject_id': 'algorithms',
            'text': 'What is the time complexity of binary search?',
            'difficulty': 'easy',
            'marks': 5,
            'topic': 'Searching',
            'year': 2023
        },
        {
            'subject_id': 'algorithms',
            'text': 'Implement the merge sort algorithm and analyze its complexity.',
            'difficulty': 'medium',
            'marks': 8,
            'topic': 'Sorting',
            'year': 2023
        },
        {
            'subject_id': 'algorithms',
            'text': 'Explain dynamic programming with examples.',
            'difficulty': 'hard',
            'marks': 10,
            'topic': 'Dynamic Programming',
            'year': 2023
        }
    ]
    
    # Sample papers
    papers = [
        {
            'subject_id': 'data-structures',
            'title': 'Data Structures Midterm Exam 2023',
            'year': 2023,
            'semester': 'Midterm',
            'file_url': '#',
            'description': 'Midterm examination for Data Structures course'
        },
        {
            'subject_id': 'algorithms',
            'title': 'Algorithms Final Exam 2023',
            'year': 2023,
            'semester': 'Final',
            'file_url': '#',
            'description': 'Final examination for Algorithms course'
        }
    ]
    
    # Sample videos
    videos = [
        {
            'subject_id': 'data-structures',
            'title': 'Introduction to Binary Trees',
            'url': 'https://www.youtube.com/watch?v=example1',
            'duration': '15:30',
            'thumbnail': 'https://img.youtube.com/vi/example1/maxresdefault.jpg'
        },
        {
            'subject_id': 'algorithms',
            'title': 'Merge Sort Algorithm Explained',
            'url': 'https://www.youtube.com/watch?v=example2',
            'duration': '20:45',
            'thumbnail': 'https://img.youtube.com/vi/example2/maxresdefault.jpg'
        }
    ]
    
    # Insert questions
    print("Inserting questions...")
    for question in data_structures_questions + algorithms_questions:
        result = mongodb_service.insert_question(question)
        if result:
            print(f"Inserted question: {question['text'][:50]}...")
        else:
            print(f"Failed to insert question: {question['text'][:50]}...")
    
    # Insert papers
    print("\nInserting papers...")
    for paper in papers:
        result = mongodb_service.insert_paper(paper)
        if result:
            print(f"Inserted paper: {paper['title']}")
        else:
            print(f"Failed to insert paper: {paper['title']}")
    
    # Insert videos
    print("\nInserting videos...")
    for video in videos:
        result = mongodb_service.insert_video(video)
        if result:
            print(f"Inserted video: {video['title']}")
        else:
            print(f"Failed to insert video: {video['title']}")
    
    print("\nMongoDB population completed!")

if __name__ == '__main__':
    populate_sample_data()
