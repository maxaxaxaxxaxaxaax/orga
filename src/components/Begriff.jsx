import { useEffect } from "react";
import { glossar } from "../data/glossar";

// Zeigt einen Theresianum-Begriff mit dezenter Unterstreichung + Info-Icon und
// einem Tooltip on hover/focus (Touch: long-press triggert title). Setzt beim
// ersten Rendern pro Session einen Marker in sessionStorage (für Coverage-Tests).
export default function Begriff({ name, children }) {
  const eintrag = glossar[name];

  useEffect(() => {
    if (!eintrag) return;
    try {
      sessionStorage.setItem("orga.begriffe." + name, "1");
    } catch {
      /* sessionStorage kann blockiert sein, dann egal */
    }
  }, [name, eintrag]);

  if (!eintrag) return <>{children || name}</>;

  return (
    <span className="begriff">
      <span className="begriff-text" tabIndex={0} title={eintrag.lang}>
        {children || eintrag.kurz}
      </span>
      <span className="begriff-pop" role="tooltip">
        <span className="begriff-pop-titel">{eintrag.kurz}</span>
        <span className="begriff-pop-text">{eintrag.lang}</span>
      </span>
    </span>
  );
}
