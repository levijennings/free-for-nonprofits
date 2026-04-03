import React from 'react';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { MarkdownRenderer } from '@/components/legal/MarkdownRenderer';
import acceptableUsePolicy from '@/content/legal/acceptable-use-policy.md';

export const metadata = {
  title: 'Acceptable Use Policy | Legal',
  description: 'Understand the rules and standards for using our services and community.',
  robots: 'noindex, nofollow',
};

const sections = [
  { id: 'prohibited', title: '1. Prohibited Activities', level: 'h2' as const },
  { id: 'product', title: '2. Product-Specific Rules', level: 'h2' as const },
  { id: 'standards', title: '3. Content Standards', level: 'h2' as const },
  { id: 'enforcement', title: '4. Enforcement and Consequences', level: 'h2' as const },
  { id: 'reporting', title: '5. Reporting Violations', level: 'h2' as const },
  { id: 'appeals', title: '6. Appeals', level: 'h2' as const },
  { id: 'changes', title: '7. Changes to This Policy', level: 'h2' as const },
  { id: 'misc', title: '8. Miscellaneous', level: 'h2' as const },
  { id: 'contact', title: '9. Contact Information', level: 'h2' as const },
];

export default function AcceptableUsePolicyPage() {
  return (
    <LegalPageLayout
      title="Acceptable Use Policy"
      lastUpdated="April 2026"
      sections={sections}
    >
      <MarkdownRenderer content={acceptableUsePolicy} />
    </LegalPageLayout>
  );
}
