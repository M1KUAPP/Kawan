// Landing - Zone 0, / (public, no shell chrome)
// The front door: the eye that doesn't believe you, then the deal, evidence, the trust boundary,
// companions and momentum. Sections live in ./landing; Tailwind there is scoped to this page.

import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { isWelcomeDismissed } from '../demo/welcomeFlag'
import { ScrollRevealFooter } from '../shell/ScrollRevealFooter'
import { Closing } from './landing/Closing'
import { Companions } from './landing/Companions'
import { Deal } from './landing/Deal'
import { Evidence } from './landing/Evidence'
import { Header } from './landing/Header'
import { Hero } from './landing/Hero'
import { Momentum } from './landing/Momentum'
import { StillnessProvider } from './landing/stillness'
import { Trust } from './landing/Trust'
import './landing/landing.css'

export function Landing() {
  const { status } = useAuth()
  const [params] = useSearchParams()
  const bypass = params.get('bypass') === '1'

  // Authenticated users visiting / go to /welcome (tour intro) unless dismissed,
  // then to /home. ?bypass=1 (sidebar logo) always shows the landing page.
  if (status === 'authenticated' && !bypass) {
    return <Navigate to={isWelcomeDismissed() ? '/home' : '/welcome'} replace />
  }

  return (
    <div className="landing-root">
      <ScrollRevealFooter />

      <div className="landing-scroll">
        <StillnessProvider>
          <Header />
          <main>
            <Hero />
            <Deal />
            <Evidence />
            <Trust />
            <Companions />
            <Momentum />
            <Closing />
          </main>
        </StillnessProvider>
      </div>
    </div>
  )
}
