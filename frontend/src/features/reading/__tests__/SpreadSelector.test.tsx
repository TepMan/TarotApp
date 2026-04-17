import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { SpreadSelector } from '../SpreadSelector'
import { getSpreads } from '../../../api/tarotApi'

vi.mock('../../../api/tarotApi', () => ({
  getSpreads: vi.fn(),
}))

const mockGetSpreads = vi.mocked(getSpreads)

describe('SpreadSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('wählt standardmäßig three-card aus, wenn noch nichts gewählt ist', async () => {
    const onSelectSpread = vi.fn()
    mockGetSpreads.mockResolvedValue([
      {
        id: 'cross-5',
        name: '5er Kreuz',
        description: 'Beschreibung 5er Kreuz',
        positionCount: 5,
        tags: ['analyse'],
      },
      {
        id: 'three-card',
        name: '3-Karten Legung',
        description: 'Beschreibung 3 Karten',
        positionCount: 3,
        tags: ['einsteiger'],
      },
    ])

    render(<SpreadSelector onSelectSpread={onSelectSpread} />)

    await waitFor(() => {
      expect(onSelectSpread).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'three-card' }),
      )
    })
  })

  it('zeigt Fehler und erlaubt Retry', async () => {
    const onSelectSpread = vi.fn()
    mockGetSpreads
      .mockRejectedValueOnce(new Error('Netzwerkfehler'))
      .mockResolvedValueOnce([
        {
          id: 'three-card',
          name: '3-Karten Legung',
          description: 'Beschreibung 3 Karten',
          positionCount: 3,
          tags: ['einsteiger'],
        },
      ])

    render(<SpreadSelector onSelectSpread={onSelectSpread} />)

    expect(await screen.findByText(/Fehler beim Laden/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Erneut versuchen/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/Legemuster auswählen/i)).toBeInTheDocument()
    })
  })
})

