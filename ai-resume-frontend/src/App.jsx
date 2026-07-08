import { useState } from 'react';

export default function App() {
  // 1.Manage state variables for tracking data changes over time
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // 2.Handle when the user selects a PDF file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 3.Trigger the analysis request to your local Python FastAPI server
  const runAnalysis = async () => {
    if (!jobDescription || !file) {
      alert("Please paste a job description and select your PDF resume.");
      return;
    }

    setLoading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Server processing error");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4.Compute dynamic styling themes for the score badge mapping
  const getScoreBadgeClass = (score) => {
    if (score >= 75) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      {/* Top Navigation / Header Panel */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">ScanAI <span className="text-gray-500 text-base font-normal">| Resume Analyzer</span></h1>
        </div>
      </header>

      {/* Main Container Layout Grid */}
      <main className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Card Area: Inputs and Controls */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Resume (PDF only)</label>
            <input 
              type="file" 
              accept=".pdf" 
              onClick={(e) => { e.target.value = '' }} 
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button 
            onClick={runAnalysis}
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition ${loading ? 'opacity-50' : ''}`}
          >
            Analyze Assets
          </button>
          
          {loading && (
            <div className="text-center text-indigo-600 font-medium animate-pulse">
              Processing file and analyzing content...
            </div>
          )}
        </section>

        {/* Right Card Area: Live Dashboard Report (Renders dynamically when results exist) */}
        {results && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-semibold">ATS Fit Assessment</h2>
              <div className={`text-3xl font-extrabold px-4 py-2 rounded-lg border ${getScoreBadgeClass(results.match_score)}`}>
                {results.match_score}%
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Executive Overview</h3>
              <p className="text-gray-600 leading-relaxed">{results.summary}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Missing Key Keywords</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {results.missing_keywords.map((kw, i) => (
                  <span key={i} className="bg-rose-50 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-rose-200 shadow-sm">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Identified Strengths</h3>
              <ul className="text-gray-600 space-y-1">
                {results.strong_points.map((item, i) => (
                  <li key={i} className="flex items-start text-gray-700 py-1">
                    <span className="text-emerald-500 mr-2 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Actionable Fixes</h3>
              <ul className="text-gray-600 space-y-1">
                {results.formatting_tips.map((item, i) => (
                  <li key={i} className="pl-3 border-l-4 border-indigo-500 text-gray-700 my-2 bg-indigo-50/30 py-1 rounded-r">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}