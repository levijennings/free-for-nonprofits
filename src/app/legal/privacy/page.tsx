import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Free For NonProfits',
  description: 'Learn how we collect, use, and protect your personal information.',
  robots: 'noindex, nofollow',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <article className="prose prose-sm lg:prose-base max-w-none dark:prose-invert">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8"><strong>Last Updated:</strong> April 2026</p>

        <p>DVLMNT ("we," "us," "our," or "Company") operates the Free For NonProfits website and service (the "Service"). This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. By using the Service, you consent to our data practices described in this policy.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Information You Provide Directly</h3>
        <p><strong>Account Information:</strong> When you create an account, we collect your name, email address, password, and organizational affiliation (nonprofit name).</p>
        <p><strong>Tool Submissions:</strong> When you submit a nonprofit tool to our directory, we collect the tool name, vendor/creator information, URL, description, category, and related metadata.</p>
        <p><strong>Reviews and Ratings:</strong> When you post reviews, we collect your rating, review text, timestamp, and user account information.</p>
        <p><strong>Communications:</strong> If you contact us with inquiries or feedback, we collect the content of your communications and any attachments.</p>

        <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Information Collected Automatically</h3>
        <p><strong>Usage Data:</strong> We collect information about how you interact with the Service, including pages viewed, tools searched, filters applied, time spent, and actions taken.</p>
        <p><strong>Device Information:</strong> We collect information about the device you use to access the Service, including device type, operating system, browser type, and IP address.</p>
        <p><strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar technologies to track your usage, remember preferences, and improve the Service.</p>

        <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Third-Party Data Sources</h3>
        <p>We may receive information about you from third parties, including:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Analytics providers</li>
          <li>Nonprofit verification services (to validate nonprofit status)</li>
          <li>Social media platforms (if you use social login)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
        <p><strong>2.1 Service Delivery:</strong> We use your information to provide, maintain, and improve the Service, including processing tool submissions, displaying reviews, and enabling search functionality.</p>
        <p><strong>2.2 Communication:</strong> We use your email to send service-related announcements, updates, and responses to your inquiries. We may also send occasional newsletters (with opt-out capability).</p>
        <p><strong>2.3 Safety and Compliance:</strong> We use information to detect and prevent fraud, abuse, and unauthorized access; enforce these Terms; and comply with legal obligations.</p>
        <p><strong>2.4 Analytics and Improvement:</strong> We analyze usage patterns to understand how users interact with the Service and make improvements.</p>
        <p><strong>2.5 Personalization:</strong> We use your information to personalize your experience, including customized tool recommendations based on your browsing history and interests.</p>
        <p><strong>2.6 Marketing:</strong> With your consent, we may use your information for marketing and promotional purposes. You may opt out at any time.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Share Your Information</h2>
        <p><strong>3.1 Public Content:</strong> Tool submissions, reviews, and ratings are publicly visible on the Service by default. Other users can see your name and review history.</p>
        <p><strong>3.2 Service Providers:</strong> We share information with third-party service providers who perform services on our behalf, including hosting, analytics, email delivery, and payment processing. These providers are contractually obligated to protect your data.</p>
        <p><strong>3.3 Third-Party Services:</strong></p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Supabase:</strong> Database hosting and authentication</li>
          <li><strong>Vercel Analytics:</strong> Website analytics</li>
          <li><strong>PostHog:</strong> Product analytics and feature flags</li>
          <li><strong>Sentry:</strong> Error tracking and monitoring</li>
        </ul>
        <p><strong>3.4 Legal Requirements:</strong> We may disclose information if required by law, regulation, or legal process, or to protect our rights and the safety of users.</p>
        <p><strong>3.5 Business Transfers:</strong> If DVLMNT is acquired or merges with another entity, your information may be transferred as part of that transaction.</p>
        <p><strong>3.6 No Sale:</strong> We do not sell your personal information to third parties for marketing purposes.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Storage and Security</h2>
        <p><strong>4.1 Storage Location:</strong> Your information is stored on servers managed by Supabase, which may be located in various jurisdictions, including the United States.</p>
        <p><strong>4.2 Security Measures:</strong> We implement industry-standard security measures, including encryption in transit (SSL/TLS) and at rest, access controls, and regular security assessments. However, no security measures are 100% effective.</p>
        <p><strong>4.3 Data Retention:</strong> We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Your Privacy Rights</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Access and Portability</h3>
        <p>You have the right to request access to your personal information and receive it in a portable format. To request this, email levi@dvlmnt.com.</p>

        <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Correction and Deletion</h3>
        <p>You have the right to correct inaccurate information and request deletion of your data (subject to legal retention requirements). We will comply with requests within 30 days.</p>

        <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Opt-Out</h3>
        <p>You may opt out of marketing emails and non-essential communications by clicking the unsubscribe link in our emails or updating your account settings.</p>

        <h3 className="text-xl font-semibold mt-6 mb-3">5.4 CCPA Rights (California Residents)</h3>
        <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Know what personal information is collected</li>
          <li>Delete personal information (subject to exceptions)</li>
          <li>Opt-out of the sale of personal information (we do not sell information)</li>
          <li>Non-discrimination for exercising your rights</li>
        </ul>
        <p>To exercise these rights, contact levi@dvlmnt.com with "CCPA Request" in the subject line.</p>

        <h3 className="text-xl font-semibold mt-6 mb-3">5.5 GDPR Rights (EU Residents)</h3>
        <p>If you are an EU resident, you have rights under the General Data Protection Regulation (GDPR), including the right to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Erase your data ("right to be forgotten")</li>
          <li>Restrict processing</li>
          <li>Data portability</li>
          <li>Withdraw consent</li>
          <li>Lodge a complaint with your national data protection authority</li>
        </ul>
        <p>To exercise these rights, contact levi@dvlmnt.com.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Third-Party Services and Integrations</h2>
        <p><strong>6.1 Analytics:</strong> We use Vercel Analytics and PostHog to understand how users interact with the Service. These services may collect additional information directly from your browser.</p>
        <p><strong>6.2 Authentication:</strong> If you use social login (e.g., Google, GitHub), we receive information from those providers in accordance with their privacy policies.</p>
        <p><strong>6.3 Links to Third Parties:</strong> The Service contains links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies before providing information.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Children's Privacy (COPPA)</h2>
        <p><strong>7.1</strong> The Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected such information, we will delete it promptly.</p>
        <p><strong>7.2</strong> If you are under 18, we encourage you to involve a parent or guardian in your use of the Service and our privacy practices.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">8. Cookies and Tracking Technologies</h2>
        <p><strong>8.1 Types of Cookies:</strong> We use essential cookies (required for functionality), analytics cookies (to understand usage), and functional cookies (to remember preferences).</p>
        <p><strong>8.2 Third-Party Cookies:</strong> Third-party services (Vercel, PostHog) may set their own cookies.</p>
        <p><strong>8.3 Cookie Management:</strong> You can manage cookies in your browser settings. Disabling cookies may affect the functionality of the Service. For details, see our Cookie Policy.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">9. Data Retention</h2>
        <p>We retain personal information for as long as necessary to provide the Service and fulfill legal obligations. Specifically:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Account information: Retained until account deletion</li>
          <li>Usage data: Typically retained for 12 months</li>
          <li>Tool submissions and reviews: Retained unless you request deletion</li>
          <li>Marketing information: Retained until opt-out</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">10. International Data Transfers</h2>
        <p>If you are accessing the Service from outside the United States, please note that your information may be transferred to, stored in, and processed in the United States and other countries. By using the Service, you consent to such transfers.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">11. Contact Information</h2>
        <p>For questions about this Privacy Policy or to exercise your rights, contact:</p>
        <p><strong>DVLMNT</strong><br />Email: levi@dvlmnt.com</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">12. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on the website and updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the updated policy.</p>

        <hr className="my-8" />
        <p className="text-sm text-gray-600"><em>This Privacy Policy was last updated in April 2026.</em></p>
      </article>
    </div>
  );
}
