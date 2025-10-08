import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { branchesAPI, authAPI } from "../services/api";

export default function DashboardPage() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [branches, setBranches] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const branchesData = await branchesAPI.getAll();
      
      // Enrich branches with colors
      const enrichedBranches = branchesData.map((branch, index) => ({
        ...branch,
        color: getColorForBranch(index),
      }));
      
      setBranches(enrichedBranches);
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
      navigate('/login');
    }
  };

  const getColorForBranch = (index) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-yellow-500 to-orange-500",
    ];
    return colors[index % colors.length];
  };

  const recentActivity = [
    { id: 1, action: "Completed", subject: "Data Structures Quiz", time: "2 hours ago", type: "quiz", score: 85 },
    { id: 2, action: "Watched", subject: "Operating Systems Lecture", time: "1 day ago", type: "video", duration: "45 min" },
    { id: 3, action: "Downloaded", subject: "Database Management Notes", time: "2 days ago", type: "notes", size: "2.3 MB" },
    { id: 4, action: "Asked", subject: "AI Assistant about Algorithms", time: "3 days ago", type: "chat", helpful: true },
    { id: 5, action: "Started", subject: "Machine Learning Course", time: "4 days ago", type: "course", progress: 15 },
    { id: 6, action: "Bookmarked", subject: "System Design Interview Prep", time: "1 week ago", type: "bookmark" },
  ];

  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first quiz", icon: "🎯", earned: true, date: "2 days ago" },
    { id: 2, title: "Study Streak", description: "Study for 7 days in a row", icon: "🔥", earned: true, date: "1 day ago" },
    { id: 3, title: "Quiz Master", description: "Score 90%+ on 5 quizzes", icon: "🏆", earned: false, progress: 3 },
    { id: 4, title: "Night Owl", description: "Study after 10 PM", icon: "🦉", earned: true, date: "3 days ago" },
    { id: 5, title: "Speed Learner", description: "Complete 10 videos in one day", icon: "⚡", earned: false, progress: 6 },
    { id: 6, title: "AI Helper", description: "Ask 50 questions to AI", icon: "🤖", earned: false, progress: 23 },
  ];

  const notifications = [
    { id: 1, title: "New Assignment", message: "Data Structures Assignment 3 is now available", time: "1 hour ago", type: "assignment", unread: true },
    { id: 2, title: "Quiz Reminder", message: "Operating Systems Quiz closes in 2 hours", time: "3 hours ago", type: "quiz", unread: true },
    { id: 3, title: "Achievement Unlocked", message: "You earned the 'Study Streak' badge!", time: "1 day ago", type: "achievement", unread: false },
    { id: 4, title: "New Video", message: "Database Normalization lecture is now available", time: "2 days ago", type: "video", unread: false },
  ];

  const studyStreak = 7;
  const totalStudyHours = 24;
  const completedCourses = 3;
  const totalCourses = 8;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">UniPrep</h1>
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">JD</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Computer Science</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">john.doe@example.com</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Taskbar Navigation */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 py-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <span>Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'activity'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Recent Activity</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'progress'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Your Progress</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'achievements'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>Achievements</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'notifications'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5a2.5 2.5 0 01-2.5-2.5V6a2.5 2.5 0 012.5-2.5h15a2.5 2.5 0 012.5 2.5v11a2.5 2.5 0 01-2.5 2.5h-15z" />
                </svg>
                <span>Notifications</span>
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h2>
              <p className="text-gray-600">Ready to continue your learning journey?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Quick Stats Cards */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{completedCourses}/{totalCourses}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Courses Completed</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: `${(completedCourses/totalCourses)*100}%`}}></div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{totalStudyHours}h</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Study Hours</h3>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔥</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{studyStreak}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Day Streak</h3>
                <p className="text-xs text-gray-500 mt-1">Keep it up!</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">85%</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
                <p className="text-xs text-gray-500 mt-1">Last 10 quizzes</p>
              </div>
            </div>

            {/* Branches Section */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Branch</h3>
              <p className="text-gray-600">Select your field of study to access subjects and materials</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {branches.map((branch) => (
                <Link
                  key={branch.id}
                  to={`/branch/${branch.id}/subjects`}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${branch.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`
                        w-12 h-12 rounded-xl bg-gradient-to-br ${branch.color} 
                        flex items-center justify-center text-2xl shadow-lg
                        transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                      `}>
                        {branch.icon}
                      </div>
                      <div className={`
                        w-6 h-6 rounded-full bg-gradient-to-br ${branch.color} 
                        flex items-center justify-center opacity-0 group-hover:opacity-100
                        transition-all duration-300 transform translate-x-2 group-hover:translate-x-0
                      `}>
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                        {branch.name}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                        {branch.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{branch.subject_count || 0} subjects</span>
                      </div>
                    </div>

                    <div className={`
                      absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${branch.color}
                      transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left
                    `}></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Recent Activity</h2>
              <p className="text-gray-600">Track your learning progress and activities</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="space-y-6">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {activity.type === 'quiz' && <span className="text-xl">📝</span>}
                      {activity.type === 'video' && <span className="text-xl">🎥</span>}
                      {activity.type === 'notes' && <span className="text-xl">📄</span>}
                      {activity.type === 'chat' && <span className="text-xl">💬</span>}
                      {activity.type === 'course' && <span className="text-xl">📚</span>}
                      {activity.type === 'bookmark' && <span className="text-xl">🔖</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {activity.action} {activity.subject}
                        </h3>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {activity.score && <span>Score: {activity.score}%</span>}
                        {activity.duration && <span>Duration: {activity.duration}</span>}
                        {activity.size && <span>Size: {activity.size}</span>}
                        {activity.helpful && <span className="text-green-600">✓ Helpful</span>}
                        {activity.progress && <span>Progress: {activity.progress}%</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h2>
              <p className="text-gray-600">Detailed analytics of your learning journey</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Statistics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Courses Completed</span>
                      <span className="font-medium">{completedCourses}/{totalCourses}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{width: `${(completedCourses/totalCourses)*100}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Study Hours This Month</span>
                      <span className="font-medium">{totalStudyHours}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Quiz Average Score</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Current Study Streak</span>
                      <span className="font-medium">{studyStreak} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{width: '70%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Activity</h3>
                <div className="space-y-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 w-8">{day}</span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                            style={{width: `${Math.random() * 100}%`}}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">{Math.floor(Math.random() * 8)}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h2>
              <p className="text-gray-600">Unlock badges and track your accomplishments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 transition-all duration-300 ${
                  achievement.earned ? 'ring-2 ring-yellow-400 ring-opacity-50' : 'opacity-75'
                }`}>
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl ${
                      achievement.earned ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-200'
                    }`}>
                      {achievement.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                    {achievement.earned ? (
                      <div className="text-sm text-green-600 font-medium">
                        ✓ Earned {achievement.date}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Progress: {achievement.progress}/5
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h2>
              <p className="text-gray-600">Stay updated with your learning activities</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-6 border-b border-gray-100 last:border-b-0 ${notification.unread ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <span className="text-sm text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          notification.type === 'assignment' ? 'bg-blue-100 text-blue-700' :
                          notification.type === 'quiz' ? 'bg-green-100 text-green-700' :
                          notification.type === 'achievement' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {notification.type}
                        </span>
                        {notification.unread && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
