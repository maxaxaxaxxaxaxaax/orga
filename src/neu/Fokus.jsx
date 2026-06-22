import { useState, useEffect } from "react";
import { lernwegFuerKb } from "../data/wissen";
import { ART_LABEL } from "./material";
import { eigeneFuerThema, speichereEigenes } from "./eigeneMaterialien";
import { ladeSchritte, speichereSchritte } from "./lernschritte";
import {
  GEFUEHLE,
  GEFUEHL_LABEL,
  ladeGefuehl,
  setzeGefuehl,
} from "./schrittgefuehl";
import { addSekunden } from "./zeitmessung";
import { generatorFuerKb } from "./uebungen";
import {
  COACH,
  ladeHilferufe,
  setzeHilferuf,
  setzeAbnahme,
  ladeFragen,
  setzeFrage,
  ladeMaterialwuensche,
  setzeMaterialwunsch,
} from "./coach";
import Quiz from "./Quiz";
import MaterialAnsicht from "./MaterialAnsicht";
import MaterialInhalt from "./MaterialInhalt";
import MaterialUpload from "./MaterialUpload";
import Rechenweg from "./Rechenweg";
import Aufschrieb from "./Aufschrieb";
import { hatRechenweg } from "./rechenwegSpeicher";
import { ladeArbeitsmodus, speichereArbeitsmodus } from "./arbeitsmodus";
import { materialHinweis } from "./materialHinweis";
import { addNotiz, ladeNotizen } from "./notizen";
import {
  istOeffenbar,
  aktivitaetLabel,
  interaktivFuerMaterial,
} from "./interaktiv";
import "./Fokus.css";

