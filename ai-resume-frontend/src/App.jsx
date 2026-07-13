import { useState } from 'react'

function App() {
  // --- State Management Hooks ---
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Helper Layout functions ---
  const getScoreBadgeClass = (score) => {
    if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (score >= 50) return "border-amber-200 bg-amber-50 text-amber-700";
    return "border-rose-200 bg-rose-50 text-rose-700";
  };

  // --- Core Async Analysis Handler ---
  const runAnalysis = async () => {
    if (!file || !jobDescription.trim()) {
      alert("Please upload a resume PDF file and provide a job description.");
      return;
    }

    // 1. Instantly trigger the loading animation screen and clear old results
    setIsLoading(true);
    setResults(null); 

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_description", jobDescription);

      // 2. Fire the multi-part request out to your FastAPI server backend
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process your file backend analysis request.");
      }

      const data = await response.json();
      setResults(data); // Feed the output directly to your layout cards
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      // 3. Cleanly turn off the loading animation window whether it succeeds or crashes
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Navbar Banner Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold text-lg tracking-wider">
              AI
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">
              Resume & ATS Analyzer
            </h1>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
            v1.0 Local Build
          </span>
        </div>
      </header>

      {/* Main Multi-Column Dashboard Workspace Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column Input Panel Form Area */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Upload Work Materials</h2>
            <p className="text-xs text-slate-400">Provide your system files to parse match alignments instantly.</p>
          </div>

          {/* File Selector Block Section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Your Resume (PDF Format)</label>
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 text-sm text-slate-500 border border-gray-200 rounded-md p-2 w-full cursor-pointer focus:outline-none"
            />
          </div>

          {/* Target Text Description Field Box Block */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Target Job Description</label>
            <textarea 
              rows="8"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the expectations, tasks, or role qualifications here to run deep learning keyword alignments..."
              className="p-3 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none placeholder-slate-400"
            />
          </div>

          {/* Action Trigger Button Submit Block */}
          <button 
            onClick={runAnalysis}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md font-semibold text-sm transition-colors text-white shadow-sm ${
              isLoading 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
            }`}
          >
            {isLoading ? 'Processing Pipeline...' : 'Run Analysis Process'}
          </button>
        </section>

        {/* Right Column Segment Area Window Space */}
        <div className="h-full flex flex-col justify-start">
          
          {/* 1. Loading Overlay State View (Renders above line 101 dynamically while fetching) */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 my-4 space-y-4 animate-fade-in">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center space-y-1">
                <p className="text-indigo-600 font-semibold animate-pulse">AI is parsing your resume...</p>
                <p className="text-xs text-gray-500">Evaluating layout structure and matching target keywords against the ATS algorithm.</p>
              </div>
            </div>
          )}

          {/* 2. Empty Layout Default Placeholder Initial State Warning View */}
          {!results && !isLoading && (
            <div className="h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
              <svg className="w-8 h-8 stroke-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17H15M9 13H15M9 9H11M19 10.5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H13.5L19 10.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="font-medium text-sm">Dashboard report details are empty.</p>
              <p className="text-xs max-w-xs">Upload your resume dataset and click the analysis action trigger to receive real-time Gemini processing updates.</p>
            </div>
          )}

          {/* 3. Live Dashboard Report Data Area Card (Renders dynamically when results exist and finished loading) */}
          {results && !isLoading && (
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">ATS Fit Assessment</h2>
                <div className={`text-3xl font-extrabold px-4 py-2 rounded-lg border ${getScoreBadgeClass(results.match_score)}`}>
                  {results.match_score}%
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Executive Overview</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{results.summary}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Missing Key Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {results.missing_keywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className="bg-rose-50 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-rose-100 shadow-xs"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;