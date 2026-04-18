import { useEffect, useState } from 'react'
import { getSpreads } from '../../api/tarotApi'
import type { SpreadSummary } from '../../types/tarot'

type SpreadSelectorProps = {
  selectedSpreadId?: string
  onSelectSpread: (spread: SpreadSummary) => void
}

type SpreadGroup = 'basis' | 'aufbau' | 'vertiefung' | 'komplex'

const spreadOrderById: Record<string, number> = {
  'three-card': 10,
  'cross-5': 20,
  compass: 30,
  horseshoe: 40,
  'the-way': 50,
  'love-oracle': 60,
  'self-knowledge': 70,
  'decision-game': 80,
  purgatory: 90,
  'celtic-cross': 100,
}

const groupLabelByKey: Record<SpreadGroup, string> = {
  basis: 'Basis',
  aufbau: 'Aufbau',
  vertiefung: 'Vertiefung',
  komplex: 'Komplex',
}

function resolveSpreadGroup(spread: SpreadSummary): SpreadGroup {
  if (spread.id === 'three-card' || spread.positionCount <= 3 || spread.tags.includes('einsteiger')) {
    return 'basis'
  }

  if (spread.positionCount <= 5 || spread.tags.includes('standard')) {
    return 'aufbau'
  }

  if (spread.positionCount <= 7) {
    return 'vertiefung'
  }

  return 'komplex'
}

function getSpreadSortRank(spread: SpreadSummary): number {
  return spreadOrderById[spread.id] ?? 1000 + spread.positionCount
}

export function SpreadSelector({ selectedSpreadId, onSelectSpread }: SpreadSelectorProps) {
  const [spreads, setSpreads] = useState<SpreadSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const groupedAndSortedSpreads = Object.fromEntries(
    (['basis', 'aufbau', 'vertiefung', 'komplex'] as const).map((group) => [
      group,
      spreads
        .filter((spread) => resolveSpreadGroup(spread) === group)
        .slice()
        .sort((a, b) => {
          const byRank = getSpreadSortRank(a) - getSpreadSortRank(b)
          if (byRank !== 0) {
            return byRank
          }
          return a.name.localeCompare(b.name, 'de')
        }),
    ]),
  ) as Record<SpreadGroup, SpreadSummary[]>

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
        {(['basis', 'aufbau', 'vertiefung', 'komplex'] as const).map((group) => {
          const items = groupedAndSortedSpreads[group]
          if (items.length === 0) {
            return null
          }

          return (
            <optgroup key={group} label={groupLabelByKey[group]}>
              {items.map((spread) => (
                <option key={spread.id} value={spread.id}>
                  {spread.name} ({spread.positionCount} Positionen)
                </option>
              ))}
            </optgroup>
          )
        })}
      </select>
    </div>
  )
}

