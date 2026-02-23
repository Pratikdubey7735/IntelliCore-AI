"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { runQueryApi, saveQueryApi } from "@/lib/api";
import { QueryResult } from "@/types";
import {
  Search,
  CheckCircle,
  Circle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Table,
  BarChart2,
  Download,
  Mic,
  MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import Papa from "papaparse";
import { explainSQLApi } from "@/lib/api";
import { Sparkles } from "lucide-react";

const SUGGESTIONS: Record<string, string[]> = {
  default: [
    "Who scored the highest marks in Python?",
    "Which department has the highest average salary?",
    "Show top 5 cricket players by runs",
    "How many students scored above 80 in Data Structures?",
    "Which employee has the highest performance rating?",
  ],
  student: [
    "Who scored the highest marks in Python?",
    "What is the average marks in Data Structures?",
    "Show top 5 students in C programming",
    "How many students scored more than 80 in COA?",
    "Who performed best in Software Engineering?",
  ],
  cricket: [
    "Who scored the most runs in cricket?",
    "Which player has the highest batting average?",
    "Show top 10 players by number of centuries",
    "Which player scored the most fifties?",
    "Who has played the most matches?",
  ],
  employee: [
    "Which department has the highest average salary?",
    "Who is the highest paid employee?",
    "How many employees are in R&D department?",
    "What is the average experience of employees?",
    "Which employee has the highest performance rating?",
  ],
};

const STEPS = [
  { key: "intent", label: "Classifying Intent" },
  { key: "table_selection", label: "Selecting Table" },
  { key: "column_selection", label: "Selecting Columns" },
  { key: "pseudo_code", label: "Planning Query" },
  { key: "sql_generation", label: "Generating SQL" },
  { key: "sql_execution", label: "Executing Query" },
  { key: "final_answer", label: "Preparing Answer" },
];

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#f97316",
  "#84cc16",
  "#ec4899",
  "#14b8a6",
];

// ─── Universal Data Analysis Helpers ─────────────────────────────────────────

/**
 * Safely coerce any value to a number. Returns NaN if not parseable.
 */
const toNum = (val: any): number => {
  if (val === null || val === undefined || val === "") return NaN;
  const n = Number(val);
  return n;
};

/**
 * Check if a value is numeric (works for both number and numeric string types).
 */
const isNumeric = (val: any): boolean => !isNaN(toNum(val));

/**
 * Analyse all columns and classify them as:
 *  - "text"   : primarily string / categorical values
 *  - "number" : primarily numeric values
 *  - "mixed"  : blend (treated as text for axis labels)
 */
const classifyColumns = (
  data: Record<string, any>[],
  columns: string[]
): Record<string, "text" | "number" | "mixed"> => {
  const result: Record<string, "text" | "number" | "mixed"> = {};
  for (const col of columns) {
    const numericCount = data.filter((row) => isNumeric(row[col])).length;
    const ratio = numericCount / data.length;
    if (ratio >= 0.8) result[col] = "number";
    else if (ratio <= 0.2) result[col] = "text";
    else result[col] = "mixed";
  }
  return result;
};

/**
 * Pick the best label key (categorical axis) and one or more value keys.
 * Prefers columns with more unique values for label, lower cardinality numeric for bars.
 */
const pickChartKeys = (
  data: Record<string, any>[],
  columns: string[],
  colTypes: Record<string, "text" | "number" | "mixed">
) => {
  const textCols = columns.filter(
    (c) => colTypes[c] === "text" || colTypes[c] === "mixed"
  );
  const numCols = columns.filter((c) => colTypes[c] === "number");

  // Sort text cols by unique value count DESC (most unique = best label)
  const labelCol =
    textCols.sort(
      (a, b) =>
        new Set(data.map((r) => r[b])).size -
        new Set(data.map((r) => r[a])).size
    )[0] || columns[0];

  // All numeric columns except the label
  const valueCols = numCols.filter((c) => c !== labelCol);

  return { labelCol, valueCols };
};

