import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function YearSelectionPage() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const branchData = {
    cse: { 
      name: "Computer Science Engineering", 
      icon: "💻",
      color: "from-blue-500 to-cyan-500",
      description: "Algorithms, Data Structures, Software Engineering"
    },
    ece: { 
      name: "Electronics and Telecommunication Engineering", 
      icon: "⚡",
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

  const years = [
    {
      id: "fy",
      name: "First Year",
      description: "Basic sciences and engineering fundamentals",
      icon: "📖",
      color: "from-orange-500 to-red-500",
      subjects: 6,
      difficulty: "Beginner"
    },
    {
      id: "second",
      name: "Second Year",
      description: "Foundation subjects and core concepts",
      icon: "📚",
      color: "from-blue-500 to-cyan-500",
      subjects: 8,
      difficulty: "Beginner to Intermediate"
    },
    {
      id: "third",
      name: "Third Year",
      description: "Advanced topics and specialization",
      icon: "🎓",
      color: "from-purple-500 to-pink-500",
      subjects: 10,
      difficulty: "Intermediate to Advanced"
    },
    {
      id: "final",
      name: "Final Year",
      description: "Capstone projects and industry preparation",
      icon: "🚀",
      color: "from-green-500 to-teal-500",
      subjects: 12,
      difficulty: "Advanced to Expert"
    }
  ];

  const currentBranch = branchData[branchId] || branchData.cse;

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

            {/* User Profile Menu */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
          {years.map((year) => (
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
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{year.subjects} subjects</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Difficulty:</span> {year.difficulty}
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
