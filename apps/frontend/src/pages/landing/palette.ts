// palette — Kawan's token colours as plain strings for the shaders, which can't read CSS variables.
// Re-read whenever <html data-theme> flips, so light and dark both look right.

import { useSyncExternalStore } from 'react'

export type ThemeName = 'light' | 'dark'

const TOKENS = [
  'bg',
  'surface',
  'surface-2',
  'surface-sunk',
  'ink',
  'line-strong',
  'accent',
  'accent-press',
  'accent-tint',
  'sage',
  'sage-tint',
  'clay',
  'evening'
] as const

export type Palette = Record<(typeof TOKENS)[number], string> & { theme: ThemeName }

const cache = new Map<ThemeName, Palette>()

function currentTheme(): ThemeName {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function readPalette(): Palette {
  const theme = currentTheme()
  const cached = cache.get(theme)
  if (cached) return cached
  const style = getComputedStyle(document.documentElement)
  const palette = { theme } as Palette
  for (const token of TOKENS) palette[token] = style.getPropertyValue(`--${token}`).trim()
  cache.set(theme, palette)
  return palette
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export function usePalette(): Palette {
  return useSyncExternalStore(subscribe, readPalette)
}