/**
 * Normalize data rows: coerce numeric strings → actual numbers,
 * truncate long label strings for readability.
 */
const normalizeData = (
  data: Record<string, any>[],
  labelCol: string,
  valueCols: string[]
): Record<string, any>[] =>
  data.map((row) => {
    const newRow: Record<string, any> = { ...row };
    // Truncate label
    if (typeof newRow[labelCol] === "string" && newRow[labelCol].length > 18) {
      newRow[labelCol] = newRow[labelCol].slice(0, 16) + "…";
    }
    // Coerce numeric columns
    for (const col of valueCols) {
      newRow[col] = toNum(row[col]);
    }
    return newRow;
  });

// ─── Chart Subcomponents ──────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-slate-300 mb-1 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill || "#fff" }}>
          {p.name}: <span className="font-bold">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QueryPage() {
  const [sqlExplanation, setSqlExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [showSQL, setShowSQL] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  const [saveLabel, setSaveLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTIONS.default);
  const [listening, setListening] = useState(false);
  const [confidence, setConfidence] = useState<{
    intent: number;
    table: number;
  } | null>(null);
  // Which chart type the user has manually selected (null = auto)
  const [chartType, setChartType] = useState<
    "auto" | "bar" | "line" | "pie" | "radar"
  >("auto");

  const simulateSteps = async () => {
    for (const step of STEPS) {
      setCurrentStep(step.key);
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  const handleQuery = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    setCompletedSteps([]);
    setCurrentStep(null);
    setError("");
    setSaveSuccess(false);
    setChartType("auto");
    simulateSteps();
    try {
      const data = await runQueryApi(question);
      setResult(data);
      const intentStep = data.steps?.find((s: any) => s.step === "intent");
      const tableStep = data.steps?.find(
        (s: any) => s.step === "table_selection"
      );
      setConfidence({
        intent: intentStep?.result?.confidence || 0,
        table: tableStep?.result?.confidence || 0,
      });
      if (data.table_used && SUGGESTIONS[data.table_used]) {
        setSuggestions(SUGGESTIONS[data.table_used]);
      }
      setCompletedSteps(STEPS.map((s) => s.key));
      setCurrentStep(null);
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      alert("Voice recognition error. Please try again.");
    };
    recognition.start();
  };

  const handleSave = async () => {
    if (!result || !saveLabel.trim()) return;
    setSaving(true);
    try {
      await saveQueryApi(
        saveLabel,
        question,
        result.table_used,
        result.sql || ""
      );
      setSaveSuccess(true);
      setSaveLabel("");
    } catch {
      setError("Failed to save query.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (!result || result.data.length === 0) return;
    const csv = Papa.unparse(result.data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `intellicore_${result.table_used}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExplainSQL = async () => {
    if (!result?.sql) return;
    setExplaining(true);
    setSqlExplanation("");
    try {
      const data = await explainSQLApi(result.sql);
      setSqlExplanation(data.explanation);
    } catch {
      setSqlExplanation("Could not explain this query. Please try again.");
    } finally {
      setExplaining(false);
    }
  };

  // ─── Universal Chart Renderer ───────────────────────────────────────────────

  const renderChart = () => {
    if (!result || result.data.length === 0) return null;

    const { columns, data } = result;

    // 1. Classify every column
    const colTypes = classifyColumns(data, columns);

    // 2. Pick best label + value columns
    const { labelCol, valueCols } = pickChartKeys(data, columns, colTypes);

    // 3. If we truly have no numeric columns at all, show a count-based chart
    //    e.g. SELECT name FROM … returns only text → count occurrences
    let chartData: Record<string, any>[];
    let activeValueCols: string[];

    if (valueCols.length === 0) {
      // Fallback: count occurrences of each unique label value
      const counts: Record<string, number> = {};
      data.forEach((row) => {
        const key = String(row[labelCol] ?? "Unknown");
        counts[key] = (counts[key] || 0) + 1;
      });
      chartData = Object.entries(counts).map(([name, count]) => ({
        [labelCol]: name,
        count,
      }));
      activeValueCols = ["count"];
    } else {
      chartData = normalizeData(data, labelCol, valueCols);
      activeValueCols = valueCols;
    }

    // 4. Decide chart type
    const rowCount = chartData.length;
    const multiValueCols = activeValueCols.length > 1;

    let resolvedType: "bar" | "line" | "pie" | "radar" = "bar";

    if (chartType !== "auto") {
      resolvedType = chartType;
    } else {
      // Auto-selection heuristic:
      // - ≤6 rows, single value col → Pie
      // - >1 numeric col → Radar (if ≤12 rows) or grouped Bar
      // - data looks sequential (has id/rank/year-like col) → Line
      // - else → Bar

      const hasSequentialLabel =
        /rank|year|month|day|round|match|game|over|inning/i.test(labelCol);

      if (rowCount <= 6 && activeValueCols.length === 1) {
        resolvedType = "pie";
      } else if (multiValueCols && rowCount <= 12) {
        resolvedType = "radar";
      } else if (hasSequentialLabel) {
        resolvedType = "line";
      } else {
        resolvedType = "bar";
      }
    }

    const height = 320;

    // 5. Render

    if (resolvedType === "pie") {
      const col = activeValueCols[0];
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey={col}
              nameKey={labelCol}
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={45}
              paddingAngle={3}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (resolvedType === "line") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey={labelCol}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip content={<CustomTooltip />} />
            {activeValueCols.length > 1 && <Legend />}
            {activeValueCols.map((col, i) => (
              <Line
                key={col}
                type="monotone"
                dataKey={col}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, fill: COLORS[i % COLORS.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (resolvedType === "radar") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis
              dataKey={labelCol}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <PolarRadiusAxis tick={{ fontSize: 10, fill: "#64748b" }} />
            {activeValueCols.map((col, i) => (
              <Radar
                key={col}
                name={col}
                dataKey={col}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.25}
              />
            ))}
            <Tooltip content={<CustomTooltip />} />
            {activeValueCols.length > 1 && <Legend />}
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    // Default: Bar (grouped if multiple value cols)
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 48 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey={labelCol}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            angle={rowCount > 6 ? -40 : 0}
            textAnchor={rowCount > 6 ? "end" : "middle"}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <Tooltip content={<CustomTooltip />} />
          {activeValueCols.length > 1 && <Legend />}
          {activeValueCols.map((col, i) => (
            <Bar
              key={col}
              dataKey={col}
              fill={COLORS[i % COLORS.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // ─── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar title="Query" />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Left — Agent Step Tracker */}
        <div className="w-56 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sticky top-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Agent Pipeline
            </p>
            {STEPS.map((step) => {
              const isDone = completedSteps.includes(step.key);
              const isActive = currentStep === step.key;
              return (
                <div
                  key={step.key}
                  className="flex items-center gap-2 py-1.5"
                >
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-700" />
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      isDone
                        ? "text-emerald-400"
                        : isActive
                        ? "text-blue-400 font-medium"
                        : "text-slate-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}

            {result && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500">Completed in</p>
                <p className="text-sm font-bold text-blue-400">
                  {result.time_taken_ms}ms
                </p>

                {confidence && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-400 mb-2">
                      Confidence Scores
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Intent</span>
                        <span className="text-slate-300">
                          {Math.round(confidence.intent * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Table</span>
                        <span className="text-slate-300">
                          {Math.round(confidence.table * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Overall</span>
                        <span className="text-slate-300">
                          {Math.round(
                            ((confidence.intent + confidence.table) / 2) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 mt-1">
                        <div
                          className={`h-full rounded-full transition-all ${
                            (confidence.intent + confidence.table) / 2 >= 0.8
                              ? "bg-emerald-500"
                              : (confidence.intent + confidence.table) / 2 >=
                                0.6
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.round(
                              ((confidence.intent + confidence.table) / 2) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Search Bar */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                placeholder="Ask anything about your data..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-lg border transition-all ${
                listening
                  ? "bg-red-500/10 border-red-500 text-red-400"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {listening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
            <Button
              onClick={handleQuery}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
            </Button>
          </div>

          {/* Smart Suggestions */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500">Suggested questions:</span>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setQuestion(s)}
                className="px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-500/10 hover:text-blue-500 transition-all border border-slate-200 dark:border-slate-700"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Answer Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                      AI
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm leading-relaxed">
                        {result.answer}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs">
                          {result.table_used}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs">
                          {result.intent}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs">
                          {result.row_count} rows
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data View */}
                {result.data.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-semibold text-slate-300">
                        Results
                      </p>
                      <div className="flex items-center gap-2">
                        {/* Export */}
                        <button
                          onClick={handleExportCSV}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-slate-800 text-slate-400 hover:text-white transition-all"
                        >
                          <Download className="w-3 h-3" />
                          Export CSV
                        </button>
                        {/* Table / Chart toggle */}
                        <button
                          onClick={() => setViewMode("table")}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-all ${
                            viewMode === "table"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          <Table className="w-3 h-3" />
                          Table
                        </button>
                        <button
                          onClick={() => setViewMode("chart")}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-all ${
                            viewMode === "chart"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          <BarChart2 className="w-3 h-3" />
                          Chart
                        </button>
                      </div>
                    </div>

                    {/* Chart Type Selector (visible only in chart mode) */}
                    {viewMode === "chart" && (
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                        <span className="text-xs text-slate-500">
                          Chart type:
                        </span>
                        {(
                          ["auto", "bar", "line", "pie", "radar"] as const
                        ).map((type) => (
                          <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={`px-2.5 py-0.5 rounded-md text-xs capitalize transition-all ${
                              chartType === type
                                ? "bg-blue-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      {viewMode === "table" ? (
                        <div className="w-full overflow-hidden rounded-lg">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm table-fixed">
                              <thead>
                                <tr className="bg-slate-800">
                                  {result.columns.map((col) => (
                                    <th
                                      key={col}
                                      className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider truncate"
                                      style={{ minWidth: "120px" }}
                                    >
                                      {col.replace(/_/g, " ")}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {result.data.map((row, i) => (
                                  <tr
                                    key={i}
                                    className={`border-t border-slate-800 ${
                                      i % 2 === 0
                                        ? "bg-slate-900"
                                        : "bg-slate-900/50"
                                    } hover:bg-slate-800/60 transition-colors`}
                                  >
                                    {result.columns.map((col) => (
                                      <td
                                        key={col}
                                        className="px-3 py-2 text-slate-300 truncate"
                                        title={String(row[col])}
                                        style={{ minWidth: "120px" }}
                                      >
                                        {String(row[col])}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2">{renderChart()}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* SQL Block */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowSQL(!showSQL)}
                    className="w-full flex items-center justify-between p-4 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
                  >
                    Generated SQL
                    {showSQL ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {showSQL && (
                    <div className="px-4 pb-4">
                      <pre className="bg-slate-800 rounded-lg p-4 text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap break-words">
                        {result.sql}
                      </pre>
                      <button
                        onClick={handleExplainSQL}
                        disabled={explaining}
                        className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 text-xs transition-all border border-purple-500/30"
                      >
                        {explaining ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        {explaining ? "Explaining..." : "Explain this Query"}
                      </button>
                      {sqlExplanation && (
                        <div className="mt-3 p-3 rounded-lg bg-slate-800 border border-slate-700">
                          <p className="text-xs font-semibold text-slate-400 mb-1">
                            Query Explanation
                          </p>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {sqlExplanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Save Query */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-blue-400" />
                    Save this Query
                  </p>
                  {saveSuccess ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Query saved successfully!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={saveLabel}
                        onChange={(e) => setSaveLabel(e.target.value)}
                        placeholder="Give this query a label..."
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-500"
                      />
                      <Button
                        onClick={handleSave}
                        disabled={saving || !saveLabel.trim()}
                        className="px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}