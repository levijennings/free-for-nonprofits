import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

type CookiePreference = 'all' | 'essential' | 'custom';

interface CookieConsentProps {
  onAccept?: (preference: CookiePreference) => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // always on
    analytics: true,
    functional: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already set preferences
    const savedPreference = localStorage.getItem('cookiePreference');
    if (!savedPreference) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const preference: CookiePreference = 'all';
    saveCookiePreference(preference, {
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
    });
    onAccept?.(preference);
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    const preference: CookiePreference = 'essential';
    saveCookiePreference(preference, {
      essential: true,
      analytics: false,
      functional: true,
      marketing: false,
    });
    onAccept?.(preference);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const preference: CookiePreference = 'custom';
    saveCookiePreference(preference, preferences);
    onAccept?.(preference);
    setIsVisible(false);
  };

  const saveCookiePreference = (
    preference: CookiePreference,
    prefs: typeof preferences
  ) => {
    // Save to cookie (not localStorage as per policy)
    document.cookie = `cookiePreference=${preference};max-age=${365 * 24 * 60 * 60};path=/;SameSite=Lax`;
    document.cookie = `cookiePrefs=${JSON.stringify(prefs)};max-age=${365 * 24 * 60 * 60};path=/;SameSite=Lax`;
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'essential') return; // Can't toggle essential
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Consent Banner */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-2xl animate-slide-up"
        role="region"
        aria-label="Cookie consent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cookie Preferences
                </h3>
                <p className="text-gray-600 text-sm">
                  We use cookies to enhance your experience, analyze site usage, and
                  assist with our marketing efforts. You can customize your cookie
                  preferences below.
                </p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                aria-label="Close cookie consent"
              >
                <X size={24} />
              </button>
            </div>

            {/* Expandable Details */}
            {!isExpanded ? (
              <button
                onClick={() => setIsExpanded(true)}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <ChevronDown size={16} />
                Customize Preferences
              </button>
            ) : (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                {/* Essential Cookies - Always On */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="font-medium text-gray-900">
                      Essential Cookies
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-5 h-5 text-blue-600 cursor-not-allowed opacity-50"
                    aria-label="Essential cookies toggle"
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="font-medium text-gray-900">
                      Analytics Cookies
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Help us understand how you use the site and improve functionality.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => togglePreference('analytics')}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                    aria-label="Analytics cookies toggle"
                  />
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="font-medium text-gray-900">
                      Functional Cookies
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Remember your preferences and settings for a better experience.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={() => togglePreference('functional')}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                    aria-label="Functional cookies toggle"
                  />
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="font-medium text-gray-900">
                      Marketing Cookies
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Used to deliver personalized ads and track marketing effectiveness.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => togglePreference('marketing')}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                    aria-label="Marketing cookies toggle"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSavePreferences}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Preferences
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!isExpanded && (
                <>
                  <button
                    onClick={handleRejectNonEssential}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Essential Only
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Accept All
                  </button>
                </>
              )}
            </div>

            {/* Privacy Link */}
            <p className="text-xs text-gray-600 text-center">
              See our{' '}
              <a href="/legal/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              {' '}and{' '}
              <a href="/legal/cookies" className="text-blue-600 hover:underline">
                Cookie Policy
              </a>
              {' '}for more information.
            </p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default CookieConsent;
