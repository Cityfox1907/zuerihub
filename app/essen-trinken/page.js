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
  { emoji: '🍽️', label: 'Restaurant' },
  { emoji: '🍺', label: 'Bar' },
  { emoji: '☕', label: 'Café' },
  { emoji: '🥐', label: 'Bäckerei' },
  { emoji: '🥡', label: 'Takeaway' },
]

const TAG_CATS = [
  { emoji: '🇮🇹', label: 'Italienisch' },
  { emoji: '🇯🇵', label: 'Japanisch' },
  { emoji: '🇮🇳', label: 'Indisch' },
  { emoji: '🇹🇷', label: 'Türkisch' },
  { emoji: '🇨🇳', label: 'Chinesisch' },
  { emoji: '🇹🇭', label: 'Thai' },
  { emoji: '🇨🇭', label: 'Schweizer' },
  { emoji: '🍕', label: 'Pizzeria' },
  { emoji: '🍣', label: 'Sushi' },
  { emoji: '🍔', label: 'Burger' },
  { emoji: '🥙', label: 'Döner' },
  { emoji: '🌱', label: 'Vegan' },
  { emoji: '☕', label: 'Coffee Shop' },
  { emoji: '🍸', label: 'Cocktailbar' },
  { emoji: '🍷', label: 'Weinbar' },
  { emoji: '🍺', label: 'Pub' },
]

export default function GastronomiePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)
  const [subcatFilter, setSubcatFilter] = useState('')

  useEffect(() => { loadAllData().then(d => { setData(d); setLoading(false) }) }, [])
  if (loading || !data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  return (
    <>
      <Header />
      <NavTabs active="gastronomie" />
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '.3rem' }}>🍽️ Essen & Trinken</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1rem' }}>{fmt(data.gastro.length)} Restaurants, Bars & Cafés in Zürich</p>
        <SubcategoryNav
          spots={data.gastro}
          mainCategories={MAIN_CATS}
          tagCategories={TAG_CATS}
          tagLabel="Küche & Spezialitäten"
          activeFilter={subcatFilter}
          onFilter={setSubcatFilter}
        />
        <CategoryDiscovery spots={data.gastro} allSpots={data.all} storageKey="zh-dice-seen-gastro" onOpenModal={setModalSpot} subcatFilter={subcatFilter} />
      </div>
      <Footer />
      <BackToTop />
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={() => setModalSpot(null)} />}
    </>
  )
}
