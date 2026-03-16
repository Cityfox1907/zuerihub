'use client'

import { createContext, useContext, useCallback, useRef } from 'react'

const PhotoContext = createContext(null)

// In-memory cache: placeId → { urls: string[], loading: boolean, error: boolean }
const cache = new Map()
// Pending promises to deduplicate concurrent requests
const pending = new Map()

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY
const STORAGE_KEY = 'zh-photo-cache'

function getMediaUrl(photoName) {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${API_KEY}`
}

// Restore sessionStorage cache into memory on load
function restoreFromStorage() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const entries = JSON.parse(stored)
      for (const [id, urls] of entries) {
        if (!cache.has(id)) {
          cache.set(id, { urls, loading: false, error: false })
        }
      }
    }
  } catch {}
}

function saveToStorage() {
  try {
    const entries = []
    for (const [id, val] of cache) {
      if (!val.loading && !val.error && val.urls.length > 0) {
        entries.push([id, val.urls])
      }
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {}
}

let storageRestored = false

async function fetchPhotos(placeId) {
  if (!API_KEY || !placeId) return []

  // Restore from sessionStorage on first call
  if (!storageRestored && typeof sessionStorage !== 'undefined') {
    storageRestored = true
    restoreFromStorage()
  }

  // Check cache
  const cached = cache.get(placeId)
  if (cached && !cached.loading) return cached.urls

  // Deduplicate
  if (pending.has(placeId)) return pending.get(placeId)

  const promise = (async () => {
    try {
      cache.set(placeId, { urls: [], loading: true, error: false })

      const res = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${API_KEY}`
      )
      if (!res.ok) {
        cache.set(placeId, { urls: [], loading: false, error: true })
        return []
      }

      const data = await res.json()
      const photos = (data.photos || []).slice(0, 3)
      const urls = photos.map(p => getMediaUrl(p.name))

      cache.set(placeId, { urls, loading: false, error: false })
      saveToStorage()
      return urls
    } catch {
      cache.set(placeId, { urls: [], loading: false, error: true })
      return []
    } finally {
      pending.delete(placeId)
    }
  })()

  pending.set(placeId, promise)
  return promise
}

export function PhotoProvider({ children }) {
  const getPhotos = useCallback(async (placeId) => {
    const cached = cache.get(placeId)
    if (cached && !cached.loading && cached.urls.length > 0) return cached.urls
    return fetchPhotos(placeId)
  }, [])

  const getCached = useCallback((placeId) => {
    // Also check sessionStorage on first access
    if (!storageRestored && typeof sessionStorage !== 'undefined') {
      storageRestored = true
      restoreFromStorage()
    }
    const cached = cache.get(placeId)
    if (cached && !cached.loading) return cached.urls
    return null
  }, [])

  return (
    <PhotoContext.Provider value={{ getPhotos, getCached }}>
      {children}
    </PhotoContext.Provider>
  )
}

export function usePhotos() {
  return useContext(PhotoContext)
}
