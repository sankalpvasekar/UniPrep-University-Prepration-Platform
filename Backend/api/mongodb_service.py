"""
MongoDB service for handling data operations
"""
from django.conf import settings
from bson import ObjectId
import json
from datetime import datetime


class MongoDBService:
    def __init__(self):
        self.db = settings.MONGODB_DATABASE
        self.questions_collection = self.db['questions']
        self.papers_collection = self.db['papers']
        self.videos_collection = self.db['videos']
    
    def get_questions_by_subject(self, subject_id):
        """Get questions for a specific subject"""
        try:
            questions = list(self.questions_collection.find({'subject_id': subject_id}))
            return questions
        except Exception as e:
            print(f"Error fetching questions: {e}")
            return []
    
    def get_papers_by_subject(self, subject_id):
        """Get papers for a specific subject"""
        try:
            papers = list(self.papers_collection.find({'subject_id': subject_id}))
            return papers
        except Exception as e:
            print(f"Error fetching papers: {e}")
            return []
    
    def get_videos_by_subject(self, subject_id):
        """Get videos for a specific subject"""
        try:
            videos = list(self.videos_collection.find({'subject_id': subject_id}))
            return videos
        except Exception as e:
            print(f"Error fetching videos: {e}")
            return []
    
    def insert_question(self, question_data):
        """Insert a new question"""
        try:
            question_data['created_at'] = datetime.now()
            result = self.questions_collection.insert_one(question_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error inserting question: {e}")
            return None
    
    def insert_paper(self, paper_data):
        """Insert a new paper"""
        try:
            paper_data['created_at'] = datetime.now()
            result = self.papers_collection.insert_one(paper_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error inserting paper: {e}")
            return None
    
    def insert_video(self, video_data):
        """Insert a new video"""
        try:
            video_data['created_at'] = datetime.now()
            result = self.videos_collection.insert_one(video_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error inserting video: {e}")
            return None


# Global instance
mongodb_service = MongoDBService()
