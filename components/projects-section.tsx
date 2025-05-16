"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FolderPlus, ChevronDown, ChevronUp, Search, Plus, Trash2, Save } from "lucide-react"

export interface TrackRecord {
  id: string
  artist: string
  title: string
  owned: boolean
  format: "vinyl" | "mp3" | "flac" | "wav/aiff" | "other"
  metadata: {
    album?: string
    trackNumber?: number
    year?: number
    genre?: string
    bpm?: number
    key?: string
    comment?: string
  }
}

export default function ProjectsSection() {
  const [tracks, setTracks] = useState<TrackRecord[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTrack, setNewTrack] = useState<Omit<TrackRecord, "id">>({
    artist: "",
    title: "",
    owned: true,
    format: "vinyl",
    metadata: {
      album: "",
      genre: "",
      year: undefined,
      bpm: undefined,
      key: "",
      comment: "",
    },
  })

  // Mock function to simulate Supabase fetch
  useEffect(() => {
    async function loadTracks() {
      setIsLoading(true)
      try {
        // First try to load from localStorage
        const savedTracks = localStorage.getItem("crateTracksData")

        if (savedTracks) {
          setTracks(JSON.parse(savedTracks))
          setIsLoading(false)
          console.log("Loaded tracks from localStorage")
        } else {
          // If no localStorage data, use mock data
          // In a real app, this would be a Supabase query
          // const { data } = await supabase
          //   .from<TrackRecord>('tracks')
          //   .select('*')
          //   .order('artist', { ascending: true })

          // For demo purposes, we'll use mock data
          const mockData: TrackRecord[] = [
            {
              id: "1",
              artist: "Daft Punk",
              title: "Around The World",
              owned: true,
              format: "vinyl",
              metadata: {
                album: "Homework",
                year: 1997,
                genre: "Electronic",
                bpm: 121,
                key: "F Minor",
              },
            },
            {
              id: "2",
              artist: "Burial",
              title: "Archangel",
              owned: false,
              format: "flac",
              metadata: {
                album: "Untrue",
                year: 2007,
                genre: "Dubstep",
                bpm: 140,
                key: "D Minor",
              },
            },
            {
              id: "3",
              artist: "Aphex Twin",
              title: "Xtal",
              owned: true,
              format: "vinyl",
              metadata: {
                album: "Selected Ambient Works 85-92",
                year: 1992,
                genre: "Ambient Techno",
                bpm: 115,
                key: "C Major",
              },
            },
          ]

          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 800))
          setTracks(mockData)
        }
      } catch (error) {
        console.error("Error loading tracks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTracks()

    // Listen for add-to-crate events
    const handleAddToCrate = (event: any) => {
      const { track } = event.detail
      if (track) {
        setTracks((prevTracks) => {
          // Check if track already exists to avoid duplicates
          const exists = prevTracks.some(
            (t) =>
              t.artist.toLowerCase() === track.artist.toLowerCase() &&
              t.title.toLowerCase() === track.title.toLowerCase(),
          )

          if (exists) {
            // Show toast notification for duplicate
            const toastEvent = new CustomEvent("show-toast", {
              detail: {
                title: "Track Already Exists",
                description: `"${track.title}" by ${track.artist} is already in your crate`,
                variant: "warning",
              },
            })
            document.dispatchEvent(toastEvent)
            return prevTracks
          }

          const newTracks = [...prevTracks, track]
          // Save to localStorage
          localStorage.setItem("crateTracksData", JSON.stringify(newTracks))
          return newTracks
        })
      }
    }

    document.addEventListener("add-to-crate", handleAddToCrate)

    return () => {
      document.removeEventListener("add-to-crate", handleAddToCrate)
    }
  }, [])

  const toggle = (id: string) => setOpenId(openId === id ? null : id)

  const updateField = async (id: string, field: keyof TrackRecord["metadata"], value: any) => {
    const updated = tracks.map((t) => (t.id === id ? { ...t, metadata: { ...t.metadata, [field]: value } } : t))
    setTracks(updated)
    // Save to localStorage
    localStorage.setItem("crateTracksData", JSON.stringify(updated))

    // In a real app, this would update Supabase
    // await supabase
    //   .from('tracks')
    //   .update({ metadata: updated.find(t => t.id === id)?.metadata })
    //   .eq('id', id)

    console.log(`Updated track ${id}, field ${field} to ${value}`)
  }

  const updateTrackField = async (id: string, field: keyof Omit<TrackRecord, "id" | "metadata">, value: any) => {
    const updated = tracks.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    setTracks(updated)
    // Save to localStorage
    localStorage.setItem("crateTracksData", JSON.stringify(updated))

    // In a real app, this would update Supabase
    // await supabase
    //   .from('tracks')
    //   .update({ [field]: value })
    //   .eq('id', id)

    console.log(`Updated track ${id}, field ${field} to ${value}`)
  }

  const addTrack = () => {
    const id = Date.now().toString() // In a real app, this would be a UUID
    const trackToAdd = {
      id,
      ...newTrack,
    }

    const updatedTracks = [...tracks, trackToAdd]
    setTracks(updatedTracks)
    // Save to localStorage
    localStorage.setItem("crateTracksData", JSON.stringify(updatedTracks))

    setNewTrack({
      artist: "",
      title: "",
      owned: true,
      format: "vinyl",
      metadata: {
        album: "",
        genre: "",
        year: undefined,
        bpm: undefined,
        key: "",
        comment: "",
      },
    })
    setShowAddForm(false)

    // In a real app, this would insert to Supabase
    // await supabase.from('tracks').insert(trackToAdd)
  }

  const deleteTrack = (id: string) => {
    const updatedTracks = tracks.filter((t) => t.id !== id)
    setTracks(updatedTracks)
    // Save to localStorage
    localStorage.setItem("crateTracksData", JSON.stringify(updatedTracks))

    if (openId === id) setOpenId(null)

    // In a real app, this would delete from Supabase
    // await supabase.from('tracks').delete().eq('id', id)
  }

  const filteredTracks = tracks.filter(
    (track) =>
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.metadata.album && track.metadata.album.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (track.metadata.genre && track.metadata.genre.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="bg-chat-bg rounded-xl p-4 md:p-6 h-full overflow-y-auto scrollbar-hide pb-20">
      <motion.div
        className="flex items-center justify-between mb-4 md:mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl md:text-2xl font-semibold">Crate</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">Add Track</span>
          </button>
        </div>
      </motion.div>

      {/* Search bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-neutral-500" />
        </div>
        <input
          type="text"
          className="w-full py-2 pl-10 pr-4 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-600 text-sm"
          placeholder="Search by artist, title, album or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Add track form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 bg-neutral-800 rounded-lg p-4 border border-neutral-700"
          >
            <h3 className="text-lg font-medium mb-3">Add New Track</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Artist</label>
                <input
                  type="text"
                  value={newTrack.artist}
                  onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Artist name"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newTrack.title}
                  onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Track title"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Format</label>
                <select
                  value={newTrack.format}
                  onChange={(e) => setNewTrack({ ...newTrack, format: e.target.value as TrackRecord["format"] })}
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="vinyl">Vinyl</option>
                  <option value="mp3">MP3</option>
                  <option value="flac">FLAC</option>
                  <option value="wav/aiff">WAV/AIFF</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Status</label>
                <select
                  value={newTrack.owned ? "owned" : "wanted"}
                  onChange={(e) => setNewTrack({ ...newTrack, owned: e.target.value === "owned" })}
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="owned">Owned</option>
                  <option value="wanted">Wanted</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Album</label>
                <input
                  type="text"
                  value={newTrack.metadata.album || ""}
                  onChange={(e) =>
                    setNewTrack({
                      ...newTrack,
                      metadata: { ...newTrack.metadata, album: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Album name"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Genre</label>
                <input
                  type="text"
                  value={newTrack.metadata.genre || ""}
                  onChange={(e) =>
                    setNewTrack({
                      ...newTrack,
                      metadata: { ...newTrack.metadata, genre: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Genre"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Year</label>
                <input
                  type="number"
                  value={newTrack.metadata.year || ""}
                  onChange={(e) =>
                    setNewTrack({
                      ...newTrack,
                      metadata: { ...newTrack.metadata, year: Number.parseInt(e.target.value) || undefined },
                    })
                  }
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Year"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm text-neutral-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTrack}
                disabled={!newTrack.artist || !newTrack.title}
                className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Save size={16} />
                Save Track
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredTracks.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center h-64 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {searchQuery ? (
            <>
              <div className="w-16 h-16 bg-neutral-800 rounded-full mb-4 flex items-center justify-center">
                <Search size={24} className="text-neutral-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Matching Tracks</h3>
              <p className="text-neutral-400 max-w-sm">
                No tracks match your search query. Try a different search or add a new track.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-neutral-800 rounded-full mb-4 flex items-center justify-center">
                <FolderPlus size={24} className="text-neutral-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Your Crate is Empty</h3>
              <p className="text-neutral-400 max-w-sm">
                Start building your collection by adding tracks to your crate.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Your First Track
              </button>
            </>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredTracks.map((track) => (
            <motion.div
              key={track.id}
              className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => toggle(track.id)}>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr_1fr] gap-2 md:gap-4 items-center">
                  <span className="font-medium text-white">{track.artist}</span>
                  <span className="text-neutral-300">{track.title}</span>
                  <select
                    value={track.owned ? "owned" : "wanted"}
                    onChange={(e) => updateTrackField(track.id, "owned", e.target.value === "owned")}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-neutral-700 text-sm text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="owned">Owned</option>
                    <option value="wanted">Wanted</option>
                  </select>
                  <select
                    value={track.format}
                    onChange={(e) => updateTrackField(track.id, "format", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-neutral-700 text-sm text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="vinyl">Vinyl</option>
                    <option value="mp3">MP3</option>
                    <option value="flac">FLAC</option>
                    <option value="wav/aiff">WAV/AIFF</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-center ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(
                        `https://www.google.com/search?q=${encodeURIComponent(track.artist + " " + track.title)}`,
                        "_blank",
                      )
                    }}
                    className="p-2 text-neutral-400 hover:text-white transition-colors"
                    aria-label="Search on Google"
                  >
                    <Search size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteTrack(track.id)
                    }}
                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                    aria-label="Delete track"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="p-2 text-neutral-400" aria-label="Expand details">
                    {openId === track.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Accordion content */}
              <AnimatePresence initial={false}>
                {openId === track.id && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-neutral-900/40 p-3 space-y-2"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(track.metadata).map(([field, value]) => (
                        <div key={field} className="flex items-center gap-2">
                          <label className="w-24 text-sm text-neutral-400 capitalize">{field}:</label>
                          <input
                            type={field === "year" || field === "bpm" || field === "trackNumber" ? "number" : "text"}
                            value={value !== undefined ? value : ""}
                            onChange={(e) => {
                              const val =
                                field === "year" || field === "bpm" || field === "trackNumber"
                                  ? Number.parseInt(e.target.value) || undefined
                                  : e.target.value
                              updateField(track.id, field as keyof TrackRecord["metadata"], val)
                            }}
                            className="flex-1 bg-neutral-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
