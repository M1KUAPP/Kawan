// Header — floating glass bar: wordmark, section anchors, theme, motion pause and the two doors in.

import { Pause, Play } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { ThemeToggle } from '../../ui/ThemeToggle'
import { CtaLink, EASE_OUT } from './parts'
import { usePauseControl } from './stillness'

const ANCHORS = [
  { href: '#the-deal', label: 'How it works' },
  { href: '#evidence', label: 'Evidence' },
  { href: '#companions', label: 'Companions' }
]

export function Header() {
  const { theme, toggle } = useTheme()
  const { paused, togglePaused } = usePauseControl()

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6 md:pt-5"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
    >
      <div className="mx-auto flex max-w-[1240px] items-center gap-2 rounded-full border border-line/80 bg-surface/70 py-2 pr-2 pl-2.5 shadow-k-sm backdrop-blur-xl backdrop-saturate-150 md:pl-3">
        <Link
          to="/?bypass=1"
          className="flex min-h-11 min-w-11 shrink-0 items-center gap-2.5 rounded-full pr-1 hover:no-underline sm:pr-2"
          aria-label="Kawan home"
        >
          <img src="/kawan-logo.png" alt="" width={36} height={36} className="size-9 rounded-k-md" />
          <span className="hidden font-fredoka text-xl font-bold tracking-[0.06em] text-ink uppercase min-[400px]:inline">
            Kawan
          </span>
        </Link>

        <nav aria-label="Sections" className="ml-4 hidden items-center gap-1 lg:flex">
          {ANCHORS.map((anchor) => (
            <a
              key={anchor.href}
              href={anchor.href}
              className="inline-flex min-h-11 items-center rounded-full px-4 font-fredoka text-[0.95rem] font-medium text-ink-soft transition-colors duration-200 hover:bg-surface-sunk/70 hover:text-ink hover:no-underline"
            >
              {anchor.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={togglePaused}
            aria-pressed={paused}
            aria-label={paused ? 'Play motion' : 'Pause motion'}
            title={paused ? 'Play motion' : 'Pause motion'}
            className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-sunk/70 hover:text-ink"
          >
            {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
          </button>
          <ThemeToggle theme={theme} onToggle={toggle} />
          <Link
            to="/sign-in"
            className="hidden min-h-11 items-center rounded-full px-4 font-fredoka font-semibold text-ink hover:bg-surface-sunk/70 hover:no-underline sm:inline-flex"
          >
            Sign in
          </Link>
          <CtaLink to="/sign-up" variant="ink" className="min-h-11 px-4 text-[0.95rem] sm:px-5">
            Get started
          </CtaLink>
        </div>
      </div>
    </motion.header>
  )
}
