"use client"

import { useState, useEffect } from "react"

export type HistoryEntry = {
  mode: "text" | "url" | "file"
  value: string
  timestamp: string
}

const STORAGE_KEY = "trackGrabberHistory"

export function useSearchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  // Carga inicial desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Añade una nueva entrada al historial
  const addHistory = (mode: HistoryEntry["mode"], value: string) => {
    const entry: HistoryEntry = {
      mode,
      value,
      timestamp: new Date().toISOString(),
    }
    const newHistory = [entry, ...history.filter((e) => e.value !== value)]
    setHistory(newHistory)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
  }

  // Limpia todo el historial
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return { history, addHistory, clearHistory }
}
