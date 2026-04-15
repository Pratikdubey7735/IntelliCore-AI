"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { getAllUsersApi } from "@/lib/api"
import { Shield, Users, Database, MessageSquare } from "lucide-react"
import { getUser } from "@/lib/auth"
import axios from "axios"
import { getToken } from "@/lib/auth"

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (user?.role !== "admin") {
      router.push("/dashboard")
      return
    }
    getAllUsersApi()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRoleToggle = async (userId: number) => {
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

  const totalQueries = users.reduce((sum, u) => sum + u.query_count, 0)

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Admin Panel" />
      <div className="p-6 space-y-6">

        {/* Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: users.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Total Queries", value: totalQueries, icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Admin Users", value: users.filter(u => u.role === "admin").length, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
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

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-slate-800 dark:text-white font-semibold">All Users</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Queries</th>
                    <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Joined</th>
                    {/* <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">Action</th> */}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`capitalize px-2 py-1 rounded-full text-xs ${user.role === "admin" ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{user.query_count}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      {/* <td className="py-3 px-4">
                        <button
                          onClick={() => handleRoleToggle(user.id)}
                          disabled={updating === user.id}
                          className={`px-3 py-1 rounded-lg text-xs transition-all ${
                            user.role === "admin"
                              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                          }`}
                        >
                          {updating === user.id ? "Updating..." : user.role === "admin" ? "Deactivate" : "Activate"}
                        </button>
                      </td> */}
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