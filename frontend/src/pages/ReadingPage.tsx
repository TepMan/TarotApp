import { useState } from 'react'
import { SpreadBoard } from '../features/reading/SpreadBoard'
import { SpreadSelector } from '../features/reading/SpreadSelector'
import type { SpreadSummary } from '../types/tarot'
import './ReadingPage.css'

export function ReadingPage() {
  const [selectedSpread, setSelectedSpread] = useState<SpreadSummary | null>(null)

  return (
    <main className="reading-page">
      <header className="reading-header">
        <h1>TepMan&apos;s Tarot App</h1>
        <p>
          Wähle ein Legemuster, belege die Positionen mit Karten und rufe danach die
          Interpretation pro Position ab.
        </p>
      </header>

      <section className="spread-selector-area" aria-label="Legemuster-Auswahl">
        <article className="panel panel-selector">
          <SpreadSelector
            selectedSpreadId={selectedSpread?.id}
            onSelectSpread={setSelectedSpread}
          />
        </article>
      </section>

      {selectedSpread ? (
        <section className="selected-spread-description" aria-label="Legemuster-Beschreibung">
          <p>{selectedSpread.description}</p>
        </section>
      ) : null}

      <article className="panel panel-board" aria-label="Legemuster-Board">
        <SpreadBoard spreadId={selectedSpread?.id} spreadName={selectedSpread?.name} />
      </article>
    </main>
  )
}
