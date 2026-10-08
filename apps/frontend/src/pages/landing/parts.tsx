// parts — small shared pieces of the landing: CTA links, section headings, doodles.

import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export const EASE_OUT = [0.16, 1, 0.3, 1] as const

type CtaVariant = 'accent' | 'ink' | 'outline' | 'cream' | 'cream-outline'

const CTA_STYLES: Record<CtaVariant, string> = {
  accent: 'bg-accent-press text-surface-2 hover:shadow-k-pill',
  ink: 'bg-ink text-bg hover:shadow-k-pill',
  outline: 'border border-line-strong bg-surface/60 text-ink hover:border-ink',
  cream: 'bg-cream text-stage hover:shadow-k-pill',
  'cream-outline': 'border border-cream/50 bg-stage/60 text-cream backdrop-blur hover:border-cream'
}

interface CtaLinkProps {
  to: string
  variant: CtaVariant
  children: ReactNode
  arrow?: boolean
  className?: string
  onHover?: (hovering: boolean) => void
}

export function CtaLink({ to, variant, children, arrow = false, className = '', onHover }: CtaLinkProps) {
  return (
    <Link
      to={to}
      onPointerEnter={() => onHover?.(true)}
      onPointerLeave={() => onHover?.(false)}
      onFocus={() => onHover?.(true)}
      onBlur={() => onHover?.(false)}
      className={`group inline-flex min-h-12 shrink-0 items-center whitespace-nowrap justify-center gap-3 rounded-full px-6 font-fredoka text-base font-semibold transition-[box-shadow,border-color,transform] duration-200 ease-k-out hover:no-underline active:translate-y-px ${arrow ? 'pr-1.5' : ''} ${CTA_STYLES[variant]} ${className}`}
    >
      {children}
      {arrow ? (
        <span className="grid size-9 place-items-center rounded-full bg-current/15 transition-transform duration-200 ease-k-out group-hover:translate-x-0.5">
          <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </span>
      ) : null}
    </Link>
  )
}

interface SectionHeadingProps {
  index: string
  eyebrow: string
  title: ReactNode
  children?: ReactNode
  tone?: 'default' | 'evening'
  className?: string
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  children,
  tone = 'default',
  className = ''
}: SectionHeadingProps) {
  const evening = tone === 'evening'
  return (
    <motion.div
      className={`max-w-3xl ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
    >
      <p
        className={`mb-5 flex items-center gap-3 font-fredoka text-sm font-semibold tracking-[0.14em] uppercase ${evening ? 'text-cream/70' : 'text-ink-soft'}`}
      >
        <span className="size-2.5 rounded-full bg-accent" aria-hidden="true" />
        <span className="tabular-nums">{index}</span>
        <span className={`h-px w-8 ${evening ? 'bg-cream/30' : 'bg-line-strong'}`} aria-hidden="true" />
        {eyebrow}
      </p>
      <h2
        className={`font-fredoka text-[clamp(2.25rem,1.4rem+2.8vw,4rem)] leading-[1.02] font-bold tracking-[-0.02em] text-balance ${evening ? 'text-cream' : 'text-ink'}`}
      >
        {title}
      </h2>
      {children ? (
        <div
          className={`mt-6 max-w-2xl text-lg leading-relaxed text-pretty ${evening ? 'text-cream/75' : 'text-ink-soft'}`}
        >
          {children}
        </div>
      ) : null}
    </motion.div>
  )
}

/** A hand-drawn four-point sparkle, like the ones in Kawan's illustrations. */
export function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.5c.6 4.6 2.6 7.6 7.5 9.3-4.9 1.6-6.9 4.7-7.5 9.7-.7-5-2.7-8.1-7.5-9.7 4.8-1.7 6.8-4.7 7.5-9.3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </svg>
  )
}
