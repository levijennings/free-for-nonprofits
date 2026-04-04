'use client'

interface Props {
  toolId: string
  toolName: string
  websiteUrl: string
  affiliateUrl?: string | null
}

export default function AffiliateLink({ toolId, toolName, websiteUrl, affiliateUrl }: Props) {
  const href = affiliateUrl || websiteUrl
  const isAffiliate = Boolean(affiliateUrl)

  const handleClick = () => {
    // Fire-and-forget click tracking — never blocks navigation
    fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool_id: toolId,
        click_type: isAffiliate ? 'affiliate' : 'website',
      }),
    }).catch(() => {}) // Silently ignore errors
  }

  return (
    <div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block w-full py-3 text-center bg-brand-500 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
      >
        Visit {toolName} →
      </a>

      <p className="mt-3 text-center text-xs text-gray-400">
        {isAffiliate
          ? 'Affiliate link — we may earn a small commission at no cost to you'
          : 'Opens official website'}
      </p>
    </div>
  )
}
