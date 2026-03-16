'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import SpotCard from '@/components/SpotCard'
import SpotModal from '@/components/SpotModal'
import { loadAllData, fmt } from '@/lib/data'

export default function ShopsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadAllData().then(d => { setData(d); setLoading(false) }) }, [])
  if (loading || !data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  const filtered = data.shops.filter(p => p.r > 0 && (!search || p.name.toLowerCase().includes(search.toLowerCase()))).sort((a, b) => (b.r * b.rv) - (a.r * a.rv))

  return (
    <>
      <Header />
      <NavTabs active="shops" />
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '.3rem' }}>🛍️ Shops</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1rem' }}>{fmt(data.shops.length)} Geschäfte in Zürich</p>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche…" style={{ width: '100%', maxWidth: 400, padding: '.6rem 1rem', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.85rem', marginBottom: '1.5rem', outline: 'none' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '.75rem' }}>
          {filtered.slice(0, 60).map((spot, i) => <SpotCard key={spot.id || i} spot={spot} rank={-1} onClick={() => setModalSpot(spot)} />)}
        </div>
      </div>
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={() => setModalSpot(null)} />}
    </>
  )
}
