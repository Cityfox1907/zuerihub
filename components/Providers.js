'use client'

import { PhotoProvider } from '@/lib/photos'

export default function Providers({ children }) {
  return (
    <PhotoProvider>
      {children}
    </PhotoProvider>
  )
}
