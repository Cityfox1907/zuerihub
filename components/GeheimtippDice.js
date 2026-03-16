'use client'

import { useState, useEffect, useCallback } from 'react'
import SpotCard from './SpotCard'
import { getEmoji, fmt } from '@/lib/data'

const TIERS = [
  { key: 'ultra', label: 'Ultra-Geheimtipp', emoji: '🤫', min: 42, max: 80, color: '#7c3aed', bg: 'rgba(124,58,237,.08)' },
  { key: 'hidden', label: 'Hidden Gem', emoji: '💎', min: 80, max: 250, color: '#0ea5e9', bg: 'rgba(14,165,233,.08)' },
  { key: 'champion', label: 'Champion', emoji: '🏆', min: 250, max: Infinity, color: '#d97706', bg: 'rgba(217,119,6,.08)' },
]

function getSeenKey() { return 'zh-dice-seen' }
function getSeen() { try { return JSON.parse(localStorage.getItem(getSeenKey()) || '[]') } catch { return [] } }
function addSeen(ids) { const s = new Set(getSeen()); ids.forEach(id => s.add(id)); localStorage.setItem(getSeenKey(), JSON.stringify([...s])) }
function clearSeen() { localStorage.removeItem(getSeenKey()) }

function pickDiverse(pool, count, seen) {
  const unseen = pool.filter(p => !seen.has(p.id))
  if (unseen.length === 0) return null // all discovered
  const bySource = {}
  unseen.forEach(p => { (bySource[p.source] = bySource[p.source] || []).push(p) })
  const sources = Object.keys(bySource)
  const picked = []
  const usedIds = new Set()
  // Round-robin across sources for diversity
  let srcIdx = 0
  while (picked.length < count && picked.length < unseen.length) {
    const src = sources[srcIdx % sources.length]
    const arr = bySource[src]
    if (arr && arr.length > 0) {
      const randIdx = Math.floor(Math.random() * arr.length)
      const spot = arr.splice(randIdx, 1)[0]
      if (!usedIds.has(spot.id)) {
        picked.push(spot)
        usedIds.add(spot.id)
      }
    }
    srcIdx++
    if (srcIdx > sources.length * count) break
  }
  // Fill remaining randomly if needed
  while (picked.length < count && unseen.length > picked.length) {
    const remaining = unseen.filter(p => !usedIds.has(p.id))
    if (remaining.length === 0) break
    const r = remaining[Math.floor(Math.random() * remaining.length)]
    picked.push(r)
    usedIds.add(r.id)
  }
  return picked
}

export default function GeheimtippDice({ allSpots, onOpenModal }) {
  const [tier, setTier] = useState(TIERS[0])
  const [cards, setCards] = useState([])
  const [animating, setAnimating] = useState(false)
  const [allDiscovered, setAllDiscovered] = useState(false)
  const [flyOut, setFlyOut] = useState(false)

  const pool = allSpots.filter(p => p.r > 0 && p.rv >= tier.min && p.rv < tier.max)

  const roll = useCallback(() => {
    if (animating) return
    const seen = new Set(getSeen())
    const picked = pickDiverse(pool, 5, seen)
    if (!picked) {
      setAllDiscovered(true)
      setCards([])
      return
    }
    setAllDiscovered(false)
    if (cards.length > 0) {
      setFlyOut(true)
      setAnimating(true)
      setTimeout(() => {
        setFlyOut(false)
        setCards(picked)
        addSeen(picked.map(p => p.id))
        setAnimating(true)
        setTimeout(() => setAnimating(false), 600)
      }, 350)
    } else {
      setCards(picked)
      addSeen(picked.map(p => p.id))
      setAnimating(true)
      setTimeout(() => setAnimating(false), 600)
    }
  }, [pool, cards, animating])

  const restart = () => {
    clearSeen()
    setAllDiscovered(false)
    setCards([])
  }

  // Auto-roll on tier change
  useEffect(() => {
    setCards([])
    setAllDiscovered(false)
  }, [tier.key])

  const seenCount = getSeen().filter(id => pool.some(p => p.id === id)).length

  return (
    <div style={{ margin: '1.5rem 0 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.3rem' }}>🎲</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>Geheimtipp-Würfel</span>
      </div>

      {/* Tier selector */}
      <div style={{ display: 'flex', gap: '.4rem', marginBottom: '.75rem', flexWrap: 'wrap' }} className="filter-bar">
        {TIERS.map(t => (
          <button key={t.key} onClick={() => setTier(t)}
            className={`filter-chip ${tier.key === t.key ? 'active' : ''}`}
            style={tier.key === t.key ? { background: t.color, borderColor: t.color } : {}}
          >
            {t.emoji} {t.label} <span style={{ opacity: .7, fontSize: '.7rem' }}>({t.min}-{t.max === Infinity ? '∞' : t.max})</span>
          </button>
        ))}
      </div>

      {/* Roll button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={roll} disabled={animating}
          style={{
            padding: '.6rem 1.5rem', borderRadius: 12, border: 'none', cursor: animating ? 'wait' : 'pointer',
            background: tier.color, color: '#fff', fontWeight: 700, fontSize: '.9rem',
            boxShadow: `0 4px 14px ${tier.color}33`, transition: 'all .2s',
            transform: animating ? 'scale(0.97)' : 'scale(1)',
          }}
        >
          🎲 Würfeln!
        </button>
        <span style={{ fontSize: '.78rem', color: 'var(--text3)' }}>
          {seenCount} / {pool.length} entdeckt
        </span>
        {/* Progress bar */}
        <div style={{ flex: 1, minWidth: 80, maxWidth: 200, height: 6, borderRadius: 3, background: 'var(--surface2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: tier.color, transition: 'width .4s', width: `${pool.length > 0 ? (seenCount / pool.length * 100) : 0}%` }} />
        </div>
      </div>

      {/* All discovered message */}
      {allDiscovered && (
        <div style={{ padding: '1.5rem', borderRadius: 16, background: tier.bg, textAlign: 'center', border: `1.5px solid ${tier.color}22` }}>
          <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🎉</div>
          <div style={{ fontWeight: 700, color: tier.color, marginBottom: '.3rem' }}>Alle {tier.label}-Spots entdeckt!</div>
          <p style={{ fontSize: '.82rem', color: 'var(--text2)', marginBottom: '.75rem' }}>Du hast alle {pool.length} Spots in dieser Kategorie gesehen.</p>
          <button onClick={restart} style={{ padding: '.5rem 1.2rem', borderRadius: 10, border: `1.5px solid ${tier.color}`, background: 'transparent', color: tier.color, fontWeight: 600, fontSize: '.82rem', cursor: 'pointer' }}>
            Von vorne starten
          </button>
        </div>
      )}

      {/* Cards */}
      {cards.length > 0 && (
        <div className="dice-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '.75rem' }}>
          {cards.map((spot, i) => (
            <div key={spot.id} className={flyOut ? 'dice-fly-out' : 'dice-drop-in'} style={{ animationDelay: `${i * 80}ms` }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 2, padding: '.15rem .45rem', borderRadius: 8, fontSize: '.6rem', fontWeight: 700, background: tier.bg, color: tier.color, border: `1px solid ${tier.color}33` }}>
                  {tier.emoji} {tier.label}
                </div>
                <SpotCard spot={spot} rank={-1} onClick={() => onOpenModal(spot)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
