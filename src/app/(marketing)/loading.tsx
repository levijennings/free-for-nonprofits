import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Shared fallback for every marketing route. The header and footer come from
 * the layout and stay put, so only the content region swaps — no full-page
 * flash, no layout shift when the real page arrives.
 */
export default function MarketingLoading() {
  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p role="status" aria-live="polite" className="sr-only">
          Loading page
        </p>

        <Skeleton variant="text" className="h-9 w-2/3 max-w-md" />
        <Skeleton variant="text" className="mt-4 w-full max-w-prose" />
        <Skeleton variant="text" className="mt-2 w-4/5 max-w-prose" />

        <div className="mt-10 space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-line bg-surface p-5 shadow-1">
              <div className="flex items-center gap-4">
                <Skeleton variant="block" className="h-10 w-10 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton variant="text" className="w-1/3" />
                  <Skeleton variant="text" className="h-3 w-2/3" />
                </div>
                <Skeleton variant="text" className="h-6 w-20 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
