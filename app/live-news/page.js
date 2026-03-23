'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Header from '@/components/Header'
import NavTabs from '@/components/NavTabs'
import Footer from '@/components/Footer'
import BackToTop from '@/components/BackToTop'

const FEEDS = [
  // ZÜRICH
  { u: "https://www.nzz.ch/zuerich.rss", k: "Zürich", s: "NZZ", c: "#1e3a5f", pw: 1 },
  { u: "https://partner-feeds.publishing.tamedia.ch/rss/tagesanzeiger/zuerich", k: "Zürich", s: "Tagi", c: "#0f4c81", pw: 1 },
  { u: "https://partner-feeds.20min.ch/rss/20minuten/zuerich", k: "Zürich", s: "20min", c: "#1d4ed8", pw: 0 },
  { u: "https://www.blick.ch/life/rss.xml", k: "Zürich", s: "Blick", c: "#e11d48", pw: 0 },
  // SCHWEIZ
  { u: "https://www.srf.ch/news/bnf/rss/1890", k: "Schweiz", s: "SRF", c: "#c82828", pw: 0 },
  { u: "https://www.srf.ch/news/bnf/rss/1646", k: "Schweiz", s: "SRF", c: "#c82828", pw: 0 },
  { u: "https://www.nzz.ch/schweiz.rss", k: "Schweiz", s: "NZZ", c: "#1e3a5f", pw: 1 },
  { u: "https://www.nzz.ch/startseite.rss", k: "Schweiz", s: "NZZ", c: "#1e3a5f", pw: 1 },
  { u: "https://partner-feeds.publishing.tamedia.ch/rss/tagesanzeiger/schweiz", k: "Schweiz", s: "Tagi", c: "#0f4c81", pw: 1 },
  { u: "https://partner-feeds.20min.ch/rss/20minuten/schweiz", k: "Schweiz", s: "20min", c: "#1d4ed8", pw: 0 },
  { u: "https://www.blick.ch/schweiz/rss.xml", k: "Schweiz", s: "Blick", c: "#e11d48", pw: 0 },
  { u: "https://www.blick.ch/news/rss.xml", k: "Schweiz", s: "Blick", c: "#e11d48", pw: 0 },
  { u: "https://www.swissinfo.ch/ger/rss/top-news", k: "Schweiz", s: "swissinfo", c: "#7c3aed", pw: 0 },
  { u: "https://www.beobachter.ch/rss_feed", k: "Schweiz", s: "Beobachter", c: "#b45309", pw: 0 },
  // WIRTSCHAFT
  { u: "https://www.srf.ch/news/bnf/rss/1926", k: "Wirtschaft", s: "SRF", c: "#c82828", pw: 0 },
  { u: "https://www.nzz.ch/wirtschaft.rss", k: "Wirtschaft", s: "NZZ", c: "#1e3a5f", pw: 1 },
  { u: "https://partner-feeds.publishing.tamedia.ch/rss/tagesanzeiger/wirtschaft", k: "Wirtschaft", s: "Tagi", c: "#0f4c81", pw: 1 },
  { u: "https://partner-feeds.20min.ch/rss/20minuten/wirtschaft", k: "Wirtschaft", s: "20min", c: "#1d4ed8", pw: 0 },
  { u: "https://www.blick.ch/wirtschaft/rss.xml", k: "Wirtschaft", s: "Blick", c: "#e11d48", pw: 0 },
  { u: "https://www.cash.ch/feeds/latest/news", k: "Wirtschaft", s: "cash.ch", c: "#059669", pw: 0 },
  // FINANZEN
  { u: "https://www.cash.ch/feeds/latest/top-news", k: "Finanzen", s: "cash.ch", c: "#059669", pw: 0 },
  { u: "https://www.nzz.ch/finanzen.rss", k: "Finanzen", s: "NZZ", c: "#1e3a5f", pw: 1 },
  { u: "https://www.finanzen.ch/rss/news", k: "Finanzen", s: "finanzen.ch", c: "#0d9488", pw: 0 },
  { u: "https://fintechnews.ch/feed", k: "Finanzen", s: "FintechNews", c: "#6366f1", pw: 0 },
]

