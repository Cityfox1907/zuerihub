'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'

const CAT_INFO = {
  konzerte: { emoji: '🎤', label: 'Konzerte', color: '#e63946' },
  festivals: { emoji: '🎵', label: 'Festivals', color: '#7c3aed' },
  sport: { emoji: '🏅', label: 'Sport', color: '#0ea5e9' },
  tradition: { emoji: '🎭', label: 'Tradition', color: '#d97706' },
  kulinarik: { emoji: '🍷', label: 'Kulinarik', color: '#16a34a' },
  community: { emoji: '🎨', label: 'Community', color: '#db2777' },
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

function useCountdown(targetDate) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])
  const diff = new Date(targetDate) - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, passed: true }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return { days, hours, minutes, passed: false }
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
  const sorted = useMemo(() => [...events].sort((a, b) => new Date(a.date) - new Date(b.date)), [events])

  // Filter by category
  const catFiltered = useMemo(() => activeCat ? sorted.filter(e => e.category === activeCat) : sorted, [sorted, activeCat])

  // Filter by selected months
  const filtered = useMemo(() => {
    if (selectedMonths.size === 0) return catFiltered
    return catFiltered.filter(e => {
      const d = new Date(e.date)
      const monthIdx = d.getMonth() // 0-11
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

  // Category counts
  const catCounts = useMemo(() => {
    const c = {}
    events.forEach(e => { c[e.category] = (c[e.category] || 0) + 1 })
    return c
  }, [events])

  // Next highlight event
  const nextHighlight = useMemo(() =>
    sorted.find(e => e.highlight && new Date(e.date) > now), [sorted])

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

      {/* Pulse Hero Banner */}
      {nextHighlight && <PulseHero event={nextHighlight} />}

      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
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
              <div className="event-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '.75rem' }}>
                {grouped[key].map(e => <EventCard key={e.id} event={e} />)}
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

function PulseHero({ event }) {
  const { days, hours, minutes, passed } = useCountdown(event.date)
  const cat = CAT_INFO[event.category] || { color: 'var(--primary)', emoji: '🎪' }
  const linkUrl = event.websiteUrl || event.ticketUrl
  const linkLabel = event.websiteUrl ? '🌐 Mehr Infos' : '🎟️ Tickets & Infos'

  return (
    <div className="fade-up" style={{
      maxWidth: 1480, margin: '0 auto', padding: '1rem 1.5rem 0',
    }}>
      <div style={{
        background: `linear-gradient(135deg, var(--primary-light) 0%, ${cat.color}12 100%)`,
        border: '1px solid var(--border-light)',
        borderRadius: 14, padding: '.75rem 1.25rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        maxHeight: 120, overflow: 'hidden',
      }}>
        <span style={{ fontSize: '2rem', flexShrink: 0 }}>{event.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '.65rem', fontWeight: 600, color: cat.color, textTransform: 'uppercase', letterSpacing: .5, marginBottom: '.1rem' }}>Nächstes Highlight</div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.name}</div>
          <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginTop: '.15rem' }}>📅 {event.dateLabel} · 📍 {event.location}</div>
        </div>
        {!passed && (
          <div style={{ display: 'flex', gap: '.6rem', flexShrink: 0 }}>
            <CountdownUnit value={days} label="Tage" color={cat.color} />
            <CountdownUnit value={hours} label="Std" color={cat.color} />
            <CountdownUnit value={minutes} label="Min" color={cat.color} />
          </div>
        )}
        {linkUrl && (
          <a href={linkUrl} target="_blank" rel="noopener" style={{
            padding: '.45rem 1rem', borderRadius: 10, background: cat.color, color: '#fff',
            fontWeight: 700, fontSize: '.8rem', textDecoration: 'none', whiteSpace: 'nowrap',
            minHeight: 44, display: 'inline-flex', alignItems: 'center', flexShrink: 0,
          }}>{linkLabel}</a>
        )}
      </div>
    </div>
  )
}

function CountdownUnit({ value, label, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-display)', color: color || 'var(--primary)' }}>{value}</div>
      <div style={{ fontSize: '.6rem', color: 'var(--text3)', marginTop: '.1rem' }}>{label}</div>
    </div>
  )
}

function EventCard({ event }) {
  const now = new Date()
  const isPast = new Date(event.dateEnd || event.date) < now
  const cat = CAT_INFO[event.category] || { emoji: '🎪', label: 'Event', color: 'var(--primary)' }

  return (
    <div className="fade-up" style={{
      background: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)',
      padding: '1rem 1.1rem', boxShadow: 'var(--shadow-soft)', transition: 'transform .2s, box-shadow .2s',
      opacity: isPast ? 0.5 : 1, position: 'relative',
    }}
      onMouseEnter={e => { if (!isPast) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-soft)' }}
    >
      {event.status === 'soldout' && (
        <div style={{ position: 'absolute', top: 8, right: 8, padding: '.15rem .5rem', borderRadius: 8, background: '#fee2e2', color: '#dc2626', fontSize: '.65rem', fontWeight: 700 }}>Ausverkauft</div>
      )}
      {event.highlight && event.status !== 'soldout' && (
        <div style={{ position: 'absolute', top: 8, right: 8, padding: '.15rem .5rem', borderRadius: 8, background: 'rgba(234,179,8,.12)', color: '#b45309', fontSize: '.65rem', fontWeight: 700 }}>Highlight</div>
      )}
      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{event.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--text)', marginBottom: '.15rem' }}>{event.name}</div>
          <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginBottom: '.15rem' }}>📅 {event.dateLabel}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text3)', marginBottom: '.4rem' }}>📍 {event.location}</div>
          <div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
            <span style={{ padding: '.12rem .45rem', borderRadius: 6, fontSize: '.65rem', fontWeight: 600, background: cat.color + '15', color: cat.color }}>{cat.emoji} {cat.label}</span>
            {event.tags?.slice(0, 2).map(t => (
              <span key={t} style={{ padding: '.12rem .4rem', borderRadius: 6, fontSize: '.65rem', fontWeight: 500, background: 'var(--surface2)', color: 'var(--text3)' }}>{t}</span>
            ))}
          </div>
          {!isPast && (event.websiteUrl || event.ticketUrl) && (
            <div>
              <a href={event.websiteUrl || event.ticketUrl} target="_blank" rel="noopener" style={{
                padding: '.35rem .7rem', borderRadius: 8, background: cat.color, color: '#fff',
                fontSize: '.75rem', fontWeight: 700, textDecoration: 'none', minHeight: 44,
                display: 'inline-flex', alignItems: 'center',
              }}>{event.websiteUrl ? '🌐 Mehr Infos' : '🎟️ Tickets & Infos'}</a>
            </div>
          )}
          {isPast && <span style={{ fontSize: '.72rem', color: 'var(--text3)', fontStyle: 'italic' }}>Vergangen</span>}
        </div>
      </div>
    </div>
  )
}
