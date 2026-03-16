'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import SpotCard from '@/components/SpotCard'
import SpotModal from '@/components/SpotModal'
import { loadAllData, getAllFavIds, getSourceInfo } from '@/lib/data'

const SOURCE_ORDER = ['gastro', 'attr', 'museum', 'fun', 'shop']
const SOURCE_EMOJI = { gastro: '🍽️', attr: '🏛️', museum: '🖼️', fun: '🎮', shop: '🛍️' }

export default function FavoritenPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)
  const [favIds, setFavIds] = useState([])

  useEffect(() => {
    setFavIds(getAllFavIds())
    loadAllData().then(d => { setData(d); setLoading(false) })
  }, [])

  // Re-check favs when modal closes (user might have toggled)
  const handleCloseModal = () => {
    setModalSpot(null)
    setFavIds(getAllFavIds())
  }

  if (loading || !data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  const favSpots = data.all.filter(p => favIds.includes(p.id))

  // Group by source
  const grouped = {}
  favSpots.forEach(p => {
    (grouped[p.source] = grouped[p.source] || []).push(p)
  })

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
          SOURCE_ORDER.filter(s => grouped[s]?.length > 0).map(source => {
            const info = getSourceInfo(source)
            return (
              <div key={source} style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <span>{SOURCE_EMOJI[source]}</span> {info.label}
                  <span style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--text3)' }}>({grouped[source].length})</span>
                </h2>
                <div className="fav-group-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '.75rem' }}>
                  {grouped[source].map((spot, i) => <SpotCard key={spot.id || i} spot={spot} rank={-1} onClick={() => setModalSpot(spot)} />)}
                </div>
              </div>
            )
          })
        )}
      </div>
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={handleCloseModal} />}
    </>
  )
}
