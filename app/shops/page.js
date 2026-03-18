'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import SpotModal from '@/components/SpotModal'
import CategoryDiscovery from '@/components/CategoryDiscovery'
import SubcategoryNav from '@/components/SubcategoryNav'
import SpotRow from '@/components/SpotRow'
import BackToTop from '@/components/BackToTop'
import Footer from '@/components/Footer'
import { loadAllData, fmt } from '@/lib/data'

const MAIN_CATS = [
  { emoji: '🏬', label: 'Einkaufszentren' },
  { emoji: '👗', label: 'Mode & Fashion' },
  { emoji: '🏃', label: 'Sportbekleidung' },
  { emoji: '♻️', label: 'Second-Hand & Vintage' },
]

export default function ShopsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)
  const [subcatFilter, setSubcatFilter] = useState('')

  useEffect(() => { loadAllData().then(d => { setData(d); setLoading(false) }) }, [])
  if (loading || !data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  const malls = data.shops.filter(p => p.subcat === 'Einkaufszentren').sort((a, b) => (b.rv * b.r) - (a.rv * a.r))
  const shops = data.shops.filter(p => p.subcat !== 'Einkaufszentren')

  // When Einkaufszentren is selected in nav, show malls in the discovery area
  const showMallsSection = subcatFilter !== 'Einkaufszentren'
  const discoverySpots = subcatFilter === 'Einkaufszentren' ? malls : shops

  return (
    <>
      <Header />
      <NavTabs active="shops" />
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '.3rem' }}>🛍️ Shops</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1rem' }}>{fmt(data.shops.length)} Geschäfte in Zürich</p>
        <SubcategoryNav
          spots={data.shops}
          mainCategories={MAIN_CATS}
          activeFilter={subcatFilter}
          onFilter={setSubcatFilter}
        />

        {/* Einkaufszentren section - only when not filtering by Einkaufszentren */}
        {showMallsSection && malls.length >= 3 && !subcatFilter && (
          <div style={{ marginBottom: '1.5rem' }}>
            <SpotRow icon="🏬" title="Beliebteste Einkaufszentren in Zürich" items={malls.slice(0, 10)} onOpenModal={setModalSpot} />
          </div>
        )}

        <CategoryDiscovery
          spots={discoverySpots}
          allSpots={data.all}
          storageKey="zh-dice-seen-shops"
          onOpenModal={setModalSpot}
          subcatFilter={subcatFilter === 'Einkaufszentren' ? '' : subcatFilter}
        />
      </div>
      <Footer />
      <BackToTop />
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={() => setModalSpot(null)} />}
    </>
  )
}
