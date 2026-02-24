import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { House, MessageSquare, TriangleAlert, Wrench } from 'lucide-react'
import logo from '../assets/logo-clean.png'
import { EXTRA_NAV_ITEMS, NAV_ITEMS } from '../constants/navigation'
import { ROLES } from '../constants/roles'
import { classNames } from '../utils/classNames'

export default function Sidebar({ role, open, onClose }) {
  const isAdmin = role === ROLES.BUILDING_ADMIN || role === ROLES.ADMIN
  const [isMobileDock, setIsMobileDock] = useState(() => window.innerWidth < 1024)
  const dockRef = useRef(null)
  const dockItemRefs = useRef([])
  const mobileDockInitializedRef = useRef(false)
  const autoScrollingRef = useRef(false)
  const settleTimerRef = useRef(null)
  const lastNavigatedIndexRef = useRef(-1)
  const navigate = useNavigate()
  const location = useLocation()
  const visibleMain = useMemo(() => NAV_ITEMS.filter((item) => item.roles.includes(role)), [role])
  const extraIconByPath = useMemo(() => ({
    '/maintenance': Wrench,
    '/damage-reports': TriangleAlert,
    '/communication': MessageSquare,
  }), [])
  const visibleExtra = useMemo(
    () =>
      EXTRA_NAV_ITEMS
        .filter((item) => item.roles.includes(role))
        .map((item) => ({ ...item, icon: extraIconByPath[item.to] || MessageSquare })),
    [extraIconByPath, role]
  )
  const adminItems = useMemo(() => [...visibleMain, ...visibleExtra], [visibleMain, visibleExtra])
  const mobileDockItems = useMemo(() => {
    const homeItem = adminItems.find((item) => item.to === '/dashboard')
    const nonHomeItems = adminItems.filter((item) => item.to !== '/dashboard')
    const mid = Math.floor(nonHomeItems.length / 2)
    return homeItem
      ? [...nonHomeItems.slice(0, mid), { ...homeItem, icon: House }, ...nonHomeItems.slice(mid)]
      : adminItems
  }, [adminItems])
  const dockItems = isMobileDock ? mobileDockItems : adminItems
  const activeDockItem = useMemo(() => {
    const direct = dockItems.find((item) => location.pathname === item.to)
    if (direct) return direct
    return dockItems.find((item) => item.to !== '/dashboard' && location.pathname.startsWith(item.to)) || null
  }, [dockItems, location.pathname])

  const centerDockItem = (index, behavior = 'smooth') => {
    const container = dockRef.current
    const node = dockItemRefs.current[index]
    if (!container || !node) return
    const containerRect = container.getBoundingClientRect()
    const nodeRect = node.getBoundingClientRect()
    const delta = nodeRect.left + nodeRect.width / 2 - (containerRect.left + containerRect.width / 2)
    autoScrollingRef.current = behavior === 'smooth'
    container.scrollTo({ left: container.scrollLeft + delta, behavior })
    if (behavior !== 'smooth') {
      autoScrollingRef.current = false
      return
    }
    setTimeout(() => {
      autoScrollingRef.current = false
    }, 150)
  }

  useEffect(() => {
    const handleResize = () => setIsMobileDock(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isAdmin || !isMobileDock) return
    const activeIndex = dockItems.findIndex((item) => item.to === location.pathname)
    if (activeIndex < 0) return
    centerDockItem(activeIndex, 'smooth')
    lastNavigatedIndexRef.current = activeIndex
  }, [isAdmin, isMobileDock, dockItems, location.pathname])

  useEffect(() => {
    if (!isAdmin) return undefined

    const isDesktop = () => !isMobileDock

    const applyDockFocus = () => {
      if (isDesktop()) {
        dockItemRefs.current.forEach((node) => {
          if (!node) return
          node.style.transform = ''
          node.style.opacity = ''
        })
        return
      }

      const container = dockRef.current
      if (!container) return
      const containerRect = container.getBoundingClientRect()
      const centerX = containerRect.left + containerRect.width / 2
      const maxDistance = 130

      dockItemRefs.current.forEach((node) => {
        if (!node) return
        const rect = node.getBoundingClientRect()
        const itemCenter = rect.left + rect.width / 2
        const distance = Math.abs(centerX - itemCenter)
        const ratio = Math.max(0, 1 - distance / maxDistance)
        const scale = 0.9 + ratio * 0.2
        const lift = 0
        const opacity = 0.64 + ratio * 0.36
        node.style.transform = `translateY(${lift.toFixed(2)}px) scale(${scale.toFixed(3)})`
        node.style.opacity = opacity.toFixed(3)
      })
    }

    const getClosestIndex = () => {
      const container = dockRef.current
      if (!container) return 0

      const containerRect = container.getBoundingClientRect()
      const centerX = containerRect.left + containerRect.width / 2

      let closestIndex = 0
      let closestDistance = Number.POSITIVE_INFINITY

      dockItemRefs.current.forEach((node, index) => {
        if (!node) return
        const rect = node.getBoundingClientRect()
        const itemCenter = rect.left + rect.width / 2
        const distance = Math.abs(centerX - itemCenter)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      return closestIndex
    }

    const updateActiveIndex = () => {
      const closest = getClosestIndex()
      applyDockFocus()
      return closest
    }

    const container = dockRef.current
    const homeIndex = dockItems.findIndex((item) => item.to === '/dashboard')
    if (!isDesktop() && homeIndex >= 0 && !mobileDockInitializedRef.current) {
      mobileDockInitializedRef.current = true
      centerDockItem(homeIndex, 'auto')
    } else {
      updateActiveIndex()
    }

    if (!container) return undefined

    const onScroll = () => {
      if (isDesktop()) return
      if (autoScrollingRef.current) return
      const closestIndex = updateActiveIndex()
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current)
      settleTimerRef.current = setTimeout(() => {
        const target = dockItems[closestIndex]
        if (!target) return
        centerDockItem(closestIndex, 'smooth')
        if (lastNavigatedIndexRef.current === closestIndex && location.pathname === target.to) return
        if (location.pathname !== target.to) {
          navigate(target.to)
        }
        lastNavigatedIndexRef.current = closestIndex
      }, 120)
    }

    applyDockFocus()
    container.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateActiveIndex)
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current)
      container.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateActiveIndex)
    }
  }, [isAdmin, isMobileDock, dockItems, navigate, location.pathname])

  const handleAdminDockClick = (event, item, index) => {
    if (!isMobileDock) {
      onClose()
      return
    }
    event.preventDefault()
    centerDockItem(index, 'smooth')
    if (location.pathname !== item.to) {
      navigate(item.to)
    }
    lastNavigatedIndexRef.current = index
  }

  if (isAdmin) {
    return (
      <>
        <aside
          className={classNames(
            'fixed bottom-3 left-0 right-0 z-40 mx-auto w-[calc(100vw-2.2rem)] max-w-[540px] px-2.5 py-2.5 pointer-events-none motion-safe:animate-[dockSlideUp_320ms_ease-out_both] lg:inset-y-0 lg:left-0 lg:right-auto lg:mx-0 lg:w-24 lg:max-w-none lg:rounded-none lg:border-r lg:border-t-0 lg:border-l-0 lg:border-b-0 lg:p-3 lg:pointer-events-auto lg:motion-safe:animate-none',
            isMobileDock
              ? 'border-0 bg-transparent backdrop-blur-0'
              : 'admin-dock-outer-desktop rounded-full backdrop-blur-md'
          )}
        >
          <div className="mt-2 hidden justify-center lg:flex">
            <img src={logo} alt="Renterz logo" className="h-11 w-11 rounded-xl border border-base object-cover" />
          </div>
          <nav className="flex justify-center lg:mt-3">
            {isMobileDock && activeDockItem ? <div className="admin-dock-floating-label">{activeDockItem.label}</div> : null}
            <div
              className={classNames(
                'w-full pointer-events-auto lg:w-[62px] lg:overflow-visible',
                isMobileDock
                  ? 'admin-dock-u-shell'
                  : 'admin-dock-shell-desktop rounded-[999px] p-2.5 backdrop-blur-xl overflow-visible'
              )}
            >
              <div
                ref={dockRef}
                className={classNames(
                  isMobileDock
                    ? 'admin-dock-track snap-x snap-mandatory overflow-x-auto pt-2.5 pb-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
                    : ''
                )}
              >
                <div
                  className={classNames(
                    'relative flex items-center gap-2.5',
                    isMobileDock ? 'w-max flex-row' : 'min-w-0 flex-col justify-center'
                  )}
                >
                  {dockItems.map((item, index) => (
                    <NavLink
                      key={item.to}
                      ref={(node) => {
                        dockItemRefs.current[index] = node
                      }}
                      to={item.to}
                      onClick={(event) => handleAdminDockClick(event, item, index)}
                      title={item.label}
                      className={({ isActive }) =>
                        classNames(
                          'admin-dock-item snap-center inline-flex h-12 w-12 items-center justify-center rounded-full border',
                          isActive
                            ? 'admin-dock-selected'
                            : 'admin-dock-idle border-transparent',
                          'lg:scale-100 lg:opacity-100 lg:translate-y-0 lg:blur-0'
                        )
                      }
                    >
                      <item.icon size={19} />
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </aside>
      </>
    )
  }

  return (
    <>
      <aside className={classNames('fixed inset-y-0 left-0 z-40 w-72 border-r border-base bg-surface p-4 transition lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="mb-6 border-b border-base pb-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Renterz logo" className="h-11 w-11 rounded-xl border border-base object-cover" />
            <div>
              <h2 className="text-xl font-bold text-main">Renterz Paizza</h2>
              <p className="mt-1 text-xs text-soft">Property Management</p>
            </div>
          </div>
        </div>
        <nav className="space-y-1">
          {visibleMain.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => classNames('flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition', isActive ? 'bg-teal-50 text-teal-700' : 'text-main hover-surface-soft')}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-base pt-4">
          <p className="mb-2 text-xs font-semibold text-soft">Operations</p>
          <div className="space-y-1">
            {visibleExtra.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => classNames('block rounded-xl px-3 py-2 text-sm font-semibold transition', isActive ? 'bg-teal-50 text-teal-700' : 'text-main hover-surface-soft')}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </aside>
      {open ? <button type="button" className="fixed inset-0 z-30 bg-overlay lg:hidden" onClick={onClose} /> : null}
    </>
  )
}
