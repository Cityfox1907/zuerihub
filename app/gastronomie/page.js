'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import SpotCard from '@/components/SpotCard'
import SpotModal from '@/components/SpotModal'
import FilterBar from '@/components/FilterBar'
import { loadAllData, fmt } from '@/lib/data'

export default function GastronomiePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    loadAllData().then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading || !data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  return (
    <>
      <Header />
      <NavTabs active="gastronomie" />
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '.3rem' }}>🍽️ Gastronomie</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1rem' }}>{fmt(data.gastro.length)} Restaurants, Bars & Cafés in Zürich</p>
        <FilterBar spots={data.gastro} onFiltered={setFiltered} categoryLabel="Küche" />
        <div className="spot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '.75rem' }}>
          {filtered.slice(0, 60).map((spot, i) => (
            <SpotCard key={spot.id || i} spot={spot} rank={-1} onClick={() => setModalSpot(spot)} />
          ))}
        </div>
        {filtered.length > 60 && <p style={{ textAlign: 'center', color: 'var(--text3)', marginTop: '1.5rem', fontSize: '.85rem' }}>Zeigt 60 von {fmt(filtered.length)} Ergebnissen</p>}
      </div>
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={() => setModalSpot(null)} />}
    </>
  )
}
