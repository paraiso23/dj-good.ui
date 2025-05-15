"use client"

import { useState } from "react"
import AIModels from "./ai-models"
import ChatInterface from "./chat-interface"

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedModel, setSelectedModel] = useState("general-assistant")

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      <div className="md:col-span-1">
        <AIModels selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      </div>
      <div className="md:col-span-2">
        <ChatInterface messages={messages} setMessages={setMessages} selectedModel={selectedModel} />
      </div>
    </div>
  )
}
