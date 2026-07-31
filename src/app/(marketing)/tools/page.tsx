import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import ToolLogo from '@/components/tools/ToolLogo'
import { ELIGIBILITY_COLUMNS } from '@/lib/eligibility'
import { buildSearchOrFilter } from '@/lib/search-filter'

export const metadata: Metadata = {
  title: 'Browse Free Nonprofit Tools | Free For NonProfits',
  description: 'Discover 50+ free and discounted software tools for nonprofits — CRM, email, project management, design, and more.',
}

interface SearchParams {
  q?: string
  category?: string
  pricing?: string
  /** 'gated' = requires nonprofit status; 'open' = available to anyone. */
  access?: string
}

const pricingLabels: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  nonprofit_discount: 'Nonprofit Discount',
}

/**
 * Card badges use the short form. "Nonprofit Discount" is 18 characters sitting
 * beside a tool name in a three-column grid — it forced long names to wrap to
 * three lines and collide with it. The full label is still used on the filter
 * pills, where there is room and the extra word does work.
 */
const pricingBadgeLabels: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  nonprofit_discount: 'Discount',
}

const pricingColors: Record<string, string> = {
  free: 'bg-emerald-100 text-emerald-800',
  freemium: 'bg-blue-100 text-blue-800',
  nonprofit_discount: 'bg-purple-100 text-purple-800',
}

/**
 * The pricing pills.
 *
 * The active fills were `green-500` / `blue-500` / `purple-500` with white
 * text: 2.28:1, 3.68:1 and 3.96:1 — all under AA's 4.5:1, and the selected
 * pill is the one label on the page a user has to be able to read. The 700
 * shades keep the same three hues (5.02:1, 6.70:1, 6.98:1 on white) so the
 * categorical coding survives, and the inactive state is untouched: the hue
 * still lives in the emoji and the hover border.
 */
const pricingPills = [
  { key: undefined, label: 'All',                active: 'bg-accent text-accent-fg border-accent',       idle: 'bg-surface text-fg-muted border-line hover:border-accent-line' },
  { key: 'free',               label: '🎁 Free',               active: 'bg-green-700 text-white border-green-700',   idle: 'bg-surface text-fg-muted border-line hover:border-green-300' },
  { key: 'freemium',           label: '⚡ Freemium',           active: 'bg-blue-700 text-white border-blue-700',     idle: 'bg-surface text-fg-muted border-line hover:border-blue-300' },
  { key: 'nonprofit_discount', label: '💜 Nonprofit Discount', active: 'bg-purple-700 text-white border-purple-700', idle: 'bg-surface text-fg-muted border-line hover:border-purple-300' },
] as const

/**
 * Sentences that state a limit, an exclusion or an expiry rather than a
 * benefit. Deliberately broad: a false positive only changes which half of the
 * card a sentence lands in, while a false negative can bury the one clause
 * that makes a "deal" not apply to the reader.
 */
const CAVEAT_PATTERN =
  /\b(exclud\w*|ineligible|only|not free|no longer|ended|ends|expires?|expired|capped|cap|ceiling|limited|limits|restrict\w*|must|requires?|required|unconfirmed|unverified|revoked|not included|one-time|still apply|not zero-cost|minimum|mandatory|reapply|reconfirmed|wrong|stale|out of date|discontinued)\b/i

/** Split on sentence ends, but not on "U.S. government" or "$1,199-$1,699/yr." */
function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z0-9$"“(])/)
    .filter(Boolean)
}

/**
 * Separate a deal into what you get and what stops you getting it.
 *
 * 91 of 104 deals overflow two lines, and on ~20 of them the material
 * exclusion sits entirely past the cut — microsoft-365 hid "grants ENDED
 * 1 July 2025", zoom hid the $10M budget ceiling, trello hid "only discounted,
 * not free". Clamping alone cannot fix that: the caveat has to be pulled out
 * of the clamped region, not just given more room.
 *
 * Only a *trailing run* of caveat sentences is split off, which is where
 * vendors put exclusions and which keeps the deal in its written order. When
 * the caveat is not at the end (or is the whole deal) nothing is reordered and
 * the caller falls back to a plain three-line clamp — in those rows the caveat
 * already leads, so it is visible anyway.
 */
