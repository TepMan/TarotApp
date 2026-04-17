import { useEffect, useMemo, useState } from 'react'
import { getSpreadById } from '../../api/tarotApi'
import type { Spread } from '../../types/tarot'

type SpreadBoardProps = {
  spreadId?: string
  spreadName?: string
}

export function SpreadBoard({ spreadId, spreadName }: SpreadBoardProps) {
  const [spread, setSpread] = useState<Spread | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadSpreadDetail(id: string) {
    setIsLoading(true)
    setError(null)

    try {
      const detail = await getSpreadById(id)
      setSpread(detail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Legemuster-Detail konnte nicht geladen werden.')
      setSpread(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!spreadId) {
      setSpread(null)
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
        {spread.positions.map((position) => (
          <div
            key={position.key}
            className="spread-position-tile"
            style={{
              gridColumn: position.layoutX + 1,
              gridRow: position.layoutY + 1,
            }}
          >
            <span className="spread-position-index">#{position.index}</span>
            <strong>{position.label}</strong>
            <p>{position.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

