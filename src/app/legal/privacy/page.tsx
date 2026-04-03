export const metadata = {
  title: 'Privacy Policy | Free For NonProfits',
  robots: 'noindex',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last Updated: April 2026</p>
      <p>Free For NonProfits (operated by DVLMNT) collects account information, usage data, and tool submissions. We use Supabase for data storage and Vercel Analytics for analytics. We do not sell your data. You may request deletion by emailing us.</p>
      <p className="mt-4">Questions? Email <a href="mailto:levi@dvlmnt.com" className="text-blue-600">levi@dvlmnt.com</a></p>
    </div>
  );
}
