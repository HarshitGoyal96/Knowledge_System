import * as htmlToImage from "html-to-image";
import { useState, useRef , useEffect } from "react";

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
  const [selectedMap, setSelectedMap] =
  useState(null);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] =
  useState([]);


  const [chatId, setChatId] =
  useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  const [fullMindmap, setFullMindmap] =
    useState(false);

  const [uploadedFiles, setUploadedFiles] =
  useState([]);

  const [selectedNode, setSelectedNode] =
    useState(null);

  const [nodeExplanation, setNodeExplanation] =
    useState("");

  const mindmapRef = useRef(null);
  const [quizMode, setQuizMode] =
  useState(false);
const token = localStorage.getItem("token");
const [currentQuestion, setCurrentQuestion] =
  useState(0);

const [showAnswer, setShowAnswer] =
  useState(false);

const [score, setScore] =
  useState(0);

  const [selectedOption, setSelectedOption] =
  useState("");

const [answerChecked, setAnswerChecked] =
  useState(false);

const [isCorrect, setIsCorrect] =
  useState(false);

  const [data, setData] = useState({
    topics: [],
    flashcards: [],
    mindmap: {},
  });
useEffect(() => {

  if (token) {

    // LOGGED IN USER

    setChatId(1);

  } else {

    // GUEST USER

    setChatId(0);

  }

}, [token]);
  // =========================
  // FILE UPLOAD
  // =========================

 const handleUpload = async (e) => {

  const files = Array.from(
    e.target.files
  );

  if (!files.length) return;

  setLoading(true);

  try {

    // CLEAR OLD UI DATA

    setData({

      topics: [],

      flashcards: [],

      mindmap: {}

    });

    // CLEAR OLD PDF LIST

    setUploadedFiles([]);

    // CLEAR OLD VECTOR MEMORY

    await fetch(

      "http://127.0.0.1:8000/reset-memory",

      {

        method: "POST",

      }

    );

    // STORE PDFs

    for (const file of files) {

      // SHOW PDF IN UI

      setUploadedFiles((prev) => [

        ...prev,

        file.name

      ]);

      const uploadForm =
        new FormData();

      uploadForm.append(
        "file",
        file
      );

      await fetch(

        "http://127.0.0.1:8000/upload-pdf",

        {

          method: "POST",

          body: uploadForm,

        }

      );

    }

    // ANALYZE ALL NEW PDFs

    const response = await fetch(

      "http://127.0.0.1:8000/analyze-notes",

      {

        method: "POST",

      }

    );

    const result =
      await response.json();

    // FRESH UI UPDATE

    setData({

      topics:
        result.topics || [],

      flashcards:
        result.flashcards || [],

      mindmap:
        result.mindmap || {}

    });

  } catch (error) {

    console.log(error);

  }

  setLoading(false);

};
  // =========================
  // CHAT WITH PDF
  // =========================

 const askQuestion = async () => {

  if (!question.trim()) return;

  // CREATE USER MESSAGE

  const userMessage = {

    role: "user",

    content: question,

  };

  // ADD USER MESSAGE

  setMessages((prev) => [

    ...prev,

    userMessage,

  ]);

  const currentQuestion = question;

  setQuestion("");

  try {

    const response = await fetch(

      `http://127.0.0.1:8000/chat-pdf?query=${encodeURIComponent(currentQuestion)}&chat_id=${chatId}`,

      {

        method: "POST",

      }

    );

    // STREAM READER

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let aiText = "";

    // ADD EMPTY AI MESSAGE FIRST

    setMessages((prev) => [

      ...prev,

      {

        role: "assistant",

        content: "",

      },

    ]);

    while (true) {

      const {

        done,

        value

      } = await reader.read();

      if (done) break;

      const chunk =
        decoder.decode(value);

      aiText += chunk;

      // UPDATE LAST MESSAGE LIVE

      setMessages((prev) => {

        const updated = [...prev];

        // UPDATE LAST AI MESSAGE

        updated[
          updated.length - 1
        ] = {

          role: "assistant",

          content: aiText,

        };

        return updated;

      });

    }

    // OPTIONAL REFRESH HISTORY

    fetchChatHistory();

  } catch (error) {

    console.error(
      "Streaming Error:",
      error
    );

  }

};

  // =========================
  // CREATE MINDMAP
  // =========================

