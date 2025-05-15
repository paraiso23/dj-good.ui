"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Settings, User, Moon, Sun, LogOut, HelpCircle, Github } from "lucide-react"

interface MobileMenuProps {
  isAdmin: boolean
  toggleAdminMode: () => void
  isDarkMode?: boolean
  toggleDarkMode?: () => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function MobileMenu({
  isAdmin,
  toggleAdminMode,
  isDarkMode,
  toggleDarkMode,
  isOpen,
  setIsOpen,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [setIsOpen])

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const menuItems = [
    {
      icon: <User size={18} />,
      label: "Profile",
      onClick: () => {
        console.log("Profile clicked")
        setIsOpen(false)
      },
    },
    {
      icon: <Settings size={18} />,
      label: "Settings",
      onClick: () => {
        console.log("Settings clicked")
        setIsOpen(false)
      },
    },
    {
      icon: isDarkMode ? <Sun size={18} /> : <Moon size={18} />,
      label: isDarkMode ? "Light Mode" : "Dark Mode",
      onClick: () => {
        if (toggleDarkMode) toggleDarkMode()
        setIsOpen(false)
      },
    },
    {
      icon: <Github size={18} />,
      label: "GitHub",
      onClick: () => {
        window.open("https://github.com", "_blank")
        setIsOpen(false)
      },
    },
    {
      icon: <HelpCircle size={18} />,
      label: "Help & Support",
      onClick: () => {
        console.log("Help clicked")
        setIsOpen(false)
      },
    },
    {
      icon: isAdmin ? <LogOut size={18} /> : <User size={18} />,
      label: isAdmin ? "Exit Admin Mode" : "Login as Admin",
      onClick: () => {
        toggleAdminMode()
        setIsOpen(false)
      },
    },
  ]

  return (
    <>
      {/* Menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Menu panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-64 bg-chat-bg z-50 shadow-xl"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-1">
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={index}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition-colors text-left"
                      onClick={item.onClick}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-neutral-400">{item.icon}</span>
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-neutral-800">
                <div className="text-xs text-neutral-500 text-center">
                  <p>Kamogelos Chat Assistant</p>
                  <p>Version 1.0.0</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
