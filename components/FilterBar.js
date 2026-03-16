'use client'

import { useState, useMemo } from 'react'
import { getKreis, getSpotTag, fmt } from '@/lib/data'

export default function FilterBar({ spots, onFiltered, categoryLabel = 'Kategorie' }) {
  const [search, setSearch] = useState('')
  const [kreis, setKreis] = useState(0)
  const [category, setCategory] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [sort, setSort] = useState('relevance')

  // Extract unique categories and kreise from spots
  const categories = useMemo(() => {
    const cats = {}
    spots.forEach(p => {
      const tag = getSpotTag(p)
      if (tag) cats[tag] = (cats[tag] || 0) + 1
    })
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 20)
  }, [spots])

  const kreise = useMemo(() => {
    const ks = new Set()
    spots.forEach(p => { const k = getKreis(p.addr); if (k > 0) ks.add(k) })
    return [...ks].sort((a, b) => a - b)
  }, [spots])

  // Apply filters
  const filtered = useMemo(() => {
    let result = spots.filter(p => p.r > 0)

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.addr?.toLowerCase().includes(q))
    }
    if (kreis > 0) result = result.filter(p => getKreis(p.addr) === kreis)
    if (category) result = result.filter(p => getSpotTag(p) === category)
    if (minRating > 0) result = result.filter(p => p.r >= minRating)

    // Sort
    if (sort === 'rating') result.sort((a, b) => b.r - a.r || b.rv - a.rv)
    else if (sort === 'reviews') result.sort((a, b) => b.rv - a.rv)
    else if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'de'))
    else result.sort((a, b) => (b.r * b.rv) - (a.r * a.rv))

    return result
  }, [spots, search, kreis, category, minRating, sort])

  // Notify parent
  useMemo(() => onFiltered(filtered), [filtered])

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Suche nach Name oder Adresse…"
        style={{ width: '100%', maxWidth: 400, padding: '.6rem 1rem', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.85rem', marginBottom: '.75rem', outline: 'none' }}
      />

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Kreis filter */}
        <select value={kreis} onChange={e => setKreis(+e.target.value)}
          style={{ padding: '.4rem .6rem', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.8rem', cursor: 'pointer' }}
        >
          <option value={0}>Alle Kreise</option>
          {kreise.map(k => <option key={k} value={k}>Kreis {k}</option>)}
        </select>

        {/* Min rating */}
        <select value={minRating} onChange={e => setMinRating(+e.target.value)}
          style={{ padding: '.4rem .6rem', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.8rem', cursor: 'pointer' }}
        >
          <option value={0}>Alle Ratings</option>
          <option value={3.5}>⭐ 3.5+</option>
          <option value={4}>⭐ 4.0+</option>
          <option value={4.3}>⭐ 4.3+</option>
          <option value={4.5}>⭐ 4.5+</option>
          <option value={4.8}>⭐ 4.8+</option>
        </select>

        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ padding: '.4rem .6rem', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.8rem', cursor: 'pointer' }}
        >
          <option value="relevance">Sortierung: Relevanz</option>
          <option value="rating">Sortierung: Rating</option>
          <option value="reviews">Sortierung: Bewertungen</option>
          <option value="name">Sortierung: Name A-Z</option>
        </select>

        <span style={{ fontSize: '.78rem', color: 'var(--text3)', marginLeft: '.25rem' }}>{fmt(filtered.length)} Ergebnisse</span>
      </div>

      {/* Category chips */}
      {categories.length > 1 && (
        <div className="filter-bar" style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
          <button onClick={() => setCategory('')} className={`filter-chip ${!category ? 'active' : ''}`}>Alle</button>
          {categories.map(([cat, count]) => (
            <button key={cat} onClick={() => setCategory(category === cat ? '' : cat)}
              className={`filter-chip ${category === cat ? 'active' : ''}`}
            >
              {cat} <span style={{ opacity: .6, fontSize: '.68rem' }}>({count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