function splitDeal(deal: string): { body: string; caveat: string | null } {
  const sentences = splitSentences(deal)
  if (sentences.length < 2) return { body: deal.trim(), caveat: null }

  let firstCaveat = sentences.length
  while (firstCaveat > 0 && CAVEAT_PATTERN.test(sentences[firstCaveat - 1])) firstCaveat--

  // No trailing caveats, or the whole deal is caveat — don't split.
  if (firstCaveat === 0 || firstCaveat === sentences.length) {
    return { body: deal.trim(), caveat: null }
  }
  return {
    body: sentences.slice(0, firstCaveat).join(' '),
    caveat: sentences.slice(firstCaveat).join(' '),
  }
}

/**
 * How much text fits on one rendered line of a deal box.
 *
 * `line-clamp` is a paint-time cut: it stops at whatever character reaches the
 * box edge, so the last visible word is usually a fragment ("…open to everyone
 * an…") and, worse, it can leave the opening of an exclusion list standing
 * alone ("Schools, hospitals…"). The only way to break on a word is to do it
 * here, in the server render, against a character budget.
 *
 * The budget has to hold at the narrowest column the grid can produce. Two
 * candidates, both measured rather than guessed:
 *
 *   xl, 3 columns @1280px: 1280 − 64 page padding − 224 sidebar − 32 gap
 *     = 960 grid; (960 − 32 of gaps) / 3 = 309px column; − 40 card padding
 *     − 22 box padding and borders = 247px of text.
 *   sm, 2 columns @640px (no sidebar): (640 − 48) = 592; (592 − 16) / 2
 *     = 288px column; − 62 = 226px of text — narrower still, so this is the
 *     one the budget is sized for.
 *
 * Text is 13px Plus Jakarta Sans (`text-xs`). Its average advance over this
 * catalogue is 6.1–6.5px per character, and greedy wrapping wastes another
 * ~8% to the ragged right edge, which puts a safe line at 226 / 6.5 / 1.08 ≈
 * 31 characters. The warning box loses a further 19px to the ⚠ marker and its
 * gap on *every* line, so it gets 29.
 *
 * Both numbers were verified by wrapping all 104 live `nonprofit_deal` values
 * with the real font metrics: at 31/29 nothing rendered here exceeds its
 * clamp at either width, so the CSS clamp never actually fires and no cut is
 * ever visible. The clamps stay as a backstop for pathological input (an
 * unbroken 200-character token), which bounds height even if the estimate is
 * wrong.
 */
const OFFER_CHARS_PER_LINE = 31
const CAVEAT_CHARS_PER_LINE = 29
/** "🎁 " and "Open to anyone — " sit inline and eat into the offer's budget. */
const GIFT_PREFIX_CHARS = 3
const OPEN_PREFIX_CHARS = 18

const ELLIPSIS = '…'

/**
 * Shown when a condition exists but cannot be rendered whole in the space.
 * A generic warning is worth more than the first four words of an exclusion
 * list, which reads as though the list were the whole condition.
 */
const CAVEAT_SIGNAL = 'Exclusions apply — see details'

/** Cut at the last space inside the budget, never mid-word. */
function truncateWords(text: string, budget: number): string {
  if (text.length <= budget) return text
  const room = Math.max(1, budget - ELLIPSIS.length)
  const head = text.slice(0, room + 1)
  const lastSpace = head.lastIndexOf(' ')
  // A single token longer than the whole budget has no word boundary to use.
  const kept = lastSpace > 0 ? head.slice(0, lastSpace) : head.slice(0, room)
  return kept.replace(/[\s,;:.!?—-]+$/, '') + ELLIPSIS
}

interface Fitted {
  /** The sentences that fit, joined, with elision marked. */
  text: string
  /** Whole sentences that did not fit. */
  dropped: string[]
  /** The tail of the first sentence, when even that had to be cut. */
  cutTail: string
}

/**
 * Fill a budget with whole sentences.
 *
 * Sentence-atomic is the point: a sentence either appears in full or does not
 * appear, so a condition can never be reduced to its opening clause. Only the
 * very first sentence may be cut mid-way, and only because a card that shows
 * nothing at all is worse than one that shows a trimmed opening line.
 *
 * Elision is marked by replacing the last sentence's full stop with an
 * ellipsis, which costs no characters and so can never itself overflow.
 *
 * `skipOversized` keeps scanning past a sentence that does not fit instead of
 * stopping there, so one long condition cannot hide every shorter one behind
 * it.
 */
