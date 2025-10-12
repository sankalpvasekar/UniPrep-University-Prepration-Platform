import React, { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function SubjectListPage() {
  const { branchId, yearId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");

  const branchData = {
    cse: { name: "Computer Science Engineering", icon: "💻", color: "from-blue-500 to-cyan-500" },
    ece: { name: "Electronics and Telecommunication Engineering", icon: "⚡", color: "from-purple-500 to-pink-500" },
    mech: { name: "Mechanical Engineering", icon: "🔧", color: "from-green-500 to-teal-500" },
    civil: { name: "Civil Engineering", icon: "🏗️", color: "from-orange-500 to-red-500" },
    electrical: { name: "Electrical Engineering", icon: "⚡", color: "from-yellow-500 to-orange-500" },
  };

  const yearData = {
    second: { name: "Second Year", icon: "📚" },
    third: { name: "Third Year", icon: "🎓" },
    final: { name: "Final Year", icon: "🚀" },
  };

  const currentBranch = branchData[branchId] || branchData.cse;
  const currentYear = yearData[yearId] || yearData.second;

  const subjects = [
    { 
      id: "ds", 
      name: "Data Structures", 
      description: "Arrays, Linked Lists, Trees, Graphs, and Algorithms",
      difficulty: "medium",
      credits: 4,
      icon: "🌳",
      color: "from-blue-500 to-cyan-500",
      progress: 75,
      lastAccessed: "2 days ago"
    },
    { 
      id: "os", 
      name: "Operating Systems", 
      description: "Process Management, Memory Management, File Systems",
      difficulty: "hard",
      credits: 3,
      icon: "⚙️",
      color: "from-purple-500 to-pink-500",
      progress: 60,
      lastAccessed: "1 week ago"
    },
    { 
      id: "dbms", 
      name: "Database Management", 
      description: "SQL, Normalization, Transactions, and Query Optimization",
      difficulty: "medium",
      credits: 3,
      icon: "🗄️",
      color: "from-green-500 to-teal-500",
      progress: 90,
      lastAccessed: "3 days ago"
    },
    { 
      id: "algo", 
      name: "Algorithms", 
      description: "Sorting, Searching, Dynamic Programming, Greedy Algorithms",
      difficulty: "hard",
      credits: 4,
      icon: "🧮",
      color: "from-orange-500 to-red-500",
      progress: 45,
      lastAccessed: "5 days ago"
    },
    { 
      id: "networks", 
      name: "Computer Networks", 
      description: "TCP/IP, Routing, Security, and Network Protocols",
      difficulty: "medium",
      credits: 3,
      icon: "🌐",
      color: "from-indigo-500 to-purple-500",
      progress: 30,
      lastAccessed: "1 week ago"
    },
    { 
      id: "ai", 
      name: "Artificial Intelligence", 
      description: "Machine Learning, Neural Networks, and AI Applications",
      difficulty: "hard",
      credits: 4,
      icon: "🤖",
      color: "from-pink-500 to-rose-500",
      progress: 20,
      lastAccessed: "2 weeks ago"
    },
  ];

  const filteredAndSortedSubjects = useMemo(() => {
    let filtered = subjects.filter(subject => {
      const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          subject.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === "all" || subject.difficulty === filterBy;
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return b.progress - a.progress;
        case "difficulty":
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case "credits":
          return b.credits - a.credits;
        default:
          return 0;
      }
    });
  }, [subjects, searchTerm, sortBy, filterBy]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "hard": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "from-green-500 to-emerald-500";
    if (progress >= 60) return "from-blue-500 to-cyan-500";
    if (progress >= 40) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">UniPrep</h1>
            </Link>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back!</p>
                <p className="font-medium text-gray-900">John Doe</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Breadcrumb */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <button
              onClick={() => navigate(`/branch/${branchId}/year-selection`)}
              className="hover:text-gray-700 transition-colors"
            >
              {currentBranch.name}
            </button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-medium">{currentYear.name}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Subjects</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentBranch.color} flex items-center justify-center text-2xl shadow-lg`}>
                {currentBranch.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentBranch.name} - {currentYear.name}</h1>
                <p className="text-gray-600 mt-1">Explore and manage your course materials</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="credits">Sort by Credits</option>
            </select>

            {/* Filter Dropdown */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedSubjects.length} of {subjects.length} subjects
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedSubjects.map((subject) => (
            <Link
              key={subject.id}
              to={`/subject/${subject.id}`}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                <div 
                  className={`h-full bg-gradient-to-r ${getProgressColor(subject.progress)} transition-all duration-500`}
                  style={{ width: `${subject.progress}%` }}
                ></div>
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} 
                    flex items-center justify-center text-2xl shadow-lg
                    transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                  `}>
                    {subject.icon}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(subject.difficulty)}`}>
                      {subject.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{subject.credits} credits</span>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                    {subject.description}
                  </p>
                </div>

                {/* Progress and Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-900">{subject.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(subject.progress)} transition-all duration-500`}
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last accessed: {subject.lastAccessed}</span>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-5
                  transition-opacity duration-300 rounded-2xl
                `}></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedSubjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No subjects found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
