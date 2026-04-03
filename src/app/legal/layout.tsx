import React from 'react';

export const metadata = {
  title: 'Legal - Free For NonProfits',
  description: 'Legal documents including Terms of Service, Privacy Policy, and more.',
  robots: 'noindex, nofollow',
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-6 overflow-x-auto">
            <a href="/legal/terms" className="text-sm font-medium hover:text-blue-600 whitespace-nowrap">Terms of Service</a>
            <a href="/legal/privacy" className="text-sm font-medium hover:text-blue-600 whitespace-nowrap">Privacy Policy</a>
            <a href="/legal/cookies" className="text-sm font-medium hover:text-blue-600 whitespace-nowrap">Cookie Policy</a>
            <a href="/legal/acceptable-use" className="text-sm font-medium hover:text-blue-600 whitespace-nowrap">Acceptable Use</a>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
