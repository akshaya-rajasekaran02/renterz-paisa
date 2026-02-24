import { useEffect, useState } from 'react'
import { classNames } from '../../utils/classNames'

export default function LandingSectionSlider({ sections = [], activeSection, onSelect }) {
  const [pastIntegration, setPastIntegration] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const handleScroll = () => {
      const integration = document.getElementById('landing-integration')
      if (!integration) return

      const rect = integration.getBoundingClientRect()
      const stopLine = window.innerHeight * 0.58
      setPastIntegration(rect.bottom <= stopLine)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const syncTheme = () => setIsDarkMode(root.classList.contains('dark'))
    syncTheme()

    const observer = new MutationObserver(syncTheme)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  if (!sections.length) return null

  return (
    <aside className={classNames('landing-slider-shell fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 lg:block', pastIntegration && 'lg:hidden')}>
      <div className="landing-slider-frame w-[230px] px-5 py-5">
        <div className="relative">
          <div className="landing-slider-stack space-y-8">
            {sections.map((section, index) => {
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSelect(section.id)}
                  className="group relative flex w-full items-center gap-3 text-left transition-all duration-300 ease-in"
                  aria-label={`Go to ${section.label} section`}
                  title={section.label}
                >
                  {index < sections.length - 1 ? (
                    <span
                      className="pointer-events-none absolute left-[5px] top-[calc(100%+2px)] h-8 border-l-2 border-dashed border-gray-500"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className={classNames(
                      'relative z-10 inline-flex h-3 w-3 shrink-0 rounded-full border transition-all duration-300 ease-in',
                      isActive
                        ? isDarkMode
                          ? 'border-white bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.16),0_0_14px_rgba(255,255,255,0.22)]'
                          : 'border-black bg-black shadow-[0_0_0_3px_rgba(15,23,42,0.16),0_0_14px_rgba(15,23,42,0.16)]'
                        : isDarkMode
                          ? 'border-white/70 bg-white/70 group-hover:border-white group-hover:bg-white'
                          : 'border-black bg-black group-hover:border-black group-hover:bg-black'
                    )}
                  />
                  <span
                    className={classNames(
                      'landing-slider-label text-left text-sm transition-all duration-300 ease-in',
                      isDarkMode ? 'text-white' : 'text-black',
                      isActive ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-1 opacity-0'
                    )}
                  >
                    {section.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
