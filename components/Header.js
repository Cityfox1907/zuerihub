'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('zh-theme')
    if (saved === 'dark') { setDark(true); document.documentElement.classList.add('dark') }
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('zh-theme', next ? 'dark' : 'light')
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--header-bg)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderBottom: '1px solid var(--border-light)', padding: '.5rem 1.5rem', transition: 'background .3s' }}>
      <div style={{ maxWidth: 1480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <Link href="/" className="zh-logo-link" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.5rem', letterSpacing: '-.02em', transition: 'transform .2s var(--ease), opacity .2s' }}>
          <div className="zh-logo-icon" style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), #5a9cf5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(15,71,175,0.20), 0 1px 3px rgba(15,71,175,0.12)',
            transition: 'box-shadow .2s, transform .2s var(--ease)',
          }}>
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
              <path d="M30 82V42l-4-2V38l12-14h2l2 5h16l2-5h2l12 14v2l-4 2v40" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="35" y="40" width="10" height="42" rx="2" stroke="#fff" strokeWidth="3.5" fill="rgba(255,255,255,0.15)"/>
              <rect x="55" y="40" width="10" height="42" rx="2" stroke="#fff" strokeWidth="3.5" fill="rgba(255,255,255,0.15)"/>
              <circle cx="40" cy="30" r="3.5" fill="#fff"/>
              <circle cx="60" cy="30" r="3.5" fill="#fff"/>
              <line x1="26" y1="82" x2="74" y2="82" stroke="#fff" strokeWidth="4.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ZüriHub</span>
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.35rem', alignItems: 'center' }}>
          <Link href="/favoriten" style={{ padding: '.42rem .75rem', borderRadius: 8, fontSize: '.8rem', fontWeight: 500, color: 'var(--text2)', border: '1.5px solid var(--border)', background: 'var(--surface)', textDecoration: 'none', transition: 'all .15s' }}>⭐</Link>
          <button onClick={toggleTheme} style={{ position: 'relative', width: 52, height: 28, borderRadius: 14, background: dark ? '#1e3148' : 'var(--border)', cursor: 'pointer', border: `1.5px solid ${dark ? '#2a3f58' : 'var(--border)'}`, transition: 'all .3s', display: 'flex', alignItems: 'center', padding: 0 }}>
            <div style={{ position: 'absolute', left: dark ? 2 : 28, width: 22, height: 22, borderRadius: '50%', background: dark ? '#e8914a' : '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.15)', transition: 'left .3s cubic-bezier(.4,0,.2,1), background .3s' }} />
            <span style={{ position: 'absolute', right: 6, fontSize: '.75rem', opacity: dark ? 0 : 1, transition: 'opacity .25s' }}>☀️</span>
            <span style={{ position: 'absolute', left: 6, fontSize: '.75rem', opacity: dark ? 1 : 0, transition: 'opacity .25s' }}>🌙</span>
          </button>
        </div>
      </div>
    </header>
  )
}
