"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RefreshCw, LinkIcon, Camera } from "lucide-react"
import Navbar from "@/components/navbar"
import CVSection from "@/components/cv-section"
import ProjectsSection from "@/components/projects-section"
import ModulesTab from "@/components/modules-tab"
import ChatInterface from "@/components/chat-interface"
import MobileMenu from "@/components/mobile-menu"
import { useTheme } from "@/hooks/use-theme"

// Define the Message type for the chat
interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

// Define the Activity type for to-do integration
interface Activity {
  id: string
  description: string
  timestamp: Date
  type: "task" | "project" | "note" | "other"
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedModule, setSelectedModule] = useState("assistant")
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [isAdmin, setIsAdmin] = useState(false)
  const [profileImage, setProfileImage] = useState("/abstract-pattern.png")
  const [profileName, setProfileName] = useState("Kamogelo Mosia")
  const [profileTitle, setProfileTitle] = useState("Web Developer & AI Enthusiast")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeProjects, setActiveProjects] = useState(3)
  const [completedProjects, setCompletedProjects] = useState(5)

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      description: "Updated resume information",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: "task",
    },
    {
      id: "2",
      description: "Started new project: AI Chat Interface",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      type: "project",
    },
    {
      id: "3",
      description: "Added note: Research AI frameworks",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      type: "note",
    },
  ])

  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [todoApiUrl, setTodoApiUrl] = useState("")
  const { isDarkMode, toggleTheme } = useTheme()

  // Check if the device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)

    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Function to toggle the menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Function to handle sending a message from the navbar
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    // Process commands
    const command = text.trim().toLowerCase()
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

  // Function to handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileImage(event.target.result.toString())
      }
      setIsUploadingImage(false)
    }
    reader.onerror = () => {
      alert("Error reading file")
      setIsUploadingImage(false)
    }
    reader.readAsDataURL(file)

    // Reset the input value so the same file can be selected again if needed
    e.target.value = ""
  }

  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Function to handle profile image change
  const handleProfileImageChange = () => {
    if (!isAdmin) return

    const options = ["Upload Image", "Enter URL", "Cancel"]
    const choice = prompt(`Choose an option:\n1. ${options[0]}\n2. ${options[1]}\n3. ${options[2]}`)

    switch (choice) {
      case "1":
      case options[0]:
        triggerFileInput()
        break
      case "2":
      case options[1]:
        const newUrl = prompt("Enter image URL:", profileImage)
        if (newUrl) setProfileImage(newUrl)
        break
      default:
        // Cancel or invalid choice
        break
    }
  }

  // Function to fetch activities from to-do app (placeholder)
  const fetchActivities = async () => {
    if (!todoApiUrl) return

    setIsLoading(true)
    try {
      // This is a placeholder for the actual API call to your to-do app
      console.log(`Fetching activities from: ${todoApiUrl}`)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For now, we'll just use the placeholder data
      setIsConnected(true)
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Connect to to-do app
  const connectToTodoApp = () => {
    const url = prompt("Enter your to-do app API URL:", todoApiUrl)
    if (url) {
      setTodoApiUrl(url)
      fetchActivities()
    }
  }

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffDay > 0) {
      return `${diffDay}d ago`
    } else if (diffHour > 0) {
      return `${diffHour}h ago`
    } else if (diffMin > 0) {
      return `${diffMin}m ago`
    } else {
      return "Just now"
    }
  }

  // Animation variants for section transitions
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  }

  return (
    <main className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
        aria-label="Upload profile image"
      />

      {/* Mobile Menu */}
      <MobileMenu
        isAdmin={isAdmin}
        toggleAdminMode={() => setIsAdmin(!isAdmin)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleTheme}
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6 pb-24">
        {isMobile ? (
          /* Mobile Layout */
          <div className="h-[calc(100vh-120px)]">
            <AnimatePresence mode="wait">
              {activeSection === "chat" && (
                <motion.div
                  key="chat"
                  className="h-full"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={variants}
                >
                  <ChatInterface
                    messages={messages}
                    setMessages={setMessages}
                    selectedModule={selectedModule}
                    isMobile={true}
                  />
                </motion.div>
              )}

              {activeSection === "cv" && (
                <motion.div
                  key="cv"
                  className="h-full"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={variants}
                >
                  <CVSection />
                </motion.div>
              )}

              {activeSection === "projects" && (
                <motion.div
                  key="projects"
                  className="h-full"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={variants}
                >
                  <ProjectsSection />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6 h-[calc(100vh-120px)]">
            <div className="lg:col-span-3 h-full overflow-hidden">
              <ModulesTab selectedModule={selectedModule} setSelectedModule={setSelectedModule} />
            </div>

            <div className="lg:col-span-6 h-full overflow-hidden">
              <AnimatePresence mode="wait">
                {activeSection === "chat" && (
                  <motion.div
                    key="chat"
                    className="h-full"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                  >
                    <ChatInterface messages={messages} setMessages={setMessages} selectedModule={selectedModule} />
                  </motion.div>
                )}

                {activeSection === "cv" && (
                  <motion.div
                    key="cv"
                    className="h-full"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                  >
                    <CVSection />
                  </motion.div>
                )}

                {activeSection === "projects" && (
                  <motion.div
                    key="projects"
                    className="h-full"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                  >
                    <ProjectsSection />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-3 h-full overflow-hidden">
              <div className="bg-chat-bg rounded-xl p-4 h-full overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Profile</h2>
                  <button
                    onClick={() => setIsAdmin(!isAdmin)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      isAdmin ? "bg-primary text-white" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    }`}
                  >
                    {isAdmin ? "Admin Mode" : "Login as Admin"}
                  </button>
                </div>
                <div className="flex flex-col items-center p-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 group">
                    {isUploadingImage ? (
                      <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <img
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {isAdmin && (
                      <div
                        className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={handleProfileImageChange}
                      >
                        <Camera size={20} className="text-white mb-1" />
                        <span className="text-white text-xs">Change Photo</span>
                      </div>
                    )}
                  </div>

                  {isAdmin ? (
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="text-xl font-bold bg-transparent border-b border-neutral-700 text-center mb-1 focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <h3 className="text-xl font-bold">{profileName}</h3>
                  )}

                  {isAdmin ? (
                    <input
                      type="text"
                      value={profileTitle}
                      onChange={(e) => setProfileTitle(e.target.value)}
                      className="text-neutral-400 text-sm mb-4 bg-transparent border-b border-neutral-700 text-center focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <p className="text-neutral-400 text-sm mb-4">{profileTitle}</p>
                  )}

                  <div className="w-full mt-4 space-y-4">
                    <div className="p-3 bg-neutral-800 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Status</h4>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm">Online</span>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-800 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Projects</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Working on</span>
                          {isAdmin ? (
                            <input
                              type="number"
                              value={activeProjects}
                              onChange={(e) => setActiveProjects(Number.parseInt(e.target.value) || 0)}
                              className="w-12 text-sm text-yellow-500 bg-neutral-700 rounded px-2 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-primary"
                              min="0"
                            />
                          ) : (
                            <span className="text-sm text-yellow-500">{activeProjects}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Completed</span>
                          {isAdmin ? (
                            <input
                              type="number"
                              value={completedProjects}
                              onChange={(e) => setCompletedProjects(Number.parseInt(e.target.value) || 0)}
                              className="w-12 text-sm text-green-500 bg-neutral-700 rounded px-2 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-primary"
                              min="0"
                            />
                          ) : (
                            <span className="text-sm text-green-500">{completedProjects}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Recent Activity</h4>
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <button
                              onClick={connectToTodoApp}
                              className="p-1 rounded-full hover:bg-neutral-700 transition-colors"
                              title="Connect to To-Do App"
                            >
                              <LinkIcon size={14} className={isConnected ? "text-green-500" : "text-neutral-400"} />
                            </button>
                          )}
                          <button
                            onClick={fetchActivities}
                            className={`p-1 rounded-full hover:bg-neutral-700 transition-colors ${isLoading ? "animate-spin" : ""}`}
                            disabled={isLoading || !todoApiUrl}
                            title="Refresh Activities"
                          >
                            <RefreshCw size={14} className="text-neutral-400" />
                          </button>
                        </div>
                      </div>

                      {isConnected ? (
                        <div className="text-xs text-green-500 mb-2 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Connected to To-Do App
                        </div>
                      ) : todoApiUrl ? (
                        <div className="text-xs text-yellow-500 mb-2 flex items-center">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                          Connection pending...
                        </div>
                      ) : null}

                      <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                        {activities.length > 0 ? (
                          activities.map((activity) => (
                            <div key={activity.id} className="text-sm text-neutral-400 flex justify-between">
                              <span className="truncate pr-2">{activity.description}</span>
                              <span className="text-xs text-neutral-500 whitespace-nowrap">
                                {formatRelativeTime(activity.timestamp)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-neutral-500 italic">No recent activities</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Navbar at Bottom */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        toggleMenu={toggleMenu}
        onSendMessage={handleSendMessage}
      />
    </main>
  )
}
