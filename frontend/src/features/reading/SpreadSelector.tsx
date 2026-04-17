import { useEffect, useState } from 'react'
import { getSpreads } from '../../api/tarotApi'
import type { SpreadSummary } from '../../types/tarot'

type SpreadSelectorProps = {
  selectedSpreadId?: string
  onSelectSpread: (spread: SpreadSummary) => void
}

export function SpreadSelector({ selectedSpreadId, onSelectSpread }: SpreadSelectorProps) {
  const [spreads, setSpreads] = useState<SpreadSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadSpreads() {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getSpreads()
      setSpreads(data)

      // Auto-select first spread for a smoother first-run UX.
      if (data.length > 0 && !selectedSpreadId) {
        onSelectSpread(data[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Legemuster konnten nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSpreads()
    // Intentionally only run on initial mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return <p>Lade Legemuster...</p>
  }

  if (error) {
    return (
      <div className="spread-selector-state">
        <p>Fehler beim Laden: {error}</p>
        <button type="button" onClick={() => void loadSpreads()}>
          Erneut versuchen
        </button>
      </div>
    )
  }

  if (spreads.length === 0) {
    return <p>Keine Legemuster vorhanden.</p>
  }

  return (
    <div className="spread-selector">
      <p className="spread-selector-hint">Waehle ein Legemuster fuer die aktuelle Legung:</p>
      <ul className="spread-selector-list">
        {spreads.map((spread) => {
          const isSelected = spread.id === selectedSpreadId
          return (
            <li key={spread.id}>
              <button
                type="button"
                className={`spread-option ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSelectSpread(spread)}
              >
                <strong>{spread.name}</strong>
                <span>{spread.description}</span>
                <small>{spread.positionCount} Positionen</small>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

