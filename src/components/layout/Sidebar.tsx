import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export interface SidebarCategory {
  id: string;
  name: string;
  count: number;
  subcategories?: SidebarCategory[];
}

interface SidebarProps {
  categories: SidebarCategory[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  isOpen = true,
  onClose,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSelectCategory = (categoryId: string) => {
    onSelectCategory(categoryId);
    if (onClose) {
      onClose();
    }
  };

  const renderCategory = (category: SidebarCategory, depth: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory === category.id;
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;

    return (
      <div key={category.id}>
        <div className="flex items-center justify-between group">
          <button
            onClick={() => {
              handleSelectCategory(category.id);
              if (hasSubcategories) {
                toggleExpanded(category.id);
              }
            }}
            className={`flex-1 text-left px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              isSelected
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{ paddingLeft: `${16 + depth * 16}px` }}
          >
            {category.name}
            <span className="text-xs text-gray-500 ml-2">({category.count})</span>
          </button>

          {hasSubcategories && (
            <button
              onClick={() => toggleExpanded(category.id)}
              className="p-1 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>

        {/* Subcategories */}
        {hasSubcategories && isExpanded && (
          <div>
            {category.subcategories!.map((subcat) => renderCategory(subcat, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="bg-white border-r border-gray-200 h-full overflow-y-auto font-[family-name:var(--font-plus-jakarta-sans)]">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>

        <nav className="space-y-1">
          {/* All Tools */}
          <button
            onClick={() => handleSelectCategory('')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              selectedCategory === ''
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Tools
          </button>

          {/* Category List */}
          {categories.map((category) => renderCategory(category))}
        </nav>
      </div>
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';
