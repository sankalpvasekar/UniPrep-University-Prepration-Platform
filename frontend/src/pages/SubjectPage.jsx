import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { videos } from "../data/videos";
import Chatbot from "../components/ChatbotNew";

export default function SubjectPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("questions");
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [aiAnswers, setAiAnswers] = useState({});
  const [loadingAiAnswers, setLoadingAiAnswers] = useState({});
  const [questions, setQuestions] = useState({ easy: [], medium: [], hard: [] });
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [concepts, setConcepts] = useState([]);
  const [loadingConcepts, setLoadingConcepts] = useState(false);
  const [prioritized, setPrioritized] = useState([]);
  const [pastPapers, setPastPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(false);

  const [currentSubject, setCurrentSubject] = useState({
    name: "Loading...",
    icon: "📚",
    color: "from-blue-500 to-cyan-500",
    description: "Loading subject information..."
  });

  // Fetch questions when Questions tab is active
  useEffect(() => {
    if (activeTab !== 'questions') return;
    const search = new URLSearchParams(location.search);
    const studyYear = search.get('year') || '';
    let cancelled = false;
    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const url = new URL(`http://localhost:8000/api/ai-questions/${subjectId}/`);
        if (studyYear) url.searchParams.set('year', studyYear);
        // Deterministic backend behavior for stable clustering/ranking
        url.searchParams.set('seed', '42');
        // Optional: allow overriding top/predict_year via query string if provided
        const top = search.get('top');
        if (top) url.searchParams.set('top', top);
        const predictYear = search.get('predict_year');
        if (predictYear) url.searchParams.set('predict_year', predictYear);
        const response = await fetch(url.toString());
        const data = await response.json();
        if (cancelled) return;
        if (data.error) {
          console.error('Error fetching questions:', data.error);
          setQuestions({ easy: [], medium: [], hard: [] });
          setPrioritized([]);
        } else {
          setQuestions({
            easy: data.easy || [],
            medium: data.medium || [],
            hard: data.hard || []
          });
          setPrioritized(Array.isArray(data.prioritized) ? data.prioritized : []);
          if ((data.easy?.length || 0) + (data.medium?.length || 0) + (data.hard?.length || 0) > 0) {
            const subjectName = subjectId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            setCurrentSubject({
              name: subjectName,
              icon: "📚",
              color: "from-blue-500 to-cyan-500",
              description: `AI-powered study materials for ${subjectName}`
            });
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch questions:', error);
          setQuestions({ easy: [], medium: [], hard: [] });
          setPrioritized([]);
        }
      } finally {
        if (!cancelled) setLoadingQuestions(false);
      }
    };
    fetchQuestions();
    return () => { cancelled = true; };
  }, [subjectId, activeTab]);

  // Fetch past papers when Papers tab is active
  useEffect(() => {
    if (activeTab !== 'papers') return;
    let cancelled = false;
    const fetchPapers = async () => {
      try {
        setLoadingPapers(true);
        const search = new URLSearchParams(location.search);
        const studyYear = search.get('year') || '';
        const url = new URL(`http://localhost:8000/api/dataset/papers/${subjectId}/`);
        if (studyYear) url.searchParams.set('year', studyYear);
        const res = await fetch(url.toString());
        const data = await res.json();
        if (cancelled) return;
        if (data && Array.isArray(data.papers)) {
          setPastPapers(data.papers);
        } else {
          setPastPapers([]);
        }
        // If subject header not yet set, set it from subjectId consistently
        if (currentSubject.name === 'Loading...' || currentSubject.name === 'Loading') {
          const subjectName = subjectId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          setCurrentSubject(s => ({
            ...s,
            name: subjectName,
            description: `AI-powered study materials for ${subjectName}`
          }));
        }
      } catch (e) {
        if (!cancelled) setPastPapers([]);
      } finally {
        if (!cancelled) setLoadingPapers(false);
      }
    };
    fetchPapers();
    return () => { cancelled = true; };
  }, [subjectId, activeTab, location.search]);

  // Fetch concepts when Concepts tab is active
  useEffect(() => {
    if (activeTab !== 'concepts') return;
    let cancelled = false;
    const fetchConcepts = async () => {
      try {
        setLoadingConcepts(true);
        const search = new URLSearchParams(location.search);
        const studyYear = search.get('year') || '';
        const url = new URL(`http://localhost:8000/api/concepts/${subjectId}/`);
        if (studyYear) url.searchParams.set('year', studyYear);
        // Deterministic backend behavior to align topic aggregation
        url.searchParams.set('seed', '42');
        const predictYear2 = search.get('predict_year');
        if (predictYear2) url.searchParams.set('predict_year', predictYear2);
        const res = await fetch(url.toString());
        const data = await res.json();
        if (cancelled) return;
        if (data.error) {
          console.error('Error fetching concepts:', data.error);
          setConcepts([]);
        } else {
          setConcepts(Array.isArray(data.concepts) ? data.concepts : []);
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to fetch concepts:', e);
          setConcepts([]);
        }
      } finally {
        if (!cancelled) setLoadingConcepts(false);
      }
    };
    fetchConcepts();
    return () => { cancelled = true; };
  }, [subjectId, activeTab]);

  // Filter videos based on current subject
  const filteredVideos = videos.filter(video => video.subject === subjectId);

  const tabs = [
    { id: "questions", name: "Questions", icon: "❓", count: questions.easy.length + questions.medium.length + questions.hard.length },
    { id: "papers", name: "Past Papers", icon: "📄", count: pastPapers.length },
    { id: "videos", name: "Videos & Notes", icon: "🎥", count: filteredVideos.length },
    { id: "concepts", name: "Topics", icon: "📘", count: concepts.length },
    { id: "chat", name: "AI Assistant", icon: "🤖", count: null }
  ];

  const toggleQuestion = (category, index) => {
    const key = `${category}-${index}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Removed 'Mark as Studied' feature and related progress tracking

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
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 fixed top-0 left-0 right-0 z-50">
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
      {activeTab === "chat" ? (
        // Full-screen chatbot
        <div className="fixed inset-0 pt-56 bg-white z-40 overflow-y-auto">
          <Chatbot />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8 pt-56">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Questions Tab */}
            {activeTab === "questions" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">AI-Prioritized Questions</h2>
              </div>
              {loadingQuestions ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing questions with AI algorithm...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                </div>
              ) : prioritized.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No prioritized questions available</h3>
                  <p className="text-gray-500">Try another subject or ensure dataset is loaded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prioritized.map((q, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white/60"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Number + Question + Meta */}
                        <div className="flex-1 pr-2">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                              {i + 1}
                            </div>
                            <p className="text-gray-900 font-semibold leading-snug">
                              {q.question}
                            </p>
                          </div>

                          {/* Meta grid */}
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">Years</span>
                              <span>{Array.isArray(q.years) && q.years.length > 0 ? q.years.join(', ') : (q.year || '—')}</span>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Topic</span>
                              <span>{q.topic || '—'}</span>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Marks</span>
                              <span>{typeof q.marks === 'number' ? `${q.marks}` : (q.marks || '—')}</span>
                            </div>
                            {typeof q.priority_percent === 'number' && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">Priority</span>
                                <span>{q.priority_percent}%</span>
                              </div>
                            )}
                            {q.pattern && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">Pattern</span>
                                <span>{q.pattern}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: AI Answer button */}
                        <div className="flex items-start">
                          <button
                            onClick={() => getAiAnswer('p', i)}
                            disabled={loadingAiAnswers[`p-${i}`]}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                              loadingAiAnswers[`p-${i}`]
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : aiAnswers[`p-${i}`]
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg'
                            }`}
                          >
                            {loadingAiAnswers[`p-${i}`] ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Getting AI Answer...</span>
                              </>
                            ) : aiAnswers[`p-${i}`] ? (
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
                        </div>
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
              </div>

              {loadingPapers ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading past papers...</p>
                  </div>
                </div>
              ) : pastPapers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No past papers available</h3>
                  <p className="text-gray-500">Try selecting a different study year or subject</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pastPapers.map((paper, i) => (
                    <div key={paper.id || i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.title}</h3>
                            <p className="text-gray-600 mb-3">{paper.description || "Previous year question paper"}</p>

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

                            {!!paper.sections?.length && (
                              <div className="flex flex-wrap gap-2">
                                {paper.sections.map((section, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                                    {section}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <a
                            href={paper.url || '#'}
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
              )}
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === "videos" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Video Lectures & Notes</h2>
              </div>

              {filteredVideos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No videos available</h3>
                  <p className="text-gray-500">Videos for this subject will be added soon.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredVideos.map((video, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
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
                              <path d="M8 5v14l11-7z" />
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
              )}
            </div>
          )}

          {/* Concepts Tab */}
          {activeTab === "concepts" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Concept Mastery Map</h2>
              </div>

              {(!concepts || concepts.length === 0) ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No concepts available</h3>
                  <p className="text-gray-500">Concepts are derived from questions. Try generating questions first.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {concepts.map((c, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </div>
                          <h4 className="text-gray-900 font-semibold">{c.name}</h4>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{c.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${c.percent >= 70 ? 'from-green-500 to-emerald-500' : c.percent >= 40 ? 'from-blue-500 to-cyan-500' : 'from-yellow-500 to-orange-500'}`}
                          style={{ width: `${c.percent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Based on distribution of topics in AI-generated questions</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          </div>
        </div>
      )}
    </div>
  );
}
