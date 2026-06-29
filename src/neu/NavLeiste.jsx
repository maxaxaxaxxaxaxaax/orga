import { useEffect, useRef, useState } from "react";
import "./NavLeiste.css";

// Schwebende Navigation oben mittig: der einzige feste Anker der App. Drei Räume,
// Übersicht in der Mitte: Planung (links), Übersicht (Mitte), Ablage (rechts).
// Eine gleitende Pille markiert den aktiven Raum und wandert sanft zur Auswahl.
const PUNKTE = [
  { id: "plan", label: "Planung" },
  { id: "heute", label: "Übersicht" },
  { id: "ablage", label: "Ablage" },
];

export default function NavLeiste({ aktiv, onWechsel }) {
  const navRef = useRef(null);
  const [pille, setPille] = useState(null); // { left, width } des aktiven Buttons

  // Pille auf den aktiven Button legen (gemessen, damit verschieden breite Labels
  // passen). Beim Wechsel gleitet sie per CSS-Transition dorthin.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const btn = nav.querySelector(".nav-punkt.aktiv");
    if (!btn) {
      setPille(null);
      return;
    }
    setPille({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [aktiv]);

  return (
    <nav className="nav-leiste" aria-label="Bereiche" ref={navRef}>
      {pille && (
        <span
          className="nav-pille"
          aria-hidden="true"
          style={{ left: pille.left + "px", width: pille.width + "px" }}
        />
      )}
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
