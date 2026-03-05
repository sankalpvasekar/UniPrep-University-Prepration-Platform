import React, { useState, useRef } from 'react';

// --- Global Configuration ---
const MODEL_NAME = "llama-3.1-8b-instant";
const apiKey = import.meta.env.VITE_GROQ_API_KEY;
const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

// Feature definitions
const FEATURES = [
  { id: 'mindmap', name: 'Create Mind Map', icon: '🧠', color: 'from-purple-500 to-pink-500' },
  { id: 'summarization', name: 'Summarization', icon: '📊', color: 'from-blue-500 to-cyan-500' },
  { id: 'question', name: 'Question Analysis', icon: '❓', color: 'from-green-500 to-emerald-500' },
  { id: 'tchart', name: 'T-Chart', icon: '📋', color: 'from-yellow-500 to-orange-500' },
  { id: 'quiz', name: 'Quiz Creation', icon: '🎯', color: 'from-red-500 to-pink-500' },
  { id: 'studyplan', name: 'Study Plan', icon: '📅', color: 'from-indigo-500 to-purple-500' },
  { id: 'flashcard', name: 'Flashcard Generation', icon: '🃏', color: 'from-teal-500 to-green-500' }
];

// --- Helper Functions ---
const createMindMapPrompt = (topic) => {
  return `Create a comprehensive mind map about "${topic}" for engineering students. 
  Format the response as a hierarchical structure with clear parent-child relationships.
  Use markdown formatting with indentation to show hierarchy.
  Include key concepts, subtopics, and important details.
  Start with the main topic and branch out to related concepts.`;
};

const createSummarizationPrompt = (text) => {
  return `Summarize the following text for engineering students in a clear and concise way:
  
  "${text}"
  
  Provide:
  1. A brief summary (2-3 sentences)
  2. Key points (bullet points)
  3. Important concepts to remember`;
};

const createQuestionAnalysisPrompt = (question) => {
  return `Analyze this engineering question: "${question}"
  
  Provide:
  1. Question type and difficulty level
  2. Key concepts being tested
  3. Step-by-step solution approach
  4. Common mistakes to avoid
  5. Related topics to study`;
};

const createTChartPrompt = (topic1, topic2) => {
  return `Create a detailed T-chart comparing "${topic1}" and "${topic2}" for engineering students.
  
  Format as:
  | ${topic1} | ${topic2} |
  |-----------|-----------|
  | [Point 1] | [Point 1] |
  | [Point 2] | [Point 2] |
  
  Include at least 5-6 comparison points covering:
  - Definition/Concept
  - Applications
  - Advantages
  - Disadvantages
  - Key properties
  - Use cases`;
};

const createQuizPrompt = (topic, numQuestions = 5) => {
  return `Create ${numQuestions} multiple-choice questions about "${topic}" for engineering students.
  
  Format each question as:
  Q[Number]. [Question text]
  A) [Option A]
  B) [Option B]
  C) [Option C]
  D) [Option D]
  
  Correct Answer: [Letter]
  
  Make questions challenging but fair. Include a mix of conceptual and practical questions.
  After all questions, provide an answer key.`;
};

const createStudyPlanPrompt = (subject, duration, topics) => {
  return `Create a detailed study plan for "${subject}" over ${duration} days.
  
  Topics to cover: ${topics}
  
  Provide:
  1. Daily breakdown with specific topics
  2. Study time allocation per topic
  3. Practice problems/recommendations
  4. Review sessions
  5. Milestones and checkpoints
  
  Format as a day-by-day schedule with clear objectives.`;
};

const createFlashcardPrompt = (topic) => {
  return `Create 10 flashcards for studying "${topic}" in engineering.
  
  Format each flashcard as:
  Front: [Question/Term]
  Back: [Answer/Definition]
  
  Include a mix of:
  - Key definitions
  - Important formulas
  - Concept explanations
  - Problem-solving steps
  - Common applications`;
};

