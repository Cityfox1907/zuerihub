'use client'

import Link from 'next/link'

export default function CategoryCards({ categories }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '.75rem', maxWidth: 1480, margin: '0 auto 1.5rem', padding: '0 1.5rem' }}>
      {categories.map(cat => (
        <Link key={cat.title} href={cat.href} style={{
          background: 'var(--glass-bg, var(--card-bg))', backdropFilter: 'var(--glass-blur, none)',
          border: '1px solid var(--glass-border, var(--border-light))', borderRadius: 16,
          padding: '1.25rem 1rem', textAlign: 'center', textDecoration: 'none', color: 'inherit',
          transition: 'transform .25s, box-shadow .25s', boxShadow: 'var(--shadow-soft, var(--shadow))',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-soft)' }}
        >
          <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '.4rem' }}>{cat.emoji}</span>
          <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text)', marginBottom: '.1rem' }}>{cat.title}</div>
          <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{cat.sub}</div>
          {cat.count > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.2rem', marginTop: '.5rem', padding: '.2rem .55rem', borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '.7rem', fontWeight: 700 }}>
              {cat.count.toLocaleString('de-CH')} Spots
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
