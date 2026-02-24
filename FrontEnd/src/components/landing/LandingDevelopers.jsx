import { useEffect, useRef } from 'react'
import { Bookmark, Linkedin, Mail } from 'lucide-react'
import seenivasanImage from '../../assets/Devteam/1757840241240.jpg'
import akshayaImage from '../../assets/Devteam/Akshaya.jpeg'
import anushaImage from '../../assets/Devteam/Anusha.jpeg'
import prasanthImage from '../../assets/Devteam/Prasanth.jpeg'

const developers = [
  {
    name: 'SEENIVASAN VENKATESAN',
    email: 'seenivasan.tech@gmail.com',
    linkedin: 'https://www.linkedin.com/',
    image: seenivasanImage,
    objectPosition: 'center 35%',
  },
  {
    name: 'PRASANTH KUMAR',
    email: 'prasanthkumar4151@gmail.com',
    linkedin: 'https://www.linkedin.com/',
    image: prasanthImage,
    objectPosition: 'center 35%',
  },
  {
    name: 'AKSHAYA RAJASEKARAN',
    email: 'akshaya.rajasekaran@gmail.com',
    linkedin: 'https://www.linkedin.com/',
    image: akshayaImage,
    objectPosition: 'center 18%',
  },
  {
    name: 'ANUSHA H S',
    email: 'anushahs2011@gmail.com',
    linkedin: 'https://www.linkedin.com/',
    image: anushaImage,
    objectPosition: 'center 22%',
  },
]

export default function LandingDevelopers() {
  const cardRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    )

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section className="dev-team-section rounded-3xl border border-base bg-surface p-6 transition-shadow duration-300 hover:shadow-md md:p-8">
      <h3 className="text-2xl font-bold">Developer's</h3>
      <p className="mt-2 text-sm text-soft">Contact points for implementation, API onboarding, and UI customization.</p>
      <div className="dev-team-grid mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {developers.map((dev, index) => (
          <article
            key={dev.name}
            ref={(el) => {
              cardRefs.current[index] = el
            }}
            className="dev-team-card developer-card-reveal group relative overflow-hidden rounded-[24px] border border-base bg-transparent shadow-[0_24px_60px_rgba(15,23,42,0.12)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(15,23,42,0.2)]"
            style={{ '--reveal-delay': `${index * 90}ms` }}
          >
            <div className="relative overflow-hidden rounded-[24px]">
              <img
                src={dev.image}
                alt={dev.name}
                className="dev-team-photo h-[360px] w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                style={{ objectPosition: dev.objectPosition || 'center 24%' }}
                loading="lazy"
              />

              <button
                type="button"
                aria-label={`Save ${dev.name}`}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/40"
              >
                <Bookmark size={16} />
              </button>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-4 pt-16 text-white transition duration-300 ease-out group-hover:pb-5">
                <h4 className="text-lg font-semibold leading-tight">{dev.name}</h4>
                <div className="mt-4 flex items-center gap-2">
                  <a
                    href={`mailto:${dev.email}`}
                    className="dev-mail-cta inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                  >
                    <Mail size={14} />
                    Get In Touch
                  </a>
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="dev-linkedin-cta inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#0a66c2]/85 text-white backdrop-blur-sm transition hover:bg-[#0a66c2]"
                    aria-label={`${dev.name} LinkedIn`}
                  >
                    <Linkedin size={16} />
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
