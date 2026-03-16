/**
 * ZüriHub Data Loader
 * Loads and normalizes all data sources into a unified format
 */

// Cuisine mapping
export const CUISINE_MAP = {
  vegan_restaurant: { label: 'Vegan', icon: '🌱' },
  vegetarian_restaurant: { label: 'Vegetarisch', icon: '🥗' },
  pizza_restaurant: { label: 'Pizzeria', icon: '🍕' },
  sushi_restaurant: { label: 'Sushi', icon: '🍣' },
  hamburger_restaurant: { label: 'Burger', icon: '🍔' },
  kebab_shop: { label: 'Döner', icon: '🥙' },
  italian_restaurant: { label: 'Italienisch', icon: '🇮🇹' },
  japanese_restaurant: { label: 'Japanisch', icon: '🇯🇵' },
  thai_restaurant: { label: 'Thai', icon: '🇹🇭' },
  indian_restaurant: { label: 'Indisch', icon: '🇮🇳' },
  chinese_restaurant: { label: 'Chinesisch', icon: '🇨🇳' },
  swiss_restaurant: { label: 'Schweizer', icon: '🇨🇭' },
  turkish_restaurant: { label: 'Türkisch', icon: '🇹🇷' },
  cocktail_bar: { label: 'Cocktailbar', icon: '🍸' },
  wine_bar: { label: 'Weinbar', icon: '🍷' },
  pub: { label: 'Pub', icon: '🍺' },
  coffee_shop: { label: 'Coffee Shop', icon: '☕' },
  ice_cream_shop: { label: 'Eisdiele', icon: '🍦' },
  breakfast_restaurant: { label: 'Frühstück', icon: '🥞' },
  brunch_restaurant: { label: 'Brunch', icon: '🍳' },
}

export const TAG_TO_CUISINE = {
  'Pizza': 'pizza_restaurant', 'Grill & BBQ': 'barbecue_restaurant',
  'Meeresfrüchte': 'seafood_restaurant', 'Schweizerisch': 'swiss_restaurant',
  'Thailändisch': 'thai_restaurant', 'Cocktails': 'cocktail_bar',
  'Shisha': 'hookah_bar', 'Sportsbar': 'sports_bar',
  'Konfiserie': 'confectionery', 'Glace & Eis': 'ice_cream_shop',
  'Kaffee': 'coffee_shop', 'Snacks': 'snack_bar', 'Kebab': 'kebab_shop',
}
Object.entries(CUISINE_MAP).forEach(([k, v]) => { TAG_TO_CUISINE[v.label] = k })

export const TRADE_ICONS = { 'Restaurant': '🍽️', 'Bar': '🍺', 'Café': '☕', 'Hotel': '🏨', 'Bäckerei': '🥐', 'Takeaway': '🥡' }

export const KEYWORD_ICONS = {
  'Sehenswürdigkeit': '🏛️', 'Park': '🌳', 'Historische Sehenswürdigkeit': '🏰',
  'Aussichtsplattform': '🔭', 'Zoo': '🦁', 'Escape Room': '🔐',
  'Kegelbahn': '🎳', 'Minigolf': '⛳', 'Go Karting': '🏎️',
  'Spielhalle': '🕹️', 'Wandern': '🥾', 'Berggipfel': '⛰️',
  'Naturschutzgebiet': '🦎', 'Kunstmuseum': '🎨', 'Wissenschaftsmuseum': '🔬',
  'Naturhistorisches Museum': '🦕', 'Historisches Museum': '🏰',
  'Kulturmuseum': '🎭', 'Kindermuseum': '🧒', 'Erlebnismuseum': '🎪',
  'Allgemeines Museum': '🏛️',
}

export const SHOP_ICONS = {
  'Mode & Fashion': '👗', 'Sportbekleidung': '🏃', 'Schuhe': '👟',
  'Second-Hand & Vintage': '♻️', 'Einkaufszentren': '🏬', 'Spezialgeschäfte': '🎁',
}

