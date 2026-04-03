import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Mock Button component for testing
 * In a real scenario, this would import from @/components/ui/Button
 */
const Button = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50',
    ghost: 'text-blue-600 hover:bg-blue-50',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${sizeClasses[size]} transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
    })

    it('should apply primary variant styles by default', () => {
      render(<Button>Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-blue-600')
      expect(button).toHaveClass('text-white')
    })

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Cancel</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-200')
    })

    it('should apply outline variant styles', () => {
      render(<Button variant="outline">Learn More</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
    })

    it('should apply ghost variant styles', () => {
      render(<Button variant="ghost">Link</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-blue-600')
    })

    it('should render with custom className', () => {
      render(<Button className="custom-class">Styled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Size Variants', () => {
    it('should apply small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-2')
      expect(button).toHaveClass('py-1')
      expect(button).toHaveClass('text-sm')
    })

    it('should apply medium size by default', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4')
      expect(button).toHaveClass('py-2')
      expect(button).toHaveClass('text-base')
    })

    it('should apply large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-6')
      expect(button).toHaveClass('py-3')
      expect(button).toHaveClass('text-lg')
    })
  })

  describe('Disabled State', () => {
    it('should render disabled button', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should apply disabled styles', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled:opacity-50')
      expect(button).toHaveClass('disabled:cursor-not-allowed')
    })

    it('should not trigger onClick when disabled', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Disabled</Button>)
      const button = screen.getByRole('button')

      await userEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Click Events', () => {
    it('should trigger onClick handler', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)
      const button = screen.getByRole('button')

      await userEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple clicks', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)
      const button = screen.getByRole('button')

      await userEvent.click(button)
      await userEvent.click(button)
      await userEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('should handle keyboard activation (Enter)', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Press Enter</Button>)
      const button = screen.getByRole('button')

      button.focus()
      await userEvent.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalled()
    })

    it('should handle keyboard activation (Space)', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Press Space</Button>)
      const button = screen.getByRole('button')

      button.focus()
      await userEvent.keyboard(' ')
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('Combination Variants', () => {
    it('should apply primary outline large', () => {
      render(<Button variant="outline" size="lg">Primary Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
      expect(button).toHaveClass('px-6')
    })

    it('should apply secondary small', () => {
      render(<Button variant="secondary" size="sm">Secondary Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-200')
      expect(button).toHaveClass('text-sm')
    })

    it('should apply ghost large disabled', () => {
      render(
        <Button variant="ghost" size="lg" disabled>
          Disabled Large
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-blue-600')
      expect(button).toHaveClass('px-6')
      expect(button).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard focusable', async () => {
      render(<Button>Focusable</Button>)
      const button = screen.getByRole('button')

      button.focus()
      expect(button).toHaveFocus()
    })

    it('should have proper button role', () => {
      render(<Button>Button</Button>)
      const button = screen.getByRole('button')
      expect(button.tagName).toBe('BUTTON')
    })

    it('should announce disabled state', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button', { hidden: true })
      expect(button).toBeDisabled()
    })
  })
})
