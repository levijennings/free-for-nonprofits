import { Skeleton, ProgramRowSkeleton } from '@/components/ui/Skeleton'

/**
 * The qualifier answers live in the URL, so submitting the form is a
 * navigation, and the match runs a full scan across the catalogue on the
 * server. Without a boundary of its own this route inherited nothing and the
 * page simply sat there — the button looked broken on a slow connection.
 *
 * The shape mirrors the real page (heading, question card, results table) so
 * the swap doesn't move anything, and the status line says what is actually
 * happening rather than "Loading…".
 */
export default function EligibilityLoading() {
  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Skeleton variant="text" className="h-9 w-3/4 max-w-lg" />
          <Skeleton variant="text" className="mt-4 w-full max-w-prose" />
          <Skeleton variant="text" className="mt-2 w-2/3 max-w-prose" />
        </div>

        <div className="rounded-lg border border-line bg-surface p-6 shadow-1 sm:p-8">
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2.5">
                <Skeleton variant="text" className="h-3 w-40" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton variant="block" className="h-9 w-28" />
                  <Skeleton variant="block" className="h-9 w-32" />
                  <Skeleton variant="block" className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-line bg-surface shadow-1">
          <p
            role="status"
            aria-live="polite"
            className="border-b border-line px-[18px] py-3.5 text-sm font-medium text-fg-muted"
          >
            Checking every programme against your answers…
          </p>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ProgramRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
