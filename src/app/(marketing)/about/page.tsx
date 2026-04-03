export const metadata = {
  title: 'About | Free For NonProfits',
  description: 'Learn about Free For NonProfits — our mission to help nonprofits find the best free software tools.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Free For NonProfits</h1>

        <p className="text-lg text-gray-600 mb-6">
          Nonprofits do important work — and they shouldn't have to overpay for software to do it.
          Free For NonProfits is a directory of the best free and discounted tools available to
          nonprofit organizations, curated and reviewed by people who work in the sector.
        </p>

        <p className="text-lg text-gray-600 mb-6">
          We surface free tiers, nonprofit pricing programs, and special discounts from hundreds of
          software vendors — so your team can spend less time searching and more time on your mission.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">What we cover</h2>
        <ul className="space-y-2 text-gray-600">
          <li>✅ CRM and donor management platforms</li>
          <li>✅ Email marketing and communication tools</li>
          <li>✅ Project management and team collaboration</li>
          <li>✅ Accounting and financial management</li>
          <li>✅ Design, website building, and content tools</li>
          <li>✅ Volunteer management systems</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">Submit a tool</h2>
        <p className="text-gray-600 mb-6">
          Know a tool that should be listed? We welcome submissions from nonprofit staff, volunteers,
          and software vendors. All submissions are reviewed before being listed.
        </p>

        <a
          href="/tools"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Browse all tools →
        </a>
      </div>
    </main>
  )
}
