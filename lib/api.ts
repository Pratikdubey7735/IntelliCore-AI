import axios from "axios"
import { getToken } from "./auth"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("intellicore_token")
      localStorage.removeItem("intellicore_user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// Auth
export const loginApi = async (email: string, password: string) => {
  const res = await api.post("/api/auth/login", { email, password })
  return res.data
}

export const signupApi = async (name: string, email: string, password: string) => {
  const res = await api.post("/api/auth/signup", { name, email, password })
  return res.data
}

// Query
export const runQueryApi = async (question: string) => {
  const res = await api.post("/api/query", { question })
  return res.data
}

// History
export const getHistoryApi = async () => {
  const res = await api.get("/api/history")
  return res.data
}

// Saved Queries
export const getSavedApi = async () => {
  const res = await api.get("/api/saved")
  return res.data
}

export const saveQueryApi = async (label: string, question: string, table_used: string, sql_generated: string) => {
  const res = await api.post("/api/saved", { label, question, table_used, sql_generated })
  return res.data
}

export const deleteSavedApi = async (id: number) => {
  const res = await api.delete(`/api/saved/${id}`)
  return res.data
}

// Dashboard
export const getDashboardStatsApi = async () => {
  const res = await api.get("/api/dashboard/stats")
  return res.data
}

// Admin
export const getAllUsersApi = async () => {
  const res = await api.get("/api/admin/users")
  return res.data
}

export const getDataProfileApi = async (tableName: string) => {
  const res = await api.get(`/api/data-profile/${tableName}`)
  return res.data
}

export const explainSQLApi = async (sql: string) => {
  const res = await api.post("/api/explain-sql", { sql })
  return res.data
}

export const getReportApi = async () => {
  const res = await api.get("/api/report")
  return res.data
}