function fitSentences(sentences: string[], budget: number, skipOversized = false): Fitted {
  const kept: string[] = []
  const dropped: string[] = []
  let used = 0

  for (let i = 0; i < sentences.length; i++) {
    const cost = (kept.length ? 1 : 0) + sentences[i].length
    if (used + cost <= budget) {
      kept.push(sentences[i])
      used += cost
    } else {
      dropped.push(sentences[i])
      if (!skipOversized) {
        dropped.push(...sentences.slice(i + 1))
        break
      }
    }
  }

  if (!kept.length) {
    const text = truncateWords(sentences[0], budget)
    return {
      text,
      dropped: sentences.slice(1),
      cutTail: sentences[0].slice(text.length - ELLIPSIS.length),
    }
  }

  const joined = kept.join(' ')
  return {
    text: dropped.length ? joined.replace(/[\s.!?—-]+$/, '') + ELLIPSIS : joined,
    dropped,
    cutTail: '',
  }
}

/**
 * The deal line on a card.
 *
 * Previously the gated branch clamped at two lines and the open-to-anyone
 * branch had no clamp at all, so 30 cards rendered up to 277 characters and
 * blew out the grid while the other 74 hid their conditions. Promoting the
 * trailing caveat fixed the rows where the exclusion was the last sentence —
 * HubSpot's "New customers only, Starter excluded…" — but left the rows where
 * it is not, because `line-clamp` was still doing the cutting. Miro, Adobe and
 * Salesforce all sheared mid-word, and Adobe's cut landed on "Schools,
 * hospitals…", the opening of an exclusion list.
 *
 * So the truncation happens here instead, and it works on three rules:
 *
 *   1. Sentences are atomic. Nothing is shown as a fragment except, at worst,
 *      the opening sentence of the offer itself.
 *   2. A condition squeezed out of the offer is promoted into the warning box
 *      rather than dropped — which is the trailing-caveat behaviour, now
 *      applied wherever the condition happens to sit in the sentence order.
 *   3. If not one condition fits whole, the box says so in plain words.
 *
 * Height is bounded by construction: three lines of offer, four of conditions,
 * and across the live catalogue nothing reaches more than six lines total,
 * which is what the pair of clamps allowed before.
 */
function DealSummary({ deal, open }: { deal: string | null; open: boolean }) {
  if (!deal && !open) return null

  const { body, caveat } = deal ? splitDeal(deal) : { body: '', caveat: null }
  const prefixChars = open ? OPEN_PREFIX_CHARS : GIFT_PREFIX_CHARS
  const bodySentences = body ? splitSentences(body) : []

  // Two lines of offer when there are already conditions to print underneath,
  // three when the offer is the whole card.
  const offerLines = caveat ? 2 : 3
  const offer = bodySentences.length
    ? fitSentences(bodySentences, offerLines * OFFER_CHARS_PER_LINE - prefixChars)
    : { text: '', dropped: [], cutTail: '' }

  // Anything limiting that the offer could not hold moves to the warning box
  // instead of falling off the card.
  const conditions = [
    ...offer.dropped.filter((s) => CAVEAT_PATTERN.test(s)),
    ...(caveat ? splitSentences(caveat) : []),
  ]

  const offerLinesUsed = offer.text
    ? Math.min(offerLines, Math.max(1, Math.ceil((offer.text.length + prefixChars) / OFFER_CHARS_PER_LINE)))
    : 0
  // The warning box takes whatever the offer left, so the pair stays inside
  // the same six lines however the content is distributed.
  const caveatLines = Math.min(4, Math.max(3, 6 - offerLinesUsed))

  let caveatText: string | null = null
  if (conditions.length) {
    const fitted = fitSentences(conditions, caveatLines * CAVEAT_CHARS_PER_LINE, true)
    caveatText = fitted.cutTail ? CAVEAT_SIGNAL : fitted.text
  } else if (CAVEAT_PATTERN.test(offer.cutTail)) {
    // The offer's opening sentence was cut and the discarded half was the
    // limiting part of it. Say so rather than let the card read as unqualified.
    caveatText = CAVEAT_SIGNAL
  }

  return (
    <div className="space-y-1.5">
      {open ? (
        <div className="rounded-lg border border-line bg-surface-raised px-2.5 py-1.5 text-xs leading-relaxed text-fg-muted line-clamp-3">
          <span className="font-medium text-fg">Open to anyone</span>
          {offer.text ? ` — ${offer.text}` : ''}
        </div>
      ) : (
        <div className="text-xs text-accent bg-accent-subtle border border-accent-line rounded-lg px-2.5 py-1.5 leading-relaxed line-clamp-3">
          🎁 {offer.text}
        </div>
      )}
      {caveatText && (
        <p className="flex gap-1.5 rounded-lg border border-status-warn/30 bg-status-warn-bg px-2.5 py-1.5 text-xs leading-relaxed text-status-warn">
          <span aria-hidden="true">⚠</span>
          <span className="line-clamp-4">{caveatText}</span>
        </p>
      )}
    </div>
  )
}

