import Header from '@/components/nav/Header'
import Link from 'next/link'

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      fill="currentColor"
      d="M13.5 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H13.5L19 10L13.5 2ZM15.8 10C15.8 9.23 15.17 8.6 14.4 8.6C13.63 8.6 13 9.23 13 10C13 10.77 13.63 11.4 14.4 11.4C15.17 11.4 15.8 10.77 15.8 10Z"
    />
  </svg>
)

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <footer className="border-t border-gray-100 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">

            {/* Brand */}
            <div className="shrink-0">
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
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                Free software your nonprofit already qualifies for.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-semibold text-gray-900 mb-3">Product</p>
                <ul className="space-y-2.5 text-gray-500">
                  <li><Link href="/tools" className="hover:text-brand-600 transition-colors">Browse Tools</Link></li>
                  <li><Link href="/tools?pricing=free" className="hover:text-brand-600 transition-colors">Free Tools</Link></li>
                  <li><Link href="/tools?pricing=nonprofit_discount" className="hover:text-brand-600 transition-colors">Nonprofit Discounts</Link></li>
                  <li><Link href="/submit" className="hover:text-brand-600 transition-colors">Submit a Tool</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-3">Account</p>
                <ul className="space-y-2.5 text-gray-500">
                  <li><Link href="/signup" className="hover:text-brand-600 transition-colors">Sign up free</Link></li>
                  <li><Link href="/login" className="hover:text-brand-600 transition-colors">Sign in</Link></li>
                  <li><Link href="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-3">Company</p>
                <ul className="space-y-2.5 text-gray-500">
                  <li><Link href="/about" className="hover:text-brand-600 transition-colors">About</Link></li>
                  <li><Link href="/media-kit" className="hover:text-brand-600 transition-colors">Media Kit</Link></li>
                  <li><a href="mailto:levi@dvlmnt.com" className="hover:text-brand-600 transition-colors">Contact</a></li>
                  <li><Link href="/legal/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} Free For NonProfits. All rights reserved.</span>
            <span>Making premium tools accessible to mission-driven organizations.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
