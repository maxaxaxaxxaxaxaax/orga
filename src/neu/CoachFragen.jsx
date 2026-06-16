import { useState } from "react";
import { koennensbeweise } from "../data/koennensbeweise";
import { COACH, ladeFragen, setzeFrage } from "./coach";
import "./CoachFragen.css";

// Sammelstelle fuer offene Fragen an den Lerncoach (SCHULE.md Cluster 3: Fragen
// merken bis zur naechsten Gelegenheit). Aggregiert die pro Ziel notierten
// Fragen an einem Ort, damit der Schueler sie beim Tutorentermin parat hat.
// Schuelergefuehrt: nur was der Schueler selbst notiert; entfernbar.
export default function CoachFragen() {
  const [fragen, setFragen] = useState(ladeFragen); // { kbId: text }

  const eintraege = Object.entries(fragen)
    .filter(([, text]) => (text || "").trim())
    .map(([id, text]) => ({
      id,
      text,
      kb: koennensbeweise.find((k) => k.id === id) || null,
    }));

  function entferne(id) {
    setzeFrage(id, "");
    setFragen((f) => {
      const n = { ...f };
      delete n[id];
      return n;
    });
  }

  return (
    <section className="cf">
      <h2 className="cf-titel">
        Fragen für {COACH}
        {eintraege.length > 0 && (
          <span className="cf-zahl">{eintraege.length}</span>
        )}
      </h2>
      {eintraege.length === 0 ? (
        <p className="cf-leer">
          Notier dir an einem Ziel Fragen, die du nicht allein löst. Hier sammeln
          sie sich bis zum Tutorentermin.
        </p>
      ) : (
        <ul className="cf-liste">
          {eintraege.map((e) => (
            <li className="cf-item" key={e.id}>
              <span className="cf-frage">„{e.text}"</span>
              {e.kb && (
                <span className="cf-kontext">
                  {e.kb.code} · {e.kb.fach}
                </span>
              )}
              <button
                type="button"
                className="cf-weg"
                onClick={() => entferne(e.id)}
                aria-label="Frage entfernen"
                title="Frage erledigt / entfernen"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
