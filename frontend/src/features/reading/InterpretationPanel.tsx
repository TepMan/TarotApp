import { useEffect, useMemo, useRef, useState } from 'react'
import { getInterpretation } from '../../api/tarotApi'
import type {
  InterpretationResponse,
  Orientation,
  PositionCardSelection,
} from '../../types/tarot'

type InterpretationPanelProps = {
  selections: PositionCardSelection[]
  totalPositions?: number
}

type InterpretationEntry = {
  selection: PositionCardSelection
  status: 'loading' | 'success' | 'error'
  data?: InterpretationResponse
  error?: string
}

function orientationLabel(value: Orientation): string {
  return value === 'upright' ? 'Aufrecht' : 'Umgekehrt'
}

export function InterpretationPanel({ selections, totalPositions }: InterpretationPanelProps) {
  const [entries, setEntries] = useState<InterpretationEntry[]>([])
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (selections.length === 0) {
      setEntries([])
      return
    }

    const requestId = ++requestIdRef.current
    const initialEntries = selections
      .slice()
      .sort((a, b) => a.positionIndex - b.positionIndex)
      .map((selection) => ({
        selection,
        status: 'loading' as const,
      }))

    setEntries(initialEntries)

    const loadAll = async () => {
      const results = await Promise.all(
        initialEntries.map(async (entry): Promise<InterpretationEntry> => {
          try {
            const interpretation = await getInterpretation(
              entry.selection.cardName,
              entry.selection.orientation,
            )
            return {
              selection: entry.selection,
              status: 'success',
              data: interpretation,
            }
          } catch (err) {
            return {
              selection: entry.selection,
              status: 'error',
              error:
                err instanceof Error
                  ? err.message
                  : 'Interpretation konnte nicht geladen werden.',
            }
          }
        }),
      )

      if (requestIdRef.current !== requestId) {
        return
      }

      setEntries(results)
    }

    void loadAll()
  }, [selections])

  const loadingCount = useMemo(
    () => entries.filter((entry) => entry.status === 'loading').length,
    [entries],
  )

  if (selections.length === 0) {
    return <p>Waehle zuerst mindestens eine Karte im PositionEditor aus.</p>
  }

  return (
    <div className="interpretation-panel">
      <p className="interpretation-summary">
        Belegt: {selections.length}
        {totalPositions ? ` / ${totalPositions}` : ''} Positionen
        {loadingCount > 0 ? ` - Lade ${loadingCount} Interpretation(en)...` : ''}
      </p>

      <ul className="interpretation-list">
        {entries.map((entry) => (
          <li key={entry.selection.positionKey} className="interpretation-item">
            <header className="interpretation-item-header">
              <strong>
                #{entry.selection.positionIndex} {entry.selection.positionLabel}
              </strong>
              <span>
                {entry.selection.cardName} - {orientationLabel(entry.selection.orientation)}
              </span>
            </header>

            {entry.status === 'loading' && <p>Interpretation wird geladen...</p>}

            {entry.status === 'error' && (
              <p className="interpretation-error">Fehler: {entry.error}</p>
            )}

            {entry.status === 'success' && entry.data && (
              <div className="interpretation-content">
                <p>
                  <strong>Kernbotschaft:</strong> {entry.data.kernbotschaft}
                </p>
                <p>
                  <strong>Psychologie:</strong> {entry.data.psychologie}
                </p>
                <p>
                  <strong>Archetyp:</strong> {entry.data.archetyp}
                </p>
                {entry.data.imagePath ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}${entry.data.imagePath}`}
                    alt={`Karte ${entry.data.name}`}
                    className="interpretation-image"
                    loading="lazy"
                  />
                ) : null}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

