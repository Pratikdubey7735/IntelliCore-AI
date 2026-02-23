"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { getSavedApi, deleteSavedApi } from "@/lib/api"
import { Trash2, Play, Database } from "lucide-react"

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getSavedApi()
      .then(setSaved)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await deleteSavedApi(id)
      setSaved(prev => prev.filter(q => q.id !== id))
    } catch {
      console.error("Delete failed")
    }
  }

  const handleRunAgain = (question: string) => {
    router.push(`/dashboard/query?q=${encodeURIComponent(question)}`)
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Saved Queries" />
      <div className="p-6">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading saved queries...</div>
        ) : saved.length === 0 ? (
          <div className="text-center text-slate-400 py-8">No saved queries yet. Save a query from the Query page!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {saved.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{q.label}</h3>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{q.question}</p>

                <div className="flex items-center gap-2">
                  <Database className="w-3 h-3 text-blue-500" />
                  <span className="capitalize text-xs text-blue-500">{q.table_used}</span>
                </div>

                <div className="text-xs text-slate-400">
                  {new Date(q.created_at).toLocaleString()}
                </div>

                <button
                  onClick={() => handleRunAgain(q.question)}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-all"
                >
                  <Play className="w-3 h-3" />
                  Run Again
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}