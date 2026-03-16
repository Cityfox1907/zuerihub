'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import SpotModal from '@/components/SpotModal'
import CategoryDiscovery from '@/components/CategoryDiscovery'
import BackToTop from '@/components/BackToTop'
import Footer from '@/components/Footer'
import { loadAllData, fmt } from '@/lib/data'

export default function SpielSpassPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSpot, setModalSpot] = useState(null)

  useEffect(() => { loadAllData().then(d => { setData(d); setLoading(false) }) }, [])
  if (loading || !data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>

  return (
    <>
      <Header />
      <NavTabs active="spiel-spass" />
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '.3rem' }}>🎮 Spiel & Spass</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1rem' }}>{fmt(data.fun.length)} Entertainment-Spots</p>
        <CategoryDiscovery spots={data.fun} allSpots={data.all} storageKey="zh-dice-seen-fun" onOpenModal={setModalSpot} />
      </div>
      <Footer />
      <BackToTop />
      {modalSpot && <SpotModal spot={modalSpot} allSpots={data.all} onClose={() => setModalSpot(null)} />}
    </>
  )
}
