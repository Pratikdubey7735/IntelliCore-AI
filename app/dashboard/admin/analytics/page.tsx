"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import { getSystemAnalyticsApi } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { Users, Database, Activity, Clock, TrendingUp, AlertTriangle, Zap, Star } from "lucide-react"

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"]

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSystemAnalyticsApi()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex flex-col h-full">
      <Navbar title="System Analytics" />
      <div className="p-6 grid grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    </div>
  )

  const successRate = data
    ? Math.round((data.success_count / (data.success_count + data.failure_count)) * 100) || 0
    : 0

  const statCards = [
    { label: "Total Users", value: data?.total_users, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "New Users Today", value: data?.users_today, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Queries", value: data?.total_queries, icon: Database, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Queries Today", value: data?.queries_today, icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Success Rate", value: `${successRate}%`, icon: Star, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Avg Response", value: `${data?.avg_response_ms}ms`, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Peak Hour", value: data?.peak_hour, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Failed Queries", value: data?.failure_count, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ]

  return (
    <div className="flex flex-col h-full">
      <Navbar title="System Analytics" />
      <div className="p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4"
              >
                <div className={`${card.bg} p-3 rounded-lg shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{card.label}</p>
                  <p className={`${card.color} text-xl font-bold`}>{card.value}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 text-xs mb-1">Most Active User</p>
            <p className="text-slate-800 dark:text-white font-bold text-lg">
              {data?.most_active_user?.name || "N/A"}
            </p>
            <p className="text-blue-500 text-sm">{data?.most_active_user?.count} queries</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 text-xs mb-1">Most Queried Table</p>
            <p className="text-slate-800 dark:text-white font-bold text-lg capitalize">
              {data?.most_queried_table?.table || "N/A"}
            </p>
            <p className="text-purple-500 text-sm">{data?.most_queried_table?.count} queries</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Queries per day */}
          <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-3">Queries Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data?.queries_per_day}>
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* By table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-3">Queries by Table</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data?.queries_by_table} dataKey="count" nameKey="table"
                  cx="50%" cy="50%" outerRadius={70}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {data?.queries_by_table?.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* By intent */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-3">Queries by Intent</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data?.queries_by_intent} layout="vertical">
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                <YAxis dataKey="intent" type="category" tick={{ fill: "#94a3b8", fontSize: 9 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Slowest Queries */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm">Slowest Queries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {["Question", "Table", "Time (ms)"].map(h => (
                    <th key={h} className="text-left py-3 px-5 text-slate-500 text-xs font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.slowest_queries?.map((q: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-5 text-slate-700 dark:text-slate-300">{q.question}</td>
                    <td className="py-3 px-5"><span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500 capitalize">{q.table}</span></td>
                    <td className="py-3 px-5 text-amber-500 font-semibold">{q.ms}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}