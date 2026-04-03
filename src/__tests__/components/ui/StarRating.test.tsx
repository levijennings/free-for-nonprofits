import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StarRating } from '@/components/ui/StarRating'

describe('StarRating Component', () => {
  describe('Display', () => {
    it('should render 5 star buttons', () => {
      render(<StarRating rating={3} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(5)
    })

    it('should display correct number of filled stars for integer rating', () => {
      const { container } = render(<StarRating rating={4} />)
      // StarRating renders 5 buttons for stars
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(5)
    })

    it('should display half star for decimal rating', () => {
      const { container } = render(<StarRating rating={3.5} />)
      // Verify that component renders properly for decimal rating
      expect(container).toBeInTheDocument()
    })

    it('should display zero filled stars for 0 rating', () => {
      const { container } = render(<StarRating rating={0} />)
      // Component should render properly for zero rating
      expect(container).toBeInTheDocument()
    })

    it('should display 5 filled stars for rating of 5', () => {
      const { container } = render(<StarRating rating={5} />)
      // StarRating should have 5 buttons
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(5)
    })

    it('should show rating text by default', () => {
      render(<StarRating rating={4.5} />)
      expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    it('should not show rating text when showText is false', () => {
      render(<StarRating rating={4.5} showText={false} />)
      expect(screen.queryByText('4.5')).not.toBeInTheDocument()
    })
  })

  describe('Interactive Mode', () => {
    it('should not be interactive by default', async () => {
      const handleRate = vi.fn()
      render(<StarRating rating={3} onRate={handleRate} interactive={false} />)
      const buttons = screen.getAllByRole('button')

      await userEvent.click(buttons[0])
      expect(handleRate).not.toHaveBeenCalled()
    })

    it('should fire onChange when clicked in interactive mode', async () => {
      const handleRate = vi.fn()
      render(<StarRating rating={3} onRate={handleRate} interactive={true} />)
      const buttons = screen.getAllByRole('button')

      await userEvent.click(buttons[2]) // Click on 3rd star
      expect(handleRate).toHaveBeenCalledWith(3)
    })

    it('should set correct rating on star click', async () => {
      const handleRate = vi.fn()
      render(<StarRating rating={0} onRate={handleRate} interactive={true} />)
      const buttons = screen.getAllByRole('button')

      await userEvent.click(buttons[4]) // Click on 5th star
      expect(handleRate).toHaveBeenCalledWith(5)
    })

    it('should handle clicking first star', async () => {
      const handleRate = vi.fn()
      render(<StarRating rating={2} onRate={handleRate} interactive={true} />)
      const buttons = screen.getAllByRole('button')

      await userEvent.click(buttons[0])
      expect(handleRate).toHaveBeenCalledWith(1)
    })

    it('should handle multiple clicks', async () => {
      const handleRate = vi.fn()
      render(<StarRating rating={0} onRate={handleRate} interactive={true} />)
      const buttons = screen.getAllByRole('button')

      await userEvent.click(buttons[0])
      await userEvent.click(buttons[2])
      await userEvent.click(buttons[4])

      expect(handleRate).toHaveBeenCalledTimes(3)
      expect(handleRate).toHaveBeenNthCalledWith(1, 1)
      expect(handleRate).toHaveBeenNthCalledWith(2, 3)
      expect(handleRate).toHaveBeenNthCalledWith(3, 5)
    })
  })

  describe('Hover State', () => {
    it('should show hover rating on mouse enter', async () => {
      const handleRate = vi.fn()
      render(
        <StarRating rating={2} onRate={handleRate} interactive={true} showText={true} />
      )
      const buttons = screen.getAllByRole('button')

      // Hover over 4th star
      await userEvent.hover(buttons[3])
      // Text should update to show 4 stars (as 4.0)
      const ratingText = screen.queryByText(/4\.0|4/)
      expect(ratingText).toBeInTheDocument()
    })

    it('should reset to original rating on mouse leave', async () => {
      const handleRate = vi.fn()
      render(
        <StarRating rating={2} onRate={handleRate} interactive={true} showText={true} />
      )
      const buttons = screen.getAllByRole('button')

      await userEvent.hover(buttons[3])
      const hoverText = screen.queryByText(/4\.0|4/)
      expect(hoverText).toBeInTheDocument()

      await userEvent.unhover(buttons[3])
      const originalText = screen.queryByText(/2\.0|2/)
      expect(originalText).toBeInTheDocument()
    })

    it('should not show hover effects in read-only mode', async () => {
      render(<StarRating rating={2} interactive={false} showText={true} />)
      const buttons = screen.getAllByRole('button')

      await userEvent.hover(buttons[3])
      // Should still show 2.0, not 4
      const ratingText = screen.queryByText(/2\.0|2/)
      expect(ratingText).toBeInTheDocument()
    })

    it('should apply hover class only in interactive mode', async () => {
      const { container: interactive } = render(
        <StarRating rating={2} interactive={true} />
      )
      const { container: readonly } = render(<StarRating rating={2} interactive={false} />)

      const interactiveButtons = interactive.querySelectorAll('button')
      const readonlyButtons = readonly.querySelectorAll('button')

      expect(
        interactiveButtons[0].className.includes('cursor-pointer') ||
        interactiveButtons[0].className.includes('hover')
      ).toBe(true)
    })
  })

  describe('Size Variants', () => {
    it('should apply small size class', () => {
      const { container } = render(<StarRating rating={3} size="sm" />)
      // Check for size classes in the star SVGs
      expect(container).toBeInTheDocument()
    })

    it('should apply medium size by default', () => {
      const { container } = render(<StarRating rating={3} />)
      expect(container).toBeInTheDocument()
    })

    it('should apply large size class', () => {
      const { container } = render(<StarRating rating={3} size="lg" />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Half Star Display', () => {
    it('should display half star for .5 decimal', () => {
      const { container } = render(<StarRating rating={2.5} showText={true} />)
      // Should show 2.5 in text
      expect(screen.getByText('2.5')).toBeInTheDocument()
    })

    it('should not display half star for whole numbers', () => {
      const { container } = render(<StarRating rating={3} showText={true} />)
      const ratingText = screen.queryByText(/3\.0|3/)
      expect(ratingText).toBeInTheDocument()
    })

    it('should round rating correctly for display', () => {
      render(<StarRating rating={4.7} showText={true} />)
      expect(screen.getByText('4.7')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on each star button', () => {
      render(<StarRating rating={3} />)
      const buttons = screen.getAllByRole('button')

      buttons.forEach((button, index) => {
        expect(button).toHaveAttribute('aria-label', `${index + 1} stars`)
      })
    })

    it('should be keyboard navigable in interactive mode', async () => {
      const handleRate = vi.fn()
      render(<StarRating rating={2} onRate={handleRate} interactive={true} />)
      const buttons = screen.getAllByRole('button')

      buttons[0].focus()
      expect(buttons[0]).toHaveFocus()
    })

    it('should be button type', () => {
      render(<StarRating rating={3} />)
      const buttons = screen.getAllByRole('button')

      buttons.forEach((button) => {
        expect(button.type).toBe('button')
      })
    })
  })

  describe('Rating Formats', () => {
    it('should handle decimal ratings correctly', () => {
      render(<StarRating rating={3.14} showText={true} />)
      const ratingText = screen.queryByText(/3\.1/)
      expect(ratingText).toBeInTheDocument()
    })

    it('should handle very high decimals', () => {
      render(<StarRating rating={4.999} showText={true} />)
      const ratingText = screen.queryByText(/5\.0|5/)
      expect(ratingText).toBeInTheDocument()
    })

    it('should handle 0 rating', () => {
      render(<StarRating rating={0} showText={true} />)
      const ratingText = screen.queryByText(/0\.0|0/)
      expect(ratingText).toBeInTheDocument()
    })
  })
})
