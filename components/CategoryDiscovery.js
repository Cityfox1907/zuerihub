'use client'

import { useState, useRef } from 'react'
import GeheimtippDice from './GeheimtippDice'
import SpotRow from './SpotRow'
import SpotCard from './SpotCard'
import FilterBar from './FilterBar'
import { fmt } from '@/lib/data'

export default function CategoryDiscovery({ spots, allSpots, storageKey, onOpenModal }) {
  const [showAll, setShowAll] = useState(false)
  const [filtered, setFiltered] = useState([])
  const gridRef = useRef(null)

  // Popular: top 10 by review count
  const popular = [...spots].sort((a, b) => b.rv - a.rv).slice(0, 10)

  // Best rated: top 10 by rating with min 50 reviews
  const bestRated = [...spots].filter(p => p.rv >= 50).sort((a, b) => b.r !== a.r ? b.r - a.r : b.rv - a.rv).slice(0, 10)

  const handleShowAll = () => {
    setShowAll(true)
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <>
      {/* Category Geheimtipp Dice */}
      <GeheimtippDice allSpots={spots} onOpenModal={onOpenModal} storageKey={storageKey} />

      {/* Popular Row */}
      {popular.length >= 3 && (
        <SpotRow icon="🔥" title="Beliebt" items={popular} onOpenModal={onOpenModal} />
      )}

      {/* Best Rated Row */}
      {bestRated.length >= 3 && (
        <SpotRow icon="⭐" title="Bestbewertet" items={bestRated} onOpenModal={onOpenModal} />
      )}

      {/* Show All Button */}
      {!showAll && (
        <div style={{ textAlign: 'center', margin: '1.5rem 0 2rem' }}>
          <button onClick={handleShowAll} style={{
            padding: '.75rem 2rem', borderRadius: 12, border: '1.5px solid var(--primary)',
            background: 'var(--primary-light)', color: 'var(--primary)',
            fontWeight: 700, fontSize: '.9rem', cursor: 'pointer',
            transition: 'all .2s', minHeight: 44,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary)' }}
          >
            Alle {fmt(spots.length)} Profile anzeigen
          </button>
        </div>
      )}

      {/* Full Grid with Filter */}
      {showAll && (
        <div ref={gridRef}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', margin: '1.8rem 0 1rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
            <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Alle Profile</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          </div>
          <FilterBar spots={spots} onFiltered={setFiltered} totalCount={spots.length} />
          <div className="spot-grid" style={{ display: 'grid', gap: '.75rem' }}>
            {filtered.slice(0, 60).map((spot, i) => <SpotCard key={spot.id || i} spot={spot} rank={-1} onClick={() => onOpenModal(spot)} />)}
          </div>
          {filtered.length > 60 && <p style={{ textAlign: 'center', color: 'var(--text3)', marginTop: '1.5rem', fontSize: '.85rem' }}>Zeigt 60 von {fmt(filtered.length)} Ergebnissen</p>}
        </div>
      )}
    </>
  )
}
