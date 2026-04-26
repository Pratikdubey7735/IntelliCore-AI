"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import { getQueryMonitorApi, getFailedQueriesApi } from "@/lib/api"
import { Activity, AlertTriangle, RefreshCw } from "lucide-react"

export default function QueryMonitorPage() {
  const [queries, setQueries] = useState<any[]>([])
  const [failed, setFailed] = useState<any[]>([])
  const [tab, setTab] = useState<"all" | "failed">("all")
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [allQ, failedQ] = await Promise.all([
        getQueryMonitorApi(),
        getFailedQueriesApi()
      ])
      setQueries(allQ)
      setFailed(failedQ)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const displayData = tab === "all" ? queries : failed

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Query Monitor" />
      <div className="p-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setTab("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Activity className="w-4 h-4" />
              All Queries ({queries.length})
            </button>
            <button
              onClick={() => setTab("failed")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "failed"
                  ? "bg-red-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Failed ({failed.length})
            </button>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm hover:border-blue-500 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {tab === "all"
                    ? ["#", "User", "Question", "Table", "Intent", "Status", "Time", "Date"].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-slate-500 text-xs font-medium whitespace-nowrap">{h}</th>
                      ))
                    : ["#", "User", "Question", "Table", "Date"].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-slate-500 text-xs font-medium whitespace-nowrap">{h}</th>
                      ))
                  }
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                      {Array(tab === "all" ? 8 : 5).fill(0).map((_, j) => (
                        <td key={j} className="py-3 px-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : displayData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      {tab === "failed" ? "No failed queries found." : "No queries found."}
                    </td>
                  </tr>
                ) : displayData.map((q: any, i: number) => (
                  <motion.tr
                    key={q.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4 text-slate-400 text-xs">{q.id}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{q.user}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={q.question}>{q.question}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500 capitalize whitespace-nowrap">{q.table || "—"}</span>
                    </td>
                    {tab === "all" && (
                      <>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-500 capitalize whitespace-nowrap">{q.intent || "—"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            q.status === "success"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-amber-500 font-semibold whitespace-nowrap">{q.time_ms}ms</td>
                      </>
                    )}
                    <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(q.created_at).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}