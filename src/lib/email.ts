import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Free For NonProfits <hello@freefornonprofits.org>'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://free-for-nonprofits.vercel.app'

// ── New matching tool notification ────────────────────────────────────────────

export async function sendNewToolMatchEmail({
  toEmail,
  orgName,
  toolName,
  toolSlug,
  categoryName,
  pricingModel,
  nonprofitDeal,
}: {
  toEmail: string
  orgName: string | null
  toolName: string
  toolSlug: string
  categoryName: string | null
  pricingModel: string
  nonprofitDeal: string | null
}) {
  const pricingLabel: Record<string, string> = {
    free: 'Free',
    freemium: 'Freemium',
    nonprofit_discount: 'Nonprofit Discount',
    paid: 'Paid',
  }

  const greeting = orgName ? `Hi ${orgName}` : 'Hi there'
  const toolUrl = `${BASE_URL}/tools/${toolSlug}`

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `New tool added: ${toolName} — matches your preferences`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#16a34a,#0d9488);padding:28px 32px;">
      <p style="margin:0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.15em;text-transform:uppercase;">Free For NonProfits</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#fff;">A new tool matches your preferences</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;">${greeting},</p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
        We just added a new resource to the directory that matches the categories you follow.
      </p>

      <!-- Tool card -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111827;">${toolName}</p>
        ${categoryName ? `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;">${categoryName}</p>` : ''}
        <span style="display:inline-block;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;background:${pricingModel === 'free' ? '#dcfce7' : pricingModel === 'freemium' ? '#dbeafe' : '#ede9fe'};color:${pricingModel === 'free' ? '#15803d' : pricingModel === 'freemium' ? '#1d4ed8' : '#7c3aed'};">
          ${pricingLabel[pricingModel] ?? pricingModel}
        </span>
        ${nonprofitDeal ? `<p style="margin:12px 0 0;font-size:13px;color:#15803d;font-weight:500;">🎁 ${nonprofitDeal}</p>` : ''}
      </div>

      <a href="${toolUrl}" style="display:inline-block;background:#16a34a;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">
        View ${toolName} →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;background:#f9fafb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
        You're receiving this because you enabled new tool notifications on Free For NonProfits.
        <a href="${BASE_URL}/dashboard/preferences" style="color:#16a34a;text-decoration:none;">Manage preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ── Tool request fulfilled notification ───────────────────────────────────────

export async function sendRequestFulfilledEmail({
  toEmail,
  orgName,
  requestName,
  toolSlug,
  toolName,
}: {
  toEmail: string
  orgName: string | null
  requestName: string
  toolSlug: string
  toolName: string
}) {
  const greeting = orgName ? `Hi ${orgName}` : 'Hi there'
  const toolUrl = `${BASE_URL}/tools/${toolSlug}`

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Your request has been added: ${toolName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">

    <div style="background:linear-gradient(135deg,#16a34a,#0d9488);padding:28px 32px;">
      <p style="margin:0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.15em;text-transform:uppercase;">Free For NonProfits</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#fff;">Your request was added! 🎉</h1>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;">${greeting},</p>
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
        Great news — your request for <strong>${requestName}</strong> has been added to the Free For NonProfits directory as <strong>${toolName}</strong>.
      </p>
      <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.6;">
        Thanks for helping us build the most complete resource for nonprofits.
      </p>

      <a href="${toolUrl}" style="display:inline-block;background:#16a34a;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">
        View ${toolName} in the directory →
      </a>
    </div>

    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;background:#f9fafb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Free For NonProfits · <a href="${BASE_URL}" style="color:#16a34a;text-decoration:none;">freefornonprofits.org</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ── Weekly "what's new" digest ────────────────────────────────────────────────

export type DigestTool = {
  name: string
  slug: string
  categoryName: string | null
  pricingModel: string
  nonprofitDeal: string | null
}

const DIGEST_PRICING_LABEL: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  nonprofit_discount: 'Nonprofit Discount',
  paid: 'Paid',
}

function pricingBadge(pricingModel: string): string {
  if (!pricingModel) return ''
  const bg = pricingModel === 'free' ? '#dcfce7' : pricingModel === 'freemium' ? '#dbeafe' : '#ede9fe'
  const fg = pricingModel === 'free' ? '#15803d' : pricingModel === 'freemium' ? '#1d4ed8' : '#7c3aed'
  const label = DIGEST_PRICING_LABEL[pricingModel] ?? pricingModel
  return `<span style="display:inline-block;font-size:11px;font-weight:600;padding:2px 9px;border-radius:999px;margin-left:8px;background:${bg};color:${fg};">${label}</span>`
}

function toolRow(t: DigestTool): string {
  const url = `${BASE_URL}/tools/${t.slug}`
  return `
    <tr><td style="padding:14px 0;border-bottom:1px solid #f3f4f6;">
      <a href="${url}" style="font-size:15px;font-weight:700;color:#111827;text-decoration:none;">${t.name}</a>${pricingBadge(t.pricingModel)}
      ${t.categoryName ? `<div style="font-size:12px;color:#6b7280;margin-top:3px;">${t.categoryName}</div>` : ''}
      ${t.nonprofitDeal ? `<div style="font-size:12px;color:#15803d;margin-top:4px;">🎁 ${t.nonprofitDeal}</div>` : ''}
    </td></tr>`
}

export async function sendWeeklyDigestEmail({
  toEmail,
  orgName,
  newTools,
  dealOfWeek,
  newCategories,
  popular,
}: {
  toEmail: string
  orgName: string | null
  newTools: DigestTool[]
  dealOfWeek: (DigestTool & { blurb: string | null }) | null
  newCategories: { name: string; slug: string }[]
  popular: { name: string; slug: string }[]
}) {
  const greeting = orgName ? `Hi ${orgName}` : 'Hi there'

  const dealBlock = dealOfWeek
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin:0 0 28px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#15803d;letter-spacing:0.12em;text-transform:uppercase;">⭐ Deal of the Week</p>
        <a href="${BASE_URL}/tools/${dealOfWeek.slug}" style="font-size:19px;font-weight:800;color:#111827;text-decoration:none;">${dealOfWeek.name}</a>${pricingBadge(dealOfWeek.pricingModel)}
        ${dealOfWeek.blurb ? `<p style="margin:10px 0 0;font-size:14px;color:#374151;line-height:1.6;">${dealOfWeek.blurb}</p>` : ''}
        ${dealOfWeek.nonprofitDeal ? `<p style="margin:8px 0 0;font-size:13px;color:#15803d;font-weight:500;">🎁 ${dealOfWeek.nonprofitDeal}</p>` : ''}
        <a href="${BASE_URL}/tools/${dealOfWeek.slug}" style="display:inline-block;margin-top:14px;background:#16a34a;color:#fff;font-size:13px;font-weight:700;padding:10px 20px;border-radius:9px;text-decoration:none;">See the deal →</a>
      </div>`
    : ''

  const newToolsBlock = newTools.length
    ? `<p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;">🆕 New this week</p>
       <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">${newTools.map(toolRow).join('')}</table>`
    : ''

  const popularBlock = popular.length
    ? `<p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;">🔥 Popular with nonprofits</p>
       <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">${popular
         .map(p => `<tr><td style="padding:12px 0;border-bottom:1px solid #f3f4f6;"><a href="${BASE_URL}/tools/${p.slug}" style="font-size:15px;font-weight:700;color:#111827;text-decoration:none;">${p.name}</a></td></tr>`)
         .join('')}</table>`
    : ''

  const catsBlock = newCategories.length
    ? `<p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;">📂 New categories</p>
       <p style="margin:0 0 28px;font-size:14px;color:#374151;line-height:1.8;">${newCategories
         .map(c => `<a href="${BASE_URL}/tools?category=${c.slug}" style="color:#16a34a;text-decoration:none;">${c.name}</a>`)
         .join('&nbsp;·&nbsp;')}</p>`
    : ''

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: dealOfWeek ? `This week for nonprofits: ${dealOfWeek.name} + what's new` : `What's new for nonprofits this week`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#16a34a,#0d9488);padding:28px 32px;">
      <p style="margin:0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.15em;text-transform:uppercase;">Free For NonProfits</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#fff;">Your weekly roundup</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 24px;color:#374151;font-size:15px;">${greeting}, here's what's new for your nonprofit this week.</p>
      ${dealBlock}
      ${newToolsBlock}
      ${catsBlock}
      ${popularBlock}
      <a href="${BASE_URL}/tools" style="display:inline-block;background:#16a34a;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">Browse all tools →</a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;background:#f9fafb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
        You're receiving this weekly roundup because you opted in to updates.
        <a href="${BASE_URL}/dashboard/preferences" style="color:#16a34a;text-decoration:none;">Manage preferences or unsubscribe</a>.
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}
