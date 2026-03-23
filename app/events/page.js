'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'

const CAT_INFO = {
  tradition: { emoji: '🎭', label: 'Züri Tradition', color: '#d97706' },
  konzerte: { emoji: '🎤', label: 'Konzerte', color: '#e63946' },
  festivals: { emoji: '🎵', label: 'Festivals', color: '#7c3aed' },
  sport: { emoji: '🏅', label: 'Sport', color: '#0ea5e9' },
  kulinarik: { emoji: '🍷', label: 'Kulinarik', color: '#16a34a' },
  community: { emoji: '🎨', label: 'Community', color: '#db2777' },
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const MONTH_FULL = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const DAY_NAMES_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

const CAT_BG_COLORS = {
  konzerte: '#dbeafe',
  festivals: '#ede9fe',
  sport: '#dcfce7',
  tradition: '#ffedd5',
  kulinarik: '#fee2e2',
  community: '#fef9c3',
}

/** Check if an event is expired (24h after end date) */
function isEventExpired(event) {
  const now = new Date()
  const endDate = new Date(event.dateEnd || event.date)
  const expiry = new Date(endDate.getTime() + 24 * 60 * 60 * 1000)
  return now > expiry
}

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState('')
  const [selectedMonths, setSelectedMonths] = useState(new Set())
  const monthRefs = useRef({})

  useEffect(() => {
    fetch('/data/events.json')
      .then(r => r.json())
      .then(d => { setEvents(d.events || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const now = new Date()

  // Filter out expired events (24h after end date)
  const activeEvents = useMemo(() => events.filter(e => !isEventExpired(e)), [events])

  const sorted = useMemo(() => [...activeEvents].sort((a, b) => new Date(a.date) - new Date(b.date)), [activeEvents])

  // Top highlighted events (all highlights, not just 3)
  const topHighlights = useMemo(() => {
    const threeMonths = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
    return sorted
      .filter(e => e.highlight && new Date(e.date) > now && new Date(e.date) <= threeMonths)
  }, [sorted])

  // Filter by category
  const catFiltered = useMemo(() => activeCat ? sorted.filter(e => e.category === activeCat) : sorted, [sorted, activeCat])

  // Filter by selected months
  const filtered = useMemo(() => {
    if (selectedMonths.size === 0) return catFiltered
    return catFiltered.filter(e => {
      const d = new Date(e.date)
      const monthIdx = d.getMonth()
      return selectedMonths.has(monthIdx)
    })
  }, [catFiltered, selectedMonths])

  // Group by month
  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(e => {
      const d = new Date(e.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      ;(g[key] = g[key] || []).push(e)
    })
    return g
  }, [filtered])

  const monthKeys = Object.keys(grouped).sort()

  // Category counts (only active events)
  const catCounts = useMemo(() => {
    const c = {}
    activeEvents.forEach(e => { c[e.category] = (c[e.category] || 0) + 1 })
    return c
  }, [activeEvents])

  // Toggle month selection
  const toggleMonth = (monthIdx) => {
    setSelectedMonths(prev => {
      const next = new Set(prev)
      if (next.has(monthIdx)) {
        next.delete(monthIdx)
      } else {
        next.add(monthIdx)
      }
      return next
    })
  }

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  return (
    <>
      <Header />
      <NavTabs active="events" />

      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
        {/* Top Highlighted Events - Swipeable Row */}
        {topHighlights.length > 0 && (
          <TopEventsRow events={topHighlights} />
        )}

        {/* Category Filter Cards */}
        <div className="event-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '.6rem', marginBottom: '1.5rem' }}>
          {Object.entries(CAT_INFO).map(([key, info]) => (
            <button key={key} onClick={() => setActiveCat(activeCat === key ? '' : key)}
              style={{
                padding: '.8rem .5rem', borderRadius: 14, border: `2px solid ${activeCat === key ? info.color : 'var(--border-light)'}`,
                background: activeCat === key ? info.color + '12' : 'var(--card-bg)', cursor: 'pointer',
                textAlign: 'center', transition: 'all .2s', boxShadow: 'var(--shadow-xs)', minHeight: 44,
              }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '.2rem' }}>{info.emoji}</div>
              <div style={{ fontSize: '.78rem', fontWeight: 700, color: activeCat === key ? info.color : 'var(--text)' }}>{info.label}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--text3)', marginTop: '.1rem' }}>{catCounts[key] || 0} Events</div>
            </button>
          ))}
        </div>

        {/* Month Filter Pills - Jan to Dec */}
        <div style={{ display: 'flex', gap: '.35rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {MONTH_NAMES.map((name, idx) => {
            const isSelected = selectedMonths.has(idx)
            return (
              <button key={idx} onClick={() => toggleMonth(idx)}
                style={{
                  padding: '.4rem .8rem', borderRadius: 20, border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--primary)' : 'var(--surface)',
                  color: isSelected ? '#fff' : 'var(--text2)',
                  fontSize: '.78rem', fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer', transition: 'all .15s', minHeight: 44,
                  minWidth: 'fit-content',
                }}>
                {name}
              </button>
            )
          })}
        </div>

        {/* Events by Month */}
        {monthKeys.map(key => {
          const [y, m] = key.split('-')
          return (
            <div key={key} ref={el => monthRefs.current[key] = el} style={{ marginBottom: '2rem', scrollMarginTop: 120 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                📅 {MONTH_NAMES[+m - 1]} {y}
                <span style={{ fontSize: '.75rem', fontWeight: 500, color: 'var(--text3)' }}>({grouped[key].length})</span>
              </h2>
              <div className="event-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '.75rem' }}>
                {[...grouped[key]].sort((a, b) => {
                  const aPast = new Date(a.dateEnd || a.date) < now ? 1 : 0
                  const bPast = new Date(b.dateEnd || b.date) < now ? 1 : 0
                  return aPast - bPast
                }).map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🎪</div>
            Keine Events {selectedMonths.size > 0 ? 'in den ausgewählten Monaten' : 'in dieser Kategorie'} gefunden.
          </div>
        )}
      </div>
    </>
  )
}

function TopEventsRow({ events }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, events])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector('.highlight-event-card')
    const cardWidth = card?.offsetWidth || 280
    el.scrollBy({ left: dir * (cardWidth + 12), behavior: 'smooth' })
  }

  return (
    <section className="fade-up highlight-event-section" style={{ marginBottom: '1.5rem', position: 'relative' }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '.55rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        ⭐ Top Events
      </h2>

      <div style={{ position: 'relative' }}>
        {canScrollLeft && (
          <button className="highlight-event-arrow highlight-event-arrow-left" onClick={() => scroll(-1)}
            style={{
              position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text)', cursor: 'pointer',
              fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)', zIndex: 5, opacity: 0, transition: 'opacity .2s',
            }}>‹</button>
        )}

        {canScrollRight && (
          <button className="highlight-event-arrow highlight-event-arrow-right" onClick={() => scroll(1)}
            style={{
              position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text)', cursor: 'pointer',
              fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)', zIndex: 5, opacity: 0, transition: 'opacity .2s',
            }}>›</button>
        )}

        <div ref={scrollRef} className="highlight-event-scroll" style={{
          display: 'flex', gap: '.75rem', overflowX: 'auto',
          scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch', paddingBottom: '.25rem',
        }}>
          {events.map(evt => {
            const cat = CAT_INFO[evt.category] || { color: 'var(--primary)', emoji: '🎪' }
            const now = new Date()
            const diff = new Date(evt.date) - now
            const days = Math.max(0, Math.floor(diff / 86400000))
            const linkUrl = evt.websiteUrl || evt.ticketUrl || '/events'
            return (
              <a key={evt.id} href={linkUrl} target={linkUrl !== '/events' ? '_blank' : undefined} rel={linkUrl !== '/events' ? 'noopener' : undefined}
                className="highlight-event-card"
                style={{
                  flex: '0 0 calc(25% - .56rem)', minWidth: 240, scrollSnapAlign: 'start',
                  background: 'var(--card-bg)', borderRadius: 14, overflow: 'hidden',
                  boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-light)',
                  textDecoration: 'none', color: 'inherit', transition: 'transform .25s, box-shadow .25s',
                  display: 'flex', flexDirection: 'column',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-soft)' }}
              >
                <div style={{
                  background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`,
                  padding: '.8rem .9rem', color: '#fff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>{evt.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '.88rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.name}</div>
                      <div style={{ fontSize: '.7rem', opacity: .85, marginTop: '.15rem' }}>📅 {evt.dateLabel}</div>
                    </div>
                    {days > 0 && (
                      <div style={{ textAlign: 'center', padding: '.2rem .4rem', background: 'rgba(255,255,255,.18)', borderRadius: 8, flexShrink: 0 }}>
                        <div style={{ fontSize: '.95rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{days}</div>
                        <div style={{ fontSize: '.5rem', opacity: .8 }}>Tage</div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: '.6rem .9rem .7rem', fontSize: '.75rem', color: 'var(--text2)' }}>
                  📍 {evt.location}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function getEventDayInfo(event) {
  const start = new Date(event.date)
  const end = event.dateEnd ? new Date(event.dateEnd) : start
  const isMultiDay = end.getTime() !== start.getTime()
  const startDay = start.getDate()
  const endDay = end.getDate()
  const startDow = start.getDay()
  const endDow = end.getDay()

  const isWeekend = [0, 5, 6].includes(startDow) || (isMultiDay && [0, 5, 6].includes(endDow))

  let dayLabel
  if (isMultiDay) {
    dayLabel = `${DAY_NAMES_SHORT[startDow]}–${DAY_NAMES_SHORT[endDow]}`
  } else {
    dayLabel = DAY_NAMES_SHORT[startDow]
  }

  let dateRange
  if (isMultiDay) {
    if (start.getMonth() === end.getMonth()) {
      dateRange = `${DAY_NAMES_SHORT[startDow]} ${startDay}. – ${DAY_NAMES_SHORT[endDow]} ${endDay}. ${MONTH_FULL[start.getMonth()]}`
    } else {
      dateRange = `${DAY_NAMES_SHORT[startDow]} ${startDay}. ${MONTH_NAMES[start.getMonth()]} – ${DAY_NAMES_SHORT[endDow]} ${endDay}. ${MONTH_NAMES[end.getMonth()]}`
    }
  } else {
    dateRange = null
  }

  return { startDay, endDay, startMonth: start.getMonth(), dayLabel, isWeekend, isMultiDay, dateRange }
}

function EventCard({ event }) {
  const now = new Date()
  const isPast = new Date(event.dateEnd || event.date) < now
  const cat = CAT_INFO[event.category] || { emoji: '🎪', label: 'Event', color: 'var(--primary)' }
  const catBg = CAT_BG_COLORS[event.category] || '#f3f4f6'
  const info = getEventDayInfo(event)

  return (
    <div className="fade-up" style={{
      background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-soft)', transition: 'transform .2s, box-shadow .2s',
      opacity: isPast ? 0.45 : 1, position: 'relative', overflow: 'hidden',
      display: 'flex', borderLeft: `4px solid ${cat.color}`,
    }}
      onMouseEnter={e => { if (!isPast) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-soft)' }}
    >
      {/* Calendar Leaf - left side */}
      <div style={{
        width: 80, minHeight: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: catBg, padding: '.5rem .25rem', position: 'relative',
      }}>
        <div style={{ fontSize: '1.6rem', lineHeight: 1, marginBottom: '.25rem' }}>{event.emoji}</div>
        <div style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', color: cat.color, letterSpacing: .5 }}>
          {MONTH_NAMES[info.startMonth]}
        </div>
        <div style={{
          fontSize: info.isMultiDay ? '1.1rem' : '1.5rem', fontWeight: 800, lineHeight: 1.1,
          fontFamily: 'var(--font-display)', color: 'var(--text)',
        }}>
          {info.isMultiDay ? `${info.startDay}–${info.endDay}` : info.startDay}
        </div>
        <div style={{
          fontSize: '.68rem', fontWeight: 700, color: info.isWeekend ? cat.color : 'var(--text3)',
          marginTop: '.1rem',
        }}>
          {info.dayLabel}
        </div>
        {isPast && (
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0, height: 2,
            background: 'var(--text3)', opacity: .5,
          }} />
        )}
      </div>

      {/* Content - right side */}
      <div style={{ flex: 1, minWidth: 0, padding: '.75rem .9rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.5rem' }}>
          <div style={{
            fontWeight: 700, fontSize: '.92rem', color: isPast ? 'var(--text3)' : 'var(--text)',
            textDecoration: isPast ? 'line-through' : 'none', lineHeight: 1.25,
          }}>{event.name}</div>
          {event.status === 'soldout' && (
            <span style={{ padding: '.1rem .4rem', borderRadius: 6, background: '#fee2e2', color: '#dc2626', fontSize: '.6rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>Ausverkauft</span>
          )}
          {event.highlight && event.status !== 'soldout' && (
            <span style={{ padding: '.1rem .4rem', borderRadius: 6, background: 'rgba(234,179,8,.12)', color: '#b45309', fontSize: '.6rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>⭐ Highlight</span>
          )}
        </div>

        {info.dateRange && (
          <div style={{ fontSize: '.73rem', color: 'var(--text2)' }}>{info.dateRange}</div>
        )}

        <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>📍 {event.location}</div>

        <div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap', marginTop: '.15rem' }}>
          <span style={{ padding: '.1rem .4rem', borderRadius: 6, fontSize: '.62rem', fontWeight: 600, background: cat.color + '15', color: cat.color }}>{cat.emoji} {cat.label}</span>
          {event.tags?.slice(0, 2).map(t => (
            <span key={t} style={{ padding: '.1rem .35rem', borderRadius: 6, fontSize: '.62rem', fontWeight: 500, background: 'var(--surface2)', color: 'var(--text3)' }}>{t}</span>
          ))}
        </div>

        {!isPast && (event.websiteUrl || event.ticketUrl) && (
          <div style={{ marginTop: '.25rem' }}>
            <a href={event.websiteUrl || event.ticketUrl} target="_blank" rel="noopener" style={{
              padding: '.3rem .65rem', borderRadius: 8, background: cat.color, color: '#fff',
              fontSize: '.72rem', fontWeight: 700, textDecoration: 'none', minHeight: 44,
              display: 'inline-flex', alignItems: 'center',
            }}>Mehr Infos →</a>
          </div>
        )}
        {isPast && <span style={{ fontSize: '.68rem', color: 'var(--text3)', fontStyle: 'italic' }}>Vergangen</span>}
      </div>
    </div>
  )
}
