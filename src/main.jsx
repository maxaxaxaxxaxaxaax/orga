import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './neu/App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Demo-Reset: jeder Seiten-Reload (auch Hard Refresh) startet bewusst frisch.
// Der Browser kann Hard- und Soft-Reload nicht unterscheiden (beide melden
// "reload"), darum setzt jeder Reload den gesamten neu.*-Stand zurück. Im
// laufenden Betrieb ohne Reload bleibt alles erhalten. Läuft vor dem Render,
// damit die Komponenten schon den frischen Stand lesen.
try {
  const nav = performance.getEntriesByType('navigation')[0]
  if (nav && nav.type === 'reload') {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('neu.')) localStorage.removeItem(key)
    }
  }
} catch {
  /* Performance-API oder localStorage nicht verfügbar: dann kein Reset */
}

// Neuanfang: schlanker App-Rahmen, der mit dem Etappenplan startet und per
// "Weiter" auf die Heute-Seite wechselt. Das alte App.jsx bleibt im Code.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
