// Momentum — the hand-drawn journey line (DESIGN.md §5), drawn as you scroll, with terracotta
// iris dots popping at each check-in. Below it: delivery, stakes and achievements.

import { BellRing, Mail, MessageCircle, Radio, Send, Smartphone } from 'lucide-react'
import { type MotionValue, motion, useMotionValue, useScroll, useTransform } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { EASE_OUT, SectionHeading } from './parts'
import { useStill } from './stillness'

type Mark = 'pass' | 'unclear' | 'verified'

const CHECK_INS: { at: number; day: string; mark: Mark; note: string }[] = [
  { at: 0.06, day: 'Mon', mark: 'pass', note: 'pass' },
  { at: 0.29, day: 'Tue', mark: 'unclear', note: 'unclear' },
  { at: 0.52, day: 'Wed', mark: 'pass', note: 'pass' },
  { at: 0.74, day: 'Thu', mark: 'pass', note: 'pass' },
  { at: 0.97, day: 'Fri', mark: 'verified', note: 'done, verified' }
]

const WIDE_PATH = 'M 30 150 C 140 40, 230 230, 340 140 S 520 30, 610 128 S 800 236, 900 124 S 1090 50, 1170 112'
const TALL_PATH = 'M 40 12 C 4 110, 92 170, 46 270 S 2 440, 48 540 S 96 700, 44 792'

interface CheckInProps {
  progress: MotionValue<number>
  checkIn: (typeof CHECK_INS)[number]
  variant: 'wide' | 'tall'
}

/** One check-in on the line: an iris dot (hollow when unclear) and its label, popping in as the line reaches it. */
function CheckIn({ progress, checkIn, variant }: CheckInProps) {
  const reveal = useTransform(progress, [checkIn.at - 0.04, checkIn.at], [0, 1], { clamp: true })
  const size = checkIn.mark === 'verified' ? 30 : 20
  return (
    <>
      <span className="absolute -translate-x-1/2 -translate-y-1/2">
        <motion.span
          style={{ scale: reveal, width: size, height: size }}
          className={`block rounded-full ${
            checkIn.mark === 'unclear'
              ? 'border-[3px] border-ink-faint bg-bg'
              : 'grid place-items-center bg-accent shadow-[0_0_0_5px_var(--accent-tint)]'
          }`}
        >
          {checkIn.mark === 'unclear' ? null : (
            <span className={`rounded-full bg-pupil ${checkIn.mark === 'verified' ? 'size-3' : 'size-2'}`} />
          )}
        </motion.span>
      </span>
      <motion.span
        style={{ opacity: reveal }}
        className={`absolute font-fredoka whitespace-nowrap ${
          variant === 'wide' ? 'top-6 -translate-x-1/2 text-center' : 'top-0 left-8 -translate-y-1/2'
        }`}
      >
        <span className="block text-lg font-bold text-ink">{checkIn.day}</span>
        <span
          className={`block text-sm font-medium ${checkIn.mark === 'unclear' ? 'text-ink-soft' : 'font-semibold text-ink-soft'}`}
        >
          {checkIn.note}
        </span>
      </motion.span>
    </>
  )
}

