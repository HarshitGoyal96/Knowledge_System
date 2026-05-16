import { useState } from "react";
import {
  Upload,
  BrainCircuit,
  BookOpen,
  Network,
  Sparkles,
} from "lucide-react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";

import "reactflow/dist/style.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [fullMindmap, setFullMindmap] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeExplanation, setNodeExplanation] =
  useState("");

  const [data, setData] = useState({
    topics: [],
    flashcards: [],
    mindmap: {},
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFileName(file.name);
    setUploadedFile(file);
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

  const askQuestion = async () => {
    if (!uploadedFile || !question) return;

    const userMessage = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentQuestion = question;

    setQuestion("");

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/chat-pdf?query=${currentQuestion}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      const aiMessage = {
        role: "assistant",
        content: result.answer,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    }
  };


const createMindMapNodes = () => {

  const nodes = [];
  const edges = [];

  let parentIndex = 0;

  Object.entries(data.mindmap).forEach(
    ([parent, children]) => {

      const parentId = `parent-${parentIndex}`;

      // MAIN TOPIC NODE

      nodes.push({
        id: parentId,
        data: {
          label: parent,
        },
        position: {
          x: 700,
          y: parentIndex * 700,
        },
        style: {
          background: "#06b6d4",
          color: "black",
          border: "none",
          padding: 18,
          borderRadius: 18,
          fontWeight: "bold",
          fontSize: 18,
          minWidth: 220,
          textAlign: "center",
          boxShadow: "0 0 25px rgba(6,182,212,0.35)",
        },
      });

      let childIndex = 0;

      Object.entries(children).forEach(
        ([subTopic, points]) => {

          const childId = `${parentId}-${childIndex}`;

          // SUBTOPIC NODE

          nodes.push({
            id: childId,
            data: {
              label: subTopic,
            },
            position: {
              x: 250 + childIndex * 450,
              y: parentIndex * 700 + 220,
            },
            style: {
              background: "#18181b",
              color: "white",
              border: "1px solid #3f3f46",
              padding: 14,
              borderRadius: 16,
              minWidth: 200,
              textAlign: "center",
              boxShadow: "0 0 18px rgba(168,85,247,0.18)",
            },
          });

          // EDGE: PARENT -> CHILD

          edges.push({
            id: `edge-${parentId}-${childId}`,
            source: parentId,
            target: childId,
            animated: true,
            style: {
              stroke: "#06b6d4",
              strokeWidth: 2,
            },
          });

          points.forEach((point, pointIndex) => {

            const pointId =
              `${childId}-${pointIndex}`;

            // CONCEPT POINT NODE

            nodes.push({
              id: pointId,
              data: {
                label: point,
              },
              position: {
                        x:
                          120 +
                          childIndex * 500 +
                          pointIndex * 220,

                        y:
                          parentIndex * 700 +
                          420,
                      },
              style: {
                background: "#27272a",
                color: "#d4d4d8",
                border: "1px solid #3f3f46",
                padding: 10,
                borderRadius: 14,
                fontSize: 13,
                minWidth: 180,
                textAlign: "center",
              },
            });

            // EDGE: CHILD -> POINT

            edges.push({
              id: `edge-${childId}-${pointId}`,
              source: childId,
              target: pointId,
              animated: true,
              style: {
                stroke: "#a855f7",
                strokeWidth: 2,
              },
            });

          });

          childIndex++;

        }
      );

      parentIndex++;

    }
  );

  return { nodes, edges };

};

const {
  nodes,
  edges,
} = createMindMapNodes();
const onNodeClick = async (_, node) => {

  setSelectedNode(node);

  if (!uploadedFile) return;

  const formData = new FormData();

  formData.append("file", uploadedFile);

  try {

    const response = await fetch(
      `http://127.0.0.1:8000/explain-node?topic=${node.data.label}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    setNodeExplanation(
      result.explanation
    );

  } catch (error) {

    console.error(error);

  }

};
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/20 blur-3xl rounded-full" />

      {/* AI Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-[430px] bg-zinc-950 border-r border-zinc-800 z-50 transform transition-transform duration-500 shadow-2xl flex flex-col ${
          chatOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-black">
          <div>
            <h2 className="text-3xl font-bold text-white">
              AI Assistant 💬
            </h2>

            <p className="text-zinc-500 text-sm mt-2">
              Chat with your uploaded notes
            </p>
          </div>

          <button
            onClick={() => setChatOpen(false)}
            className="text-zinc-400 hover:text-white text-3xl"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center mt-24">
              <div className="text-7xl mb-6">🧠</div>

              <h3 className="text-3xl font-bold mb-4">
                Your AI Study Assistant
              </h3>

              <p className="text-zinc-500 leading-relaxed">
                Upload PDFs and ask anything about your notes.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] px-5 py-4 rounded-3xl whitespace-pre-wrap leading-relaxed shadow-xl ${
                  msg.role === "user"
                    ? "bg-cyan-400 text-black rounded-br-md"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 p-5 bg-black">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ask anything..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 outline-none text-white"
            />

            <button
              onClick={askQuestion}
              className="bg-cyan-400 text-black px-5 py-4 rounded-2xl font-bold hover:scale-105 transition-transform"
            >
              Ask
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 px-8 py-10 transition-all duration-500 ${
          chatOpen ? "ml-[430px]" : "ml-0"
        }`}
      >
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />

              <span className="text-sm text-zinc-300">
                AI Powered Learning Engine
              </span>
            </div>

            <h1 className="text-7xl font-black leading-tight tracking-tight">
              Turn Notes Into
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Visual Intelligence
              </span>
            </h1>

            <p className="text-zinc-400 text-lg mt-6 leading-relaxed max-w-3xl">
              Upload PDFs, handwritten notes, research papers, or study
              material. The AI extracts concepts, generates flashcards,
              organizes topics, and builds mind maps automatically.
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="text-cyan-400" />

              <h2 className="text-2xl font-bold">
                Upload Notes
              </h2>
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
                <p className="text-zinc-400 text-sm">
                  Uploaded File
                </p>

                <p className="font-medium mt-1 truncate">
                  {fileName}
                </p>
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
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-cyan-400" />

              <h2 className="text-2xl font-bold">
                Topics
              </h2>
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

              <h2 className="text-2xl font-bold">
                Flashcards
              </h2>
            </div>

            <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
              {data.flashcards.length > 0 ? (
                data.flashcards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-6"
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

          {/* Mindmap */}
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 shadow-xl">

  <div className="flex items-center justify-between mb-6">

  <div className="flex items-center gap-3">

    <Network className="text-emerald-400" />

    <h2 className="text-2xl font-bold">
      Interactive Mind Map
    </h2>

  </div>

  <button
    onClick={() => setFullMindmap(true)}
    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-xl text-sm transition-all"
  >
    Fullscreen ↗
  </button>

</div>

  <div className="h-[600px] rounded-3xl overflow-hidden border border-zinc-800">

    {nodes.length > 0 ? (

      <ReactFlow
  nodes={nodes}
  edges={edges}
  fitView
  onNodeClick={onNodeClick}
  nodesDraggable={true}
  nodesConnectable={false}
  elementsSelectable={true}
  panOnDrag={true}
  zoomOnScroll={true}
  fitViewOptions={{
    padding: 0.3,
  }}

>

        <MiniMap />
        <Controls />
        <Background />

      </ReactFlow>

    ) : (

      <div className="h-full flex items-center justify-center text-zinc-500">
        Upload notes to generate mind maps
      </div>

    )}

  </div>

</div>
        </div>

        {/* Floating Button */}
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-cyan-400 hover:scale-110 transition-transform text-black px-6 py-4 rounded-full shadow-2xl font-bold"
        >
          💬 Ask AI
        </button>

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
      {/* Fullscreen Mindmap */}

{fullMindmap && (

  <div className="fixed inset-0 bg-black z-[100] flex flex-col">

    {/* Top Bar */}

    <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950">

      <h2 className="text-3xl font-bold">
        Interactive Mind Map 🌌
      </h2>

      <button
        onClick={() => setFullMindmap(false)}
        className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl border border-zinc-700"
      >
        Close ✕
      </button>

    </div>

    {/* Fullscreen Graph */}

    <div className="flex-1">

      <ReactFlow
  nodes={nodes}
  edges={edges}
  fitView
  onNodeClick={onNodeClick}
  nodesDraggable={true}
  nodesConnectable={false}
  elementsSelectable={true}
  panOnDrag={true}
  zoomOnScroll={true}
  fitViewOptions={{
    padding: 0.3,
  }}
>
      

        <MiniMap />
        <Controls />
        <Background />

      </ReactFlow>

    </div>

  </div>

)}
{/* Node Explanation Panel */}

{selectedNode && (

  <div className="fixed right-6 top-6 w-[380px] bg-zinc-950 border border-zinc-800 rounded-[2rem] shadow-2xl z-[120] p-6">

    <div className="flex items-center justify-between mb-6">

      <h2 className="text-2xl font-bold text-cyan-400">
        Concept Details
      </h2>

      <button
        onClick={() => setSelectedNode(null)}
        className="text-zinc-400 hover:text-white text-2xl"
      >
        ✕
      </button>

    </div>

    <div className="space-y-5">

      <div>

        <p className="text-sm uppercase tracking-widest text-zinc-500 mb-2">
          Topic
        </p>

        <h3 className="text-3xl font-bold">
          {selectedNode.data.label}
        </h3>

      </div>

      <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">

        <p className="text-zinc-300 leading-relaxed">
  {nodeExplanation || "Loading explanation..."}
</p>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">

          <p className="text-sm text-zinc-500 mb-2">
            Node Type
          </p>

          <p className="font-semibold">
            Knowledge Node
          </p>

        </div>

        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">

          <p className="text-sm text-zinc-500 mb-2">
            AI Status
          </p>

          <p className="font-semibold text-emerald-400">
            Connected
          </p>

        </div>

      </div>

    </div>

  </div>

)}
    </div>
  );
}