import React from 'react';
import { LegalNav } from '@/components/legal/LegalNav';
import { CookieConsent } from '@/components/legal/CookieConsent';

export const metadata = {
  title: 'Legal - DVLMNT',
  description: 'Legal documents including Terms of Service, Privacy Policy, and more.',
  robots: 'noindex, nofollow', // Legal pages should not be indexed
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <LegalNav />
      <main>{children}</main>
      <CookieConsent />
    </div>
  );
}
