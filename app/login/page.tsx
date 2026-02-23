"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { loginApi } from "@/lib/api"
import { saveToken, saveUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Animated background particles
const Particle = ({ style }: { style: React.CSSProperties }) => (
  <motion.div
    className="absolute rounded-full"
    style={style}
    animate={{
      y: [0, -30, 0],
      opacity: [0.3, 0.8, 0.3],
    }}
    transition={{
      duration: Math.random() * 4 + 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay: Math.random() * 3,
    }}
  />
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [focused, setFocused] = useState<string | null>(null)
  const [particles, setParticles] = useState<React.CSSProperties[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        width: `${Math.random() * 6 + 2}px`,
        height: `${Math.random() * 6 + 2}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: `rgba(${Math.random() > 0.5 ? "99,179,255" : "147,51,234"}, 0.6)`,
        filter: "blur(1px)",
      }))
    )
  }, [])

  const handleLogin = async () => {
    setError("")
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      const data = await loginApi(email, password)
      saveToken(data.token)
      saveUser({ name: data.name, role: data.role })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #050814 0%, #0a0f2e 50%, #0d0520 100%)" }}>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,179,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,255,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
        style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 60%)", filter: "blur(60px)" }} />

      {/* Particles */}
      {particles.map((style, i) => (
        <Particle key={i} style={style} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 mb-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #7c3aed)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white"
              style={{ fontFamily: "'Sora', 'DM Sans', sans-serif", letterSpacing: "-0.04em" }}>
              Intelli<span style={{ background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>core-AI</span>
            </h1>
          </div>
          <p className="text-sm" style={{ color: "rgba(148,163,184,0.7)", letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif" }}>
            AI POWERED DATA INTELLIGENCE
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="relative"
        >
          {/* Card glow border */}
          <div className="absolute -inset-[1px] rounded-2xl"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(124,58,237,0.2), rgba(59,130,246,0.1))" }} />

          <div className="relative rounded-2xl p-8 backdrop-blur-xl"
            style={{ background: "rgba(10,15,40,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.03em" }}>
                Welcome back
              </h2>
              <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
                Sign in to continue to your workspace
              </p>
            </div>

            <div className="space-y-5">
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "rgba(148,163,184,0.5)" }}>
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: focused === "email" ? "#60a5fa" : "rgba(148,163,184,0.3)", transition: "color 0.2s" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="pl-11 h-12 text-sm border transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: focused === "email" ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.08)",
                      color: "white",
                      borderRadius: "12px",
                      outline: focused === "email" ? "none" : undefined,
                      boxShadow: focused === "email" ? "0 0 0 3px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: "rgba(148,163,184,0.5)" }}>
                    Password
                  </Label>
                  <span className="text-xs cursor-pointer transition-colors"
                    style={{ color: "rgba(96,165,250,0.7)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(96,165,250,0.7)")}>
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: focused === "password" ? "#60a5fa" : "rgba(148,163,184,0.3)", transition: "color 0.2s" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="pl-11 h-12 text-sm border transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: focused === "password" ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.08)",
                      color: "white",
                      borderRadius: "12px",
                      boxShadow: focused === "password" ? "0 0 0 3px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.div whileTap={{ scale: 0.98 }} className="pt-1">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-sm font-semibold text-white relative overflow-hidden transition-all duration-200"
                  style={{
                    background: loading ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)",
                    boxShadow: loading ? "none" : "0 4px 24px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "0.01em"
                  }}
                >
                  {/* Shimmer */}
                  {!loading && (
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
                  )}
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Signing in...
                    </div>
                  ) : "Sign In →"}
                </button>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              <span className="text-xs" style={{ color: "rgba(148,163,184,0.3)" }}>OR</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>

            <p className="text-center text-sm" style={{ color: "rgba(148,163,184,0.5)" }}>
              New to IntelliCore-AI?{" "}
              <span
                onClick={() => router.push("/signup")}
                className="font-semibold cursor-pointer transition-colors"
                style={{ color: "#60a5fa" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
              >
                Create an account
              </span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}