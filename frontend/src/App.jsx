import { useState } from "react";
import { Upload, BrainCircuit, BookOpen, Network, Sparkles } from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const [data, setData] = useState({
    topics: [],
    flashcards: [],
    mindmap: {},
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analyze-notes",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      const parsed = result.analysis || result;

      setData({
        topics: parsed.topics || [],
        flashcards: parsed.flashcards || [],
        mindmap: parsed.mindmap || {},
      });
    } catch (error) {
      console.error(error);
      alert("Failed to analyze notes");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/20 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-zinc-300">
                AI Powered Learning Engine
              </span>
            </div>

            <h1 className="text-6xl font-black leading-tight tracking-tight">
              Turn Notes Into
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Visual Intelligence
              </span>
            </h1>

            <p className="text-zinc-400 text-lg mt-6 leading-relaxed max-w-2xl">
              Upload PDFs, handwritten notes, research papers, or study
              material. The AI extracts concepts, generates flashcards,
              organizes topics, and builds mind maps automatically.
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="text-cyan-400" />
              <h2 className="text-2xl font-bold">Upload Notes</h2>
            </div>

            <label className="border-2 border-dashed border-zinc-700 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-all bg-zinc-900/60">
              <Upload className="w-12 h-12 text-cyan-400 mb-4" />

              <p className="text-lg font-semibold text-center">
                Drop PDF or Click to Upload
              </p>

              <p className="text-sm text-zinc-500 mt-2 text-center">
                Supports notes, books, research papers & study material
              </p>

              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleUpload}
              />
            </label>

            {fileName && (
              <div className="mt-5 bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                <p className="text-zinc-400 text-sm">Uploaded File</p>
                <p className="font-medium mt-1 truncate">{fileName}</p>
              </div>
            )}

            {loading && (
              <div className="mt-6 flex items-center gap-3 text-cyan-300">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                AI is analyzing your document...
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Topics */}
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 shadow-xl hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-cyan-400" />
              <h2 className="text-2xl font-bold">Topics</h2>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {data.topics.length > 0 ? (
                data.topics.map((topic, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900 border border-zinc-800 hover:border-cyan-400 transition-all rounded-2xl px-5 py-4"
                  >
                    {topic}
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 text-center py-20">
                  Upload notes to generate topics
                </div>
              )}
            </div>
          </div>

          {/* Flashcards */}
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <BrainCircuit className="text-fuchsia-400" />
              <h2 className="text-2xl font-bold">Flashcards</h2>
            </div>

            <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
              {data.flashcards.length > 0 ? (
                data.flashcards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-6 hover:border-fuchsia-500 transition-all"
                  >
                    <p className="text-xs uppercase tracking-widest text-fuchsia-400 mb-2">
                      Question
                    </p>

                    <h3 className="font-semibold text-lg mb-5 leading-relaxed">
                      {card.question}
                    </h3>

                    <p className="text-xs uppercase tracking-widest text-cyan-400 mb-2">
                      Answer
                    </p>

                    <p className="text-zinc-300 leading-relaxed">
                      {card.answer}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 text-center py-20">
                  Flashcards will appear here
                </div>
              )}
            </div>
          </div>

          {/* Mind Map */}
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Network className="text-emerald-400" />
              <h2 className="text-2xl font-bold">Mind Map</h2>
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {Object.keys(data.mindmap).length > 0 ? (
                Object.entries(data.mindmap).map(
                  ([parent, children], index) => (
                    <div
                      key={index}
                      className="bg-zinc-900 rounded-3xl border border-zinc-800 p-5"
                    >
                      <h3 className="text-xl font-bold text-emerald-300 mb-4">
                        {parent}
                      </h3>

                      <div className="flex flex-wrap gap-3">
                        {Object.entries(children).map(
                          ([subTopic, points], idx) => (
                            <div
                              key={idx}
                              className="bg-zinc-800 rounded-2xl p-4 border border-zinc-700"
                            >
                              <p className="font-semibold mb-2 text-cyan-300">
                                {subTopic}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {points.map((point, i) => (
                                  <span
                                    key={i}
                                    className="bg-zinc-700 px-3 py-1 rounded-full text-sm"
                                  >
                                    {point}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-zinc-500 text-center py-20">
                  Mind map visualization appears here
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-zinc-800 rounded-[2rem] p-8 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Your Notes Are Now Searchable Intelligence 🧠
              </h2>

              <p className="text-zinc-400 max-w-3xl">
                This system transforms raw documents into structured learning
                experiences using OCR, semantic search, chunk processing, and
                AI-powered reasoning.
              </p>
            </div>

            <button className="bg-white text-black px-7 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl whitespace-nowrap">
              Explore AI Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}