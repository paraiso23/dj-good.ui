"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Download, Award, Briefcase, GraduationCap, Star, Mail, MapPin, Phone, Github } from "lucide-react"

export default function CVSection() {
  const [isMobile, setIsMobile] = useState(false)

  // Check if the device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)

    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  }

  return (
    <div className="bg-chat-bg rounded-xl p-4 md:p-6 h-full overflow-y-auto scrollbar-hide pb-20">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl md:text-2xl font-semibold">Resume / CV</h2>
        <button className="flex items-center gap-2 py-2 px-3 md:px-4 bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors">
          <Download size={16} />
          <span className="text-sm font-medium hidden md:inline">Download PDF</span>
        </button>
      </motion.div>

      <div className="space-y-6 md:space-y-8">
        <motion.section custom={0} initial="hidden" animate="visible" variants={fadeIn}>
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            <img
              src="/abstract-pattern.png"
              alt="Profile picture"
              className="rounded-xl w-20 h-20 md:w-28 md:h-28 object-cover mx-auto md:mx-0"
            />
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold mb-2">Kamogelo Mosia</h1>
              <p className="text-neutral-400 mb-2">Web Developer & AI Enthusiast</p>
              <p className="text-neutral-500 text-sm mb-3">Glen Marais, Kempton Park, Johannesburg</p>

              <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-neutral-400 mb-4">
                <div className="flex items-center justify-center md:justify-start">
                  <Mail size={14} className="mr-1" />
                  <span>kamogelomosia@mail.com</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Github size={14} className="mr-1" />
                  <span>GitHub Link</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <MapPin size={14} className="mr-1" />
                  <span>South African Citizen</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 text-xs bg-neutral-800 rounded-full">JavaScript</span>
                <span className="px-3 py-1 text-xs bg-neutral-800 rounded-full">Python</span>
                <span className="px-3 py-1 text-xs bg-neutral-800 rounded-full">React</span>
                <span className="px-3 py-1 text-xs bg-neutral-800 rounded-full">Next.js</span>
                <span className="px-3 py-1 text-xs bg-neutral-800 rounded-full">AI</span>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section custom={1} initial="hidden" animate="visible" variants={fadeIn}>
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">Professional Summary</h2>
          <div className="p-4 bg-neutral-800/50 rounded-lg">
            <p className="text-sm text-neutral-400">
              Results-driven Web Developer and AI Enthusiast with a solid foundation in full-stack development and
              computer science. Skilled in building scalable web applications using modern frameworks and integrating AI
              solutions. Proficient with Python-based AI frameworks and advanced web development stacks. Proven success
              through academic projects and practical experience. Committed to leveraging technology to enhance business
              operations by creating AI-integrated software solutions.
            </p>
          </div>
        </motion.section>

        <motion.section custom={2} initial="hidden" animate="visible" variants={fadeIn}>
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
            <Star className="mr-2" size={20} />
            Technical Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <h3 className="font-medium mb-2">Programming Languages</h3>
              <p className="text-sm text-neutral-400">JavaScript, Python, C#, PHP, C++, SQL</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <h3 className="font-medium mb-2">Web Development</h3>
              <p className="text-sm text-neutral-400">
                HTML, CSS, React, Bootstrap, Node.js, .NET, PHP/Laravel, Next.js
              </p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <h3 className="font-medium mb-2">AI & Data Science</h3>
              <p className="text-sm text-neutral-400">TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <h3 className="font-medium mb-2">Databases</h3>
              <p className="text-sm text-neutral-400">PHPMyAdmin, SQL, Firebase, MongoDB</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <h3 className="font-medium mb-2">Tools & Platforms</h3>
              <p className="text-sm text-neutral-400">
                Git, Visual Studio, Google Search Console, Screaming Frog, WebStorm
              </p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <h3 className="font-medium mb-2">Design</h3>
              <p className="text-sm text-neutral-400">Figma, Sketch, UX Pilot</p>
            </div>
          </div>
        </motion.section>

        <motion.section custom={3} initial="hidden" animate="visible" variants={fadeIn}>
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
            <Briefcase className="mr-2" size={20} />
            Professional Experience
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex flex-col md:flex-row md:justify-between mb-2">
                <h3 className="font-medium">Web Developer</h3>
                <span className="text-sm text-neutral-400">November 2023 – January 2024</span>
              </div>
              <p className="text-primary mb-2">Signs4SA</p>
              <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1">
                <li>Developed and maintained PHP/Laravel websites with database integration via PHPMyAdmin</li>
                <li>Built responsive web applications using React and JAMstack methodologies</li>
                <li>Implemented SEO strategies using UberSuggest, Screaming Frog, and Google Search Console</li>
                <li>Conducted debugging, testing, and deployment to ensure performance and scalability</li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section custom={4} initial="hidden" animate="visible" variants={fadeIn}>
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
            <Award className="mr-2" size={20} />
            Projects
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex flex-col md:flex-row md:justify-between mb-2">
                <h3 className="font-medium">Business Software Suite</h3>
                <span className="text-sm text-yellow-500">In Progress</span>
              </div>
              <p className="text-sm text-neutral-400 mb-2">
                <strong>Objective:</strong> Create a comprehensive software suite addressing key business needs
                including payroll management, leave tracking, expense tracking, and AI-driven employee training tools
              </p>
              <p className="text-sm font-medium mb-1">Planned Features:</p>
              <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1">
                <li>Integrated AI assistant to train new employees using company data</li>
                <li>Scalable modules for managing HR operations, finances, and internal communications</li>
                <li>User-friendly dashboards for data visualization and analytics</li>
              </ul>
            </div>

            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex flex-col md:flex-row md:justify-between mb-2">
                <h3 className="font-medium">Job Seeker App – "Zenzele Jobs"</h3>
              </div>
              <p className="text-sm text-neutral-400 mb-2">
                <strong>Core Technologies:</strong> React (frontend), Python (Flask) backend, Optional VB.NET desktop
                tool
              </p>
              <p className="text-sm font-medium mb-1">Key Features:</p>
              <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1">
                <li>Job search functionality, user profile creation, CV/resume builder, and application management</li>
                <li>Modern UI for filtering and sorting job listings, tracking applications, and building resumes</li>
                <li>
                  RESTful API to handle job listings, user profiles, and application data, with potential integration
                  for external job boards
                </li>
                <li>
                  Optional VB.NET tool for offline CV editing, organizing saved job listings, and cover letter
                  generation
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section custom={5} initial="hidden" animate="visible" variants={fadeIn}>
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
            <GraduationCap className="mr-2" size={20} />
            Education
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex flex-col md:flex-row md:justify-between mb-2">
                <h3 className="font-medium">BSc Computer Science & Informatics</h3>
                <span className="text-sm text-neutral-400">Expected Graduation: 2024</span>
              </div>
              <p className="text-primary mb-2">University of Johannesburg</p>
              <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1">
                <li>Specialization in Mathematics and Informatics</li>
                <li>Extensive project experience in AI and web development</li>
              </ul>
            </div>

            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex flex-col md:flex-row md:justify-between mb-2">
                <h3 className="font-medium">National Senior Certificate</h3>
                <span className="text-sm text-neutral-400">2016</span>
              </div>
              <p className="text-primary mb-2">Hoërskool Birchleigh</p>
              <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1">
                <li>Graduated with a Bachelor's admission</li>
                <li>Achieved the highest mark in Information Technology</li>
                <li>Recognized for leadership as a member of the prefect body</li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section custom={6} initial="hidden" animate="visible" variants={fadeIn}>
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
            <Phone className="mr-2" size={20} />
            References
          </h2>
          <div className="p-4 bg-neutral-800/50 rounded-lg">
            <p className="text-sm text-neutral-400">Fortune Madehlaba (Planet42): 072 541 0863</p>
          </div>
          <div className="mt-4 text-right text-xs text-neutral-500">ATS-Optimized | Last Updated: May 2025</div>
        </motion.section>
      </div>
    </div>
  )
}