export const KREIS_MAP = {
  8001:1,8002:2,8003:3,8004:4,8005:5,8006:6,8008:8,8032:7,
  8037:10,8038:2,8040:4,8041:7,8044:7,8045:3,8046:6,8047:5,
  8048:4,8049:10,8050:11,8051:11,8052:12,8053:7,8055:3,8057:6,
  8058:12,8060:11,8064:9,8092:1,
}

/** Get Kreis number from address string */
export function getKreis(addr) {
  if (!addr) return 0
  const m = addr.match(/\b(80\d{2})\b/)
  return m ? KREIS_MAP[+m[1]] || 0 : 0
}

/** Get emoji for a spot */
export function getEmoji(spot) {
  if (spot.source === 'gastro') {
    if (spot.cuisines?.length > 0 && CUISINE_MAP[spot.cuisines[0]]) return CUISINE_MAP[spot.cuisines[0]].icon
    return TRADE_ICONS[spot.trade] || '🍽️'
  }
  if (spot.source === 'shop') return SHOP_ICONS[spot.subcat] || '🛍️'
  if (spot.source === 'museum') return KEYWORD_ICONS[spot.keyword] || '🖼️'
  return KEYWORD_ICONS[spot.keyword] || '📍'
}

/** Get category tag text */
export function getSpotTag(spot) {
  if (spot.source === 'gastro') {
    if (spot.cuisines?.length > 0 && CUISINE_MAP[spot.cuisines[0]]) return CUISINE_MAP[spot.cuisines[0]].label
    return spot.trade || 'Restaurant'
  }
  if (spot.source === 'shop') return spot.subcat || 'Shop'
  if (spot.source === 'museum') return spot.keyword || 'Museum'
  return spot.keyword || 'Sehenswürdigkeit'
}