/** Preserve the other active filters when one of them changes. */
function buildHref(params: {
  q?: string
  category?: string
  pricing?: string
  access?: string
}): string {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.category) sp.set('category', params.category)
  if (params.pricing) sp.set('pricing', params.pricing)
  if (params.access) sp.set('access', params.access)
  const qs = sp.toString()
  return qs ? `/tools?${qs}` : '/tools'
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const { q, category, pricing, access } = searchParams

  // Categories for the sidebar.
  //
  // `?category=` used to cost a third round trip: fetch categories, then fetch
  // that same category *again* purely to turn its slug into an id, then fetch
  // tools. The sidebar list is already in memory and already contains the id,
  // so the lookup is resolved here and the page is down to two queries.
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .order('display_order')

  const activeCategory = categories?.find((c) => c.slug === category)

  // Build tools query
  let query = supabase
    .from('tools')
    .select(ELIGIBILITY_COLUMNS)
    .eq('is_verified', true)

  if (access === 'gated') {
    query = query.eq('requires_nonprofit_status', true)
  } else if (access === 'open') {
    query = query.eq('requires_nonprofit_status', false)
  }

  if (activeCategory) {
    query = query.eq('category_id', activeCategory.id)
  }

  if (pricing) {
    query = query.eq('pricing_model', pricing as 'free' | 'freemium' | 'nonprofit_discount')
  }

  if (q) {
    // Never interpolate `q` straight into the or() string — commas and
    // parentheses are filter *grammar*, not text, and a raw value silently
    // breaks the whole query. See src/lib/search-filter.ts.
    const orFilter = buildSearchOrFilter(q, ['name', 'description', 'nonprofit_deal'])
    if (orFilter) query = query.or(orFilter)
  }

  const { data: tools, error: toolsError } = await query
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })

  // An error is not an empty result. The old code destructured only `data`, so
  // a failed query — a malformed search term, a dropped connection, an RLS
  // change — rendered as a confident "No tools found. Try a different search."
  const loadError = toolsError ?? categoriesError

  return (
    <main className="min-h-screen bg-surface-subtle">
      {/* Hero bar */}
      <div className="bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-fg">
            {q ? `Results for "${q}"` : activeCategory ? `${activeCategory.icon} ${activeCategory.name}` : 'All Tools'}
          </h1>
          {/* "tools for nonprofits" is wrong when the filter is showing things
              that are explicitly not nonprofit-specific. */}
          <p className="mt-1 text-fg-muted">
            {tools?.length ?? 0}{' '}
            {access === 'open'
              ? 'tools free to anyone'
              : access === 'gated'
                ? 'nonprofit programmes'
                : `${pricing === 'free' ? 'free ' : pricing === 'nonprofit_discount' ? 'discounted ' : ''}tools for nonprofits`}
          </p>

          {/* Access filter — the distinction that actually matters.
              A nonprofit programme you can be refused for is a different thing
              from a tool that is free to everyone, and the old UI showed them
              identically. */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
              Access
            </span>
            {[
              { key: undefined, label: 'Everything' },
              { key: 'gated', label: 'Nonprofit programmes' },
              { key: 'open', label: 'Free to anyone' },
            ].map((opt) => {
              const href = buildHref({ q, category, pricing, access: opt.key })
              const active = access === opt.key
              return (
                <Link
                  key={opt.label}
                  href={href}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-accent bg-accent text-accent-fg'
                      : 'border-line bg-surface text-fg-muted hover:border-accent-line'
                  }`}
                >
                  {opt.label}
                </Link>
              )
            })}
          </div>
          <p className="mt-2 max-w-prose text-sm text-fg-muted">
            {access === 'gated'
              ? 'Programmes gated behind verified nonprofit status. There is an application, and it can be refused.'
              : access === 'open'
                ? 'Free or cheap to everyone. Being a nonprofit gets you nothing extra, and there is nothing to apply for.'
                : 'Some of these are nonprofit programmes you apply for. Others are free to anyone. Filter above to tell them apart.'}
          </p>

          {/* Quick pricing filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {pricingPills.map((pill) => {
              // "All" also clears an active category, which is why it links to
              // the bare /tools rather than through buildHref.
              const active = pill.key ? pricing === pill.key : !pricing && !category
              return (
                <Link
                  key={pill.label}
                  href={pill.key ? `/tools?pricing=${pill.key}` : '/tools'}
                  aria-current={active ? 'page' : undefined}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${active ? pill.active : pill.idle}`}
                >
                  {pill.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Category sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <p className="text-xs font-semibold text-fg-subtle uppercase tracking-wider mb-3">Categories</p>
            <nav className="space-y-0.5">
              <Link
                href="/tools"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-accent-subtle text-accent font-medium' : 'text-fg-muted hover:bg-surface-inset'}`}
              >
                <span>🗂️</span> All Categories
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tools?category=${cat.slug}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-accent-subtle text-accent font-medium' : 'text-fg-muted hover:bg-surface-inset'}`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Tools grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile category chips */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {categories?.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tools?category=${cat.slug}`}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${category === cat.slug ? 'bg-accent text-accent-fg border-accent' : 'bg-surface text-fg-muted border-line'}`}
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>

            {loadError ? (
              <div className="bg-surface rounded-2xl border border-status-warn/30 p-16 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-lg font-semibold text-fg mb-1">We couldn&apos;t load the directory</h3>
                <p className="text-fg-muted text-sm mb-1">
                  Something went wrong on our side — this is not an empty result, and your
                  search may well have matches.
                </p>
                <p className="text-status-warn text-xs mb-4 font-mono">{loadError.message}</p>
                <Link href="/tools" className="text-accent font-medium hover:text-accent-hover transition-colors text-sm">
                  Try again →
                </Link>
              </div>
            ) : !tools || tools.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-line p-16 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-fg mb-1">No tools found</h3>
                <p className="text-fg-muted text-sm mb-4">Try a different search or category</p>
                <Link href="/tools" className="text-accent font-medium hover:text-accent-hover transition-colors text-sm">
                  View all tools →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool, i) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="group bg-surface-subtle rounded-2xl border border-line p-5 hover:shadow-3 hover:border-accent-line hover:-translate-y-0.5 transition-all flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {tool.logo_url ? (
                          <ToolLogo
                            src={tool.logo_url}
                            alt={tool.name}
                            size={40}
                            /* The first row or two are above the fold on every
                               viewport; the remaining ~98 lazy-load instead of
                               opening ~104 cross-origin connections at once. */
                            eager={i < 6}
                            className="w-10 h-10 rounded-xl object-contain border border-line p-1 bg-surface-raised shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-accent-subtle flex items-center justify-center shrink-0">
                            <span className="text-accent font-bold text-sm">{tool.name[0]}</span>
                          </div>
                        )}
                        {/* min-w-0 lets the title actually shrink inside the
                            flex row. Without it a long name ("Salesforce
                            Nonprofit Cloud") refuses to give ground and runs
                            under the pricing badge. */}
                        <h2 className="min-w-0 font-semibold text-fg group-hover:text-accent transition-colors leading-tight line-clamp-2">{tool.name}</h2>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${pricingColors[tool.pricing_model] ?? 'bg-surface-inset text-fg-muted'}`}>
                        {pricingBadgeLabels[tool.pricing_model] ?? pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                      </span>
                    </div>

                    <p className="text-sm text-fg-muted line-clamp-2 leading-relaxed">{tool.description}</p>

                    {/* Gated programmes get the emphasis. Tools that are free
                        to everyone are stated plainly instead of dressed up as
                        a nonprofit perk.

                        Both branches are trimmed on the server, on sentence
                        and word boundaries, and any exclusion that will not fit
                        beside the offer is lifted into its own line so it can
                        never be the thing that gets cut. */}
                    <DealSummary
                      deal={tool.nonprofit_deal}
                      open={tool.requires_nonprofit_status === false}
                    />

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {tool.review_count > 0 && (
                          <span className="text-xs text-fg-subtle">⭐ {Number(tool.rating_avg).toFixed(1)} ({tool.review_count})</span>
                        )}
                        {(tool.using_count > 0 || tool.save_count > 0) && (
                          <span className="text-xs text-fg-subtle">
                            {[
                              tool.using_count > 0 && `${tool.using_count} using`,
                              tool.save_count  > 0 && `${tool.save_count} saved`,
                            ].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-accent group-hover:translate-x-0.5 transition-transform shrink-0">
                        Learn more →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
