export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Free tools for <span className="text-brand-500">nonprofits</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl">
          Discover, compare, and review the best free and discounted software tools for your nonprofit organization.
        </p>
        <div className="mt-10 flex items-center gap-x-6">
          <a href="/tools" className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors">
            Browse Tools
          </a>
          <a href="/about" className="text-sm font-semibold leading-6 text-gray-900">
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </main>
  );
}
