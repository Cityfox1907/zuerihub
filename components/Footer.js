export default function Footer() {
  return (
    <footer style={{
      maxWidth: 1480, margin: '2rem auto 0', padding: '1.5rem', borderTop: '1px solid var(--border-light)',
      textAlign: 'center', fontSize: '.75rem', color: 'var(--text3)', lineHeight: 1.6,
    }}>
      <div style={{ marginBottom: '.3rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text2)' }}>ZüriHub</span> – Dein Guide für den Kanton Zürich
      </div>
      <div>
        Daten: Google Maps Places API · Alle Angaben ohne Gewähr
      </div>
      <div style={{ marginTop: '.3rem', opacity: .7 }}>
        Bewertungen und Informationen stammen von Google Maps und werden nicht von ZüriHub verifiziert.
      </div>
    </footer>
  )
}
