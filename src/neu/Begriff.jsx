import { glossar } from "../data/glossar";
import "./Begriff.css";

// Dezent erklärter Fachbegriff: gepunktete Unterstreichung plus Tooltip on
// hover/focus, Touch bekommt über das native title-Attribut einen Long-Press.
// Definitionen kommen aus dem geteilten Glossar (eine Quelle für alle Tooltips).
export default function Begriff({ name, children }) {
  const eintrag = glossar[name];
  if (!eintrag) return <>{children || name}</>;

  return (
    <span className="neu-begriff">
      <span className="neu-begriff-text" tabIndex={0} title={eintrag.lang}>
        {children || eintrag.kurz}
      </span>
      <span className="neu-begriff-pop" role="tooltip">
        <span className="neu-begriff-pop-titel">{eintrag.kurz}</span>
        <span className="neu-begriff-pop-text">{eintrag.lang}</span>
      </span>
    </span>
  );
}
