import { useState } from "react";
import "./UebungHinweis.css";

// Kurze, ruhige Anleitung beim ersten Mal pro Übungstyp: damit ein Kind sofort
// weiß, was zu tun ist. Verblassendes Gerüst (VISION): einmal pro Sitzung
// gezeigt, danach gemerkt (sessionStorage) und wegklickbar. Inline, nicht
// blockierend, kein Modal. id muss pro Typ eindeutig sein.
export default function UebungHinweis({ id, children }) {
  const schluessel = "neu.uebunghinweis." + id;
  const [weg, setWeg] = useState(() => {
    try {
      return sessionStorage.getItem(schluessel) === "1";
    } catch {
      return false;
    }
  });
  if (weg) return null;
  function schliessen() {
    try {
      sessionStorage.setItem(schluessel, "1");
    } catch {
      /* sessionStorage blockiert: dann nur diese Ansicht */
    }
    setWeg(true);
  }
  return (
    <div className="uh" role="note">
      <span className="uh-text">{children}</span>
      <button
        type="button"
        className="uh-zu"
        onClick={schliessen}
        aria-label="Anleitung ausblenden"
      >
        Verstanden
      </button>
    </div>
  );
}
