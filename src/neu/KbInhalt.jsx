import { useEffect, useState } from "react";
import { lernwegFuerKb } from "../data/wissen";
import { generatorFuerKb } from "./uebungen";
import { ART_LABEL } from "./material";
import { eigeneFuerThema } from "./eigeneMaterialien";
import { addSekunden, zeitInfo, formatMin } from "./zeitmessung";
import { ladeSchritte, speichereSchritte } from "./lernschritte";
import { istOeffenbar, aktivitaetLabel } from "./interaktiv";
import Quiz from "./Quiz";
import MaterialAnsicht from "./MaterialAnsicht";
import CoachBruecke from "./CoachBruecke";
import "./KbInhalt.css";

// Inhalt eines Etappenziels: Übung (Quiz) + Schritte + Materialien.
// Geteilt von der Tageskarte, dem Detail-Modal und der Ablage.
// kompakt (Ablage): Materialien zuerst, die Übung startet erst auf Knopfdruck.
export default function KbInhalt({ kb, kompakt = false }) {
  const [uebenOffen, setUebenOffen] = useState(false);
  const [offenesMaterial, setOffenesMaterial] = useState(null);
  const [schrittStand, setSchrittStand] = useState(() => ladeSchritte(kb.id));

  // Still die Lernzeit messen, solange dieser Inhalt offen ist: beim Schließen
  // (Unmount) die verstrichene Zeit aufs Ziel buchen.
  useEffect(() => {
    const start = Date.now();
    return () => addSekunden(kb.id, (Date.now() - start) / 1000);
  }, [kb.id]);

  const zi = zeitInfo(kb);
  const gelerntMin = Math.round(zi.gelerntSek / 60);
  const lw = lernwegFuerKb(kb.id);
  const thema = lw?.thema || null;
  // Lernweg-Schritte: eigener Haken-Stand vor der Vorgabe aus wissen.js.
  const schrittFertig = (i) =>
    schrittStand[i] != null ? schrittStand[i] : !!thema?.schritte?.[i]?.fertig;
  function toggleSchritt(i) {
    const next = { ...schrittStand, [i]: !schrittFertig(i) };
    setSchrittStand(next);
    speichereSchritte(kb.id, next);
  }
  const fertigeSchritte = thema
    ? thema.schritte.filter((_, i) => schrittFertig(i)).length
    : 0;
  // Der aktuelle Schritt ist der erste noch offene. Der "Geschafft"-Knopf hakt
  // ihn ab und rückt so von selbst zum nächsten weiter (schnelles Durcharbeiten).
  const aktuellerSchritt = thema
    ? thema.schritte.findIndex((_, i) => !schrittFertig(i))
    : -1;
  // Seed-Materialien des Lernwegs plus eigene Uploads dazu.
  const materialien = lw
    ? [
        ...(lw.fach.materialien || []).filter((m) => m.thema === thema.label),
        ...eigeneFuerThema(lw.fachId, thema.label),
      ]
    : [];
  const genKey = generatorFuerKb(kb.id);

  const uebenBlock = genKey ? (
    <section className="ki-block" key="ueben">
      <h4 className="ki-block-titel">Üben</h4>
      {kompakt && !uebenOffen ? (
        <button
          type="button"
          className="ki-ueben-start"
          onClick={() => setUebenOffen(true)}
        >
          Übung starten
        </button>
      ) : (
        <Quiz generatorKey={genKey} />
      )}
    </section>
  ) : null;

  const schritteBlock =
    thema?.schritte?.length > 0 ? (
      <section className="ki-block" key="schritte">
        <h4 className="ki-block-titel">
          Schritte
          <span className="ki-schritte-zahl">
            {fertigeSchritte} von {thema.schritte.length}
          </span>
        </h4>
        <ol className="ki-schritte">
          {thema.schritte.map((s, i) => {
            const fertig = schrittFertig(i);
            const aktuell = i === aktuellerSchritt;
            return (
              <li key={i}>
                <button
                  type="button"
                  className={
                    "ki-schritt" +
                    (fertig ? " fertig" : "") +
                    (aktuell ? " aktuell" : "")
                  }
                  onClick={() => toggleSchritt(i)}
                  aria-pressed={fertig}
                  aria-current={aktuell ? "step" : undefined}
                >
                  <span className="ki-schritt-box" aria-hidden="true">
                    {fertig ? "✓" : ""}
                  </span>
                  <span className="ki-schritt-text">{s.text}</span>
                </button>
              </li>
            );
          })}
        </ol>
        {aktuellerSchritt >= 0 ? (
          <button
            type="button"
            className="ki-schritt-weiter"
            onClick={() => toggleSchritt(aktuellerSchritt)}
          >
            Schritt geschafft
            <span className="ki-schritt-weiter-pfeil" aria-hidden="true">
              →
            </span>
          </button>
        ) : (
          <p className="ki-schritt-alle">Alle Schritte geschafft ✓</p>
        )}
      </section>
    ) : null;

  const materialBlock = (
    <section className="ki-block" key="material">
      <h4 className="ki-block-titel">Materialien</h4>
      {materialien.length === 0 ? (
        <p className="ki-leer">Noch keine Materialien zu diesem Ziel.</p>
      ) : (
        <ul className="ki-materialien">
          {materialien.map((m) => {
            const aktivitaet = aktivitaetLabel(m);
            const inner = (
              <>
                <span className="ki-material-art">
                  {ART_LABEL[m.art] || m.art}
                </span>
                <span className="ki-material-titel">{m.titel}</span>
                {aktivitaet && (
                  <span
                    className={
                      "ki-material-aktiv" +
                      (aktivitaet === "Lesen" ? " lesen" : "")
                    }
                  >
                    {aktivitaet}
                  </span>
                )}
              </>
            );
            return (
              <li key={m.id}>
                {istOeffenbar(m) ? (
                  <button
                    type="button"
                    className="ki-material ki-material-klick"
                    onClick={() => setOffenesMaterial(m)}
                    title="Material öffnen"
                  >
                    {inner}
                  </button>
                ) : (
                  <div className="ki-material">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  return (
    <div className="ki">
      <p className="ki-zeit">
        <span>Geplant ~{formatMin(zi.geplantMin)}</span>
        {zi.realistischMin != null ? (
          <span className="ki-zeit-real">
            für dich realistisch ~{formatMin(zi.realistischMin)}
          </span>
        ) : (
          <span className="ki-zeit-lernt">die App lernt noch dein Tempo</span>
        )}
        {gelerntMin >= 1 && <span>bisher {formatMin(gelerntMin)} gelernt</span>}
      </p>
      {kompakt
        ? [materialBlock, schritteBlock, uebenBlock]
        : [uebenBlock, schritteBlock, materialBlock]}
      <CoachBruecke kb={kb} />
      {offenesMaterial && (
        <MaterialAnsicht
          material={offenesMaterial}
          onClose={() => setOffenesMaterial(null)}
        />
      )}
    </div>
  );
}
