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
  { emoji: '🏛️', label: 'Sehenswürdigkeit' },
  { emoji: '🏰', label: 'Historische Sehenswürdigkeit' },
  { emoji: '🌳', label: 'Park' },
  { emoji: '🔭', label: 'Aussichtsplattform' },
  { emoji: '🎨', label: 'Kunstmuseum' },
  { emoji: '🔬', label: 'Wissenschaftsmuseum' },
  { emoji: '🦕', label: 'Naturhistorisches Museum' },
  { emoji: '🎭', label: 'Kulturmuseum' },
  { emoji: '🧒', label: 'Kindermuseum' },
]

export default function KulturPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)
  const [subcatFilter, setSubcatFilter] = useState('')

  useEffect(() => { loadAllData().then(d => { setData(d); setLoading(false) }) }, [])
  if (loading || !data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  const allKultur = [...data.attr, ...data.museen]

  return (
    <>
      <Header />
      <NavTabs active="kultur" />
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '.3rem' }}>🏛️ Kultur & Natur</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1rem' }}>{fmt(allKultur.length)} Museen & Sehenswürdigkeiten</p>
        <SubcategoryNav
          spots={allKultur}
          mainCategories={MAIN_CATS}
          activeFilter={subcatFilter}
          onFilter={setSubcatFilter}
        />
        <CategoryDiscovery spots={allKultur} allSpots={data.all} storageKey="zh-dice-seen-kultur" onOpenModal={setModalSpot} subcatFilter={subcatFilter} />
      </div>
      <Footer />
      <BackToTop />
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={() => setModalSpot(null)} />}
    </>
  )
}
