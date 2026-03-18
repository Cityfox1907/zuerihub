'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import SpotModal from '@/components/SpotModal'
import CategoryDiscovery from '@/components/CategoryDiscovery'
import BackToTop from '@/components/BackToTop'
import Footer from '@/components/Footer'
import { loadAllData, fmt, getSpotTag } from '@/lib/data'

const KULTUR_CATS = [
  { emoji: '🏛️', label: 'Sehenswürdigkeit' },
  { emoji: '🏰', label: 'Historische Sehenswürdigkeit' },
  { emoji: '🖼️', label: 'Museum' },
]

const MUSEUM_SUBCATS = [
  { emoji: '🎨', label: 'Kunstmuseum' },
  { emoji: '🔬', label: 'Wissenschaftsmuseum' },
  { emoji: '🦕', label: 'Naturhistorisches Museum' },
  { emoji: '🎭', label: 'Kulturmuseum' },
  { emoji: '🧒', label: 'Kindermuseum' },
  { emoji: '🎪', label: 'Erlebnismuseum' },
]

const NATUR_CATS = [
  { emoji: '🌳', label: 'Park' },
  { emoji: '🔭', label: 'Aussichtsplattform' },
  { emoji: '⛰️', label: 'Berggipfel' },
  { emoji: '🥾', label: 'Wandern' },
  { emoji: '🦁', label: 'Zoo' },
]

function CategoryTile({ emoji, label, count, isActive, onClick, size = 'normal' }) {
  const isLarge = size === 'large'
  return (
    <button
      onClick={onClick}
      style={{
        flex: isLarge ? '1 1 0' : '0 0 auto', scrollSnapAlign: 'start',
        display: 'flex', alignItems: 'center', gap: '.5rem',
        padding: isLarge ? '1rem 1.25rem' : '.65rem 1rem', borderRadius: 14,
        border: isActive ? '2px solid var(--primary)' : '1.5px solid var(--border-light)',
        background: isActive ? 'var(--primary)' : 'var(--surface)',
        color: isActive ? '#fff' : 'var(--text)',
        cursor: 'pointer', whiteSpace: 'nowrap',
        fontWeight: 700, fontSize: isLarge ? '1rem' : '.88rem',
        boxShadow: isActive ? '0 4px 12px rgba(15,71,175,.25)' : 'var(--shadow-xs)',
        transition: 'all .2s', minHeight: isLarge ? 56 : 48,
        flexDirection: isLarge ? 'column' : 'row',
        textAlign: isLarge ? 'center' : 'left',
      }}
    >
      <span style={{ fontSize: isLarge ? '1.8rem' : '1.15rem' }}>{emoji}</span>
      <span>{label}</span>
      {count > 0 && (
        <span style={{ fontSize: '.68rem', fontWeight: 600, opacity: isActive ? .85 : .5 }}>({count})</span>
      )}
      {isActive && <span style={{ fontSize: '.75rem' }}>✓</span>}
    </button>
  )
}

