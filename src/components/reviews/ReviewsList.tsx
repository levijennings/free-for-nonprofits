interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  user_id: string
}

interface Props {
  reviews: Review[]
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function avatarColor(userId: string) {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
  ]
  const index = userId.charCodeAt(0) % colors.length
  return colors[index]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ReviewsList({ reviews }: Props) {
  if (reviews.length === 0) return null

  return (
    <div className="divide-y divide-gray-100">
      {reviews.map(review => (
        <div key={review.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-center gap-2.5 mb-2">
            {/* Avatar — anonymous but color-coded per user */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(review.user_id)}`}>
              {review.user_id.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              <Stars rating={review.rating} />
              <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-gray-700 leading-relaxed ml-9">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}
