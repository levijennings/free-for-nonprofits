'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  isAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 font-[family-name:var(--font-plus-jakarta-sans)]">
            <span className="text-2xl font-bold text-blue-600">Free For NonProfits</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/browse"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Browse Tools
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Categories
            </Link>
            <Link
              href="/submit"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Submit Tool
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <button className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors font-medium">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-3">
              <Link
                href="/browse"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Browse Tools
              </Link>
              <Link
                href="/categories"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/submit"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Submit Tool
              </Link>

              <div className="border-t border-gray-200 pt-3 mt-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

Header.displayName = 'Header';
