import { ReadingPage } from './pages/ReadingPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <div className="app-content">
        <ReadingPage />
      </div>
      <footer className="app-footer" aria-label="App-Version">
        Version {__APP_VERSION__}
      </footer>
    </div>
  )
}

export default App
