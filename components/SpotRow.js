'use client'

import { useRef } from 'react'
import Link from 'next/link'
import SpotCard from './SpotCard'

export default function SpotRow({ icon, title, items, link, onOpenModal }) {
  const scrollRef = useRef(null)
  if (!items || items.length < 3) return null

  function scroll(dir) {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector('div')
    if (!card) return
    const gap = 10
    const n = el.offsetWidth >= 1024 ? 5 : 3
    el.scrollBy({ left: dir * (card.offsetWidth + gap) * n, behavior: 'smooth' })
  }

  return (
    <section className="fade-up" style={{ marginBottom: '1.6rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.55rem', gap: '.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '.35rem', margin: 0, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span> {title}
        </h2>
        {link && <Link href={link} style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', padding: '.2rem .5rem', borderRadius: 6, transition: 'background .15s' }}>Alle anzeigen ›</Link>}
      </div>
      <div style={{ position: 'relative' }}>
        <div ref={scrollRef} style={{ display: 'flex', gap: '.65rem', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '.25rem' }}>
          {items.slice(0, 10).map((spot, idx) => (
            <SpotCard key={spot.id || idx} spot={spot} rank={idx} onClick={() => onOpenModal?.(spot)} />
          ))}
        </div>
        <button onClick={() => scroll(-1)} style={{ position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, color: 'var(--text2)' }}>‹</button>
        <button onClick={() => scroll(1)} style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, color: 'var(--text2)' }}>›</button>
      </div>
    </section>
  )
}
