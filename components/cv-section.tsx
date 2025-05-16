"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { XCircle } from "lucide-react"

export default function CVSection() {
  const [webhookResponses, setWebhookResponses] = useState<
    Array<{
      status: "success" | "error" | "pending"
      message: string
      data: {
        setName: { text: string; link: string }
        infoSnippet: { text: string; link: string }
        tracklist: {
          position: number
          artist: { name: string; link: string }
          track: { title: string; link: string }
        }[]
        genres: string[]
        relatedLinks: { title: string; url: string }[]
        socialMedia: { platform: string; url: string }[]
      }
      timestamp: Date
    }>
  >([]) // Use an array to store multiple responses

  // Handle webhook custom events
  useEffect(() => {
    const handleEvent = (e: any) => {
      const resp = e.detail
      setWebhookResponses((prev) => [
        {
          status: resp.success ? "success" : "error",
          message: resp.message || "Webhook response received",
          data: resp.data,
          timestamp: new Date(),
        },
        ...prev,
      ])
    }

    document.addEventListener("webhook-response", handleEvent)
    return () => document.removeEventListener("webhook-response", handleEvent)
  }, [])

  return (
    <div className="bg-chat-bg rounded-xl p-4 md:p-6 h-full overflow-y-auto scrollbar-hide pb-20">
      {webhookResponses.length > 0 ? (
        /* Timeline of webhook responses */
        <div className="space-y-6">
          {webhookResponses.map((response, index) => (
            <motion.div
              key={index}
              className="bg-neutral-800/70 border border-neutral-700 rounded-xl p-4 space-y-4 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header with session title */}
              <div className="flex justify-between items-center">
                <a
                  href={response.data.setName.link}
                  target="_blank"
                  className="text-xl font-semibold text-white hover:underline"
                  rel="noreferrer"
                >
                  {response.data.setName.text}
                </a>
                <button onClick={() => setWebhookResponses((prev) => prev.filter((_, i) => i !== index))}>
                  <XCircle size={24} className="text-neutral-300 hover:text-white" />
                </button>
              </div>

              {/* Info snippet */}
              <p className="text-sm text-neutral-300">
                {response.data.infoSnippet.text}{" "}
                <a
                  href={response.data.infoSnippet.link}
                  target="_blank"
                  className="text-primary hover:underline"
                  rel="noreferrer"
                >
                  (more)
                </a>
              </p>

              {/* Genres tags */}
              {response.data.genres && response.data.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {response.data.genres.map((g) => (
                    <span key={g} className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Tracklist */}
              <div className="max-h-64 overflow-y-auto pr-2 space-y-1">
                {response.data.tracklist.map((t) => (
                  <motion.div
                    key={t.position}
                    className="grid grid-cols-[2ch_1fr] gap-2 text-sm text-neutral-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 80, damping: 12, delay: t.position * 0.02 }}
                  >
                    <span className="text-neutral-500">{t.position}.</span>
                    <span>
                      <a href={t.artist.link} target="_blank" className="hover:underline" rel="noreferrer">
                        {t.artist.name}
                      </a>
                      {" – "}
                      <a href={t.track.link} target="_blank" className="hover:underline" rel="noreferrer">
                        {t.track.title}
                      </a>
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Related links */}
              {response.data.relatedLinks && response.data.relatedLinks.length > 0 && (
                <div className="flex flex-wrap gap-3 text-xs">
                  {response.data.relatedLinks.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      className="text-primary hover:underline"
                      rel="noreferrer"
                    >
                      {l.title}
                    </a>
                  ))}
                </div>
              )}

              {/* Social Media */}
              {response.data.socialMedia && response.data.socialMedia.length > 0 && (
                <div className="flex gap-4 text-sm text-neutral-400">
                  {response.data.socialMedia.map((s) => (
                    <a key={s.platform} href={s.url} target="_blank" className="hover:text-white" rel="noreferrer">
                      {s.platform}
                    </a>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-neutral-500 text-right">{response.timestamp.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Default view when no webhook responses */
        <div className="h-full flex flex-col items-center justify-center">
          <div className="max-w-4xl w-full bg-neutral-800/50 rounded-xl p-6 border border-neutral-700 shadow-lg">
            <div className="flex flex-col space-y-6">
              {/* Session Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-700 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                      Takumi Tomita
                    </span>
                  </h2>
                  <p className="text-neutral-400 text-sm">Central Magazine Podcast #42</p>
                </div>
                <div className="flex gap-3 mt-3 md:mt-0">
                  {[
                    { platform: "Instagram", url: "https://www.instagram.com/sergiovelezabadia/" },
                    { platform: "Instagram", url: "https://www.instagram.com/k_chinaski/" },
                    { platform: "Linktree", url: "https://linktr.ee/Takumikun" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full text-xs transition-colors flex items-center gap-1.5"
                    >
                      {social.platform === "Instagram" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      )}
                      {social.platform === "Linktree" ? "Takumikun" : social.platform}
                    </a>
                  ))}
                </div>
              </div>

              {/* Session Description */}
              <div className="bg-neutral-900/40 rounded-lg p-4">
                <p className="text-neutral-300 text-sm leading-relaxed">
                  A music selection curated by Takumi Tomita featuring a deep and passionate collection of tracks
                  focusing on respect and love for music, highlighted by Sergio Velez.{" "}
                  <a
                    href="https://centralzine.com/takumi-tomita-central-magazine-podcast-42/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Read more
                  </a>
                </p>
              </div>

              {/* Visual Session Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column - Session Stats */}
                <div className="bg-neutral-900/40 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Session Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Total Tracks</span>
                      <span className="text-xl font-bold text-white">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Featured Artists</span>
                      <span className="text-white">Donald Byrd, Sault, Cortex...</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Session Date</span>
                      <span className="text-white">May 15, 2025</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Session Type</span>
                      <span className="text-white">Podcast Mix</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-800">
                      <a
                        href="https://centralzine.com/takumi-tomita-central-magazine-podcast-42/"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm"
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
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" x2="21" y1="14" y2="3" />
                        </svg>
                        Visit Original Source
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right column - Featured Tracks */}
                <div className="bg-neutral-900/40 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Featured Tracks</h3>
                    <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded-full">Top 5 of 18</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { position: 1, artist: "Jesse Peterson & Carlos Niño", title: "Turn on the Sunlight" },
                      { position: 5, artist: "Donald Byrd", title: "Wind Parade" },
                      { position: 9, artist: "Cortex", title: "Huit Octobre 1971" },
                      { position: 12, artist: "Sault", title: "Why why why" },
                      { position: 14, artist: "Thee Sacred Souls", title: "Can I Call You Rose?" },
                    ].map((track, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 hover:bg-neutral-800/30 rounded-lg transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-400">
                          {track.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{track.title}</p>
                          <p className="text-neutral-400 text-xs truncate">{track.artist}</p>
                        </div>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        </a>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        // Create webhook response event with the full tracklist
                        const mockResponse = {
                          success: true,
                          message: "Full tracklist",
                          data: {
                            setName: {
                              text: "Takumi Tomita",
                              link: "https://centralzine.com/takumi-tomita-central-magazine-podcast-42/",
                            },
                            infoSnippet: {
                              text: "A music selection curated by Takumi Tomita featuring a deep and passionate collection of tracks focusing on respect and love for music, highlighted by Sergio Velez.",
                              link: "https://centralzine.com/takumi-tomita-central-magazine-podcast-42/",
                            },
                            tracklist: [
                              {
                                position: 1,
                                artist: {
                                  name: "Jesse Peterson & Carlos Niño",
                                  link: "https://www.google.com/search?q=Jesse+Peterson+%26+Carlos+Ni%C3%B1o",
                                },
                                track: {
                                  title: "Turn on the Sunlight",
                                  link: "https://www.google.com/search?q=Turn+on+the+Sunlight+Jesse+Peterson+%26+Carlos+Ni%C3%B1o",
                                },
                              },
                              {
                                position: 2,
                                artist: {
                                  name: "Nala Sineprho",
                                  link: "https://www.google.com/search?q=Nala+Sineprho",
                                },
                                track: {
                                  title: "Space 4",
                                  link: "https://www.google.com/search?q=Space+4+Nala+Sineprho",
                                },
                              },
                              {
                                position: 3,
                                artist: {
                                  name: "Matthew Halsall",
                                  link: "https://www.google.com/search?q=Matthew+Halsall",
                                },
                                track: {
                                  title: "The energy of life",
                                  link: "https://www.google.com/search?q=The+energy+of+life+Matthew+Halsall",
                                },
                              },
                              {
                                position: 4,
                                artist: { name: "Billy Cobham", link: "https://www.google.com/search?q=Billy+Cobham" },
                                track: { title: "Le Lis", link: "https://www.google.com/search?q=Le+Lis+Billy+Cobham" },
                              },
                              {
                                position: 5,
                                artist: { name: "Donald Byrd", link: "https://www.google.com/search?q=Donald+Byrd" },
                                track: {
                                  title: "Wind Parade",
                                  link: "https://www.google.com/search?q=Wind+Parade+Donald+Byrd",
                                },
                              },
                              {
                                position: 6,
                                artist: {
                                  name: "Adrian Younge",
                                  link: "https://www.google.com/search?q=Adrian+Younge",
                                },
                                track: {
                                  title: "The American Negro",
                                  link: "https://www.google.com/search?q=The+American+Negro+Adrian+Younge",
                                },
                              },
                              {
                                position: 7,
                                artist: {
                                  name: "John Carroll Kirby",
                                  link: "https://www.google.com/search?q=John+Carroll+Kirby",
                                },
                                track: {
                                  title: "Swallow Tail",
                                  link: "https://www.google.com/search?q=Swallow+Tail+John+Carroll+Kirby",
                                },
                              },
                              {
                                position: 8,
                                artist: {
                                  name: "Ronald Langestraat",
                                  link: "https://www.google.com/search?q=Ronald+Langestraat",
                                },
                                track: {
                                  title: "Then and forever",
                                  link: "https://www.google.com/search?q=Then+and+forever+Ronald+Langestraat",
                                },
                              },
                              {
                                position: 9,
                                artist: { name: "Cortex", link: "https://www.google.com/search?q=Cortex" },
                                track: {
                                  title: "Huit Octobre 1971",
                                  link: "https://www.google.com/search?q=Huit+Octobre+1971+Cortex",
                                },
                              },
                              {
                                position: 10,
                                artist: {
                                  name: "El Michels Affair",
                                  link: "https://www.google.com/search?q=El+Michels+Affair",
                                },
                                track: {
                                  title: "Last Blast",
                                  link: "https://www.google.com/search?q=Last+Blast+El+Michels+Affair",
                                },
                              },
                              {
                                position: 11,
                                artist: { name: "Jason Joshua", link: "https://www.google.com/search?q=Jason+Joshua" },
                                track: {
                                  title: "Language of Love",
                                  link: "https://www.google.com/search?q=Language+of+Love+Jason+Joshua",
                                },
                              },
                              {
                                position: 12,
                                artist: { name: "Sault", link: "https://www.google.com/search?q=Sault" },
                                track: {
                                  title: "Why why why",
                                  link: "https://www.google.com/search?q=Why+why+why+Sault",
                                },
                              },
                              {
                                position: 13,
                                artist: {
                                  name: "Common Saints",
                                  link: "https://www.google.com/search?q=Common+Saints",
                                },
                                track: {
                                  title: "Idol Eyes",
                                  link: "https://www.google.com/search?q=Idol+Eyes+Common+Saints",
                                },
                              },
                              {
                                position: 14,
                                artist: {
                                  name: "Thee Sacred Souls",
                                  link: "https://www.google.com/search?q=Thee+Sacred+Souls",
                                },
                                track: {
                                  title: "Can I Call You Rose?",
                                  link: "https://www.google.com/search?q=Can+I+Call+You+Rose+Thee+Sacred+Souls",
                                },
                              },
                              {
                                position: 15,
                                artist: {
                                  name: "Charles Bradley",
                                  link: "https://www.google.com/search?q=Charles+Bradley",
                                },
                                track: {
                                  title: "The Telephone song",
                                  link: "https://www.google.com/search?q=The+Telephone+song+Charles+Bradley",
                                },
                              },
                              {
                                position: 16,
                                artist: { name: "Donald Byrd", link: "https://www.google.com/search?q=Donald+Byrd" },
                                track: {
                                  title: "Stepping into Tomorrow",
                                  link: "https://www.google.com/search?q=Stepping+into+Tomorrow+Donald+Byrd",
                                },
                              },
                              {
                                position: 17,
                                artist: { name: "Knxwledge", link: "https://www.google.com/search?q=Knxwledge" },
                                track: { title: "Listen", link: "https://www.google.com/search?q=Listen+Knxwledge" },
                              },
                              {
                                position: 18,
                                artist: {
                                  name: "Pastor T.L. Barret and the Youth for Christ Choir",
                                  link: "https://www.google.com/search?q=Pastor+T.L.+Barret+and+the+Youth+for+Christ+Choir",
                                },
                                track: {
                                  title: "Father I Stretch my Hands",
                                  link: "https://www.google.com/search?q=Father+I+Stretch+my+Hands+Pastor+T.L.+Barret+and+the+Youth+for+Christ+Choir",
                                },
                              },
                            ],
                            genres: [],
                            relatedLinks: [],
                            socialMedia: [
                              { platform: "Instagram", url: "https://www.instagram.com/sergiovelezabadia/" },
                              { platform: "Instagram", url: "https://www.instagram.com/k_chinaski/" },
                              { platform: "Linktree", url: "https://linktr.ee/Takumikun" },
                            ],
                          },
                        }

                        // Dispatch webhook response event
                        document.dispatchEvent(
                          new CustomEvent("webhook-response", {
                            detail: mockResponse,
                          }),
                        )
                      }}
                      className="w-full mt-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
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
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                      </svg>
                      View Full Tracklist
                    </button>
                  </div>
                </div>
              </div>

              {/* Genre Analysis */}
              <div className="bg-neutral-900/40 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Genre Analysis</h3>
                <div className="flex flex-wrap gap-2">
                  {["Jazz", "Soul", "Funk", "Hip-Hop", "Electronic", "Ambient"].map((genre, index) => (
                    <div key={index} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                      {genre}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to Crate Button */}
              <button
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                onClick={() => {
                  // Create a custom event to add all tracks to crate
                  const tracks = [
                    { artist: "Jesse Peterson & Carlos Niño", title: "Turn on the Sunlight" },
                    { artist: "Nala Sineprho", title: "Space 4" },
                    { artist: "Matthew Halsall", title: "The energy of life" },
                    { artist: "Billy Cobham", title: "Le Lis" },
                    { artist: "Donald Byrd", title: "Wind Parade" },
                  ]

                  // Add each track to crate
                  tracks.forEach((track) => {
                    const crateTrack = {
                      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                      artist: track.artist,
                      title: track.title,
                      owned: false,
                      format: "vinyl",
                      metadata: {
                        album: "Takumi Tomita Mix",
                        genre: "Various",
                        year: 2025,
                        comment: "Added from Takumi Tomita session",
                      },
                    }

                    document.dispatchEvent(
                      new CustomEvent("add-to-crate", {
                        detail: { track: crateTrack },
                      }),
                    )
                  })

                  // Show success toast
                  document.dispatchEvent(
                    new CustomEvent("show-toast", {
                      detail: {
                        title: "Tracks Added",
                        description: "5 tracks from Takumi Tomita session added to your crate",
                        variant: "success",
                      },
                    }),
                  )
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Add Featured Tracks to Crate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test button - always visible */}
      <div className="mt-6 flex flex-col items-center">
        <p className="text-neutral-500 text-sm mb-2">Test webhook response</p>
        <button
          onClick={() => {
            // Create mock webhook response for testing
            const mockResponse = {
              success: true,
              message: "Mock webhook response",
              data: {
                setName: {
                  text: "Sample DJ Set - Summer Vibes 2025",
                  link: "https://example.com/sets/summer-vibes",
                },
                infoSnippet: {
                  text: "A collection of upbeat tracks perfect for summer parties and beach days.",
                  link: "https://example.com/sets/summer-vibes/info",
                },
                tracklist: [
                  {
                    position: 1,
                    artist: { name: "Sunshine Collective", link: "https://example.com/artist/sunshine-collective" },
                    track: { title: "Beach Memories", link: "https://example.com/tracks/beach-memories" },
                  },
                  {
                    position: 2,
                    artist: { name: "Tropical Waves", link: "https://example.com/artist/tropical-waves" },
                    track: { title: "Sunset Dreams", link: "https://example.com/tracks/sunset-dreams" },
                  },
                  {
                    position: 3,
                    artist: { name: "Ocean Breeze", link: "https://example.com/artist/ocean-breeze" },
                    track: { title: "Coastal Highway", link: "https://example.com/tracks/coastal-highway" },
                  },
                ],
                genres: ["House", "Tropical", "Summer Vibes", "Dance"],
                relatedLinks: [
                  { title: "Summer Playlist", url: "https://example.com/playlists/summer" },
                  { title: "Beach Party Mix", url: "https://example.com/mixes/beach-party" },
                ],
                socialMedia: [
                  { platform: "SoundCloud", url: "https://soundcloud.com/example" },
                  { platform: "Instagram", url: "https://instagram.com/example" },
                ],
              },
            }

            // Dispatch mock webhook response event
            document.dispatchEvent(
              new CustomEvent("webhook-response", {
                detail: mockResponse,
              }),
            )
          }}
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
        >
          Simulate Webhook Response
        </button>
      </div>
    </div>
  )
}
