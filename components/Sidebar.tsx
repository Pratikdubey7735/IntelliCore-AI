"use client"

import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { logout } from "@/lib/auth"
import {
  LayoutDashboard,
  Search,
  History,
  Bookmark,
  Users,
  LogOut,
  Database,
  GitBranch,
  MessageCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Query", href: "/dashboard/query", icon: Search },
  { label: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  { label: "Data Explorer", href: "/dashboard/explorer", icon: Database },
  { label: "Schema Graph", href: "/dashboard/schema", icon: GitBranch },
  { label: "Report", href: "/dashboard/report", icon: FileText },
  { label: "History", href: "/dashboard/history", icon: History },
  { label: "Saved", href: "/dashboard/saved", icon: Bookmark },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("intellicore_user")
    if (stored) setUser(JSON.parse(stored))
  }, [])

  // Auto collapse when route changes
  useEffect(() => {
    setCollapsed(true)
  }, [pathname])

  const handleNav = (href: string) => {
    router.push(href)
    setCollapsed(true)
  }

  return (
    <motion.div
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col relative shrink-0"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center z-10 shadow-md"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />
        }
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-hidden">
        <Database className="text-blue-500 w-6 h-6 shrink-0" />
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-lg font-bold text-slate-800 dark:text-white whitespace-nowrap">
              Intelli<span className="text-blue-500">Core-AI</span>
            </h1>
            <p className="text-slate-400 text-xs">AI Data Intelligence</p>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={collapsed ? item.label : ""}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          )
        })}

        {user?.role === "admin" && (
          <button
            onClick={() => handleNav("/dashboard/admin")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === "/dashboard/admin"
                ? "bg-blue-600 text-white"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
            title={collapsed ? "Admin" : ""}
          >
            <Users className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Admin
              </motion.span>
            )}
          </button>
        )}
      </nav>

      {/* User + Logout */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800">
        <div className={`flex items-center gap-3 mb-2 px-2 overflow-hidden ${collapsed ? "justify-center" : ""}`}>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-slate-800 dark:text-white text-sm font-medium whitespace-nowrap">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </motion.div>
          )}
        </div>
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </motion.div>
  )
}