import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { branchesAPI } from "../services/api";

export default function BranchPage() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const data = await branchesAPI.getAll();
      setBranches(data);
    } catch (err) {
      setError("Failed to load branches");
      console.error(err);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Choose Your Branch</h1>
                <p className="text-gray-600 mt-1">Select your field of study to get started</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back!</p>
                <p className="font-medium text-gray-900">Student</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">S</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {branches.map((branch, index) => (
            <Link
              key={branch.id}
              to={`/branch/${branch.id}/subjects`}
              className="group relative"
              onMouseEnter={() => setHoveredCard(branch.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`
                relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 transform
                hover:scale-105 hover:shadow-2xl group-hover:shadow-2xl
                ${hoveredCard === branch.id ? 'scale-105 shadow-2xl' : ''}
              `}>
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${branch.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Card Content */}
                <div className="relative p-8">
                  {/* Icon and Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`
                      w-16 h-16 rounded-2xl bg-gradient-to-br ${branch.color} 
                      flex items-center justify-center text-3xl shadow-lg
                      transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                    `}>
                      {branch.icon}
                    </div>
                    <div className={`
                      w-8 h-8 rounded-full bg-gradient-to-br ${branch.color} 
                      flex items-center justify-center opacity-0 group-hover:opacity-100
                      transition-all duration-300 transform translate-x-2 group-hover:translate-x-0
                    `}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                      {branch.name}
                    </h2>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {branch.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{branch.stats.subjects} subjects</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span>{branch.stats.students} students</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${branch.color} opacity-0 group-hover:opacity-5
                    transition-opacity duration-300 rounded-2xl
                  `}></div>
                </div>

                {/* Bottom Border Animation */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${branch.color}
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left
                `}></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Choose your branch above to access subject materials, past papers, video lectures, and interactive chatbot assistance.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Interactive Learning
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Past Papers & Solutions
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI-Powered Chatbot
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
