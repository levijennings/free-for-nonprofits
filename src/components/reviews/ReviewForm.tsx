'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  rating: number
  comment: string | null
}

interface Props {
  toolId: string
  toolName: string
  onReviewSubmitted?: () => void
}

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-8 h-8 transition-colors ${filled ? 'text-amber-400' : 'text-gray-200'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export default function ReviewForm({ toolId, toolName, onReviewSubmitted }: Props) {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [editing, setEditing] = useState(false)

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    supabase
      .from('reviews')
      .select('id, rating, comment')
      .eq('tool_id', toolId)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setExistingReview(data)
          setRating(data.rating)
          setComment(data.comment ?? '')
        }
      })
  }, [user, toolId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError('Please select a star rating'); return }
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_id: toolId, rating, comment }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setSubmitting(false)
      return
    }

    setExistingReview({ id: '', rating, comment: comment || null })
    setEditing(false)
    setSubmitted(true)
    setSubmitting(false)
    onReviewSubmitted?.()
  }

  if (loading) return null

  if (!user) {
    return (
      <div className="text-center py-5 border border-dashed border-gray-200 rounded-xl">
        <p className="text-sm text-gray-500 mb-3">Sign in to rate and review this resource</p>
        <a
          href="/login"
          className="inline-block px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Sign in to review
        </a>
      </div>
    )
  }

  // Show existing review (not editing)
  if (existingReview && !editing) {
    return (
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-brand-700">Your review</p>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="flex gap-0.5 mb-2">
          {[1,2,3,4,5].map(s => (
            <svg key={s} className={`w-4 h-4 ${s <= existingReview.rating ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-gray-500 ml-1">{ratingLabels[existingReview.rating]}</span>
        </div>
        {existingReview.comment && (
          <p className="text-sm text-gray-700">{existingReview.comment}</p>
        )}
        {submitted && (
          <p className="text-xs text-brand-600 mt-2 font-medium">✓ Review saved</p>
        )}
      </div>
    )
  }

  // Submit/edit form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {editing && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Edit your review</p>
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">
            Cancel
          </button>
        </div>
      )}

      {/* Star rating */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="hover:scale-110 transition-transform focus:outline-none"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <StarIcon filled={star <= (hoverRating || rating)} />
            </button>
          ))}
        </div>
        {(hoverRating || rating) > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {ratingLabels[hoverRating || rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label className="text-sm font-medium text-gray-700" htmlFor="review-comment">
          Comment <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={`How has ${toolName} helped your nonprofit?`}
          rows={3}
          maxLength={1000}
          className="mt-1.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none placeholder:text-gray-400"
        />
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {submitting ? 'Saving…' : editing ? 'Update review' : 'Submit review'}
      </button>
    </form>
  )
}
