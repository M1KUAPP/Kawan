// Evidence — three submissions, each scanned and stamped with an honest verdict.
// `unclear` reads curious, never punishing (DESIGN.md §9).

import { FileText, GitCommitHorizontal, Image, RotateCcw } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { EASE_OUT, SectionHeading } from './parts'
import { useStill } from './stillness'

type Verdict = 'pass' | 'unclear' | 'fail'
type Phase = 'waiting' | 'scanning' | 'stamped'

const VERDICT_STYLE: Record<Verdict, string> = {
  pass: 'text-[color-mix(in_oklab,var(--sage-deep)_70%,var(--ink))]',
  unclear: 'text-ink-soft',
  fail: 'text-danger'
}

const MONO = 'font-[ui-monospace,SFMono-Regular,Menlo,monospace]'

function Commits() {
  const rows = [
    ['a41f9c2', 'feat: eye tracking', '2h'],
    ['9be07d1', 'fix: blink on mobile', '5h'],
    ['c3d5e88', 'docs: launch notes', '1d']
  ]
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <p className={`${MONO} text-xs text-ink-soft`}>you/landing-page · main</p>
      {rows.map(([hash, message, age]) => (
        <div key={hash} className="flex items-center gap-2.5 rounded-k-md bg-surface-2 px-3 py-2 text-sm">
          <span className="size-2 shrink-0 rounded-full bg-sage-deep" />
          {/* The hash only shows where the row is wide enough to keep the message whole. */}
          <span className={`${MONO} hidden text-xs text-ink-soft sm:inline lg:hidden xl:inline`}>{hash}</span>
          <span className="truncate text-ink">{message}</span>
          <span className="ml-auto text-xs text-ink-soft">{age}</span>
        </div>
      ))}
    </div>
  )
}

function Shot() {
  return (
    <div className="grid h-full place-items-center p-4">
      <div className="relative w-[62%] rounded-[18px] border-2 border-ink/80 bg-surface-2 p-3 pt-5">
        <span className="absolute top-1.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-ink/30" />
        <div className="mb-2 flex items-center justify-between">
          <span className="h-2 w-12 rounded-full bg-ink/25" />
          {/* The date the model needed, smudged out. */}
          <svg viewBox="0 0 60 16" className="h-4 w-12 text-ink/70" aria-hidden="true">
            <path
              d="M2 9 C 8 2, 12 14, 18 7 S 28 3, 32 10 S 44 14, 48 6 S 56 4, 58 9"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="space-y-1.5">
          <span className="block h-2 w-full rounded-full bg-ink/15" />
          <span className="block h-2 w-4/5 rounded-full bg-ink/15" />
          <span className="block h-2 w-3/5 rounded-full bg-ink/15" />
        </div>
        <span className="mt-3 inline-flex rounded-full bg-sage-tint px-2 py-0.5 text-[0.65rem] font-semibold text-ink">
          Submitted
        </span>
      </div>
    </div>
  )
}

function Doc() {
  return (
    <div className="flex h-full items-center gap-4 p-5">
      <div className="relative grid h-24 w-20 shrink-0 place-items-center rounded-k-md border-2 border-ink/80 bg-surface-2">
        <span className="absolute top-0 right-0 size-5 rounded-bl-k-md border-b-2 border-l-2 border-ink/80 bg-surface-sunk" />
        <FileText size={28} className="text-ink-soft" aria-hidden="true" />
      </div>
      <div className="min-w-0 text-sm">
        <p className="truncate font-semibold text-ink">chapter-3.docx</p>
        <p className="mt-1 text-ink-soft">Last changed Tuesday</p>
        <p className={`${MONO} mt-3 inline-flex rounded-k-sm bg-surface-2 px-2 py-1 text-xs text-ink-soft`}>
          +0 words since the last check-in
        </p>
      </div>
    </div>
  )
}

const CARDS: { source: string; Icon: typeof FileText; verdict: Verdict; line: string; body: ReactNode }[] = [
  {
    source: 'GitHub commits',
    Icon: GitCommitHorizontal,
    verdict: 'pass',
    line: 'Three new commits since yesterday. I believe you.',
    body: <Commits />
  },
  {
    source: 'Screenshot',
    Icon: Image,
    verdict: 'unclear',
    line: "I can't make out the date on this one. Send another?",
    body: <Shot />
  },
  {
    source: 'File upload',
    Icon: FileText,
    verdict: 'fail',
    line: 'Same draft as Tuesday. There is still time.',
    body: <Doc />
  }
]

