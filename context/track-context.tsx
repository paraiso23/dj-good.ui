"use client"

import { createContext, useState, useContext, type ReactNode } from "react"

interface Track {
  title: string
  artist: string
}

interface TrackContextType {
  tracks: Track[]
  addTrack: (track: Track) => void
  removeTrack: (index: number) => void
  clearTracks: () => void
}

export const TrackContext = createContext<TrackContextType>({
  tracks: [],
  addTrack: () => {},
  removeTrack: () => {},
  clearTracks: () => {},
})

export function TrackProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([])

  const addTrack = (track: Track) => {
    setTracks((prevTracks) => [...prevTracks, track])
  }

  const removeTrack = (index: number) => {
    setTracks((prevTracks) => prevTracks.filter((_, i) => i !== index))
  }

  const clearTracks = () => {
    setTracks([])
  }

  return (
    <TrackContext.Provider value={{ tracks, addTrack, removeTrack, clearTracks }}>{children}</TrackContext.Provider>
  )
}

export const useTrackContext = () => useContext(TrackContext)
