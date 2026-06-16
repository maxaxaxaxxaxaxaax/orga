import { useEffect, useState } from "react";
import { erstelleLernzettel } from "./kiClient";
import { lernzettelAusVerlauf } from "./materialAssistent";
import "./LernzettelModal.css";

// Erzeugt aus dem Chatverlauf einen Lernzettel (Vorschau), Titel und Text sind
// editierbar. "An Wissen heften" gibt { titel, inhalt } an Ablage zurück.
export default function LernzettelModal({
  verlauf,
  kontextName,
  kiModell,
  standardTitel,
  onHeften,
  onClose,
}) {
  const [titel, setTitel] = useState(standardTitel);
  const [inhalt, setInhalt] = useState("");
  const [laeuft, setLaeuft] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let aktiv = true;
    async function los() {
      if (kiModell) {
        try {
          await erstelleLernzettel({
            verlauf,
            kontextName,
            modell: kiModell,
            signal: controller.signal,
            onToken: (stueck) => {
              if (aktiv) setInhalt((t) => t + stueck);
            },
          });
        } catch {
          if (aktiv) setInhalt(lernzettelAusVerlauf(verlauf, kontextName));
        }
      } else {
        if (aktiv) setInhalt(lernzettelAusVerlauf(verlauf, kontextName));
      }
      if (aktiv) setLaeuft(false);
    }
    los();
    return () => {
      aktiv = false;
      controller.abort();
    };
  }, [verlauf, kontextName, kiModell]);

  function heften() {
    const t = titel.trim() || standardTitel;
    const text = inhalt.trim();
    if (!text) return;
    onHeften({ titel: t, inhalt: text });
  }

  return (
    <div className="lz-overlay" onClick={onClose}>
      <div
        className="lz-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Lernzettel"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lz-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
        <p className="lz-eyebrow">Lernzettel aus dem Chat</p>

        <label className="lz-feld">
          <span>Titel</span>
          <input
            type="text"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
          />
        </label>

        <label className="lz-feld">
          <span>Inhalt {laeuft && <em>wird geschrieben …</em>}</span>
          <textarea
            value={inhalt}
            onChange={(e) => setInhalt(e.target.value)}
            rows={10}
            placeholder="Der Lernzettel erscheint hier …"
          />
        </label>

        <div className="lz-aktionen">
          <button type="button" className="lz-verwerfen" onClick={onClose}>
            Verwerfen
          </button>
          <button
            type="button"
            className="lz-heften"
            onClick={heften}
            disabled={laeuft || !inhalt.trim()}
          >
            An Wissen heften
          </button>
        </div>
      </div>
    </div>
  );
}
