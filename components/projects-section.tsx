"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FolderPlus,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Trash2,
  Save,
  CloudIcon as CloudCheck,
  CloudOff,
} from "lucide-react"
import {
  saveTrackToSupabase,
  fetchTracksFromSupabase,
  deleteTrackFromSupabase,
  type TrackRecord,
} from "@/utils/supabase"
import { v4 as uuidv4 } from "uuid"

// Valid format values that match the database constraint
const VALID_FORMATS = ["MP3", "FLAC", "WAV", "AIFF", "Vinyl", "Other"] as const
type ValidFormat = (typeof VALID_FORMATS)[number]

// Utility function to normalize and validate track format
function normalizeTrackFormat<T extends { format?: string | null }>(track: T): T {
  if (!track.format) {
    return { ...track, format: "Other" }
  }

  // Normalize: trim whitespace and convert to uppercase
  const normalizedFormat = track.format.trim().toUpperCase()

  // Check if the normalized format is in the allowed list
  if (VALID_FORMATS.includes(normalizedFormat as ValidFormat)) {
    return { ...track, format: normalizedFormat }
  }

  // Default to "Other" if format is invalid
  return { ...track, format: "Other" }
}

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export default function ProjectsSection() {
  const [tracks, setTracks] = useState<TrackRecord[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [newTrack, setNewTrack] = useState<Partial<TrackRecord>>({
    title: "",
    artist: "",
    owned_status: "wanted",
    format: "vinyl",
    album: "",
    release_year: new Date().getFullYear(),
    comments: "",
    metadata: {},
  })

  // Function to load tracks from Supabase or localStorage
  useEffect(() => {
    async function loadTracks() {
      setIsLoading(true)
      try {
        // First try to load from localStorage
        const savedTracks = localStorage.getItem("crateTracksData")
        let localTracks: TrackRecord[] = []

        if (savedTracks) {
          localTracks = JSON.parse(savedTracks)
          console.log("Found tracks in localStorage:", localTracks.length)
        }

        // Try to use Supabase if available
        if (supabaseUrl && supabaseAnonKey) {
          try {
            // Try to get tracks from Supabase
            const { success, data, error } = await fetchTracksFromSupabase()

            if (!success) {
              console.error("Error loading tracks from Supabase:", error)
              // Fall back to localStorage data
              if (localTracks.length > 0) {
                setTracks(localTracks)
                setIsLoading(false)
                setIsSynced(false)
                return
              }
            } else if (data && data.length > 0) {
              console.log("Loaded tracks from Supabase:", data.length)

              // Add artist property for display purposes if needed
              const tracksWithArtist = data.map((track) => ({
                ...track,
                artist: track.artist || "Unknown Artist", // This is just for UI display
              }))

              setTracks(tracksWithArtist)
              setIsSynced(true)

              // Update localStorage with the latest data from Supabase
              localStorage.setItem("crateTracksData", JSON.stringify(tracksWithArtist))

              setIsLoading(false)
              return
            } else if (localTracks.length > 0) {
              // If Supabase is empty but we have localStorage data, sync it
              console.log("Syncing localStorage tracks to Supabase...")

              let syncSuccess = true
              for (const track of localTracks) {
                const result = await saveTrackToSupabase(track)
                if (!result.success) {
                  syncSuccess = false
                }
              }

              setTracks(localTracks)
              setIsSynced(syncSuccess)
              setIsLoading(false)
              return
            }
          } catch (supabaseError) {
            console.error("Supabase error:", supabaseError)
            // Fall back to localStorage data
            if (localTracks.length > 0) {
              setTracks(localTracks)
              setIsLoading(false)
              setIsSynced(false)
              return
            }
          }
        } else if (localTracks.length > 0) {
          // If no Supabase but we have localStorage data
          setTracks(localTracks)
          setIsLoading(false)
          setIsSynced(false)
          return
        }

        // If we get here, we have no data from Supabase or localStorage
        // Use mock data as a last resort
        console.log("Using mock data...")
        const mockData: TrackRecord[] = [
          {
            id: uuidv4(),
            slug: "daft-punk-around-the-world",
            title: "Around The World",
            artist: "Daft Punk",
            owned_status: "owned",
            format: "vinyl",
            album: "Homework",
            release_year: 1997,
            bpm: 121,
            camelot_key: "8B",
            comments: "Classic house track",
            added_at: new Date().toISOString().split("T")[0],
          },
          {
            id: uuidv4(),
            slug: "burial-archangel",
            title: "Archangel",
            artist: "Burial",
            owned_status: "wanted",
            format: "digital",
            album: "Untrue",
            release_year: 2007,
            bpm: 140,
            camelot_key: "5A",
            comments: "Atmospheric dubstep classic",
            added_at: new Date().toISOString().split("T")[0],
          },
          {
            id: uuidv4(),
            slug: "aphex-twin-xtal",
            title: "Xtal",
            artist: "Aphex Twin",
            owned_status: "owned",
            format: "vinyl",
            album: "Selected Ambient Works 85-92",
            release_year: 1992,
            bpm: 115,
            camelot_key: "3A",
            comments: "Ambient techno masterpiece",
            added_at: new Date().toISOString().split("T")[0],
          },
        ]

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))
        setTracks(mockData)

        // Save mock data to localStorage
        localStorage.setItem("crateTracksData", JSON.stringify(mockData))

        // Try to save to Supabase if available
        if (supabaseUrl && supabaseAnonKey) {
          let syncSuccess = true
          for (const track of mockData) {
            const result = await saveTrackToSupabase(track)
            if (!result.success) {
              syncSuccess = false
            }
          }
          setIsSynced(syncSuccess)
          console.log("Saved mock data to Supabase")
        }
      } catch (error) {
        console.error("Error loading tracks:", error)
        setIsSynced(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadTracks()

    // Listen for add-to-crate events
    const handleAddToCrate = async (event: any) => {
      const { track } = event.detail
      if (track) {
        setTracks((prevTracks) => {
          // Check if track already exists to avoid duplicates
          const exists = prevTracks.some(
            (t) =>
              t.title.toLowerCase() === track.title.toLowerCase() &&
              t.artist?.toLowerCase() === track.artist?.toLowerCase(),
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

          // Ensure the track has a UUID format ID
          const trackWithId = {
            ...track,
            id: track.id || uuidv4(),
            slug: track.slug || track.title.toLowerCase().replace(/\s+/g, "-"),
          }

          const newTracks = [...prevTracks, trackWithId]
          // Save to localStorage
          localStorage.setItem("crateTracksData", JSON.stringify(newTracks))

          // Save to Supabase if available
          if (supabaseUrl && supabaseAnonKey) {
            saveTrackToSupabase(trackWithId).then(({ success, error }) => {
              if (!success) {
                console.error("Error saving track to Supabase:", error)
                setIsSynced(false)
                // Show error toast
                const errorToast = new CustomEvent("show-toast", {
                  detail: {
                    title: "Sync Error",
                    description: "Failed to sync track to cloud. Will retry later.",
                    variant: "error",
                  },
                })
                document.dispatchEvent(errorToast)
              } else {
                console.log("Saved track to Supabase:", trackWithId)
                setIsSynced(true)
                // Show success toast for Supabase sync
                const successToast = new CustomEvent("show-toast", {
                  detail: {
                    title: "Track Synced",
                    description: `"${track.title}" synced to cloud database`,
                    variant: "success",
                  },
                })
                document.dispatchEvent(successToast)
              }
            })
          }

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

  const updateField = async (id: string, field: keyof TrackRecord, value: any) => {
    const updated = tracks.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    setTracks(updated)

    // Save to localStorage
    localStorage.setItem("crateTracksData", JSON.stringify(updated))

    // Get the updated track
    const updatedTrack = updated.find((t) => t.id === id)

    // Save to Supabase if available
    if (supabaseUrl && supabaseAnonKey && updatedTrack) {
      const { success, error } = await saveTrackToSupabase(updatedTrack)

      if (!success) {
        console.error(`Error updating track ${id} in Supabase:`, error)
        setIsSynced(false)
      } else {
        console.log(`Updated track ${id}, field ${field} to ${value} in Supabase`)
        setIsSynced(true)
      }
    }
  }

  // Update the addTrack function to ensure format is properly normalized
  const addTrack = async () => {
    const id = uuidv4() // Generate a UUID for the new track
    const timestamp = Date.now()

    // Create the track with basic properties
    let trackToAdd: TrackRecord = {
      id,
      slug: `${newTrack.title?.toLowerCase().replace(/\s+/g, "-") || id}-${timestamp}`,
      title: newTrack.title || "",
      artist: newTrack.artist || "",
      owned_status: newTrack.owned_status || "wanted",
      format: newTrack.format || "Vinyl", // Default to Vinyl with correct case
      album: newTrack.album || "",
      release_year: newTrack.release_year,
      comments: newTrack.comments || "",
      added_at: new Date().toISOString().split("T")[0],
      bpm: newTrack.bpm,
      camelot_key: newTrack.camelot_key,
    }

    // Normalize the track format before adding to state
    trackToAdd = normalizeTrackFormat(trackToAdd)

    const updatedTracks = [...tracks, trackToAdd]
    setTracks(updatedTracks)

    // Save to localStorage
    localStorage.setItem("crateTracksData", JSON.stringify(updatedTracks))

    // Save to Supabase if available
    if (supabaseUrl && supabaseAnonKey) {
      const { success, error } = await saveTrackToSupabase(trackToAdd)

      if (!success) {
        console.error("Error adding track to Supabase:", error)
        setIsSynced(false)
      } else {
        console.log("Added track to Supabase:", trackToAdd)
        setIsSynced(true)
      }
    }

    setNewTrack({
      title: "",
      artist: "",
      owned_status: "wanted",
      format: "Vinyl", // Use correct case
      album: "",
      release_year: new Date().getFullYear(),
      comments: "",
    })
    setShowAddForm(false)
  }

  const deleteTrack = async (id: string) => {
    const updatedTracks = tracks.filter((t) => t.id !== id)
    setTracks(updatedTracks)

    // Save to localStorage
    localStorage.setItem("crateTracksData", JSON.stringify(updatedTracks))

    if (openId === id) setOpenId(null)

    // Delete from Supabase if available
    if (supabaseUrl && supabaseAnonKey) {
      const { success, error } = await deleteTrackFromSupabase(id)

      if (!success) {
        console.error(`Error deleting track ${id} from Supabase:`, error)
        setIsSynced(false)
        // Show error toast
        const errorToast = new CustomEvent("show-toast", {
          detail: {
            title: "Sync Error",
            description: "Failed to delete track from cloud. Will retry later.",
            variant: "error",
          },
        })
        document.dispatchEvent(errorToast)
      } else {
        console.log(`Deleted track ${id} from Supabase`)
        setIsSynced(true)
        // Show success toast
        const successToast = new CustomEvent("show-toast", {
          detail: {
            title: "Track Deleted",
            description: "Track removed from your crate and cloud database",
            variant: "success",
          },
        })
        document.dispatchEvent(successToast)
      }
    }
  }

  // Function to manually sync with Supabase
  const syncWithSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      const errorToast = new CustomEvent("show-toast", {
        detail: {
          title: "Sync Error",
          description: "Supabase connection not configured",
          variant: "error",
        },
      })
      document.dispatchEvent(errorToast)
      return
    }

    setIsLoading(true)

    try {
      let syncSuccess = true
      for (const track of tracks) {
        const result = await saveTrackToSupabase(track)
        if (!result.success) {
          syncSuccess = false
        }
      }

      setIsSynced(syncSuccess)

      const toastEvent = new CustomEvent("show-toast", {
        detail: {
          title: syncSuccess ? "Sync Complete" : "Sync Partial",
          description: syncSuccess
            ? "All tracks synced to cloud database"
            : "Some tracks failed to sync. Try again later.",
          variant: syncSuccess ? "success" : "warning",
        },
      })
      document.dispatchEvent(toastEvent)
    } catch (error) {
      console.error("Error syncing with Supabase:", error)
      setIsSynced(false)

      const errorToast = new CustomEvent("show-toast", {
        detail: {
          title: "Sync Failed",
          description: "Could not sync tracks to cloud database",
          variant: "error",
        },
      })
      document.dispatchEvent(errorToast)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTracks = tracks.filter(
    (track) =>
      track.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (track.comments && track.comments.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="bg-chat-bg rounded-xl p-4 md:p-6 h-full overflow-y-auto scrollbar-hide pb-20">
      <motion.div
        className="flex items-center justify-between mb-4 md:mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-xl md:text-2xl font-semibold">Crate</h2>
          {supabaseUrl && supabaseAnonKey && (
            <div className="flex items-center">
              {isSynced ? (
                <CloudCheck size={16} className="text-green-500 ml-2" />
              ) : (
                <CloudOff size={16} className="text-yellow-500 ml-2" />
              )}
              <button
                onClick={syncWithSupabase}
                className="text-xs ml-1 text-neutral-400 hover:text-white"
                disabled={isLoading}
              >
                {isLoading ? "Syncing..." : isSynced ? "Synced" : "Sync now"}
              </button>
            </div>
          )}
        </div>
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
          placeholder="Search by artist, title, album or comments..."
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
                <label className="block text-sm text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newTrack.title || ""}
                  onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Track title"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Artist</label>
                <input
                  type="text"
                  value={newTrack.artist || ""}
                  onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Artist name"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Format</label>
                <select
                  value={newTrack.format || "Vinyl"}
                  onChange={(e) => setNewTrack({ ...newTrack, format: e.target.value as any })}
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {VALID_FORMATS.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Status</label>
                <select
                  value={newTrack.owned_status || "wanted"}
                  onChange={(e) => setNewTrack({ ...newTrack, owned_status: e.target.value })}
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
                  value={newTrack.album || ""}
                  onChange={(e) => setNewTrack({ ...newTrack, album: e.target.value })}
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Album name"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">BPM</label>
                <input
                  type="number"
                  value={newTrack.bpm || ""}
                  onChange={(e) => setNewTrack({ ...newTrack, bpm: Number(e.target.value) || undefined })}
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="BPM"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Year</label>
                <input
                  type="number"
                  value={newTrack.release_year || ""}
                  onChange={(e) => setNewTrack({ ...newTrack, release_year: Number(e.target.value) || undefined })}
                  className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Year"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-neutral-400 mb-1">Comments</label>
              <textarea
                value={newTrack.comments || ""}
                onChange={(e) => setNewTrack({ ...newTrack, comments: e.target.value })}
                className="w-full bg-neutral-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add any notes about this track"
                rows={2}
              />
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
                disabled={!newTrack.title || !newTrack.artist}
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
                    value={track.owned_status || "wanted"}
                    onChange={(e) => updateField(track.id, "owned_status", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-neutral-700 text-sm text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="owned">Owned</option>
                    <option value="wanted">Wanted</option>
                  </select>
                  <select
                    value={track.format || "vinyl"}
                    onChange={(e) => updateField(track.id, "format", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-neutral-700 text-sm text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {VALID_FORMATS.map((format) => (
                      <option key={format} value={format}>
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(
                        `https://www.google.com/search?q=${encodeURIComponent(`${track.artist} ${track.title}`)}`,
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
                      <div className="flex items-center gap-2">
                        <label className="w-24 text-sm text-neutral-400">Album:</label>
                        <input
                          type="text"
                          value={track.album || ""}
                          onChange={(e) => updateField(track.id, "album", e.target.value)}
                          className="flex-1 bg-neutral-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-24 text-sm text-neutral-400">Year:</label>
                        <input
                          type="number"
                          value={track.release_year || ""}
                          onChange={(e) => updateField(track.id, "release_year", Number(e.target.value) || undefined)}
                          className="flex-1 bg-neutral-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-24 text-sm text-neutral-400">BPM:</label>
                        <input
                          type="number"
                          value={track.bpm || ""}
                          onChange={(e) => updateField(track.id, "bpm", Number(e.target.value) || undefined)}
                          className="flex-1 bg-neutral-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-24 text-sm text-neutral-400">Key:</label>
                        <input
                          type="text"
                          value={track.camelot_key || ""}
                          onChange={(e) => updateField(track.id, "camelot_key", e.target.value)}
                          className="flex-1 bg-neutral-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <label className="w-24 text-sm text-neutral-400">Comments:</label>
                        <textarea
                          value={track.comments || ""}
                          onChange={(e) => updateField(track.id, "comments", e.target.value)}
                          className="flex-1 bg-neutral-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                          rows={2}
                        />
                      </div>
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
