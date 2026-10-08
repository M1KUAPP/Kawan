// Closing — the proof strip and the last call to action on an ember shader stage.

import { GrainGradient } from '@paper-design/shaders-react'
import { ShieldCheck, Sparkles, Trophy } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Eye, type EyeMood } from './Eye'
import { CtaLink, EASE_OUT } from './parts'
import { ShaderSurface } from './ShaderSurface'

// The stage is dark in both themes, so its palette is fixed: terracotta embers on --evening (light).
const EMBERS = ['#ad4621', '#dd6236', '#7a3418', '#5a3a2c']

const PROOF = [
  {
    Icon: Trophy,
    text: '1st place, Chutes Hack Malaysia 2026 (Corporate Track)',
    href: 'https://chutes-hack-malaysia-2026.devpost.com/'
  },
  { Icon: ShieldCheck, text: "Check-ins and verdicts run on Chutes' TEE inference" },
  { Icon: Sparkles, text: 'Three Live2D companions with their own voices' }
]

export function Closing() {
  const [mood, setMood] = useState<EyeMood>('idle')

  return (
    <>
      <section aria-label="Recognition" className="border-y border-line bg-surface/60">
        <ul className="mx-auto grid max-w-[1240px] list-none grid-cols-1 gap-6 px-6 py-8 md:grid-cols-3 md:px-10">
          {PROOF.map(({ Icon, text, href }) => (
            <li key={text} className="flex items-center gap-3 font-fredoka text-[0.98rem] font-medium text-ink">
              <span className="grid size-10 shrink-0 place-items-center rounded-k-md bg-surface-sunk text-accent-press">
                <Icon size={19} aria-hidden="true" />
              </span>
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className="text-ink underline-offset-4 hover:underline">
                  {text}
                </a>
              ) : (
                text
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="px-3 py-20 md:px-6 md:py-28" aria-labelledby="cta-title">
        <motion.div
          className="relative isolate mx-auto max-w-[1240px] overflow-hidden rounded-[clamp(28px,4vw,48px)] bg-stage px-6 py-16 text-center md:px-16 md:py-24"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <ShaderSurface className="absolute inset-0 -z-10" fallback={null}>
            {(sizing, speedScale) => (
              <GrainGradient
                {...sizing}
                colorBack="#2e2722"
                colors={EMBERS}
                shape="wave"
                softness={0.85}
                intensity={0.2}
                noise={0.35}
                scale={1.3}
                speed={0.35 * speedScale}
              />
            )}
          </ShaderSurface>
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_60%,rgb(46_39_34/0.9),rgb(46_39_34/0.45)_75%)]"
            aria-hidden="true"
          />

          <Eye mood={mood} shader={false} tone="stage" className="mx-auto w-[min(240px,60%)]" />

          <h2
            id="cta-title"
            className="mx-auto mt-8 max-w-3xl font-fredoka text-[clamp(2.4rem,1.4rem+3.6vw,4.8rem)] leading-[1] font-bold tracking-[-0.03em] text-balance text-cream"
          >
            Show it. Then it'll <span className="font-fraunces font-semibold italic">believe</span> you.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream">
            One commitment, verified evidence, no self-report. Sign in with Chutes, or continue as a guest without an
            account.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <CtaLink to="/sign-up" variant="cream" arrow onHover={(on) => setMood(on ? 'pleased' : 'idle')}>
              Get started
            </CtaLink>
            <CtaLink to="/sign-in" variant="cream-outline">
              Sign in
            </CtaLink>
          </div>
        </motion.div>
      </section>
    </>
  )
}
