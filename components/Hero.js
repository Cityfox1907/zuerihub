export default function Hero() {
  return (
    <div style={{ textAlign: 'center', padding: '2.5rem 1rem 1.5rem', maxWidth: 1480, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, marginBottom: '.4rem' }}>
        Entdecke die <span style={{ color: 'var(--primary)' }}>Highlights von Zürich</span>
      </h1>
      <p style={{ fontSize: '.95rem', color: 'var(--text2)', maxWidth: 500, margin: '0 auto' }}>
        Dein Guide für den Kanton Zürich – von Restaurants und Shops über Museen und Kultur bis hin zu Events und Entertainment.
      </p>
    </div>
  )
}
