'use client'

import Link from 'next/link'

const tabs = [
  { id: 'discovery', emoji: '🔮', label: 'Discovery', href: '/' },
  { id: 'events', emoji: '🎪', label: 'Events', href: '/events' },
  { id: 'shops', emoji: '🛍️', label: 'Shops', href: '/shops' },
  { id: 'gastronomie', emoji: '🍽️', label: 'Essen & Trinken', href: '/essen-trinken' },
  { id: 'kultur', emoji: '🏛️', label: 'Kultur & Natur', href: '/kultur' },
  { id: 'spiel-spass', emoji: '🎮', label: 'Unterhaltung & Spass', href: '/spiel-spass' },
  { id: 'badis-seen', emoji: '🏊', label: 'Badis & Seen', href: '/badis-seen' },
]

export default function NavTabs({ active }) {
  return (
    <nav className="nav-tabs-scroll" style={{ maxWidth: 1480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, borderBottom: '1px solid var(--border-light)', padding: '0 1.25rem', overflowX: 'auto' }}>
      {tabs.map(tab => (
        <Link key={tab.id} href={tab.href} style={{
          padding: '.6rem .85rem', fontSize: '.82rem', fontWeight: active === tab.id ? 700 : 600,
          color: active === tab.id ? 'var(--primary)' : 'var(--text3)',
          textDecoration: 'none', borderBottom: `2.5px solid ${active === tab.id ? 'var(--primary)' : 'transparent'}`,
          transition: 'color .25s, border-color .25s', whiteSpace: 'nowrap',
          display: 'inline-flex', alignItems: 'center', gap: '.35rem',
        }}>
          <span style={{ fontSize: '1rem' }}>{tab.emoji}</span>
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
