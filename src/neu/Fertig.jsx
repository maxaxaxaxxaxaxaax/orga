import "./Fertig.css";

// Einheitlicher Fertig-Zustand fuer alle interaktiven Aufgabentypen: gleicher
// gruener Haken, gleiche Struktur (Text, optionale Bilanz, Nochmal-Knopf). So
// sieht "geschafft" ueberall gleich aus, egal ob Karteikarten, Quiz oder
// Zuordnung. text = Hauptzeile, bilanz = ruhige Zweitzeile, onNochmal = Neustart.
export default function Fertig({ text, bilanz, nochmalLabel = "Nochmal", onNochmal }) {
  return (
    <div className="fertig" role="status">
      <span className="fertig-haken" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path
            d="M5 12.5l4.5 4.5L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="fertig-text">{text}</p>
      {bilanz && <p className="fertig-bilanz">{bilanz}</p>}
      {onNochmal && (
        <button type="button" className="fertig-neu" onClick={onNochmal}>
          {nochmalLabel}
        </button>
      )}
    </div>
  );
}
