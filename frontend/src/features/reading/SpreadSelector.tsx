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

      if (data.length > 0 && !selectedSpreadId) {
        const defaultSpread = data.find((spread) => spread.id === 'three-card') ?? data[0]
        onSelectSpread(defaultSpread)
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
      <label className="spread-selector-hint" htmlFor="spread-select">
        Legemuster auswählen
      </label>
      <select
        id="spread-select"
        className="spread-select"
        value={selectedSpreadId ?? ''}
        onChange={(event) => {
          const spread = spreads.find((item) => item.id === event.target.value)
          if (spread) {
            onSelectSpread(spread)
          }
        }}
      >
        {spreads.map((spread) => (
          <option key={spread.id} value={spread.id}>
            {spread.name} ({spread.positionCount} Positionen)
          </option>
        ))}
      </select>
    </div>
  )
}

