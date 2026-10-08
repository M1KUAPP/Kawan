// ShaderSurface — mounts a Paper shader only when it can help.
// Paper already pauses offscreen and in hidden tabs; this adds what it lacks:
// a WebGL2 check (its mount throws without it), skipping Save-Data and low-core devices,
// mounting near the viewport, a 1.5 device-pixel-ratio cap, a still frame when still,
// and releasing the WebGL context on unmount (its dispose never calls loseContext).

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useStill } from './stillness'

const MAX_PIXEL_RATIO = 1.5

let webgl2: boolean | undefined

function canRunShaders(): boolean {
  if (webgl2 === undefined) {
    try {
      const gl = document.createElement('canvas').getContext('webgl2')
      webgl2 = gl !== null
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      webgl2 = false
    }
  }
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  if (nav.connection?.saveData) return false
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) return false
  return webgl2
}

export interface ShaderSizing {
  minPixelRatio: number
  maxPixelCount: number
  className: string
}

interface ShaderSurfaceProps {
  className?: string
  /** Shown when shaders can't run, and underneath while the shader loads. */
  fallback?: ReactNode
  /** `speedScale` is 0 while the landing is still (reduced motion or paused), else 1. */
  children: (sizing: ShaderSizing, speedScale: number) => ReactNode
}

export function ShaderSurface({ className = '', fallback, children }: ShaderSurfaceProps) {
  const still = useStill()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [near, setNear] = useState(false)
  const [supported] = useState(canRunShaders)
  const [area, setArea] = useState(0)

  // Mount once the surface comes within a viewport of the screen; Paper pauses it offscreen after that.
  useEffect(() => {
    const host = hostRef.current
    if (!host || !supported) return
    const io = new IntersectionObserver(([entry]) => entry?.isIntersecting && setNear(true), {
      rootMargin: '100% 0px'
    })
    io.observe(host)
    const ro = new ResizeObserver(([entry]) => {
      const box = entry?.contentRect
      if (box) setArea(Math.ceil(box.width) * Math.ceil(box.height))
    })
    ro.observe(host)
    return () => {
      io.disconnect()
      ro.disconnect()
    }
  }, [supported])

  // Remember the canvas Paper creates, so its context can be released on unmount.
  useEffect(() => {
    if (!near) return
    let frame = 0
    let tries = 0
    const find = () => {
      const canvas = hostRef.current?.querySelector('canvas')
      if (canvas) canvasRef.current = canvas
      else if (tries++ < 120) frame = requestAnimationFrame(find)
    }
    find()
    return () => {
      cancelAnimationFrame(frame)
      const canvas = canvasRef.current
      canvasRef.current = null
      // Let Paper's own dispose run first, then drop the context instead of waiting for GC.
      if (canvas) setTimeout(() => canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext())
    }
  }, [near])

  return (
    <div ref={hostRef} className={`overflow-hidden ${className}`} aria-hidden="true">
      {fallback}
      {supported && near && area > 0
        ? children(
            {
              minPixelRatio: 1,
              maxPixelCount: Math.round(area * MAX_PIXEL_RATIO * MAX_PIXEL_RATIO),
              className: 'absolute inset-0'
            },
            still ? 0 : 1
          )
        : null}
    </div>
  )
}