const createMindMapNodes = () => {

  const maps = [];

  let parentIndex = 0;

  Object.entries(data.mindmap).forEach(
    ([parent, children]) => {

      const nodes = [];
      const edges = [];

      const parentId =
        `parent-${parentIndex}`;

      // MAIN NODE

      nodes.push({
  id: parentId,

  data: {
    label: parent,
  },

  position: {
    x: 250,
    y: 40,
  },

  style: {
    background: "#06b6d4",
    color: "black",
    border: "none",
    padding: 10,
    borderRadius: 18,
    fontWeight: "bold",
    fontSize: 13,
    minWidth: 140,
    textAlign: "center",
  },
});

      let childIndex = 0;

      Object.entries(children).forEach(
        ([subTopic, points]) => {

          const childId =
            `${parentId}-${childIndex}`;

          nodes.push({
  id: childId,

  data: {
    label: subTopic,
  },

  position: {
    x: 80 + childIndex * 160,
    y: 150,
  },

  style: {
    background: "#18181b",
    color: "white",
    border: "1px solid #3f3f46",
    padding: 8,
    borderRadius: 14,
    minWidth: 120,
    textAlign: "center",
  },
});

          edges.push({
            id:
              `edge-${parentId}-${childId}`,

            source: parentId,

            target: childId,

            animated: true,

            style: {
              stroke: "#06b6d4",
            },
          });

          points.forEach(
            (point, pointIndex) => {

              const pointId =
                `${childId}-${pointIndex}`;

              nodes.push({
  id: pointId,

  data: {
    label: point,
  },

  position: {
    x: 70 + childIndex * 160,
    y: 260 + pointIndex * 70,
  },

  style: {
    background: "#27272a",
    color: "#d4d4d8",
    border: "1px solid #3f3f46",
    padding: 6,
    borderRadius: 12,
    fontSize: 10,
    minWidth: 100,
    textAlign: "center",
  },
});

              edges.push({
                id:
                  `edge-${childId}-${pointId}`,

                source: childId,

                target: pointId,

                animated: true,

                style: {
                  stroke: "#a855f7",
                },
              });

            }
          );

          childIndex++;

        }
      );

      maps.push({
        title: parent,
        nodes,
        edges,
      });

      parentIndex++;

    }
  );

  return maps;

};

  const maps =
  createMindMapNodes();

  // =========================
  // NODE CLICK
  // =========================

  const onNodeClick = async (_, node) => {

  setSelectedNode(node);

  setNodeExplanation(
    "Loading explanation..."
  );

  try {

    const response = await fetch(

      `http://127.0.0.1:8000/explain-node?topic=${encodeURIComponent(
        node.data.label
      )}`,

      {

        method: "POST",

      }

    );

    // STREAM READER

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let fullText = "";

    while (true) {

      const {

        done,

        value

      } = await reader.read();

      if (done) break;

      const chunk =
        decoder.decode(value);

      fullText += chunk;

      // LIVE UPDATE

      setNodeExplanation(
        fullText
      );

    }

  } catch (error) {

    console.error(error);

    setNodeExplanation(
      "Failed to load explanation."
    );

  }

};

  // =========================
  // EXPORT PNG
  // =========================

  const exportMindmap = async () => {

    if (!mindmapRef.current) return;

    try {

      const dataUrl =
        await htmlToImage.toPng(
          mindmapRef.current,
          {
            cacheBust: true,
            backgroundColor: "#000",
          }
        );

      const link =
        document.createElement("a");

      link.download =
        "ai-mindmap.png";

      link.href = dataUrl;

      link.click();

    } catch (error) {

      console.error(error);

    }

  };
  const startQuiz = () => {

  setQuizMode(true);

  setCurrentQuestion(0);

  setShowAnswer(false);

  setScore(0);

};

const nextQuestion = () => {

  if (
    currentQuestion <
    data.flashcards.length - 1
  ) {

    setCurrentQuestion(
      currentQuestion + 1
    );

    setSelectedOption("");

    setAnswerChecked(false);

    setIsCorrect(false);

  } else {

    alert(
      `Quiz Finished! Score: ${score}/${data.flashcards.length}`
    );

    setQuizMode(false);

  }

};

