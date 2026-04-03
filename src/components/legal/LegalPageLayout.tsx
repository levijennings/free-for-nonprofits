import React, { useState } from 'react';
import { ChevronDown, FileText, Print } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  level: 'h1' | 'h2' | 'h3';
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  sections?: Section[];
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  lastUpdated,
  children,
  sections = [],
}) => {
  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors print:hidden"
              aria-label="Print page"
            >
              <Print size={18} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sidebar */}
          <aside className="lg:col-span-1 print:hidden">
            <div className="sticky top-24 bg-white rounded-lg border border-gray-200 p-4">
              <button
                onClick={() => setIsTableOfContentsOpen(!isTableOfContentsOpen)}
                className="w-full flex items-center justify-between gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
              >
                <div className="flex items-center gap-2">
                  <FileText size={20} />
                  <span>Contents</span>
                </div>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    isTableOfContentsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isTableOfContentsOpen && (
                <nav className="mt-4 space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`block w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition-colors ${
                        section.level === 'h2'
                          ? 'font-medium text-gray-700 ml-0'
                          : section.level === 'h3'
                          ? 'text-gray-600 text-sm ml-4'
                          : 'font-semibold text-gray-900'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 bg-white rounded-lg p-8 shadow-sm">
            <div className="prose prose-lg max-w-none">
              {children}
            </div>

            {/* Footer Meta */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-600">
              <p>
                This legal document was last updated in {lastUpdated}. We reserve
                the right to update these terms at any time. Please check back
                regularly for updates.
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\:hidden {
            display: none;
          }

          body {
            background-color: white;
          }

          .max-w-7xl {
            max-width: 100%;
          }

          .lg\:col-span-1 {
            display: none;
          }

          .lg\:col-span-3 {
            grid-column: span 3;
            box-shadow: none;
            border-radius: 0;
          }

          h1,
          h2,
          h3 {
            page-break-after: avoid;
          }

          p,
          li {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default LegalPageLayout;
