'use client'

import { getEmoji, getKreis, getSourceInfo, fmt, isFav, openInMapsApp } from '@/lib/data'
import PhotoCarousel from './PhotoCarousel'

export default function SpotCard({ spot, rank, onClick }) {
  const emoji = getEmoji(spot)
  const kreis = getKreis(spot.addr)
  const src = getSourceInfo(spot.source)
  const favorited = typeof window !== 'undefined' && isFav(spot)

  const srcColors = {
    'src-gastro': { bg: 'rgba(59,130,246,.1)', color: '#2563eb' },
    'src-attr': { bg: 'rgba(168,85,247,.1)', color: '#7c3aed' },
    'src-museum': { bg: 'rgba(245,158,11,.1)', color: '#d97706' },
    'src-shop': { bg: 'rgba(34,197,94,.1)', color: '#16a34a' },
    'src-fun': { bg: 'rgba(236,72,153,.1)', color: '#db2777' },
  }
  const sc = srcColors[src.cls] || { bg: 'var(--primary-light)', color: 'var(--primary)' }

  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      background: 'var(--card-bg)', borderRadius: 'var(--radius)', overflow: 'hidden',
      boxShadow: 'var(--shadow-soft)', transition: 'transform .25s, box-shadow .25s',
      border: '1px solid var(--border-light)', position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-soft)' }}
    >
      {favorited && <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 2, fontSize: '.7rem', lineHeight: 1 }}>⭐</div>}

      {/* Photo with 4:3 aspect ratio */}
      <div className="spot-card-photo">
        <PhotoCarousel placeId={spot.id} height={180} fallbackEmoji={emoji} single />
      </div>

      <div style={{ padding: '.65rem .75rem .75rem' }}>
        <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.name}</div>
        <div style={{ fontSize: '.78rem', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '.15rem' }}>
          {spot.addr?.split(',')[0]} {kreis > 0 && <span style={{ display: 'inline-block', padding: '0 .3rem', borderRadius: 4, background: 'var(--primary-50)', color: 'var(--primary)', fontSize: '.65rem', fontWeight: 700, marginLeft: '.2rem' }}>K{kreis}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', marginTop: '.35rem' }}>
          <Stars rating={spot.r} size={12} />
          <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text)' }}>{spot.r.toFixed(1)}</span>
          <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>({fmt(spot.rv)})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.4rem' }}>
          <span style={{ fontSize: '.72rem', fontWeight: 600, padding: '.15rem .45rem', borderRadius: 6, background: sc.bg, color: sc.color }}>{emoji} {src.label}</span>
          <a href="#" onClick={e => { e.preventDefault(); e.stopPropagation(); openInMapsApp(spot) }} style={{ fontSize: '.85rem', textDecoration: 'none', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📍</a>
        </div>
      </div>
    </div>
  )
}

export function Stars({ rating, size = 12 }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.25
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: 'var(--gold, #D4930D)' }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < full ? 'currentColor' : (i === full && half ? 'url(#halfGrad)' : 'none')} stroke={i >= full && !(i === full && half) ? '#D4DCE8' : 'none'} strokeWidth={1}>
          {i === full && half && <defs><linearGradient id="halfGrad"><stop offset="50%" stopColor="currentColor" /><stop offset="50%" stopColor="#D4DCE8" /></linearGradient></defs>}
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}
