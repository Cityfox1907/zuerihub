'use client'

import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'

export default function EventsPage() {
  return (
    <>
      <Header />
      <NavTabs active="events" />
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '.3rem' }}>🎪 Events</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '2rem' }}>Veranstaltungen in Zürich</p>
        <div style={{ padding: '3rem', background: 'var(--surface2)', borderRadius: 16, color: 'var(--text3)' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem' }}>🎪</span>
          Events werden bald hinzugefügt – stay tuned!
        </div>
      </div>
    </>
  )
}
