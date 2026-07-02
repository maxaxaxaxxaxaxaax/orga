import { Fragment, useEffect, useState } from "react";
import { erstelleLernzettel } from "./kiClient";
import { lernzettelAusVerlauf } from "./materialAssistent";
import "./LernzettelModal.css";

// E8: **fett** im Text wird wirklich fett gesetzt (sonst unverändert).
function fett(text, key) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((t, i) =>
    /^\*\*[^*]+\*\*$/.test(t) ? (
      <strong key={key + i}>{t.slice(2, -2)}</strong>
    ) : (
      <Fragment key={key + i}>{t}</Fragment>
    )
  );
}

// E8: Lernzettel-Vorschau. Rendert den (markdown-nahen) Text als ruhige Notiz,
// genau wie er später in der Ablage erscheint: "- " wird Stichpunkt, eine kurze
// Zeile auf ":" (oder "# ") wird Überschrift, **fett** wird fett.
function LzVorschau({ text }) {
  const leer = !text.trim();
  const zeilen = (text || "").split("\n");
  return (
    <div className="lz-vorschau">
      {leer && <p className="lz-v-leer">Der Lernzettel erscheint hier …</p>}
      {!leer &&
        zeilen.map((roh, i) => {
          const z = roh.trim();
          if (!z) return null;
          if (/^([-*•])\s+/.test(z))
            return (
              <p className="lz-v-punkt" key={i}>
                {fett(z.replace(/^([-*•])\s+/, ""), "p" + i)}
              </p>
            );
          if (/^#{1,3}\s+/.test(z))
            return (
              <p className="lz-v-h" key={i}>
                {fett(z.replace(/^#{1,3}\s+/, ""), "h" + i)}
              </p>
            );
          if (z.endsWith(":") && z.length <= 46)
            return (
              <p className="lz-v-h" key={i}>
                {fett(z, "h" + i)}
              </p>
            );
          return (
            <p className="lz-v-zeile" key={i}>
              {fett(z, "z" + i)}
            </p>
          );
        })}
    </div>
  );
}

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
  const [bearbeiten, setBearbeiten] = useState(false);

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
        <button type="button" className="lz-close" onClick={onClose} aria-label="Schließen">
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

        <div className="lz-feld">
          <span className="lz-feld-kopf">
            <span>Inhalt {laeuft && <em>wird geschrieben …</em>}</span>
            {!laeuft && (
              <button
                type="button"
                className="lz-umschalten"
                onClick={() => setBearbeiten((b) => !b)}
              >
                {bearbeiten ? "Vorschau" : "Bearbeiten"}
              </button>
            )}
          </span>
          {bearbeiten ? (
            <textarea
              value={inhalt}
              onChange={(e) => setInhalt(e.target.value)}
              rows={10}
              placeholder="Der Lernzettel erscheint hier …"
            />
          ) : (
            <LzVorschau text={inhalt} />
          )}
        </div>

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
