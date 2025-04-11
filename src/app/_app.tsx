import { useState, useEffect } from 'react'
    import { useRouter } from 'next/navigation'
    import { usePathname } from 'next/navigation'

    export default function MyApp({ Component, pageProps }: AppProps) {
      const router = useRouter()
      const pathname = usePathname()

      // Check if user exists on first load
      useEffect(() => {
        const isFirstLoad = window.localStorage.getItem('isFirstLoad') || 'true'
        if (isFirstLoad === 'true') {
          router.push('/auth/register')
          window.localStorage.setItem('isFirstLoad', 'false')
        }
      }, [router])

      return (
        <div className="min-h-screen bg-gray-50">
          <Component {...pageProps} />
        </div>
      )
    }
