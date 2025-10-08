import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { subjectsAPI, questionsAPI, papersAPI, videosAPI } from "../services/api";
import Chatbot from "../components/Chatbot";

export default function SubjectPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("questions");
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [studyProgress, setStudyProgress] = useState({
    questions: 0,
    papers: 0,
    videos: 0,
    chat: 0
  });

  // State for API data
  const [subject, setSubject] = useState(null);
  const [questions, setQuestions] = useState({ easy: [], medium: [], hard: [] });
  const [papers, setPapers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubjectData();
  }, [subjectId]);

  const loadSubjectData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch subject details
      const subjectData = await subjectsAPI.getById(subjectId);
      setSubject(subjectData);
      
      // Organize questions by difficulty
      const organizedQuestions = {
        easy: subjectData.questions?.filter(q => q.difficulty === 'easy') || [],
        medium: subjectData.questions?.filter(q => q.difficulty === 'medium') || [],
        hard: subjectData.questions?.filter(q => q.difficulty === 'hard') || [],
      };
      setQuestions(organizedQuestions);
      
      // Set papers and videos
      setPapers(subjectData.papers || []);
      setVideos(subjectData.videos || []);
      
    } catch (err) {
      console.error("Failed to load subject data:", err);
      setError("Failed to load subject data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading subject data...</p>
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Subject not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentSubject = {
    name: subject.name,
    icon: subject.icon,
    color: "from-blue-500 to-cyan-500",
    description: subject.description || "Learn and master this subject"
  };

  const tabs = [
    { id: "questions", name: "Questions", icon: "❓", count: questions.easy.length + questions.medium.length + questions.hard.length },
    { id: "papers", name: "Past Papers", icon: "📄", count: papers.length },
    { id: "videos", name: "Videos & Notes", icon: "🎥", count: videos.length },
    { id: "chat", name: "AI Assistant", icon: "🤖", count: null }
  ];

  const toggleQuestion = (category, index) => {
    const key = `${category}-${index}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const markAsStudied = (tab) => {
    setStudyProgress(prev => ({
      ...prev,
      [tab]: Math.min(prev[tab] + 1, 10)
    }));
  };

  const getProgressColor = (progress) => {
    if (progress >= 8) return "from-green-500 to-emerald-500";
    if (progress >= 5) return "from-blue-500 to-cyan-500";
    if (progress >= 3) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-4">
                <div className={`
                  w-16 h-16 rounded-2xl bg-gradient-to-br ${currentSubject.color} 
                  flex items-center justify-center text-3xl shadow-lg
                `}>
                  {currentSubject.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{currentSubject.name}</h1>
                  <p className="text-gray-600 mt-1">{currentSubject.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Study Progress</p>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(Object.values(studyProgress).reduce((a, b) => a + b, 0) / 4)}`}
                      style={{ width: `${(Object.values(studyProgress).reduce((a, b) => a + b, 0) / 4) * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((Object.values(studyProgress).reduce((a, b) => a + b, 0) / 4) * 10)}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">S</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Questions Tab */}
        {activeTab === "questions" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Practice Questions</h2>
                <button
                  onClick={() => markAsStudied('questions')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Mark as Studied
                </button>
              </div>

              <div className="space-y-8">
                {Object.entries(questions).map(([difficulty, questionList]) => (
                  <div key={difficulty} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-900 capitalize">{difficulty} Questions</h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        {questionList.length} questions
                      </span>
                    </div>
                    <div className="grid gap-4">
                      {questionList.map((q, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium mb-2">{q.question}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Year: {q.year}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                                  difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {difficulty}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleQuestion(difficulty, i)}
                              className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestions[`${difficulty}-${i}`] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                          {expandedQuestions[`${difficulty}-${i}`] && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-gray-900">Answer:</h4>
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                                      {q.topic}
                                    </span>
                                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                                      {q.marks} marks
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {q.answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}

          {/* Papers Tab */}
        {activeTab === "papers" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Past Papers</h2>
                <button
                  onClick={() => markAsStudied('papers')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Mark as Studied
                </button>
              </div>

              <div className="grid gap-4">
                {papers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No past papers available for this subject yet.</p>
                  </div>
                ) : (
                  papers.map((paper) => (
                    <div key={paper.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.title}</h3>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {paper.year} - {paper.semester}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <a
                            href={paper.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
          </div>
        )}

          {/* Videos Tab */}
        {activeTab === "videos" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Video Lectures & Notes</h2>
                <button
                  onClick={() => markAsStudied('videos')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Mark as Studied
                </button>
              </div>

              <div className="grid gap-6">
                {videos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p>No videos available for this subject yet.</p>
                  </div>
                ) : (
                  videos.map((video) => (
                    <div key={video.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className="w-24 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                            {video.duration}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {video.duration}
                            </div>
                          </div>
                        
                        <div className="flex items-center space-x-4">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span>Watch Video</span>
                          </a>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add to Playlist</span>
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
          </div>
        )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">AI Study Assistant</h2>
                <button
                  onClick={() => markAsStudied('chat')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Mark as Studied
                </button>
              </div>
              <Chatbot subjectId={subjectId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