function Journey({ variant }: { variant: 'wide' | 'tall' }) {
  const still = useStill()
  const wrapRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start 80%', 'end 45%'] })
  const full = useMotionValue(1)
  const drawn = still ? full : scrollYProgress
  const view = variant === 'wide' ? { w: 1200, h: 260 } : { w: 100, h: 800 }

  useLayoutEffect(() => {
    const path = pathRef.current
    if (!path) return
    const total = path.getTotalLength()
    setPoints(CHECK_INS.map(({ at }) => path.getPointAtLength(at * total)))
  }, [])

  return (
    <div
      ref={wrapRef}
      className={`relative ${variant === 'wide' ? 'hidden aspect-[1200/260] w-full md:block' : 'mx-auto h-[640px] w-full max-w-sm md:hidden'}`}
    >
      <svg
        viewBox={`0 0 ${view.w} ${view.h}`}
        preserveAspectRatio={variant === 'wide' ? 'xMidYMid meet' : 'none'}
        className={`absolute inset-y-0 h-full overflow-visible ${variant === 'wide' ? 'inset-x-0 w-full' : 'left-0 w-[100px]'}`}
        aria-hidden="true"
      >
        <path
          d={variant === 'wide' ? WIDE_PATH : TALL_PATH}
          fill="none"
          className="stroke-line-strong"
          strokeWidth={3}
          strokeDasharray="2 12"
          strokeLinecap="round"
        />
        <motion.path
          ref={pathRef}
          d={variant === 'wide' ? WIDE_PATH : TALL_PATH}
          fill="none"
          className="stroke-ink"
          strokeWidth={variant === 'wide' ? 6 : 5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: drawn }}
        />
      </svg>
      <ol className="absolute inset-0 list-none">
        {CHECK_INS.map((checkIn, i) => {
          const point = points[i]
          if (!point) return null
          const left = variant === 'wide' ? `${(point.x / view.w) * 100}%` : `${point.x}px`
          const top = `${(point.y / view.h) * 100}%`
          return (
            <li key={checkIn.day} className="absolute" style={{ left, top }}>
              <CheckIn progress={drawn} checkIn={checkIn} variant={variant} />
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const LADDER = [
  { Icon: Radio, label: 'Live', detail: 'WebSocket, while the app is open' },
  { Icon: BellRing, label: 'Web Push', detail: 'when it is not' },
  { Icon: Smartphone, label: 'Timeline', detail: 'persisted in the app, always' }
]

export function Momentum() {
  return (
    <section id="momentum" className="relative scroll-mt-28 py-24 md:py-36" aria-labelledby="momentum-title">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <SectionHeading
          index="05"
          eyebrow="Momentum"
          title={
            <span id="momentum-title">
              Trust is earned, <span className="font-fraunces font-semibold italic">check-in by check-in.</span>
            </span>
          }
        >
          Kawan checks in on a schedule, or right now when you ask it to. Each verified check-in builds momentum, and an
          unclear one simply asks again.
        </SectionHeading>

        <div className="mt-16 md:mt-24">
          <Journey variant="wide" />
          <Journey variant="tall" />
        </div>

        <div className="mt-20 grid grid-cols-1 gap-5 md:mt-28 md:grid-cols-3">
          <motion.article
            className="rounded-k-card border border-line bg-surface p-6 shadow-k-sm"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <h3 className="font-fredoka text-xl font-bold text-ink">A check-in is never lost</h3>
            <ol className="mt-5 list-none space-y-3">
              {LADDER.map(({ Icon, label, detail }, i) => (
                <motion.li
                  key={label}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.25 + i * 0.25 }}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-k-md bg-accent-tint text-accent-press">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-fredoka font-semibold text-ink">{label}</span>
                    <span className="block text-sm text-ink-soft">{detail}</span>
                  </span>
                </motion.li>
              ))}
            </ol>
            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-x-0 border-t border-b-0 border-dashed border-line-strong pt-4 text-sm text-ink-soft">
              Off-device:
              <span className="inline-flex items-center gap-1">
                <Mail size={15} aria-hidden="true" /> email
              </span>
              <span className="inline-flex items-center gap-1">
                <BellRing size={15} aria-hidden="true" /> push
              </span>
              <span className="inline-flex items-center gap-1">
                <Send size={15} aria-hidden="true" /> Telegram
              </span>
            </p>
          </motion.article>

          <motion.article
            className="flex flex-col rounded-k-card border border-line bg-surface p-6 shadow-k-sm"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.08 }}
          >
            <h3 className="font-fredoka text-xl font-bold text-ink">Stakes and a witness</h3>
            <p className="mt-3 leading-relaxed text-ink-soft">
              Name someone who's emailed if you miss the deadline. That's the whole mechanism.
            </p>
            <div className="mt-auto pt-6">
              <div className="flex items-center gap-3 rounded-k-lg border border-dashed border-line-strong bg-surface-2 p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage-tint text-sage-deep">
                  <MessageCircle size={18} aria-hidden="true" />
                </span>
                <p className="text-sm leading-snug text-ink">
                  <span className="font-semibold">To Aisyah:</span> Sam missed Friday's deadline.
                </p>
              </div>
            </div>
          </motion.article>

          <motion.article
            className="relative flex flex-col overflow-hidden rounded-k-card border border-line bg-surface p-6 shadow-k-sm"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.16 }}
          >
            <h3 className="font-fredoka text-xl font-bold text-ink">15 achievements for how you won</h3>
            <ul className="mt-4 flex list-none flex-wrap gap-2">
              {['Verified without a skip-day', 'Finished early', 'Came back after a miss'].map((title) => (
                <li
                  key={title}
                  className="rounded-full border border-line-strong bg-surface-2 px-3 py-1.5 font-fredoka text-sm font-medium text-ink"
                >
                  {title}
                </li>
              ))}
            </ul>
            <img
              src="/illustrations/analytics-card.webp"
              alt=""
              width={160}
              height={160}
              loading="lazy"
              className="mt-auto ml-auto size-36 translate-x-4 translate-y-4 object-contain"
            />
          </motion.article>
        </div>
      </div>
    </section>
  )
}
