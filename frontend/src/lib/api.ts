import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

// ── Types ────────────────────────────────────────────────────────
export interface Language { id: number; name: string }
export interface Category { id: number; name: string }

export interface Book {
  id: number
  title: string
  language_id: number
  category_id: number
  language: string
  category: string
  is_issued: boolean
  created_at?: string
}

export interface Issuance {
  id: number
  book_id: number
  book_title: string
  book_language: string
  book_category: string
  student_name: string
  student_class: string
  roll_no: string
  issue_date: string
  due_date: string
  returned_at?: string | null
  days_remaining?: number
  progress_pct?: number
  progress_color?: 'green' | 'yellow' | 'orange' | 'red'
  created_at?: string
}

export interface DashboardStats {
  total_books: number
  issued_books: number
  available_books: number
  overdue_books: number
  urgent_issuances: Issuance[]
}

// ── Books ────────────────────────────────────────────────────────
export const fetchBooks = (params?: Record<string, string | boolean | number>) =>
  api.get<Book[]>('/api/books/', { params }).then(r => r.data)

export const createBook = (data: { title: string; language_id: number; category_id: number }) =>
  api.post<Book>('/api/books/', data).then(r => r.data)

export const updateBook = (id: number, data: Partial<{ title: string; language_id: number; category_id: number }>) =>
  api.patch<Book>(`/api/books/${id}`, data).then(r => r.data)

export const deleteBook = (id: number) =>
  api.delete(`/api/books/${id}`)

// ── Categories ──────────────────────────────────────────────────
export const fetchLanguages = () =>
  api.get<Language[]>('/api/categories/languages').then(r => r.data)

export const createLanguage = (name: string) =>
  api.post<Language>('/api/categories/languages', { name }).then(r => r.data)

export const deleteLanguage = (id: number) =>
  api.delete(`/api/categories/languages/${id}`)

export const fetchCategories = () =>
  api.get<Category[]>('/api/categories/').then(r => r.data)

export const createCategory = (name: string) =>
  api.post<Category>('/api/categories/', { name }).then(r => r.data)

export const deleteCategory = (id: number) =>
  api.delete(`/api/categories/${id}`)

// ── Issuances ────────────────────────────────────────────────────
export const fetchIssuances = (params?: Record<string, string | boolean>) =>
  api.get<Issuance[]>('/api/issuances/', { params }).then(r => r.data)

export const createIssuance = (data: {
  book_id: number
  student_name: string
  student_class: string
  roll_no: string
  issue_date: string
  due_date: string
}) => api.post<Issuance>('/api/issuances/', data).then(r => r.data)

export const returnBook = (id: number) =>
  api.patch<Issuance>(`/api/issuances/${id}/return`).then(r => r.data)

export const deleteIssuance = (id: number) =>
  api.delete(`/api/issuances/${id}`)

// ── Dashboard ────────────────────────────────────────────────────
export const fetchDashboardStats = () =>
  api.get<DashboardStats>('/api/dashboard/stats').then(r => r.data)
