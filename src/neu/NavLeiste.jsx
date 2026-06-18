import "./NavLeiste.css";

// Schwebende Navigation unten mittig (Figma-Style): der einzige feste Anker
// der App, funktioniert auf Laptop, iPad und Handy gleich. Drei Räume:
// Heute (handeln), Plan (Etappen-/Wochenplanung), Ablage (nachschlagen).

function IconSonne() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function IconRaster() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconOrdner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

const PUNKTE = [
  { id: "heute", label: "Übersicht", Icon: IconSonne },
  { id: "plan", label: "Plan", Icon: IconRaster },
  { id: "ablage", label: "Ablage", Icon: IconOrdner },
];

export default function NavLeiste({ aktiv, onWechsel }) {
  return (
    <nav className="nav-leiste" aria-label="Bereiche">
      {PUNKTE.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={"nav-punkt" + (aktiv === id ? " aktiv" : "")}
          onClick={() => onWechsel(id)}
          aria-current={aktiv === id ? "page" : undefined}
          title={label}
        >
          <Icon />
          <span className="nav-punkt-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
