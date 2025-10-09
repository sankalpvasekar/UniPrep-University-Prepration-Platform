import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { papers } from "../data/papers";
import { videos } from "../data/videos";
import Chatbot from "../components/Chatbot";

export default function SubjectPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("questions");
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [aiAnswers, setAiAnswers] = useState({});
  const [loadingAiAnswers, setLoadingAiAnswers] = useState({});
  const [questions, setQuestions] = useState({ easy: [], medium: [], hard: [] });
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [studyProgress, setStudyProgress] = useState({
    questions: 0,
    papers: 0,
    videos: 0,
    chat: 0
  });

  const [currentSubject, setCurrentSubject] = useState({
    name: "Loading...",
    icon: "📚",
    color: "from-blue-500 to-cyan-500",
    description: "Loading subject information..."
  });

  // Fetch AI-generated questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const response = await fetch(`http://localhost:8000/api/ai-questions/${subjectId}/`);
        const data = await response.json();
        
        if (data.error) {
          console.error('Error fetching questions:', data.error);
          // Set empty questions on error
          setQuestions({ easy: [], medium: [], hard: [] });
        } else {
          setQuestions({
            easy: data.easy || [],
            medium: data.medium || [],
            hard: data.hard || []
          });
          
          // Update subject info based on fetched data
          if (data.easy.length > 0 || data.medium.length > 0 || data.hard.length > 0) {
            const subjectName = subjectId.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            setCurrentSubject({
              name: subjectName,
              icon: "📚",
              color: "from-blue-500 to-cyan-500",
              description: `AI-powered study materials for ${subjectName}`
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        setQuestions({ easy: [], medium: [], hard: [] });
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [subjectId]);

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

  const getAiAnswer = async (category, index) => {
    const key = `${category}-${index}`;
    const question = questions[category][index];
    
    setLoadingAiAnswers(prev => ({ ...prev, [key]: true }));
    
    // Simulate AI response (in real app, this would call an AI API)
    setTimeout(() => {
      const aiResponse = `AI Answer for "${question.question}":\n\nThis is a comprehensive AI-generated answer that provides detailed explanations, examples, and step-by-step solutions for the question. The AI has analyzed the question context and difficulty level to provide the most helpful response.\n\nKey points:\n• Detailed explanation of concepts\n• Step-by-step solution approach\n• Related examples and applications\n• Common mistakes to avoid\n• Additional practice recommendations`;
      
      setAiAnswers(prev => ({ ...prev, [key]: aiResponse }));
      setLoadingAiAnswers(prev => ({ ...prev, [key]: false }));
    }, 2000);
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">UniPrep</h1>
              </button>
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Questions Tab */}
        {activeTab === "questions" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">AI-Prioritized Questions</h2>
                <button
                  onClick={() => markAsStudied('questions')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Mark as Studied
                </button>
              </div>

              {loadingQuestions ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing questions with AI algorithm...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                </div>
              ) : questions.easy.length === 0 && questions.medium.length === 0 && questions.hard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No questions available</h3>
                  <p className="text-gray-500">Questions for this subject are not available in the dataset</p>
                </div>
              ) : (
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
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <span>Year: {q.year}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                                  difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {difficulty}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => getAiAnswer(difficulty, i)}
                                  disabled={loadingAiAnswers[`${difficulty}-${i}`]}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                                    loadingAiAnswers[`${difficulty}-${i}`]
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : aiAnswers[`${difficulty}-${i}`]
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg'
                                  }`}
                                >
                                  {loadingAiAnswers[`${difficulty}-${i}`] ? (
                                    <>
                                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                      <span>Getting AI Answer...</span>
                                    </>
                                  ) : aiAnswers[`${difficulty}-${i}`] ? (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span>AI Answer Ready</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                      <span>Get AI Answer</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => toggleQuestion(difficulty, i)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestions[`${difficulty}-${i}`] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          {expandedQuestions[`${difficulty}-${i}`] && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              {/* Original Answer */}
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-gray-900">Original Answer:</h4>
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

                              {/* AI Answer */}
                              {aiAnswers[`${difficulty}-${i}`] && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                      <h4 className="font-medium text-purple-900">AI Enhanced Answer:</h4>
                                    </div>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                                      AI Powered
                                    </span>
                                  </div>
                                  <div className="text-purple-800 text-sm leading-relaxed whitespace-pre-line">
                                    {aiAnswers[`${difficulty}-${i}`]}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              )}
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
                {papers.map((paper, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.title}</h3>
                          <p className="text-gray-600 mb-3">{paper.description || "Previous year question paper with solutions"}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {paper.duration}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {paper.totalMarks} marks
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {paper.difficulty}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              {paper.downloadCount} downloads
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {paper.sections.map((section, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                                {section}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download</span>
                        </a>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                {videos.map((video, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                          <div className="flex items-center space-x-1 text-yellow-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm text-gray-600">{video.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3 text-sm">{video.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {video.instructor}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {video.views} views
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {video.difficulty}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {video.topics.map((topic, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
                              {topic}
                            </span>
                          ))}
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
                ))}
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
              <Chatbot />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
