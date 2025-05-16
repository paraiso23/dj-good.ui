"use client"

import { motion } from "framer-motion"
import { Bot, Search, Youtube, Plus } from "lucide-react"
import { useState } from "react"
import { useSearchHistory, type HistoryEntry } from "../hooks/useSearchHistory"

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
  const [mode, setMode] = useState<"text" | "url" | "file">("text")
  const [inputText, setInputText] = useState("")
  const [inputURL, setInputURL] = useState("")
  const [file, setFile] = useState<File | null>(null)

  // Add these state variables after the other useState declarations
  const [showHistory, setShowHistory] = useState(false)
  const { history, addHistory, clearHistory } = useSearchHistory()

  // Search history hook
  // const { addHistory } = useSearchHistory() // This line is removed because it's already destructured above

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

        const text = await res.text()
        setResponse(text)
        console.log("Webhook responded successfully")
        return text
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
      // Parse the initial JSON response
      console.log("Raw response:", responseText)
      const outerData = JSON.parse(responseText)
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

  // Update the addTrack function to add the track to the crate
  const addTrack = (track) => {
    console.log("Adding track to crate:", track)

    // Create a track object in the format expected by the crate
    const crateTrack = {
      id: Date.now().toString(), // In a real app, this would be a UUID
      artist: track.artist,
      title: track.title,
      owned: false, // Default to "wanted" status
      format: "vinyl", // Default format
      metadata: {
        // Add any additional metadata that might be available
        album: "",
        genre: "",
        year: new Date().getFullYear(), // Current year as default
        comment: `Added from Track Grabber on ${new Date().toLocaleDateString()}`,
      },
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
        description: `${parsedTracks.length} tracks added to your crate`,
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
              {(["text", "url", "file"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    mode === m ? "bg-primary text-white" : "bg-neutral-800 hover:bg-neutral-700"
                  }`}
                >
                  {m === "text" ? "Text" : m === "url" ? "URL" : "File"}
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

            {/* Search History Component */}
            {/* <SearchHistory onSelect={handleSelectHistory} /> */}

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
                    <th className="text-left py-2 px-3 text-sm font-medium text-neutral-400">Title</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-neutral-400">Artist</th>
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
                      <td className="py-3 px-3 text-sm">{track.title}</td>
                      <td className="py-3 px-3 text-sm text-neutral-400">{track.artist}</td>
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
