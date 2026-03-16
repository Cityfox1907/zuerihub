'use client'

import { createContext, useContext, useCallback, useRef } from 'react'

const PhotoContext = createContext(null)

// In-memory cache: placeId → { urls: string[], loading: boolean, error: boolean }
const cache = new Map()
// Pending promises to deduplicate concurrent requests
const pending = new Map()

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY

function getMediaUrl(photoName) {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${API_KEY}`
}

async function fetchPhotos(placeId) {
  if (!API_KEY || !placeId) return []

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
  const listeners = useRef(new Map())

  const getPhotos = useCallback(async (placeId) => {
    const cached = cache.get(placeId)
    if (cached && !cached.loading && cached.urls.length > 0) return cached.urls
    return fetchPhotos(placeId)
  }, [])

  const getCached = useCallback((placeId) => {
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
