import { useState } from "react";
import { lade, ERLEDIGT_KEY } from "./planung";
import {
  COACH,
  ladeHilferufe,
  setzeHilferuf,
  ladeAbnahmen,
  setzeAbnahme,
  ladeFragen,
  setzeFrage,
} from "./coach";
import "./CoachBruecke.css";

// Schülergeführte Brücke zum Lerncoach für genau dieses Ziel (VISION.md "zweite
// Säule", SCHULE.md Cluster 3 + 4). Zwei stille, vom Schüler ausgelöste Signale,
// nie automatisch: "komme nicht weiter" und "zur Abnahme anmelden". Der Coach
// sieht nur, was der Schüler hier selbst öffnet. Beides ist zurücknehmbar.
export default function CoachBruecke({ kb }) {
  const [hilfe, setHilfe] = useState(() => !!ladeHilferufe()[kb.id]);
  const [abnahme, setAbnahme] = useState(() => !!ladeAbnahmen()[kb.id]);
  const [frage, setFrage] = useState(() => ladeFragen()[kb.id] || "");
  const erbracht = !!lade(ERLEDIGT_KEY)[kb.id];

  // Erbracht: kein Hilfe-/Abnahme-Bedarf mehr, ruhig nichts zeigen.
  if (erbracht) return null;

  function toggleHilfe() {
    const an = !hilfe;
    setzeHilferuf(kb.id, an);
    setHilfe(an);
    // Hilferuf zurückgenommen: die notierte Frage gleich mit aufräumen.
    if (!an) {
      setzeFrage(kb.id, "");
      setFrage("");
    }
  }
  function toggleAbnahme() {
    setzeAbnahme(kb.id, !abnahme);
    setAbnahme((a) => !a);
  }

  return (
    <section className="cb">
      <h4 className="cb-titel">Lerncoach</h4>
      <div className="cb-zeilen">
        {hilfe ? (
          <div className="cb-status cb-hilfe">
            <span>
              {COACH} weiß, dass du hier nicht weiterkommst.
              {frage && <span className="cb-frage"> „{frage}"</span>}
            </span>
            <button type="button" className="cb-zurueck" onClick={toggleHilfe}>
              zurücknehmen
            </button>
          </div>
        ) : (
          <button type="button" className="cb-knopf" onClick={toggleHilfe}>
            Ich komme nicht weiter
          </button>
        )}

        {abnahme ? (
          <div className="cb-status cb-abnahme">
            <span>Bei {COACH} zur Abnahme angemeldet.</span>
            <button type="button" className="cb-zurueck" onClick={toggleAbnahme}>
              zurücknehmen
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="cb-knopf cb-knopf-stark"
            onClick={toggleAbnahme}
          >
            Zur Abnahme anmelden
          </button>
        )}
      </div>
    </section>
  );
}
