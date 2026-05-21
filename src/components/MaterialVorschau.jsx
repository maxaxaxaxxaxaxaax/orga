import { useEffect } from "react";
import { artLabel, bereichLabel } from "../data/wissen";

// Leichte Vorschau für ein Material. Im Demo gibt es keine echten Dateiinhalte,
// daher ein Platzhalter mit den Eckdaten.
export default function MaterialVorschau({ material, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const datum = new Date(material.datum).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={material.titel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-kopf">
          <span className={"material-art art-" + material.art}>{artLabel[material.art]}</span>
          <h3 className="modal-titel">{material.titel}</h3>
          <button className="modal-x" onClick={onClose} aria-label="Schließen">×</button>
        </div>
        <p className="modal-meta">
          {material.fach ? material.fach + " · " : ""}
          {material.bereich ? bereichLabel[material.bereich] + " · " : ""}
          {material.thema ? material.thema + " · " : ""}
          {datum}
        </p>
        <div className="modal-platzhalter">
          <span className="modal-platzhalter-icon">📄</span>
          <p className="modal-platzhalter-text">
            Im Demo sind noch keine Dateiinhalte hinterlegt. Hier würde „{material.titel}“
            geöffnet.
          </p>
        </div>
      </div>
    </div>
  );
}
