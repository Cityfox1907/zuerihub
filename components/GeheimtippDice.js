'use client'

import { useState, useEffect, useCallback } from 'react'
import SpotCard from './SpotCard'
import { getSourceInfo } from '@/lib/data'

const TIERS = [
  { key: 'ultra', label: 'Ultra-Geheimtipp', emoji: '🔮', min: 42, max: 80, color: '#7c3aed', bg: 'rgba(124,58,237,.08)', count: 1 },
  { key: 'hidden', label: 'Hidden Gem', emoji: '💎', min: 80, max: 250, color: '#0ea5e9', bg: 'rgba(14,165,233,.08)', count: 2 },
  { key: 'champion', label: 'Champion', emoji: '🏆', min: 250, max: Infinity, color: '#d97706', bg: 'rgba(217,119,6,.08)', count: 2 },
]

function getSeen() { try { return JSON.parse(localStorage.getItem('zh-dice-seen') || '[]') } catch { return [] } }
function addSeen(ids) { const s = new Set(getSeen()); ids.forEach(id => s.add(id)); localStorage.setItem('zh-dice-seen', JSON.stringify([...s])) }
function clearSeen() { localStorage.removeItem('zh-dice-seen') }

function pickFromTier(pool, count, seen, usedSources) {
  const unseen = pool.filter(p => !seen.has(p.id))
  if (unseen.length === 0) return []
  // Prefer diverse sources
  const bySource = {}
  unseen.forEach(p => { (bySource[p.source] = bySource[p.source] || []).push(p) })
  const sources = Object.keys(bySource).sort((a, b) => {
    const aUsed = usedSources.has(a) ? 1 : 0
    const bUsed = usedSources.has(b) ? 1 : 0
    return aUsed - bUsed
  })
  const picked = []
  let srcIdx = 0
  while (picked.length < count && picked.length < unseen.length) {
    const src = sources[srcIdx % sources.length]
    const arr = bySource[src]
    if (arr && arr.length > 0) {
      const randIdx = Math.floor(Math.random() * arr.length)
      picked.push(arr.splice(randIdx, 1)[0])
      usedSources.add(src)
    }
    srcIdx++
    if (srcIdx > sources.length * count * 2) break
  }
  return picked
}