// --- API Call Function ---
const callGroqAPI = async (prompt, feature) => {
  if (!apiKey) {
    throw new Error('API key is missing. Please set VITE_GROQ_API_KEY in your environment variables.');
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: `You are an expert engineering tutor and AI assistant. You specialize in ${feature.name} for engineering students. Provide clear, accurate, and educational responses.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
};

// --- Main Component ---
const ChatbotNew = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [input, setInput] = useState('');
  const [input2, setInput2] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const responseRef = useRef(null);

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
    setResponse('');
    setError('');
    setInput('');
    setInput2('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeature || !input.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      let prompt = '';
      
      switch (selectedFeature.id) {
        case 'mindmap':
          prompt = createMindMapPrompt(input);
          break;
        case 'summarization':
          prompt = createSummarizationPrompt(input);
          break;
        case 'question':
          prompt = createQuestionAnalysisPrompt(input);
          break;
        case 'tchart':
          if (!input2.trim()) {
            setError('Please enter both topics for comparison');
            setLoading(false);
            return;
          }
          prompt = createTChartPrompt(input, input2);
          break;
        case 'quiz':
          prompt = createQuizPrompt(input);
          break;
        case 'studyplan':
          if (!input2.trim()) {
            setError('Please specify duration and topics');
            setLoading(false);
            return;
          }
          prompt = createStudyPlanPrompt(input, input2, 'main topics');
          break;
        case 'flashcard':
          prompt = createFlashcardPrompt(input);
          break;
        default:
          throw new Error('Unknown feature selected');
      }

      const result = await callGroqAPI(prompt, selectedFeature);
      setResponse(result);
      
      // Add to history
      const historyItem = {
        feature: selectedFeature.name,
        input: selectedFeature.id === 'tchart' ? `${input} vs ${input2}` : input,
        response: result,
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 items
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Study Assistant</h1>
          <p className="text-gray-600">Choose a feature to enhance your learning experience</p>
        </header>

        {/* Feature Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleFeatureSelect(feature)}
              className={`p-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 ${
                selectedFeature?.id === feature.id
                  ? `bg-gradient-to-r ${feature.color} text-white shadow-xl`
                  : 'bg-white text-gray-800 hover:shadow-xl'
              }`}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <div className="font-semibold">{feature.name}</div>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {selectedFeature && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">{selectedFeature.icon}</span>
                {selectedFeature.name}
              </h2>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedFeature.id === 'tchart' ? 'First Topic' : 
                   selectedFeature.id === 'studyplan' ? 'Subject' :
                   selectedFeature.id === 'quiz' ? 'Quiz Topic' :
                   'Enter your topic/question'}
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    selectedFeature.id === 'mindmap' ? 'e.g., Thermodynamics' :
                    selectedFeature.id === 'summarization' ? 'Paste your text here...' :
                    selectedFeature.id === 'question' ? 'e.g., Explain Newton\'s Second Law' :
                    selectedFeature.id === 'tchart' ? 'e.g., AC vs DC' :
                    selectedFeature.id === 'quiz' ? 'e.g., JavaScript Fundamentals' :
                    selectedFeature.id === 'studyplan' ? 'e.g., Mathematics' :
                    selectedFeature.id === 'flashcard' ? 'e.g., Organic Chemistry' :
                    'Enter your topic...'
                  }
                  required
                />
              </div>

              {(selectedFeature.id === 'tchart' || selectedFeature.id === 'studyplan') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedFeature.id === 'tchart' ? 'Second Topic' : 'Duration & Topics'}
                  </label>
                  <input
                    type="text"
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      selectedFeature.id === 'tchart' ? 'e.g., DC' :
                      'e.g., 30 days - calculus, algebra, geometry'
                    }
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  loading || !input.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${selectedFeature.color} hover:shadow-lg transform hover:scale-105`
                }`}
              >
                {loading ? 'Processing...' : `Generate ${selectedFeature.name}`}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Response Display */}
            {response && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Result</h3>
                  <button
                    onClick={() => copyToClipboard(response)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div
                  ref={responseRef}
                  className="p-4 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto"
                >
                  {response}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Sidebar */}
        {history.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent History</h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.feature}</span>
                    <span className="text-xs text-gray-500">{item.timestamp}</span>
                  </div>
                  <div className="text-sm text-gray-600 truncate">{item.input}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotNew;
