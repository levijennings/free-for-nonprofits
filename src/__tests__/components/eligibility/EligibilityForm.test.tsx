import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EligibilityForm from '@/components/eligibility/EligibilityForm'

const push = vi.fn()
let searchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => searchParams,
  usePathname: () => '/eligibility',
}))

beforeEach(() => {
  push.mockClear()
  searchParams = new URLSearchParams()
})

function orgGroup() {
  return screen.getAllByRole('radiogroup')[0]
}

describe('EligibilityForm — radio group semantics', () => {
  it('exposes each question as a named radiogroup of radios, not toggle buttons', () => {
    render(<EligibilityForm />)

    const groups = screen.getAllByRole('radiogroup')
    expect(groups).toHaveLength(3)
    expect(groups[0]).toHaveAccessibleName(/What kind of organisation are you\?/)
    expect(groups[1]).toHaveAccessibleName(/Where are you registered\?/)

    expect(within(groups[0]).getAllByRole('radio')).toHaveLength(5)
    // The old markup used aria-pressed, which announces independent toggles.
    expect(screen.queryByRole('button', { pressed: false })).toBeNull()
  })

  it('is a single tab stop: only one radio per group is tabbable', async () => {
    render(<EligibilityForm />)
    const radios = within(orgGroup()).getAllByRole('radio')

    expect(radios[0]).toHaveAttribute('tabindex', '0')
    radios.slice(1).forEach((r) => expect(r).toHaveAttribute('tabindex', '-1'))

    await userEvent.click(radios[2])
    // The tabbable radio follows the selection.
    expect(radios[2]).toHaveAttribute('tabindex', '0')
    expect(radios[0]).toHaveAttribute('tabindex', '-1')
  })
})

describe('EligibilityForm — radio group keyboard behaviour', () => {
  it('moves focus and selection with the arrow keys, wrapping at both ends', async () => {
    render(<EligibilityForm />)
    const radios = within(orgGroup()).getAllByRole('radio')

    radios[0].focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(radios[1]).toHaveFocus()
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')

    await userEvent.keyboard('{ArrowDown}')
    expect(radios[2]).toHaveFocus()

    await userEvent.keyboard('{ArrowUp}')
    expect(radios[1]).toHaveFocus()

    await userEvent.keyboard('{ArrowLeft}')
    expect(radios[0]).toHaveFocus()

    // Wraps backwards from the first to the last...
    await userEvent.keyboard('{ArrowLeft}')
    expect(radios[4]).toHaveFocus()
    expect(radios[4]).toHaveAttribute('aria-checked', 'true')

    // ...and forwards from the last to the first.
    await userEvent.keyboard('{ArrowRight}')
    expect(radios[0]).toHaveFocus()
  })

  it('jumps to the ends with Home and End', async () => {
    render(<EligibilityForm />)
    const radios = within(orgGroup()).getAllByRole('radio')

    radios[1].focus()
    await userEvent.keyboard('{End}')
    expect(radios[4]).toHaveFocus()
    expect(radios[4]).toHaveAttribute('aria-checked', 'true')

    await userEvent.keyboard('{Home}')
    expect(radios[0]).toHaveFocus()
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
  })

  it('reaches the group with one Tab and leaves it with the next', async () => {
    render(<EligibilityForm />)
    const groups = screen.getAllByRole('radiogroup')
    const first = within(groups[0]).getAllByRole('radio')
    const second = within(groups[1]).getAllByRole('radio')

    await userEvent.tab()
    expect(first[0]).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    expect(first[1]).toHaveFocus()

    // Tab exits the whole group rather than walking its options.
    await userEvent.tab()
    expect(second[0]).toHaveFocus()
  })
})

describe('EligibilityForm — URL parameters are validated on read', () => {
  it('discards an org type that is not one of the options', () => {
    searchParams = new URLSearchParams('org=charity&country=US&budget=250000')
    render(<EligibilityForm />)

    within(orgGroup())
      .getAllByRole('radio')
      .forEach((r) => expect(r).toHaveAttribute('aria-checked', 'false'))
    expect(screen.getByText(/organisation type still needed/)).toBeInTheDocument()
  })

  it('discards a budget that is not a number, and one that is not a band', () => {
    searchParams = new URLSearchParams('org=nonprofit_501c3&country=US&budget=abc')
    const { unmount } = render(<EligibilityForm />)
    expect(screen.getByText(/budget still needed/)).toBeInTheDocument()
    unmount()

    searchParams = new URLSearchParams('org=nonprofit_501c3&country=US&budget=999')
    render(<EligibilityForm />)
    expect(screen.getByText(/budget still needed/)).toBeInTheDocument()
  })

  it('does not navigate while an invalid parameter leaves the form incomplete', async () => {
    searchParams = new URLSearchParams('org=charity&country=XX&budget=abc')
    render(<EligibilityForm />)

    await userEvent.click(screen.getByRole('button', { name: /show what i qualify for/i }))
    expect(push).not.toHaveBeenCalled()
  })

  it('accepts valid parameters', () => {
    searchParams = new URLSearchParams('org=school&country=GB&budget=250000')
    render(<EligibilityForm />)

    expect(
      screen.getByRole('radio', { name: /School, college or university/ })
    ).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'United Kingdom' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })
})

describe('EligibilityForm — submit button', () => {
  it('stays in the tab order when incomplete and reports what is missing', async () => {
    render(<EligibilityForm />)

    const button = screen.getByRole('button', { name: /show what i qualify for/i })
    expect(button).toBeEnabled()

    const hint = screen.getByText(/organisation type, country, budget still needed/)
    expect(button).toHaveAttribute('aria-describedby', hint.id)
    expect(hint).toHaveAttribute('aria-live', 'polite')

    // Activation moves focus into the first unanswered question.
    await userEvent.click(button)
    expect(push).not.toHaveBeenCalled()
    expect(within(orgGroup()).getAllByRole('radio')[0]).toHaveFocus()
  })

  it('navigates once every question is answered', async () => {
    render(<EligibilityForm />)

    await userEvent.click(screen.getByRole('radio', { name: /501\(c\)\(3\) public charity/ }))
    await userEvent.click(screen.getByRole('radio', { name: 'United States' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Under $250k' }))
    await userEvent.click(screen.getByRole('button', { name: /show what i qualify for/i }))

    expect(push).toHaveBeenCalledWith(
      '/eligibility?org=nonprofit_501c3&country=US&budget=250000',
      { scroll: true }
    )
  })
})
