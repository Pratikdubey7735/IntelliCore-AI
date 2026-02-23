"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/Navbar"
import { runQueryApi } from "@/lib/api"
import {
  Send, Mic, MicOff, Bot, User,
  Table, BarChart2, Loader2, Database
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"]

const SUGGESTED_QUESTIONS = [
  "Who scored the highest marks in Python?",
  "Which department has the highest salary?",
  "Show top 5 cricket players by runs",
  "How many employees are in R&D?",
  "What is the average batting average in cricket?"
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  data?: any[]
  columns?: string[]
  sql?: string
  table_used?: string
  intent?: string
  row_count?: number
  time_taken_ms?: number
  error?: boolean
}

const COLORS_MAP = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"]

function ResultChart({ data, columns }: { data: any[]; columns: string[] }) {
  const textKey = columns.find(k => typeof data[0][k] === "string")
  const numKey = columns.find(k => typeof data[0][k] === "number")

  if (!textKey || !numKey) return null

  if (data.length <= 6) {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey={numKey}
            nameKey={textKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS_MAP[i % COLORS_MAP.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "8px",
              color: "#f8fafc"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey={textKey} tick={{ fill: "#94a3b8", fontSize: 10 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "none",
            borderRadius: "8px",
            color: "#f8fafc"
          }}
        />
        <Bar dataKey={numKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function ChatMessage({ message }: { message: Message }) {
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? "bg-blue-600" : "bg-slate-700"
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-2xl space-y-3 ${isUser ? "items-end" : "items-start"} flex flex-col`}>

        {/* Main bubble */}
        <div className={`px-4 py-3 rounded-2xl text-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : message.error
              ? "bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm"
              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
        }`}>
          {message.content}
        </div>

        {/* Metadata badges */}
        {message.table_used && (
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500 capitalize flex items-center gap-1">
              <Database className="w-3 h-3" />{message.table_used}
            </span>
            <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-500 capitalize">
              {message.intent}
            </span>
            <span className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-500">
              {message.row_count} rows
            </span>
            <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-500">
              {message.time_taken_ms}ms
            </span>
          </div>
        )}

        {/* Data results */}
        {message.data && message.data.length > 0 && message.columns && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-full">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Results</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Table className="w-3 h-3" /> Table
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                    viewMode === "chart"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <BarChart2 className="w-3 h-3" /> Chart
                </button>
              </div>
            </div>

            {viewMode === "table" ? (
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900">
                    <tr>
                      {message.columns.map(col => (
                        <th key={col} className="text-left py-2 px-3 text-slate-500 font-medium capitalize">
                          {col.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {message.data.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        {message.columns!.map(col => (
                          <td key={col} className="py-2 px-3 text-slate-700 dark:text-slate-300">
                            {String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3">
                <ResultChart data={message.data} columns={message.columns} />
              </div>
            )}
          </div>
        )}

        {/* SQL */}
        {message.sql && (
          <details className="w-full">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
              View SQL
            </summary>
            <pre className="mt-2 bg-slate-950 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
              {message.sql}
            </pre>
          </details>
        )}
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am Intellicore AI. Ask me anything about your Student, Cricket, or Employee data. I can answer questions, show charts, and explain my reasoning."
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const question = text || input.trim()
    if (!question || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const data = await runQueryApi(question)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        data: data.data,
        columns: data.columns,
        sql: data.sql,
        table_used: data.table_used,
        intent: data.intent,
        row_count: data.row_count,
        time_taken_ms: data.time_taken_ms,
        error: !data.success
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Voice input requires Chrome browser.")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }
    recognition.start()
  }

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Hello! I am Intellicore AI. Ask me anything about your Student, Cricket, or Employee data."
    }])
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar title="Chat" />

      <div className="flex flex-1 overflow-hidden">

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-slate-500 text-sm">Thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Ask anything about your data..."
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <button
                onClick={handleVoice}
                className={`p-3 rounded-xl border transition-all ${
                  listening
                    ? "bg-red-500 border-red-500 text-white animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-500"
                }`}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel — Suggestions + Controls */}
        <div className="w-64 shrink-0 border-l border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-slate-900">

          <div>
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-3">
              Try asking
            </h3>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-blue-500/10 hover:text-blue-500 transition-all border border-slate-200 dark:border-slate-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-3">
              Chat Info
            </h3>
            <div className="space-y-2 text-xs text-slate-500">
              <p>Messages: {messages.length}</p>
              <p>Queries asked: {messages.filter(m => m.role === "user").length}</p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="w-full py-2 rounded-lg text-xs text-red-400 border border-red-400/20 hover:bg-red-500/10 transition-all"
          >
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  )
}