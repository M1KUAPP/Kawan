// stillness — one switch for every moving part of the landing.
// Still when the OS asks for reduced motion or the visitor pressed "Pause motion" (WCAG 2.2.2).
// Motion components follow via MotionConfig; shaders, the eye and timed loops read useStill().

import { MotionConfig, useReducedMotion } from 'motion/react'
import { createContext, type ReactNode, useContext, useState } from 'react'

interface Stillness {
  still: boolean
  paused: boolean
  togglePaused: () => void
}

const StillnessContext = createContext<Stillness>({ still: false, paused: false, togglePaused: () => {} })

export function StillnessProvider({ children }: { children: ReactNode }) {
  const prefersReduced = useReducedMotion() === true
  const [paused, setPaused] = useState(false)
  const still = prefersReduced || paused

  return (
    <StillnessContext.Provider value={{ still, paused, togglePaused: () => setPaused((p) => !p) }}>
      <MotionConfig reducedMotion={still ? 'always' : 'never'}>
        <div data-still={still}>{children}</div>
      </MotionConfig>
    </StillnessContext.Provider>
  )
}

export function useStill(): boolean {
  return useContext(StillnessContext).still
}

export function usePauseControl(): Pick<Stillness, 'paused' | 'togglePaused'> {
  const { paused, togglePaused } = useContext(StillnessContext)
  return { paused, togglePaused }
}
