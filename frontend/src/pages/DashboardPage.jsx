import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function DashboardPage() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // Read logged-in user from localStorage
  const { user, displayName, initials, email, username } = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      // Prefer profile name (first + last), then explicit name, then email local-part. Avoid username for display.
      const name =
        (stored?.first_name || stored?.last_name
          ? `${stored?.first_name || ""} ${stored?.last_name || ""}`.trim()
          : null) ||
        stored?.name ||
        (stored?.email ? stored.email.split("@")[0] : "User");
      const uname = stored?.username || (stored?.email ? stored.email.split("@")[0] : "");

      const makeInitials = (n) => {
        if (!n) return "U";
        const parts = n.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      };

      return {
        user: stored,
        displayName: name,
        initials: makeInitials(name),
        email: stored?.email || "",
        username: uname,
      };
    } catch (_) {
      return { user: {}, displayName: "User", initials: "U", email: "", username: "" };
    }
  }, []);

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchesError, setBranchesError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingBranches(true);
        setBranchesError("");
        console.log("Fetching branches from API...");
        
        // Add timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const res = await fetch("http://localhost:8000/api/dataset/branches/", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log("Response status:", res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Branches data received:", data);
        if (!cancelled) {
          const branchesArray = Array.isArray(data.branches) ? data.branches : [];
          console.log("Setting branches:", branchesArray);
          setBranches(branchesArray);
          if (branchesArray.length === 0) {
            setBranchesError("No branches available in the dataset");
          }
        }
      } catch (e) {
        console.error("Error loading branches:", e);
        if (!cancelled) {
          if (e.name === 'AbortError') {
            setBranchesError("Request timed out. Please check if the backend server is running.");
          } else {
            setBranchesError("Failed to load branches: " + e.message);
          }
        }
      } finally {
        if (!cancelled) setLoadingBranches(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);


  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (_) { }
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 pt-28">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back, {displayName}!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Ready to continue your engineering journey? Choose your branch below to explore subjects, materials, and interactive learning resources.
          </p>
        </div>

        {/* Branches Section */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Engineering Branch</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="max-w-6xl mx-auto">
            {loadingBranches && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading branches...</p>
              </div>
            )}
            
            {!loadingBranches && branchesError && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium">{branchesError}</p>
                <p className="text-gray-500 mt-2 text-sm">Please make sure the backend server is running and the dataset is loaded.</p>
              </div>
            )}
            
            {!loadingBranches && !branchesError && branches.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-yellow-600 font-medium">No branches available</p>
                <p className="text-gray-500 mt-2 text-sm">The dataset appears to be empty. Please check your data files.</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {!loadingBranches && branches.map((branch) => (
                <Link
                  key={branch.id}
                  to={`/branch/${branch.id}/year-selection`}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${branch.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>

                  <div className="relative p-6 flex flex-col h-full min-h-[260px]">
                    {/* Header with Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`
                        w-14 h-14 rounded-2xl bg-gradient-to-br ${branch.color}
                        flex items-center justify-center text-2xl shadow-lg
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

                    {/* Content */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors leading-tight">
                        {branch.name}
                      </h3>
                      {branch.description && (
                        <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                          {branch.description}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mt-auto pt-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-xs font-medium text-gray-700 border border-gray-200">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-8H3v8a2 2 0 002 2z" />
                        </svg>
                        <span className="ml-1">4 years</span>
                      </div>
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
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-20 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Engineering Journey</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Each branch offers comprehensive study materials, interactive resources, and AI-powered assistance to help you excel in your engineering studies.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-500">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="font-medium text-gray-700 mb-1">Comprehensive Materials</div>
                <div>Subject notes, past papers, and video lectures</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="font-medium text-gray-700 mb-1">AI-Powered Learning</div>
                <div>Smart assistance and personalized guidance</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="font-medium text-gray-700 mb-1">Interactive Experience</div>
                <div>Engaging quizzes and study resources</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
