"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { getReportApi } from "@/lib/api";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import {
  FileText,
  Loader2,
  Download,
  Trophy,
  Users,
  Activity,
} from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];

export default function ReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await getReportApi();
      setReport(data);
      setGenerated(true);
    } catch {
      console.error("Report generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Automated Report" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-slate-800 dark:text-white font-bold text-xl">
                Intellicore AI — Data Intelligence Report
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Automatically generated analysis across Student, Cricket and
                Employee datasets
              </p>
            </div>
            <div className="flex gap-3">
              {generated && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-sm"
                >
                  <Download className="w-4 h-4" />
                  Print / Save PDF
                </button>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all text-sm font-medium"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                {loading
                  ? "Generating..."
                  : generated
                    ? "Regenerate"
                    : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                />
              ))}
          </div>
        )}

        {/* Report Content */}
        {report && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Section 1 — Student */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded" />
                <h3 className="text-slate-800 dark:text-white font-bold text-lg">
                  Student Performance Analysis
                </h3>
                <span className="text-slate-400 text-sm">
                  ({report.student_total} students)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Subject Averages */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
                >
                  <h4 className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-3">
                    Average Marks by Subject
                  </h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={report.subject_averages}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                      />
                      <Radar
                        dataKey="avg"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        stroke="#3b82f6"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: "#1e293b",
                        }}
                        labelStyle={{ color: "#1e293b" }}
                        itemStyle={{ color: "#1e293b" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Top Python Students */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
                >
                  <h4 className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-3">
                    Top 3 Python Performers
                  </h4>
                  <div className="space-y-3">
                    {report.top_python_students.map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            i === 0
                              ? "bg-yellow-500"
                              : i === 1
                                ? "bg-slate-400"
                                : "bg-amber-600"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                            {s.name}
                          </p>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${s.marks}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-blue-500 font-bold text-sm">
                          {s.marks}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Subject Averages Bar */}
                  <div className="mt-4">
                    <h4 className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-3">
                      Subject-wise Averages
                    </h4>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={report.subject_averages}>
                        <XAxis
                          dataKey="subject"
                          tick={{ fill: "#94a3b8", fontSize: 9 }}
                        />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            color: "#1e293b",
                          }}
                          labelStyle={{ color: "#1e293b" }}
                          itemStyle={{ color: "#1e293b" }}
                        />
                        <Bar
                          dataKey="avg"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Section 2 — Cricket */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-emerald-500 rounded" />
                <h3 className="text-slate-800 dark:text-white font-bold text-lg">
                  Cricket Performance Analysis
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Run Scorers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
                >
                  <h4 className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Top 5 Run Scorers
                  </h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={report.top_run_scorers} layout="vertical">
                      <XAxis
                        type="number"
                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                      />
                      <YAxis
                        dataKey="player"
                        type="category"
                        tick={{ fill: "#94a3b8", fontSize: 9 }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: "#1e293b",
                        }}
                        labelStyle={{ color: "#1e293b" }}
                        itemStyle={{ color: "#1e293b" }}
                      />
                      <Bar dataKey="runs" radius={[0, 4, 4, 0]}>
                        {report.top_run_scorers.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Top Century Scorers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
                >
                  <h4 className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                    Top 5 Century Scorers
                  </h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={report.top_century_scorers}
                      layout="vertical"
                    >
                      <XAxis
                        type="number"
                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                      />
                      <YAxis
                        dataKey="player"
                        type="category"
                        tick={{ fill: "#94a3b8", fontSize: 9 }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: "#1e293b",
                        }}
                        labelStyle={{ color: "#1e293b" }}
                        itemStyle={{ color: "#1e293b" }}
                      />
                      <Bar dataKey="hundreds" radius={[0, 4, 4, 0]}>
                        {report.top_century_scorers.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </div>

            {/* Section 3 — Employee */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-purple-500 rounded" />
                <h3 className="text-slate-800 dark:text-white font-bold text-lg">
                  Employee HR Analysis
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Avg Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4"
                >
                  <h4 className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    Key Averages
                  </h4>
                  {[
                    {
                      label: "Avg Monthly Salary",
                      value: `₹${report.employee_averages.avg_salary}`,
                      color: "text-purple-500",
                    },
                    {
                      label: "Avg Experience",
                      value: `${report.employee_averages.avg_experience} yrs`,
                      color: "text-blue-500",
                    },
                    {
                      label: "Avg Performance",
                      value: `${report.employee_averages.avg_performance} / 5`,
                      color: "text-emerald-500",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3"
                    >
                      <p className="text-slate-400 text-xs">{item.label}</p>
                      <p className={`${item.color} font-bold text-lg`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </motion.div>

                {/* Department Salaries */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
                >
                  <h4 className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    Salary by Department
                  </h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={report.dept_salaries}>
                      <XAxis
                        dataKey="department"
                        tick={{ fill: "#94a3b8", fontSize: 8 }}
                      />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: "#1e293b",
                        }}
                        labelStyle={{ color: "#1e293b" }}
                        itemStyle={{ color: "#1e293b" }}
                      />
                      <Bar
                        dataKey="avg_salary"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Education Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
                >
                  <h4 className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-3">
                    Education Distribution
                  </h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={report.education_distribution}
                        dataKey="count"
                        nameKey="education"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {report.education_distribution.map(
                          (_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ),
                        )}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: "#1e293b",
                        }}
                        labelStyle={{ color: "#1e293b" }}
                        itemStyle={{ color: "#1e293b" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-400 text-xs">
                Generated by Intellicore AI • {new Date().toLocaleString()} •
              </p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!generated && !loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-slate-800 dark:text-white font-semibold text-lg">
              Ready to Generate
            </h3>
            <p className="text-slate-400 text-sm text-center max-w-md">
              Click Generate Report to automatically analyze all 3 datasets and
              create a comprehensive intelligence report with charts and
              insights.
            </p>
            <button
              onClick={handleGenerate}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
            >
              Generate Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
