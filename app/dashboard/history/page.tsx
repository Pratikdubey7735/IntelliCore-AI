"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import { getHistoryApi } from "@/lib/api"

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistoryApi()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Query History" />
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
        >
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No query history yet. Start asking questions!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Question</th>
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Table</th>
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Intent</th>
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Rows</th>
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Time</th>
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">{row.question}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">{row.table_used}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-500">{row.intent}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{row.result_count}</td>
                      <td className="py-3 px-4">
                        <span className={`capitalize px-2 py-1 rounded-full text-xs ${row.status === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{row.time_taken_ms}ms</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">{new Date(row.created_at).toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}