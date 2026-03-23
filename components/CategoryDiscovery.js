'use client'

import { useState, useMemo } from 'react'
import GeheimtippDice from './GeheimtippDice'
import SpotRow from './SpotRow'
import SpotCard from './SpotCard'
import FilterBar from './FilterBar'
import { fmt, getSpotTag } from '@/lib/data'

export default function CategoryDiscovery({ spots, allSpots, storageKey, onOpenModal, subcatFilter }) {
  const [filtered, setFiltered] = useState([])

  // Apply subcategory filter if active (supports array of filters for multi-select)
  const filteredSpots = useMemo(() => {
    const filters = Array.isArray(subcatFilter) ? subcatFilter : (subcatFilter ? [subcatFilter] : [])
    if (filters.length === 0) return spots
    return spots.filter(p => {
      const tag = getSpotTag(p)
      return filters.some(f => tag === f || p.trade === f || p.subcat === f || p.keyword === f)
    })
  }, [spots, subcatFilter])

  // Best rated: top 10 by rating with min 50 reviews
  const bestRated = [...filteredSpots].filter(p => p.rv >= 50).sort((a, b) => b.r !== a.r ? b.r - a.r : b.rv - a.rv).slice(0, 10)

  return (
    <>
      {/* Category Geheimtipp Dice */}
      <GeheimtippDice allSpots={filteredSpots} onOpenModal={onOpenModal} storageKey={storageKey} />

      {/* Best Rated Row */}
      {bestRated.length >= 3 && (
        <SpotRow icon="⭐" title="Bestbewertet" items={bestRated} onOpenModal={onOpenModal} />
      )}

      {/* All Profiles directly visible, sorted by review count */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', margin: '1.8rem 0 1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Alle Profile</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
        </div>
        <FilterBar spots={filteredSpots} onFiltered={setFiltered} totalCount={filteredSpots.length} defaultSort="reviews" />
        <div className="spot-grid" style={{ display: 'grid', gap: '.75rem' }}>
          {filtered.slice(0, 60).map((spot, i) => <SpotCard key={spot.id || i} spot={spot} rank={-1} onClick={() => onOpenModal(spot)} />)}
        </div>
        {filtered.length > 60 && <p style={{ textAlign: 'center', color: 'var(--text3)', marginTop: '1.5rem', fontSize: '.85rem' }}>Zeigt 60 von {fmt(filtered.length)} Ergebnissen</p>}
      </div>
    </>
  )
}
