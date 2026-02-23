export interface User {
  id: number
  name: string
  email: string
  role: string
}

export interface AuthResponse {
  token: string
  name: string
  role: string
}

export interface QueryStep {
  step: string
  status: string
  result?: any
}

export interface QueryResult {
  success: boolean
  question: string
  answer: string
  steps: QueryStep[]
  sql: string | null
  data: Record<string, any>[]
  columns: string[]
  row_count: number
  intent: string
  table_used: string
  time_taken_ms: number
}

export interface QueryLog {
  id: number
  question: string
  intent: string
  table_used: string
  sql_generated: string
  result_count: number
  time_taken_ms: number
  status: string
  created_at: string
}

export interface SavedQuery {
  id: number
  label: string
  question: string
  table_used: string
  sql_generated: string
  created_at: string
}

export interface StatCard {
  title: string
  value: string | number
  icon: string
  color: string
}

export interface DashboardStats {
  total_queries: number
  queries_today: number
  saved_queries: number
  most_queried_table: string
}