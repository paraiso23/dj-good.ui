"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Brain, Sparkles, Code, FileText, Calculator } from "lucide-react"

interface AIModel {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  isNew?: boolean
  comingSoon?: boolean
}

export default function AIModels({
  selectedModel,
  setSelectedModel,
}: {
  selectedModel: string
  setSelectedModel: (id: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const aiModels: AIModel[] = [
    {
      id: "general-assistant",
      name: "General Assistant",
      description: "Your all-purpose AI helper for any question",
      icon: <Brain size={20} />,
      category: "General",
    },
    {
      id: "code-helper",
      name: "Code Helper",
      description: "Specialized in programming and development",
      icon: <Code size={20} />,
      category: "Development",
    },
    {
      id: "creative-writer",
      name: "Creative Writer",
      description: "Helps with creative writing and content creation",
      icon: <Sparkles size={20} />,
      category: "Creative",
      isNew: true,
    },
    {
      id: "resume-builder",
      name: "Resume Builder",
      description: "Helps optimize your CV and job applications",
      icon: <FileText size={20} />,
      category: "Career",
    },
    {
      id: "math-solver",
      name: "Math Solver",
      description: "Solves mathematical problems and equations",
      icon: <Calculator size={20} />,
      category: "Education",
      comingSoon: true,
    },
  ]

  const categories = ["All", ...new Set(aiModels.map((model) => model.category))]

  const filteredModels = aiModels.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !categoryFilter || categoryFilter === "All" || model.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-chat-bg rounded-xl p-4 h-full flex flex-col">
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-medium">AI Models</h2>
        <div className="flex space-x-2">
          <button className="p-1 rounded-full hover:bg-neutral-800 transition-colors">
            <Plus size={18} className="text-neutral-400" />
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
          placeholder="Search AI models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              categoryFilter === category
                ? "bg-primary text-white"
                : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            }`}
            onClick={() => setCategoryFilter(category === "All" ? null : category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto flex-grow scrollbar-hide">
        <div className="space-y-2">
          {filteredModels.map((model) => (
            <motion.div
              key={model.id}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                model.comingSoon ? "opacity-60 pointer-events-none" : ""
              } ${selectedModel === model.id ? "bg-neutral-800" : "hover:bg-neutral-800/50"}`}
              onClick={() => !model.comingSoon && setSelectedModel(model.id)}
              whileHover={{ scale: model.comingSoon ? 1 : 1.02 }}
              whileTap={{ scale: model.comingSoon ? 1 : 0.98 }}
            >
              <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                {model.icon}
                {model.isNew && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] font-bold">NEW</span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">{model.name}</p>
                  <span className="text-xs text-neutral-400 flex-shrink-0">{model.category}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-neutral-400 truncate">{model.description}</p>
                  {model.comingSoon && (
                    <span className="ml-2 text-xs bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded-full">Soon</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg border border-dashed border-neutral-700">
        <p className="text-sm text-center text-neutral-400">
          Want to create your own AI model? <br />
          <span className="text-primary cursor-pointer hover:underline">Learn how</span>
        </p>
      </div>
    </div>
  )
}