export default function GeheimtippDice({ allSpots, onOpenModal }) {
  const [cards, setCards] = useState([])
  const [animating, setAnimating] = useState(false)
  const [allDiscovered, setAllDiscovered] = useState(false)
  const [flyOut, setFlyOut] = useState(false)
  const [btnState, setBtnState] = useState('idle') // idle | rolling | success

  // Only spots with rating >= 4.8 qualify
  const qualified = allSpots.filter(p => p.r >= 4.8 && p.rv >= 42)

  const roll = useCallback(() => {
    if (animating) return
    const seen = new Set(getSeen())
    const usedSources = new Set()
    const allPicked = []

    for (const tier of TIERS) {
      const tierPool = qualified.filter(p => p.rv >= tier.min && p.rv < tier.max)
      const picked = pickFromTier(tierPool, tier.count, seen, usedSources)
      allPicked.push(...picked.map(p => ({ ...p, _tier: tier })))
    }

    if (allPicked.length === 0) {
      setAllDiscovered(true)
      setCards([])
      return
    }

    setAllDiscovered(false)
    setBtnState('rolling')

    if (cards.length > 0) {
      setFlyOut(true)
      setAnimating(true)
      setTimeout(() => {
        setFlyOut(false)
        setCards(allPicked)
        addSeen(allPicked.map(p => p.id))
        setBtnState('success')
        setTimeout(() => { setAnimating(false); setBtnState('idle') }, 1200)
      }, 350)
    } else {
      setCards(allPicked)
      addSeen(allPicked.map(p => p.id))
      setAnimating(true)
      setBtnState('success')
      setTimeout(() => { setAnimating(false); setBtnState('idle') }, 1200)
    }
  }, [qualified, cards, animating])

  const restart = () => {
    clearSeen()
    setAllDiscovered(false)
    setCards([])
    setBtnState('idle')
  }

  const totalPool = qualified.length
  const seenCount = getSeen().filter(id => qualified.some(p => p.id === id)).length

  const srcColors = {
    gastro: '#2563eb', attr: '#7c3aed', museum: '#d97706', shop: '#16a34a', fun: '#db2777',
  }

  return (
    <div style={{
      margin: '1.5rem 0 2rem', padding: '1.25rem', borderRadius: 18, position: 'relative', overflow: 'hidden',
      background: 'var(--card-bg)', border: '2px solid transparent',
      backgroundClip: 'padding-box',
      boxShadow: 'var(--shadow-soft)',
    }}>
      {/* Gradient border overlay */}
      <div style={{
        position: 'absolute', inset: -2, borderRadius: 20, padding: 2,
        background: 'linear-gradient(135deg, #7c3aed, #0ea5e9, #d97706, #7c3aed)',
        backgroundSize: '300% 300%', animation: 'gradientShift 4s ease infinite',
        zIndex: 0, mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude', WebkitMaskComposite: 'xor',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.2rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🎲</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>Geheimtipp-Würfel</span>
        </div>
        <p style={{ fontSize: '.8rem', color: 'var(--text3)', marginBottom: '.75rem' }}>
          Entdecke versteckte Perlen in Zürich – nur Spots mit ⭐ 4.8+ Rating
        </p>

        {/* Tier legend */}
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
          {TIERS.map(t => (
            <span key={t.key} style={{ fontSize: '.7rem', padding: '.2rem .5rem', borderRadius: 8, background: t.bg, color: t.color, fontWeight: 600 }}>
              {t.emoji} {t.count}× {t.label}
            </span>
          ))}
        </div>

        {/* Roll button + progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button onClick={roll} disabled={animating}
            style={{
              padding: '.6rem 1.5rem', borderRadius: 12, border: 'none',
              cursor: animating ? 'wait' : 'pointer',
              background: btnState === 'success' ? '#16a34a' : btnState === 'rolling' ? '#6b7f96' : 'linear-gradient(135deg, #7c3aed, #0ea5e9)',
              color: '#fff', fontWeight: 700, fontSize: '.9rem',
              boxShadow: '0 4px 14px rgba(124,58,237,.25)',
              transition: 'all .3s', transform: animating ? 'scale(0.97)' : 'scale(1)',
              minWidth: 130,
            }}
          >
            {btnState === 'rolling' ? '🎲 Würfle…' : btnState === 'success' ? '✅ Entdeckt!' : '🎲 Würfeln!'}
          </button>
          <span style={{ fontSize: '.78rem', color: 'var(--text3)' }}>
            {seenCount} / {totalPool} entdeckt
          </span>
          <div style={{ flex: 1, minWidth: 80, maxWidth: 200, height: 6, borderRadius: 3, background: 'var(--surface2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #7c3aed, #0ea5e9)', transition: 'width .4s', width: `${totalPool > 0 ? (seenCount / totalPool * 100) : 0}%` }} />
          </div>
        </div>

        {/* All discovered */}
        {allDiscovered && (
          <div style={{ padding: '1.5rem', borderRadius: 16, background: 'linear-gradient(135deg, rgba(124,58,237,.06), rgba(14,165,233,.06))', textAlign: 'center', border: '1.5px solid rgba(124,58,237,.15)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🎉</div>
            <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: '.3rem', fontSize: '1.05rem' }}>Alle Geheimtipps entdeckt!</div>
            <p style={{ fontSize: '.82rem', color: 'var(--text2)', marginBottom: '.75rem' }}>Du hast alle {totalPool} Top-Spots gesehen. Respekt!</p>
            <button onClick={restart} style={{ padding: '.5rem 1.2rem', borderRadius: 10, border: '1.5px solid #7c3aed', background: 'transparent', color: '#7c3aed', fontWeight: 600, fontSize: '.82rem', cursor: 'pointer' }}>
              🔄 Von vorne starten
            </button>
          </div>
        )}

        {/* Cards - horizontal scroll on mobile */}
        {cards.length > 0 && (
          <div className="dice-scroll" style={{ display: 'flex', gap: '.75rem', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '.25rem' }}>
            {cards.map((spot, i) => (
              <div key={spot.id} className={flyOut ? 'dice-fly-out' : 'dice-drop-in'}
                style={{ animationDelay: `${i * 80}ms`, flex: '0 0 195px', minWidth: 195, scrollSnapAlign: 'start' }}>
                <div style={{ position: 'relative' }}>
                  {/* Tier badge */}
                  <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 3, padding: '.15rem .45rem', borderRadius: 8, fontSize: '.58rem', fontWeight: 700, background: spot._tier.bg, color: spot._tier.color, border: `1px solid ${spot._tier.color}33` }}>
                    {spot._tier.emoji} {spot._tier.label}
                  </div>
                  {/* Source color bar */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: srcColors[spot.source] || 'var(--primary)', zIndex: 2, borderRadius: '0 0 14px 14px' }} />
                  <SpotCard spot={spot} rank={-1} onClick={() => onOpenModal(spot)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
