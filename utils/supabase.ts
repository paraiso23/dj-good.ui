import { createClient } from "@supabase/supabase-js"

// Create a singleton Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Update the VALID_FORMATS constant to exactly match the database constraint case
export const VALID_FORMATS = ["MP3", "FLAC", "WAV", "AIFF", "Vinyl", "Other"] as const

export type ValidFormat = (typeof VALID_FORMATS)[number]

// Track interface that matches the Supabase schema
export interface TrackRecord {
  id: string
  slug?: string
  title: string
  artist_id?: string | null
  duration_sec?: number | null
  bpm?: number | null
  camelot_key?: string | null
  genre_id?: string | null
  energy?: number | null
  moods?: string[] | null
  user_rating?: number | null
  play_count?: number | null
  owned_status?: string | null
  format?: ValidFormat | null
  album?: string | null
  label_id?: string | null
  release_year?: number | null
  file_size_mb?: number | null
  file_created_at?: string | null
  added_at?: string | null
  audio_url?: string | null
  cover_url?: string | null
  comments?: string | null
  metadata?: any | null
  created_at?: string | null
  updated_at?: string | null

  // Client-side only properties (not in DB schema)
  artist?: string // Used for display purposes
  owned?: boolean // Legacy property for backward compatibility
}

// Update the normalizeTrackFormat function to handle case sensitivity correctly
export function normalizeTrackFormat<T extends { format?: string | null }>(track: T): T {
  if (!track.format) {
    return { ...track, format: "Other" }
  }

  // First normalize to uppercase for comparison
  const upperFormat = track.format.trim().toUpperCase()

  // Map of uppercase formats to their correct case as defined in the constraint
  const formatMap: Record<string, ValidFormat> = {
    MP3: "MP3",
    FLAC: "FLAC",
    WAV: "WAV",
    AIFF: "AIFF",
    VINYL: "Vinyl",
    OTHER: "Other",
  }

  // Get the correctly cased format or default to "Other"
  const correctFormat = formatMap[upperFormat] || "Other"

  return { ...track, format: correctFormat }
}

// Update the generateSlug function to ensure uniqueness by adding a timestamp
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .trim()

  // Add a timestamp to ensure uniqueness
  return `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

// Update the saveTrackToSupabase function to handle the case where a slug might already exist
export async function saveTrackToSupabase(track: TrackRecord) {
  if (!supabaseUrl || !supabaseAnonKey) return { success: false, error: "Supabase not configured" }

  try {
    // Normalize and validate the track format
    const normalizedTrack = normalizeTrackFormat(track)

    // Generate a unique slug if one doesn't exist
    const slug = normalizedTrack.slug || generateSlug(normalizedTrack.title)

    // Prepare track data to match the schema
    // We need to ensure we're not sending properties that don't exist in the schema
    const trackToSave = {
      id: normalizedTrack.id,
      slug: slug,
      title: normalizedTrack.title,
      artist: normalizedTrack.artist, // Add the artist field mapping
      artist_id: normalizedTrack.artist_id || null,
      duration_sec: normalizedTrack.duration_sec || null,
      bpm: normalizedTrack.bpm || null,
      camelot_key: normalizedTrack.camelot_key || null,
      genre_id: normalizedTrack.genre_id || null,
      energy: normalizedTrack.energy || null,
      moods: normalizedTrack.moods || null,
      user_rating: normalizedTrack.user_rating || null,
      play_count: normalizedTrack.play_count || null,
      owned_status: normalizedTrack.owned_status || (normalizedTrack.owned ? "owned" : "wanted"),
      format: normalizedTrack.format,
      album: normalizedTrack.album || null,
      label_id: normalizedTrack.label_id || null,
      release_year: normalizedTrack.release_year || null,
      file_size_mb: normalizedTrack.file_size_mb || null,
      file_created_at: normalizedTrack.file_created_at || null,
      added_at: normalizedTrack.added_at || new Date().toISOString().split("T")[0],
      audio_url: normalizedTrack.audio_url || null,
      cover_url: normalizedTrack.cover_url || null,
      comments: normalizedTrack.comments || null,
      metadata: normalizedTrack.metadata || null,
      // Let Supabase handle these timestamps
      // created_at and updated_at are handled by Supabase
    }

    const { error } = await supabase.from("tracks").upsert(trackToSave)

    if (error) {
      // If we get a duplicate key error, try again with a new slug
      if (error.message && error.message.includes("duplicate key value violates unique constraint")) {
        console.log("Duplicate slug detected, generating a new one and retrying...")
        trackToSave.slug = generateSlug(normalizedTrack.title) + `-retry-${Date.now()}`
        const retryResult = await supabase.from("tracks").upsert(trackToSave)

        if (retryResult.error) {
          console.error("Error on retry saving track to Supabase:", retryResult.error)
          return { success: false, error: retryResult.error.message }
        }
        return { success: true }
      }

      console.error("Error saving track to Supabase:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error during Supabase operation:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}

// Function to fetch tracks from Supabase
export async function fetchTracksFromSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return { success: false, data: [], error: "Supabase not configured" }

  try {
    const { data, error } = await supabase.from("tracks").select("*")

    if (error) {
      console.error("Error fetching tracks from Supabase:", error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error("Error during Supabase operation:", error)
    return { success: false, data: [], error: error.message || "Unknown error occurred" }
  }
}

// Function to delete a track from Supabase
export async function deleteTrackFromSupabase(id: string) {
  if (!supabaseUrl || !supabaseAnonKey) return { success: false, error: "Supabase not configured" }

  try {
    const { error } = await supabase.from("tracks").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting track ${id} from Supabase:`, error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error during Supabase operation:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}
