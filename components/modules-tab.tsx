"use client"

import { motion } from "framer-motion"
import { Bot, Search, Youtube, Plus } from "lucide-react"
import { useState } from "react"

export default function ModulesTab({
  selectedModule,
  setSelectedModule,
}: {
  selectedModule: string
  setSelectedModule: (id: string) => void
}) {
  // Mock data for parsed tracks - in a real app, this would come from a parsing function
  const [parsedTracks, setParsedTracks] = useState([
    { title: "Bohemian Rhapsody", artist: "Queen" },
    { title: "Stairway to Heaven", artist: "Led Zeppelin" },
    { title: "Hotel California", artist: "Eagles" },
    { title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
    { title: "Imagine", artist: "John Lennon" },
    { title: "Billie Jean", artist: "Michael Jackson" },
    { title: "Smells Like Teen Spirit", artist: "Nirvana" },
    { title: "Yesterday", artist: "The Beatles" },
    { title: "Like a Rolling Stone", artist: "Bob Dylan" },
    { title: "Purple Haze", artist: "Jimi Hendrix" },
  ])

  // TrackGrabber states
  const [mode, setMode] = useState<"text" | "url" | "file">("text")
  const [inputText, setInputText] = useState("")
  const [inputURL, setInputURL] = useState("")
  const [file, setFile] = useState<File | null>(null)

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
    }

    if (mode === "url") {
      if (!inputURL.trim()) return
      responseText = await callWebhook("/api/parseTrack", { url: inputURL })
    }

    if (mode === "file" && file) {
      // Send FormData with the file
      const form = new FormData()
      form.append("file", file)
      responseText = await callWebhook("/api/parseTrack", form)
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

        // Try to extract from the expected structure
        if (Array.isArray(innerData) && innerData.length > 0 && innerData[0].output && innerData[0].output.tracklist) {
          const tracklist = innerData[0].output.tracklist
          tracks = tracklist.map((item) => ({
            title: item.track.title,
            artist: item.artist.name,
          }))
        }
        // Fallback: try to extract directly if the structure is different
        else if (typeof innerData === "object" && innerData.tracklist) {
          const tracklist = innerData.tracklist
          tracks = tracklist.map((item) => ({
            title: item.track.title,
            artist: item.artist.name,
          }))
        }

        if (tracks.length > 0) {
          console.log("Extracted tracks:", tracks)
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

  // In a real app, this would come from the TrackContext
  const addTrack = (track) => {
    console.log("Adding track:", track)
    // This is a placeholder for the actual implementation
    alert(`Added: ${track.title} by ${track.artist}`)
  }

  return (
    <div className="bg-chat-bg rounded-xl flex flex-col h-full overflow-hidden">
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

      <div className="flex-grow overflow-y-auto scrollbar-hide">
        <div className="p-4 h-full">
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-medium">Track Grabber</h3>

            {/* Selector de modo */}
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
                  // Add all tracks functionality
                  const tracks = parsedTracks.map((track) => ({ ...track }))
                  tracks.forEach((track) => addTrack(track))
                }}
              >
                Add All
              </button>
              <button
                className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                onClick={() => setParsedTracks([])}
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
                <tbody>
                  {parsedTracks.map((track, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
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
                            onClick={() => addTrack(track)}
                            title="Add Track"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
