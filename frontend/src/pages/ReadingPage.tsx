import { useState } from 'react'
import { SpreadSelector } from '../features/reading/SpreadSelector'
import type { SpreadSummary } from '../types/tarot'
import './ReadingPage.css'

export function ReadingPage() {
  const [selectedSpread, setSelectedSpread] = useState<SpreadSummary | null>(null)

  return (
    <main className="reading-page">
      <header className="reading-header">
        <h1>Tarot Reading Workspace</h1>
        <p>
          Waehle ein Legemuster, belege die Positionen mit Karten und rufe danach die
          Interpretation pro Position ab.
        </p>
      </header>

      <section className="reading-grid" aria-label="Reading Layout Platzhalter">
        <article className="panel panel-selector" aria-label="Legemuster-Auswahl">
          <h2>1) Legemuster</h2>
          <SpreadSelector
            selectedSpreadId={selectedSpread?.id}
            onSelectSpread={setSelectedSpread}
          />
        </article>

        <article className="panel panel-board" aria-label="Legemuster-Board">
          <h2>2) Legemuster-Board</h2>
          {selectedSpread ? (
            <div className="selected-spread-preview">
              <p>
                <strong>Aktuell gewaehlt:</strong> {selectedSpread.name}
              </p>
              <p>{selectedSpread.description}</p>
              <p>{selectedSpread.positionCount} Positionen</p>
            </div>
          ) : (
            <p>Waehle zuerst ein Legemuster aus.</p>
          )}
          <p className="placeholder-note">SpreadBoard kommt in Schritt 4.</p>
        </article>

        <article className="panel panel-editor" aria-label="Positions-Editor">
          <h2>3) Position bearbeiten</h2>
          <p>PositionEditor kommt in Schritt 5.</p>
        </article>

        <article className="panel panel-interpretation" aria-label="Interpretation">
          <h2>4) Interpretation</h2>
          <p>InterpretationPanel kommt in Schritt 6.</p>
        </article>
      </section>
    </main>
  )
}
