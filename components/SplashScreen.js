'use client'

import { useState, useEffect } from 'react'

const DATA_SOURCES = [
  { label: 'Restaurants & Bars', emoji: '🍽️', key: 'gastro' },
  { label: 'Sehenswürdigkeiten', emoji: '🏛️', key: 'attr' },
  { label: 'Museen', emoji: '🖼️', key: 'museum' },
  { label: 'Entertainment', emoji: '🎮', key: 'fun' },
  { label: 'Shops', emoji: '🛍️', key: 'shop' },
]

export default function SplashScreen({ progress, onDone }) {
  // progress: 0-5 (number of data sources loaded)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (progress >= DATA_SOURCES.length) {
      const t = setTimeout(() => { setFadeOut(true); setTimeout(onDone, 500) }, 400)
      return () => clearTimeout(t)
    }
  }, [progress, onDone])

  const pct = Math.min(100, (progress / DATA_SOURCES.length) * 100)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, var(--primary) 0%, #1a3a8a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff', transition: 'opacity .5s, transform .5s',
      opacity: fadeOut ? 0 : 1, transform: fadeOut ? 'scale(1.02)' : 'scale(1)',
    }}>
      {/* Logo */}
      <div style={{ animation: 'splashPulse 2s ease infinite', marginBottom: '1.5rem' }}>
        <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
          <rect x="4" y="4" width="92" height="92" rx="20" fill="rgba(255,255,255,.1)" stroke="#fff" strokeWidth="4"/>
          <path d="M30 82V42l-4-2V38l12-14h2l2 5h16l2-5h2l12 14v2l-4 2v40" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="35" y="40" width="10" height="42" rx="1.5" stroke="#fff" strokeWidth="3.5"/>
          <rect x="55" y="40" width="10" height="42" rx="1.5" stroke="#fff" strokeWidth="3.5"/>
          <circle cx="40" cy="30" r="3.5" fill="#fff"/>
          <circle cx="60" cy="30" r="3.5" fill="#fff"/>
          <line x1="26" y1="82" x2="74" y2="82" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>

      <div style={{ fontFamily: 'var(--font-display, Georgia)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, marginBottom: '.3rem' }}>
        ZüriHub
      </div>
      <div style={{ fontSize: '.95rem', opacity: .75, marginBottom: '2rem' }}>
        Entdecke das Beste von Zürich
      </div>

      {/* Progress bar */}
      <div style={{ width: 'min(280px, 80vw)', height: 6, borderRadius: 3, background: 'rgba(255,255,255,.15)', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ height: '100%', borderRadius: 3, background: '#fff', transition: 'width .4s ease', width: `${pct}%` }} />
      </div>

      {/* Status messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', width: 'min(280px, 80vw)' }}>
        {DATA_SOURCES.map((src, i) => (
          <div key={src.key} style={{
            display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem',
            opacity: i <= progress ? 1 : .35, transition: 'opacity .3s',
          }}>
            <span style={{ fontSize: '.9rem' }}>{i < progress ? '✅' : i === progress ? '⏳' : '⬜'}</span>
            <span>{src.emoji} {src.label}</span>
            {i < progress && <span style={{ marginLeft: 'auto', fontSize: '.7rem', opacity: .6 }}>geladen</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
