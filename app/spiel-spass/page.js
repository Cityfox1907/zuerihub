'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import SpotModal from '@/components/SpotModal'
import CategoryDiscovery from '@/components/CategoryDiscovery'
import SubcategoryNav from '@/components/SubcategoryNav'
import BackToTop from '@/components/BackToTop'
import Footer from '@/components/Footer'
import { loadAllData, fmt } from '@/lib/data'

const MAIN_CATS = [
  { emoji: '🔐', label: 'Escape Room' },
  { emoji: '🎳', label: 'Kegelbahn' },
  { emoji: '⛳', label: 'Minigolf' },
  { emoji: '🏎️', label: 'Go Karting' },
  { emoji: '🕹️', label: 'Spielhalle' },
  { emoji: '👶', label: 'Kinder' },
]

export default function SpielSpassPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)
  const [subcatFilters, setSubcatFilters] = useState([])

  useEffect(() => { loadAllData().then(d => { setData(d); setLoading(false) }) }, [])
  if (loading || !data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  return (
    <>
      <Header />
      <NavTabs active="spiel-spass" />
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '.3rem' }}>🎮 Unterhaltung & Spass</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1rem' }}>{fmt(data.fun.length)} Entertainment-Spots</p>
        <SubcategoryNav
          spots={data.fun}
          mainCategories={MAIN_CATS}
          activeFilters={subcatFilters}
          onFilter={setSubcatFilters}
        />
        <CategoryDiscovery spots={data.fun} allSpots={data.all} storageKey="zh-dice-seen-fun" onOpenModal={setModalSpot} subcatFilter={subcatFilters} />
      </div>
      <Footer />
      <BackToTop />
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={() => setModalSpot(null)} />}
    </>
  )
}
