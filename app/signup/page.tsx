"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signupApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Particle = ({ style }: { style: React.CSSProperties }) => (
  <motion.div
    className="absolute rounded-full"
    style={style}
    animate={{ y: [0, -25, 0], opacity: [0.2, 0.7, 0.2] }}
    transition={{
      duration: Math.random() * 4 + 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay: Math.random() * 3,
    }}
  />
);

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        width: `${Math.random() * 6 + 2}px`,
        height: `${Math.random() * 6 + 2}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: `rgba(${Math.random() > 0.5 ? "99,179,255" : "167,139,250"}, 0.5)`,
        filter: "blur(1px)",
      })),
    );
  }, []);

  const handleSignup = async () => {
    setError("");
    setSuccess("");
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signupApi(name, email, password);
      setSuccess("Account created! Redirecting you to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = (field: string) => ({
    background: "rgba(255,255,255,0.03)",
    borderColor:
      focused === field ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.08)",
    color: "white",
    borderRadius: "12px",
    boxShadow:
      focused === field
        ? "0 0 0 3px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)"
        : "inset 0 1px 0 rgba(255,255,255,0.05)",
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, #050814 0%, #0a0f2e 50%, #0d0520 100%)",
      }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,179,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,255,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Orbs */}
      <div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/3 -left-32 w-96 h-96 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

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
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1
              className="text-3xl font-black tracking-tight text-white"
              style={{
                fontFamily: "'Sora', 'DM Sans', sans-serif",
                letterSpacing: "-0.04em",
              }}
            >
              Intelli
              <span
                style={{
                  background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Core-AI
              </span>
            </h1>
          </div>
          <p
            className="text-sm"
            style={{ color: "rgba(148,163,184,0.7)", letterSpacing: "0.08em" }}
          >
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
          <div
            className="absolute -inset-[1px] rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(59,130,246,0.2), rgba(124,58,237,0.1))",
            }}
          />

          <div
            className="relative rounded-2xl p-8 backdrop-blur-xl"
            style={{
              background: "rgba(10,15,40,0.85)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="mb-8">
              <h2
                className="text-2xl font-bold text-white mb-1"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  letterSpacing: "-0.03em",
                }}
              >
                Create your account
              </h2>
              <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
                Join thousands of teams using IntelliCore-AI
              </p>
            </div>

            <div className="space-y-5">
              {/* Alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#fca5a5",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 8v4M12 16h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.2)",
                      color: "#86efac",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <polyline
                        points="22,4 12,14.01 9,11.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name */}
              <div className="space-y-2">
                <Label
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  Full Name
                </Label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                    style={{
                      color:
                        focused === "name"
                          ? "#60a5fa"
                          : "rgba(148,163,184,0.3)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <Input
                    type="text"
                    placeholder="User Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    className="pl-11 h-12 text-sm border transition-all duration-200"
                    style={fieldStyle("name")}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  Email Address
                </Label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                    style={{
                      color:
                        focused === "email"
                          ? "#60a5fa"
                          : "rgba(148,163,184,0.3)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <polyline
                        points="22,6 12,13 2,6"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    className="pl-11 h-12 text-sm border transition-all duration-200"
                    style={fieldStyle("email")}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  Password
                </Label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                    style={{
                      color:
                        focused === "password"
                          ? "#60a5fa"
                          : "rgba(148,163,184,0.3)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M7 11V7a5 5 0 0 1 10 0v4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <Input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="pl-11 h-12 text-sm border transition-all duration-200"
                    style={fieldStyle("password")}
                  />
                </div>
                {/* Password strength hint */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-1.5 mt-2"
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            password.length >= i * 3
                              ? i <= 1
                                ? "#ef4444"
                                : i <= 2
                                  ? "#f97316"
                                  : i <= 3
                                    ? "#eab308"
                                    : "#22c55e"
                              : "rgba(255,255,255,0.08)",
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Submit */}
              <motion.div whileTap={{ scale: 0.98 }} className="pt-1">
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-sm font-semibold text-white relative overflow-hidden transition-all duration-200"
                  style={{
                    background: loading
                      ? "rgba(124,58,237,0.5)"
                      : "linear-gradient(135deg, #6d28d9 0%, #3b82f6 100%)",
                    boxShadow: loading
                      ? "none"
                      : "0 4px 24px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "0.01em",
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Creating account...
                    </div>
                  ) : (
                    "Create Account →"
                  )}
                </button>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <span
                className="text-xs"
                style={{ color: "rgba(148,163,184,0.3)" }}
              >
                OR
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </div>

            <p
              className="text-center text-sm"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                className="font-semibold cursor-pointer"
                style={{ color: "#a78bfa" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#a78bfa")}
              >
                Sign in
              </span>
            </p>
          </div>
        </motion.div>

        <motion.p
          className="text-center mt-6 text-xs"
          style={{ color: "rgba(148,163,184,0.25)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          By creating an account, you agree to our Terms of Service
        </motion.p>
      </motion.div>
    </div>
  );
}
