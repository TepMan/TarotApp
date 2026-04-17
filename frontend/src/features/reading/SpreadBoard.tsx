import { useEffect, useMemo, useRef, useState } from 'react'
import { getCards, getInterpretation, getSpreadById } from '../../api/tarotApi'
import type { Card, InterpretationResponse, Orientation, Spread } from '../../types/tarot'

type SpreadBoardProps = {
  spreadId?: string
  spreadName?: string
}

export function SpreadBoard({ spreadId, spreadName }: SpreadBoardProps) {
  const [spread, setSpread] = useState<Spread | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectionByPosition, setSelectionByPosition] = useState<
    Record<string, { cardName: string; orientation: Orientation }>
  >({})
  const [interpretationByPosition, setInterpretationByPosition] = useState<
    Record<string, { status: 'idle' | 'loading' | 'success' | 'error'; data?: InterpretationResponse; error?: string }>
  >({})
  const interpretationRequestCounter = useRef(0)
  const latestInterpretationRequestByPosition = useRef<Record<string, number>>({})

  async function loadSpreadDetail(id: string) {
    setIsLoading(true)
    setError(null)

    try {
      const [detail, allCards] = await Promise.all([getSpreadById(id), getCards()])
      setSpread(detail)
      setCards(allCards)
      setSelectionByPosition((current) => {
        const next: Record<string, { cardName: string; orientation: Orientation }> = {}
        for (const position of detail.positions) {
          next[position.key] = {
            cardName: current[position.key]?.cardName ?? '',
            orientation: current[position.key]?.orientation ?? 'upright',
          }
        }
        return next
      })
      setInterpretationByPosition((current) => {
        const next: Record<
          string,
          { status: 'idle' | 'loading' | 'success' | 'error'; data?: InterpretationResponse; error?: string }
        > = {}
        for (const position of detail.positions) {
          next[position.key] = current[position.key] ?? { status: 'idle' }
        }
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Legemuster-Detail konnte nicht geladen werden.')
      setSpread(null)
      setCards([])
    } finally {
      setIsLoading(false)
    }
  }

  async function loadInterpretationForPosition(
    positionKey: string,
    cardName: string,
    orientation: Orientation,
  ) {
    const requestId = ++interpretationRequestCounter.current
    latestInterpretationRequestByPosition.current[positionKey] = requestId

    setInterpretationByPosition((current) => ({
      ...current,
      [positionKey]: { status: 'loading' },
    }))

    try {
      const data = await getInterpretation(cardName, orientation)

      if (latestInterpretationRequestByPosition.current[positionKey] !== requestId) {
        return
      }

      setInterpretationByPosition((current) => ({
        ...current,
        [positionKey]: { status: 'success', data },
      }))
    } catch (err) {
      if (latestInterpretationRequestByPosition.current[positionKey] !== requestId) {
        return
      }

      setInterpretationByPosition((current) => ({
        ...current,
        [positionKey]: {
          status: 'error',
          error: err instanceof Error ? err.message : 'Interpretation konnte nicht geladen werden.',
        },
      }))
    }
  }

  function updateCard(positionKey: string, cardName: string) {
    const orientation = selectionByPosition[positionKey]?.orientation ?? 'upright'

    setSelectionByPosition((current) => ({
      ...current,
      [positionKey]: {
        cardName,
        orientation,
      },
    }))

    if (!cardName) {
      setInterpretationByPosition((current) => ({
        ...current,
        [positionKey]: { status: 'idle' },
      }))
      return
    }

    void loadInterpretationForPosition(positionKey, cardName, orientation)
  }

  function toggleOrientation(positionKey: string) {
    const selection = selectionByPosition[positionKey]
    if (!selection) {
      return
    }

    const nextOrientation: Orientation =
      selection.orientation === 'upright' ? 'reversed' : 'upright'

    setSelectionByPosition((current) => ({
      ...current,
      [positionKey]: {
        ...selection,
        orientation: nextOrientation,
      },
    }))

    if (selection.cardName) {
      void loadInterpretationForPosition(positionKey, selection.cardName, nextOrientation)
    }
  }

  useEffect(() => {
    if (!spreadId) {
      setSpread(null)
      setCards([])
      setSelectionByPosition({})
      setInterpretationByPosition({})
      setError(null)
      setIsLoading(false)
      return
    }

    void loadSpreadDetail(spreadId)
  }, [spreadId])

  const boardDimensions = useMemo(() => {
    if (!spread || spread.positions.length === 0) {
      return { columns: 1, rows: 1 }
    }

    const maxX = Math.max(...spread.positions.map((p) => p.layoutX))
    const maxY = Math.max(...spread.positions.map((p) => p.layoutY))
    return { columns: maxX + 1, rows: maxY + 1 }
  }, [spread])

  if (!spreadId) {
    return <p>Waehle zuerst ein Legemuster aus.</p>
  }

  if (isLoading) {
    return <p>Lade Board fuer "{spreadName ?? spreadId}"...</p>
  }

  if (error) {
    return (
      <div className="spread-board-state">
        <p>Fehler beim Laden: {error}</p>
        <button type="button" onClick={() => void loadSpreadDetail(spreadId)}>
          Erneut versuchen
        </button>
      </div>
    )
  }

  if (!spread) {
    return <p>Kein Legemuster-Detail verfuegbar.</p>
  }

  if (cards.length === 0) {
    return <p>Es wurden keine Karten gefunden.</p>
  }

  if (spread.positions.length === 0) {
    return <p>Dieses Legemuster hat keine Positionen.</p>
  }

  return (
    <div className="spread-board-wrap">
      <div className="selected-spread-preview">
        <p>
          <strong>{spread.name}</strong>
        </p>
        <p>{spread.description}</p>
        <p>{spread.positions.length} Positionen</p>
      </div>

      <div
        className="spread-board-grid"
        style={{
          gridTemplateColumns: `repeat(${boardDimensions.columns}, minmax(120px, 1fr))`,
          gridTemplateRows: `repeat(${boardDimensions.rows}, minmax(90px, auto))`,
        }}
      >
        {spread.positions.map((position) => {
          const selection = selectionByPosition[position.key] ?? {
            cardName: '',
            orientation: 'upright' as Orientation,
          }
          const interpretation = interpretationByPosition[position.key] ?? { status: 'idle' as const }

          return (
            <div
              key={position.key}
              className="spread-position-tile"
              style={{
                gridColumn: position.layoutX + 1,
                gridRow: position.layoutY + 1,
              }}
            >
              <div className="spread-position-header">
                <span className="spread-position-index">#{position.index}</span>
                <strong>{position.label}</strong>
                <p>{position.prompt}</p>
              </div>

              <label className="tile-control">
                Karte
                <select
                  value={selection.cardName}
                  onChange={(event) => updateCard(position.key, event.target.value)}
                >
                  <option value="">-- Karte auswählen --</option>
                  {cards.map((card) => (
                    <option key={card.name} value={card.name}>
                      {card.name} ({card.number})
                    </option>
                  ))}
                </select>
              </label>

              {selection.cardName ? (
                <div className="tile-orientation-row">
                  <span>{selection.orientation === 'upright' ? 'Aufrecht' : 'Umgekehrt'}</span>
                  <button
                    type="button"
                    className="orientation-toggle"
                    onClick={() => toggleOrientation(position.key)}
                    title="Orientierung wechseln"
                    aria-label="Orientierung wechseln"
                  >
                    {selection.orientation === 'upright' ? '↓' : '↑'}
                  </button>
                </div>
              ) : null}

              {interpretation.status === 'loading' ? <p>Interpretation wird geladen...</p> : null}
              {interpretation.status === 'error' ? (
                <p className="tile-error">Fehler: {interpretation.error}</p>
              ) : null}

              {interpretation.status === 'success' && interpretation.data ? (
                <div className="tile-interpretation">
                  {interpretation.data.imagePath ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}${interpretation.data.imagePath}`}
                      alt={`Karte ${interpretation.data.name}`}
                      className={`tile-image ${selection.orientation === 'reversed' ? 'is-reversed' : ''}`}
                      loading="lazy"
                    />
                  ) : null}
                  <p>
                    <strong>Kernbotschaft:</strong> {interpretation.data.kernbotschaft}
                  </p>
                  <p>
                    <strong>Psychologie:</strong> {interpretation.data.psychologie}
                  </p>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

