"use client"

import type React from "react"
import { useSearchHistory, type HistoryEntry } from "../hooks/useSearchHistory"
import { Clock } from "lucide-react"

export const SearchHistory: React.FC<{
  onSelect: (entry: HistoryEntry) => void
}> = ({ onSelect }) => {
  const { history, clearHistory } = useSearchHistory()

  if (history.length === 0) return null

  return (
    <div className="mt-4 p-4 bg-neutral-800 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Search History</h4>
        <button onClick={clearHistory} className="text-xs text-neutral-400 hover:text-white transition-colors">
          Clear
        </button>
      </div>
      <ul className="space-y-2 max-h-48 overflow-auto scrollbar-hide">
        {history.map((entry, i) => (
          <li
            key={i}
            className="flex items-center justify-between p-2 hover:bg-neutral-700 rounded cursor-pointer transition-colors"
            onClick={() => onSelect(entry)}
          >
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-neutral-400" />
              <span className="text-sm truncate max-w-[180px]">
                {
                  entry.mode === "text"
                    ? entry.value.slice(0, 30) + (entry.value.length > 30 ? "…" : "")
                    : entry.mode === "url"
                      ? entry.value
                      : entry.value /* nombre de fichero */
                }
              </span>
            </div>
            <span className="text-xs text-neutral-500">{new Date(entry.timestamp).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
