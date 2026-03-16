'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import Hero from '@/components/Hero'
import CategoryCards from '@/components/CategoryCards'
import SpotRow from '@/components/SpotRow'
import SpotModal from '@/components/SpotModal'
import { loadAllData } from '@/lib/data'

export default function HomePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)

  useEffect(() => {
    loadAllData().then(d => { setData(d); setLoading(false) }).catch(e => { console.error(e); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ background: 'var(--primary)', position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 9999 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800 }}>ZüriHub</div>
        <div style={{ fontSize: '.95rem', opacity: .7, marginTop: '.5rem' }}>Entdecke das Beste von Zürich</div>
        <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .65s linear infinite', marginTop: '2rem' }} />
      </div>
    )
  }

  if (!data) return null

  const sorted = data.all.filter(p => p.r > 0 && p.rv > 0).sort((a, b) => (b.r * b.rv) - (a.r * a.rv))
  const topRestaurants = data.gastro.filter(p => p.trade === 'Restaurant' && p.r >= 4.3 && p.rv >= 200).sort((a, b) => b.r !== a.r ? b.r - a.r : b.rv - a.rv)
  const topMuseen = data.museen.sort((a, b) => (b.rv * b.r) - (a.rv * a.r))
  const topShops = data.shops.sort((a, b) => (b.rv * b.r) - (a.rv * a.r))
  const topFun = data.fun.sort((a, b) => (b.rv * b.r) - (a.rv * a.r))

  const categories = [
    { emoji: '🍽️', title: 'Gastronomie', sub: 'Restaurants & Bars', count: data.gastro.length, href: '/gastronomie' },
    { emoji: '🛍️', title: 'Shops', sub: 'Einkaufen in Zürich', count: data.shops.length, href: '/shops' },
    { emoji: '🏛️', title: 'Kultur', sub: 'Museen & Sehenswürdigkeiten', count: data.attr.length + data.museen.length, href: '/kultur' },
    { emoji: '🎮', title: 'Spiel & Spass', sub: 'Entertainment & Freizeit', count: data.fun.length, href: '/spiel-spass' },
    { emoji: '🎪', title: 'Events', sub: 'Veranstaltungen', count: 0, href: '/events' },
  ]

  return (
    <>
      <Header />
      <NavTabs active="discovery" />
      <Hero />
      <CategoryCards categories={categories} />

      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
        <SpotRow icon="🔥" title="Beliebt in Zürich" items={sorted.slice(0, 10)} onOpenModal={setModalSpot} />
        <SectionDivider label="🍽️ Gastronomie" />
        <SpotRow icon="🍽️" title="Beliebteste Restaurants" items={topRestaurants.slice(0, 10)} link="/gastronomie" onOpenModal={setModalSpot} />
        {topMuseen.length >= 3 && <>
          <SectionDivider label="🖼️ Museen" />
          <SpotRow icon="🖼️" title="Top Museen" items={topMuseen.slice(0, 10)} link="/kultur" onOpenModal={setModalSpot} />
        </>}
        {topShops.length >= 3 && <>
          <SectionDivider label="🛍️ Shops" />
          <SpotRow icon="🛍️" title="Beliebte Shops" items={topShops.slice(0, 10)} link="/shops" onOpenModal={setModalSpot} />
        </>}
        {topFun.length >= 3 && <>
          <SectionDivider label="🎮 Spiel & Spass" />
          <SpotRow icon="🎮" title="Top Entertainment" items={topFun.slice(0, 10)} link="/spiel-spass" onOpenModal={setModalSpot} />
        </>}
      </div>

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