// Fokus-Modus: Vollbild, ein Schritt pro Seite. "Jetzt" öffnet das Ziel hier,
// mit "Geschafft, weiter" arbeitet man den Lernweg Schritt für Schritt durch.
// Reduktion und Fokus-Session aus der Vision; der Schritt-Stand teilt sich mit
// der Ablage/Heute (gleiche localStorage-Quelle).
export default function Fokus({ kb, naechste, onFertig, onWeiter, onClose }) {
  const lw = lernwegFuerKb(kb.id);
  const thema = lw?.thema || null;
  const schritte = thema?.schritte || [];
  const [stand, setStand] = useState(() => ladeSchritte(kb.id));
  // Nach dem Abschliessen kein Auto-Sprung: erst diese Auswahl (weiter / zurueck).
  const [abgeschlossen, setAbgeschlossen] = useState(false);
  // Freiwillige Selbsteinschätzung pro Schritt (leicht/ging so/schwer): spiegelt
  // dem Schüler später, wo es hakte. Kein Coach-Blick, keine Wertung.
  const [gefuehl, setGefuehl] = useState(() => ladeGefuehl(kb.id));
  const [material, setMaterial] = useState(null);
  const [uploadOffen, setUploadOffen] = useState(false);
  // Handschriftlicher Rechenweg (nur bei Mathe-Zielen sinnvoll).
  const [rechenwegOffen, setRechenwegOffen] = useState(false);
  const istMathe = kb.fach === "Mathematik";
  // Arbeitsmodus: "digital" (am Gerät) oder "tisch" (analog am Schreibtisch).
  // Eine bewusste Schüler-Wahl, sitzungsweit gemerkt (Self-Signal, kein Tracking).
  const [arbeitsmodus, setArbeitsmodus] = useState(ladeArbeitsmodus);
  const [aufschriebOffen, setAufschriebOffen] = useState(false);
  // Material-Lücke: Wunsch nach mehr Material (Brücke zum Coach) und ein
  // KI-Hinweis, der nur auf Vorhandenes zeigt.
  const [matWunsch, setMatWunsch] = useState(() => !!ladeMaterialwuensche()[kb.id]);
  const [hinweisOffen, setHinweisOffen] = useState(false);
  const [hilfe, setHilfe] = useState(() => !!ladeHilferufe()[kb.id]);
  const [frage, setFrage] = useState(() => ladeFragen()[kb.id] || "");
  const [hilfeOffen, setHilfeOffen] = useState(false);
  const [entwurf, setEntwurf] = useState("");
  // Gedanken-Parkplatz: einen abdriftenden Gedanken kurz wegschreiben, ohne den
  // Fokus zu verlieren. Reviewbar auf Heute (Notizzettel).
  const [parkOffen, setParkOffen] = useState(false);
  const [parkEntwurf, setParkEntwurf] = useState("");
  const [parkAnzahl, setParkAnzahl] = useState(() => ladeNotizen().length);

  // Lernzeit im Fokus messen (die Hauptarbeitsumgebung): beim Schliessen die
  // verstrichene Zeit aufs Ziel buchen. Speist die realistische Zeitschaetzung.
  useEffect(() => {
    const start = Date.now();
    return () => addSekunden(kb.id, (Date.now() - start) / 1000);
  }, [kb.id]);

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
  }
  function zurueck() {
    const i = (aktuell === -1 ? schritte.length : aktuell) - 1;
    if (i < 0) return;
    const next = { ...stand, [i]: false };
    setStand(next);
    speichereSchritte(kb.id, next);
  }
  // Gefühl für den aktuellen Schritt setzen. Nochmal dasselbe tippen hebt es auf.
  function waehleGefuehl(wert) {
    if (aktuell < 0) return;
    const neuWert = gefuehl[aktuell] === wert ? null : wert;
    setzeGefuehl(kb.id, aktuell, neuWert);
    setGefuehl((g) => {
      const next = { ...g };
      if (neuWert == null) delete next[aktuell];
      else next[aktuell] = neuWert;
      return next;
    });
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
    // Nur den Hilferuf zuruecknehmen: die notierte Frage bleibt erhalten und
    // wartet in der Sammlung bis zum Tutorentermin (entkoppelt).
    setzeHilferuf(kb.id, false);
    setHilfe(false);
    setHilfeOffen(false);
  }
  function park() {
    const t = parkEntwurf.trim();
    if (!t) return;
    // Kontext mitgeben: zu welchem Ziel und Schritt der Gedanke gehoert.
    const kontext =
      kb.titel + (aktuell >= 0 ? " · Schritt " + (aktuell + 1) : "");
    addNotiz(t, kontext);
    setParkEntwurf("");
    setParkAnzahl((n) => n + 1);
  }
  function waehleModus(m) {
    setArbeitsmodus(m);
    speichereArbeitsmodus(m);
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
        abgeschlossen ? (
          <main className="fokus-buehne">
            <p className="fokus-eyebrow">Geschafft ✓</p>
            <h1 className="fokus-titel">{kb.titel}</h1>
            <p className="fokus-info">
              {naechste
                ? "Gut gemacht. Möchtest du gleich weitermachen oder zurück zur Übersicht?"
                : "Stark, du hast alle Ziele für heute geschafft."}
            </p>
            <div className="fokus-fuss">
              {naechste && (
                <button
                  type="button"
                  className="fokus-weiter"
                  onClick={() => onWeiter(naechste.id)}
                >
                  Weiter mit {naechste.fach}: {naechste.titel} →
                </button>
              )}
              <button
                type="button"
                className={naechste ? "fokus-sekundaer" : "fokus-weiter"}
                onClick={onClose}
              >
                Zurück zur Übersicht
              </button>
            </div>
          </main>
        ) : (
          <main className="fokus-buehne">
            <p className="fokus-eyebrow">Geschafft ✓</p>
            <h1 className="fokus-titel">{kb.titel}</h1>
            <p className="fokus-info">
              {schritte.length > 0 ? "Alle Schritte erledigt. " : ""}
              Wenn du dich sicher fühlst, melde den Könnensbeweis bei {COACH} zur
              Abnahme an. Sonst hakst du ihn nur für heute ab.
            </p>
            {hilfe && (
              <p className="fokus-hilfe-laeuft" role="status">
                Dein Hilferuf an {COACH} läuft noch. {COACH} kümmert sich später
                darum, du kannst ruhig weitermachen.
              </p>
            )}
            <div className="fokus-fuss">
              <button
                type="button"
                className="fokus-weiter"
                onClick={() => {
                  setzeAbnahme(kb.id, true);
                  onFertig(kb.id);
                  setAbgeschlossen(true);
                }}
              >
                Zur Abnahme anmelden
              </button>
              <button
                type="button"
                className="fokus-sekundaer"
                onClick={() => {
                  onFertig(kb.id);
                  setAbgeschlossen(true);
                }}
              >
                Nur für heute abhaken
              </button>
            </div>
            <button type="button" className="fokus-hilfe" onClick={onClose}>
              Erst mal schließen
            </button>
          </main>
        )
      ) : (
        <main className="fokus-buehne">
          <div className="fokus-modus" role="group" aria-label="Arbeitsmodus">
            <button
              type="button"
              className={
                "fokus-modus-knopf" + (arbeitsmodus === "digital" ? " aktiv" : "")
              }
              aria-pressed={arbeitsmodus === "digital"}
              onClick={() => waehleModus("digital")}
            >
              Digital
            </button>
            <button
              type="button"
              className={
                "fokus-modus-knopf" + (arbeitsmodus === "tisch" ? " aktiv" : "")
              }
              aria-pressed={arbeitsmodus === "tisch"}
              onClick={() => waehleModus("tisch")}
            >
              Am Tisch
            </button>
          </div>
          <p className="fokus-eyebrow">
            Schritt {aktuell + 1} von {schritte.length}
          </p>
          <h1 className="fokus-titel">{schritte[aktuell].text}</h1>

          <div className="fokus-gefuehl">
            <span className="fokus-gefuehl-frage">Wie läuft dieser Schritt?</span>
            <div className="fokus-gefuehl-knoepfe" role="group" aria-label="Wie läuft dieser Schritt?">
              {GEFUEHLE.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={
                    "fokus-gefuehl-knopf" +
                    (gefuehl[aktuell] === g ? " gewaehlt" : "")
                  }
                  data-g={g}
                  onClick={() => waehleGefuehl(g)}
                  aria-pressed={gefuehl[aktuell] === g}
                >
                  {GEFUEHL_LABEL[g]}
                </button>
              ))}
            </div>
          </div>

          {arbeitsmodus === "tisch" ? (
            <div className="fokus-tisch">
              <button
                type="button"
                className="fokus-digitalisieren"
                onClick={() => setAufschriebOffen(true)}
              >
                <span className="fokus-rechenweg-stift" aria-hidden="true">
                  ✎
                </span>
                Aufschrieb digitalisieren
                {hatRechenweg(kb.id) && (
                  <span className="fokus-rechenweg-badge">gespeichert</span>
                )}
              </button>
              {istMathe && (
                <button
                  type="button"
                  className="fokus-rechenweg"
                  onClick={() => setRechenwegOffen(true)}
                >
                  <span className="fokus-rechenweg-stift" aria-hidden="true">
                    ✎
                  </span>
                  Rechenweg mit Coach
                </button>
              )}
              <div className="fokus-tisch-ref">
                <span className="fokus-label">Dazu liegt digital bereit</span>
                {materialien.length === 0 ? (
                  <p className="fokus-mat-leer">
                    Noch kein Material hinterlegt. Wechsle zu Digital, um welches
                    anzufragen.
                  </p>
                ) : (
                  <ul className="fokus-tisch-liste">
                    {materialien.map((m) => (
                      <li key={m.id} className="fokus-tisch-mat">
                        <span className="fokus-mat-art">
                          {ART_LABEL[m.art] || m.art}
                        </span>
                        <span className="fokus-mat-titel">{m.titel}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <>
              {istMathe && (
                <button
                  type="button"
                  className="fokus-rechenweg"
                  onClick={() => setRechenwegOffen(true)}
                >
                  <span className="fokus-rechenweg-stift" aria-hidden="true">
                    ✎
                  </span>
                  Rechenweg aufschreiben
                  {hatRechenweg(kb.id) && (
                    <span className="fokus-rechenweg-badge">gespeichert</span>
                  )}
                </button>
              )}

              <div className="fokus-block">
                <div className="fokus-label-zeile">
                  <span className="fokus-label">Material dazu</span>
                  <button
                    type="button"
                    className="fokus-mat-add"
                    onClick={() => setUploadOffen(true)}
                  >
                    + anhängen
                  </button>
                </div>
                {materialien.length === 0 ? (
                  <>
                    <p className="fokus-mat-leer">
                      Noch nichts angehängt. Häng ein Foto, PDF oder eine Notiz
                      an.
                    </p>
                    <div className="fokus-luecke">
                      {matWunsch ? (
                        <p className="fokus-luecke-gesendet" role="status">
                          <span
                            className="fokus-hilfe-haken"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                          Material bei {COACH} angefragt.
                          <button
                            type="button"
                            className="fokus-luecke-zurueck"
                            onClick={() => {
                              setzeMaterialwunsch(kb.id, false);
                              setMatWunsch(false);
                            }}
                          >
                            zurücknehmen
                          </button>
                        </p>
                      ) : (
                        <button
                          type="button"
                          className="fokus-luecke-aktion"
                          onClick={() => {
                            setzeMaterialwunsch(kb.id, true);
                            setMatWunsch(true);
                          }}
                        >
                          Mehr Material anfragen
                        </button>
                      )}
                      {hinweisOffen ? (
                        <div className="fokus-hinweis" role="note">
                          {materialHinweis({
                            lw,
                            materialien,
                            naechsterSchrittText: schritte[aktuell]?.text,
                          })
                            .split("\n")
                            .map((zeile, i) => (
                              <p key={i}>{zeile}</p>
                            ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="fokus-luecke-aktion"
                          onClick={() => setHinweisOffen(true)}
                        >
                          Mit KI anreichern
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="fokus-mats">
                    {materialien.map((m) => {
                      const aktivitaet = aktivitaetLabel(m);
                      const uebung = interaktivFuerMaterial(m.id);
                      const kopf = (
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
                      // Interaktive Übung direkt offen im Fokus (kein Klick nötig).
                      if (uebung) {
                        return (
                          <div key={m.id} className="fokus-mat-offen">
                            <div className="fokus-mat-offen-kopf">{kopf}</div>
                            <MaterialInhalt material={m} />
                          </div>
                        );
                      }
                      // Reines Lese-Material (PDF, Notiz): antippbar zum Öffnen.
                      return istOeffenbar(m) ? (
                        <button
                          key={m.id}
                          type="button"
                          className="fokus-mat fokus-mat-klick"
                          onClick={() => setMaterial(m)}
                        >
                          {kopf}
                        </button>
                      ) : (
                        <span key={m.id} className="fokus-mat">
                          {kopf}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {genKey && (
                <div className="fokus-quiz">
                  <div className="fokus-label fokus-quiz-label">Dazu üben</div>
                  <Quiz generatorKey={genKey} />
                </div>
              )}
            </>
          )}

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
      {uploadOffen && (
        <MaterialUpload
          startFachId={lw?.fachId}
          startThema={thema?.label || ""}
          onSpeichern={(m) => {
            speichereEigenes(m);
            setUploadOffen(false);
          }}
          onClose={() => setUploadOffen(false)}
        />
      )}
      {rechenwegOffen && (
        <Rechenweg kb={kb} onClose={() => setRechenwegOffen(false)} />
      )}
      {aufschriebOffen && (
        <Aufschrieb
          kb={kb}
          onClose={() => setAufschriebOffen(false)}
          onGespeichert={(text) => {
            speichereEigenes({
              titel: "Mein Aufschrieb",
              fachId: lw?.fachId,
              thema: thema?.label || null,
              art: "aufschrieb",
              inhalt: text,
              bereich: "selbstlernen",
            });
            setAufschriebOffen(false);
          }}
        />
      )}
    </div>
  );
}
