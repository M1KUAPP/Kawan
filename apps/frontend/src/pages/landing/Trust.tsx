// Trust — the boundary. Kawan's cursor reaches for the deadline, the lock holds, and all it can do
// is leave a Proposal that only you can apply (CONTEXT.md: Hard fields, Proposal).

import { CalendarClock, GitCommitHorizontal, LockKeyhole, MousePointer2, Target, UserRound } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { EASE_OUT, SectionHeading } from './parts'
import { useStill } from './stillness'

const TERMS = [
  { key: 'deliverable', label: 'I will', value: 'ship the landing page', Icon: Target },
  { key: 'deadline', label: 'By', value: 'Friday, 6:00 pm', Icon: CalendarClock },
  { key: 'evidence', label: 'Verified by', value: 'GitHub commits', Icon: GitCommitHorizontal },
  { key: 'witness', label: 'Witness', value: 'Aisyah, emailed if you miss', Icon: UserRound }
]

// 0 parked · 1 reaching · 2 refused · 3 proposal · 4 retreat
type Step = 0 | 1 | 2 | 3 | 4
const TIMELINE: [Step, number][] = [
  [1, 900],
  [2, 1100],
  [3, 1200],
  [4, 2600],
  [0, 1600]
]

export function Trust() {
  const still = useStill()
  const stageRef = useRef<HTMLDivElement>(null)
  const inView = useInView(stageRef, { margin: '-25% 0px' })
  const [step, setStep] = useState<Step>(0)

  useEffect(() => {
    if (still || !inView) return
    let cancelled = false
    let timer = 0
    let i = 0
    const advance = () => {
      const [next, wait] = TIMELINE[i % TIMELINE.length]
      timer = window.setTimeout(() => {
        if (cancelled) return
        setStep(next)
        i += 1
        advance()
      }, wait)
    }
    advance()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [still, inView])

  // Still: show the outcome (refused, with the proposal) instead of the chase.
  const shown: Step = still ? 3 : step
  const refused = shown === 2 || shown === 3
  const proposing = shown === 3 || shown === 4

  const cursor = {
    0: { left: '104%', top: '112%', opacity: 0 },
    1: { left: '72%', top: '40%', opacity: 1 },
    2: { left: '70%', top: '40%', opacity: 1 },
    3: { left: '78%', top: '50%', opacity: 1 },
    4: { left: '108%', top: '96%', opacity: 0 }
  }[shown]

  return (
    <section
      id="trust"
      className="relative isolate scroll-mt-28 overflow-hidden bg-evening py-24 text-cream md:py-36"
      aria-labelledby="trust-title"
    >
      <div className="kl-halftone-cream kl-fade-mask absolute inset-0 -z-10" aria-hidden="true" />
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-14 px-6 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
        <SectionHeading
          index="03"
          eyebrow="The trust boundary"
          tone="evening"
          title={
            <span id="trust-title">
              Kawan can never change the terms of <span className="font-fraunces font-semibold italic">your</span> deal.
            </span>
          }
        >
          <p>
            Your commitment, deadline, and how you're verified are yours alone. The AI reads them, reasons about them,
            and nudges you, but it is structurally incapable of editing them.
          </p>
          <p className="mt-4 font-fraunces text-xl text-cream italic">Enforced in the schema, not just the prompt.</p>
        </SectionHeading>

        <div ref={stageRef} className="relative">
          <motion.div
            className="relative rounded-k-xl border border-cream/12 bg-stage-raised p-5 shadow-k-lg sm:p-7"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="font-fredoka text-lg font-semibold">Your terms</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/10 px-3 py-1 font-fredoka text-xs font-semibold tracking-[0.1em] text-cream/80 uppercase">
                <LockKeyhole size={13} aria-hidden="true" /> Hard fields
              </span>
            </div>
            <ul className="list-none space-y-2.5">
              {TERMS.map(({ key, label, value, Icon }) => {
                const targeted = key === 'deadline' && refused
                return (
                  <li
                    key={key}
                    className={`relative flex items-center gap-3 rounded-k-lg border px-4 py-3.5 transition-colors duration-300 ${
                      targeted ? 'border-accent/70 bg-accent/12' : 'border-cream/10 bg-cream/5'
                    }`}
                  >
                    <Icon size={18} className="shrink-0 text-cream/60" aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
                      <span className="shrink-0 font-fredoka text-xs text-cream/60 sm:w-24 sm:text-sm">{label}</span>
                      <span className="truncate font-fredoka font-semibold">{value}</span>
                    </span>
                    <motion.span
                      className="ml-auto text-cream/70"
                      animate={targeted && !still ? { x: [0, 3, -2, 0] } : { x: 0 }}
                      transition={{ duration: 0.32, ease: 'easeOut' }}
                    >
                      <LockKeyhole size={17} aria-hidden="true" />
                    </motion.span>
                    <AnimatePresence>
                      {targeted ? (
                        <motion.span
                          className="absolute -top-3 right-10 rounded-full bg-cream px-3 py-1 font-fredoka text-xs font-semibold text-stage shadow-k-md"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: EASE_OUT }}
                        >
                          Read-only to Kawan
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>

            <AnimatePresence initial={false}>
              {proposing ? (
                <motion.div
                  key="proposal"
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <div className="mt-4 rounded-k-lg border border-dashed border-cream/25 p-4">
                    <p className="font-fredoka text-xs font-semibold tracking-[0.14em] text-glow uppercase">
                      Proposal from Kawan
                    </p>
                    <p className="mt-1.5 font-fraunces text-lg italic">"Move the deadline to Saturday?"</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-full bg-cream px-4 py-1.5 font-fredoka text-sm font-semibold text-stage">
                        Apply
                      </span>
                      <span className="rounded-full border border-cream/30 px-4 py-1.5 font-fredoka text-sm font-semibold">
                        Dismiss
                      </span>
                      <span className="ml-auto font-fredoka text-xs text-cream/60">Only you can apply it.</span>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>

          {/* Kawan's cursor. */}
          <motion.div
            className="pointer-events-none absolute z-10 flex items-start gap-1"
            initial={false}
            animate={cursor}
            transition={{ duration: still ? 0 : 0.9, ease: EASE_OUT }}
            aria-hidden="true"
          >
            <motion.span animate={{ scale: shown === 2 ? 0.86 : 1 }} transition={{ duration: 0.12 }}>
              <MousePointer2 size={26} className="fill-accent text-cream" />
            </motion.span>
            <span className="mt-5 rounded-full bg-ember px-2.5 py-0.5 font-fredoka text-xs font-semibold text-cream">
              Kawan
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