/** Get Google Maps URL – always use place_id for reliable profile links */
export function getMapsUrl(spot) {
  if (spot.id) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}&query_place_id=${spot.id}`
  if (spot.lat && spot.lng) return `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' Zürich')}`
}

/** Open Google Maps – uses native app on mobile, browser on desktop */
export function openInMapsApp(spot) {
  const webUrl = getMapsUrl(spot)

  if (typeof navigator === 'undefined') {
    window.open(webUrl, '_blank')
    return
  }

  const ua = navigator.userAgent || ''
  const isAndroid = /android/i.test(ua)
  const isIOS = /iphone|ipad|ipod/i.test(ua)

  if (isIOS) {
    // iOS Universal Links: google.com/maps URLs open in Google Maps app if installed
    window.location.href = webUrl
    return
  }

  if (isAndroid) {
    const encodedName = encodeURIComponent(spot.name)
    if (spot.lat && spot.lng) {
      // geo: URI scheme for Android
      window.location.href = `geo:${spot.lat},${spot.lng}?q=${encodedName}`
    } else {
      // Fallback: try geo search
      window.location.href = `geo:0,0?q=${encodedName}+Zürich`
    }
    // Fallback to web after a short delay if app didn't open
    setTimeout(() => { window.open(webUrl, '_blank') }, 500)
    return
  }

  // Desktop: open in browser
  window.open(webUrl, '_blank')
}

/** Source label + CSS class */
export function getSourceInfo(source) {
  const map = {
    gastro: { label: 'Gastro', cls: 'src-gastro' },
    attr: { label: 'Kultur', cls: 'src-attr' },
    museum: { label: 'Museum', cls: 'src-museum' },
    shop: { label: 'Shop', cls: 'src-shop' },
    fun: { label: 'Spass', cls: 'src-fun' },
  }
  return map[source] || { label: source, cls: '' }
}

/** Normalize a gastro entry */
function normalizeGastro(p) {
  const tags = p.tags || []
  const cuisines = tags.map(t => TAG_TO_CUISINE[t]).filter(Boolean)
  return {
    id: p.place_id || '', name: p.name || '', addr: p.adresse || '',
    lat: p.koordinaten?.lat || 0, lng: p.koordinaten?.lng || 0,
    r: p.rating_durchschnitt || 0, rv: p.rating_anzahl || 0,
    gmaps: p.google_maps_url || '', web: p.website || '',
    trade: p.primary_type || p.unterkategorie || '', cuisines,
    keyword: '', subcat: '', source: 'gastro',
  }
}

/** Normalize an attraction/museum/entertainment entry */
function normalizePlace(p, source) {
  return {
    id: p.place_id || '', name: p.name || '', addr: p.adresse || '',
    lat: p.koordinaten?.lat || 0, lng: p.koordinaten?.lng || 0,
    r: p.rating_durchschnitt || 0, rv: p.rating_anzahl || 0,
    gmaps: p.google_maps_url || '', web: p.website || '',
    trade: '', cuisines: [],
    keyword: p.unterkategorie || p.gefunden_via_keyword || (source === 'museum' ? 'Allgemeines Museum' : ''),
    subcat: source === 'shop' ? (p.unterkategorie || '') : '',
    source,
  }
}

/** Load all data from public/data/ with optional progress callback */
export async function loadAllData(onProgress) {
  const cb = onProgress || (() => {})

  const gastroRes = await fetch('/data/gastro.json').then(r => r.ok ? r.json() : { orte: [] })
  cb(1)
  const attrRes = await fetch('/data/zuerich_attraktionen.json').then(r => r.ok ? r.json() : { orte: [] })
  cb(2)
  const museenRes = await fetch('/data/zuerich_museen.json').then(r => r.ok ? r.json() : { orte: [] })
  cb(3)
  const funRes = await fetch('/data/zuerich_unterhaltung.json').then(r => r.ok ? r.json() : { orte: [] })
  cb(4)
  const shopRes = await fetch('/data/zuerich_shopping.json').then(r => r.ok ? r.json() : { orte: [] })
  cb(5)

  const gastro = (gastroRes.orte || gastroRes || []).map(normalizeGastro)
  const attr = (attrRes.orte || []).map(p => normalizePlace(p, 'attr'))
  const fun = (funRes.orte || []).map(p => normalizePlace(p, 'fun'))

  const attrIds = new Set(attr.map(p => p.id))
  const museen = (museenRes.orte || []).filter(p => !attrIds.has(p.place_id)).map(p => normalizePlace(p, 'museum'))

  const shops = (shopRes.orte || []).map(p => normalizePlace(p, 'shop'))

  const all = [...gastro, ...attr, ...museen, ...fun, ...shops]

  return { gastro, attr, fun, museen, shops, all }
}

/** Format number Swiss-style */
export function fmt(n) {
  return (n || 0).toLocaleString('de-CH')
}

/** Get localStorage key for favorites by source */
export function getFavKey(source) {
  const map = { gastro: 'zh-favs', attr: 'zh-attr-favs', fun: 'zh-fun-favs', shop: 'zh-shop-favs', museum: 'zh-museum-favs' }
  return map[source] || 'zh-favs'
}

/** Get all favorite IDs from localStorage */
export function getAllFavIds() {
  const keys = ['zh-favs', 'zh-attr-favs', 'zh-fun-favs', 'zh-shop-favs', 'zh-museum-favs']
  const ids = []
  keys.forEach(k => { try { ids.push(...JSON.parse(localStorage.getItem(k) || '[]')) } catch {} })
  return ids
}

/** Toggle a favorite */
export function toggleFav(spot) {
  const key = getFavKey(spot.source)
  let arr = []
  try { arr = JSON.parse(localStorage.getItem(key) || '[]') } catch {}
  const idx = arr.indexOf(spot.id)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(spot.id)
  localStorage.setItem(key, JSON.stringify(arr))
  return idx < 0 // returns true if now favorited
}

/** Check if a spot is favorited */
export function isFav(spot) {
  const key = getFavKey(spot.source)
  try { return JSON.parse(localStorage.getItem(key) || '[]').includes(spot.id) } catch { return false }
}
