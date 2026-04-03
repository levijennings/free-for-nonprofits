export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex gap-6 overflow-x-auto">
          <a href="/legal/terms" className="text-sm font-medium hover:text-blue-600 whitespace-nowrap">Terms</a>
          <a href="/legal/privacy" className="text-sm font-medium hover:text-blue-600 whitespace-nowrap">Privacy</a>
          <a href="/legal/cookies" className="text-sm font-medium hover:text-blue-600 whitespace-nowrap">Cookies</a>
          <a href="/legal/acceptable-use" className="text-sm font-medium hover:text-blue-600 whitespace-nowrap">Acceptable Use</a>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
