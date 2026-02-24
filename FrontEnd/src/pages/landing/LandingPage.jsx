import { useEffect, useMemo, useState } from 'react'
import Footer from '../../components/Footer'
import LandingDevelopers from '../../components/landing/LandingDevelopers'
import LandingFeedback from '../../components/landing/LandingFeedback'
import LandingFeatures from '../../components/landing/LandingFeatures'
import LandingHeader from '../../components/landing/LandingHeader'
import LandingHero from '../../components/landing/LandingHero'
import LandingIntegration from '../../components/landing/LandingIntegration'
import LandingSectionSlider from '../../components/landing/LandingSectionSlider'
import { useAuth } from '../../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('rp_dark_mode')
    if (saved === 'true') return true
    if (saved === 'false') return false
    return document.documentElement.classList.contains('dark')
  })
  const sections = useMemo(
    () => [
      { id: 'landing-hero', label: 'Hero' },
      { id: 'landing-features', label: 'Features' },
      { id: 'landing-developers', label: 'Developers' },
      { id: 'landing-feedback', label: 'Feedback' },
      { id: 'landing-integration', label: 'Integration' },
    ],
    []
  )
  const [activeSection, setActiveSection] = useState('landing-hero')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('rp_dark_mode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id)
        }
      },
      { threshold: [0.2, 0.4, 0.65], rootMargin: '-15% 0px -45% 0px' }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [sections])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const goToSection = (id) => {
    const element = document.getElementById(id)
    if (!element) return
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const activeIndex = sections.findIndex((section) => section.id === activeSection)
  const safeIndex = activeIndex >= 0 ? activeIndex : 0

  return (
    <>
      <LandingHeader />
      <LandingSectionSlider
        sections={sections}
        activeSection={activeSection}
        onSelect={goToSection}
        onPrev={() => goToSection(sections[(safeIndex - 1 + sections.length) % sections.length].id)}
        onNext={() => goToSection(sections[(safeIndex + 1) % sections.length].id)}
      />
      <main className="landing-main-shell landing-ambient mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-12 pt-2 md:gap-10 md:px-6">
        <div id="landing-hero" className="scroll-mt-24">
          <LandingHero />
        </div>
        <div id="landing-features" className="scroll-mt-24">
          <LandingFeatures />
        </div>
        <div id="landing-developers" className="scroll-mt-24">
          <LandingDevelopers />
        </div>
        <div id="landing-feedback" className="scroll-mt-24">
          <LandingFeedback />
        </div>
        <div id="landing-integration" className="scroll-mt-24">
          <LandingIntegration />
        </div>
      </main>
      <button
        type="button"
        onClick={() => setDarkMode((prev) => !prev)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-base bg-surface text-main shadow-[0_10px_30px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover-surface-soft md:bottom-7 md:right-7"
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <Footer />
    </>
  )
}