const API = "https://api.rss2json.com/v1/api.json?rss_url="
const POLL_INTERVAL = 120000
const CATEGORIES = ["Alle", "Zürich", "Schweiz", "Wirtschaft", "Finanzen"]
const CAT_ICONS = { "Zürich": "🏙️", "Schweiz": "🇨🇭", "Wirtschaft": "📊", "Finanzen": "💹" }

function timeAgo(dateStr) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000))
  if (m < 1) return "Gerade eben"
  if (m < 60) return `Vor ${m} Min.`
  const h = Math.floor(m / 60)
  if (h < 24) return `Vor ${h} Std.`
  const d = Math.floor(h / 24)
  return `Vor ${d} Tag${d > 1 ? 'en' : ''}`
}

function stripHtml(html) {
  if (!html) return ""
  const div = document.createElement("div")
  div.innerHTML = html
  return div.textContent.trim().slice(0, 800)
}

function dedup(articles) {
  const seen = new Set()
  return articles.filter(a => {
    const key = (a.title || "").trim().toLowerCase().slice(0, 80)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default function LiveNewsPage() {
  const [articles, setArticles] = useState([])
  const [filter, setFilter] = useState("Alle")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")
  const [sourceCount, setSourceCount] = useState("")
  const [lastUpdate, setLastUpdate] = useState("")
  const [newIds, setNewIds] = useState(new Set())
  const [holidays, setHolidays] = useState([])
  const [holMode, setHolMode] = useState("national")
  const prevIds = useRef(new Set())
  const pollRef = useRef(null)

  const fetchAllFeeds = useCallback(async (isInit) => {
    let ok = 0
    const items = []
    const jobs = FEEDS.map(async (f) => {
      try {
        const r = await fetch(API + encodeURIComponent(f.u))
        if (!r.ok) throw new Error()
        const d = await r.json()
        if (d.status !== "ok" || !d.items) throw new Error()
        ok++
        return d.items.map(i => ({
          id: f.s + "|" + (i.link || i.title),
          title: i.title || "",
          desc: stripHtml(i.description || i.content || ""),
          link: i.link || "#",
          date: i.pubDate || "",
          source: f.s,
          category: f.k,
          color: f.c,
          paywall: f.pw,
          img: i.thumbnail || (i.enclosure && i.enclosure.link) || null,
        }))
      } catch {
        return []
      }
    })

    const results = await Promise.allSettled(jobs)
    results.forEach(r => {
      if (r.status === "fulfilled") items.push(...r.value)
    })

    const sorted = dedup(items).sort((a, b) => new Date(b.date) - new Date(a.date))
    const curIds = new Set(sorted.map(a => a.id))

    if (!isInit && prevIds.current.size) {
      const fresh = new Set()
      curIds.forEach(id => { if (!prevIds.current.has(id)) fresh.add(id) })
      if (fresh.size) {
        setNewIds(fresh)
        setTimeout(() => setNewIds(new Set()), 8000)
      }
    }

    prevIds.current = curIds
    setArticles(sorted)
    setSourceCount(`${ok}/${FEEDS.length}`)
    setLastUpdate(new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAllFeeds(true)
    pollRef.current = setInterval(() => fetchAllFeeds(false), POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [fetchAllFeeds])

  // Load holidays
  useEffect(() => {
    async function loadHolidays() {
      try {
        const now = new Date()
        const from = now.toISOString().slice(0, 10)
        const toDate = new Date(now.getTime() + 365 * 24 * 3600000)
        const to = toDate.toISOString().slice(0, 10)
        const r = await fetch(`https://openholidaysapi.org/PublicHolidays?countryIsoCode=CH&languageIsoCode=DE&validFrom=${from}&validTo=${to}`)
        const d = await r.json()
        const seen = new Set()
        const unique = []
        d.forEach(h => {
          const key = h.startDate + (h.name?.[0]?.text || "")
          if (!seen.has(key)) { seen.add(key); unique.push(h) }
        })
        unique.sort((a, b) => a.startDate.localeCompare(b.startDate))
        setHolidays(unique)
      } catch {}
    }
    loadHolidays()
  }, [])

  const filteredHolidays = holMode === "national"
    ? holidays.filter(h => h.nationwide !== false)
    : holidays

  const filtered = filter === "Alle" ? articles : articles.filter(a => a.category === filter)
  const catCounts = {}
  CATEGORIES.forEach(c => {
    catCounts[c] = c === "Alle" ? articles.length : articles.filter(a => a.category === c).length
  })

  const tickerArticles = articles.slice(0, 30)

  return (
    <>
      <Header />
      <NavTabs active="live-news" />

      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
        {/* Page header */}
        <div className="fade-up" style={{ padding: '1.5rem 0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📰</span>
              Live-News
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '.35rem',
                fontSize: '.65rem', fontFamily: 'var(--font)', fontWeight: 700,
                letterSpacing: '.08em', color: 'var(--accent)',
                background: 'var(--accent-light)', padding: '.2rem .55rem',
                borderRadius: 6,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)',
                  animation: 'livePulse 1.5s ease-in-out infinite',
                }} />
                LIVE
              </span>
            </h1>
          </div>
          <p style={{ fontSize: '.85rem', color: 'var(--text3)', maxWidth: 600 }}>
            Aktuelle Nachrichten aus Zürich, der Schweiz, Wirtschaft und Finanzen — live aus über 10 Schweizer Medienquellen.
          </p>
        </div>

        {/* Controls bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap',
          padding: '.6rem 0', borderBottom: '1px solid var(--border-light)', marginBottom: '1rem',
        }}>
          {/* Category filters */}
          <div style={{ display: 'flex', gap: '.3rem', flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: '.35rem .75rem', borderRadius: 20, border: 'none',
                fontSize: '.78rem', fontWeight: filter === cat ? 700 : 500, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all .15s',
                background: filter === cat ? 'var(--accent-light)' : 'var(--surface2)',
                color: filter === cat ? 'var(--accent)' : 'var(--text3)',
                display: 'flex', alignItems: 'center', gap: '.35rem',
              }}>
                {cat}
                <span style={{ fontFamily: 'var(--font)', fontSize: '.65rem', opacity: .5 }}>{catCounts[cat]}</span>
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
            <span style={{ fontSize: '.7rem', color: 'var(--text3)', fontFamily: 'var(--font)' }}>
              {lastUpdate && `${lastUpdate}`} {sourceCount && `· ${sourceCount} Quellen`}
            </span>

            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <button onClick={() => setViewMode("grid")} style={{
                padding: '.3rem .5rem', border: 'none', cursor: 'pointer', fontSize: '.85rem',
                background: viewMode === "grid" ? 'var(--accent-light)' : 'transparent',
                color: viewMode === "grid" ? 'var(--accent)' : 'var(--text3)',
                transition: 'all .15s',
              }}>▦</button>
              <button onClick={() => setViewMode("list")} style={{
                padding: '.3rem .5rem', border: 'none', cursor: 'pointer', fontSize: '.85rem',
                background: viewMode === "list" ? 'var(--accent-light)' : 'transparent',
                color: viewMode === "list" ? 'var(--accent)' : 'var(--text3)',
                transition: 'all .15s',
              }}>☰</button>
            </div>

            {/* Refresh */}
            <button onClick={() => { setLoading(true); fetchAllFeeds(false) }} style={{
              padding: '.3rem .65rem', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text2)', cursor: 'pointer',
              fontSize: '.78rem', fontWeight: 500, transition: 'all .15s',
            }}>↻</button>
          </div>
        </div>

        {/* Holiday bar */}
        {filteredHolidays.length > 0 && (
          <div className="fade-up" style={{
            padding: '.6rem .8rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)',
            background: 'var(--surface)', marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.4rem' }}>
              <span style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <span style={{ fontSize: '.85rem' }}>📅</span> Feiertage Schweiz
              </span>
              <button onClick={() => setHolMode(m => m === 'national' ? 'all' : 'national')} style={{
                fontSize: '.65rem', color: 'var(--text3)', background: 'none', border: '1px solid var(--border)',
                padding: '.15rem .45rem', borderRadius: 6, cursor: 'pointer', transition: 'all .15s',
              }}>
                {holMode === 'national' ? '🇨🇭 National' : '🏔️ Alle'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '.4rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '.1rem' }}>
              {filteredHolidays.slice(0, 12).map((h, i) => {
                const dt = new Date(h.startDate)
                const now = new Date(); now.setHours(0, 0, 0, 0); dt.setHours(0, 0, 0, 0)
                const diff = Math.round((dt - now) / 86400000)
                const name = h.name?.[0]?.text || "–"
                const dayStr = dt.toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short' })
                let badgeColor = 'var(--primary)'
                let badgeBg = 'var(--primary-light)'
                let badgeText = `${diff} T.`
                if (diff === 0) { badgeColor = 'var(--accent)'; badgeBg = 'var(--accent-light)'; badgeText = 'HEUTE' }
                else if (diff === 1) { badgeColor = 'var(--accent)'; badgeBg = 'var(--accent-light)'; badgeText = 'MORGEN' }
                else if (diff <= 7) { badgeColor = '#f59e0b'; badgeBg = 'rgba(245,158,11,.1)'; badgeText = `${diff} Tage` }

                return (
                  <div key={i} style={{
                    flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '.4rem',
                    padding: '.35rem .55rem', borderRadius: 10,
                    background: diff <= 1 ? 'var(--accent-light)' : 'var(--surface2)',
                    border: `1px solid ${diff <= 1 ? 'rgba(230,57,70,.15)' : 'var(--border-light)'}`,
                    transition: 'all .15s',
                  }}>
                    <span style={{ fontSize: '.9rem' }}>{h.nationwide !== false ? '🇨🇭' : '🏔️'}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{name}</div>
                      <div style={{ fontSize: '.6rem', color: 'var(--text3)' }}>{dayStr}</div>
                    </div>
                    <span style={{
                      fontSize: '.55rem', fontWeight: 700, letterSpacing: '.04em',
                      padding: '.1rem .35rem', borderRadius: 4, whiteSpace: 'nowrap',
                      color: badgeColor, background: badgeBg,
                    }}>{badgeText}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0', gap: '.75rem' }}>
            <div style={{
              width: 28, height: 28, border: '2.5px solid var(--border)',
              borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite',
            }} />
            <span style={{ fontSize: '.8rem', color: 'var(--text3)' }}>Feeds werden geladen...</span>
          </div>
        )}

        {/* News feed */}
        {!loading && (
          viewMode === "grid" ? (
            <GridView articles={filtered} filter={filter} newIds={newIds} />
          ) : (
            <ListView articles={filtered} filter={filter} newIds={newIds} />
          )
        )}

        {/* Ticker */}
        {tickerArticles.length > 5 && (
          <div className="fade-up" style={{
            display: 'flex', alignItems: 'center', gap: '.6rem',
            marginTop: '1.5rem', padding: '.65rem 0',
            borderTop: '1px solid var(--border-light)', overflow: 'hidden',
          }}>
            <span style={{
              fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em',
              color: 'var(--accent)', background: 'var(--accent-light)',
              padding: '.2rem .45rem', borderRadius: 4, flexShrink: 0,
            }}>TICKER</span>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{
                display: 'inline-flex', whiteSpace: 'nowrap',
                animation: 'newsScroll 160s linear infinite',
              }}>
                {[...tickerArticles, ...tickerArticles].map((a, i) => (
                  <span key={i} style={{ fontSize: '.75rem', color: 'var(--text3)' }}>
                    <b style={{ fontWeight: 700, color: a.color }}>{a.source}</b>
                    {a.paywall ? ' 🔒' : ''} — {a.title}
                    <span style={{ margin: '0 .75rem', fontSize: '.3rem', color: 'var(--text3)', verticalAlign: 'middle' }}>●</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sources footer */}
        <div style={{ textAlign: 'center', padding: '1.5rem 0 .5rem' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>
            SRF · NZZ · Tagi · 20min · Blick · cash · finanzen.ch · FintechNews · swissinfo · Beobachter
          </div>
          <div style={{ fontSize: '.6rem', color: 'var(--text3)', marginTop: '.2rem', opacity: .6 }}>
            🔒 = Abo nötig · Auto-Polling alle 2 Min.
          </div>
        </div>
      </div>

      <Footer />
      <BackToTop />

      <style jsx global>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .3; transform: scale(1.4); }
        }
        @keyframes newsScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes newsCardIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

/* ── Grid View ── */
function GridView({ articles, filter, newIds }) {
  if (!articles.length) return <EmptyState filter={filter} />

  if (filter === "Alle") {
    return (
      <>
        {["Zürich", "Schweiz", "Wirtschaft", "Finanzen"].map(cat => {
          const items = articles.filter(a => a.category === cat).slice(0, 12)
          if (!items.length) return null
          return (
            <section key={cat} style={{ paddingTop: '1rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '.25rem' }}>
              <h2 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '.7rem' }}>
                <span style={{ fontSize: '1rem' }}>{CAT_ICONS[cat]}</span> {cat}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.7rem' }} className="news-grid">
                {items.map((a, i) => <NewsCard key={a.id} article={a} index={i} isNew={newIds.has(a.id)} />)}
              </div>
            </section>
          )
        })}
      </>
    )
  }

  return (
    <section style={{ paddingTop: '1rem' }}>
      <h2 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '.7rem' }}>
        <span style={{ fontSize: '1rem' }}>{CAT_ICONS[filter] || ''}</span> {filter}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.7rem' }} className="news-grid">
        {articles.slice(0, 60).map((a, i) => <NewsCard key={a.id} article={a} index={i} isNew={newIds.has(a.id)} />)}
      </div>
    </section>
  )
}

/* ── List View ── */
function ListView({ articles, filter, newIds }) {
  if (!articles.length) return <EmptyState filter={filter} />

  if (filter === "Alle") {
    return (
      <>
        {["Zürich", "Schweiz", "Wirtschaft", "Finanzen"].map(cat => {
          const items = articles.filter(a => a.category === cat).slice(0, 15)
          if (!items.length) return null
          return (
            <section key={cat}>
              <div style={{
                fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                color: 'var(--text3)', padding: '.8rem 0 .35rem',
                borderBottom: '1px solid var(--border-light)', marginBottom: '.2rem',
                display: 'flex', alignItems: 'center', gap: '.35rem',
              }}>
                <span>{CAT_ICONS[cat]}</span> {cat}
              </div>
              {items.map((a, i) => <NewsListItem key={a.id} article={a} index={i} isNew={newIds.has(a.id)} />)}
            </section>
          )
        })}
      </>
    )
  }

  return (
    <section>
      <div style={{
        fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
        color: 'var(--text3)', padding: '.8rem 0 .35rem',
        borderBottom: '1px solid var(--border-light)', marginBottom: '.2rem',
        display: 'flex', alignItems: 'center', gap: '.35rem',
      }}>
        <span>{CAT_ICONS[filter] || ''}</span> {filter}
      </div>
      {articles.slice(0, 60).map((a, i) => <NewsListItem key={a.id} article={a} index={i} isNew={newIds.has(a.id)} />)}
    </section>
  )
}

/* ── News Card (Grid) ── */
function NewsCard({ article: a, index, isNew }) {
  return (
    <a href={a.link} target="_blank" rel="noopener noreferrer"
      className="news-card-hover"
      style={{
        display: 'flex', flexDirection: 'row', gap: '.7rem',
        padding: '.8rem .9rem', borderRadius: 'var(--radius)',
        background: isNew ? 'var(--accent-light)' : 'var(--card-bg)',
        border: `1px solid ${isNew ? 'rgba(230,57,70,.2)' : 'var(--border-light)'}`,
        textDecoration: 'none', color: 'inherit', position: 'relative',
        transition: 'background .15s, border-color .15s, transform .2s, box-shadow .2s',
        animation: `newsCardIn .3s ease both`,
        animationDelay: `${Math.min(index * 15, 300)}ms`,
      }}
    >
      {isNew && (
        <span style={{
          position: 'absolute', top: 6, right: 6, fontSize: '.5rem', fontWeight: 700,
          letterSpacing: '.06em', color: '#fff', background: 'var(--accent)',
          padding: '.1rem .35rem', borderRadius: 3,
        }}>NEU</span>
      )}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '.35rem' }}>
          <span style={{
            fontSize: '.55rem', fontWeight: 700, color: '#fff',
            padding: '.1rem .35rem', borderRadius: 4, letterSpacing: '.02em',
            textTransform: 'uppercase', background: a.color,
          }}>{a.source}</span>
          {a.paywall ? <span style={{ fontSize: '.6rem', opacity: .5 }}>🔒</span> : null}
        </div>
        <div style={{ fontSize: '.82rem', fontWeight: 700, lineHeight: 1.35, color: 'var(--text)', marginBottom: '.3rem' }}>
          {a.title}
        </div>
        {a.desc && (
          <div style={{ fontSize: '.72rem', lineHeight: 1.55, color: 'var(--text3)', flex: 1 }}>
            {a.desc.slice(0, 160)}{a.desc.length > 160 ? '...' : ''}
          </div>
        )}
        <div style={{ fontSize: '.62rem', color: 'var(--text3)', marginTop: '.4rem', opacity: .7 }}>
          {timeAgo(a.date)}
        </div>
      </div>
      {a.img && (
        <div style={{
          width: 90, minHeight: 65, borderRadius: 10, overflow: 'hidden',
          flexShrink: 0, alignSelf: 'flex-start', background: 'var(--surface2)',
        }}>
          <img src={a.img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 65 }}
            onError={(e) => { e.target.parentElement.style.display = 'none' }} />
        </div>
      )}
    </a>
  )
}

/* ── News List Item ── */
function NewsListItem({ article: a, index, isNew }) {
  return (
    <a href={a.link} target="_blank" rel="noopener noreferrer"
      className="news-card-hover"
      style={{
        display: 'flex', gap: '.8rem', padding: '.7rem .8rem', marginBottom: 1,
        borderRadius: 10, textDecoration: 'none', color: 'inherit', position: 'relative',
        background: isNew ? 'var(--accent-light)' : 'transparent',
        borderBottom: '1px solid var(--border-light)',
        transition: 'background .15s',
        animation: `newsCardIn .3s ease both`,
        animationDelay: `${Math.min(index * 18, 350)}ms`,
      }}
    >
      {isNew && (
        <span style={{
          position: 'absolute', top: 6, right: 6, fontSize: '.5rem', fontWeight: 700,
          letterSpacing: '.06em', color: '#fff', background: 'var(--accent)',
          padding: '.1rem .35rem', borderRadius: 3,
        }}>NEU</span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.3rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '.55rem', fontWeight: 700, color: '#fff',
            padding: '.1rem .4rem', borderRadius: 4, letterSpacing: '.02em',
            textTransform: 'uppercase', background: a.color,
          }}>{a.source}</span>
          {a.paywall ? <span style={{ fontSize: '.6rem', opacity: .5 }}>🔒</span> : null}
          <span style={{ fontSize: '.68rem', color: 'var(--text3)', fontWeight: 500 }}>{a.category}</span>
          <span style={{ fontSize: '.62rem', color: 'var(--text3)', opacity: .7 }}>{timeAgo(a.date)}</span>
        </div>
        <h3 style={{ fontSize: '.82rem', fontWeight: 600, lineHeight: 1.36, margin: 0, marginBottom: '.15rem' }}>{a.title}</h3>
        {a.desc && <p style={{ fontSize: '.72rem', lineHeight: 1.55, color: 'var(--text3)', margin: 0 }}>{a.desc.slice(0, 300)}{a.desc.length > 300 ? '...' : ''}</p>}
      </div>
      {a.img && (
        <div style={{
          width: 80, height: 56, borderRadius: 8, overflow: 'hidden',
          flexShrink: 0, alignSelf: 'center', background: 'var(--surface2)',
        }}>
          <img src={a.img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.parentElement.style.display = 'none' }} />
        </div>
      )}
    </a>
  )
}

/* ── Empty state ── */
function EmptyState({ filter }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text3)', fontSize: '.85rem' }}>
      Keine Artikel in «{filter}».
    </div>
  )
}
