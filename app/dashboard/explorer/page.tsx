"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import { getDataProfileApi } from "@/lib/api"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from "recharts"
import { Database, Hash, Type, TrendingUp } from "lucide-react"

const TABLES = ["student", "cricket", "employee"]
const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"]

export default function ExplorerPage() {
  const [activeTable, setActiveTable] = useState("student")
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setProfile(null)
    getDataProfileApi(activeTable)
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [activeTable])

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Data Explorer" />
      <div className="p-6 space-y-6">

        {/* Table Selector */}
        <div className="flex gap-3">
          {TABLES.map(t => (
            <button
              key={t}
              onClick={() => setActiveTable(t)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTable === t
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-500"
              }`}
            >
              <Database className="w-4 h-4" />
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : profile ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Rows", value: profile.row_count, icon: Hash, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Total Columns", value: profile.column_count, icon: Database, color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Table Name", value: profile.table, icon: Type, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              ].map((card, i) => {
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
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{card.label}</p>
                      <p className="text-slate-800 dark:text-white text-xl font-bold capitalize">{card.value}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Column Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.profile.map((col: any, i: number) => (
                <motion.div
                  key={col.column}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-800 dark:text-white font-semibold text-sm capitalize">
                      {col.column.replace(/_/g, " ")}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      col.min !== undefined
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-purple-500/10 text-purple-500"
                    }`}>
                      {col.min !== undefined ? "Numeric" : "Text"}
                    </span>
                  </div>

                  {/* Numeric Column */}
                  {col.min !== undefined ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Min", value: col.min },
                          { label: "Max", value: col.max },
                          { label: "Avg", value: col.avg },
                        ].map(stat => (
                          <div key={stat.label} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                            <p className="text-slate-400 text-xs">{stat.label}</p>
                            <p className="text-slate-800 dark:text-white font-semibold text-sm">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Text Column - Top Values Chart */
                    col.top_values && col.top_values.length > 0 ? (
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={col.top_values} layout="vertical">
                          <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                          <YAxis
                            dataKey="value"
                            type="category"
                            tick={{ fill: "#94a3b8", fontSize: 10 }}
                            width={80}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "none",
                              borderRadius: "8px",
                              color: "#f8fafc"
                            }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {col.top_values.map((_: any, idx: number) => (
                              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-slate-400 text-xs">No data available</p>
                    )
                  )}
                </motion.div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}