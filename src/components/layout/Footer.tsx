import React from 'react'
import Link from 'next/link'

const LogoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      fill="currentColor"
      d="M13.5 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H13.5L19 10L13.5 2ZM15.8 10C15.8 9.23 15.17 8.6 14.4 8.6C13.63 8.6 13 9.23 13 10C13 10.77 13.63 11.4 14.4 11.4C15.17 11.4 15.8 10.77 15.8 10Z"
    />
  </svg>
)

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}>
                <LogoIcon />
              </div>
              <div className="leading-none">
                <div className="text-[8px] font-bold text-gray-400 tracking-[0.18em] uppercase">Free For</div>
                <div className="text-[13px] font-extrabold tracking-tight text-gray-900 -mt-0.5">
                  Non<span className="text-brand-600">Profits</span>
                </div>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Free software your nonprofit already qualifies for.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5">
              <li><Link href="/tools" className="text-gray-500 hover:text-brand-600 transition-colors text-sm">Browse Tools</Link></li>
              <li><Link href="/tools#categories" className="text-gray-500 hover:text-brand-600 transition-colors text-sm">Categories</Link></li>
              <li><Link href="/submit" className="text-gray-500 hover:text-brand-600 transition-colors text-sm">Submit a Tool</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-gray-500 hover:text-brand-600 transition-colors text-sm">About Us</Link></li>
              <li><Link href="/media-kit" className="text-gray-500 hover:text-brand-600 transition-colors text-sm">Media Kit</Link></li>
              <li>
                <a href="mailto:levi@dvlmnt.com" className="text-gray-500 hover:text-brand-600 transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-gray-500 hover:text-brand-600 transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-500 hover:text-brand-600 transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-400 text-sm">
            © {currentYear} Free For NonProfits. Built for mission-driven organizations.
          </p>
          <p className="text-gray-400 text-sm">
            Making premium tools accessible to nonprofits worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}

Footer.displayName = 'Footer'