const markCorrect = () => {

  setScore(score + 1);

  nextQuestion();

};
const getQuizOptions = () => {

  if (
    !data.flashcards[currentQuestion]
  ) return [];

  const correctAnswer =
    data.flashcards[currentQuestion]
      .answer;

  const allAnswers =
    data.flashcards.map(
      (card) => card.answer
    );

  const wrongAnswers =
    allAnswers
      .filter(
        (ans) =>
          ans !== correctAnswer
      )
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

  const options = [
    correctAnswer,
    ...wrongAnswers,
  ].sort(() => 0.5 - Math.random());

  return options;

};
const checkAnswer = () => {

  const correctAnswer =
    data.flashcards[currentQuestion]
      .answer;

  const correct =
    selectedOption === correctAnswer;

  setIsCorrect(correct);

  setAnswerChecked(true);

  if (correct) {
    setScore(score + 1);
  }

};
const fetchChatHistory = async () => {

  if (!token || !chatId) return;

  try {

    const response = await fetch(

      `http://127.0.0.1:8000/chat-history/${chatId}`

    );

    const data = await response.json();

    // UPDATE MAIN CHAT STATE

    setMessages(data);

  } catch (error) {

    console.log(error);

  }

};

useEffect(() => {

  if (token) {

    fetchAllChats();

  }

}, [chatId]);
const fetchAllChats = async () => {

  const response = await fetch(
    "http://127.0.0.1:8000/all-chats"
  );

  const data = await response.json();

  setAllChats(data);

};
const createNewChat = async () => {

  const response = await fetch(
    "http://127.0.0.1:8000/create-chat",
    {
      method: "POST",
    }
  );

  const data = await response.json();

  setChatId(data.chat_id);

  fetchAllChats();

};
const clearHistory = async () => {

  // CLEAR UI FIRST

  setMessages([]);

  setSavedHistory([]);

  setShowHistory(false);

  // CLEAR DB IF LOGGED IN

  if (token) {

    try {

      await fetch(

        `http://127.0.0.1:8000/clear-history/${chatId}`,

        {

          method: "DELETE",

        }

      );

    } catch (error) {

      console.log(error);

    }

  }

};
  return (

    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* Background */}
      <div className="fixed top-6 right-6 z-[200]">

  {token ? (

    <button
      onClick={() => {
              localStorage.removeItem("token");
              setChatHistory([]);
              setSavedHistory([]);
              setChatHistory(false);
              setMessages([]);
              window.location.href = "/";

      }}
      className="
        bg-cyan-400
        hover:bg-cyan-300
        text-black
        font-bold
        px-6
        py-3
        rounded-full
        shadow-lg
        transition-all
      "
    >
      Logout
    </button>

  ) : (

    <button
      onClick={() => {

        window.location.href =
          "/login";

      }}
      className="
        bg-cyan-400
        hover:bg-cyan-300
        text-black
        font-bold
        px-6
        py-3
        rounded-full
        shadow-lg
        transition-all
      "
    >
      Login
    </button>

  )}

</div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/20 blur-3xl rounded-full" />

      {/* MAIN CONTENT */}

      <div className="relative z-10 px-8 py-10">

        {/* HERO */}

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

              Upload PDFs, handwritten notes, research papers, or study material.

            </p>

          </div>

          {/* UPLOAD CARD */}

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

              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                multiple
                onChange={handleUpload}
              />

            </label>
            {/* UPLOADED FILES */}

{uploadedFiles.length > 0 && (

  <div className="mt-6 space-y-3">

    <p className="text-zinc-400 text-sm font-semibold">

      Uploaded PDFs

    </p>

    {uploadedFiles.map((file, index) => (

      <div
        key={index}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 flex items-center justify-between"
      >

        <div className="flex items-center gap-3">

          <span className="text-cyan-400 text-xl">
            📄
          </span>

          <span className="text-zinc-200">
            {file}
          </span>

        </div>

        <span className="text-green-400 text-sm">
          Uploaded
        </span>

      </div>

    ))}

  </div>

)}

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

          </div>

        </div>
        

        {/* GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* TOPICS */}

          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 shadow-xl">

            <div className="flex items-center gap-3 mb-6">

              <BookOpen className="text-cyan-400" />

              <h2 className="text-2xl font-bold">
                Topics
              </h2>

            </div>

            <div  className={`space-y-3 overflow-y-auto custom-scrollbar pr-2 ${
    data.topics.length > 0
      ? "max-h-[500px]"
      : "h-[120px]"
  }`}>

              {data.topics.map((topic, index) => (

                <div
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4"
                >
                  {topic}
                </div>

              ))}
              {data.topics.length === 0 && (
  <div className="h-full flex items-center justify-center text-zinc-500">
    Upload notes to generate topics
  </div>
)}

            </div>

          </div>

          {/* FLASHCARDS */}

          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 shadow-xl">

            <div className="flex items-center justify-between mb-6">

  <div className="flex items-center gap-3">

    <BrainCircuit className="text-fuchsia-400" />

    <h2 className="text-2xl font-bold">
      Flashcards
    </h2>

  </div>

  {data.flashcards.length > 0 && (

    <button
      onClick={startQuiz}
      className="bg-fuchsia-500 hover:bg-fuchsia-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
    >
      Start Quiz 🧠
    </button>

  )}

