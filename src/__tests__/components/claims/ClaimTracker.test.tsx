import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ClaimTracker from '@/components/claims/ClaimTracker'

const TOOL_ID = '11111111-2222-3333-4444-555555555555'

function ok(body: unknown = { data: null }) {
  return { ok: true, status: 200, json: async () => body } as Response
}

function fail(status = 500) {
  return { ok: false, status, json: async () => ({}) } as Response
}

const fetchMock = vi.mocked(global.fetch)

beforeEach(() => {
  fetchMock.mockReset()
})

function renderTracker(
  initialClaim: Parameters<typeof ClaimTracker>[0]['initialClaim'] = null
) {
  return render(
    <ClaimTracker toolId={TOOL_ID} toolName="Slack" initialClaim={initialClaim} />
  )
}

function radios() {
  return within(screen.getByRole('radiogroup')).getAllByRole('radio')
}

describe('ClaimTracker — radio group semantics', () => {
  it('is a named radiogroup of radios rather than a row of pressed toggles', () => {
    renderTracker()
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAccessibleName('Where are you with Slack?')
    expect(within(group).getAllByRole('radio')).toHaveLength(4)
    expect(screen.queryByRole('button', { pressed: false })).toBeNull()
  })

  it('exposes exactly one tab stop, on the checked option', () => {
    renderTracker({ status: 'applied', note: null, applied_at: null })
    const options = radios()
    expect(options[2]).toHaveAttribute('aria-checked', 'true')
    expect(options[2]).toHaveAttribute('tabindex', '0')
    options
      .filter((_, i) => i !== 2)
      .forEach((r) => expect(r).toHaveAttribute('tabindex', '-1'))
  })
})

describe('ClaimTracker — radio group keyboard behaviour', () => {
  it('moves focus with the arrows without saving, and commits on Space', async () => {
    fetchMock.mockResolvedValue(ok())
    renderTracker()
    const options = radios()

    options[0].focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(options[2]).toHaveFocus()
    // Selection does NOT follow focus here: each selection is a server write,
    // so arrowing past two options must not fire two saves.
    expect(fetchMock).not.toHaveBeenCalled()
    expect(options[0]).toHaveAttribute('aria-checked', 'true')
    expect(options[2]).toHaveAttribute('aria-checked', 'false')
    // The roving tab stop follows focus.
    expect(options[2]).toHaveAttribute('tabindex', '0')
    expect(options[0]).toHaveAttribute('tabindex', '-1')

    await userEvent.keyboard(' ')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(options[2]).toHaveAttribute('aria-checked', 'true')
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      tool_id: TOOL_ID,
      status: 'applied',
    })
  })

  it('wraps in both directions and honours Home and End', async () => {
    renderTracker()
    const options = radios()

    options[0].focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(options[3]).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}')
    expect(options[0]).toHaveFocus()

    await userEvent.keyboard('{End}')
    expect(options[3]).toHaveFocus()

    await userEvent.keyboard('{Home}')
    expect(options[0]).toHaveFocus()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('keeps focus on the activated option while the save is in flight', async () => {
    let resolve: (r: Response) => void = () => {}
    fetchMock.mockReturnValue(new Promise<Response>((r) => { resolve = r }))

    renderTracker()
    const options = radios()

    await userEvent.click(options[1])
    // The old markup disabled the whole fieldset, which discarded focus to
    // <body> because the disabled element was the one being used.
    expect(options[1]).toHaveFocus()
    expect(options[1]).toHaveAttribute('aria-busy', 'true')
    expect(options[1]).toBeEnabled()

    resolve(ok())
    await waitFor(() => expect(options[1]).not.toHaveAttribute('aria-busy'))
  })
})

describe('ClaimTracker — failure handling', () => {
  it('re-enables the controls and explains itself when the network drops', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    renderTracker()
    const options = radios()

    await userEvent.click(options[1])

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/could not reach the server/i)
    // Nothing is left stuck in "Saving…", and every option is usable again.
    options.forEach((r) => {
      expect(r).toBeEnabled()
      expect(r).not.toHaveAttribute('aria-busy')
    })
    expect(options[0]).toHaveAttribute('aria-checked', 'true')

    // And a retry actually works.
    fetchMock.mockResolvedValue(ok())
    await userEvent.click(options[1])
    await waitFor(() => expect(options[1]).toHaveAttribute('aria-checked', 'true'))
  })

  it('rolls back the status but never the note the user just typed', async () => {
    renderTracker({ status: 'gathering_docs', note: 'old ref', applied_at: null })

    const textarea = screen.getByLabelText(/private note/i)
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'REF-2291 sent to grants@')

    fetchMock.mockResolvedValue(fail(500))
    await userEvent.click(screen.getByRole('radio', { name: 'Applied' }))

    await screen.findByRole('alert')
    // Status reverts — the server owns that. The draft does not: wiping it and
    // then saying "try again" leaves nothing to retry with.
    expect(screen.getByRole('radio', { name: 'Gathering documents' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(textarea).toHaveValue('REF-2291 sent to grants@')
  })
})

describe('ClaimTracker — announcements and removal', () => {
  it('puts the status and its meaning in a live region', () => {
    renderTracker({ status: 'applied', note: null, applied_at: null })
    const live = document.querySelector('[aria-live="polite"]')
    expect(live).not.toBeNull()
    expect(live).toHaveTextContent(/waiting on their decision/i)
    expect(live).toHaveTextContent(/applied/i)
  })

  it('can remove a claim started by mistake', async () => {
    fetchMock.mockResolvedValue(ok({ data: { tool_id: TOOL_ID } }))
    renderTracker({ status: 'applied', note: 'oops', applied_at: null })

    await userEvent.click(screen.getByRole('button', { name: /remove it/i }))
    await userEvent.click(screen.getByRole('button', { name: /yes, remove/i }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/claims?tool_id=${TOOL_ID}`,
        expect.objectContaining({ method: 'DELETE' })
      )
    )
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: 'Not started' })).toHaveAttribute(
        'aria-checked',
        'true'
      )
    )
  })
})
