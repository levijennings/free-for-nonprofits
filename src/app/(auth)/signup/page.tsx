'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: orgName || email.split('@')[0],
          org_name: orgName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="text-brand-500 font-medium hover:text-brand-700 transition-colors">
            Back to sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="white"
                  d="M13.5 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H13.5L19 10L13.5 2ZM15.8 10C15.8 9.23 15.17 8.6 14.4 8.6C13.63 8.6 13 9.23 13 10C13 10.77 13.63 11.4 14.4 11.4C15.17 11.4 15.8 10.77 15.8 10Z"
                />
              </svg>
            </div>
            <div className="leading-none text-left">
              <div className="text-[9px] font-bold text-gray-400 tracking-[0.18em] uppercase">Free For</div>
              <div className="text-[17px] font-extrabold tracking-tight text-gray-900 -mt-0.5">
                Non<span className="text-brand-600">Profits</span>
              </div>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Claim your free tools</h1>
          <p className="mt-2 text-gray-500">Save programs, track your tech stack, get notified of new deals.</p>
          <div className="mt-3 flex flex-col gap-1.5 text-sm text-left bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <p className="font-semibold text-green-800 mb-1">What you unlock:</p>
            <p className="text-green-700">✅ Google Ad Grants — $10K/month in free advertising</p>
            <p className="text-green-700">✅ Step-by-step claim guides for every tool</p>
            <p className="text-green-700">✅ Save tools to your nonprofit&apos;s tech stack</p>
            <p className="text-green-700">✅ New deal alerts as programs are added</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organization name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Habitat for Humanity Chicago"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Work email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yournonprofit.org"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-500 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-500 font-medium hover:text-brand-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          By creating an account, you agree to our{' '}
          <Link href="/legal/terms" className="underline hover:text-gray-600">Terms</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
