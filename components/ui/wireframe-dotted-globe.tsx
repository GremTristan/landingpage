"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import * as d3 from "d3"

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
  pointGenerationInterval?: number // Intervalle en millisecondes entre chaque génération de point (défaut: 800ms)
  maxPoints?: number // Nombre maximum de points à générer (défaut: 100)
}

export default function RotatingEarth({ 
  width = 800, 
  height = 600, 
  className = "",
  pointGenerationInterval: customInterval = 800, // Intervalle pour un rafraîchissement lisible
  maxPoints: customMaxPoints = 100
}: RotatingEarthProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [terminalLogs, setTerminalLogs] = useState<Array<{id: number, message: string, color: string}>>([])
  const [dataExchangeCount, setDataExchangeCount] = useState(0)
  const setTerminalLogsRef = useRef(setTerminalLogs)
  const setDataExchangeCountRef = useRef(setDataExchangeCount)
  const terminalRefForScroll = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollDirectionRef = useRef<number>(0)

  // Mettre à jour les refs quand les setters changent
  useEffect(() => {
    setTerminalLogsRef.current = setTerminalLogs
    setDataExchangeCountRef.current = setDataExchangeCount
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    // Set up responsive dimensions
    const isMobile = window.innerWidth < 640
    const padding = isMobile ? 20 : 40
    const containerWidth = Math.min(width, window.innerWidth - padding)
    const containerHeight = Math.min(height, window.innerHeight - (isMobile ? 150 : 100))
    const radius = Math.min(containerWidth, containerHeight) / 2.5

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    // Create projection and path generator for Canvas
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(context)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }

      return inside
    }

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry

      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates
        // Check if point is in outer ring
        if (!pointInPolygon(point, coordinates[0])) {
          return false
        }
        // Check if point is in any hole (inner rings)
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) {
            return false // Point is in a hole
          }
        }
        return true
      } else if (geometry.type === "MultiPolygon") {
        // Check each polygon in the MultiPolygon
        for (const polygon of geometry.coordinates) {
          // Check if point is in outer ring
          if (pointInPolygon(point, polygon[0])) {
            // Check if point is in any hole
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true
                break
              }
            }
            if (!inHole) {
              return true
            }
          }
        }
        return false
      }

      return false
    }

    const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
      const dots: [number, number][] = []
      const bounds = d3.geoBounds(feature)
      const [[minLng, minLat], [maxLng, maxLat]] = bounds

      const stepSize = dotSpacing * 0.08
      let pointsGenerated = 0

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat]
          if (pointInFeature(point, feature)) {
            dots.push(point)
            pointsGenerated++
          }
        }
      }

      console.log(
        `[v0] Generated ${pointsGenerated} points for land feature:`,
        feature.properties?.featurecla || "Land",
      )
      return dots
    }

    interface DotData {
      lng: number
      lat: number
      visible: boolean
    }

    interface FluorescentPoint {
      lng: number
      lat: number
      color: string
      size: number
      pulsePhase: number
      pulseSpeed: number
      appearTime: number // Temps d'apparition en millisecondes
      dataOwner: string // Propriétaire de la donnée
      dataUser: string // Utilisateur de la donnée
      dataType: string // Type de donnée
    }

    const allDots: DotData[] = []
    const fluorescentPoints: FluorescentPoint[] = []
    let landFeatures: any
    let pointGenerationInterval: NodeJS.Timeout | null = null

    // Couleurs disponibles pour les points
    const colors = [
      "#00ff00", // Vert fluorescent
      "#00ffff", // Cyan fluorescent
      "#ffff00", // Jaune fluorescent
      "#ff00ff", // Magenta fluorescent
      "#00ff88", // Vert-cyan
      "#ff8800", // Orange fluorescent
    ]

    // Données pour générer des informations réalistes
    const dataOwners = [
      "Alice Chen", "Bob Martinez", "Carol Johnson", "David Kim", "Emma Wilson",
      "Frank Liu", "Grace Park", "Henry Brown", "Iris Taylor", "Jack Anderson",
      "Kate White", "Leo Garcia", "Mia Rodriguez", "Noah Lee", "Olivia Davis"
    ]

    const dataUsers = [
      "TechCorp Inc.", "DataStream Ltd.", "CloudNet Systems", "InfoShare Co.",
      "DigitalWorks", "ByteForce", "NetLink Solutions", "DataFlow Inc.",
      "CyberSync", "InfoTech Global", "DataVault Systems", "CloudBridge"
    ]

    const dataTypes = [
      "Personal Profile", "Location Data", "Purchase History", "Browsing Behavior",
      "Social Network", "Health Records", "Financial Info", "Communication Logs",
      "Biometric Data", "Search Queries", "Device Info", "Preferences"
    ]

    // Fonction pour générer des informations aléatoires pour un point
    const generatePointInfo = () => {
      return {
        dataOwner: dataOwners[Math.floor(Math.random() * dataOwners.length)],
        dataUser: dataUsers[Math.floor(Math.random() * dataUsers.length)],
        dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)]
      }
    }

    // Fonction pour obtenir le nom de la couleur
    const getColorName = (color: string): string => {
      const colorMap: { [key: string]: string } = {
        "#00ff00": "vert",
        "#00ffff": "cyan",
        "#ffff00": "jaune",
        "#ff00ff": "magenta",
        "#00ff88": "vert-cyan",
        "#ff8800": "orange"
      }
      return colorMap[color] || "fluorescent"
    }

    // Fonction pour afficher les informations dans le terminal visuel
    const logToTerminal = (point: FluorescentPoint) => {
      const message = `utilisé par ${point.dataUser}, généré par ${point.dataOwner}`
      
      // Incrémenter le compteur d'échanges (chaque point généré = 1 échange)
      setDataExchangeCountRef.current(prev => prev + 1)
      
      // Ajouter au terminal visuel via la ref
      setTerminalLogsRef.current(prev => {
        const newLogs = [...prev, { id: Date.now(), message, color: point.color }]
        // Garder seulement les 20 derniers logs pour l'affichage (plus lisible)
        return newLogs.slice(-20)
      })

      // Scroll automatique vers le bas
      setTimeout(() => {
        if (terminalRefForScroll.current) {
          terminalRefForScroll.current.scrollTop = terminalRefForScroll.current.scrollHeight
        }
      }, 10)

      // Aussi dans la console
      const timestamp = new Date().toISOString()
      const location = `${point.lat.toFixed(2)}°N, ${point.lng.toFixed(2)}°E`
      console.log(
        `%c[${timestamp}]%c DATA ACCESS DETECTED`,
        'color: #00ff00; font-weight: bold;',
        'color: #ffffff; font-weight: bold;'
      )
      console.log(`%c  Location: %c${location}`, 'color: #888;', 'color: #00ffff;')
      console.log(`%c  Data Owner: %c${point.dataOwner}`, 'color: #888;', 'color: #ff00ff;')
      console.log(`%c  Data Type: %c${point.dataType}`, 'color: #888;', 'color: #ffff00;')
      console.log(`%c  Used By: %c${point.dataUser}`, 'color: #888;', 'color: #00ff88;')
      console.log(`%c  ──────────────────────────────────────`, 'color: #333;')
    }

    // Générer un seul point fluorescent uniquement sur les continents
    const generateSingleFluorescentPoint = (): FluorescentPoint | null => {
      if (!landFeatures || !landFeatures.features || landFeatures.features.length === 0) {
        return null // Pas de données de continents disponibles
      }

      // Essayer de trouver un point sur un continent (maximum 100 tentatives pour éviter une boucle infinie)
      let attempts = 0
      const maxAttempts = 100

      while (attempts < maxAttempts) {
        // Générer des coordonnées aléatoires
        const lng = (Math.random() - 0.5) * 360 // -180 à 180
        const lat = Math.asin(Math.random() * 2 - 1) * (180 / Math.PI) // Distribution uniforme sur la sphère
        const point: [number, number] = [lng, lat]

        // Vérifier si le point se trouve dans un continent
        for (const feature of landFeatures.features) {
          if (pointInFeature(point, feature)) {
            // Point trouvé sur un continent !
            const pointInfo = generatePointInfo()
            const newPoint: FluorescentPoint = {
              lng,
              lat,
              color: colors[Math.floor(Math.random() * colors.length)],
              size: 0.8 + Math.random() * 0.6, // Taille entre 0.8 et 1.4 (plus visible)
              pulsePhase: Math.random() * Math.PI * 2, // Phase aléatoire pour la pulsation
              pulseSpeed: 0.03 + Math.random() * 0.04, // Vitesse de pulsation variable (plus rapide)
              appearTime: Date.now(), // Temps d'apparition
              dataOwner: pointInfo.dataOwner,
              dataUser: pointInfo.dataUser,
              dataType: pointInfo.dataType
            }
            
            // Afficher les informations dans le terminal
            logToTerminal(newPoint)
            
            return newPoint
          }
        }
        attempts++
      }

      // Si on n'a pas trouvé de point après maxAttempts tentatives, retourner null
      return null
    }

    // Configuration : générer un groupe aléatoire de points toutes les t secondes
    // Chaque point représente un utilisateur qui utilise une donnée appartenant à quelqu'un d'autre
    const POINT_GENERATION_INTERVAL = customInterval // en millisecondes
    const MAX_POINTS = customMaxPoints // Nombre maximum de points à générer
    const MIN_POINTS_PER_BATCH = 1 // Nombre minimum de points par batch
    const MAX_POINTS_PER_BATCH = 2 // Nombre maximum de points par batch

        // Fonction pour générer un groupe aléatoire de points
        const generateBatchOfPoints = (count: number): void => {
          for (let i = 0; i < count; i++) {
            const newPoint = generateSingleFluorescentPoint()
            if (newPoint) {
              // Si on a atteint le maximum, remplacer le plus ancien point
              if (fluorescentPoints.length >= MAX_POINTS) {
                fluorescentPoints.shift() // Retirer le plus ancien point
              }
              fluorescentPoints.push(newPoint)
              // Le compteur sera mis à jour automatiquement via le log qui est créé dans generateSingleFluorescentPoint
            }
          }
        }

    // Fonction pour démarrer la génération progressive des points
    const startProgressivePointGeneration = () => {
      // Ne pas démarrer si les données de continents ne sont pas encore chargées
      if (!landFeatures || !landFeatures.features || landFeatures.features.length === 0) {
        return
      }

      // Générer le premier batch immédiatement
      const firstBatchSize = Math.floor(Math.random() * (MAX_POINTS_PER_BATCH - MIN_POINTS_PER_BATCH + 1)) + MIN_POINTS_PER_BATCH
      generateBatchOfPoints(firstBatchSize)
      
      // Puis générer un batch aléatoire toutes les t secondes
      pointGenerationInterval = setInterval(() => {
        // Continuer à générer des points même après avoir atteint MAX_POINTS
        // Les anciens points seront remplacés par les nouveaux
        const batchSize = Math.floor(Math.random() * (MAX_POINTS_PER_BATCH - MIN_POINTS_PER_BATCH + 1)) + MIN_POINTS_PER_BATCH
        generateBatchOfPoints(batchSize)
      }, POINT_GENERATION_INTERVAL)
    }

    const render = () => {
      // Clear canvas
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Draw ocean (globe background)
      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = "#000000"
      context.fill()
      context.strokeStyle = "#ffffff"
      context.lineWidth = 2 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Draw graticule
        const graticule = d3.geoGraticule()
        context.beginPath()
        path(graticule())
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1 * scaleFactor
        context.globalAlpha = 0.25
        context.stroke()
        context.globalAlpha = 1

        // Draw land outlines
        context.beginPath()
        landFeatures.features.forEach((feature: any) => {
          path(feature)
        })
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1 * scaleFactor
        context.stroke()

        // Draw halftone dots
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat])
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            context.beginPath()
            context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI)
            context.fillStyle = "#999999"
            context.fill()
          }
        })

        // Draw fluorescent points with pulsation effect
        const currentTime = Date.now() * 0.001 // Time in seconds
        const currentTimeMs = Date.now()
        
        fluorescentPoints.forEach((point) => {
          const projected = projection([point.lng, point.lat])
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            // Calculer l'opacité d'apparition (fade in sur 1 seconde)
            const timeSinceAppearance = currentTimeMs - point.appearTime
            const fadeInDuration = 1000 // 1 seconde pour l'apparition complète
            const appearOpacity = Math.min(1, timeSinceAppearance / fadeInDuration)
            
            // Calculate pulsation
            const pulse = Math.sin(currentTime * point.pulseSpeed + point.pulsePhase) * 0.5 + 0.5
            const currentSize = point.size * scaleFactor * (0.8 + pulse * 0.4) // Pulse between 80% and 120% of size (plus stable)
            const baseOpacity = 1.0 + pulse * 0.2 // Opacity between 1.0 and 1.2 (très lumineux)
            const opacity = Math.min(1, baseOpacity * appearOpacity) // Combiner l'opacité de pulsation avec l'opacité d'apparition

            // Draw glow effect (outer circle) - halo plus grand et plus visible
            const gradient = context.createRadialGradient(
              projected[0],
              projected[1],
              0,
              projected[0],
              projected[1],
              currentSize * 3.0
            )
            // Convert hex color to rgba for opacity
            const hexToRgba = (hex: string, alpha: number) => {
              const r = parseInt(hex.slice(1, 3), 16)
              const g = parseInt(hex.slice(3, 5), 16)
              const b = parseInt(hex.slice(5, 7), 16)
              return `rgba(${r}, ${g}, ${b}, ${alpha})`
            }
            gradient.addColorStop(0, hexToRgba(point.color, 1.0)) // Halo très lumineux
            gradient.addColorStop(0.2, hexToRgba(point.color, 0.8))
            gradient.addColorStop(0.5, hexToRgba(point.color, 0.4))
            gradient.addColorStop(1, hexToRgba(point.color, 0))

            context.beginPath()
            context.arc(projected[0], projected[1], currentSize * 3.0, 0, 2 * Math.PI)
            context.fillStyle = gradient
            context.fill()

            // Draw main point - très lumineux
            context.beginPath()
            context.arc(projected[0], projected[1], currentSize, 0, 2 * Math.PI)
            context.fillStyle = point.color
            context.globalAlpha = Math.min(1, opacity * 1.5) // Luminosité maximale
            context.fill()
            context.globalAlpha = 1

            // Draw bright center - très lumineux et plus grand
            context.beginPath()
            context.arc(projected[0], projected[1], currentSize * 0.5, 0, 2 * Math.PI)
            context.fillStyle = "#ffffff"
            context.globalAlpha = Math.min(1, opacity * 1.2) // Centre blanc très lumineux
            context.fill()
            context.globalAlpha = 1
          }
        })
      }
    }

    const loadWorldData = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        )
        if (!response.ok) throw new Error("Failed to load land data")

        landFeatures = await response.json()

        // Generate dots for all land features
        let totalDots = 0
        landFeatures.features.forEach((feature: any) => {
          const dots = generateDotsInPolygon(feature, 16)
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat, visible: true })
            totalDots++
          })
        })

        console.log(`[v0] Total dots generated: ${totalDots} across ${landFeatures.features.length} land features`)

        render()
        setIsLoading(false)
        
        // Démarrer la génération progressive des points fluorescents maintenant que les continents sont chargés
        startProgressivePointGeneration()
      } catch (err) {
        setError("Failed to load land map data")
        setIsLoading(false)
      }
    }

    // Set up rotation and interaction
    const rotation: [number, number] = [0, 0]
    let autoRotate = true
    const rotationSpeed = 0.5

    // Animation frame for continuous rendering (for pulsation effect)
    let animationFrameId: number

    const animate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed
        projection.rotate(rotation)
      }
      render()
      animationFrameId = requestAnimationFrame(animate)
    }

    // Start animation loop
    animate()

    // Cleanup animation
    const cleanup = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRotation: [number, number] = [rotation[0], rotation[1]]

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.5
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        rotation[0] = startRotation[0] + dx * sensitivity
        rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * sensitivity))

        projection.rotate(rotation)
        render()
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)

        setTimeout(() => {
          autoRotate = true
        }, 10)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      
      // Accumuler la direction du scroll
      scrollDirectionRef.current += event.deltaY
      
      // Nettoyer le timeout précédent
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      // Après un court délai sans scroll, naviguer vers la prochaine page
      scrollTimeoutRef.current = setTimeout(() => {
        const direction = scrollDirectionRef.current > 0 ? 1 : -1
        scrollDirectionRef.current = 0
        
        // Obtenir les pages depuis la navbar
        const pages = ['/', '#about', '#projects', '#contact']
        const currentPath = window.location.pathname + window.location.hash
        const currentIndex = pages.findIndex(page => 
          currentPath === page || currentPath.startsWith(page)
        )
        
        if (direction > 0 && currentIndex < pages.length - 1) {
          // Scroll vers le bas : page suivante
          const nextPage = pages[currentIndex + 1]
          if (nextPage.startsWith('#')) {
            // Section sur la même page
            const element = document.querySelector(nextPage)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' })
            }
          } else {
            // Nouvelle page
            router.push(nextPage)
          }
        } else if (direction < 0 && currentIndex > 0) {
          // Scroll vers le haut : page précédente
          const prevPage = pages[currentIndex - 1]
          if (prevPage.startsWith('#')) {
            // Section sur la même page
            const element = document.querySelector(prevPage)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' })
            }
          } else {
            // Nouvelle page
            router.push(prevPage)
          }
        }
      }, 150) // Délai de 150ms après le dernier scroll
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("wheel", handleWheel)

    // Load the world data
    loadWorldData()

    // Cleanup
    return () => {
      cleanup()
      if (pointGenerationInterval) {
        clearInterval(pointGenerationInterval)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [width, height, customInterval, customMaxPoints, router])

  if (error) {
    return (
      <div className={`dark flex items-center justify-center bg-card rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <p className="dark text-destructive font-semibold mb-2">Error loading Earth visualization</p>
          <p className="dark text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative flex items-center justify-center w-full ${className}`}>
      {/* Globe centré */}
      <div className="relative flex items-center justify-center w-full">
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg sm:rounded-xl md:rounded-2xl bg-background dark"
          style={{ maxWidth: "100%", height: "auto" }}
        />
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 text-[10px] sm:text-xs text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md dark bg-black/80 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-mono font-semibold">
              {dataExchangeCount.toLocaleString('fr-FR')}
            </span>
            <span className="text-[9px] sm:text-[10px] text-white/70 font-light">
              échanges en temps réel
            </span>
          </div>
        </div>
      </div>
      
      {/* Terminal cinématique en arrière-plan - Desktop */}
      <div className="absolute right-20 sm:right-24 md:right-28 top-1/2 -translate-y-1/2 w-32 sm:w-36 md:w-40 bg-black/40 backdrop-blur-md rounded-md p-1.5 sm:p-2 flex flex-col hidden sm:flex z-0 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
        {/* Effet de lumière cinématique en haut */}
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        
        {/* Header avec effet cinématique */}
        <div className="text-white/80 text-[8px] sm:text-[9px] font-mono mb-1.5 border-b border-white/10 pb-1 flex items-center gap-1.5">
          <div className="w-0.5 h-0.5 rounded-full bg-white/60 animate-pulse"></div>
          <span className="tracking-[0.12em] uppercase">Data Access Log</span>
        </div>
        
        {/* Contenu du terminal avec scroll */}
        <div
          ref={terminalRefForScroll}
          className="flex-1 overflow-y-auto text-white/60 text-[7px] sm:text-[8px] font-mono space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ maxHeight: "200px" }}
        >
          {terminalLogs.length === 0 ? (
            <div className="text-white/20 text-[7px] sm:text-[8px] italic">Awaiting connection...</div>
          ) : (
            terminalLogs.map((log, index) => {
              const isNewest = index === terminalLogs.length - 1
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ 
                    opacity: isNewest ? [0, 1, 1] : 1, 
                    x: 0,
                    scale: isNewest ? [0.8, 1.05, 1] : 1,
                    backgroundColor: isNewest ? ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)", "transparent"] : "transparent"
                  }}
                  transition={{ 
                    duration: isNewest ? 0.6 : 0.3, 
                    delay: isNewest ? 0 : index * 0.02,
                    times: isNewest ? [0, 0.5, 1] : undefined
                  }}
                  className="flex items-start gap-1 sm:gap-1.5 rounded px-1 py-0.5"
                >
                  <motion.span
                    className="inline-block w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full flex-shrink-0 mt-0.5"
                    style={{ 
                      backgroundColor: log.color,
                      boxShadow: isNewest ? "0 0 4px currentColor" : "0 0 2px currentColor"
                    }}
                    initial={isNewest ? { scale: 0 } : { scale: 1 }}
                    animate={isNewest ? { 
                      scale: [0, 1.5, 1]
                    } : { scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                  <span className="leading-tight text-[7px] sm:text-[8px] tracking-[0.05em]">{log.message}</span>
                </motion.div>
              )
            })
          )}
        </div>
        
        {/* Effet de lumière cinématique en bas */}
        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
      
      {/* Terminal mobile cinématique - en bas */}
      <div className="fixed bottom-16 left-2 right-2 sm:hidden bg-black/40 backdrop-blur-md rounded-lg p-2 flex flex-col max-h-32 z-40 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        <div className="text-white/80 text-[8px] font-mono mb-1.5 border-b border-white/10 pb-1 flex items-center gap-1.5">
          <div className="w-0.5 h-0.5 rounded-full bg-white/60 animate-pulse"></div>
          <span className="tracking-[0.15em] uppercase">Data Access Log</span>
        </div>
        <div className="overflow-y-auto text-white/60 text-[7px] font-mono space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {terminalLogs.length === 0 ? (
            <div className="text-white/20 text-[7px] italic">Awaiting...</div>
          ) : (
            terminalLogs.slice(-5).map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="flex items-start gap-1"
              >
                <span
                  className="inline-block w-0.5 h-0.5 rounded-full flex-shrink-0 mt-0.5 shadow-[0_0_2px_currentColor]"
                  style={{ backgroundColor: log.color }}
                />
                <span className="leading-tight text-[7px] truncate tracking-[0.05em]">{log.message}</span>
              </motion.div>
            ))
          )}
        </div>
        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    </div>
  )
}

