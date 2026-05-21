import { Component } from "react";

// Fängt Render-Fehler ab und zeigt eine ruhige Fallback-Seite statt einer weißen Seite.
export default class ErrorBoundary extends Component {
  state = { fehler: false };

  static getDerivedStateFromError() {
    return { fehler: true };
  }

  componentDidCatch(error, info) {
    console.error("Unerwarteter Fehler:", error, info);
  }

  render() {
    if (this.state.fehler) {
      return (
        <div className="fehler-seite">
          <div className="fehler-karte">
            <h1>Ups, da ist etwas schiefgelaufen.</h1>
            <p>Keine Sorge, deine Daten sind gespeichert. Lade die Seite neu.</p>
            <button onClick={() => window.location.reload()}>Neu laden</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
