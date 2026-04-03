import React from 'react';

export const metadata = {
  title: 'Cookie Policy | Free For NonProfits',
  description: 'Information about how we use cookies and how to manage your cookie preferences.',
  robots: 'noindex, nofollow',
};

export default function CookiePolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <article className="prose prose-sm lg:prose-base max-w-none dark:prose-invert">
        <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-gray-600 mb-8"><strong>Last Updated:</strong> April 2026</p>

        <p>This Cookie Policy explains what cookies are, how Free For NonProfits (operated by DVLMNT) uses them, and how you can manage your cookie preferences.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device that contain information about your browsing activity. They allow websites to remember information about you and improve your experience. Cookies can be "session" cookies (deleted when you close your browser) or "persistent" cookies (stored until they expire).</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Types of Cookies We Use</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Essential Cookies</h3>
        <p>These cookies are required for the Service to function properly. They enable basic functionality such as:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Session management and user authentication</li>
          <li>Security features and fraud prevention</li>
          <li>Account maintenance and preferences</li>
        </ul>
        <p><strong>These cannot be disabled without affecting the Service.</strong></p>
        <p>Examples:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Session ID: Maintains your login session</li>
          <li>Security tokens: Prevent unauthorized access</li>
          <li>Language preference: Remembers your language selection</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Analytics Cookies</h3>
        <p>These cookies help us understand how users interact with the Service through:</p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Vercel Analytics:</strong> Tracks page views, user interactions, and performance metrics</li>
          <li><strong>PostHog:</strong> Analyzes feature usage, user behavior, and product insights</li>
        </ul>
        <p>This data helps us improve the Service and user experience.</p>

        <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Functional Cookies</h3>
        <p>These cookies improve your experience by remembering:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Your search preferences and filters</li>
          <li>Tool submissions and drafts (if applicable)</li>
          <li>Sidebar state (collapsed/expanded)</li>
          <li>Theme preference (light/dark mode, if available)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Third-Party Cookies</h2>
        <p>Third-party services we use may set their own cookies:</p>

        <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Vercel Analytics</h3>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Purpose:</strong> Website analytics and performance monitoring</li>
          <li><strong>Cookies Set:</strong> Vercel Analytics tracking cookies</li>
          <li><strong>Privacy:</strong> See https://vercel.com/legal/privacy-policy</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">3.2 PostHog</h3>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Purpose:</strong> Product analytics and feature usage</li>
          <li><strong>Cookies Set:</strong> PostHog session and analytics cookies</li>
          <li><strong>Privacy:</strong> See https://posthog.com/privacy</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Google (if using Google Login)</h3>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Purpose:</strong> Authentication and identity verification</li>
          <li><strong>Cookies Set:</strong> Google authentication cookies</li>
          <li><strong>Privacy:</strong> See https://policies.google.com/privacy</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. How to Manage Your Cookies</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Browser Settings</h3>
        <p>Most browsers allow you to control cookies through settings:</p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
          <li><strong>Firefox:</strong> Preferences &gt; Privacy & Security &gt; Cookies and Site Data</li>
          <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
          <li><strong>Edge:</strong> Settings &gt; Privacy, search, and services &gt; Clear browsing data</li>
        </ul>
        <p>You can choose to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Accept all cookies</li>
          <li>Accept only essential cookies</li>
          <li>Delete existing cookies</li>
          <li>Set specific cookie preferences by website</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Cookie Consent Banner</h3>
        <p>When you first visit the Service, we display a cookie consent banner allowing you to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Accept All:</strong> Accept all cookies including analytics</li>
          <li><strong>Customize:</strong> Choose which cookie categories to allow</li>
          <li><strong>Reject Non-Essential:</strong> Accept only essential cookies</li>
        </ul>
        <p>Your cookie preference is saved in a consent cookie so we remember your choice.</p>

        <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Third-Party Opt-Out</h3>
        <p>You can opt out of third-party analytics services:</p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Vercel Analytics:</strong> No direct opt-out; disable in browser settings</li>
          <li><strong>PostHog:</strong> https://posthog.com/docs/faq#how-to-opt-out-of-posthog</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">4.4 Do Not Track</h3>
        <p>Some browsers include a "Do Not Track" (DNT) feature. We honor DNT preferences by not setting analytics cookies when DNT is enabled.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. What Happens if You Disable Cookies?</h2>
        <p>If you disable essential cookies, the Service may not function properly. Specifically:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>You may not be able to log in</li>
          <li>Your session may be interrupted</li>
          <li>Account features may not work</li>
          <li>Your preferences may not be saved</li>
        </ul>
        <p>Disabling analytics cookies will not significantly affect functionality but may prevent us from improving the Service based on usage data.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Cookie Retention</h2>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
          <li><strong>Persistent cookies:</strong> Typically retained for 1 year, unless cleared earlier</li>
          <li><strong>Consent cookie:</strong> Retained for 1 year (refreshed if you adjust preferences)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Security and Privacy</h2>
        <p><strong>7.1 Secure Storage:</strong> Cookies are stored securely on your device and transmitted over encrypted connections (HTTPS).</p>
        <p><strong>7.2 No Sensitive Data:</strong> Cookies do not contain passwords, payment information, or other highly sensitive data.</p>
        <p><strong>7.3 Privacy:</strong> For more information about how we collect and use cookie data, please see our Privacy Policy.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">8. Updates to This Policy</h2>
        <p>We may update this Cookie Policy from time to time to reflect changes in our cookie practices or legal requirements. Material changes will be communicated through the website.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Information</h2>
        <p>If you have questions about our use of cookies, please contact:</p>
        <p><strong>DVLMNT</strong><br />Email: levi@dvlmnt.com</p>

        <hr className="my-8" />
        <p className="text-sm text-gray-600"><em>This Cookie Policy was last updated in April 2026.</em></p>
      </article>
    </div>
  );
}
