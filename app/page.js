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
  const topShops = [...data.shops].filter(p => p.subcat !== 'Einkaufszentren').sort((a, b) => (b.rv * b.r) - (a.rv * a.r))
  const topMalls = [...data.shops].filter(p => p.subcat === 'Einkaufszentren').sort((a, b) => (b.rv * b.r) - (a.rv * a.r))
  const topSecondHand = [...data.shops].filter(p => p.subcat === 'Second-Hand & Vintage').sort((a, b) => b.r !== a.r ? b.r - a.r : b.rv - a.rv).slice(0, 10)
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
  // Pick 5 top events: prioritize highlights, then by date
  const highlightEvents = upcomingEvents.filter(e => e.highlight)
  const nonHighlightEvents = upcomingEvents.filter(e => !e.highlight)
  const topEvents = [...highlightEvents, ...nonHighlightEvents].slice(0, 5)

  // Events FIRST in categories
  const categories = [
    { emoji: '🎪', title: 'Events', sub: 'Veranstaltungen', count: upcomingEvents.length, href: '/events' },
    { emoji: '🍽️', title: 'Essen & Trinken', sub: 'Restaurants & Bars', count: data.gastro.length, href: '/essen-trinken' },
    { emoji: '🛍️', title: 'Shops', sub: 'Einkaufen in Zürich', count: data.shops.length, href: '/shops' },
    { emoji: '🏛️', title: 'Kultur & Natur', sub: 'Museen & Sehenswürdigkeiten', count: data.attr.length + data.museen.length, href: '/kultur' },
    { emoji: '🎮', title: 'Unterhaltung & Spass', sub: 'Entertainment & Freizeit', count: data.fun.length, href: '/spiel-spass' },
  ]

  return (
    <>
      <Header />
      <NavTabs active="discovery" />
      <Hero />
      <CategoryCards categories={categories} />

      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
        {/* Top Events - large cards */}
        {topEvents.length > 0 && (
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

        <SectionDivider label="🍽️ Essen & Trinken" />
        <SpotRow icon="🍽️" title="Beliebteste Restaurants" items={topRestaurants.slice(0, 10)} link="/essen-trinken" onOpenModal={setModalSpot} />
        <LazySection>
          {topMuseen.length >= 3 && <>
            <SectionDivider label="🖼️ Museen" />
            <SpotRow icon="🖼️" title="Top Museen" items={topMuseen.slice(0, 10)} link="/kultur" onOpenModal={setModalSpot} />
          </>}
        </LazySection>
        <LazySection>
          {topMalls.length >= 3 && <>
            <SectionDivider label="🏬 Einkaufszentren" />
            <SpotRow icon="🏬" title="Beliebteste Einkaufszentren in Zürich" items={topMalls.slice(0, 10)} link="/shops" onOpenModal={setModalSpot} />
          </>}
        </LazySection>
        <LazySection>
          {topShops.length >= 3 && <>
            <SectionDivider label="🛍️ Shops" />
            <SpotRow icon="🛍️" title="Beliebte Shops" items={topShops.slice(0, 10)} link="/shops" onOpenModal={setModalSpot} />
          </>}
        </LazySection>
        <LazySection>
          {topSecondHand.length >= 3 && <>
            <SectionDivider label="♻️ Beliebteste Second-Hand & Vintage Geschäfte" />
            <SpotRow icon="♻️" title="Beliebteste Second-Hand & Vintage Geschäfte" items={topSecondHand} link="/shops" onOpenModal={setModalSpot} />
          </>}
        </LazySection>
        <LazySection>
          {topFun.length >= 3 && <>
            <SectionDivider label="🎮 Unterhaltung & Spass" />
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
    <div style={{ margin: '2rem 0 .75rem' }}>
      <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${events.length}, 1fr)`,
        gap: '.75rem',
      }}>
        {events.map(evt => {
          const catColor = CAT_COLORS[evt.category] || 'var(--primary)'
          const now = new Date()
          const diff = new Date(evt.date) - now
          const days = Math.max(0, Math.floor(diff / 86400000))
          const linkUrl = evt.websiteUrl || evt.ticketUrl || '/events'
          return (
            <a key={evt.id} href={linkUrl} target={linkUrl !== '/events' ? '_blank' : undefined} rel={linkUrl !== '/events' ? 'noopener' : undefined} style={{
              background: 'var(--card-bg)', borderRadius: 14, overflow: 'hidden',
              boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-light)',
              textDecoration: 'none', color: 'inherit', transition: 'transform .25s, box-shadow .25s',
              display: 'flex', flexDirection: 'column',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-soft)' }}
            >
              <div style={{
                background: `linear-gradient(135deg, ${catColor}, ${catColor}cc)`,
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
    </section>
  )
}
