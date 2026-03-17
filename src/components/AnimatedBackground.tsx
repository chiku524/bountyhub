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

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Engineering / innovation: blueprint-style grid (visible but not overwhelming)
    const gridSpacing = 48
    const gridOpacity = theme === 'light' ? 0.12 : 0.14

    // Particles as "team" nodes — some larger (leadership hubs), most smaller (team)
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      color: string
      isHub: boolean
      pulsePhase: number
    }

    const particles: Particle[] = []
    const particleCount = 70
    const hubCount = 5

    const colors = theme === 'light'
      ? ['#4F46E5', '#6366f1', '#7C3AED', '#06B6D4', '#0EA5E9']
      : ['#6366f1', '#818cf8', '#a78bfa', '#22d3ee', '#38bdf8']

    for (let i = 0; i < particleCount; i++) {
      const isHub = i < hubCount
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: isHub ? Math.random() * 3 + 4 : Math.random() * 2.5 + 1.2,
        opacity: isHub ? 0.85 : Math.random() * 0.5 + 0.35,
        color: colors[Math.floor(Math.random() * colors.length)],
        isHub,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    let time = 0
    let animationId: number

    const animate = () => {
      time += 0.016
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Engineering: blueprint grid
      ctx.strokeStyle = theme === 'light' ? '#4F46E5' : '#818cf8'
      ctx.lineWidth = 0.5
      ctx.globalAlpha = gridOpacity + Math.sin(time * 0.5) * 0.02
      for (let x = 0; x <= canvas.width + gridSpacing; x += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y <= canvas.height + gridSpacing; y += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // Innovation / automation: flowing horizontal "data" lines
      ctx.globalAlpha = theme === 'light' ? 0.09 : 0.12
      ctx.strokeStyle = theme === 'light' ? '#06B6D4' : '#22d3ee'
      ctx.lineWidth = 1
      for (let row = 0; row < 5; row++) {
        const y = (canvas.height * (0.15 + row * 0.2)) + Math.sin(time + row) * 20
        ctx.beginPath()
        ctx.moveTo(-50, y)
        for (let x = 0; x <= canvas.width + 100; x += 80) {
          const wave = Math.sin((x * 0.02) + time * 0.8 + row) * 8
          ctx.lineTo(x, y + wave)
        }
        ctx.lineTo(canvas.width + 50, y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // Update and draw particles (teamwork network)
      particles.forEach((particle, i) => {
        particle.x += particle.vx
        particle.y += particle.vy
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))
        particle.pulsePhase += 0.04

        const pulse = particle.isHub ? 0.15 * Math.sin(particle.pulsePhase) + 1 : 1
        const r = particle.radius * pulse
        const opacityHex = Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${opacityHex}`
        ctx.fill()

        // Leadership: stronger glow on hub nodes
        if (particle.isHub) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, r * 4
          )
          gradient.addColorStop(0, `${particle.color}${Math.floor(particle.opacity * 0.5 * 255).toString(16).padStart(2, '0')}`)
          gradient.addColorStop(1, `${particle.color}00`)
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, r * 4, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        } else if (particle.radius > 2) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 2
          )
          gradient.addColorStop(0, `${particle.color}${Math.floor(particle.opacity * 0.4 * 255).toString(16).padStart(2, '0')}`)
          gradient.addColorStop(1, `${particle.color}00`)
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }

        // Teamwork: connections between nearby particles (automation / collaboration)
        particles.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 160) {
            const strength = 1 - distance / 160
            const linkOpacity = (strength * 0.45) + (particle.isHub || other.isHub ? 0.15 : 0)
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `${particle.color}${Math.floor(linkOpacity * 255).toString(16).padStart(2, '0')}`
            ctx.lineWidth = particle.isHub || other.isHub ? 1.2 : 0.9
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none w-full h-full"
      style={{
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        opacity: theme === 'light' ? 0.95 : 0.85,
        transition: 'opacity 0.3s ease-in-out',
      }}
    />
  )
}
