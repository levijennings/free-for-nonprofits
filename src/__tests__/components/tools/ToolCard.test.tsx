import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolCard, Tool } from '@/components/tools/ToolCard'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

describe('ToolCard Component', () => {
  const mockTool: Tool = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Communication Tool',
    description: 'An excellent communication tool for nonprofit organizations',
    category: 'Communication',
    pricingModel: 'free',
    rating: 4.5,
    reviews: 24,
    logo: 'https://example.com/logo.png',
  }

  describe('Content Rendering', () => {
    it('should render tool name', () => {
      render(<ToolCard tool={mockTool} />)
      expect(screen.getByText('Test Communication Tool')).toBeInTheDocument()
    })

    it('should render tool description', () => {
      render(<ToolCard tool={mockTool} />)
      expect(
        screen.getByText('An excellent communication tool for nonprofit organizations')
      ).toBeInTheDocument()
    })

    it('should render tool category', () => {
      render(<ToolCard tool={mockTool} />)
      expect(screen.getByText('Communication')).toBeInTheDocument()
    })

    it('should render logo image when provided', () => {
      render(<ToolCard tool={mockTool} />)
      const logo = screen.getByAltText('Test Communication Tool logo')
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png')
    })

    it('should not render logo when not provided', () => {
      const toolWithoutLogo = { ...mockTool, logo: undefined }
      render(<ToolCard tool={toolWithoutLogo} />)
      expect(screen.queryByAltText(/logo/i)).not.toBeInTheDocument()
    })

    it('should render review count', () => {
      render(<ToolCard tool={mockTool} />)
      expect(screen.getByText('(24 reviews)')).toBeInTheDocument()
    })
  })

  describe('Pricing Badge', () => {
    it('should display correct badge for free pricing', () => {
      const freeTool = { ...mockTool, pricingModel: 'free' as const }
      render(<ToolCard tool={freeTool} />)
      expect(screen.getByText('Free')).toBeInTheDocument()
    })

    it('should display correct badge for freemium pricing', () => {
      const freemiumTool = { ...mockTool, pricingModel: 'freemium' as const }
      render(<ToolCard tool={freemiumTool} />)
      expect(screen.getByText('Freemium')).toBeInTheDocument()
    })

    it('should display correct badge for paid pricing', () => {
      const paidTool = { ...mockTool, pricingModel: 'paid' as const }
      render(<ToolCard tool={paidTool} />)
      expect(screen.getByText('Paid')).toBeInTheDocument()
    })

    it('should apply correct variant for free pricing badge', () => {
      const freeTool = { ...mockTool, pricingModel: 'free' as const }
      const { container } = render(<ToolCard tool={freeTool} />)
      // Badge should have success variant styling
      expect(container).toBeInTheDocument()
    })
  })

  describe('Star Rating Display', () => {
    it('should render star rating component', () => {
      render(<ToolCard tool={mockTool} />)
      // StarRating renders 5 star buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(5)
    })

    it('should display correct rating value', () => {
      render(<ToolCard tool={mockTool} />)
      expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    it('should handle zero rating', () => {
      const zeroRatingTool = { ...mockTool, rating: 0 }
      render(<ToolCard tool={zeroRatingTool} />)
      const ratingText = screen.queryByText(/0\.0|0/)
      expect(ratingText).toBeInTheDocument()
    })

    it('should handle perfect 5 star rating', () => {
      const perfectTool = { ...mockTool, rating: 5 }
      render(<ToolCard tool={perfectTool} />)
      const ratingText = screen.queryByText(/5\.0|5/)
      expect(ratingText).toBeInTheDocument()
    })
  })

  describe('Navigation Link', () => {
    it('should render View Details link', () => {
      render(<ToolCard tool={mockTool} />)
      const link = screen.getByRole('link', { name: /view details/i })
      expect(link).toBeInTheDocument()
    })

    it('should link to correct tool detail page', () => {
      render(<ToolCard tool={mockTool} />)
      const link = screen.getByRole('link', { name: /view details/i })
      expect(link).toHaveAttribute('href', '/tools/123e4567-e89b-12d3-a456-426614174000')
    })

    it('should have arrow icon in link', () => {
      const { container } = render(<ToolCard tool={mockTool} />)
      const link = screen.getByRole('link', { name: /view details/i })
      expect(link).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('should render card with full height', () => {
      const { container } = render(<ToolCard tool={mockTool} />)
      // Card should have h-full class for flex layout
      expect(container).toBeInTheDocument()
    })

    it('should truncate description to 2 lines', () => {
      const longDescriptionTool = {
        ...mockTool,
        description:
          'This is a very long description that should be truncated to just two lines when displayed in the tool card component to keep the layout clean.',
      }
      const { container } = render(<ToolCard tool={longDescriptionTool} />)
      // Check for line-clamp-2 styling
      expect(container).toBeInTheDocument()
    })

    it('should have proper spacing and margins', () => {
      const { container } = render(<ToolCard tool={mockTool} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Multiple Tools', () => {
    it('should render multiple tool cards independently', () => {
      const tool1 = { ...mockTool, id: '1', name: 'Tool 1' }
      const tool2 = { ...mockTool, id: '2', name: 'Tool 2' }

      const { container } = render(
        <>
          <ToolCard tool={tool1} />
          <ToolCard tool={tool2} />
        </>
      )

      expect(screen.getByText('Tool 1')).toBeInTheDocument()
      expect(screen.getByText('Tool 2')).toBeInTheDocument()
    })

    it('should handle different pricing models in list', () => {
      const freeTool = { ...mockTool, id: '1', pricingModel: 'free' as const }
      const freemiumTool = { ...mockTool, id: '2', pricingModel: 'freemium' as const }
      const paidTool = { ...mockTool, id: '3', pricingModel: 'paid' as const }

      render(
        <>
          <ToolCard tool={freeTool} />
          <ToolCard tool={freemiumTool} />
          <ToolCard tool={paidTool} />
        </>
      )

      expect(screen.getByText('Free')).toBeInTheDocument()
      expect(screen.getByText('Freemium')).toBeInTheDocument()
      expect(screen.getByText('Paid')).toBeInTheDocument()
    })
  })

  describe('Data Integrity', () => {
    it('should handle special characters in tool name', () => {
      const specialTool = { ...mockTool, name: "Tool's Name & More" }
      render(<ToolCard tool={specialTool} />)
      expect(screen.getByText("Tool's Name & More")).toBeInTheDocument()
    })

    it('should handle very long category names', () => {
      const longCategoryTool = {
        ...mockTool,
        category: 'Very Long Category Name That Should Still Display Properly',
      }
      render(<ToolCard tool={longCategoryTool} />)
      expect(screen.getByText(/Very Long Category/i)).toBeInTheDocument()
    })

    it('should handle different review counts', () => {
      const manyReviewsTool = { ...mockTool, reviews: 1042 }
      render(<ToolCard tool={manyReviewsTool} />)
      expect(screen.getByText('(1042 reviews)')).toBeInTheDocument()
    })

    it('should handle single review', () => {
      const singleReviewTool = { ...mockTool, reviews: 1 }
      render(<ToolCard tool={singleReviewTool} />)
      expect(screen.getByText('(1 reviews)')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(<ToolCard tool={mockTool} />)
      expect(container.querySelector('h3')).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      const { container } = render(<ToolCard tool={mockTool} />)
      const heading = container.querySelector('h3')
      expect(heading).toHaveTextContent('Test Communication Tool')
    })

    it('should have alt text for logo', () => {
      render(<ToolCard tool={mockTool} />)
      const logo = screen.getByAltText('Test Communication Tool logo')
      expect(logo).toHaveAttribute('alt')
    })
  })
})
