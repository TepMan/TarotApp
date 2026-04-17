import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SpreadBoard } from '../SpreadBoard'
import { getCards, getInterpretation, getSpreadById } from '../../../api/tarotApi'

vi.mock('../../../api/tarotApi', () => ({
  getSpreadById: vi.fn(),
  getCards: vi.fn(),
  getInterpretation: vi.fn(),
}))

const mockGetSpreadById = vi.mocked(getSpreadById)
const mockGetCards = vi.mocked(getCards)
const mockGetInterpretation = vi.mocked(getInterpretation)

describe('SpreadBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    mockGetSpreadById.mockResolvedValue({
      id: 'three-card',
      name: '3-Karten Legung',
      description: 'Klassische Legung',
      tags: ['einsteiger'],
      positions: [
        {
          index: 1,
          key: 'past',
          label: 'Vergangenheit',
          prompt: 'Welche Prägung wirkt noch nach?',
          layoutX: 0,
          layoutY: 0,
        },
        {
          index: 2,
          key: 'present',
          label: 'Gegenwart',
          prompt: 'Was ist jetzt wesentlich?',
          layoutX: 1,
          layoutY: 0,
        },
      ],
    })

    mockGetCards.mockResolvedValue([
      {
        name: 'Der Narr',
        suit: 'Große Arkana',
        number: '0',
        kernbotschaft: 'Neubeginn',
        psychologischAufrecht: 'Mut',
        psychologischUmgekehrt: 'Risiko',
        anwendungsfelder: {},
        archetyp: 'Suchender',
        imageFile: '00_Fool.jpg',
        imagePath: '/images/00_Fool.jpg',
      },
      {
        name: 'Der Magier',
        suit: 'Große Arkana',
        number: 'I',
        kernbotschaft: 'Wille',
        psychologischAufrecht: 'Klarheit',
        psychologischUmgekehrt: 'Manipulation',
        anwendungsfelder: {},
        archetyp: 'Meister',
        imageFile: '01_Magician.jpg',
        imagePath: '/images/01_Magician.jpg',
      },
    ])

    mockGetInterpretation.mockResolvedValue({
      name: 'Der Narr',
      suit: 'Große Arkana',
      number: '0',
      orientation: 'upright',
      kernbotschaft: 'Neubeginn',
      psychologie: 'Mut und Offenheit',
      anwendungsfelder: {},
      archetyp: 'Suchender',
      imageFile: '00_Fool.jpg',
      imagePath: '/images/00_Fool.jpg',
    })
  })

  it('zeigt Fehler, wenn dieselbe Karte in einer zweiten Position gewählt wird', async () => {
    render(<SpreadBoard spreadId="three-card" spreadName="3-Karten Legung" />)

    await screen.findByText(/Vergangenheit/i)

    const tiles = screen.getAllByRole('combobox', {
      name: /Karte/i,
    })

    fireEvent.change(tiles[0], { target: { value: 'Der Narr' } })
    fireEvent.change(tiles[1], { target: { value: 'Der Narr' } })

    await waitFor(() => {
      expect(
        screen.getByText(/Diese Karte ist bereits in #1 \(Vergangenheit\) gewählt/i),
      ).toBeInTheDocument()
    })
  })

  it('übernimmt Enter auf eindeutigen Suchtreffer', async () => {
    render(<SpreadBoard spreadId="three-card" spreadName="3-Karten Legung" />)

    await screen.findByText(/Vergangenheit/i)

    const firstInput = screen.getAllByRole('combobox', { name: /Karte/i })[0]
    fireEvent.change(firstInput, { target: { value: 'Magier' } })
    fireEvent.keyDown(firstInput, { key: 'Enter' })

    await waitFor(() => {
      const firstTile = screen.getAllByText(/Gewählt:/i)[0].closest('.spread-position-tile')
      expect(within(firstTile as HTMLElement).getByText(/Gewählt: Der Magier/i)).toBeInTheDocument()
    })
  })
})