</div>

            <div  className={`space-y-5 overflow-y-auto custom-scrollbar pr-2 ${
    data.flashcards.length > 0
      ? "max-h-[500px]"
      : "h-[120px]"
  }`}>

              {data.flashcards.map((card, index) => (

                <div
                  key={index}
                  className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-6"
                >

                  <h3 className="font-semibold text-lg mb-5">
                    {card.question}
                  </h3>

                  <p className="text-zinc-300">
                    {card.answer}
                  </p>

                </div>

              ))}
              {data.flashcards.length === 0 && (
  <div className="h-full flex items-center justify-center text-zinc-500">
    Flashcards will appear here
  </div>
)}
            </div>

          </div>

          {/* MINDMAP */}

          {/* MINDMAP SECTION */}

<div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 shadow-xl">

  {/* HEADER */}

  <div className="flex items-center justify-between mb-6">

    <div className="flex items-center gap-3">

      <Network className="text-emerald-400" />

      <h2 className="text-2xl font-bold">
        Interactive Mind Maps
      </h2>

    </div>

    <div className="flex gap-3">

      <button
        onClick={exportMindmap}
        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-xl text-sm transition-all"
      >
        Export PNG 📸
      </button>

      <button
        onClick={() =>
          setFullMindmap(true)
        }
        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-xl text-sm transition-all"
      >
        Fullscreen ↗
      </button>

    </div>

  </div>

  {/* EMPTY STATE */}

  {maps.length === 0 ? (

    <div className="h-[120px] flex items-center justify-center rounded-3xl border border-zinc-800 text-zinc-500">

      Upload notes to generate mind maps

    </div>

  ) : (

    /* GRID COLLAGE */

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar max-h-[650px] pr-2">

      {maps.map((map, index) => (

        <div
          key={index}
          ref={mindmapRef}
          className="rounded-3xl overflow-hidden border border-zinc-800 bg-black"
        >


          {/* MAP */}

          <div
  key={index}
  onClick={() => setFullMindmap(true)}
  className="group relative aspect-square rounded-[2rem] overflow-hidden border border-zinc-800 bg-zinc-950 hover:border-cyan-400 transition-all duration-300 cursor-pointer"
>

  {/* MINI MAP */}

  <div className="absolute inset-0 scale-[0.65]">

    <ReactFlow
      nodes={map.nodes}
      edges={map.edges}
      fitView
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      proOptions={{
        hideAttribution: true,
      }}
      fitViewOptions={{
        padding: 4,
      }}
    >

      <Background />

    </ReactFlow>

  </div>

  {/* DARK OVERLAY */}

  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />

  {/* TITLE */}

  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent">

    <h3 className="text-lg font-bold text-white">

      {map.title}

    </h3>

    <p className="text-xs text-zinc-400 mt-1">

      AI Knowledge Graph

    </p>

  </div>

</div>

        </div>

      ))}

    </div>

  )}

</div>

        </div>

      </div>
   {/* QUIZ MODE */}

