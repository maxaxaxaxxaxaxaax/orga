import { useState, useEffect } from "react";
import { lernwegFuerKb } from "../data/wissen";
import { ART_LABEL } from "./material";
import { eigeneFuerThema } from "./eigeneMaterialien";
import { ladeSchritte, speichereSchritte } from "./lernschritte";
import { generatorFuerKb } from "./uebungen";
import {
  COACH,
  ladeHilferufe,
  setzeHilferuf,
  setzeAbnahme,
  ladeFragen,
  setzeFrage,
} from "./coach";
import Quiz from "./Quiz";
import MaterialAnsicht from "./MaterialAnsicht";
import { addNotiz, ladeNotizen } from "./notizen";
import { istOeffenbar, aktivitaetLabel } from "./interaktiv";
import "./Fokus.css";

// Fokus-Modus: Vollbild, ein Schritt pro Seite. "Jetzt" öffnet das Ziel hier,
// mit "Geschafft, weiter" arbeitet man den Lernweg Schritt für Schritt durch.
// Reduktion und Fokus-Session aus der Vision; der Schritt-Stand teilt sich mit
// der Ablage/Heute (gleiche localStorage-Quelle).
export default function Fokus({ kb, naechste, onFertig, onClose }) {
  const lw = lernwegFuerKb(kb.id);
  const thema = lw?.thema || null;
  const schritte = thema?.schritte || [];
  const [stand, setStand] = useState(() => ladeSchritte(kb.id));
  const [material, setMaterial] = useState(null);
  const [uebenOffen, setUebenOffen] = useState(false);
  const [hilfe, setHilfe] = useState(() => !!ladeHilferufe()[kb.id]);
  const [frage, setFrage] = useState(() => ladeFragen()[kb.id] || "");
  const [hilfeOffen, setHilfeOffen] = useState(false);
  const [entwurf, setEntwurf] = useState("");
  // Gedanken-Parkplatz: einen abdriftenden Gedanken kurz wegschreiben, ohne den
  // Fokus zu verlieren. Reviewbar auf Heute (Notizzettel).
  const [parkOffen, setParkOffen] = useState(false);
  const [parkEntwurf, setParkEntwurf] = useState("");
  const [parkAnzahl, setParkAnzahl] = useState(() => ladeNotizen().length);

  // Esc schließt verschachtelt: erst ein offenes Panel (Hilfe/Parken), sonst den
  // Fokus. Liegt eine Material-Ansicht oben, kümmert sie sich selbst um Esc.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (material) return;
      if (hilfeOffen) setHilfeOffen(false);
      else if (parkOffen) setParkOffen(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [material, hilfeOffen, parkOffen, onClose]);

  const fertig = (i) => (stand[i] != null ? stand[i] : !!schritte[i]?.fertig);
  const aktuell = schritte.findIndex((_, i) => !fertig(i));
  const alleFertig = schritte.length === 0 || aktuell === -1;
  const fertigeAnzahl = schritte.filter((_, i) => fertig(i)).length;

  function weiter() {
    if (aktuell < 0) return;
    const next = { ...stand, [aktuell]: true };
    setStand(next);
    speichereSchritte(kb.id, next);
    setUebenOffen(false);
  }
  function zurueck() {
    const i = (aktuell === -1 ? schritte.length : aktuell) - 1;
    if (i < 0) return;
    const next = { ...stand, [i]: false };
    setStand(next);
    speichereSchritte(kb.id, next);
    setUebenOffen(false);
  }
  function hilfeOeffnen() {
    setEntwurf(frage);
    setHilfeOffen(true);
  }
  function hilfeSenden() {
    setzeHilferuf(kb.id, true);
    setzeFrage(kb.id, entwurf);
    setFrage(entwurf.trim());
    setHilfe(true);
    setHilfeOffen(false);
  }
  function hilfeZuruecknehmen() {
    setzeHilferuf(kb.id, false);
    setzeFrage(kb.id, "");
    setFrage("");
    setEntwurf("");
    setHilfe(false);
    setHilfeOffen(false);
  }
  function park() {
    const t = parkEntwurf.trim();
    if (!t) return;
    addNotiz(t);
    setParkEntwurf("");
    setParkAnzahl((n) => n + 1);
  }

  const materialien = lw
    ? [
        ...(lw.fach.materialien || []).filter((m) => m.thema === thema.label),
        ...eigeneFuerThema(lw.fachId, thema.label),
      ]
    : [];
  const genKey = generatorFuerKb(kb.id);
  const proz = schritte.length
    ? Math.round((fertigeAnzahl / schritte.length) * 100)
    : 100;

  return (
    <div className="fokus" role="dialog" aria-modal="true" aria-label="Fokus">
      <header className="fokus-kopf">
        <button
          type="button"
          className="fokus-zu"
          onClick={onClose}
          aria-label="Fokus schließen"
        >
          ✕
        </button>
        <span className="fokus-kb">
          {kb.fach}: {kb.titel}
        </span>
        <span className="fokus-zaehler">
          {alleFertig ? schritte.length : aktuell + 1} / {schritte.length}
        </span>
      </header>
      <div className="fokus-balken" aria-hidden="true">
        <div className="fokus-balken-fuell" style={{ width: proz + "%" }} />
      </div>

      {alleFertig ? (
        <main className="fokus-buehne">
          <p className="fokus-eyebrow">Geschafft ✓</p>
          <h1 className="fokus-titel">{kb.titel}</h1>
          <p className="fokus-info">
            {schritte.length > 0 ? "Alle Schritte erledigt. " : ""}
            Wenn du dich sicher fühlst, melde den Könnensbeweis bei {COACH} zur
            Abnahme an. Sonst hakst du ihn nur für heute ab.
          </p>
          <div className="fokus-fuss">
            <button
              type="button"
              className="fokus-weiter"
              onClick={() => {
                setzeAbnahme(kb.id, true);
                onFertig(kb.id);
              }}
            >
              Zur Abnahme anmelden
            </button>
            <button
              type="button"
              className="fokus-sekundaer"
              onClick={() => onFertig(kb.id)}
            >
              {naechste ? "Nächstes Ziel →" : "Tag abschließen"}
            </button>
          </div>
          {naechste && (
            <p className="fokus-danach">
              Danach: {naechste.fach} · {naechste.titel}
            </p>
          )}
          <button type="button" className="fokus-hilfe" onClick={onClose}>
            Erst mal schließen
          </button>
        </main>
      ) : (
        <main className="fokus-buehne">
          <p className="fokus-eyebrow">
            Schritt {aktuell + 1} von {schritte.length}
          </p>
          <h1 className="fokus-titel">{schritte[aktuell].text}</h1>

          {materialien.length > 0 && (
            <div className="fokus-block">
              <span className="fokus-label">Material dazu</span>
              <div className="fokus-mats">
                {materialien.map((m) => {
                  const aktivitaet = aktivitaetLabel(m);
                  const inner = (
                    <>
                      <span className="fokus-mat-art">
                        {ART_LABEL[m.art] || m.art}
                      </span>
                      <span className="fokus-mat-titel">{m.titel}</span>
                      {aktivitaet && (
                        <span
                          className={
                            "fokus-mat-aktiv" +
                            (aktivitaet === "Lesen" ? " lesen" : "")
                          }
                        >
                          {aktivitaet}
                        </span>
                      )}
                    </>
                  );
                  return istOeffenbar(m) ? (
                    <button
                      key={m.id}
                      type="button"
                      className="fokus-mat fokus-mat-klick"
                      onClick={() => setMaterial(m)}
                    >
                      {inner}
                    </button>
                  ) : (
                    <span key={m.id} className="fokus-mat">
                      {inner}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {genKey &&
            (uebenOffen ? (
              <div className="fokus-quiz">
                <Quiz generatorKey={genKey} />
              </div>
            ) : (
              <button
                type="button"
                className="fokus-ueben"
                onClick={() => setUebenOffen(true)}
              >
                Dazu üben
              </button>
            ))}

          <div className="fokus-fuss">
            {aktuell > 0 && (
              <button
                type="button"
                className="fokus-zurueck"
                onClick={zurueck}
              >
                ← Schritt zurück
              </button>
            )}
            <button type="button" className="fokus-weiter" onClick={weiter}>
              Geschafft, weiter →
            </button>
          </div>

          <div className="fokus-hilfe-bereich">
            {hilfe ? (
              <div className="fokus-hilfe-status">
                <p className="fokus-hilfe-info">
                  <span className="fokus-hilfe-haken" aria-hidden="true">
                    ✓
                  </span>
                  {COACH} ist informiert.
                </p>
                {frage && <p className="fokus-hilfe-frage">„{frage}"</p>}
                <button
                  type="button"
                  className="fokus-hilfe-zurueck"
                  onClick={hilfeZuruecknehmen}
                >
                  zurücknehmen
                </button>
              </div>
            ) : hilfeOffen ? (
              <div className="fokus-hilfe-panel">
                <label className="fokus-hilfe-label" htmlFor="fokus-frage">
                  Woran hängt es? Schreib {COACH} kurz, was du brauchst
                  (freiwillig).
                </label>
                <textarea
                  id="fokus-frage"
                  className="fokus-hilfe-feld"
                  rows={3}
                  value={entwurf}
                  onChange={(e) => setEntwurf(e.target.value)}
                  placeholder="Zum Beispiel: Ich verstehe diesen Schritt nicht."
                />
                <div className="fokus-hilfe-aktionen">
                  <button
                    type="button"
                    className="fokus-hilfe-senden"
                    onClick={hilfeSenden}
                  >
                    An {COACH} senden
                  </button>
                  <button
                    type="button"
                    className="fokus-hilfe-abbrechen"
                    onClick={() => setHilfeOffen(false)}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="fokus-hilfe"
                onClick={hilfeOeffnen}
              >
                Ich komme hier nicht weiter
              </button>
            )}

            {parkOffen ? (
              <div className="fokus-park-panel">
                <input
                  type="text"
                  className="fokus-park-feld"
                  value={parkEntwurf}
                  onChange={(e) => setParkEntwurf(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") park();
                  }}
                  placeholder="Was dir gerade durch den Kopf geht..."
                  aria-label="Gedanke parken"
                  autoFocus
                />
                <div className="fokus-park-aktionen">
                  <button
                    type="button"
                    className="fokus-park-save"
                    onClick={park}
                  >
                    Parken
                  </button>
                  <button
                    type="button"
                    className="fokus-park-zu"
                    onClick={() => setParkOffen(false)}
                  >
                    Fertig
                  </button>
                  {parkAnzahl > 0 && (
                    <span className="fokus-park-zahl">
                      {parkAnzahl} auf dem Zettel
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="fokus-park-link"
                onClick={() => setParkOffen(true)}
              >
                Gedanke parken{parkAnzahl > 0 ? ` (${parkAnzahl})` : ""}
              </button>
            )}
          </div>
        </main>
      )}

      {material && (
        <MaterialAnsicht material={material} onClose={() => setMaterial(null)} />
      )}
    </div>
  );
}
