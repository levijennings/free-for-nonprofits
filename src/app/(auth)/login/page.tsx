import Link from 'next/link'
import { login } from './actions'

interface Props {
  searchParams: { error?: string }
}

export default function LoginPage({ searchParams }: Props) {
  const hasError = searchParams.error === '1'

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
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-gray-500">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form action={login} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@yournonprofit.org"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/reset-password" className="text-xs text-brand-500 hover:text-brand-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {hasError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                Invalid email or password. Please try again.
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-brand-500 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-brand-500 font-medium hover:text-brand-700 transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
