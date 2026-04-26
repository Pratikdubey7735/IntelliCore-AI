"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Info, AlertTriangle, CheckCircle, X } from "lucide-react"
import { getAnnouncementApi, markAnnouncementReadApi } from "@/lib/api"

export default function NotificationBell() {
  const [ann, setAnn] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const [marking, setMarking] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchAnnouncement = async () => {
    try {
      const data = await getAnnouncementApi()
      // Only store if there is an active message
      if (data?.message) {
        setAnn(data)
      } else {
        setAnn(null)
      }
    } catch {}
  }

  useEffect(() => {
    fetchAnnouncement()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleMarkRead = async () => {
    if (!ann?.id || marking) return
    setMarking(true)
    try {
      await markAnnouncementReadApi(ann.id)
      // After marking read — update state so unread becomes false
      // but keep showing the message so user can still see it
      setAnn((prev: any) => ({ ...prev, unread: false }))
    } catch {
      console.error("Failed to mark as read")
    } finally {
      setMarking(false)
    }
  }

  const iconMap: Record<string, any> = {
    info:    { Icon: Info,          color: "text-blue-500",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
    warning: { Icon: AlertTriangle, color: "text-yellow-500",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20"  },
    success: { Icon: CheckCircle,   color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  }

  const style = iconMap[ann?.type || "info"]
  const Icon = style?.Icon || Info
  const hasUnread = ann?.unread === true

  return (
    <div className="relative" ref={ref}>

      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
      >
        <Bell className={`w-5 h-5 ${hasUnread ? "text-blue-500" : "text-slate-500 dark:text-slate-400"}`} />
        {hasUnread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"
          />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="text-slate-800 dark:text-white font-semibold text-sm">
                  Notifications
                </span>
                {hasUnread && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    1
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {!ann?.message ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">No announcements</p>
                  <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">
                    You are all caught up
                  </p>
                </div>
              ) : (
                <div className={`rounded-xl p-4 border ${style?.bg} ${style?.border}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style?.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs font-semibold uppercase tracking-wide ${style?.color}`}>
                          {ann.type}
                        </p>
                        {!hasUnread && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <CheckCircle className="w-3 h-3" />
                            Read
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {ann.message}
                      </p>

                      {hasUnread && (
                        <button
                          onClick={handleMarkRead}
                          disabled={marking}
                          className={`mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                            style?.bg
                          } ${style?.color} border ${style?.border} hover:opacity-80`}
                        >
                          {marking
                            ? "Marking..."
                            : <><CheckCircle className="w-3 h-3" /> Mark as read</>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}