export default function KulturPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)
  const [subcatFilter, setSubcatFilter] = useState('')
  const [activeGroup, setActiveGroup] = useState('') // 'kultur' or 'natur'
  const [museumOpen, setMuseumOpen] = useState(false)

  useEffect(() => { loadAllData().then(d => { setData(d); setLoading(false) }) }, [])
  if (loading || !data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  const allKultur = [...data.attr, ...data.museen]

  // Count spots per keyword
  const counts = {}
  allKultur.forEach(p => {
    const tag = getSpotTag(p)
    if (tag) counts[tag] = (counts[tag] || 0) + 1
    if (p.keyword) counts[p.keyword] = (counts[p.keyword] || 0) + 1
  })
  // Museum aggregate count
  const museumCount = MUSEUM_SUBCATS.reduce((sum, c) => sum + (counts[c.label] || 0), 0)

  const handleGroupClick = (group) => {
    if (activeGroup === group) {
      setActiveGroup('')
      setSubcatFilter('')
      setMuseumOpen(false)
    } else {
      setActiveGroup(group)
      setSubcatFilter('')
      setMuseumOpen(false)
    }
  }

  const handleSubcatClick = (label) => {
    if (label === 'Museum') {
      setMuseumOpen(!museumOpen)
      if (!museumOpen) {
        // When opening museum, don't filter yet - show all museum types
        setSubcatFilter('')
      } else {
        setSubcatFilter('')
      }
    } else {
      setMuseumOpen(false)
      setSubcatFilter(subcatFilter === label ? '' : label)
    }
  }

  const handleMuseumSubcatClick = (label) => {
    setSubcatFilter(subcatFilter === label ? '' : label)
  }

  // Build effective filter for CategoryDiscovery
  const effectiveSpots = (() => {
    if (activeGroup === 'kultur') {
      const kulturKeywords = new Set(['Sehenswürdigkeit', 'Historische Sehenswürdigkeit', ...MUSEUM_SUBCATS.map(c => c.label), 'Allgemeines Museum'])
      return allKultur.filter(p => kulturKeywords.has(p.keyword))
    }
    if (activeGroup === 'natur') {
      const naturKeywords = new Set(NATUR_CATS.map(c => c.label))
      return allKultur.filter(p => naturKeywords.has(p.keyword))
    }
    return allKultur
  })()

  const activeCats = activeGroup === 'kultur' ? KULTUR_CATS : activeGroup === 'natur' ? NATUR_CATS : null

  return (
    <>
      <Header />
      <NavTabs active="kultur" />
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '.3rem' }}>🏛️ Kultur & Natur</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1rem' }}>{fmt(allKultur.length)} Museen & Sehenswürdigkeiten</p>

        {/* Top level: Kultur / Natur tiles */}
        <nav style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '.75rem' }}>
            <CategoryTile emoji="🏛️" label="Kultur" count={0} isActive={activeGroup === 'kultur'} onClick={() => handleGroupClick('kultur')} size="large" />
            <CategoryTile emoji="🌿" label="Natur" count={0} isActive={activeGroup === 'natur'} onClick={() => handleGroupClick('natur')} size="large" />
          </div>

          {/* Subcategory row */}
          {activeCats && (
            <div className="fade-up" style={{
              display: 'flex', gap: '.6rem', overflowX: 'auto', scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '.5rem',
            }}>
              {activeCats.map(({ emoji, label }) => (
                <CategoryTile
                  key={label}
                  emoji={emoji}
                  label={label}
                  count={label === 'Museum' ? museumCount : (counts[label] || 0)}
                  isActive={subcatFilter === label || (label === 'Museum' && museumOpen)}
                  onClick={() => handleSubcatClick(label)}
                />
              ))}
            </div>
          )}

          {/* Museum sub-subcategories */}
          {activeGroup === 'kultur' && museumOpen && (
            <div className="fade-up" style={{
              display: 'flex', gap: '.35rem', flexWrap: 'wrap', marginTop: '.5rem',
              paddingLeft: '.5rem', borderLeft: '3px solid var(--primary-light)',
            }}>
              {MUSEUM_SUBCATS.map(({ emoji, label }) => {
                const isActive = subcatFilter === label
                const count = counts[label] || 0
                return (
                  <button
                    key={label}
                    onClick={() => handleMuseumSubcatClick(label)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                      padding: '.3rem .65rem', borderRadius: 20,
                      border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                      background: isActive ? 'var(--primary-light)' : 'var(--surface2)',
                      color: isActive ? 'var(--primary)' : 'var(--text2)',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      fontWeight: isActive ? 700 : 500, fontSize: '.76rem',
                      transition: 'all .2s', minHeight: 32,
                    }}
                  >
                    <span style={{ fontSize: '.85rem' }}>{emoji}</span>
                    <span>{label}</span>
                    {count > 0 && <span style={{ fontSize: '.62rem', opacity: .55 }}>({count})</span>}
                    {isActive && <span style={{ fontSize: '.65rem', color: 'var(--primary)' }}>✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </nav>

        <CategoryDiscovery spots={effectiveSpots} allSpots={data.all} storageKey="zh-dice-seen-kultur" onOpenModal={setModalSpot} subcatFilter={subcatFilter} />
      </div>
      <Footer />
      <BackToTop />
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={() => setModalSpot(null)} />}
    </>
  )
}
