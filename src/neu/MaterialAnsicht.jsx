import { useEffect } from "react";
import { ART_LABEL } from "./material";
import MaterialInhalt from "./MaterialInhalt";
import "./MaterialAnsicht.css";

// Modal-Hülle für ein Material. Der Inhalt selbst (interaktive Übung oder
// Volltext) kommt aus dem Dispatcher MaterialInhalt.
export default function MaterialAnsicht({ material, onClose }) {
  // Esc schließt die Ansicht (Standard-Modal-Verhalten).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div
        className="ma-modal"
        role="dialog"
        aria-modal="true"
        aria-label={material.titel}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ma-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
        <span className="ma-art">{ART_LABEL[material.art] || material.art}</span>
        <h2 className="ma-titel">{material.titel}</h2>

        <MaterialInhalt material={material} />
      </div>
    </div>
  );
}
