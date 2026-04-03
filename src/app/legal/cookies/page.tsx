export const metadata = {
  title: 'Cookie Policy | Free For NonProfits',
  robots: 'noindex',
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
      <p className="text-gray-500 mb-8">Last Updated: April 2026</p>
      <p>Free For NonProfits uses essential cookies to keep you logged in and analytics cookies (PostHog, Vercel Analytics) to improve the service. You can disable non-essential cookies in your browser settings.</p>
      <p className="mt-4">Questions? Email <a href="mailto:levi@dvlmnt.com" className="text-blue-600">levi@dvlmnt.com</a></p>
    </div>
  );
}
