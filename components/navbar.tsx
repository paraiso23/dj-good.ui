"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, FileText, LayoutGrid, Menu, Send, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  showOnMobile: boolean
}

export default function Navbar({
  activeSection,
  setActiveSection,
  toggleMenu,
  onSendMessage,
  className = "",
}: {
  activeSection: string
  setActiveSection: (section: string) => void
  toggleMenu: () => void
  onSendMessage?: (message: string) => void
  className?: string
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [isInputExpanded, setIsInputExpanded] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Check if the device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)

    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Focus input when expanded
  useEffect(() => {
    if (isInputExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isInputExpanded])

  const navItems: NavItem[] = [
    {
      id: "chat",
      label: "Chat",
      icon: <MessageSquare size={20} />,
      showOnMobile: true,
    },
    {
      id: "cv",
      label: "CV / Resume",
      icon: <FileText size={20} />,
      showOnMobile: true,
    },
    {
      id: "projects",
      label: "Projects",
      icon: <LayoutGrid size={20} />,
      showOnMobile: true,
    },
  ]

  // Filter nav items based on device
  const visibleNavItems = navItems.filter((item) => !isMobile || item.showOnMobile)

  const handleNavItemClick = (sectionId: string) => {
    if (isInputExpanded) {
      return
    }
    setActiveSection(sectionId)
  }

  const handleInputClick = () => {
    if (activeSection !== "chat") {
      setActiveSection("chat")
    }
    setIsInputExpanded(true)
  }

  const handleCloseInput = () => {
    setIsInputExpanded(false)
    setInputValue("")
  }

  const handleSendMessage = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim())
      setInputValue("")
      setIsInputExpanded(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === "Escape") {
      handleCloseInput()
    }
  }

  // Animation variants
  const navbarVariants = {
    collapsed: {
      width: "auto",
      height: "auto",
    },
    expanded: {
      width: "min(90vw, 500px)",
      height: "50px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 flex justify-center items-center p-4 z-50 ${className}`}>
      <motion.div
        className={`bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 shadow-lg flex items-center justify-center mx-auto ${
          isInputExpanded ? "w-[min(90vw,500px)]" : "max-w-fit"
        }`}
        variants={navbarVariants}
        animate={isInputExpanded ? "expanded" : "collapsed"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isInputExpanded ? (
            <motion.div
              className="flex items-center w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              key="expanded"
            >
              <button onClick={handleCloseInput} className="mr-2 text-neutral-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none outline-none text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`ml-2 ${
                  inputValue.trim() ? "text-primary hover:text-primary/80" : "text-neutral-500"
                } transition-colors`}
              >
                <Send size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              key="collapsed"
            >
              {visibleNavItems.map((item) => (
                <motion.button
                  key={item.id}
                  className={`relative flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-full ${
                    activeSection === item.id ? "text-white" : "text-neutral-400 hover:text-white"
                  }`}
                  onClick={() => handleNavItemClick(item.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeSection === item.id && (
                    <motion.div
                      className="absolute inset-0 bg-primary rounded-full -z-10"
                      layoutId="activeSection"
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                  {item.icon}
                  <span className={`${isMobile ? "hidden" : "hidden sm:inline"} font-medium text-xs md:text-sm`}>
                    {item.label}
                  </span>
                </motion.button>
              ))}

              {/* Menu button */}
              <motion.button
                className="relative flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-full text-neutral-400 hover:text-white"
                onClick={toggleMenu}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Menu size={20} />
                <span className="hidden sm:inline font-medium text-xs md:text-sm">Menu</span>
              </motion.button>

              {/* Chat input button - only visible when in chat section */}
              {activeSection === "chat" && (
                <motion.button
                  className="relative flex items-center gap-1 md:gap-2 ml-1 px-2 md:px-4 py-2 rounded-full bg-primary text-white"
                  onClick={handleInputClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="font-medium text-xs md:text-sm">Message</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
