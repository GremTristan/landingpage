"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import RotatingEarth from "@/components/ui/wireframe-dotted-globe"
import { AIInputWithLoading } from "@/components/ui/ai-input-with-loading"

export default function Home() {
  const [activeSection, setActiveSection] = useState("home")
  const [shouldAutoType, setShouldAutoType] = useState(false)
  const [hasAutoTyped, setHasAutoTyped] = useState(false)

  useEffect(() => {
    const sections = ["home", "about", "how-it-works", "what-it-means", "receive-sbt", "roadmaps"]
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2
      const homeSection = document.getElementById("home")
      const aboutSection = document.getElementById("about")

      // Detect scroll between home and about - trigger when entering about section
      if (aboutSection && !hasAutoTyped) {
        const aboutTop = aboutSection.offsetTop
        const aboutBottom = aboutTop + aboutSection.offsetHeight
        
        // Trigger when scroll position enters the about section
        if (scrollPosition >= aboutTop && scrollPosition <= aboutBottom) {
          setShouldAutoType(true)
          setHasAutoTyped(true)
        }
      }

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section) {
          const sectionTop = section.offsetTop
          const sectionHeight = section.offsetHeight
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasAutoTyped])

  const sections = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "how-it-works", label: "How it works" },
    { id: "what-it-means", label: "What it means" },
    { id: "receive-sbt", label: "SBT" },
    { id: "roadmaps", label: "Roadmaps" },
  ]

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <main className="relative z-10">
      {/* Effets cinématiques de background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Lignes de lumière horizontales */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        
        {/* Lignes de lumière verticales */}
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        
        {/* Points de lumière animés */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/20 rounded-full"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/20 rounded-full"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white/20 rounded-full"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>
      
      {/* Indicateur de page à droite - Design cinématique */}
      <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 pointer-events-none">
        {/* Ligne verticale continue */}
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative flex items-center pointer-events-auto"
            aria-label={section.label}
          >
            {/* Point cinématique avec glow */}
            <div className="relative">
              {/* Glow effect */}
              {activeSection === section.id && (
                <motion.div
                  className="absolute inset-0 w-2 h-2 bg-white/20 rounded-full blur-sm"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              
              {/* Point central */}
              <div
                className={`relative w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  activeSection === section.id
                    ? "bg-white scale-150"
                    : "bg-white/20 group-hover:bg-white/40 group-hover:scale-125"
                }`}
              />
              
              {/* Ligne de connexion vers le point */}
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-8 h-px transition-all duration-500 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-white/50 to-transparent"
                    : "bg-gradient-to-r from-white/10 to-transparent group-hover:from-white/30"
                }`}
              />
            </div>
            
            {/* Label avec effet cinématique */}
            <motion.span
              className={`absolute right-10 text-[10px] font-light tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-300 ${
                activeSection === section.id
                  ? "text-white/80 opacity-100"
                  : "text-white/30 opacity-0 group-hover:opacity-100 group-hover:text-white/50"
              }`}
              initial={{ x: -10, opacity: 0 }}
              animate={
                activeSection === section.id
                  ? { x: 0, opacity: 1 }
                  : { x: -10, opacity: 0 }
              }
              transition={{ duration: 0.3 }}
            >
              {section.label}
            </motion.span>
          </button>
        ))}
      </div>
      {/* Section Globe */}
      <section id="home" className="snap-start min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative bg-black">
        {/* Phrases cinématographiques à gauche (position absolue) */}
        <div className="absolute left-4 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white"
          >
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Every connection creates value
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white"
          >
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Your network becomes your asset
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white"
          >
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Data flows, ownership remains
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-white"
          >
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Build. Share. Earn.
            </p>
          </motion.div>
        </div>

        {/* Globe centré */}
        <div className="w-full max-w-6xl mx-auto flex items-center justify-center">
          <RotatingEarth width={1200} height={800} />
        </div>

        {/* Call to Action */}
        <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-20">
          <a
            href="#about"
            className="group inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200"
          >
            <span className="text-sm sm:text-base font-light tracking-[0.15em] uppercase">
              Découvrir le projet
            </span>
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-white/60 group-hover:text-white transition-colors"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                d="M8 3L8 13M8 13L13 8M8 13L3 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </a>
        </div>
      </section>

      {/* Section About */}
      <section id="about" className="snap-start min-h-screen flex items-center justify-center bg-black text-white p-8 relative overflow-hidden">
        <div className="text-center max-w-4xl relative z-10 w-full">
          <div className="space-y-8">
            <motion.p 
              className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.7] }}
              transition={{ duration: 2, delay: 0.5 }}
            >
              Your create network be paid for that
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.5] }}
              transition={{ duration: 2, delay: 1.5 }}
              className="w-full"
            >
              <AIInputWithLoading 
                placeholder="Ask me anything about the integration..."
                onSubmit={async (value: string) => {
                  console.log("Submitted:", value);
                  // Simulate API call
                  await new Promise(resolve => setTimeout(resolve, 3000));
                }}
                loadingDuration={3000}
                className="opacity-60"
                autoType={shouldAutoType ? {
                  texts: [
                    "How to integrate AIInputWithLoading component in a Next.js project with shadcn?",
                    "What are the required dependencies for AIInputWithLoading component?",
                    "How to setup shadcn UI components with Tailwind CSS and TypeScript?"
                  ],
                  speed: 30,
                  autoSubmit: true,
                  delayBetweenTexts: 2000
                } : undefined}
              />
            </motion.div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20 pointer-events-none"></div>
      </section>

      {/* Section How it works */}
      <section id="how-it-works" className="snap-start min-h-screen flex items-center justify-center bg-black text-white p-8 relative overflow-hidden">
        <div className="text-center max-w-4xl relative z-10 px-4 sm:px-6">
          <div className="space-y-3">
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90">
              You have fueled AI models around the world—for free—with your data.
            </p>
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90">
              Now it's time to take back control: generate your MyDigiSelf NFT, join SmartBanker,
            </p>
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90">
              and finally capture the value you help create.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20 pointer-events-none"></div>
      </section>

      {/* Section What it means for you */}
      <section id="what-it-means" className="snap-start min-h-screen flex items-center justify-center bg-black text-white p-8 relative overflow-hidden">
        <div className="text-center max-w-4xl relative z-10 px-4 sm:px-6">
          <div className="space-y-3">
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90 ml-8 sm:ml-12 md:ml-16">
              Claim your digital identity.
            </p>
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90 ml-8 sm:ml-12 md:ml-16">
              Become a true shareholder—not just a user.
            </p>
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90 ml-8 sm:ml-12 md:ml-16">
              Your data, your expertise, your network don't just work for big tech anymore;
            </p>
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90 ml-8 sm:ml-12 md:ml-16">
              they build value for you.
            </p>
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90 ml-8 sm:ml-12 md:ml-16">
              You gain control over your digital footprint.
            </p>
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90 ml-8 sm:ml-12 md:ml-16">
              You earn rewards as you contribute.
            </p>
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90 ml-8 sm:ml-12 md:ml-16">
              You help power the next generation of finance—where every member owns a share of the future.
            </p>
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/90 ml-8 sm:ml-12 md:ml-16">
              Here, you don't just participate—you shape the economy.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20 pointer-events-none"></div>
      </section>

      {/* Section Receive Your SBT */}
      <section id="receive-sbt" className="snap-start min-h-screen flex items-center justify-center bg-black text-white p-8 relative overflow-hidden">
        <div className="text-center max-w-4xl relative z-10">
          <div className="space-y-8">
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Soulbound tokens for your network
            </p>
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Proof of your connections
            </p>
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Non-transferable, permanently yours
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20 pointer-events-none"></div>
      </section>

      {/* Section Roadmaps */}
      <section id="roadmaps" className="snap-start min-h-screen flex items-center justify-center bg-black text-white p-8 relative overflow-hidden">
        <div className="text-center max-w-4xl relative z-10">
          <div className="space-y-8">
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Q1 2024 - Network launch
            </p>
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Q2 2024 - SBT integration
            </p>
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Q3 2024 - Monetization features
            </p>
            <p className="text-sm sm:text-base font-light tracking-[0.15em] uppercase leading-relaxed">
              Q4 2024 - Global expansion
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20 pointer-events-none"></div>
      </section>
    </main>
  )
}

