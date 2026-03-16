'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePhotos } from '@/lib/photos'

/**
 * Lazy-loaded photo carousel with swipe support.
 * Only fetches photos when the component is visible in viewport.
 *
 * @param {string} placeId - Google Place ID
 * @param {number} height - Carousel height in px
 * @param {string} fallbackEmoji - Emoji to show as placeholder
 * @param {boolean} large - If true, renders larger format for modal
 */
export default function PhotoCarousel({ placeId, height = 80, fallbackEmoji = '📍', large = false, single = false }) {
  const photos = usePhotos()
  const [urls, setUrls] = useState(null) // null = not loaded, [] = no photos
  const [current, setCurrent] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [imgLoaded, setImgLoaded] = useState({})
  const containerRef = useRef(null)
  const touchStart = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!photos || !placeId) return
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [placeId, photos])

  // Fetch photos when visible
  useEffect(() => {
    if (!isVisible || !photos || !placeId) return

    // Check cache first
    const cached = photos.getCached(placeId)
    if (cached !== null) {
      setUrls(cached)
      return
    }

    let cancelled = false
    photos.getPhotos(placeId).then(result => {
      if (!cancelled) setUrls(result)
    })
    return () => { cancelled = true }
  }, [isVisible, placeId, photos])

  // Touch handlers for swipe
  const onTouchStart = useCallback((e) => {
    touchStart.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (touchStart.current === null || !urls || urls.length <= 1) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrent(c => Math.min(c + 1, urls.length - 1))
      else setCurrent(c => Math.max(c - 1, 0))
    }
    touchStart.current = null
  }, [urls])

  // Click navigation (desktop)
  const goNext = useCallback((e) => {
    e.stopPropagation()
    if (urls) setCurrent(c => Math.min(c + 1, urls.length - 1))
  }, [urls])

  const goPrev = useCallback((e) => {
    e.stopPropagation()
    if (urls) setCurrent(c => Math.max(c - 1, 0))
  }, [urls])

  const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23E8EEFB' rx='12'/%3E%3Ctext x='40' y='44' text-anchor='middle' dominant-baseline='middle' font-family='system-ui,sans-serif' font-size='28'%3E${encodeURIComponent(fallbackEmoji)}%3C/text%3E%3C/svg%3E`

  const hasPhotosRaw = urls && urls.length > 0
  const displayUrls = hasPhotosRaw && single ? [urls[0]] : urls
  const showFallback = urls === null || (urls && urls.length === 0)
  const hasPhotos = displayUrls && displayUrls.length > 0

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height, overflow: 'hidden', background: 'var(--surface2)' }}
      onTouchStart={hasPhotos && !single ? onTouchStart : undefined}
      onTouchEnd={hasPhotos && !single ? onTouchEnd : undefined}
    >
      {/* Loading shimmer */}
      {urls === null && isVisible && (
        <div className="skeleton" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
      )}

      {/* Fallback emoji */}
      {showFallback && (
        <img src={fallbackSvg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}

      {/* Photos */}
      {hasPhotos && (
        <>
          <div style={{
            display: 'flex', transition: 'transform .3s ease',
            transform: `translateX(-${current * 100}%)`,
            height: '100%',
          }}>
            {displayUrls.map((url, i) => (
              <div key={i} style={{ flex: '0 0 100%', height: '100%', position: 'relative' }}>
                {!imgLoaded[i] && (
                  <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
                )}
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  onLoad={() => setImgLoaded(prev => ({ ...prev, [i]: true }))}
                  onError={() => setImgLoaded(prev => ({ ...prev, [i]: true }))}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    opacity: imgLoaded[i] ? 1 : 0, transition: 'opacity .3s',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Navigation arrows (desktop, large only) */}
          {displayUrls.length > 1 && large && !single && (
            <>
              {current > 0 && (
                <button onClick={goPrev} style={{
                  position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                  width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,.45)',
                  color: '#fff', border: 'none', cursor: 'pointer', fontSize: '.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>‹</button>
              )}
              {current < displayUrls.length - 1 && (
                <button onClick={goNext} style={{
                  position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                  width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,.45)',
                  color: '#fff', border: 'none', cursor: 'pointer', fontSize: '.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>›</button>
              )}
            </>
          )}

          {/* Dot indicators */}
          {displayUrls.length > 1 && !single && (
            <div style={{
              position: 'absolute', bottom: large ? 8 : 4, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: large ? 5 : 3,
            }}>
              {displayUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                  style={{
                    width: large ? 8 : 5, height: large ? 8 : 5, borderRadius: '50%',
                    background: i === current ? '#fff' : 'rgba(255,255,255,.45)',
                    border: 'none', padding: 0, cursor: 'pointer',
                    transition: 'background .2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
