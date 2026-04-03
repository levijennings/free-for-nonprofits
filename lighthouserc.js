module.exports = {
  ci: {
    collect: {
      // URL to audit (can be overridden via CLI)
      url: process.env.LIGHTHOUSE_URL || 'http://localhost:3000',
      staticDistDir: './.next',
      numberOfRuns: 1,
      settings: {
        // Disable network throttling for more consistent results
        throttling: {
          rttMs: 40,
          downstreamThroughputKbps: 10240,
          upstreamThroughputKbps: 10240,
        },
        // Disable CPU throttling for more consistent results
        cpuSlowdownMultiplier: 1,
        // Skip problematic audits
        skipAudits: [],
      },
    },
    upload: {
      // Upload to temporary public storage (GitHub-hosted)
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'cumulativeLayoutShift': ['error', { maxNumericValue: 0.1 }],
        'categories:performance': ['error', { minScore: 0.90 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
        // Best practices
        'uses-http2': ['warning'],
        'no-unminified-javascript': ['warning'],
        'no-unminified-css': ['warning'],
        // SEO
        'is-crawlable': ['error'],
        'robots-txt': ['warning'],
        'hreflang': ['warning'],
      },
    },
  },
};
