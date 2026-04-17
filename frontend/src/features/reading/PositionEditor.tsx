import { useEffect, useMemo, useState } from 'react'
import { getCards, getSpreadById } from '../../api/tarotApi'
import type { Card, Orientation, PositionCardSelection, Spread } from '../../types/tarot'

type PositionEditorProps = {
  spreadId?: string
  spreadName?: string
  onSelectionsChange?: (selections: PositionCardSelection[]) => void
}

type SelectionState = Record<
  string,
  {
    positionIndex: number
    positionLabel: string
    cardName: string
    orientation: Orientation
  }
>

export function PositionEditor({ spreadId, spreadName, onSelectionsChange }: PositionEditorProps) {
  const [spread, setSpread] = useState<Spread | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selections, setSelections] = useState<SelectionState>({})

  async function loadEditorData(id: string) {
    setIsLoading(true)
    setError(null)

    try {
      const [spreadDetail, allCards] = await Promise.all([getSpreadById(id), getCards()])
      setSpread(spreadDetail)
      setCards(allCards)
      setSelections((current) => {
        const next: SelectionState = {}
        for (const position of spreadDetail.positions) {
          const existing = current[position.key]
          next[position.key] = {
            positionIndex: position.index,
            positionLabel: position.label,
            cardName: existing?.cardName ?? '',
            orientation: existing?.orientation ?? 'upright',
          }
        }
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Editor-Daten konnten nicht geladen werden.')
      setSpread(null)
      setCards([])
      setSelections({})
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!spreadId) {
      setSpread(null)
      setCards([])
      setSelections({})
      setError(null)
      setIsLoading(false)
      onSelectionsChange?.([])
      return
    }

    void loadEditorData(spreadId)
    // We intentionally reload editor data when the selected spread changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spreadId])

  const selectionList = useMemo<PositionCardSelection[]>(() => {
    return Object.entries(selections)
      .filter(([, selection]) => selection.cardName.trim().length > 0)
      .map(([positionKey, selection]) => ({
        positionKey,
        positionIndex: selection.positionIndex,
        positionLabel: selection.positionLabel,
        cardName: selection.cardName,
        orientation: selection.orientation,
      }))
      .sort((a, b) => a.positionIndex - b.positionIndex)
  }, [selections])

  useEffect(() => {
    onSelectionsChange?.(selectionList)
  }, [onSelectionsChange, selectionList])

  function updateSelection(
    positionKey: string,
    patch: Partial<{ cardName: string; orientation: Orientation }>,
  ) {
    setSelections((current) => {
      const existing = current[positionKey]
      if (!existing) {
        return current
      }

      return {
        ...current,
        [positionKey]: {
          ...existing,
          ...patch,
        },
      }
    })
  }

  if (!spreadId) {
    return <p>Wähle zuerst ein Legemuster aus.</p>
  }

  if (isLoading) {
    return <p>Lade Positionen und Karten für "{spreadName ?? spreadId}"...</p>
  }

  if (error) {
    return (
      <div className="position-editor-state">
        <p>Fehler beim Laden: {error}</p>
        <button type="button" onClick={() => spreadId && void loadEditorData(spreadId)}>
          Erneut versuchen
        </button>
      </div>
    )
  }

  if (!spread) {
    return <p>Kein Legemuster-Detail verfügbar.</p>
  }

  if (spread.positions.length === 0) {
    return <p>Dieses Legemuster hat keine Positionen.</p>
  }

  if (cards.length === 0) {
    return <p>Es wurden keine Karten gefunden.</p>
  }

  return (
    <div className="position-editor">
      <p className="position-editor-hint">
        Wähle pro Position eine Karte und die Orientierung (aufrecht/umgekehrt).
      </p>

      <ul className="position-editor-list">
        {spread.positions
          .slice()
          .sort((a, b) => a.index - b.index)
          .map((position) => {
            const selection = selections[position.key]
            return (
              <li key={position.key} className="position-editor-item">
                <div className="position-editor-header">
                  <strong>
                    #{position.index} {position.label}
                  </strong>
                  <span>{position.prompt}</span>
                </div>

                <label>
                  Karte
                  <select
                    value={selection?.cardName ?? ''}
                    onChange={(event) =>
                      updateSelection(position.key, { cardName: event.target.value })
                    }
                  >
                    <option value="">-- Karte wählen --</option>
                    {cards.map((card) => (
                      <option key={card.name} value={card.name}>
                        {card.name} ({card.number})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Orientierung
                  <select
                    value={selection?.orientation ?? 'upright'}
                    onChange={(event) =>
                      updateSelection(position.key, {
                        orientation: event.target.value as Orientation,
                      })
                    }
                  >
                    <option value="upright">Aufrecht</option>
                    <option value="reversed">Umgekehrt</option>
                  </select>
                </label>
              </li>
            )
          })}
      </ul>

      <p className="position-editor-summary">
        {selectionList.length} von {spread.positions.length} Positionen belegt.
      </p>
    </div>
  )
}

