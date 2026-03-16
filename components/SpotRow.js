'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import SpotCard from './SpotCard'

export default function SpotRow({ icon, title, items, link, onOpenModal }) {
  if (!items || items.length < 3) return null

  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, items])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector('.spot-row-card')?.offsetWidth || 280
    el.scrollBy({ left: dir * (cardWidth + 12) * 2, behavior: 'smooth' })
  }

  return (
    <section className="fade-up spot-row-section" style={{ marginBottom: '1.6rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.55rem', gap: '.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '.35rem', margin: 0, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span> {title}
        </h2>
        {link && <Link href={link} style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', padding: '.2rem .5rem', borderRadius: 6, transition: 'background .15s' }}>Alle anzeigen ›</Link>}
      </div>

      <div style={{ position: 'relative' }}>
        {/* Left arrow - desktop only, outside cards */}
        {canScrollLeft && (
          <button className="spot-row-arrow spot-row-arrow-left" onClick={() => scroll(-1)}
            style={{
              position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text)', cursor: 'pointer',
              fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)', zIndex: 5, opacity: 0, transition: 'opacity .2s',
            }}>‹</button>
        )}

        {/* Right arrow - desktop only, outside cards */}
        {canScrollRight && (
          <button className="spot-row-arrow spot-row-arrow-right" onClick={() => scroll(1)}
            style={{
              position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text)', cursor: 'pointer',
              fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)', zIndex: 5, opacity: 0, transition: 'opacity .2s',
            }}>›</button>
        )}

        <div ref={scrollRef} className="spot-row-scroll" style={{
          display: 'flex', gap: '.75rem', overflowX: 'auto',
          scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch', paddingBottom: '.25rem',
        }}>
          {items.slice(0, 10).map((spot, idx) => (
            <div key={spot.id || idx} className="spot-row-card" style={{
              flex: '0 0 calc(25% - .56rem)', minWidth: 220, scrollSnapAlign: 'start',
            }}>
              <SpotCard spot={spot} rank={-1} onClick={() => onOpenModal?.(spot)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
