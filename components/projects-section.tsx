"use client"

import { motion } from "framer-motion"
import { FolderPlus, Clock } from "lucide-react"

export default function ProjectsSection() {
  return (
    <div className="bg-chat-bg rounded-xl p-4 md:p-6 h-full overflow-y-auto scrollbar-hide pb-20">
      <motion.div
        className="flex items-center justify-between mb-4 md:mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl md:text-2xl font-semibold">Projects</h2>
      </motion.div>

      <motion.div
        className="flex flex-col items-center justify-center h-[80%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-24 h-24 bg-neutral-800/70 rounded-full flex items-center justify-center mb-6">
          <FolderPlus size={40} className="text-neutral-400" />
        </div>
        <h3 className="text-xl font-medium mb-3">Projects Coming Soon</h3>
        <p className="text-neutral-400 text-center max-w-md mb-6">
          This section is currently under development. Check back later to see showcased projects.
        </p>

        <div className="flex items-center gap-2 text-sm text-yellow-500">
          <Clock size={16} />
          <span>Under Construction</span>
        </div>
      </motion.div>
    </div>
  )
}
