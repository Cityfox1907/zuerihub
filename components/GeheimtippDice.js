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

export default function GeheimtippDice({ allSpots, badiSpots, onOpenModal, storageKey, minRating = 4.8 }) {
  const [cards, setCards] = useState([])
  const [animating, setAnimating] = useState(false)
  const [flyOut, setFlyOut] = useState(false)
  const [btnState, setBtnState] = useState('idle')

  const qualified = allSpots.filter(p => p.r >= minRating && p.rv >= 42)
  const qualifiedBadis = badiSpots ? badiSpots.filter(p => p.r >= minRating && p.rv >= 42) : []

  const roll = useCallback(() => {
    if (animating) return
    let seen = new Set(getSeen(storageKey))
    const usedSources = new Set()
    let allPicked = []
    const TARGET = 4

    // If badiSpots provided, reserve one slot for a Badi pick
    if (qualifiedBadis.length > 0) {
      const badiPick = pickFromTier(qualifiedBadis, 1, seen, usedSources)
      allPicked.push(...badiPick)
    }

    const pickedIds = new Set(allPicked.map(p => p.id))
    const remaining = TARGET - allPicked.length

    // Pick from tiers, excluding already picked badi spot
    const tierPool = qualified.filter(p => !pickedIds.has(p.id))
    for (const tier of TIERS) {
      if (allPicked.length >= TARGET) break
      const pool = tierPool.filter(p => p.rv >= tier.min && p.rv < tier.max)
      const picked = pickFromTier(pool, tier.count, seen, usedSources)
      allPicked.push(...picked)
    }

    // Fill remaining slots if tiers didn't produce enough
    if (allPicked.length < TARGET) {
      const usedIds = new Set(allPicked.map(p => p.id))
      const fallback = qualified.filter(p => !usedIds.has(p.id))
      const extra = pickFromTier(fallback, TARGET - allPicked.length, seen, usedSources)
      allPicked.push(...extra)
    }

    // Silent reset if pool exhausted
    if (allPicked.length === 0) {
      clearSeen(storageKey)
      seen = new Set()
      allPicked = []
      const usedSources2 = new Set()

      if (qualifiedBadis.length > 0) {
        const badiPick = pickFromTier(qualifiedBadis, 1, seen, usedSources2)
        allPicked.push(...badiPick)
      }

      const pickedIds2 = new Set(allPicked.map(p => p.id))
      for (const tier of TIERS) {
        if (allPicked.length >= TARGET) break
        const pool = qualified.filter(p => !pickedIds2.has(p.id) && p.rv >= tier.min && p.rv < tier.max)
        const picked = pickFromTier(pool, tier.count, seen, usedSources2)
        allPicked.push(...picked)
      }

      if (allPicked.length < TARGET) {
        const usedIds = new Set(allPicked.map(p => p.id))
        const fallback = qualified.filter(p => !usedIds.has(p.id))
        const extra = pickFromTier(fallback, TARGET - allPicked.length, seen, usedSources2)
        allPicked.push(...extra)
      }
    }

    // Trim to exactly TARGET
    allPicked = allPicked.slice(0, TARGET)

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
  }, [qualified, qualifiedBadis, cards, animating, storageKey])

  return (
    <div className="dice-container" style={{
      margin: '1.5rem 0 2rem', padding: 0, borderRadius: 20, position: 'relative', overflow: 'hidden',
      background: 'var(--card-bg)',
      boxShadow: '0 2px 12px rgba(212,147,13,0.10), 0 8px 32px rgba(15,71,175,0.08)',
    }}>
      {/* Golden shimmer border */}
      <div className="dice-border-glow" style={{
        position: 'absolute', inset: 0, borderRadius: 20, padding: 2,
        background: 'linear-gradient(135deg, #c9a84c, #0F47AF, #dbb85c, #5a9cf5, #c9a84c)',
        backgroundSize: '400% 400%', animation: 'gradientShift 5s ease infinite',
        zIndex: 0,
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude', WebkitMaskComposite: 'xor',
      }} />

      {/* Inner golden glow overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 30% 0%, rgba(212,147,13,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(15,71,175,0.04) 0%, transparent 60%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '1.5rem 1.25rem 1.25rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.35rem' }}>
          <span className="dice-icon" style={{
            fontSize: '1.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(212,147,13,0.12), rgba(15,71,175,0.08))',
            boxShadow: '0 2px 8px rgba(212,147,13,0.12)',
          }}>🎲</span>
          <div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800,
              color: 'var(--text)',
              letterSpacing: '-.01em',
            }}>
              Geheimtipp-Würfel
            </span>
            <span className="dice-badge" style={{
              marginLeft: '.5rem', fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.06em', padding: '.15rem .45rem', borderRadius: 6,
              background: 'linear-gradient(135deg, #c9a84c, #dbb85c)',
              color: '#fff', verticalAlign: 'middle',
              boxShadow: '0 1px 4px rgba(201,168,76,0.25)',
            }}>Premium</span>
          </div>
        </div>
        <p style={{
          fontSize: '.82rem', color: 'var(--text3)', marginBottom: '1rem',
          lineHeight: 1.5, maxWidth: 420,
        }}>
          Entdecke versteckte Perlen in Zürich
        </p>

        {/* Roll button */}
        <div style={{ marginBottom: cards.length > 0 ? '1rem' : 0 }}>
          <button onClick={roll} disabled={animating}
            className="dice-roll-btn"
            style={{
              padding: '.65rem 1.8rem', borderRadius: 14, border: 'none',
              cursor: animating ? 'wait' : 'pointer',
              background: btnState === 'success'
                ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                : btnState === 'rolling'
                ? '#6b7f96'
                : 'linear-gradient(135deg, #0F47AF, #5a9cf5)',
              color: '#fff', fontWeight: 700, fontSize: '.9rem',
              boxShadow: btnState === 'success'
                ? '0 4px 16px rgba(22,163,74,0.30)'
                : '0 4px 16px rgba(15,71,175,0.30), 0 1px 3px rgba(212,147,13,0.15)',
              transition: 'all .3s var(--ease)',
              transform: animating ? 'scale(0.97)' : 'scale(1)',
              minWidth: 140, minHeight: 46,
              letterSpacing: '.01em',
            }}
          >
            {btnState === 'rolling' ? '🎲 Würfle…' : btnState === 'success' ? '✅ Entdeckt!' : '🎲 Würfeln!'}
          </button>
        </div>

        {/* Cards - 4 on desktop, 2 on mobile */}
        {cards.length > 0 && (
          <div className="dice-scroll" style={{
            display: 'flex', gap: '.75rem', overflowX: 'auto',
            scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch', paddingBottom: '.25rem',
          }}>
            {cards.map((spot, i) => (
              <div key={spot.id} className={flyOut ? 'dice-fly-out' : 'dice-drop-in'}
                style={{
                  animationDelay: `${i * 80}ms`,
                  flex: '0 0 calc(25% - .56rem)',
                  minWidth: 200, scrollSnapAlign: 'start',
                }}>
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
