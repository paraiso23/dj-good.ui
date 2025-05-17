"use client"

import type React from "react"
import ReactMarkdown from "react-markdown"

import { useState, useRef, useEffect } from "react"
import { Send, Bot } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
  isTyping?: boolean
}

export default function ChatInterface({
  messages,
  setMessages,
  selectedModule,
  isMobile = false,
}: {
  messages: Message[]
  setMessages: (messages: Message[]) => void
  selectedModule: string
  isMobile?: boolean
}) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [webhookArtists, setWebhookArtists] = useState<Array<{ name: string; id: string }>>([])

  const moduleInfo = {
    assistant: {
      name: "Chat Assistant",
      icon: <Bot size={20} />,
      welcomeMessage:
        "Hi there! I'm your personal assistant. Try these commands: /help, /about, /time, /date, /weather",
    },
  }

  const currentModule = moduleInfo["assistant"]

  const handleSend = async () => {
    if (input.trim() === "") return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")

    // Show typing indicator
    const typingIndicatorId = `typing-${Date.now()}`
    setMessages([
      ...updatedMessages,
      {
        id: typingIndicatorId,
        text: "...",
        sender: "assistant",
        timestamp: new Date(),
        isTyping: true,
      },
    ])

    try {
      // Send message to webhook using the same configuration as djbot2
      const webhookUrl = "https://primary-production-24fb.up.railway.app/webhook/djbot3"
      console.log("Calling webhook:", webhookUrl, "with payload:", { text: input.trim() })

      // Use the same headers configuration as djbot2
      const headers: HeadersInit = {}
      if (input.trim()) {
        headers["Content-Type"] = "application/json"
      }

      // Add a timeout for the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      try {
        // Make the fetch request with the same structure as djbot2
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ text: input.trim() }),
          signal: controller.signal,
        })

        // Clear the timeout
        clearTimeout(timeoutId)

        if (!response.ok) {
          console.error(`HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`)
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        // Check content type to determine how to handle the response (same as djbot2)
        const contentType = response.headers.get("content-type") || ""
        console.log("Response content type:", contentType)

        let responseText

        if (contentType.includes("application/json")) {
          try {
            // If it's JSON, parse it directly (same as djbot2)
            const responseData = await response.json()
            console.log("Webhook JSON response:", responseData)

            // Try to extract the text from various possible response formats
            if (responseData.output) {
              responseText = responseData.output
            } else if (responseData.response) {
              responseText = responseData.response
            } else if (responseData.message) {
              responseText = responseData.message
            } else if (typeof responseData === "string") {
              responseText = responseData
            } else {
              responseText = JSON.stringify(responseData)
            }
          } catch (error) {
            console.error("Error parsing JSON response:", error)
            // Fall back to text response
            responseText = await response.text()
            console.log("Fallback text response:", responseText)
          }
        } else {
          // Handle as text for other content types
          responseText = await response.text()
          console.log("Text response:", responseText)
        }

        // Remove typing indicator and add assistant response
        setMessages((prev) =>
          prev
            .filter((msg) => msg.id !== typingIndicatorId)
            .concat({
              id: (Date.now() + 1).toString(),
              text: responseText || "I received your message but couldn't generate a response.",
              sender: "assistant",
              timestamp: new Date(),
            }),
        )
      } catch (fetchError) {
        // This catches network errors, timeouts, and aborts
        console.error("Fetch error:", fetchError)
        throw fetchError
      }
    } catch (error) {
      console.error("Error sending message to webhook:", error)

      // Provide a more specific error message based on the error type
      let errorMessage = "Sorry, I couldn't process your request. Please try again later."

      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMessage =
          "Network error: Could not connect to the assistant service. Please check your internet connection and try again."
      } else if (error.name === "AbortError") {
        errorMessage = "Request timed out. The assistant service is taking too long to respond. Please try again later."
      } else if (error instanceof Error && error.message.includes("HTTP error")) {
        errorMessage = "The assistant service returned an error. Please try again later."
      }

      // Get a fallback response based on the user's query
      const fallbackResponse = getFallbackResponse(input.trim())

      // Remove typing indicator and add error message with fallback
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== typingIndicatorId)
          .concat({
            id: (Date.now() + 1).toString(),
            text: `${errorMessage}\n\n${fallbackResponse}`,
            sender: "assistant",
            timestamp: new Date(),
          }),
      )
    }
  }

  // Add this function after the handleSend function
  const getFallbackResponse = (query: string): string => {
    // Simple fallback responses for common queries
    if (query.toLowerCase().includes("hello") || query.toLowerCase().includes("hi")) {
      return "Hello! I'm currently having trouble connecting to my backend services, but I'm here to help with basic responses."
    }

    if (query.toLowerCase().includes("help")) {
      return "I can normally help with various tasks, but I'm currently in offline mode due to connection issues. Try again later for full functionality."
    }

    if (query.toLowerCase().includes("time")) {
      return `The current time is ${new Date().toLocaleTimeString()}.`
    }

    if (query.toLowerCase().includes("date")) {
      return `Today's date is ${new Date().toLocaleDateString()}.`
    }

    return "I'm having trouble connecting to my backend services right now. Please try again later."
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Focus input when component mounts
    if (!isMobile) {
      inputRef.current?.focus()
    }
  }, [isMobile])

  // Listen for webhook responses to extract artists
  useEffect(() => {
    const handleWebhookResponse = (event: any) => {
      const response = event.detail

      // Extract artists from webhook response
      if (response && response.data && response.data.tracklist) {
        // Get unique artists from tracklist
        const uniqueArtists = Array.from(new Set(response.data.tracklist.map((item) => item.artist.name))).map(
          (name) => ({
            name,
            id: name.toLowerCase().replace(/\s+/g, "-"),
          }),
        )

        setWebhookArtists(uniqueArtists)
      }
    }

    document.addEventListener("webhook-response", handleWebhookResponse)
    return () => {
      document.removeEventListener("webhook-response", handleWebhookResponse)
    }
  }, [])

  return (
    <div className="bg-chat-bg rounded-xl flex flex-col h-full w-full max-w-full overflow-hidden">
      <div className="p-4 md:p-6 flex-shrink-0">
        <AnimatePresence>
          <motion.div
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                {currentModule.icon}
              </div>
              <h2 className="text-lg font-medium">{currentModule.name}</h2>
            </div>
            <div className="flex space-x-2">
              <span className="h-2 w-2 rounded-full bg-green-400"></span>
              <span className="text-xs text-neutral-400">Active</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Artist suggestions from webhook response */}
        <div className="flex flex-wrap gap-2 mb-4">
          {webhookArtists.length > 0
            ? webhookArtists.map((artist) => (
                <motion.button
                  key={artist.id}
                  className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                  onClick={() => setInput(`Tell me about ${artist.name}`)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {artist.name}
                </motion.button>
              ))
            : null}
        </div>
      </div>

      <div className="border-t border-b border-neutral-800 flex-grow overflow-y-auto scrollbar-hide">
        <div className="p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center h-full py-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-neutral-800 rounded-full mb-4 flex items-center justify-center">
                {currentModule.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">Welcome to Kamogelos</h3>
              <p className="text-neutral-400 max-w-sm">{currentModule.welcomeMessage}</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-800 rounded-lg flex items-center">
                  <span className="text-sm">Which artists is ____ related to?</span>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg flex items-center">
                  <span className="text-sm">Which labels is ____ related to?</span>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg flex items-center">
                  <span className="text-sm">Find more info related to _____</span>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg flex items-center">
                  <span className="text-sm">The ________</span>
                </div>
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-neutral-800 text-white rounded-tl-none"
                  }`}
                >
                  {message.isTyping ? (
                    <div className="flex space-x-2 items-center h-6">
                      <div
                        className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  ) : (
                    <ReactMarkdown className="break-words prose prose-invert prose-sm max-w-none">
                      {message.text}
                    </ReactMarkdown>
                  )}
                  <div className="text-xs text-neutral-400 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input field */}
      <div className="p-4 md:p-6 flex-shrink-0">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message to the AI assistant..."
            className="w-full py-3 pl-4 pr-12 bg-neutral-800 border border-neutral-700 rounded-full focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-primary transition-colors"
            disabled={messages.some((m) => m.isTyping)}
          />
          <button
            onClick={handleSend}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary rounded-full"
            disabled={input.trim() === ""}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
