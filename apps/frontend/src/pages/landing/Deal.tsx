// Deal — the commitment as one sentence with fill-in chips, and the evidence it will be judged on.
// Examples cycle while the card is on screen; picking an evidence source jumps to a matching one.

import { FileText, GitCommitHorizontal, Image, LockKeyhole } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { EASE_OUT, SectionHeading } from './parts'
import { useStill } from './stillness'

type EvidenceKind = 'github' | 'screenshot' | 'file'

const DEALS: { action: string; deliverable: string; deadline: string; evidence: EvidenceKind }[] = [
  { action: 'ship', deliverable: 'the landing page', deadline: 'Friday, 6 pm', evidence: 'github' },
  { action: 'finish', deliverable: 'chapter 3 of my thesis', deadline: 'Sunday night', evidence: 'file' },
  { action: 'submit', deliverable: 'the grant application', deadline: 'the 30th', evidence: 'screenshot' },
  { action: 'push', deliverable: 'the auth refactor', deadline: 'Thursday', evidence: 'github' }
]

const EVIDENCE: { kind: EvidenceKind; label: string; hint: string; Icon: typeof FileText }[] = [
  { kind: 'github', label: 'GitHub repo', hint: 'Kawan watches the commits', Icon: GitCommitHorizontal },
  { kind: 'screenshot', label: 'Screenshot', hint: 'A vision model judges it', Icon: Image },
  { kind: 'file', label: 'File', hint: 'Upload the deliverable', Icon: FileText }
]

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="relative mx-[0.08em] inline-flex align-baseline">
      <span className="absolute -top-[1.35em] left-[0.5em] hidden font-fredoka text-[0.32em] sm:block font-semibold tracking-[0.16em] whitespace-nowrap text-ink-soft uppercase">
        {label}
      </span>
      <motion.span
        layout
        transition={{ layout: { duration: 0.35, ease: EASE_OUT } }}
        className="inline-flex overflow-hidden rounded-[0.38em] border-2 border-dashed border-line-strong bg-surface-sunk/80 px-[0.38em] text-accent-press"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="inline-block whitespace-nowrap"
            initial={{ y: '0.6em', opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: '0em', opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: '-0.6em', opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  )
}

export function Deal() {
  const still = useStill()
  const cardRef = useRef<HTMLDivElement>(null)
  const inView = useInView(cardRef, { margin: '-20% 0px' })
  const [index, setIndex] = useState(0)
  const [holding, setHolding] = useState(false)
  const deal = DEALS[index]

  useEffect(() => {
    if (still || !inView || holding) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % DEALS.length), 3400)
    return () => window.clearInterval(timer)
  }, [still, inView, holding])

  return (
    <section id="the-deal" className="relative scroll-mt-28 py-24 md:py-36" aria-labelledby="deal-title">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <SectionHeading
          index="01"
          eyebrow="The deal"
          title={
            <span id="deal-title">
              One commitment. One deadline. <span className="font-fraunces font-semibold italic">No room</span> to be
              vague.
            </span>
          }
        >
          State the deal as a single sentence, then choose how it gets verified. Only you can change these terms; Kawan
          reads them but never edits them.
        </SectionHeading>

        <motion.div
          ref={cardRef}
          className="relative mt-14 overflow-hidden rounded-k-xl border border-line bg-surface p-6 shadow-k-lg sm:p-10 md:mt-20 md:p-14"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          onPointerEnter={() => setHolding(true)}
          onPointerLeave={() => setHolding(false)}
          onFocusCapture={() => setHolding(true)}
          onBlurCapture={() => setHolding(false)}
        >
          <div className="kl-halftone absolute -top-10 -right-10 size-64 rounded-full opacity-60" aria-hidden="true" />

          <p className="relative font-fredoka text-[clamp(1.6rem,0.85rem+2.5vw,3.2rem)] leading-[1.9] font-semibold sm:leading-[2.1] tracking-[-0.01em] text-ink">
            I will <Chip label="Action" value={deal.action} /> <Chip label="Deliverable" value={deal.deliverable} /> by{' '}
            <Chip label="Deadline" value={deal.deadline} />.
          </p>

          <div className="relative mt-10 flex flex-col gap-6 border-x-0 border-t border-b-0 border-dashed border-line-strong pt-8 lg:flex-row lg:items-center lg:justify-between">
            <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0 sm:flex-row sm:items-center">
              <legend className="mb-3 font-fredoka text-sm font-semibold tracking-[0.14em] text-ink-soft uppercase sm:float-left sm:mr-4 sm:mb-0">
                Verified by
              </legend>
              <div className="flex flex-wrap gap-2">
                {EVIDENCE.map(({ kind, label, hint, Icon }) => {
                  const active = deal.evidence === kind
                  return (
                    <button
                      key={kind}
                      type="button"
                      aria-pressed={active}
                      title={hint}
                      onClick={() => setIndex(DEALS.findIndex((d) => d.evidence === kind))}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-fredoka text-[0.95rem] font-medium transition-colors duration-200 ${
                        active
                          ? 'border-ink bg-ink text-bg'
                          : 'border-line-strong bg-surface-2 text-ink-soft hover:border-ink-faint hover:text-ink'
                      }`}
                    >
                      <Icon size={17} aria-hidden="true" />
                      {label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
            <p className="flex items-center gap-2 font-fredoka text-[0.95rem] text-ink-soft">
              <LockKeyhole size={17} className="text-accent-press" aria-hidden="true" />
              Only you can change these. Kawan can't.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
