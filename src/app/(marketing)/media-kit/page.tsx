'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/nav/Header'
import { Footer } from '@/components/layout/Footer'

const LogoIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      fill="currentColor"
      d="M13.5 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H13.5L19 10L13.5 2ZM15.8 10C15.8 9.23 15.17 8.6 14.4 8.6C13.63 8.6 13 9.23 13 10C13 10.77 13.63 11.4 14.4 11.4C15.17 11.4 15.8 10.77 15.8 10Z"
    />
  </svg>
)

const brandColors = [
  { name: 'Brand Green', hex: '#10B981', var: 'brand.500', bg: 'bg-[#10B981]', use: 'Primary — CTAs, links, highlights' },
  { name: 'Brand Dark', hex: '#047857', var: 'brand.700', bg: 'bg-[#047857]', use: 'Hover states, icon gradients' },
  { name: 'Brand Deep', hex: '#064E3B', var: 'brand.900', bg: 'bg-[#064E3B]', use: 'Hero backgrounds, deep accents' },
  { name: 'Brand Light', hex: '#D1FAE5', var: 'brand.100', bg: 'bg-[#D1FAE5]', use: 'Subtle backgrounds, badges' },
  { name: 'Gray 900', hex: '#111827', var: 'gray.900', bg: 'bg-gray-900', use: 'Primary text, headings' },
  { name: 'Gray 500', hex: '#6B7280', var: 'gray.500', bg: 'bg-gray-500', use: 'Secondary text, captions' },
  { name: 'Gray 100', hex: '#F3F4F6', var: 'gray.100', bg: 'bg-gray-100', use: 'Page backgrounds, card borders' },
  { name: 'White', hex: '#FFFFFF', var: 'white', bg: 'bg-white border border-gray-200', use: 'Card backgrounds, overlays' },
]

const logoDownloads = [
  {
    label: 'Full Logo — Color',
    description: 'Primary logo for light backgrounds',
    file: '/brand/logo-full-green.svg',
    bg: 'bg-gray-50',
    preview: (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#10B981,#047857)' }}>
          <LogoIcon className="w-[22px] h-[22px] text-white" />
        </div>
        <div className="leading-none">
          <div className="text-[9px] font-bold text-gray-400 tracking-[0.18em] uppercase">Free For</div>
          <div className="text-[15px] font-extrabold tracking-tight text-gray-900 -mt-0.5">Non<span className="text-brand-600">Profits</span></div>
        </div>
      </div>
    ),
  },
  {
    label: 'Full Logo — White',
    description: 'For dark or colored backgrounds',
    file: '/brand/logo-full-white.svg',
    bg: 'bg-gray-900',
    preview: (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <LogoIcon className="w-[22px] h-[22px] text-white" />
        </div>
        <div className="leading-none">
          <div className="text-[9px] font-bold text-white/50 tracking-[0.18em] uppercase">Free For</div>
          <div className="text-[15px] font-extrabold tracking-tight text-white -mt-0.5">NonProfits</div>
        </div>
      </div>
    ),
  },
  {
    label: 'Icon — Color',
    description: 'Square icon for avatars and favicons',
    file: '/brand/logo-icon-green.svg',
    bg: 'bg-gray-50',
    preview: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10B981,#047857)' }}>
        <LogoIcon className="w-7 h-7 text-white" />
      </div>
    ),
  },
  {
    label: 'Icon — Dark',
    description: 'Dark version for light contexts',
    file: '/brand/logo-icon-dark.svg',
    bg: 'bg-gray-50',
    preview: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-900">
        <LogoIcon className="w-7 h-7 text-white" />
      </div>
    ),
  },
  {
    label: 'Icon — White',
    description: 'Reversed for colored backgrounds',
    file: '/brand/logo-icon-white.svg',
    bg: 'bg-brand-600',
    preview: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
        <LogoIcon className="w-7 h-7 text-white" />
      </div>
    ),
  },
]

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors"
    >
      {copied ? '✓ copied' : (label ?? value)}
    </button>
  )
}