{quizMode && data.flashcards.length > 0 && (

  <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-8">

    <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">

      {/* TOP */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <h2 className="text-4xl font-black">
            AI Quiz Mode 🧠
          </h2>

          <p className="text-zinc-500 mt-2">
            Question {currentQuestion + 1}
            / {data.flashcards.length}
          </p>

        </div>

        <button
          onClick={() => setQuizMode(false)}
          className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl border border-zinc-700"
        >
          Exit ✕
        </button>

      </div>

      {/* PROGRESS */}

      <div className="mb-10">

        <div className="bg-zinc-900 rounded-full h-4 overflow-hidden">

          <div
            className="bg-fuchsia-500 h-full transition-all duration-500"
            style={{
              width: `${
                ((currentQuestion + 1) /
                  data.flashcards.length) *
                100
              }%`,
            }}
          />

        </div>

      </div>

      {/* QUESTION CARD */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-10 mb-10">

        <p className="text-fuchsia-400 uppercase tracking-widest text-sm mb-4">
          Question
        </p>

        <h3 className="text-3xl font-bold leading-relaxed text-white">

          {
            data.flashcards[currentQuestion]
              .question
          }

        </h3>

      </div>

      {/* OPTIONS */}

      <div className="space-y-4 mb-10">

        {getQuizOptions().map(
          (option, index) => (

            <button
              key={index}
              onClick={() =>
                !answerChecked &&
                setSelectedOption(option)
              }
              className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                selectedOption === option
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
              }`}
            >

              <div className="flex items-center gap-4">

                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                  selectedOption === option
                    ? "border-cyan-400 bg-cyan-400"
                    : "border-zinc-600"
                }`}>

                  {selectedOption === option && (
                    <div className="w-2 h-2 bg-black rounded-full" />
                  )}

                </div>

                <p className="text-lg text-zinc-200">
                  {option}
                </p>

              </div>

            </button>

          )
        )}

      </div>

      {/* RESULT */}

      {answerChecked && (

        <div
          className={`mb-8 p-6 rounded-2xl border ${
            isCorrect
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}
        >

          <h3 className="text-2xl font-bold mb-3">

            {isCorrect
              ? "Correct Answer ✅"
              : "Wrong Answer ❌"}

          </h3>

          {!isCorrect && (

            <p className="text-zinc-300 text-lg">

              Correct Answer:

              <span className="text-cyan-400 ml-2 font-semibold">

                {
                  data.flashcards[currentQuestion]
                    .answer
                }

              </span>

            </p>

          )}

        </div>

      )}

      {/* ACTION BUTTONS */}

      <div className="flex gap-4">

        {!answerChecked ? (

          <button
            onClick={checkAnswer}
            disabled={!selectedOption}
            className="bg-cyan-400 text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            Check Answer
          </button>

        ) : (

          <button
            onClick={nextQuestion}
            className="bg-fuchsia-500 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform"
          >
            Next Question →
          </button>

        )}

      </div>

      {/* SCORE */}

      <div className="mt-10 flex items-center justify-between">

        <div className="text-zinc-400 text-lg">

          Current Score:

          <span className="text-white font-bold ml-2 text-2xl">

            {score}

          </span>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 px-5 py-3 rounded-2xl">

          <span className="text-fuchsia-400 font-semibold">
            AI Powered Quiz Engine
          </span>

        </div>

      </div>

    </div>

  </div>

)}
      {/* NODE PANEL */}

      {selectedNode && (

        <div className="fixed right-6 top-6 w-[380px] bg-zinc-950 border border-zinc-800 rounded-[2rem] shadow-2xl z-[300] p-6">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold text-cyan-400">

              Concept Details

            </h2>

            <button
              onClick={() =>
                setSelectedNode(null)
              }
              className="text-zinc-400 hover:text-white text-2xl"
            >
              ✕
            </button>

          </div>

          <h3 className="text-3xl font-bold mb-5">

            {selectedNode.data.label}

          </h3>

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">

            <p className="text-zinc-300 leading-relaxed">

              {nodeExplanation ||
                "Loading explanation..."}

            </p>

          </div>

        </div>

      )}
      {/* AI SIDEBAR */}

<div
  className={`fixed top-0 left-0 h-screen w-[430px] bg-zinc-950 border-r border-zinc-800 z-50 transform transition-transform duration-500 shadow-2xl flex flex-col ${
    chatOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>

  {/* HEADER */}

  <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-black">

    <div>

      <h2 className="text-3xl font-bold text-white">
        AI Assistant 💬
      </h2>

      <div className="flex items-center justify-between mt-2">

  <p className="text-zinc-500 text-sm">
    Chat with your uploaded notes
  </p>

  {token && (

    <div className="flex gap-2">

      {/* LOAD HISTORY */}

      <button
        onClick={fetchChatHistory}
        className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full transition-all"
      >
        Load History
      </button>

      {/* CLEAR */}

      <button
        onClick={clearHistory}
        className="text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded-full transition-all"
      >
        Clear
      </button>

    </div>

  )}

</div>

    </div>

    <button
      onClick={() => setChatOpen(false)}
      className="text-zinc-400 hover:text-white text-3xl"
    >
      ✕
    </button>

  </div>

  {/* MESSAGES */}

  <div className="flex-1 overflow-y-auto p-6 space-y-6">

    {messages.length === 0 && (

      <div className="text-center mt-24">

        <div className="text-7xl mb-6">
          🧠
        </div>

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
      {msg.role === "assistant" && (
    <span className="animate-pulse">
      ▋
    </span>
  )}             {/* CLEAR HISTORY */}

  
    </div>

  </div>

))}

  </div>

  {/* INPUT */}

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
{/* FLOATING ASK AI BUTTON */}

<button
  onClick={() => setChatOpen(true)}
  className="fixed bottom-6 left-6 z-40 bg-cyan-400 hover:scale-110 transition-transform text-black px-6 py-4 rounded-full shadow-2xl font-bold"
>
  💬 Ask AI
</button>
{/* FULLSCREEN MINDMAP */}

{/* FULLSCREEN MINDMAP */}

{fullMindmap && (

  <div className="fixed inset-0 bg-black z-[100] overflow-y-auto">

    {/* HEADER */}

    <div className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800 px-8 py-5 flex items-center justify-between">

      <h2 className="text-3xl font-black text-white">
        AI Knowledge Graphs 🌌
      </h2>

      <button
        onClick={() =>
          setFullMindmap(false)
        }
        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-5 py-3 rounded-2xl"
      >
        Close ✕
      </button>

    </div>

    {/* GRID OF ALL MAPS */}

    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

      {maps.map((map, index) => (

        <div
          key={index}
          className="bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden"
        >

          {/* MAP HEADER */}

          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">

  <h3 className="text-xl font-bold">

    {map.title}

  </h3>

  <div className="flex items-center gap-3">

    <div className="text-xs text-zinc-500">

      AI Mindmap

    </div>

    <button
      onClick={() =>
        setSelectedMap(map)
      }
      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-xl text-xs transition-all"
    >
      Expand 🔍
    </button>

  </div>

</div>

       {/* MAP */}

<div className="h-[350px]">

  <ReactFlow
    nodes={map.nodes}
    edges={map.edges}
    fitView
    onNodeClick={onNodeClick}
    nodesDraggable={true}
    nodesConnectable={false}
    elementsSelectable={true}
    panOnDrag={true}
    zoomOnScroll={true}
    fitViewOptions={{
      padding: 1.8,
    }}
  >

    <Background />

  </ReactFlow>

</div>

        </div>

      ))}

    </div>

  </div>

)}


{/* SINGLE MAP EXPANSION */}

{selectedMap && (

  <div className="fixed inset-0 z-[200] bg-black">

    {/* TOPBAR */}

    <div className="h-20 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-8">

      <div>

        <h2 className="text-3xl font-black">

          {selectedMap.title}

        </h2>

        <p className="text-zinc-500 text-sm mt-1">

          Interactive AI Knowledge Graph

        </p>

      </div>

      <button
        onClick={() =>
          setSelectedMap(null)
        }
        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-5 py-3 rounded-2xl"
      >
        Close ✕
      </button>

    </div>

    {/* HUGE GRAPH */}

    <div className="h-[calc(100vh-80px)]">

      <ReactFlow
        nodes={selectedMap.nodes}
        edges={selectedMap.edges}
        fitView
        onNodeClick={onNodeClick}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        fitViewOptions={{
          padding: 0.5,
        }}
      >

        <MiniMap />
        <Controls />
        <Background />

      </ReactFlow>

    </div>

  </div>

)}
{/* FUTURISTIC BACKGROUND */}

<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">

  {/* GRID */}

  <div
    className="absolute inset-0 opacity-[0.07]"
    style={{

      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
      `,

      backgroundSize: "40px 40px",

    }}
  />

  {/* CYAN GLOW */}

  <div className="absolute bottom-[-120px] left-[-120px] w-[450px] h-[450px] bg-cyan-500/10 blur-[140px] rounded-full" />

  {/* PURPLE GLOW */}

  <div className="absolute bottom-[-150px] right-[-120px] w-[450px] h-[450px] bg-fuchsia-500/10 blur-[140px] rounded-full" />

  {/* WATERMARK */}

  <div className="absolute inset-0 flex items-center justify-center">

    <h1 className="text-[180px] font-black tracking-widest text-white/[0.02] select-none">

      AI

    </h1>

  </div>

</div>


    </div>

  );

}
