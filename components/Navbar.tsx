"use client"

import { useState, useEffect } from "react"
import ThemeToggle from "@/components/ThemeToggle"

interface NavbarProps {
  title: string
}

export default function Navbar({ title }: NavbarProps) {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("intellicore_user")
    if (stored) setUser(JSON.parse(stored))
  }, [])

  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      <h2 className="text-slate-800 dark:text-white font-semibold text-lg">{title}</h2>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="text-slate-500 dark:text-slate-400 text-sm">Welcome, {user?.name}</span>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  )
}