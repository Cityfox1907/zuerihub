# ZüriHub – Entdecke Zürich

Professionelles Stadtportal für den Kanton Zürich. Built with Next.js 15, React 19, Tailwind CSS 4.

## Stack
- **Frontend:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS 4 + Custom Design Tokens
- **Data:** JSON-basiert (public/data/)
- **Deployment:** Vercel

## Lokale Entwicklung
```bash
npm install
npm run dev
```

## Projekt-Struktur
```
app/                    # Next.js App Router Pages
  page.js               # Discovery / Startseite
  gastronomie/page.js   # Restaurants & Bars
  shops/page.js         # Shopping
  kultur/page.js        # Museen & Sehenswürdigkeiten
  spiel-spass/page.js   # Entertainment
  events/page.js        # Events (Placeholder)
  favoriten/page.js     # Gespeicherte Favoriten
components/             # Wiederverwendbare UI-Komponenten
  Header.js             # Navigation Header mit Dark Mode
  NavTabs.js            # Hauptnavigation
  Hero.js               # Hero-Bereich
  CategoryCards.js      # Kategorie-Übersicht
  SpotCard.js           # Einzelne Spot-Karte
  SpotRow.js            # Horizontale Scroll-Reihe
  SpotModal.js          # Detail-Modal
lib/                    # Utilities & Data Layer
  data.js               # Daten-Loader & Mappings
public/data/            # JSON-Datendateien
```

## TODO für Claude Code Web
- [ ] Würfel-Feature (Geheimtipp-Dice) auf Startseite
- [ ] Filter & Sortierung auf Unterseiten (Kreis, Kategorie, Rating)
- [ ] Favoriten-System mit localStorage
- [ ] Events-Seite mit echten Daten
- [ ] JSON-Editor Seite (/jsoneditor)
- [ ] Responsive Optimierung (Mobile)
- [ ] Pagination / Infinite Scroll für grosse Listen
- [ ] SEO Metadata pro Seite
