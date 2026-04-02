"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import { getDashboardStatsApi } from "@/lib/api"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import {
  MessageSquare, Calendar, Bookmark, Database
} from "lucide-react"

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4"]
const INTENT_COLORS: Record<string, string> = {
  ranking: "#3b82f6",
  aggregation: "#8b5cf6",
  filtering: "#06b6d4",
  comparison: "#f59e0b",
  lookup: "#10b981",
  unknown: "#6b7280"
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStatsApi()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats ? [
    {
      title: "Total Queries",
      value: stats.total_queries,
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Queries Today",
      value: stats.queries_today,
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Saved Queries",
      value: stats.saved_queries,
      icon: Bookmark,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10"
    },
    {
      title: "Top Table",
      value: stats.most_queried_table,
      icon: Database,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
  ] : []

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Dashboard" />

      <div className="p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))
            : statCards.map((card, i) => {
                const Icon = card.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4"
                  >
                    <div className={`${card.bg} p-3 rounded-lg`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{card.title}</p>
                      <p className="text-slate-800 dark:text-white text-2xl font-bold capitalize">{card.value}</p>
                    </div>
                  </motion.div>
                )
              })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Table Distribution Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-slate-800 dark:text-white font-semibold mb-4">Queries by Table</h3>
            {stats?.table_distribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.table_distribution}>
                  <XAxis dataKey="table" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                No query data yet. Start asking questions!
              </div>
            )}
          </motion.div>

          {/* Intent Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-slate-400 dark:text-white font-semibold mb-4">Query Intent Distribution</h3>
            {stats?.intent_distribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.intent_distribution}
                    dataKey="count"
                    nameKey="intent"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {stats.intent_distribution.map((entry: any, index: number) => (
                      <Cell
                        key={index}
                        fill={INTENT_COLORS[entry.intent] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  {/* <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                  /> */}
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                No intent data yet. Start asking questions!
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Queries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-slate-800 dark:text-white font-semibold mb-4">Recent Queries</h3>
          {stats?.recent_queries?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400 font-medium">Question</th>
                    <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400 font-medium">Table</th>
                    <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400 font-medium">Intent</th>
                    <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400 font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_queries.map((q: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{q.question}</td>
                      <td className="py-3 px-3">
                        <span className="capitalize px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">{q.table_used}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="capitalize px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-500">{q.intent}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`capitalize px-2 py-1 rounded-full text-xs ${q.status === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{q.time_taken_ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-slate-400 text-sm">
              No queries yet. Go to the Query page to get started!
            </div>
          )}
        </motion.div>

      </div>
    </div>
  )
}