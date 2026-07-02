import { kbFarbe } from "../data/koennensbeweise";
import { NEUTRAL_FARBE } from "./farbe";
import KbInhalt from "./KbInhalt";
import "./KbDetail.css";

// Detail einer geplanten Aufgabe (KB) als Modal: Inhalt liegt in KbInhalt.
export default function KbDetail({ kb, onClose }) {
  const farbe = kbFarbe[kb.fach] || NEUTRAL_FARBE;

  return (
    <div className="kd-overlay" onClick={onClose}>
      <div
        className="kd-modal"
        style={{ "--c": farbe }}
        role="dialog"
        aria-modal="true"
        aria-label={kb.titel}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="kd-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>

        <div className="kd-kopf">
          <span className="kd-fach">{kb.fach}</span>
          <h2 className="kd-titel">{kb.titel}</h2>
          <p className="kd-meta">
            {kb.code} · {kb.cluster} Clusterstunden
          </p>
        </div>

        <div className="kd-body">
          <KbInhalt kb={kb} />
        </div>
      </div>
    </div>
  );
}
