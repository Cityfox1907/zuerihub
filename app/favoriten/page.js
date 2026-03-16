'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import SpotCard from '@/components/SpotCard'
import SpotModal from '@/components/SpotModal'
import { loadAllData } from '@/lib/data'

const FAV_KEYS = ['zh-favs', 'zh-attr-favs', 'zh-fun-favs', 'zh-shop-favs', 'zh-museum-favs']

function getAllFavIds() {
  const ids = []
  FAV_KEYS.forEach(k => {
    try { const arr = JSON.parse(localStorage.getItem(k) || '[]'); ids.push(...arr) } catch {}
  })
  return ids
}

export default function FavoritenPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)
  const [favIds, setFavIds] = useState([])

  useEffect(() => {
    setFavIds(getAllFavIds())
    loadAllData().then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading || !data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  const favSpots = data.all.filter(p => favIds.includes(p.id))

  return (
    <>
      <Header />
      <NavTabs active="" />
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '.3rem' }}>⭐ Favoriten</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1.5rem' }}>{favSpots.length} gespeicherte Spots</p>
        {favSpots.length === 0 ? (
          <div style={{ padding: '3rem', background: 'var(--surface2)', borderRadius: 16, textAlign: 'center', color: 'var(--text3)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem' }}>⭐</span>
            Noch keine Favoriten gespeichert. Entdecke Spots und markiere sie als Favorit!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '.75rem' }}>
            {favSpots.map((spot, i) => <SpotCard key={spot.id || i} spot={spot} rank={-1} onClick={() => setModalSpot(spot)} />)}
          </div>
        )}
      </div>
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={() => setModalSpot(null)} />}
    </>
  )
}
