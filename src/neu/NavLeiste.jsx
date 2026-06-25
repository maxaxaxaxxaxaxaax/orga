import "./NavLeiste.css";

// Schwebende Navigation oben mittig: der einzige feste Anker der App. Drei Räume:
// Übersicht (handeln), Planung (Etappen-/Wochenplanung), Ablage (nachschlagen).
// Nur Text, keine Icons.
const PUNKTE = [
  { id: "heute", label: "Übersicht" },
  { id: "plan", label: "Planung" },
  { id: "ablage", label: "Ablage" },
];

export default function NavLeiste({ aktiv, onWechsel }) {
  return (
    <nav className="nav-leiste" aria-label="Bereiche">
      {PUNKTE.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={"nav-punkt" + (aktiv === id ? " aktiv" : "")}
          onClick={() => onWechsel(id)}
          aria-current={aktiv === id ? "page" : undefined}
        >
          <span className="nav-punkt-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
