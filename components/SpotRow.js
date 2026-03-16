'use client'

import Link from 'next/link'
import SpotCard from './SpotCard'

export default function SpotRow({ icon, title, items, link, onOpenModal }) {
  if (!items || items.length < 3) return null

  return (
    <section className="fade-up" style={{ marginBottom: '1.6rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.55rem', gap: '.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '.35rem', margin: 0, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span> {title}
        </h2>
        {link && <Link href={link} style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', padding: '.2rem .5rem', borderRadius: 6, transition: 'background .15s' }}>Alle anzeigen ›</Link>}
      </div>
      <div className="spot-row-grid" style={{ display: 'grid', gap: '.65rem' }}>
        {items.slice(0, 8).map((spot, idx) => (
          <SpotCard key={spot.id || idx} spot={spot} rank={idx} onClick={() => onOpenModal?.(spot)} />
        ))}
      </div>
    </section>
  )
}
