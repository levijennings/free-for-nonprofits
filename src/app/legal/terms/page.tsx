import React from 'react';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { MarkdownRenderer } from '@/components/legal/MarkdownRenderer';
import termsOfService from '@/content/legal/terms-of-service.md';

export const metadata = {
  title: 'Terms of Service | Legal',
  description: 'Read our Terms of Service to understand the rules and conditions for using our services.',
  robots: 'noindex, nofollow',
};

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms and Eligibility', level: 'h2' as const },
  { id: 'account', title: '2. Account Responsibilities', level: 'h2' as const },
  { id: 'usage', title: '3. Product-Specific Usage Terms', level: 'h2' as const },
  { id: 'ip', title: '4. Intellectual Property Rights', level: 'h2' as const },
  { id: 'liability', title: '5. Limitation of Liability', level: 'h2' as const },
  { id: 'indemnification', title: '6. Indemnification', level: 'h2' as const },
  { id: 'dispute', title: '7. Dispute Resolution and Governing Law', level: 'h2' as const },
  { id: 'termination', title: '8. Termination and Modification', level: 'h2' as const },
  { id: 'misc', title: '9. Miscellaneous', level: 'h2' as const },
  { id: 'contact', title: '10. Contact Information', level: 'h2' as const },
];

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="April 2026"
      sections={sections}
    >
      <MarkdownRenderer content={termsOfService} />
    </LegalPageLayout>
  );
}
