'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import Hero from '@/components/Hero'
import CategoryCards from '@/components/CategoryCards'
import SpotRow from '@/components/SpotRow'
import SpotModal from '@/components/SpotModal'
import GeheimtippDice from '@/components/GeheimtippDice'
import SplashScreen from '@/components/SplashScreen'
import BackToTop from '@/components/BackToTop'
import Footer from '@/components/Footer'
import { loadAllData } from '@/lib/data'

export default function HomePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)
  const [splashProgress, setSplashProgress] = useState(0)
  const [splashDone, setSplashDone] = useState(false)
  const [events, setEvents] = useState([])

  useEffect(() => {
    loadAllData((n) => setSplashProgress(n))
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { console.error(e); setLoading(false) })
    fetch('/data/events.json')
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(() => {})
  }, [])

  const handleSplashDone = useCallback(() => setSplashDone(true), [])

  if (loading && !splashDone) {
    return <SplashScreen progress={splashProgress} onDone={handleSplashDone} />
  }

  if (!data) return null

  // Two ranking rows: popular (by review count, min 4.0 rating) and best-rated (by rating, min 50 reviews)
  const popular = data.all.filter(p => p.r >= 4.0 && p.rv > 0).sort((a, b) => b.rv - a.rv).slice(0, 10)
  const bestRated = data.all.filter(p => p.rv >= 50).sort((a, b) => b.r !== a.r ? b.r - a.r : b.rv - a.rv).slice(0, 10)

  const topRestaurants = data.gastro.filter(p => p.trade === 'Restaurant' && p.r >= 4.3 && p.rv >= 200).sort((a, b) => b.r !== a.r ? b.r - a.r : b.rv - a.rv)
  const topMuseen = [...data.museen].sort((a, b) => (b.rv * b.r) - (a.rv * a.r))
  const topShops = [...data.shops].sort((a, b) => (b.rv * b.r) - (a.rv * a.r))
  const topFun = [...data.fun].sort((a, b) => (b.rv * b.r) - (a.rv * a.r))

  // Upcoming events (next 3 months)
  const now = new Date()
  const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
  const upcomingEvents = events
    .filter(e => {
      const d = new Date(e.dateEnd || e.date)
      return d >= now && d <= threeMonthsLater
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  const highlightEvents = upcomingEvents.filter(e => e.highlight).slice(0, 6)
  const topEvents = highlightEvents.length >= 3 ? highlightEvents : upcomingEvents.slice(0, 6)
  const nextHighlight = upcomingEvents.find(e => e.highlight)

  // Events FIRST in categories
  const categories = [
    { emoji: '🎪', title: 'Events', sub: 'Veranstaltungen', count: upcomingEvents.length, href: '/events' },
    { emoji: '🍽️', title: 'Gastronomie', sub: 'Restaurants & Bars', count: data.gastro.length, href: '/gastronomie' },
    { emoji: '🛍️', title: 'Shops', sub: 'Einkaufen in Zürich', count: data.shops.length, href: '/shops' },
    { emoji: '🏛️', title: 'Kultur', sub: 'Museen & Sehenswürdigkeiten', count: data.attr.length + data.museen.length, href: '/kultur' },
    { emoji: '🎮', title: 'Spiel & Spass', sub: 'Entertainment & Freizeit', count: data.fun.length, href: '/spiel-spass' },
  ]

  return (
    <>
      <Header />
      <NavTabs active="discovery" />
      <Hero />
      <CategoryCards categories={categories} />

      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
        {/* Mini Pulse Banner for next highlight event */}
        {nextHighlight && <MiniPulseBanner event={nextHighlight} />}

        {/* Top Events - large cards */}
        {topEvents.length >= 3 && (
          <>
            <SectionDivider label="🎪 Top Events" />
            <HighlightEventRow events={topEvents} />
          </>
        )}

        {/* Geheimtipp Dice */}
        <SectionDivider label="🎲 Geheimtipp-Würfel" />
        <GeheimtippDice allSpots={data.all} onOpenModal={setModalSpot} />

        <SectionDivider label="🔥 Beliebt" />
        <SpotRow icon="🔥" title="Beliebt in Zürich" items={popular} onOpenModal={setModalSpot} />

        <SectionDivider label="⭐ Bestbewertet" />
        <SpotRow icon="⭐" title="Bestbewertet in Zürich" items={bestRated} onOpenModal={setModalSpot} />

        <SectionDivider label="🍽️ Gastronomie" />
        <SpotRow icon="🍽️" title="Beliebteste Restaurants" items={topRestaurants.slice(0, 10)} link="/gastronomie" onOpenModal={setModalSpot} />
        <LazySection>
          {topMuseen.length >= 3 && <>
            <SectionDivider label="🖼️ Museen" />
            <SpotRow icon="🖼️" title="Top Museen" items={topMuseen.slice(0, 10)} link="/kultur" onOpenModal={setModalSpot} />
          </>}
        </LazySection>
        <LazySection>
          {topShops.length >= 3 && <>
            <SectionDivider label="🛍️ Shops" />
            <SpotRow icon="🛍️" title="Beliebte Shops" items={topShops.slice(0, 10)} link="/shops" onOpenModal={setModalSpot} />
          </>}
        </LazySection>
        <LazySection>
          {topFun.length >= 3 && <>
            <SectionDivider label="🎮 Spiel & Spass" />
            <SpotRow icon="🎮" title="Top Entertainment" items={topFun.slice(0, 10)} link="/spiel-spass" onOpenModal={setModalSpot} />
          </>}
        </LazySection>
      </div>

      <Footer />
      <BackToTop />
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={() => setModalSpot(null)} />}
    </>
  )
}

function SectionDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', margin: '1.8rem 0 1rem' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
      <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
    </div>
  )
}

function MiniPulseBanner({ event }) {
  const now = new Date()
  const diff = new Date(event.date) - now
  const days = Math.max(0, Math.floor(diff / 86400000))

  return (
    <a href="/events" style={{
      display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem',
      borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
      color: '#fff', textDecoration: 'none', marginBottom: '.5rem',
      boxShadow: '0 4px 16px rgba(15,71,175,.2)', transition: 'transform .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      <span style={{ fontSize: '1.4rem' }}>{event.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '.82rem', fontWeight: 700 }}>{event.name}</div>
        <div style={{ fontSize: '.72rem', opacity: .8 }}>{event.dateLabel} · {event.location}</div>
      </div>
      {days > 0 && (
        <div style={{ textAlign: 'center', padding: '0 .5rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{days}</div>
          <div style={{ fontSize: '.6rem', opacity: .7 }}>Tage</div>
        </div>
      )}
      <span style={{ fontSize: '.75rem', opacity: .7 }}>›</span>
    </a>
  )
}

function LazySection({ children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ minHeight: visible ? 'auto' : 100 }}>
      {visible ? children : null}
    </div>
  )
}

const CAT_COLORS = {
  konzerte: '#e63946', festivals: '#7c3aed', sport: '#0ea5e9',
  tradition: '#d97706', kulinarik: '#16a34a', community: '#db2777',
}

function HighlightEventRow({ events }) {
  return (
    <section className="fade-up" style={{ marginBottom: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.55rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '.35rem', margin: 0 }}>
          <span style={{ fontSize: '1.1rem' }}>🎪</span> Top Events der nächsten 3 Monate
        </h2>
        <a href="/events" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>Alle anzeigen ›</a>
      </div>
      <div className="highlight-event-scroll" style={{
        display: 'flex', gap: '1rem', overflowX: 'auto', scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '.25rem',
      }}>
        {events.map(evt => {
          const catColor = CAT_COLORS[evt.category] || 'var(--primary)'
          const now = new Date()
          const diff = new Date(evt.date) - now
          const days = Math.max(0, Math.floor(diff / 86400000))
          return (
            <a key={evt.id} href="/events" style={{
              flex: '0 0 340px', minWidth: 340, scrollSnapAlign: 'start',
              background: 'var(--card-bg)', borderRadius: 18, overflow: 'hidden',
              boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-light)',
              textDecoration: 'none', color: 'inherit', transition: 'transform .25s, box-shadow .25s',
              display: 'flex', flexDirection: 'column',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-soft)' }}
            >
              {/* Colored header bar */}
              <div style={{
                background: `linear-gradient(135deg, ${catColor}, ${catColor}cc)`,
                padding: '1.2rem 1.25rem', color: '#fff', position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <span style={{ fontSize: '2.2rem' }}>{evt.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>{evt.name}</div>
                    <div style={{ fontSize: '.78rem', opacity: .85, marginTop: '.2rem' }}>📅 {evt.dateLabel}</div>
                  </div>
                  {days > 0 && (
                    <div style={{ textAlign: 'center', padding: '.3rem .6rem', background: 'rgba(255,255,255,.18)', borderRadius: 10 }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{days}</div>
                      <div style={{ fontSize: '.55rem', opacity: .8 }}>Tage</div>
                    </div>
                  )}
                </div>
              </div>
              {/* Body */}
              <div style={{ padding: '1rem 1.25rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                <div style={{ fontSize: '.82rem', color: 'var(--text2)' }}>📍 {evt.location}</div>
                <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '.15rem .5rem', borderRadius: 6, fontSize: '.68rem', fontWeight: 600, background: catColor + '15', color: catColor }}>
                    {evt.category}
                  </span>
                  {evt.tags?.slice(0, 2).map(t => (
                    <span key={t} style={{ padding: '.15rem .45rem', borderRadius: 6, fontSize: '.65rem', fontWeight: 500, background: 'var(--surface2)', color: 'var(--text3)' }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '.4rem', marginTop: 'auto' }}>
                  {evt.ticketUrl && (
                    <span style={{ padding: '.4rem .8rem', borderRadius: 8, background: catColor, color: '#fff', fontSize: '.78rem', fontWeight: 700, minHeight: 44, display: 'flex', alignItems: 'center' }}>🎫 Tickets</span>
                  )}
                  {evt.websiteUrl && (
                    <span style={{ padding: '.4rem .8rem', borderRadius: 8, background: 'var(--surface2)', color: 'var(--text2)', fontSize: '.78rem', fontWeight: 600, border: '1px solid var(--border-light)', minHeight: 44, display: 'flex', alignItems: 'center' }}>🌐 Info</span>
                  )}
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
