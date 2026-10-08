// Hero — "It doesn't believe you. Yet." The eye wakes up, follows you, and squints when you
// reach for the one button Kawan doesn't have: "Mark as done".

import { PaperTexture } from '@paper-design/shaders-react'
import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Eye, type EyeMood } from './Eye'
import { usePalette } from './palette'
import { CtaLink, EASE_OUT, Sparkle } from './parts'
import { ShaderSurface } from './ShaderSurface'
import { useStill } from './stillness'

const HEADLINE = ['It', "doesn't", 'believe', 'you.']

export function Hero() {
  const still = useStill()
  const palette = usePalette()
  const [awake, setAwake] = useState(false)
  const [mood, setMood] = useState<EyeMood>('asleep')
  const [focus, setFocus] = useState<{ x: number; y: number } | null>(null)
  const [tried, setTried] = useState(false)
  const [flash, setFlash] = useState(false)
  const checkRef = useRef<HTMLLabelElement>(null)
  const settle = useRef(0)

  // The eye opens once the headline has landed.
  useEffect(() => {
    if (still) {
      setAwake(true)
      return
    }
    const timer = window.setTimeout(() => setAwake(true), 1100)
    return () => window.clearTimeout(timer)
  }, [still])

  useEffect(() => {
    if (awake) setMood((m) => (m === 'asleep' ? 'idle' : m))
  }, [awake])

  useEffect(() => () => window.clearTimeout(settle.current), [])

  const lookAtCheckbox = () => {
    const box = checkRef.current?.getBoundingClientRect()
    if (box) setFocus({ x: box.left + 24, y: box.top + box.height / 2 })
  }

  // While the "Nice try" reply is up, the reply's own timer decides when the eye relaxes.
  const suspect = (on: boolean) => {
    if (!awake || flash) return
    if (on) {
      lookAtCheckbox()
      setMood('suspicious')
    } else {
      setFocus(null)
      setMood('idle')
    }
  }

  const tryToSelfReport = () => {
    setTried(true)
    setFlash(true)
    setMood('suspicious')
    lookAtCheckbox()
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => {
      setFlash(false)
      setFocus(null)
      setMood('idle')
    }, 2400)
  }

  const word = (delay: number) => ({
    initial: { opacity: 0, y: '0.45em', filter: 'blur(8px)' },
    animate: { opacity: 1, y: '0em', filter: 'blur(0px)' },
    transition: { duration: 0.8, ease: EASE_OUT, delay }
  })

  return (
    <section
      className="relative isolate flex min-h-[min(100svh,1000px)] flex-col justify-center overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20"
      aria-labelledby="hero-title"
    >
      {/* Backdrop: crumpled cream paper (static, drawn once), grid lines and a warm glow behind the eye. */}
      <ShaderSurface className="kl-fade-bottom absolute inset-0 -z-10" fallback={null}>
        {(sizing) => (
          <PaperTexture
            {...sizing}
            fit="cover"
            colorBack={palette.bg}
            colorPaper={palette.bg}
            colorShadow={palette.theme === 'dark' ? palette.evening : palette['surface-sunk']}
            seed={11}
            roughness={0.35}
            roughnessSize={0.45}
            fiber={0.3}
            fiberSize={0.4}
            folds={0}
            wrinkles={0.35}
            wrinkleSize={0.5}
            crumples={0.55}
            crumpleCount={7}
            drops={0}
            angle={300}
          />
        )}
      </ShaderSurface>
      <div className="kl-grid-paper kl-fade-mask absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div
        className="absolute top-[8%] right-[-8%] -z-10 size-[min(70vw,820px)] rounded-full bg-[radial-gradient(circle,var(--accent-tint)_0%,transparent_65%)] opacity-90"
        aria-hidden="true"
      />

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-14 px-6 md:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
        <div className="relative">
          <motion.p
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-surface/70 py-1.5 pr-4 pl-2 font-fredoka text-sm font-medium text-ink-soft backdrop-blur"
            {...word(0.15)}
          >
            <span className="relative grid size-5 place-items-center rounded-full bg-ink">
              <span className="size-2 rounded-full bg-accent" />
            </span>
            A skeptical accountability companion
          </motion.p>

          <h1
            id="hero-title"
            className="font-fredoka text-[clamp(3.1rem,1.6rem+5.4vw,6.4rem)] leading-[0.94] font-bold tracking-[-0.035em] text-ink"
          >
            <span className="sr-only">It doesn't believe you. Yet.</span>
            <span aria-hidden="true">
              {HEADLINE.map((w, i) => (
                <motion.span key={w} className="mr-[0.22em] inline-block" {...word(0.3 + i * 0.08)}>
                  {w}
                </motion.span>
              ))}
              <br />
              <motion.span
                className="relative inline-block font-fraunces font-semibold text-accent-press italic"
                {...word(0.75)}
              >
                Yet.
                <svg
                  viewBox="0 0 220 24"
                  className="absolute -bottom-[0.12em] left-[-2%] h-[0.22em] w-[104%] overflow-visible text-accent"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M4 15 C 40 6, 70 20, 104 12 S 170 4, 216 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={6}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 1.15 }}
                  />
                </svg>
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="mt-8 max-w-[34rem] text-[clamp(1.05rem,0.95rem+0.4vw,1.3rem)] leading-relaxed text-pretty text-ink-soft"
            {...word(0.95)}
          >
            Not a cheerleader. Kawan holds you to <strong className="font-semibold text-ink">one commitment</strong>,
            asks for <strong className="font-semibold text-ink">real evidence</strong>, and only believes you once
            you've shown it.
          </motion.p>

          <motion.div className="mt-10 flex flex-wrap items-center gap-3" {...word(1.05)}>
            <CtaLink
              to="/sign-up"
              variant="accent"
              arrow
              onHover={(on) => awake && !flash && setMood(on ? 'pleased' : 'idle')}
            >
              Get started
            </CtaLink>
            <CtaLink to="/sign-in" variant="outline">
              Sign in
            </CtaLink>
          </motion.div>
        </div>

        {/* The witness. */}
        <div className="relative mx-auto w-full max-w-[560px]">
          <Sparkle className="absolute -top-2 left-[6%] size-7 text-accent opacity-80" />
          <Sparkle className="absolute top-[38%] -right-1 size-5 text-sage-deep" />
          <span className="absolute top-[6%] right-[14%] size-2.5 rounded-full bg-sage" aria-hidden="true" />
          <span className="absolute bottom-[42%] left-[2%] size-2 rounded-full bg-accent" aria-hidden="true" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.4 }}
          >
            <Eye mood={mood} focus={focus} className="mx-auto w-[92%]" />
          </motion.div>

          {/* Kawan's reply, in its serif voice. */}
          <div className="pointer-events-none absolute top-[2%] right-0 left-0 flex justify-center" aria-live="polite">
            <AnimatePresence>
              {flash ? (
                <motion.p
                  key="reply"
                  className="relative rounded-k-card border border-line-strong bg-surface-2 px-5 py-3 font-fraunces text-xl text-ink italic shadow-k-md"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                >
                  Nice try. Show me.
                  <span className="absolute -bottom-[7px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 border-r border-b border-line-strong bg-surface-2" />
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          <motion.div
            className="relative mx-auto mt-6 w-full max-w-[420px] rounded-k-xl border border-line bg-surface/90 p-5 shadow-k-lg backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 1.3 }}
          >
            <p className="font-fredoka text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">
              Your commitment
            </p>
            <p className="mt-1.5 font-fredoka text-lg leading-snug font-semibold text-ink">
              I will ship the landing page by Friday, 6 pm.
            </p>
            <label
              ref={checkRef}
              className="group mt-4 flex min-h-12 cursor-pointer items-center gap-3 rounded-k-lg border border-dashed border-line-strong bg-surface-sunk/60 px-3.5 transition-colors hover:border-ink-faint"
              onPointerEnter={() => suspect(true)}
              onPointerLeave={() => suspect(false)}
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={flash}
                onChange={tryToSelfReport}
                onFocus={() => suspect(true)}
                onBlur={() => suspect(false)}
              />
              <span className="grid size-6 place-items-center rounded-[7px] border-2 border-ink bg-surface-2 text-surface-2 transition-colors peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                <Check size={16} strokeWidth={3} aria-hidden="true" />
              </span>
              <span
                className={`font-fredoka font-medium text-ink ${flash ? 'line-through decoration-accent decoration-2' : ''}`}
              >
                Mark as done
              </span>
              <span className="ml-auto font-fredoka text-xs text-ink-soft">self-report</span>
            </label>
            <AnimatePresence initial={false}>
              {tried ? (
                <motion.p
                  className="overflow-hidden text-sm leading-relaxed text-ink-soft"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                >
                  <span className="block pt-3">
                    There's no button you can lie to. Kawan only counts a commit, a screenshot or a file.
                  </span>
                </motion.p>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
