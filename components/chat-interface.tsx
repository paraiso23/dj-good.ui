"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, Info, HelpCircle, Code, Calendar } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
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

  const moduleInfo = {
    assistant: {
      name: "Chat Assistant",
      icon: <Bot size={20} />,
      welcomeMessage:
        "Hi there! I'm your personal assistant. Try these commands: /help, /about, /time, /date, /weather",
    },
  }

  const currentModule = moduleInfo["assistant"]

  const handleSend = () => {
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

    // Process commands
    const command = input.trim().toLowerCase()
    let responseText = ""

    if (command === "/help") {
      responseText =
        "Available commands:\n/help - Show this help message\n/about - About this assistant\n/time - Show current time\n/date - Show current date\n/weather - Show weather (demo)"
    } else if (command === "/about") {
      responseText = "This is a test version of the chat assistant. More features coming soon!"
    } else if (command === "/time") {
      const now = new Date()
      responseText = `Current time: ${now.toLocaleTimeString()}`
    } else if (command === "/date") {
      const now = new Date()
      responseText = `Current date: ${now.toLocaleDateString()}`
    } else if (command === "/weather") {
      responseText = "Weather feature is coming soon. This is just a demo response."
    } else if (command.startsWith("/")) {
      responseText = `Unknown command: ${command}. Type /help to see available commands.`
    } else {
      responseText =
        "This is a test version with limited functionality. Please try using one of the available commands by typing /help"
    }

    // Add assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages([...updatedMessages, assistantMessage])
    }, 500)
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

        {/* Command suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["/help", "/about", "/time", "/date", "/weather"].map((cmd) => (
            <button
              key={cmd}
              className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
              onClick={() => setInput(cmd)}
            >
              {cmd}
            </button>
          ))}
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
                  <HelpCircle size={18} className="mr-2 text-primary" />
                  <span className="text-sm">Type /help for commands</span>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg flex items-center">
                  <Info size={18} className="mr-2 text-primary" />
                  <span className="text-sm">Type /about for info</span>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg flex items-center">
                  <Code size={18} className="mr-2 text-primary" />
                  <span className="text-sm">More features coming soon</span>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg flex items-center">
                  <Calendar size={18} className="mr-2 text-primary" />
                  <span className="text-sm">Try /date or /time</span>
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
                  <p className="break-words whitespace-pre-line">{message.text}</p>
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
            placeholder="Type a message or command (try /help)..."
            className="w-full py-3 pl-4 pr-12 bg-neutral-800 border border-neutral-700 rounded-full focus:outline-none focus:ring-1 focus:ring-neutral-600"
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
