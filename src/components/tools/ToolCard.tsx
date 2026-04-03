import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';

export interface Tool {
  id: string;
  name: string;
  logo?: string;
  category: string;
  pricingModel: 'free' | 'freemium' | 'paid';
  rating: number;
  reviews: number;
  description: string;
}

interface ToolCardProps {
  tool: Tool;
}

const pricingBadgeVariant: Record<Tool['pricingModel'], 'default' | 'success' | 'warning' | 'info'> = {
  free: 'success',
  freemium: 'info',
  paid: 'warning',
};

const pricingBadgeLabel: Record<Tool['pricingModel'], string> = {
  free: 'Free',
  freemium: 'Freemium',
  paid: 'Paid',
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  return (
    <Card hoverable className="flex flex-col h-full overflow-hidden">
      <CardBody className="flex flex-col flex-1">
        {/* Logo and Header */}
        <div className="flex items-start justify-between mb-3">
          {tool.logo && (
            <img
              src={tool.logo}
              alt={`${tool.name} logo`}
              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
            />
          )}
          <Badge variant={pricingBadgeVariant[tool.pricingModel]}>
            {pricingBadgeLabel[tool.pricingModel]}
          </Badge>
        </div>

        {/* Title and Category */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{tool.name}</h3>
        <Badge variant="outline" className="w-fit mb-3">
          {tool.category}
        </Badge>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">{tool.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <StarRating rating={tool.rating} size="sm" showText />
          <span className="text-xs text-gray-500">({tool.reviews} reviews)</span>
        </div>

        {/* View Details Link */}
        <Link
          href={`/tools/${tool.id}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group"
        >
          View Details
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardBody>
    </Card>
  );
};

ToolCard.displayName = 'ToolCard';