function EvidenceCard({ card, order, start }: { card: (typeof CARDS)[number]; order: number; start: boolean }) {
  const still = useStill()
  const [phase, setPhase] = useState<Phase>(still ? 'stamped' : 'waiting')

  useEffect(() => {
    if (!start) return
    if (still) {
      setPhase('stamped')
      return
    }
    const scan = window.setTimeout(() => setPhase('scanning'), 200 + order * 420)
    const stamp = window.setTimeout(() => setPhase('stamped'), 200 + order * 420 + 1500)
    return () => {
      window.clearTimeout(scan)
      window.clearTimeout(stamp)
    }
  }, [start, still, order])

  const stamped = phase === 'stamped'

  return (
    <motion.article
      className="flex flex-col overflow-hidden rounded-k-card border border-line bg-surface shadow-k-sm"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay: order * 0.08 }}
    >
      <header className="flex items-center gap-3 px-5 pt-5">
        <span className="grid size-10 place-items-center rounded-k-md bg-surface-sunk text-ink">
          <card.Icon size={19} aria-hidden="true" />
        </span>
        <h3 className="font-fredoka text-lg font-semibold text-ink">{card.source}</h3>
        <span className="ml-auto font-fredoka text-xs font-medium tracking-[0.12em] text-ink-soft uppercase">
          {phase === 'waiting' ? 'Queued' : phase === 'scanning' ? 'Checking' : 'Verdict'}
        </span>
      </header>

      <div className="relative mx-5 mt-4">
        {/* pt-6 keeps a lane clear for the stamp, so it never covers the evidence. */}
        <div className="relative h-52 overflow-hidden rounded-k-lg border border-line bg-surface-sunk/60 pt-6">
          {card.body}
          <AnimatePresence>
            {phase === 'scanning' ? (
              <motion.div
                key="beam"
                className="kl-scan-beam absolute inset-x-0 h-24"
                initial={{ top: '-30%' }}
                animate={{ top: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />
            ) : null}
          </AnimatePresence>
        </div>
        {/* The stamp lands on the box's top-right corner, clear of the evidence it judged. */}
        <AnimatePresence>
          {stamped ? (
            <motion.span
              key="stamp"
              className={`kl-stamp absolute -top-3.5 right-3 rounded-k-md bg-surface px-3 py-1 font-fredoka text-lg font-bold tracking-[0.18em] uppercase ${VERDICT_STYLE[card.verdict]}`}
              initial={{ scale: 1.35, rotate: -14, opacity: 0 }}
              animate={{ scale: 1, rotate: -7, opacity: 1 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
            >
              {card.verdict}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex min-h-28 flex-1 items-start gap-3 px-5 pt-4 pb-5">
        <img src="/kawan-logo.png" alt="" width={28} height={28} className="mt-0.5 size-7 rounded-k-sm" />
        <p className="font-fraunces text-[1.05rem] leading-snug text-ink italic">
          {stamped ? card.line : <span className="text-ink-soft">Looking at what you sent…</span>}
        </p>
      </div>
    </motion.article>
  )
}

export function Evidence() {
  const gridRef = useRef<HTMLDivElement>(null)
  const inView = useInView(gridRef, { once: true, margin: '-25% 0px' })
  const [run, setRun] = useState(0)

  return (
    <section id="evidence" className="relative scroll-mt-28 py-24 md:py-36" aria-labelledby="evidence-title">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <SectionHeading
          index="02"
          eyebrow="Evidence"
          title={
            <span id="evidence-title">
              Evidence, not <span className="font-fraunces font-semibold italic">self-report.</span>
            </span>
          }
        >
          Kawan checks in on schedule and reviews what you submit: commits in a GitHub repo, a screenshot, or a file.
          Every check-in resolves to <strong className="font-semibold text-ink">pass</strong>,{' '}
          <strong className="font-semibold text-ink">fail</strong> or{' '}
          <strong className="font-semibold text-ink">unclear</strong>, and unclear never punishes.
        </SectionHeading>

        <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-5 md:mt-20 lg:grid-cols-3">
          {CARDS.map((card, order) => (
            <EvidenceCard key={`${card.verdict}-${run}`} card={card} order={order} start={inView} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="max-w-xl font-fraunces text-2xl leading-snug text-ink italic">
            There is no "mark as done" button you can lie to.
          </p>
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-5 font-fredoka font-semibold text-ink transition-colors hover:border-ink"
          >
            <RotateCcw size={17} aria-hidden="true" />
            Check again
          </button>
        </div>
      </div>
    </section>
  )
}
