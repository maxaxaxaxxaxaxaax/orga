import { STRATEGIEN } from "../lib/strategien";

// Strategie-Wahl-Karte: vor dem Quiz wählt Max eine Lern-Strategie aus.
// Vier große Karten (2x2), Klick startet das Quiz mit der gewählten Strategie.
export default function StrategieWahl({ onWaehlen, themaLabel }) {
  return (
    <div className="strategie-wahl">
      <header className="strategie-kopf">
        <h3 className="strategie-titel">Wie willst du das angehen?</h3>
        {themaLabel && (
          <p className="strategie-sub">{themaLabel}</p>
        )}
      </header>
      <div className="strategie-grid">
        {STRATEGIEN.map((s) => (
          <button
            key={s.id}
            type="button"
            className="strategie-karte"
            onClick={() => onWaehlen(s.id)}
          >
            <span className="strategie-icon" aria-hidden="true">
              {s.icon}
            </span>
            <span className="strategie-label">{s.label}</span>
            <span className="strategie-kurz">{s.kurz}</span>
          </button>
        ))}
      </div>
      <p className="strategie-hinweis">
        Nach der Übung siehst du, welche Strategie für dich funktioniert.
      </p>
    </div>
  );
}
