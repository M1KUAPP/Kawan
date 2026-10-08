// Eye — Kawan's mark, alive. A hand-drawn eye with one raised, skeptical brow (the logo) whose
// shader iris follows the pointer, wanders when you're still, blinks, and squints at self-report.
// DESIGN.md §8: no bouncy overshoot, so the gaze spring is critically damped.

import { GrainGradient } from '@paper-design/shaders-react'
import { animate, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect, useId, useMemo, useRef } from 'react'
import { usePalette } from './palette'
import { ShaderSurface } from './ShaderSurface'
import { useStill } from './stillness'

export type EyeMood = 'asleep' | 'idle' | 'suspicious' | 'pleased'

const OPENNESS: Record<EyeMood, number> = { asleep: 0.04, idle: 0.7, suspicious: 0.42, pleased: 0.96 }
const PUPIL: Record<EyeMood, number> = { asleep: 1, idle: 1, suspicious: 0.7, pleased: 1.18 }

// One raised brow, like the logo. Every pose shares the same commands so the path can morph.
const BROW: Record<EyeMood, string> = {
  asleep: 'M 226 78 C 266 70 314 70 352 84',
  idle: 'M 222 50 C 262 22 320 20 358 48',
  suspicious: 'M 212 84 C 256 62 314 52 360 62',
  pleased: 'M 218 34 C 262 2 322 2 362 30'
}

const W = 400
const H = 260
const CY = 150

/** The almond between the lids, at openness `o`, scaled to (sx, sy). */
function almond(o: number, sx = 1, sy = 1) {
  const up = CY - 132 * o
  const down = CY + 104 * o
  const p = (x: number, y: number) => `${(x * sx).toFixed(4)} ${(y * sy).toFixed(4)}`
  return `M ${p(30, CY)} C ${p(118, up)} ${p(282, up)} ${p(370, CY)} C ${p(282, down)} ${p(118, down)} ${p(30, CY)} Z`
}

function upperLid(o: number) {
  const up = CY - 132 * o
  return `M 20 ${CY + 6} C 112 ${up} 286 ${up} 380 ${CY - 6}`
}

/** The crease above the upper lid; it sinks with the lid, which makes the stare heavier. */
function crease(o: number) {
  const up = CY - 132 * o - 10
  return `M 112 ${CY - 82 * o} C 162 ${up} 250 ${up} 300 ${CY - 86 * o}`
}

function lowerLid(o: number) {
  const down = CY + 104 * o
  return `M 372 ${CY} C 282 ${down} 118 ${down} 32 ${CY + 1}`
}

// Critically damped: 2 * sqrt(stiffness * mass) ≈ 32.2, so the iris settles without overshoot.
const GAZE_SPRING = { stiffness: 260, damping: 33, mass: 1 }

interface EyeProps {
  mood?: EyeMood
  /** A viewport point to stare at instead of following the pointer. */
  focus?: { x: number; y: number } | null
  /** Paper shader iris; the small CTA eye uses the CSS iris instead. */
  shader?: boolean
  /** `stage`: drawn in cream for the dark stages, which are dark in both themes. */
  tone?: 'page' | 'stage'
  className?: string
}

