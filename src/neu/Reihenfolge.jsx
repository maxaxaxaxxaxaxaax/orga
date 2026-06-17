import { useState } from "react";
import Fertig from "./Fertig";
import UebungHinweis from "./UebungHinweis";
import "./Reihenfolge.css";

// Reihenfolge-Übung (Sequencing): Schritte/Stationen in die richtige Ordnung
// bringen. Die Vorgabe-Liste ist bereits korrekt sortiert; beim Laden wird sie
// genau einmal gemischt (useState-Initialisierer). Verschieben per Pfeil hoch/
// runter, dann "Prüfen": richtig platzierte Schritte werden grün, falsche rot.
// Sind alle an ihrem Platz, kommt ein ruhiger Fertig-Hinweis. Kein Tracking.

function mischen(n) {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  // Sehr kurze Listen können zufällig schon korrekt liegen: dann einmal rotieren,
  // damit es immer etwas zu tun gibt.
  const schonRichtig = idx.every((v, p) => v === p);
  if (schonRichtig && n > 1) idx.push(idx.shift());
  return idx;
}

export default function Reihenfolge({ daten }) {
  const schritte = (daten && daten.schritte) || [];
  const [order, setOrder] = useState(() => mischen(schritte.length));
  const [geprueft, setGeprueft] = useState(false);

  if (schritte.length === 0)
    return <p className="rf-leer">Für diese Übung gibt es noch keine Schritte.</p>;

  const richtigAnzahl = order.filter((orig, pos) => orig === pos).length;
  const alleRichtig = richtigAnzahl === schritte.length;

  function verschiebe(pos, richtung) {
    const ziel = pos + richtung;
    if (ziel < 0 || ziel >= order.length) return;
    setOrder((o) => {
      const next = [...o];
      [next[pos], next[ziel]] = [next[ziel], next[pos]];
      return next;
    });
    setGeprueft(false);
  }

  function pruefen() {
    setGeprueft(true);
  }

  function nochmal() {
    setOrder(mischen(schritte.length));
    setGeprueft(false);
  }

  if (geprueft && alleRichtig) {
    return (
      <div className="rf">
        <Fertig
          text="Alles in der richtigen Reihenfolge."
          nochmalLabel="Nochmal mischen"
          onNochmal={nochmal}
        />
      </div>
    );
  }

  return (
    <div className="rf">
      <div className="rf-kopf">
        <span className="rf-label">Reihenfolge</span>
        {geprueft && (
          <span className="rf-fortschritt">
            {richtigAnzahl} / {schritte.length} richtig
          </span>
        )}
      </div>

      <UebungHinweis id="reihenfolge">
        Bring die Karten mit den Pfeilen hoch und runter in die richtige
        Reihenfolge, dann tippe auf Prüfen.
      </UebungHinweis>

      {daten.aufgabe && <p className="rf-aufgabe">{daten.aufgabe}</p>}

      <ol className="rf-liste">
        {order.map((orig, pos) => {
          const status = geprueft ? (orig === pos ? "ok" : "no") : "";
          return (
            <li
              className={"rf-item" + (status ? " " + status : "")}
              key={orig}
            >
              <span className="rf-nummer" aria-hidden="true">
                {pos + 1}
              </span>
              <span className="rf-text">{schritte[orig]}</span>
              <span className="rf-pfeile">
                <button
                  type="button"
                  className="rf-pfeil"
                  onClick={() => verschiebe(pos, -1)}
                  disabled={pos === 0}
                  aria-label="Nach oben"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rf-pfeil"
                  onClick={() => verschiebe(pos, 1)}
                  disabled={pos === order.length - 1}
                  aria-label="Nach unten"
                >
                  ↓
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      <button type="button" className="rf-pruefen" onClick={pruefen}>
        Prüfen
      </button>

      {geprueft && !alleRichtig && (
        <p className="rf-hinweis" role="status">
          Noch nicht ganz. Verschiebe die roten Karten und prüfe erneut.
        </p>
      )}
    </div>
  );
}
