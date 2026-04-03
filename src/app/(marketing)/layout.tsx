import Header from '@/components/nav/Header'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">FF</span>
                </div>
                <span className="font-bold text-gray-900">Free For NonProfits</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">
                The directory of free and discounted software for mission-driven organizations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-semibold text-gray-900 mb-3">Product</p>
                <ul className="space-y-2 text-gray-500">
                  <li><a href="/tools" className="hover:text-gray-900 transition-colors">Browse Tools</a></li>
                  <li><a href="/tools?pricing=free" className="hover:text-gray-900 transition-colors">Free Tools</a></li>
                  <li><a href="/tools?pricing=nonprofit_discount" className="hover:text-gray-900 transition-colors">Nonprofit Discounts</a></li>
                  <li><a href="/about" className="hover:text-gray-900 transition-colors">About</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-3">Account</p>
                <ul className="space-y-2 text-gray-500">
                  <li><a href="/signup" className="hover:text-gray-900 transition-colors">Sign up free</a></li>
                  <li><a href="/login" className="hover:text-gray-900 transition-colors">Sign in</a></li>
                  <li><a href="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</a></li>
                  <li><a href="/legal/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Free For NonProfits. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
