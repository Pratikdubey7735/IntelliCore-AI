"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { getAllUsersApi, setAnnouncementApi, clearAnnouncementApi, banUserApi } from "@/lib/api"
import { Shield, Users, MessageSquare, Send, X, Info, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { getUser, getToken } from "@/lib/auth"
import axios from "axios"

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState("")
  const [announcementType, setAnnouncementType] = useState("info")
  const [sending, setSending] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const router = useRouter()

  const fetchUsers = () => {
    getAllUsersApi()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const user = getUser()
    if (user?.role !== "admin") {
      router.push("/dashboard")
      return
    }
    fetchUsers()
  }, [])

  const handleRoleToggle = async (userId: number, currentRole: string) => {
    setUpdating(userId)
    try {
      await axios.put(
        `http://localhost:8000/api/admin/users/${userId}/role`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      )
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, role: u.role === "admin" ? "user" : "admin" }
          : u
      ))
    } catch {
      console.error("Failed to update role")
    } finally {
      setUpdating(null)
    }
  }

  const handleBan = async (userId: number, isActive: boolean) => {
    setUpdating(userId)
    try {
      await banUserApi(userId, !isActive)
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_active: !isActive } : u
      ))
    } catch {
      console.error("Failed to ban/unban user")
    } finally {
      setUpdating(null)
    }
  }

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return
    setSending(true)
    try {
      await setAnnouncementApi(announcement, announcementType)
      setSuccessMsg("Announcement broadcasted to all users!")
      setAnnouncement("")
      setTimeout(() => setSuccessMsg(""), 3000)
    } catch {
      console.error("Failed to send announcement")
    } finally {
      setSending(false)
    }
  }

  const handleClearAnnouncement = async () => {
    try {
      await clearAnnouncementApi()
      setSuccessMsg("Announcement cleared!")
      setTimeout(() => setSuccessMsg(""), 3000)
    } catch {
      console.error("Failed to clear announcement")
    }
  }

  const totalQueries = users.reduce((sum, u) => sum + (u.query_count || 0), 0)

  const typeColors: Record<string, string> = {
    info:    "bg-blue-600 text-white",
    warning: "bg-yellow-500 text-white",
    success: "bg-emerald-500 text-white",
  }

  const typeInactive = "bg-slate-100 dark:bg-slate-800 text-slate-500"

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Admin Panel" />
      <div className="p-6 space-y-6">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Users",   value: users.length,                                  icon: Users,         color: "text-blue-500",   bg: "bg-blue-500/10"   },
            { label: "Total Queries", value: totalQueries,                                  icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Admin Users",   value: users.filter(u => u.role === "admin").length,  icon: Shield,        color: "text-emerald-500",bg: "bg-emerald-500/10"},
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
                  <p className="text-slate-800 dark:text-white text-2xl font-bold">{card.value}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Broadcast Announcement ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-4 h-4 text-blue-500" />
            <h3 className="text-slate-800 dark:text-white font-semibold">Broadcast Announcement</h3>
          </div>

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm"
            >
              {successMsg}
            </motion.div>
          )}

          <textarea
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
            placeholder="Type your announcement message for all users..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 text-sm resize-none transition-all"
          />

          <div className="flex items-center gap-3 mt-3">
            {/* Type selector */}
            <div className="flex gap-2">
              {[
                { key: "info",    icon: Info,          label: "Info"    },
                { key: "warning", icon: AlertTriangle,  label: "Warning" },
                { key: "success", icon: CheckCircle,    label: "Success" },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setAnnouncementType(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    announcementType === key ? typeColors[key] : typeInactive
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleClearAnnouncement}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-400/20 text-red-400 hover:bg-red-500/10 text-sm transition-all"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
              <button
                onClick={handleSendAnnouncement}
                disabled={sending || !announcement.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-all"
              >
                {sending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Send className="w-3.5 h-3.5" />
                }
                {sending ? "Sending..." : "Broadcast"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Users Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-slate-800 dark:text-white font-semibold">All Users</h3>
            <span className="text-xs text-slate-400">{users.length} total</span>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading users...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    {["Name", "Email", "Role", "Status", "Queries", "Joined", "Actions"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{user.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{user.email}</td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active !== false
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {user.is_active !== false ? "Active" : "Banned"}
                        </span>
                      </td>

                      {/* Queries */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{user.query_count}</td>

                      {/* Joined */}
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {/* Role toggle */}
                          <button
                            onClick={() => handleRoleToggle(user.id, user.role)}
                            disabled={updating === user.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                              user.role === "admin"
                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                            }`}
                          >
                            {updating === user.id
                              ? "..."
                              : user.role === "admin" ? "Demote" : "Make Admin"
                            }
                          </button>

                          {/* Ban toggle */}
                          <button
                            onClick={() => handleBan(user.id, user.is_active !== false)}
                            disabled={updating === user.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                              user.is_active !== false
                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                            }`}
                          >
                            {updating === user.id
                              ? "..."
                              : user.is_active !== false ? "Ban" : "Unban"
                            }
                          </button>
                        </div>
                      </td>
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