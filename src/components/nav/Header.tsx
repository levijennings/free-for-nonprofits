'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tools?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FF</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">Free For NonProfits</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, categories..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </form>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/tools" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/tools' ? 'text-brand-600 bg-brand-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              Browse Tools
            </Link>
            <Link href="/about" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/about' ? 'text-brand-600 bg-brand-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              About
            </Link>
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-700 rounded-lg transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/login" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  Sign in
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-700 rounded-lg transition-colors">
                  Get started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </form>
            <Link href="/tools" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Browse Tools</Link>
            <Link href="/about" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>About</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link href="/signup" className="block px-3 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg text-center" onClick={() => setMenuOpen(false)}>Get started free</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