export default function MediaKitPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">

        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 text-white py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span>🎨</span> Media Kit
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Brand assets &amp; guidelines
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Everything you need to write about, link to, or promote Free For NonProfits. Please follow these guidelines to keep our brand consistent.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <a
                href="mailto:levi@dvlmnt.com"
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Contact for partnerships
              </a>
              <a
                href="/brand/logo-full-green.svg"
                download
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                ↓ Download all assets
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">

          {/* About the brand */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">About Free For NonProfits</h2>
            <p className="text-gray-500 text-sm mb-6">For use in articles, partner pages, and press mentions.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Short description</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Free For NonProfits is a curated directory of free and discounted software tools available to registered nonprofits — most of which organizations never find out about.
                </p>
                <CopyButton value="Free For NonProfits is a curated directory of free and discounted software tools available to registered nonprofits — most of which organizations never find out about." label="Copy text" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">One-liner</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Free software your nonprofit already qualifies for.
                </p>
                <div className="mt-3">
                  <CopyButton value="Free software your nonprofit already qualifies for." label="Copy text" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 sm:col-span-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Long description</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Most nonprofits leave over $50,000 per year in free software unclaimed. Google gives nonprofits $10,000/month in free ads. Salesforce provides 10 free licenses. Zendesk, Miro, Loom, Canva, and 50+ others offer free or deeply discounted plans — and most nonprofit staff never find out. Free For NonProfits is a community-verified directory that surfaces these deals and helps nonprofit teams build a full software stack without the budget.
                </p>
                <div className="mt-3">
                  <CopyButton value="Most nonprofits leave over $50,000 per year in free software unclaimed. Google gives nonprofits $10,000/month in free ads. Salesforce provides 10 free licenses. Zendesk, Miro, Loom, Canva, and 50+ others offer free or deeply discounted plans — and most nonprofit staff never find out. Free For NonProfits is a community-verified directory that surfaces these deals and helps nonprofit teams build a full software stack without the budget." label="Copy text" />
                </div>
              </div>
            </div>
          </section>

          {/* Logo downloads */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Logo</h2>
            <p className="text-gray-500 text-sm mb-6">Download SVG files for any use. Do not modify the logo colors or proportions.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {logoDownloads.map((item) => (
                <div key={item.label} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className={`${item.bg} h-28 flex items-center justify-center`}>
                    {item.preview}
                  </div>
                  <div className="p-4 bg-white flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                    </div>
                    <a
                      href={item.file}
                      download
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 border border-brand-200 hover:border-brand-400 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      ↓ SVG
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Logo usage rules */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                <p className="text-sm font-semibold text-green-800 mb-3">✓ Do</p>
                <ul className="space-y-1.5 text-sm text-green-700">
                  <li>Use the provided SVG files as-is</li>
                  <li>Use the color logo on white or light gray backgrounds</li>
                  <li>Use the white logo on dark or brand-colored backgrounds</li>
                  <li>Maintain clear space equal to the icon height on all sides</li>
                  <li>Link the logo to free-for-nonprofits.vercel.app</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <p className="text-sm font-semibold text-red-800 mb-3">✗ Don't</p>
                <ul className="space-y-1.5 text-sm text-red-700">
                  <li>Recolor or modify the logo in any way</li>
                  <li>Stretch or distort the proportions</li>
                  <li>Place the color logo on busy or dark backgrounds</li>
                  <li>Add drop shadows, outlines, or effects</li>
                  <li>Use the logo to imply endorsement without permission</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Brand colors */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand colors</h2>
            <p className="text-gray-500 text-sm mb-6">Click any hex value to copy it.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {brandColors.map((color) => (
                <div key={color.hex} className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className={`${color.bg} h-16`} />
                  <div className="p-3 bg-white">
                    <p className="text-xs font-semibold text-gray-900">{color.name}</p>
                    <CopyButton value={color.hex} />
                    <p className="text-[10px] text-gray-400 mt-1">{color.use}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Typography</h2>
            <p className="text-gray-500 text-sm mb-6">
              Our typeface is <strong>Plus Jakarta Sans</strong> by Tokotype — available free on{' '}
              <a href="https://fonts.google.com/specimen/Plus+Jakarta+Sans" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Google Fonts</a>.
            </p>
            <div className="space-y-4">
              {[
                { label: 'Display', weight: 'font-extrabold', size: 'text-5xl', sample: 'Free for nonprofits.' },
                { label: 'Heading 1', weight: 'font-bold', size: 'text-3xl', sample: 'Discover free software' },
                { label: 'Heading 2', weight: 'font-semibold', size: 'text-xl', sample: 'Save your first tool today' },
                { label: 'Body', weight: 'font-normal', size: 'text-base', sample: 'Most nonprofits leave $50,000+/year in free software unclaimed. Browse our directory to find tools your organization already qualifies for.' },
                { label: 'Small / Caption', weight: 'font-medium', size: 'text-sm', sample: 'Free · Verified · Nonprofit-approved' },
              ].map((t) => (
                <div key={t.label} className="bg-gray-50 rounded-2xl p-6 flex items-start gap-6">
                  <div className="shrink-0 w-28">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t.label}</p>
                  </div>
                  <p className={`${t.size} ${t.weight} text-gray-900 leading-tight flex-1`}>{t.sample}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Boilerplate & links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Linking to us</h2>
            <p className="text-gray-500 text-sm mb-6">Use these when referencing Free For NonProfits in articles, blog posts, or partner pages.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Website', value: 'https://free-for-nonprofits.vercel.app' },
                { label: 'Preferred name (full)', value: 'Free For NonProfits' },
                { label: 'Preferred name (short)', value: 'FreeForNonprofits' },
                { label: 'Partnership / press contact', value: 'levi@dvlmnt.com' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-mono text-gray-800">{item.value}</p>
                  </div>
                  <CopyButton value={item.value} label="Copy" />
                </div>
              ))}
            </div>
          </section>

          {/* Partner CTA */}
          <section className="bg-gradient-to-br from-brand-600 to-teal-700 rounded-3xl p-10 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-3">Want to be a partner?</h2>
              <p className="text-white/75 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                We partner with software companies, nonprofit networks, and mission-driven organizations. Reach out to discuss co-promotion, featured listings, or newsletter collaborations.
              </p>
              <a
                href="mailto:levi@dvlmnt.com"
                className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow"
              >
                Get in touch →
              </a>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
