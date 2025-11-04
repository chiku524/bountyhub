import { useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeProvider'

export function AnimatedBackground() {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particle system
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      color: string
    }

    const particles: Particle[] = []
    const particleCount = 80 // Increased from 50 to 80

    // Color scheme based on theme
    const colors = theme === 'light' 
      ? ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f472b6', '#c084fc'] // Indigo/Purple/Pink for light mode
      : ['#6366f1', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6'] // Indigo/Purple for dark mode

    // Create particles with varied sizes
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6, // Slightly faster movement
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 4 + 1.5, // Varied sizes (1.5 to 5.5)
        opacity: Math.random() * 0.6 + 0.3, // More visible opacity
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fill()

        // Draw connections between nearby particles
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 180) { // Increased connection distance from 150 to 180
            const opacity = (1 - distance / 180) * 0.5 // Increased opacity for better visibility (0.3 -> 0.5)
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `${particle.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
            ctx.lineWidth = 1.0 // Slightly thicker lines (0.8 -> 1.0)
            ctx.stroke()
          }
        })
        
        // Add glow effect to larger particles (reduced threshold from 3 to 2.5 for more glows)
        if (particle.radius > 2.5) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 2.5
          )
          const glowOpacity = particle.opacity * 0.6 // More visible glow
          gradient.addColorStop(0, `${particle.color}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')}`)
          gradient.addColorStop(1, `${particle.color}00`)
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 0,
        opacity: theme === 'light' ? 0.9 : 0.7,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  )
}

