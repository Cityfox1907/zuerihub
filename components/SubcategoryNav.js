'use client'

import { useMemo } from 'react'
import { getSpotTag } from '@/lib/data'

/**
 * Subcategory navigation for category pages.
 * Supports main categories (large tiles) and secondary tags (small chips).
 * Multi-select: multiple categories can be active simultaneously.
 *
 * Props:
 * - spots: array of normalized spots
 * - mainCategories: [{ emoji, label }] - primary category tiles
 * - tagCategories: [{ emoji, label }] - secondary tag chips (optional)
 * - activeFilters: string[] - currently selected filter labels
 * - onFilter: (filters: string[]) => void
 * - tagLabel: string - label for the tags row (optional)
 */
export default function SubcategoryNav({ spots, mainCategories, tagCategories, activeFilters = [], onFilter, tagLabel }) {
  // Count spots per category
  const counts = useMemo(() => {
    const c = {}
    spots.forEach(p => {
      const tag = getSpotTag(p)
      if (tag) c[tag] = (c[tag] || 0) + 1
      // Also count by trade for gastro
      if (p.trade) c[p.trade] = (c[p.trade] || 0) + 1
      // Count by subcat for shops
      if (p.subcat) c[p.subcat] = (c[p.subcat] || 0) + 1
      // Count by keyword
      if (p.keyword) c[p.keyword] = (c[p.keyword] || 0) + 1
      // Count cuisines
      if (p.cuisines) {
        p.cuisines.forEach(cuisine => {
          // Map cuisine keys to labels
          const CUISINE_LABELS = {
            vegan_restaurant: 'Vegan', vegetarian_restaurant: 'Vegetarisch',
            pizza_restaurant: 'Pizzeria', sushi_restaurant: 'Sushi',
            hamburger_restaurant: 'Burger', kebab_shop: 'Döner',
            italian_restaurant: 'Italienisch', japanese_restaurant: 'Japanisch',
            thai_restaurant: 'Thai', indian_restaurant: 'Indisch',
            chinese_restaurant: 'Chinesisch', swiss_restaurant: 'Schweizer',
            turkish_restaurant: 'Türkisch', cocktail_bar: 'Cocktailbar',
            wine_bar: 'Weinbar', pub: 'Pub', coffee_shop: 'Coffee Shop',
          }
          const label = CUISINE_LABELS[cuisine]
          if (label) c[label] = (c[label] || 0) + 1
        })
      }
    })
    return c
  }, [spots])

  const toggle = (label) => {
    if (activeFilters.includes(label)) {
      onFilter(activeFilters.filter(f => f !== label))
    } else {
      onFilter([...activeFilters, label])
    }
  }

  return (
    <nav style={{ marginBottom: '1.5rem' }}>
      {/* Main categories - large tiles */}
      <div className="subcat-main-row" style={{
        display: 'flex', gap: '.6rem', overflowX: 'auto', scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '.5rem',
      }}>
        {mainCategories.map(({ emoji, label }) => {
          const isActive = activeFilters.includes(label)
          const count = counts[label] || 0
          return (
            <button
              key={label}
              onClick={() => toggle(label)}
              className="subcat-main-tile"
              style={{
                flex: '0 0 auto', scrollSnapAlign: 'start',
                display: 'flex', alignItems: 'center', gap: '.5rem',
                padding: '.65rem 1rem', borderRadius: 14,
                border: isActive ? '2px solid var(--primary)' : '1.5px solid var(--border-light)',
                background: isActive ? 'var(--primary)' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--text)',
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontWeight: 700, fontSize: '.88rem',
                boxShadow: isActive ? '0 4px 12px rgba(15,71,175,.25)' : 'var(--shadow-xs)',
                transition: 'all .2s',
                minHeight: 48,
              }}
            >
              <span style={{ fontSize: '1.15rem' }}>{emoji}</span>
              <span>{label}</span>
              {count > 0 && (
                <span style={{
                  fontSize: '.68rem', fontWeight: 600,
                  opacity: isActive ? .85 : .5,
                  marginLeft: '.1rem',
                }}>({count})</span>
              )}
              {isActive && <span style={{ marginLeft: '.15rem', fontSize: '.75rem' }}>✓</span>}
            </button>
          )
        })}
      </div>

      {/* Secondary tags - small chips */}
      {tagCategories && tagCategories.length > 0 && (
        <div style={{ marginTop: '.5rem' }}>
          {tagLabel && (
            <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text3)', marginBottom: '.35rem' }}>{tagLabel}</div>
          )}
          <div className="subcat-tag-row" style={{
            display: 'flex', gap: '.35rem', flexWrap: 'wrap',
          }}>
            {tagCategories.map(({ emoji, label }) => {
              const isActive = activeFilters.includes(label)
              const count = counts[label] || 0
              return (
                <button
                  key={label}
                  onClick={() => toggle(label)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                    padding: '.3rem .65rem', borderRadius: 20,
                    border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                    background: isActive ? 'var(--primary-light)' : 'var(--surface2)',
                    color: isActive ? 'var(--primary)' : 'var(--text2)',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    fontWeight: isActive ? 700 : 500, fontSize: '.76rem',
                    transition: 'all .2s',
                    minHeight: 32,
                  }}
                >
                  <span style={{ fontSize: '.85rem' }}>{emoji}</span>
                  <span>{label}</span>
                  {count > 0 && (
                    <span style={{ fontSize: '.62rem', opacity: .55 }}>({count})</span>
                  )}
                  {isActive && <span style={{ fontSize: '.65rem', color: 'var(--primary)' }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
