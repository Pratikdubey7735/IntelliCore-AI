import { User } from "@/types"

export const saveToken = (token: string) => {
  localStorage.setItem("intellicore_token", token)
  document.cookie = `intellicore_token=${token}; path=/; max-age=86400`
}

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("intellicore_token")
}

export const removeToken = () => {
  localStorage.removeItem("intellicore_token")
  localStorage.removeItem("intellicore_user")
  document.cookie = "intellicore_token=; path=/; max-age=0"
}

export const saveUser = (user: { name: string; role: string }) => {
  localStorage.setItem("intellicore_user", JSON.stringify(user))
}

export const getUser = (): { name: string; role: string } | null => {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("intellicore_user")
  return user ? JSON.parse(user) : null
}

export const isAuthenticated = (): boolean => {
  const token = getToken()
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export const isAdmin = (): boolean => {
  const user = getUser()
  return user?.role === "admin"
}

export const logout = () => {
  removeToken()
  window.location.href = "/login"
}

