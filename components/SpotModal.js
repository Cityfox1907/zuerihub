'use client'

import { getEmoji, getKreis, getMapsUrl, getSourceInfo, fmt, CUISINE_MAP, KEYWORD_ICONS, TRADE_ICONS, SHOP_ICONS } from '@/lib/data'
import { Stars } from './SpotCard'

export default function SpotModal({ spot, allSpots, onClose }) {
  if (!spot) return null
  const emoji = getEmoji(spot)
  const kreis = getKreis(spot.addr)
  const mapsUrl = getMapsUrl(spot)

  const tags = []
  if (spot.trade) tags.push((TRADE_ICONS[spot.trade] || '') + ' ' + spot.trade)
  if (spot.cuisines) spot.cuisines.slice(0, 3).forEach(c => { if (CUISINE_MAP[c]) tags.push(CUISINE_MAP[c].icon + ' ' + CUISINE_MAP[c].label) })
  if (spot.keyword) tags.push((KEYWORD_ICONS[spot.keyword] || '📍') + ' ' + spot.keyword)
  if (spot.subcat) tags.push((SHOP_ICONS[spot.subcat] || '🛍️') + ' ' + spot.subcat)

  const similar = allSpots.filter(x => x.id !== spot.id && x.source === spot.source).sort((a, b) => (b.r * b.rv) - (a.r * a.rv)).slice(0, 3)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--modal-bg)', borderRadius: 20, maxWidth: 500, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: 'var(--shadow-elevated)', animation: 'fadeUp .3s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
          <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--text)' }}>Details</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', fontSize: '.8rem' }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: '1rem 1.25rem 1.5rem' }}>
          <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '.5rem' }}>{emoji}</div>
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '.3rem' }}>{spot.name}</div>
          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginBottom: '1rem' }}>
            <Stars rating={spot.r} size={14} />
            <b>{spot.r.toFixed(1)}</b>
            <span style={{ color: 'var(--text3)' }}>· {fmt(spot.rv)} Bewertungen</span>
          </div>

          {/* Info */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem' }}>📍 Info</h4>
            {spot.addr && <div style={{ fontSize: '.82rem', color: 'var(--text2)', marginBottom: '.2rem' }}>{spot.addr} {kreis > 0 && <span style={{ padding: '0 .3rem', borderRadius: 4, background: 'var(--primary-50)', color: 'var(--primary)', fontSize: '.65rem', fontWeight: 700 }}>K{kreis}</span>}</div>}
            {spot.web && <div style={{ fontSize: '.82rem' }}><a href={spot.web} target="_blank" rel="noopener" style={{ color: 'var(--primary)' }}>Website →</a></div>}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem' }}>🏷️ Kategorien</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                {tags.map((t, i) => <span key={i} style={{ padding: '.25rem .6rem', borderRadius: 8, background: 'var(--surface2)', fontSize: '.75rem', fontWeight: 500, color: 'var(--text2)' }}>{t}</span>)}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
            <a href={mapsUrl} target="_blank" rel="noopener" style={{ flex: 1, textAlign: 'center', padding: '.6rem', borderRadius: 12, background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '.85rem', textDecoration: 'none' }}>📍 Google Maps</a>
            {spot.web && <a href={spot.web} target="_blank" rel="noopener" style={{ flex: 1, textAlign: 'center', padding: '.6rem', borderRadius: 12, background: 'var(--surface2)', color: 'var(--text)', fontWeight: 600, fontSize: '.85rem', textDecoration: 'none', border: '1px solid var(--border)' }}>🌐 Website</a>}
          </div>

          {/* Similar */}
          {similar.length > 0 && (
            <div>
              <h4 style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem' }}>Ähnliche Spots</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem' }}>
                {similar.map(s => (
                  <div key={s.id} style={{ padding: '.6rem', borderRadius: 12, background: 'var(--surface2)', textAlign: 'center', cursor: 'pointer' }}>
                    <span style={{ fontSize: '1.3rem' }}>{getEmoji(s)}</span>
                    <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text)', marginTop: '.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--text3)' }}>{s.r.toFixed(1)} ⭐</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
