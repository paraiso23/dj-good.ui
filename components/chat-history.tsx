"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Settings, Plus } from "lucide-react"

interface ChatPreview {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
  online: boolean
}

export default function ChatHistory() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  const chats: ChatPreview[] = [
    {
      id: "1",
      name: "Project Assistant",
      lastMessage: "I can help you organize your projects",
      time: "12:30",
      unread: 2,
      avatar: "/paw-print-heart.png",
      online: true,
    },
    {
      id: "2",
      name: "Resume Helper",
      lastMessage: "Your CV is looking great!",
      time: "10:45",
      unread: 0,
      avatar: "/abstract-rh.png",
      online: false,
    },
    {
      id: "3",
      name: "Interview Coach",
      lastMessage: "Let's prepare for your next interview",
      time: "Yesterday",
      unread: 0,
      avatar: "/abstract-geometric-ic.png",
      online: false,
    },
    {
      id: "4",
      name: "Job Search",
      lastMessage: "I found some openings for you",
      time: "Monday",
      unread: 5,
      avatar: "/javascript-code.png",
      online: true,
    },
  ]

  return (
    <div className="bg-chat-bg rounded-xl p-4 h-full flex flex-col">
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-medium">Conversations</h2>
        <div className="flex space-x-2">
          <button className="p-1 rounded-full hover:bg-neutral-800 transition-colors">
            <Settings size={18} className="text-neutral-400" />
          </button>
        </div>
      </motion.div>

      <div className="relative w-full mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-neutral-500" />
        </div>
        <input
          type="text"
          className="w-full py-2 pl-10 pr-4 bg-neutral-800 border border-neutral-700 rounded-full focus:outline-none focus:ring-1 focus:ring-neutral-600 text-sm"
          placeholder="Search conversations..."
        />
      </div>

      <button className="flex items-center space-x-2 py-2 px-3 rounded-lg bg-primary mb-4 hover:bg-primary/90 transition-colors">
        <Plus size={16} className="text-white" />
        <span className="text-sm font-medium text-white">New Chat</span>
      </button>

      <div className="overflow-y-auto flex-grow scrollbar-hide">
        <div className="space-y-2">
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                selectedChat === chat.id ? "bg-neutral-800" : "hover:bg-neutral-800/50"
              }`}
              onClick={() => setSelectedChat(chat.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative flex-shrink-0">
                <img src={chat.avatar || "/placeholder.svg"} alt={chat.name} className="w-10 h-10 rounded-full" />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-chat-bg"></div>
                )}
              </div>
              <div className="ml-3 flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">{chat.name}</p>
                  <span className="text-xs text-neutral-400 flex-shrink-0">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-neutral-400 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <div className="ml-2 bg-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
