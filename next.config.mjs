/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Tool logos are stored as vendor-hosted URLs (see the `logo_url` column).
    // Public pages render them via <img> in ToolLogo, which bypasses this list,
    // but src/components/admin/SetRotwForm.tsx uses next/image and therefore
    // needs every logo host allow-listed here.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      // Favicon services used by the pre-existing rows.
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      // Vendor-hosted brand marks.
      { protocol: 'https', hostname: 'framerusercontent.com' },
      { protocol: 'https', hostname: 'civicrm.org' },
      { protocol: 'https', hostname: 'www.cloudflare.com' },
      { protocol: 'https', hostname: 'www.getresponse.com' },
      { protocol: 'https', hostname: 'about.gitlab.com' },
      { protocol: 'https', hostname: 'cdn.prod.website-files.com' },
      { protocol: 'https', hostname: 'goldenvolunteer.com' },
      { protocol: 'https', hostname: 'static-web.grammarly.com' },
      { protocol: 'https', hostname: 'www.idealist.org' },
      { protocol: 'https', hostname: 'cdn.jotfor.ms' },
      { protocol: 'https', hostname: 'kit.com' },
      { protocol: 'https', hostname: 'www.linkedin.com' },
      { protocol: 'https', hostname: 'www.mobilize.us' },
      { protocol: 'https', hostname: 'openai.com' },
      { protocol: 'https', hostname: 'pointapp.org' },
      { protocol: 'https', hostname: 'ramp.com' },
      { protocol: 'https', hostname: 'tally.so' },
      { protocol: 'https', hostname: 'zapier.com' },
      { protocol: 'https', hostname: 'www.zohowebstatic.com' },
    ],
  },
};

export default nextConfig;
