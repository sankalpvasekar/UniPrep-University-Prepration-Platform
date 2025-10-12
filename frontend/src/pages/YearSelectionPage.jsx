import React, { useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function YearSelectionPage() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Read logged-in user from localStorage
  const { displayName, initials, username } = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const name =
        stored?.name ||
        (stored?.first_name && stored?.last_name
          ? `${stored.first_name} ${stored.last_name}`
          : null) ||
        stored?.username ||
        (stored?.email ? stored.email.split("@")[0] : "User");
      const uname = stored?.username || (stored?.email ? stored.email.split("@")[0] : "");
      const makeInitials = (n) => {
        if (!n) return "U";
        const parts = n.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      };
      return { displayName: name, initials: makeInitials(name), username: uname };
    } catch (_) {
      return { displayName: "User", initials: "U", username: "" };
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (_) {}
    navigate("/login");
  };

  const branchData = {
    cse: {
      name: "Computer Science Engineering",
      icon: "💻",
      color: "from-blue-500 to-cyan-500",
      description: "Algorithms, Data Structures, Software Engineering"
    },
    entc: {
      name: "Electronics and Telecommunication Engineering",
      icon: "📡",
      color: "from-purple-500 to-pink-500",
      description: "Circuit Design, Digital Systems, Communication"
    },
    mech: {
      name: "Mechanical Engineering",
      icon: "🔧",
      color: "from-green-500 to-teal-500",
      description: "Thermodynamics, Machine Design, Manufacturing"
    },
    civil: {
      name: "Civil Engineering",
      icon: "🏗️",
      color: "from-orange-500 to-red-500",
      description: "Structural Design, Construction, Transportation"
    },
    electrical: {
      name: "Electrical Engineering",
      icon: "⚡",
      color: "from-yellow-500 to-orange-500",
      description: "Power Systems, Control Systems, Electronics"
    },
  };

  const [years, setYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(true);
  const [yearsError, setYearsError] = useState("");

  // Fetch available years for branch from backend
  useEffect(() => {
    let cancelled = false;
    const fetchYears = async () => {
      try {
        setLoadingYears(true);
        const branchMap = { cse: 'cse', entc: 'entc', mech: 'mech', civil: 'civil', electrical: 'electrical' };
        const code = branchMap[branchId] || 'CSE';
        const res = await fetch(`http://localhost:8000/api/dataset/years/?branch=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (cancelled) return;
        const list = Array.isArray(data.years) ? data.years : [];
        // Map backend years to UI cards
        const toCard = (y) => {
          switch (y) {
            case 'FY':
              return { id: 'fy', name: 'First Year', description: 'Basic sciences and engineering fundamentals', icon: '📖', color: 'from-orange-500 to-red-500' };
            case 'SY':
              return { id: 'second', name: 'Second Year', description: 'Foundation subjects and core concepts', icon: '📚', color: 'from-blue-500 to-cyan-500' };
            case 'TY':
              return { id: 'third', name: 'Third Year', description: 'Advanced topics and specialization', icon: '🎓', color: 'from-purple-500 to-pink-500' };
            case 'Final Year':
              return { id: 'final', name: 'Final Year', description: 'Capstone projects and industry preparation', icon: '🚀', color: 'from-green-500 to-teal-500' };
            default:
              return null;
          }
        };
        const cards = list.map(toCard).filter(Boolean);
        // Fallback to static if backend returns empty
        if (cards.length === 0) {
          setYears([
            { id: 'fy', name: 'First Year', description: 'Basic sciences and engineering fundamentals', icon: '📖', color: 'from-orange-500 to-red-500' },
            { id: 'second', name: 'Second Year', description: 'Foundation subjects and core concepts', icon: '📚', color: 'from-blue-500 to-cyan-500' },
            { id: 'third', name: 'Third Year', description: 'Advanced topics and specialization', icon: '🎓', color: 'from-purple-500 to-pink-500' },
            { id: 'final', name: 'Final Year', description: 'Capstone projects and industry preparation', icon: '🚀', color: 'from-green-500 to-teal-500' },
          ]);
        } else {
          // Ensure consistent ordering: First -> Second -> Third -> Final
          const order = { fy: 1, second: 2, third: 3, final: 4 };
          const sorted = [...cards].sort((a, b) => (order[a.id] ?? 99) - (order[b.id] ?? 99));
          setYears(sorted);
        }
      } catch (e) {
        if (!cancelled) {
          setYearsError('Failed to load years');
          setYears([
            { id: 'fy', name: 'First Year', description: 'Basic sciences and engineering fundamentals', icon: '📖', color: 'from-orange-500 to-red-500' },
            { id: 'second', name: 'Second Year', description: 'Foundation subjects and core concepts', icon: '📚', color: 'from-blue-500 to-cyan-500' },
            { id: 'third', name: 'Third Year', description: 'Advanced topics and specialization', icon: '🎓', color: 'from-purple-500 to-pink-500' },
            { id: 'final', name: 'Final Year', description: 'Capstone projects and industry preparation', icon: '🚀', color: 'from-green-500 to-teal-500' },
          ]);
        }
      } finally {
        if (!cancelled) setLoadingYears(false);
      }
    };
    fetchYears();
    return () => { cancelled = true; };
  }, [branchId]);

  const currentBranch = branchData[branchId] || branchData.cse;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
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
            <div className="relative profile-menu-container">
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[60]">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-medium">{currentBranch.name}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Choose Year</span>
          </nav>
        </div>

        {/* Branch Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${currentBranch.color} mb-6 shadow-lg`}>
            <span className="text-4xl">{currentBranch.icon}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentBranch.name}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{currentBranch.description}</p>
        </div>

        {/* Year Selection */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Choose Your Academic Year</h2>
          <p className="text-gray-600 text-center">Select your year to access relevant subjects and materials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {(loadingYears ? [] : years).map((year) => (
            <Link
              key={year.id}
              to={`/branch/${branchId}/year/${year.id}/subjects`}
              className="group relative"
              onMouseEnter={() => setHoveredCard(year.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`
                relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 transform
                hover:scale-105 hover:shadow-2xl group-hover:shadow-2xl
                ${hoveredCard === year.id ? 'scale-105 shadow-2xl' : ''}
              `}>
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${year.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

                {/* Card Content */}
                <div className="relative p-8 text-center">
                  {/* Icon and Header */}
                  <div className="mb-6">
                    <div className={`
                      w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${year.color} 
                      flex items-center justify-center text-3xl shadow-lg
                      transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                    `}>
                      {year.icon}
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                      {year.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {year.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-xs font-medium text-gray-700 border border-gray-200">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="ml-1">5 subjects</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${year.color} opacity-0 group-hover:opacity-5
                    transition-opacity duration-300 rounded-2xl
                  `}></div>
                </div>

                {/* Bottom Border Animation */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${year.color}
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left
                `}></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Choose your academic year above to access subject materials, past papers, video lectures, and interactive chatbot assistance tailored to your level.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-500">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-xl">📚</span>
                </div>
                <div className="font-medium text-gray-700 mb-1">Subject Materials</div>
                <div>Comprehensive notes and resources</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-xl">🎥</span>
                </div>
                <div className="font-medium text-gray-700 mb-1">Video Lectures</div>
                <div>Interactive learning sessions</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-xl">🤖</span>
                </div>
                <div className="font-medium text-gray-700 mb-1">AI Assistant</div>
                <div>24/7 learning support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
