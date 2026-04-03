import React from 'react';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { MarkdownRenderer } from '@/components/legal/MarkdownRenderer';
import privacyPolicy from '@/content/legal/privacy-policy.md';

export const metadata = {
  title: 'Privacy Policy | Legal',
  description: 'Learn how we collect, use, and protect your personal information.',
  robots: 'noindex, nofollow',
};

const sections = [
  { id: 'collection', title: '1. Information We Collect', level: 'h2' as const },
  { id: 'usage', title: '2. How We Use Your Information', level: 'h2' as const },
  { id: 'sharing', title: '3. How We Share Your Information', level: 'h2' as const },
  { id: 'storage', title: '4. Data Storage and Security', level: 'h2' as const },
  { id: 'rights', title: '5. Your Privacy Rights', level: 'h2' as const },
  { id: 'children', title: '6. Children\'s Privacy (COPPA)', level: 'h2' as const },
  { id: 'cookies', title: '7. Cookies and Tracking Technologies', level: 'h2' as const },
  { id: 'transfers', title: '8. International Data Transfers', level: 'h2' as const },
  { id: 'contact', title: '9. Contact Information', level: 'h2' as const },
  { id: 'changes', title: '10. Changes to This Policy', level: 'h2' as const },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="April 2026"
      sections={sections}
    >
      <MarkdownRenderer content={privacyPolicy} />
    </LegalPageLayout>
  );
}
