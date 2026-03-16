'use client'

import { useState, useCallback } from 'react'
import SpotCard from './SpotCard'

const TIERS = [
  { key: 'ultra', min: 42, max: 80, count: 1 },
  { key: 'hidden', min: 80, max: 250, count: 1 },
  { key: 'champion', min: 250, max: Infinity, count: 2 },
]

function getSeenKey(storageKey) { return storageKey || 'zh-dice-seen' }
function getSeen(storageKey) { try { return JSON.parse(localStorage.getItem(getSeenKey(storageKey)) || '[]') } catch { return [] } }
function addSeen(ids, storageKey) { const s = new Set(getSeen(storageKey)); ids.forEach(id => s.add(id)); localStorage.setItem(getSeenKey(storageKey), JSON.stringify([...s])) }
function clearSeen(storageKey) { localStorage.removeItem(getSeenKey(storageKey)) }

function pickFromTier(pool, count, seen, usedSources) {
  const unseen = pool.filter(p => !seen.has(p.id))
  if (unseen.length === 0) return []
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

export default function GeheimtippDice({ allSpots, onOpenModal, storageKey }) {
  const [cards, setCards] = useState([])
  const [animating, setAnimating] = useState(false)
  const [flyOut, setFlyOut] = useState(false)
  const [btnState, setBtnState] = useState('idle')

  const qualified = allSpots.filter(p => p.r >= 4.8 && p.rv >= 42)

  const roll = useCallback(() => {
    if (animating) return
    let seen = new Set(getSeen(storageKey))
    const usedSources = new Set()
    let allPicked = []

    for (const tier of TIERS) {
      const tierPool = qualified.filter(p => p.rv >= tier.min && p.rv < tier.max)
      const picked = pickFromTier(tierPool, tier.count, seen, usedSources)
      allPicked.push(...picked)
    }

    // Silent reset if pool exhausted
    if (allPicked.length === 0) {
      clearSeen(storageKey)
      seen = new Set()
      for (const tier of TIERS) {
        const tierPool = qualified.filter(p => p.rv >= tier.min && p.rv < tier.max)
        const picked = pickFromTier(tierPool, tier.count, seen, usedSources)
        allPicked.push(...picked)
      }
    }

    if (allPicked.length === 0) return

    setBtnState('rolling')

    if (cards.length > 0) {
      setFlyOut(true)
      setAnimating(true)
      setTimeout(() => {
        setFlyOut(false)
        setCards(allPicked)
        addSeen(allPicked.map(p => p.id), storageKey)
        setBtnState('success')
        setTimeout(() => { setAnimating(false); setBtnState('idle') }, 1200)
      }, 350)
    } else {
      setCards(allPicked)
      addSeen(allPicked.map(p => p.id), storageKey)
      setAnimating(true)
      setBtnState('success')
      setTimeout(() => { setAnimating(false); setBtnState('idle') }, 1200)
    }
  }, [qualified, cards, animating, storageKey])

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

        {/* Roll button */}
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={roll} disabled={animating}
            style={{
              padding: '.6rem 1.5rem', borderRadius: 12, border: 'none',
              cursor: animating ? 'wait' : 'pointer',
              background: btnState === 'success' ? '#16a34a' : btnState === 'rolling' ? '#6b7f96' : 'linear-gradient(135deg, #7c3aed, #0ea5e9)',
              color: '#fff', fontWeight: 700, fontSize: '.9rem',
              boxShadow: '0 4px 14px rgba(124,58,237,.25)',
              transition: 'all .3s', transform: animating ? 'scale(0.97)' : 'scale(1)',
              minWidth: 130, minHeight: 44,
            }}
          >
            {btnState === 'rolling' ? '🎲 Würfle…' : btnState === 'success' ? '✅ Entdeckt!' : '🎲 Würfeln!'}
          </button>
        </div>

        {/* Cards - 4 on desktop, 2 on mobile */}
        {cards.length > 0 && (
          <div className="dice-scroll" style={{ display: 'flex', gap: '.75rem', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '.25rem' }}>
            {cards.map((spot, i) => (
              <div key={spot.id} className={flyOut ? 'dice-fly-out' : 'dice-drop-in'}
                style={{ animationDelay: `${i * 80}ms`, flex: '0 0 calc(25% - .56rem)', minWidth: 200, scrollSnapAlign: 'start' }}>
                <div style={{ position: 'relative' }}>
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
