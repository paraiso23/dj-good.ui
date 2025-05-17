"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Bot, Search, Youtube, Plus } from "lucide-react"
import { useState } from "react"
import { useSearchHistory, type HistoryEntry } from "../hooks/useSearchHistory"
import { v4 as uuidv4 } from "uuid"

export default function ModulesTab({
  selectedModule,
  setSelectedModule,
}: {
  selectedModule: string
  setSelectedModule: (id: string) => void
}) {
  // Mock data for parsed tracks - in a real app, this would come from a parsing function
  const [parsedTracks, setParsedTracks] = useState<Array<{ title: string; artist: string }>>([])

  // TrackGrabber states
  const [mode, setMode] = useState<"image" | "text" | "url" | "file">("image")
  const [inputText, setInputText] = useState("")
  const [inputURL, setInputURL] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Add these state variables after the other useState declarations
  const [showHistory, setShowHistory] = useState(false)
  const { history, addHistory, clearHistory } = useSearchHistory()

  // Mock implementation of useWebhook hook
  const useWebhook = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [response, setResponse] = useState<string>("")

    const callWebhook = async (url: string, payload: any) => {
      setIsLoading(true)
      try {
        // Use the specified webhook URL
        const webhookUrl = "https://primary-production-24fb.up.railway.app/webhook/djbot2"
        console.log("Calling webhook:", webhookUrl)

        // Determine content type based on payload type
        const headers: HeadersInit = {}
        if (!(payload instanceof FormData)) {
          headers["Content-Type"] = "application/json"
        }

        // Make the fetch request without AbortController for now
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers,
          body: payload instanceof FormData ? payload : JSON.stringify(payload),
        })

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }

        // Check content type to determine how to handle the response
        const contentType = res.headers.get("content-type") || ""
        let responseData

        if (contentType.includes("application/json")) {
          try {
            // If it's JSON, parse it directly
            responseData = await res.json()
            // Convert back to string for consistency with the rest of the code
            const text = JSON.stringify(responseData)
            setResponse(text)
            console.log("Webhook responded successfully with JSON")
            return text
          } catch (error) {
            console.error("Error parsing JSON response:", error)
            // Fall back to text response
            responseData = await res.text()
          }
        } else {
          // Handle as text for other content types
          responseData = await res.text()
        }

        setResponse(responseData)
        console.log("Webhook responded successfully")
        return responseData
      } catch (err: any) {
        console.error(`Webhook error: ${err.message}`)
        return ""
      } finally {
        setIsLoading(false)
      }
    }

    return { isLoading, response, callWebhook }
  }

  // Use the hook in the component
  const { isLoading, callWebhook } = useWebhook()

  // Function for parsing tracks
  const handleParse = async () => {
    let responseText = ""

    // Add this at the beginning of the handleParse function
    if (mode === "image" && imageFile) {
      // Send FormData with the image file
      const form = new FormData()
      form.append("image", imageFile)
      responseText = await callWebhook("/api/parseTrack", form)
      // Add to search history
      addHistory("image", imageFile.name)
    }

    if (mode === "text") {
      if (!inputText.trim()) return
      responseText = await callWebhook("/api/parseTrack", { text: inputText })
      // Add to search history
      addHistory("text", inputText)
    }

    if (mode === "url") {
      if (!inputURL.trim()) return
      responseText = await callWebhook("/api/parseTrack", { url: inputURL })
      // Add to search history
      addHistory("url", inputURL)
    }

    if (mode === "file" && file) {
      // Send FormData with the file
      const form = new FormData()
      form.append("file", file)
      responseText = await callWebhook("/api/parseTrack", form)
      // Add to search history
      addHistory("file", file.name)
    }

    // Try to parse the complex nested JSON response
    try {
      // Check if response is empty or invalid
      if (!responseText || responseText.trim() === "") {
        console.error("Empty response received from webhook")
        // Show error toast
        const errorToast = new CustomEvent("show-toast", {
          detail: {
            title: "Parsing Error",
            description: "Received empty response from server",
            variant: "error",
          },
        })
        document.dispatchEvent(errorToast)
        return
      }

      console.log("Raw response:", responseText)

      // Try to parse the JSON with better error handling
      let outerData
      try {
        outerData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        console.log("Invalid JSON response:", responseText)
        // Show error toast
        const errorToast = new CustomEvent("show-toast", {
          detail: {
            title: "Parsing Error",
            description: "Could not parse server response",
            variant: "error",
          },
        })
        document.dispatchEvent(errorToast)
        return
      }

      console.log("Parsed outer data:", outerData)

      if (Array.isArray(outerData) && outerData.length > 0 && outerData[0].output) {
        const outputContent = outerData[0].output
        console.log("Output content type:", typeof outputContent)

        // Handle the output content based on its type
        let innerData
        if (typeof outputContent === "string") {
          // If it's a string, try to parse it as JSON
          try {
            innerData = JSON.parse(outputContent)
            console.log("Parsed inner data:", innerData)
          } catch (err) {
            console.error("Error parsing inner JSON:", err)
            console.log("Inner content:", outputContent)
            return
          }
        } else {
          // If it's already an object, use it directly
          innerData = outputContent
          console.log("Inner data (already parsed):", innerData)
        }

        // Extract tracks from the parsed data
        let tracks = []

        // Based on the console log, the tracklist is directly in the innerData object
        if (innerData && innerData.tracklist && Array.isArray(innerData.tracklist)) {
          tracks = innerData.tracklist.map((item) => ({
            title: item.track.title,
            artist: item.artist.name,
          }))
          console.log("Extracted tracks from tracklist:", tracks)
        } else {
          console.warn("Could not find tracklist in the response")
        }

        if (tracks.length > 0) {
          console.log("Setting parsed tracks:", tracks)
          setParsedTracks(tracks)
        } else {
          console.warn("No tracks found in the response")
        }
      } else {
        console.warn("Unexpected outer data structure:", outerData)
      }
    } catch (err) {
      console.error("Error parsing response:", err)
      console.warn("Raw response:", responseText)
    }
  }

  // Handle selecting an entry from search history
  const handleSelectHistory = (entry: HistoryEntry) => {
    setMode(entry.mode)
    if (entry.mode === "text") setInputText(entry.value)
    if (entry.mode === "url") setInputURL(entry.value)
    // For file mode, we can't restore the file object directly
    // We could show a message to re-upload the file
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        setImageFile(file)
        // Show preview
      } else {
        // Show error toast
        const errorToast = new CustomEvent("show-toast", {
          detail: {
            title: "Invalid File",
            description: "Please upload an image file",
            variant: "error",
          },
        })
        document.dispatchEvent(errorToast)
      }
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0])
    }
  }

  // Update the addTrack function to add the track to the crate
  const addTrack = (track) => {
    console.log("Adding track to crate:", track)
    const timestamp = Date.now()

    // Create a track object in the format expected by the crate and Supabase
    const crateTrack = {
      id: uuidv4(), // Generate a UUID for the track
      slug: `${track.title.toLowerCase().replace(/\s+/g, "-")}-${timestamp}-${Math.floor(Math.random() * 1000)}`,
      title: track.title || "",
      artist: track.artist || "",
      owned_status: "wanted", // Default to "wanted" status
      format: "vinyl", // Default format - using a valid format from our constraint
      album: "",
      release_year: new Date().getFullYear(), // Current year as default
      comments: `Added from Track Grabber on ${new Date().toLocaleDateString()}`,
      added_at: new Date().toISOString().split("T")[0],
    }

    // Dispatch a custom event to add the track to the crate
    const addToCrateEvent = new CustomEvent("add-to-crate", {
      detail: { track: crateTrack },
    })
    document.dispatchEvent(addToCrateEvent)

    // Show a toast notification
    const toastEvent = new CustomEvent("show-toast", {
      detail: {
        title: "Track Added",
        description: `"${track.title}" by ${track.artist} added to your crate`,
        variant: "success",
      },
    })
    document.dispatchEvent(toastEvent)
  }

  // Function to add all tracks to crate
  const addAllTracks = () => {
    if (parsedTracks.length === 0) return

    // Add each track to the crate
    parsedTracks.forEach((track) => {
      addTrack(track)
    })

    // Show a toast notification
    const toastEvent = new CustomEvent("show-toast", {
      detail: {
        title: "Tracks Added",
        description: `${parsedTracks.length} tracks added to your crate and synced to cloud`,
        variant: "success",
      },
    })
    document.dispatchEvent(toastEvent)
  }

  return (
    <div className="bg-chat-bg rounded-xl flex flex-col h-full overflow-hidden">
      {/* Disabled header section
<div className="p-4 flex-shrink-0">
  <motion.div
    className="flex items-center justify-between mb-4"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <h2 className="text-lg font-medium">Modules</h2>
  </motion.div>
</div>
*/}

      <div className="flex-grow overflow-y-auto scrollbar-hide">
        <div className="p-4 h-full">
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-medium">Track Grabber</h3>

            {/* Mode selector with History button */}
            <div className="flex space-x-2">
              {(["image", "text", "url", "file"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    mode === m ? "bg-primary text-white" : "bg-neutral-800 hover:bg-neutral-700"
                  }`}
                >
                  {m === "text" ? "Text" : m === "url" ? "URL" : m === "file" ? "File" : "Image"}
                </button>
              ))}

              {/* History dropdown button */}
              <div className="relative">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    showHistory ? "bg-primary text-white" : "bg-neutral-800 hover:bg-neutral-700"
                  }`}
                >
                  History
                </button>

                {/* Simple dropdown history */}
                {showHistory && history.length > 0 && (
                  <div className="absolute top-full right-0 mt-1 w-64 bg-neutral-800 rounded-lg shadow-lg z-10 p-2 max-h-48 overflow-y-auto scrollbar-hide">
                    {history.map((entry, i) => (
                      <button
                        key={i}
                        className="w-full text-left p-2 text-xs hover:bg-neutral-700 rounded transition-colors flex items-center"
                        onClick={() => {
                          handleSelectHistory(entry)
                          setShowHistory(false)
                        }}
                      >
                        <span className="truncate flex-1">
                          {entry.mode === "text"
                            ? entry.value.slice(0, 20) + (entry.value.length > 20 ? "..." : "")
                            : entry.value}
                        </span>
                        <span className="text-neutral-500 text-[10px] ml-2">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                    <div className="border-t border-neutral-700 mt-1 pt-1">
                      <button
                        className="w-full text-center text-xs text-neutral-500 hover:text-white p-1"
                        onClick={() => {
                          clearHistory()
                          setShowHistory(false)
                        }}
                      >
                        Clear History
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input según modo */}
            {mode === "text" && (
              <textarea
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-600 text-sm"
                rows={4}
                placeholder="Paste your track list here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            )}
            {mode === "url" && (
              <input
                type="url"
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-600 text-sm"
                placeholder="https://example.com/my-playlist.txt"
                value={inputURL}
                onChange={(e) => setInputURL(e.target.value)}
              />
            )}
            {mode === "image" && (
              <div
                className={`w-full p-6 bg-neutral-800 border-2 border-dashed ${
                  isDragging ? "border-primary bg-neutral-700/30" : "border-neutral-700"
                } rounded-lg transition-colors flex flex-col items-center justify-center cursor-pointer`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("imageInput")?.click()}
              >
                <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

                {imageFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 mb-3 relative">
                      <img
                        src={URL.createObjectURL(imageFile) || "/placeholder.svg"}
                        alt="Track image"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        className="absolute -top-2 -right-2 bg-neutral-900 rounded-full p-1 hover:bg-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setImageFile(null)
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-neutral-300">{imageFile.name}</span>
                  </div>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-neutral-400 mb-3"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p className="text-neutral-300 text-center mb-1">Drag & drop an image here</p>
                    <p className="text-neutral-500 text-xs text-center">or click to browse</p>
                  </>
                )}
              </div>
            )}
            {mode === "file" && (
              <div className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                <input
                  type="file"
                  accept=".txt,.csv"
                  className="text-sm text-neutral-300"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>
            )}

            {/* Botón de parse */}
            <button
              onClick={handleParse}
              disabled={isLoading}
              className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/90 transition-colors text-white text-sm font-medium"
            >
              {isLoading ? "Parsing..." : "Parse Tracks"}
            </button>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium">Parsed Tracks</h3>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-xs rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                onClick={() => {
                  addAllTracks()
                  // Dispatch a custom event to navigate to the crate section
                  document.dispatchEvent(
                    new CustomEvent("navigate-to-section", {
                      detail: { section: "projects" },
                    }),
                  )
                }}
                disabled={parsedTracks.length === 0}
              >
                Add All to Crate
              </button>
              <button
                className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                onClick={() => setParsedTracks([])}
                disabled={parsedTracks.length === 0}
              >
                Clear
              </button>
            </div>
          </div>

          {parsedTracks.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto w-16 h-16 bg-neutral-800 rounded-full mb-4 flex items-center justify-center">
                <Bot size={24} className="text-neutral-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Tracks Parsed</h3>
              <p className="text-neutral-400 max-w-sm mx-auto mb-6">
                Upload or paste your track list to see parsed tracks here.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-y-auto max-h-[calc(100%-40px)]">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-chat-bg">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm font-medium text-neutral-400">Artist</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-neutral-400">Title</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <motion.tbody
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                >
                  {parsedTracks.map((track, index) => (
                    <motion.tr
                      key={index}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 12 } },
                      }}
                      className="border-t border-neutral-800"
                    >
                      <td className="py-3 px-3 text-sm text-neutral-400">{track.artist}</td>
                      <td className="py-3 px-3 text-sm">{track.title}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://google.com/search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-full hover:bg-neutral-800 transition-colors"
                            title="Search on Google"
                          >
                            <Search size={16} className="text-neutral-400" />
                          </a>
                          <a
                            href={`https://youtube.com/results?search_query=${encodeURIComponent(`${track.title} ${track.artist}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-full hover:bg-neutral-800 transition-colors"
                            title="Search on YouTube"
                          >
                            <Youtube size={16} className="text-neutral-400" />
                          </a>
                          <button
                            className="p-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                            onClick={() => {
                              addTrack(track)
                              // Dispatch a custom event to navigate to the crate section
                              document.dispatchEvent(
                                new CustomEvent("navigate-to-section", {
                                  detail: { section: "projects" },
                                }),
                              )
                            }}
                            title="Add to Crate"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
