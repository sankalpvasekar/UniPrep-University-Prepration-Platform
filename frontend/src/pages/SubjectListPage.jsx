import React, { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function SubjectListPage() {
  const { branchId, yearId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Navbar user info
  const { displayName, initials } = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const name =
        stored?.name ||
        (stored?.first_name && stored?.last_name
          ? `${stored.first_name} ${stored.last_name}`
          : null) ||
        stored?.username ||
        (stored?.email ? stored.email.split("@")[0] : "User");
      const makeInitials = (n) => {
        if (!n) return "U";
        const parts = n.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      };
      return { displayName: name, initials: makeInitials(name) };
    } catch (_) {
      return { displayName: "User", initials: "U" };
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (_) {}
    navigate("/login");
  };

  // Branch metadata (restored)
  const branchData = {
    cse: { name: "Computer Science Engineering", icon: "💻", color: "from-blue-500 to-cyan-500" },
    entc: { name: "Electronics and Telecommunication Engineering", icon: "📡", color: "from-purple-500 to-pink-500" },
    mech: { name: "Mechanical Engineering", icon: "🔧", color: "from-green-500 to-teal-500" },
    civil: { name: "Civil Engineering", icon: "🏗️", color: "from-orange-500 to-red-500" },
    electrical: { name: "Electrical Engineering", icon: "⚡", color: "from-yellow-500 to-orange-500" },
  };

  const yearData = {
    second: { name: "Second Year", icon: "📚" },
    third: { name: "Third Year", icon: "🎓" },
    final: { name: "Final Year", icon: "🚀" },
    fy: { name: "First Year", icon: "📖" },
    sy: { name: "Second Year", icon: "📚" },
    ty: { name: "Third Year", icon: "🎓" },
  };

  const currentBranch = branchData[branchId] || branchData.cse;
  const currentYear = yearData[yearId] || yearData.second;

  // Fetch 5 subjects from dataset
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const branchMap = {
          'cse': 'cse',
          'entc': 'entc',
          'mech': 'mech',
          'civil': 'civil',
          'electrical': 'electrical'
        };
        
        const yearMap = {
          'second': 'SY',
          'third': 'TY',
          'final': 'Final Year',
          'fy': 'FY',
          'sy': 'SY',
          'ty': 'TY'
        };

        const branch = branchMap[branchId] || 'CSE';
        const year = yearMap[yearId] || 'FY';

        const response = await fetch(`http://localhost:8000/api/dataset/subjects/?branch=${branch}&year=${year}`);
        const data = await response.json();

        if (data.subjects && data.subjects.length > 0) {
          // Use full subject list and ensure a credits field for display
          const enrichedSubjects = data.subjects.map((subject, idx) => ({
            ...subject,
            credits: subject.credits ?? [3, 4, 3, 4, 3][idx % 5],
          }));
          setSubjects(enrichedSubjects);
        } else {
          // Fallback to hardcoded subjects if dataset is empty
          setSubjects([
            { 
              id: "ds", 
              name: "Data Structures", 
              description: "Arrays, Linked Lists, Trees, Graphs, and Algorithms",
              credits: 4,
              icon: "🌳",
              color: "from-blue-500 to-cyan-500",
              
            },
            { 
              id: "os", 
              name: "Operating Systems", 
              description: "Process Management, Memory Management, File Systems",
              credits: 3,
              icon: "⚙️",
              color: "from-purple-500 to-pink-500",
              
            },
            { 
              id: "dbms", 
              name: "Database Management Systems", 
              description: "SQL, Normalization, Transactions, Query Optimization",
              credits: 4,
              icon: "🗄️",
              color: "from-green-500 to-teal-500",
              
            },
            { 
              id: "cn", 
              name: "Computer Networks", 
              description: "OSI Model, TCP/IP, Routing, Network Security",
              credits: 3,
              icon: "🌐",
              color: "from-orange-500 to-red-500",
              
            },
            { 
              id: "algo", 
              name: "Algorithm Design", 
              description: "Sorting, Searching, Dynamic Programming, Greedy Algorithms",
              credits: 4,
              icon: "🧮",
              color: "from-pink-500 to-purple-500",
              
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        // Fallback subjects on error
        setSubjects([
          { 
            id: "ds", 
            name: "Data Structures", 
            description: "Arrays, Linked Lists, Trees, Graphs, and Algorithms",
            credits: 4,
            icon: "🌳",
            color: "from-blue-500 to-cyan-500",
            
          },
          { 
            id: "os", 
            name: "Operating Systems", 
            description: "Process Management, Memory Management, File Systems",
            credits: 3,
            icon: "⚙️",
            color: "from-purple-500 to-pink-500",
            
          },
          { 
            id: "dbms", 
            name: "Database Management Systems", 
            description: "SQL, Normalization, Transactions, Query Optimization",
            credits: 4,
            icon: "🗄️",
            color: "from-green-500 to-teal-500",
            
          },
          { 
            id: "cn", 
            name: "Computer Networks", 
            description: "OSI Model, TCP/IP, Routing, Network Security",
            credits: 3,
            icon: "🌐",
            color: "from-orange-500 to-red-500",
            
          },
          { 
            id: "algo", 
            name: "Algorithm Design", 
            description: "Sorting, Searching, Dynamic Programming, Greedy Algorithms",
            credits: 4,
            icon: "🧮",
            color: "from-pink-500 to-purple-500",
            
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [branchId, yearId]);

  const filteredAndSortedSubjects = useMemo(() => {
    let filtered = subjects.filter(subject => {
      const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          subject.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "credits":
          return b.credits - a.credits;
        default:
          return 0;
      }
    });
  }, [subjects, searchTerm, sortBy]);

  // Year label for card badge
  const yearShortMap = { fy: 'FY', sy: 'SY', ty: 'TY', second: 'SY', third: 'TY', final: 'Final Year' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Fixed Header Container */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
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

              {/* User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{initials}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{displayName}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{displayName}</p>
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
      </div>

      {/* Page Header */}
      <div className="bg-white pt-36">
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

          {/* Search and Sort */}
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
              <option value="credits">Sort by Credits</option>
            </select>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading subjects from dataset...</p>
            </div>
          </div>
        ) : (
          <>
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
              to={`/subject/${subject.id}?year=${encodeURIComponent((() => {
                const map = { 'second': 'SY', 'third': 'TY', 'final': 'Final Year', 'fy': 'FY', 'sy': 'SY', 'ty': 'TY' };
                return map[yearId] || 'FY';
              })())}`}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100"
            >
              {/* Base faint gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-5 pointer-events-none`}></div>
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
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-700 bg-gray-100">
                      {yearShortMap[yearId] || 'FY'}
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

                {/* Hover Effect Overlay (slightly stronger on hover) */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10
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
          </>
        )}
      </div>
    </div>
  );
}
