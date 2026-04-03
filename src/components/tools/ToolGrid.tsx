import React from 'react';
import { ToolCard, Tool } from './ToolCard';
import { EmptyState } from '../ui/EmptyState';
import { Search } from 'lucide-react';

interface ToolGridProps {
  tools: Tool[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ tools, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No tools found"
        description="Try adjusting your search filters or browse all tools."
        action={onRefresh ? { label: 'Clear filters', onClick: onRefresh } : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
};

ToolGrid.displayName = 'ToolGrid';
