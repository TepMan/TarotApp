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
  const [searchByPosition, setSearchByPosition] = useState<Record<string, string>>({})
  const [expandedByPosition, setExpandedByPosition] = useState<Record<string, boolean>>({})
  const [selectionErrorByPosition, setSelectionErrorByPosition] = useState<Record<string, string>>({})
  const [highlightedPositionKey, setHighlightedPositionKey] = useState<string | null>(null)
  const [interpretationByPosition, setInterpretationByPosition] = useState<
    Record<string, { status: 'idle' | 'loading' | 'success' | 'error'; data?: InterpretationResponse; error?: string }>
  >({})
  const interpretationRequestCounter = useRef(0)
  const latestInterpretationRequestByPosition = useRef<Record<string, number>>({})

  function getStorageKey(id: string): string {
    return `tarot.reading.v1.${id}`
  }

  function readPersistedState(id: string): {
    selections?: Record<string, { cardName: string; orientation: Orientation }>
    expanded?: Record<string, boolean>
  } {
    try {
      const raw = localStorage.getItem(getStorageKey(id))
      if (!raw) {
        return {}
      }
      const parsed = JSON.parse(raw) as {
        selections?: Record<string, { cardName: string; orientation: Orientation }>
        expanded?: Record<string, boolean>
      }
      return parsed ?? {}
    } catch {
      return {}
    }
  }

  async function loadSpreadDetail(id: string) {
    setIsLoading(true)
    setError(null)

    try {
      const [detail, allCards] = await Promise.all([getSpreadById(id), getCards()])
      const persisted = readPersistedState(id)

      setSpread(detail)
      setCards(allCards)
      setSelectionByPosition((current) => {
        const next: Record<string, { cardName: string; orientation: Orientation }> = {}
        for (const position of detail.positions) {
          const persistedSelection = persisted.selections?.[position.key]
          next[position.key] = {
            cardName: persistedSelection?.cardName ?? current[position.key]?.cardName ?? '',
            orientation:
              persistedSelection?.orientation ?? current[position.key]?.orientation ?? 'upright',
          }
        }
        return next
      })

      setSearchByPosition(() => {
        const next: Record<string, string> = {}
        for (const position of detail.positions) {
          next[position.key] = ''
        }
        return next
      })

      setExpandedByPosition(() => {
        const next: Record<string, boolean> = {}
        for (const position of detail.positions) {
          next[position.key] = persisted.expanded?.[position.key] ?? true
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

      for (const position of detail.positions) {
        const restored = persisted.selections?.[position.key]
        if (restored?.cardName) {
          void loadInterpretationForPosition(position.key, restored.cardName, restored.orientation)
        }
      }
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

  function isCardSelectedElsewhere(positionKey: string, cardName: string): boolean {
    return Object.entries(selectionByPosition).some(
      ([key, selection]) => key !== positionKey && selection.cardName === cardName,
    )
  }

  function findCardUsage(
    positionKey: string,
    cardName: string,
  ): { usedKey: string; positionIndex: number; positionLabel: string } | null {
    if (!spread) {
      return null
    }

    const used = Object.entries(selectionByPosition).find(
      ([key, selection]) => key !== positionKey && selection.cardName === cardName,
    )

    if (!used) {
      return null
    }

    const [usedKey] = used
    const usedPosition = spread.positions.find((position) => position.key === usedKey)
    if (!usedPosition) {
      return null
    }

    return {
      usedKey,
      positionIndex: usedPosition.index,
      positionLabel: usedPosition.label,
    }
  }

  function focusExistingCardPosition(targetKey: string) {
    const target = document.getElementById(`spread-position-${targetKey}`)
    if (!target) {
      return
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightedPositionKey(targetKey)

    window.setTimeout(() => {
      setHighlightedPositionKey((current) => (current === targetKey ? null : current))
    }, 1600)
  }

  function resolveCardFromQuery(rawQuery: string, availableCards: Card[]): Card | null {
    const query = rawQuery.trim().toLowerCase()
    if (!query) {
      return null
    }

    const exact = availableCards.find((card) => card.name.toLowerCase() === query)
    if (exact) {
      return exact
    }

    const partial = availableCards.filter(
      (card) =>
        card.name.toLowerCase().includes(query) ||
        card.number.toLowerCase().includes(query) ||
        card.suit.toLowerCase().includes(query),
    )

    return partial.length === 1 ? partial[0] : null
  }

  function setQueryValidationError(positionKey: string, rawQuery: string) {
    const trimmed = rawQuery.trim()
    if (!trimmed) {
      setSelectionErrorByPosition((current) => ({
        ...current,
        [positionKey]: '',
      }))
      return
    }

    const hasAnyMatch = cards.some(
      (card) =>
        card.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        card.number.toLowerCase().includes(trimmed.toLowerCase()) ||
        card.suit.toLowerCase().includes(trimmed.toLowerCase()),
    )

    setSelectionErrorByPosition((current) => ({
      ...current,
      [positionKey]: hasAnyMatch
        ? 'Bitte Treffer präzisieren oder Vorschlag auswählen.'
        : 'Keine passende Karte gefunden.',
    }))
  }

  function commitQuerySelection(positionKey: string, rawQuery: string, availableCards: Card[]): boolean {
    const resolvedCard = resolveCardFromQuery(rawQuery, availableCards)
    if (resolvedCard) {
      updateCard(positionKey, resolvedCard.name)
      return true
    }

    setQueryValidationError(positionKey, rawQuery)
    return false
  }

  function updateCard(positionKey: string, cardName: string) {
    const orientation = selectionByPosition[positionKey]?.orientation ?? 'upright'

    setSearchByPosition((current) => ({
      ...current,
      [positionKey]: '',
    }))

    setSelectionByPosition((current) => ({
      ...current,
      [positionKey]: {
        cardName,
        orientation,
      },
    }))

    if (!cardName) {
      setSelectionErrorByPosition((current) => ({ ...current, [positionKey]: '' }))
      setInterpretationByPosition((current) => ({
        ...current,
        [positionKey]: { status: 'idle' },
      }))
      return
    }

    const cardUsage = findCardUsage(positionKey, cardName)
    if (cardUsage) {
      setSelectionErrorByPosition((current) => ({
        ...current,
        [positionKey]: `Diese Karte ist bereits in #${cardUsage.positionIndex} (${cardUsage.positionLabel}) gewählt.`,
      }))
      setInterpretationByPosition((current) => ({
        ...current,
        [positionKey]: { status: 'idle' },
      }))

      focusExistingCardPosition(cardUsage.usedKey)
      return
    }

    setSelectionErrorByPosition((current) => ({ ...current, [positionKey]: '' }))

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
      setSearchByPosition({})
      setExpandedByPosition({})
      setSelectionErrorByPosition({})
      setInterpretationByPosition({})
      setError(null)
      setIsLoading(false)
      return
    }

    void loadSpreadDetail(spreadId)
  }, [spreadId])

  useEffect(() => {
    if (!spreadId || !spread) {
      return
    }

    const positionKeys = new Set(spread.positions.map((position) => position.key))
    const persistedSelections: Record<string, { cardName: string; orientation: Orientation }> = {}
    const persistedExpanded: Record<string, boolean> = {}

    for (const [positionKey, selection] of Object.entries(selectionByPosition)) {
      if (positionKeys.has(positionKey) && selection.cardName) {
        persistedSelections[positionKey] = selection
      }
    }

    for (const [positionKey, expanded] of Object.entries(expandedByPosition)) {
      if (positionKeys.has(positionKey)) {
        persistedExpanded[positionKey] = expanded
      }
    }

    localStorage.setItem(
      getStorageKey(spreadId),
      JSON.stringify({
        selections: persistedSelections,
        expanded: persistedExpanded,
      }),
    )
  }, [expandedByPosition, selectionByPosition, spread, spreadId])

  const boardDimensions = useMemo(() => {
    if (!spread || spread.positions.length === 0) {
      return { columns: 1, rows: 1 }
    }

    const maxX = Math.max(...spread.positions.map((p) => p.layoutX))
    const maxY = Math.max(...spread.positions.map((p) => p.layoutY))
    return { columns: maxX + 1, rows: maxY + 1 }
  }, [spread])

  if (!spreadId) {
    return <p>Wähle zuerst ein Legemuster aus.</p>
  }

  if (isLoading) {
    return <p>Lade Board für "{spreadName ?? spreadId}"...</p>
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
    return <p>Kein Legemuster-Detail verfügbar.</p>
  }

  if (cards.length === 0) {
    return <p>Es wurden keine Karten gefunden.</p>
  }

  if (spread.positions.length === 0) {
    return <p>Dieses Legemuster hat keine Positionen.</p>
  }

  return (
    <div className="spread-board-wrap">

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
          const queryValue = searchByPosition[position.key] ?? ''
          const query = queryValue.trim().toLowerCase()
          const availableCards = cards.filter((card) => {
            return !isCardSelectedElsewhere(position.key, card.name) || selection.cardName === card.name
          })
          const matchingCount =
            query.length === 0
              ? availableCards.length
              : availableCards.filter(
                  (card) =>
                    card.name.toLowerCase().includes(query) ||
                    card.number.toLowerCase().includes(query) ||
                    card.suit.toLowerCase().includes(query),
                ).length
          const hasExactMatch =
            query.length > 0 &&
            availableCards.some((card) => card.name.toLowerCase() === query)
          const matchesAnyCardByName =
            query.length > 0 && cards.some((card) => card.name.toLowerCase() === query)
          const isDuplicateExactMatch = matchesAnyCardByName && !hasExactMatch
          const autoListId = `card-suggestions-${position.key}`
          const isExpanded = expandedByPosition[position.key] ?? true
          const selectionError = selectionErrorByPosition[position.key]
          const interpretation = interpretationByPosition[position.key] ?? { status: 'idle' as const }

          return (
            <div
              key={position.key}
              id={`spread-position-${position.key}`}
              className={`spread-position-tile ${
                highlightedPositionKey === position.key ? 'is-highlighted' : ''
              }`}
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
                <input
                  type="text"
                  className="tile-search"
                  list={autoListId}
                  placeholder="Karte suchen und auswählen..."
                  value={queryValue}
                  onChange={(event) => {
                    const value = event.target.value
                    setSearchByPosition((current) => ({
                      ...current,
                      [position.key]: value,
                    }))

                    const trimmed = value.trim()
                    if (!trimmed) {
                      setSelectionErrorByPosition((current) => ({
                        ...current,
                        [position.key]: '',
                      }))
                      return
                    }

                    const exactCard = cards.find(
                      (card) => card.name.toLowerCase() === trimmed.toLowerCase(),
                    )
                    if (exactCard) {
                      updateCard(position.key, exactCard.name)
                    } else {
                      setSelectionErrorByPosition((current) => ({
                        ...current,
                        [position.key]: '',
                      }))
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== 'Tab') {
                      return
                    }

                    const didCommit = commitQuerySelection(position.key, queryValue, availableCards)
                    if (didCommit) {
                      return
                    }

                    if (event.key === 'Enter') {
                      event.preventDefault()
                    }
                  }}
                  onBlur={() => {
                    void commitQuerySelection(position.key, queryValue, availableCards)
                  }}
                />
                <datalist id={autoListId}>
                  {availableCards.map((card) => (
                    <option key={card.name} value={card.name}>
                      {card.number} - {card.suit}
                    </option>
                  ))}
                </datalist>
              </label>

              {selectionError ? <p className="tile-error">{selectionError}</p> : null}

              {isDuplicateExactMatch ? (
                <p className="tile-error">Diese Karte ist bereits in einer anderen Position gewählt.</p>
              ) : null}

              {query.length > 0 && matchingCount === 0 ? (
                <p className="tile-empty">Keine Karten zum Suchbegriff gefunden.</p>
              ) : null}

              {query.length > 0 && matchingCount > 0 && !hasExactMatch ? (
                <p className="tile-empty">Bitte eine Karte aus den Vorschlägen auswählen.</p>
              ) : null}

              {selection.cardName ? (
                <div className="tile-orientation-row">
                  <span>
                    Gewählt: {selection.cardName} ·{' '}
                    {selection.orientation === 'upright' ? 'Aufrecht' : 'Umgekehrt'}
                  </span>
                  <div className="tile-orientation-actions">
                    <button
                      type="button"
                      className="clear-selection-button"
                      onClick={() => updateCard(position.key, '')}
                      title="Kartenauswahl löschen"
                      aria-label="Kartenauswahl löschen"
                    >
                      ×
                    </button>
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
                </div>
              ) : null}

              {interpretation.status === 'loading' ? <p>Interpretation wird geladen...</p> : null}
              {interpretation.status === 'error' ? (
                <p className="tile-error">Fehler: {interpretation.error}</p>
              ) : null}

              {interpretation.status === 'success' && interpretation.data ? (
                <div className="tile-interpretation">
                  <button
                    type="button"
                    className="interpretation-toggle"
                    onClick={() =>
                      setExpandedByPosition((current) => ({
                        ...current,
                        [position.key]: !isExpanded,
                      }))
                    }
                    aria-label="Interpretation ein- oder ausklappen"
                  >
                    {isExpanded ? 'Interpretation einklappen ▲' : 'Interpretation ausklappen ▼'}
                  </button>

                  {isExpanded ? (
                    <>
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
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