export function Eye({ mood = 'idle', focus = null, shader = true, tone = 'page', className = '' }: EyeProps) {
  const still = useStill()
  const palette = usePalette()
  const hostRef = useRef<HTMLDivElement>(null)
  const ids = useId().replace(/:/g, '')
  const clipId = `kl-eye-clip-${ids}`
  const wobbleId = `kl-wobble-${ids}`

  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const gazeX = useSpring(targetX, GAZE_SPRING)
  const gazeY = useSpring(targetY, GAZE_SPRING)
  const irisX = useTransform(gazeX, (v) => `${v * 65}%`)
  const irisY = useTransform(gazeY, (v) => `${v * 18}%`)

  const moodOpen = useMotionValue(OPENNESS.asleep)
  const blink = useMotionValue(1)
  const open = useTransform([moodOpen, blink], ([m, b]: number[]) => m * b)
  const clipPath = useTransform(open, (o) => almond(o, 1 / W, 1 / H))
  const whitePath = useTransform(open, (o) => almond(o))
  const upperPath = useTransform(open, upperLid)
  const lowerPath = useTransform(open, lowerLid)
  const creasePath = useTransform(moodOpen, crease)

  // Lids follow the mood: open slowly on waking, quickly otherwise.
  useEffect(() => {
    const target = OPENNESS[mood]
    if (still) {
      moodOpen.set(mood === 'asleep' ? OPENNESS.idle : target)
      return
    }
    const waking = moodOpen.get() < 0.1
    const controls = animate(moodOpen, target, { duration: waking ? 0.7 : 0.26, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [mood, still, moodOpen])

  // Blink every few seconds, sometimes twice.
  useEffect(() => {
    if (still || mood === 'asleep') return
    let timer = 0
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          const twice = Math.random() < 0.18
          animate(blink, twice ? [1, 0.04, 1, 0.04, 1] : [1, 0.04, 1], {
            duration: twice ? 0.46 : 0.22,
            ease: 'easeInOut'
          })
          schedule()
        },
        2600 + Math.random() * 3600
      )
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [still, mood, blink])

  // Look at the focus point, else follow the pointer, else wander.
  useEffect(() => {
    const lookAt = (x: number, y: number) => {
      const box = hostRef.current?.getBoundingClientRect()
      if (!box) return
      const dx = x - (box.left + box.width / 2)
      const dy = y - (box.top + box.height * (CY / H))
      targetX.set(Math.tanh(dx / (box.width * 0.9)))
      targetY.set(Math.tanh(dy / (box.height * 1.4)))
    }
    if (still) {
      targetX.set(0)
      targetY.set(0)
      return
    }
    if (focus) {
      lookAt(focus.x, focus.y)
      return
    }
    let lastMove = 0
    let wander = 0
    const onMove = (event: PointerEvent) => {
      lastMove = performance.now()
      lookAt(event.clientX, event.clientY)
    }
    const drift = () => {
      wander = window.setTimeout(
        () => {
          if (performance.now() - lastMove > 3200) {
            targetX.set((Math.random() * 2 - 1) * 0.7)
            targetY.set((Math.random() * 2 - 1) * 0.55)
          }
          drift()
        },
        1500 + Math.random() * 2000
      )
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    drift()
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.clearTimeout(wander)
    }
  }, [still, focus, targetX, targetY])

  const irisColors = useMemo(
    () => [palette.accent, palette['accent-press'], palette.accent, palette['accent-tint']],
    [palette]
  )

  const ease = { duration: 0.26, ease: [0.16, 1, 0.3, 1] } as const

  return (
    <div ref={hostRef} className={`relative aspect-[400/260] select-none ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <motion.path d={clipPath} />
          </clipPath>
          <filter id={wobbleId} x="-10%" y="-20%" width="120%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="1" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="5" />
          </filter>
        </defs>
        <motion.path d={whitePath} className={tone === 'stage' ? 'fill-stage-raised' : 'fill-surface-2'} />
      </svg>

      {/* Iris, pupil and catchlight, clipped to the almond so the lids can close over them. */}
      <div className="absolute inset-0" style={{ clipPath: `url(#${clipId})` }}>
        <motion.div
          className="absolute top-[34.6%] left-[35%] h-[46.2%] w-[30%] overflow-hidden rounded-full"
          style={{ x: irisX, y: irisY }}
        >
          {shader ? (
            <ShaderSurface
              className="absolute inset-0"
              fallback={<div className="kl-iris-fallback absolute inset-0" />}
            >
              {(sizing, speedScale) => (
                <GrainGradient
                  {...sizing}
                  colorBack={palette['accent-press']}
                  colors={irisColors}
                  shape="sphere"
                  softness={0.7}
                  intensity={0.35}
                  noise={0.4}
                  speed={0.6 * speedScale}
                />
              )}
            </ShaderSurface>
          ) : (
            <div className="kl-iris-fallback absolute inset-0" />
          )}
          <div className="kl-iris-fibers absolute inset-0 rounded-full" />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_3px_rgb(31_22_17/0.55),inset_0_0_16px_rgb(31_22_17/0.45)]" />
          <motion.div
            className="absolute top-[30%] left-[30%] h-[40%] w-[40%] rounded-full bg-pupil"
            animate={{ scale: PUPIL[mood] }}
            transition={ease}
          />
          <div className="absolute top-[22%] left-[25%] h-[15%] w-[15%] rounded-full bg-cream/90" />
          <div className="absolute top-[38%] left-[22%] h-[6%] w-[6%] rounded-full bg-cream/70" />
        </motion.div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <g
          filter={`url(#${wobbleId})`}
          className={`fill-none ${tone === 'stage' ? 'stroke-cream' : 'stroke-ink'}`}
          strokeWidth={15}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path d={upperPath} />
          <motion.path d={lowerPath} strokeWidth={11} />
          <motion.path d={creasePath} strokeWidth={5} />
          <motion.path
            initial={false}
            animate={{ d: BROW[mood] }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            strokeWidth={13}
          />
        </g>
        {/* Doubt marks while it squints at you. */}
        <g className="fill-none stroke-accent" strokeWidth={6} strokeLinecap="round">
          {['M 374 30 L 390 14', 'M 382 58 L 398 54', 'M 352 16 L 356 -2'].map((d, i) => (
            <motion.path
              key={d}
              d={d}
              initial={false}
              animate={{ pathLength: mood === 'suspicious' ? 1 : 0, opacity: mood === 'suspicious' ? 1 : 0 }}
              transition={{ duration: 0.18, delay: mood === 'suspicious' ? 0.08 * i : 0 }}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
