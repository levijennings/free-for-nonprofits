// Rules-based tool ranking used to personalize "Recommended for you" and the
// weekly digest. Pure + framework-agnostic so it can run on the server or in a job.

export interface RankableTool {
  category_slug?: string | null
  pricing_model?: string | null
  save_count?: number | null
}

export interface TargetingSignals {
  /** Category slugs the user follows or selected in the survey. */
  categorySlugs?: string[]
  /** Pricing models the user prefers (e.g. 'free', 'nonprofit_discount'). */
  pricingModels?: string[]
}

export function scoreTool(tool: RankableTool, signals: TargetingSignals): number {
  const cats = new Set(signals.categorySlugs ?? [])
  const pricing = new Set(signals.pricingModels ?? [])
  let score = 0
  if (tool.category_slug && cats.has(tool.category_slug)) score += 10
  if (tool.pricing_model && pricing.has(tool.pricing_model)) score += 5
  // Light popularity tiebreaker, capped so it never outweighs a real match.
  score += Math.min(tool.save_count ?? 0, 20) / 10
  return score
}

/** Returns a new array sorted best-match first. Does not mutate the input. */
export function rankTools<T extends RankableTool>(tools: T[], signals: TargetingSignals): T[] {
  return [...tools].sort((a, b) => scoreTool(b, signals) - scoreTool(a, signals))
}
