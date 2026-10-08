// Companions — three personalities, same backbone. Picking one restages the VN dialogue box
// (DESIGN.md §6, Stage mode) with a sample line in that companion's tone.

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { Persona } from '../../types/api'
import { PERSONA_PORTRAITS } from '../../zone2/personaPortraits'
import { EASE_OUT, SectionHeading } from './parts'

const COMPANIONS: { id: Persona; name: string; archetype: string; tone: string; line: string }[] = [
  {
    id: 'kawan',
    name: 'Kawan',
    archetype: 'Skeptical Concierge',
    tone: 'Candid, warm, slightly dry. Believes you because you proved it.',
    line: "You said Friday. Show me the commit and I'll believe it."
  },
  {
    id: 'adik',
    name: 'Adik',
    archetype: 'Gentle Cheerleader',
    tone: 'Encouraging and kind. Celebrates every step.',
    line: 'One screenshot is all I need, then we celebrate. You can do this!'
  },
  {
    id: 'cik_maid',
    name: 'Cik Maid',
    archetype: 'Playful Taskmaster',
    tone: 'Brisk, playful, expects results, with a wink.',
    line: "Two days left and no file yet? Chop chop. I'm watching. ;)"
  }
]

export function Companions() {
  const [selected, setSelected] = useState<Persona>('kawan')
  const current = COMPANIONS.find((c) => c.id === selected) ?? COMPANIONS[0]

  return (
    <section id="companions" className="relative scroll-mt-28 py-24 md:py-36" aria-labelledby="companions-title">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <SectionHeading
          index="04"
          eyebrow="Companions"
          title={
            <span id="companions-title">
              Pick who holds you <span className="font-fraunces font-semibold italic">to it.</span>
            </span>
          }
        >
          Three personalities, same backbone. Switching the companion changes the messenger, never your commitment.
        </SectionHeading>

        <div className="mt-14 grid grid-cols-1 gap-6 md:mt-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8">
          <fieldset className="m-0 grid min-w-0 gap-3 border-0 p-0">
            <legend className="sr-only">Choose a companion to preview</legend>
            {COMPANIONS.map((companion, i) => (
              <motion.label
                key={companion.id}
                className="group flex cursor-pointer items-center gap-4 rounded-k-card border border-line bg-surface p-4 transition-colors duration-200 hover:border-line-strong has-[input:checked]:border-ink has-[input:checked]:bg-ink has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-accent sm:p-5"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: i * 0.08 }}
              >
                <input
                  type="radio"
                  name="companion"
                  value={companion.id}
                  checked={selected === companion.id}
                  onChange={() => setSelected(companion.id)}
                  className="sr-only"
                />
                <img
                  src={PERSONA_PORTRAITS[companion.id]}
                  alt=""
                  width={64}
                  height={64}
                  className="size-16 shrink-0 rounded-k-lg border border-line bg-surface-2 object-cover object-top"
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="font-fredoka text-xl font-bold text-ink group-has-[input:checked]:text-bg">
                      {companion.name}
                    </span>
                    <span className="font-fredoka text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase group-has-[input:checked]:text-bg/75">
                      {companion.archetype}
                    </span>
                  </span>
                  <span className="mt-1 block text-[0.95rem] leading-snug text-ink-soft group-has-[input:checked]:text-bg/80">
                    {companion.tone}
                  </span>
                </span>
              </motion.label>
            ))}
          </fieldset>

          {/* Stage mode preview: the companion on an evening stage, speaking through the dialogue box. */}
          <div className="relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-k-xl bg-evening p-4 sm:p-6">
            <div
              className="absolute inset-x-0 top-0 -z-10 h-3/4 bg-[radial-gradient(ellipse_at_50%_20%,rgb(228_115_61/0.35),transparent_65%)]"
              aria-hidden="true"
            />
            <div className="kl-halftone-cream kl-fade-mask absolute inset-0 -z-10" aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={current.id}
                src={PERSONA_PORTRAITS[current.id]}
                alt={`${current.name}, the ${current.archetype}`}
                width={192}
                height={192}
                className="absolute top-8 left-1/2 size-44 -translate-x-1/2 rounded-full border-4 border-cream/15 object-cover object-top shadow-k-lg sm:size-48"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              />
            </AnimatePresence>

            <div className="relative rounded-k-card border border-cream/15 bg-stage-raised/90 p-5 pt-7 backdrop-blur-md">
              <span className="absolute -top-3.5 left-5 rounded-full bg-ember px-3.5 py-1 font-fredoka text-sm font-bold text-cream">
                {current.name}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={current.id}
                  className="min-h-[3.4em] font-fraunces text-[clamp(1.15rem,1rem+0.6vw,1.45rem)] leading-snug text-cream"
                  initial={{ opacity: 0, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  {current.line}
                </motion.p>
              </AnimatePresence>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-fredoka text-xs text-cream/55">Sample check-in line</span>
                <span className="kl-caret text-accent" aria-hidden="true">
                  ▼
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
