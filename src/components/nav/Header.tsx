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
    <header className="sticky top-0 z-50 bg-surface border-b border-line shadow-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-hover rounded-xl flex items-center justify-center shadow-1 shrink-0">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                {/* Price tag: body points right, hole near pointed tip */}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="white"
                  d="M13.5 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H13.5L19 10L13.5 2ZM15.8 10C15.8 9.23 15.17 8.6 14.4 8.6C13.63 8.6 13 9.23 13 10C13 10.77 13.63 11.4 14.4 11.4C15.17 11.4 15.8 10.77 15.8 10Z"
                />
              </svg>
            </div>
            <div className="hidden sm:block leading-none">
              <div className="text-[9px] font-bold text-fg-subtle tracking-[0.18em] uppercase">Free For</div>
              <div className="text-[15px] font-extrabold tracking-tight text-fg -mt-0.5">
                Non<span className="text-accent">Profits</span>
              </div>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, categories..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent bg-surface-subtle text-fg placeholder:text-fg-subtle"
              />
            </div>
          </form>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/tools" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/tools' ? 'text-accent bg-accent-subtle' : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'}`}>
              Browse Tools
            </Link>
            <Link href="/submit" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/submit' ? 'text-accent bg-accent-subtle' : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'}`}>
              Submit a Tool
            </Link>
            <Link href="/wishlist" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/wishlist' ? 'text-accent bg-accent-subtle' : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'}`}>
              Wishlist
            </Link>
            <Link href="/about" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/about' ? 'text-accent bg-accent-subtle' : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'}`}>
              About
            </Link>
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-subtle rounded-lg transition-colors duration-fast">
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-accent-fg bg-accent hover:bg-accent-hover rounded-lg transition-colors duration-fast"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/login" className="px-3 py-2 text-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-subtle rounded-lg transition-colors duration-fast">
                  Sign in
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-medium text-accent-fg bg-accent hover:bg-accent-hover rounded-lg transition-colors duration-fast">
                  Get started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-fg-muted hover:bg-surface-subtle"
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
          <div className="md:hidden py-3 border-t border-line space-y-1">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-focus bg-surface-subtle text-fg placeholder:text-fg-subtle"
                />
              </div>
            </form>
            <Link href="/tools" className="block px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg" onClick={() => setMenuOpen(false)}>Browse Tools</Link>
            <Link href="/about" className="block px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg" onClick={() => setMenuOpen(false)}>About</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link href="/signup" className="block px-3 py-2 text-sm font-medium text-accent-fg bg-accent rounded-lg text-center" onClick={() => setMenuOpen(false)}>Get started free</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
