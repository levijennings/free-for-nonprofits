'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from './actions'

/**
 * The interactive shell of the header. Deliberately contains no Supabase
 * import: auth state arrives as a boolean prop resolved on the server, and
 * sign-out goes through a server action. That keeps `@supabase/supabase-js`
 * (RealtimeClient, postgrest, storage) out of the shared client chunk that
 * every marketing page loads.
 */

/** Discover -> Qualify -> Claim. Three links, in product order. */
const NAV = [
  { href: '/tools', label: 'Browse Tools' },
  { href: '/eligibility', label: 'Check eligibility' },
  { href: '/about', label: 'About' },
] as const

const SearchIcon = () => (
  <svg
    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

export default function HeaderNav({ signedIn }: { signedIn: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  // Two search inputs render at once (desktop + mobile). Unique, stable ids so
  // each <label htmlFor> binds to its own field rather than to the first match.
  const idPrefix = useId()
  const desktopSearchId = `${idPrefix}-search-desktop`
  const mobileSearchId = `${idPrefix}-search-mobile`
  const mobileMenuId = `${idPrefix}-mobile-menu`

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tools?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-line shadow-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-hover rounded-xl flex items-center justify-center shadow-1 shrink-0">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
          <form onSubmit={handleSearch} role="search" className="flex-1 max-w-xl hidden md:block">
            <label htmlFor={desktopSearchId} className="sr-only">
              Search tools and categories
            </label>
            <div className="relative">
              <SearchIcon />
              <input
                id={desktopSearchId}
                name="q"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, categories..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent bg-surface-subtle text-fg placeholder:text-fg-subtle"
              />
            </div>
          </form>

          {/* Nav links */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    active ? 'text-accent bg-accent-subtle' : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
            {signedIn ? (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-subtle rounded-lg transition-colors duration-fast">
                  Dashboard
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-accent-fg bg-accent hover:bg-accent-hover rounded-lg transition-colors duration-fast"
                  >
                    Sign out
                  </button>
                </form>
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

          {/* Mobile menu toggle — the only navigation that exists on phones, so
              it needs a name, a state and a target a screen reader can follow. */}
          <button
            type="button"
            aria-label="Main menu"
            aria-expanded={menuOpen}
            aria-controls={mobileMenuId}
            className="md:hidden p-2 rounded-lg text-fg-muted hover:bg-surface-subtle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu. Always in the DOM so `aria-controls` resolves; `hidden`
            keeps it out of the accessibility tree while collapsed. */}
        <div id={mobileMenuId} hidden={!menuOpen} className="md:hidden py-3 border-t border-line space-y-1">
          <form onSubmit={handleSearch} role="search" className="mb-3">
            <label htmlFor={mobileSearchId} className="sr-only">
              Search tools and categories
            </label>
            <div className="relative">
              <SearchIcon />
              <input
                id={mobileSearchId}
                name="q"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-focus bg-surface-subtle text-fg placeholder:text-fg-subtle"
              />
            </div>
          </form>
          <nav aria-label="Mobile" className="space-y-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? 'page' : undefined}
                className="block px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link href="/submit" className="block px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg" onClick={() => setMenuOpen(false)}>Submit a Tool</Link>
            <Link href="/wishlist" className="block px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg" onClick={() => setMenuOpen(false)}>Wishlist</Link>
            {signedIn ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <form action={signOut}>
                  <button type="submit" className="w-full text-left px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg">Sign out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-subtle rounded-lg" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link href="/signup" className="block px-3 py-2 text-sm font-medium text-accent-fg bg-accent rounded-lg text-center" onClick={() => setMenuOpen(false)}>Get started free</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
