import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ReadingPage } from '../ReadingPage'

vi.mock('../../features/reading/SpreadBoard', () => ({
  SpreadBoard: ({ spreadId }: { spreadId?: string }) => (
    <div data-testid="spread-board">SpreadBoard {spreadId ?? 'none'}</div>
  ),
}))

vi.mock('../../features/reading/SpreadSelector', () => ({
  SpreadSelector: ({ onSelectSpread }: { onSelectSpread: (spread: { id: string; name: string; description: string; positionCount: number; tags: string[] }) => void }) => (
    <button
      type="button"
      onClick={() =>
        onSelectSpread({
          id: 'three-card',
          name: '3-Karten Legung',
          description: 'Klassische Legung für Vergangenheit, Gegenwart und Tendenz.',
          positionCount: 3,
          tags: ['einsteiger'],
        })
      }
    >
      Mock Spread wählen
    </button>
  ),
}))

describe('ReadingPage', () => {
  it('zeigt Titel und Anleitung', () => {
    render(<ReadingPage />)

    expect(screen.getByRole('heading', { name: "TepMan's Tarot App" })).toBeInTheDocument()
    expect(
      screen.getByText(/Wähle ein Legemuster, belege die Positionen mit Karten/i),
    ).toBeInTheDocument()
  })

  it('zeigt nach Auswahl die Spread-Beschreibung und übergibt die ID ans Board', () => {
    render(<ReadingPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Mock Spread wählen' }))

    expect(screen.getByText(/Klassische Legung für Vergangenheit/i)).toBeInTheDocument()
    expect(screen.getByTestId('spread-board')).toHaveTextContent('three-card')
  })
})

