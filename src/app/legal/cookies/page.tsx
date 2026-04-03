import React from 'react';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { MarkdownRenderer } from '@/components/legal/MarkdownRenderer';
import cookiePolicy from '@/content/legal/cookie-policy.md';

export const metadata = {
  title: 'Cookie Policy | Legal',
  description: 'Information about how we use cookies and how to manage your cookie preferences.',
  robots: 'noindex, nofollow',
};

const sections = [
  { id: 'what', title: '1. What Are Cookies?', level: 'h2' as const },
  { id: 'types', title: '2. Types of Cookies We Use', level: 'h2' as const },
  { id: 'third-party', title: '3. Third-Party Cookies', level: 'h2' as const },
  { id: 'manage', title: '4. How to Manage Your Cookies', level: 'h2' as const },
  { id: 'disable', title: '5. What Happens if You Disable Cookies?', level: 'h2' as const },
  { id: 'retention', title: '6. Cookie Retention', level: 'h2' as const },
  { id: 'security', title: '7. Security and Privacy', level: 'h2' as const },
  { id: 'contact', title: '8. Contact Information', level: 'h2' as const },
  { id: 'changes', title: '9. Changes to This Policy', level: 'h2' as const },
];

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      lastUpdated="April 2026"
      sections={sections}
    >
      <MarkdownRenderer content={cookiePolicy} />
    </LegalPageLayout>
  );
}
