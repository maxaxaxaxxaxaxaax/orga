import { useEffect, useState } from "react";
import { lernwegFuerKb } from "../data/wissen";
import { generatorFuerKb } from "./uebungen";
import { ART_LABEL } from "./material";
import { eigeneFuerThema } from "./eigeneMaterialien";
import { addSekunden, zeitInfo, formatMin } from "./zeitmessung";
import { ladeSchritte, speichereSchritte } from "./lernschritte";
import { GEFUEHL_LABEL, ladeGefuehl } from "./schrittgefuehl";
import { ladeZiel, setzeZiel } from "./lernziele";
import { lade, ERLEDIGT_KEY } from "./planung";
import { istOeffenbar, aktivitaetLabel, istAufgabeMaterial } from "./interaktiv";
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
  // Selbsteinschätzung pro Schritt (im Fokus gesetzt): hier nur gespiegelt.
  const gefuehl = ladeGefuehl(kb.id);
  // Eigenes Lernziel: was der Schüler selbst mit diesem KB erreichen will.
  const [ziel, setZiel] = useState(() => ladeZiel(kb.id));
  const [zielEdit, setZielEdit] = useState(false);
  const [zielEntwurf, setZielEntwurf] = useState("");
  function zielBearbeiten() {
    setZielEntwurf(ziel);
    setZielEdit(true);
  }
  function zielSpeichern() {
    const t = zielEntwurf.trim();
    setzeZiel(kb.id, t);
    setZiel(t);
    setZielEdit(false);
  }

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
  // Landkarten-Themen (studyflix-artig) zeigen statt Schritt-Plan nur die
  // Erklaerung plus die eigenen Materialien zum Thema.
  const istLandkarte = !!(thema && thema.landkarte);
  // Lernweg-Schritte: eigener Haken-Stand vor der Vorgabe aus wissen.js.
  const schrittFertig = (i) =>
    schrittStand[i] != null ? schrittStand[i] : !!thema?.schritte?.[i]?.fertig;
  function toggleSchritt(i) {
    const next = { ...schrittStand, [i]: !schrittFertig(i) };
    setSchrittStand(next);
    speichereSchritte(kb.id, next);
  }
  const fertigeSchritte = thema?.schritte
    ? thema.schritte.filter((_, i) => schrittFertig(i)).length
    : 0;
  // Der aktuelle Schritt ist der erste noch offene. Der "Geschafft"-Knopf hakt
  // ihn ab und rückt so von selbst zum nächsten weiter (schnelles Durcharbeiten).
  const aktuellerSchritt = thema?.schritte
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
  // Material in zwei Gruppen trennen: Aufgaben (interaktive Uebungen, zum
  // Bearbeiten) und Nachschlage-Material (lesen). Gleiche Logik wie im Fokus.
  const aufgabenMats = materialien.filter(istAufgabeMaterial);
  const materialMats = materialien.filter((m) => !istAufgabeMaterial(m));
  const hatAufgabe = aufgabenMats.length > 0 || !!genKey;

  // Lernpfad-Einordnung: worauf dieses Ziel aufbaut (Vorgänger in der Fach-Kette
  // aus wissen.js). Hilft, Blockaden als fehlende Grundlage zu erkennen, statt
  // nur frustriert festzustecken. Nur spiegeln, kein Zwang.
  const verkn = lw?.fach?.verknuepfungen || [];
  const vorgaengerKante = thema ? verkn.find((p) => p[1] === thema.id) : null;
  const vorgaenger = vorgaengerKante
    ? (lw.fach.themen || []).find((t) => t.id === vorgaengerKante[0])
    : null;
  const vorgaengerFertig = vorgaenger
    ? !!lade(ERLEDIGT_KEY)[vorgaenger.kbId]
    : false;
  const vorBlock = vorgaenger ? (
    <section
      className="ki-block ki-vor"
      key="vor"
      data-stand={vorgaengerFertig ? "ok" : "offen"}
    >
      <h4 className="ki-block-titel">Baut auf auf</h4>
      <p className="ki-vor-text">
        <span className="ki-vor-name">{vorgaenger.label}</span>
        <span className="ki-vor-hinweis">
          {vorgaengerFertig
            ? "hast du erledigt"
            : "schau, dass du dich da sicher fühlst"}
        </span>
      </p>
    </section>
  ) : null;

  // Ein Material als Listeneintrag (antippbar zum Oeffnen im Modal).
  const materialItem = (m) => {
    const aktivitaet = aktivitaetLabel(m);
    const inner = (
      <>
        <span className="ki-material-art">{ART_LABEL[m.art] || m.art}</span>
        <span className="ki-material-titel">{m.titel}</span>
        {aktivitaet && (
          <span
            className={
              "ki-material-aktiv" + (aktivitaet === "Lesen" ? " lesen" : "")
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
  };

  // Aufgaben-Block: das, was man bearbeitet (interaktive Uebungen + Quiz).
  const aufgabenBlock = hatAufgabe ? (
    <section className="ki-block ki-aufgaben" key="aufgaben">
      <h4 className="ki-block-titel">
        Arbeitsblatt
        <span className="ki-block-hint">zum Bearbeiten</span>
      </h4>
      {genKey &&
        (kompakt && !uebenOffen ? (
          <button
            type="button"
            className="ki-ueben-start"
            onClick={() => setUebenOffen(true)}
          >
            Übung starten
          </button>
        ) : (
          <Quiz generatorKey={genKey} />
        ))}
      {aufgabenMats.length > 0 && (
        <ul className="ki-materialien">{aufgabenMats.map(materialItem)}</ul>
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
                  {gefuehl[i] && (
                    <span
                      className="ki-schritt-gefuehl"
                      data-g={gefuehl[i]}
                      title={`Für dich: ${GEFUEHL_LABEL[gefuehl[i]]}`}
                    >
                      {GEFUEHL_LABEL[gefuehl[i]]}
                    </span>
                  )}
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

  // Bereitschafts-Anzeige (SCHULE.md Cluster 4): spiegelt den eigenen Stand,
  // ohne zu draengen. Der Schueler entscheidet selbst, wann er sich sicher
  // fuehlt und sich zur Abnahme meldet. Nur bei vorhandenem Lernweg.
  const gesamtSchritte = thema?.schritte?.length || 0;
  const bereit = gesamtSchritte > 0 && fertigeSchritte === gesamtSchritte;
  const stand = bereit
    ? "voll"
    : fertigeSchritte === 0
      ? "start"
      : "unterwegs";
  const bereitBlock =
    gesamtSchritte > 0 ? (
      <section className="ki-block ki-bereit" key="bereit" data-stand={stand}>
        <h4 className="ki-block-titel">
          <span className="ki-bereit-punkt" aria-hidden="true" />
          Bereit für die Abnahme?
        </h4>
        <p className="ki-bereit-text">
          {bereit
            ? "Alle Schritte sind durch. Wenn du dich sicher fühlst, melde dich bei der Lehrkraft zur Abnahme."
            : fertigeSchritte === 0
              ? "Starte mit dem ersten Schritt deines Lernwegs."
              : `Du bist unterwegs: ${fertigeSchritte} von ${gesamtSchritte} Schritten. Mach weiter, bis du dich sicher fühlst.`}
        </p>
      </section>
    ) : null;

  // Nachschlage-Block: Material zum Lesen (Lernzettel, Merkblatt, Mitschrift,
  // eigener Aufschrieb), klar getrennt von den Aufgaben.
  const nachschlagenBlock = (
    <section className="ki-block" key="material">
      <h4 className="ki-block-titel">Material zum Nachschlagen</h4>
      {materialMats.length === 0 ? (
        <p className="ki-leer">Noch kein Nachschlage-Material zu diesem Ziel.</p>
      ) : (
        <ul className="ki-materialien">{materialMats.map(materialItem)}</ul>
      )}
    </section>
  );

  const zielBlock = (
    <section className="ki-block ki-ziel" key="ziel">
      <div className="ki-ziel-kopf">
        <h4 className="ki-block-titel">Mein Ziel</h4>
        {ziel && !zielEdit && (
          <button
            type="button"
            className="ki-ziel-aendern"
            onClick={zielBearbeiten}
          >
            ändern
          </button>
        )}
      </div>
      {zielEdit ? (
        <div className="ki-ziel-edit">
          <textarea
            className="ki-ziel-feld"
            rows={2}
            value={zielEntwurf}
            onChange={(e) => setZielEntwurf(e.target.value)}
            placeholder="Was willst du mit diesem Ziel erreichen? Zum Beispiel: sicher genug für die Abnahme, oder alles verstehen, auch die schweren Teile."
            autoFocus
          />
          <div className="ki-ziel-aktionen">
            <button
              type="button"
              className="ki-ziel-speichern"
              onClick={zielSpeichern}
            >
              Speichern
            </button>
            <button
              type="button"
              className="ki-ziel-abbrechen"
              onClick={() => setZielEdit(false)}
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : ziel ? (
        <p className="ki-ziel-text">{ziel}</p>
      ) : (
        <button
          type="button"
          className="ki-ziel-leer"
          onClick={zielBearbeiten}
        >
          + Ziel für dich setzen
        </button>
      )}
    </section>
  );

  if (istLandkarte) {
    return (
      <div className="ki ki-landkarte">
        <p className="ki-erklaerung">{thema.erklaerung}</p>
        {nachschlagenBlock}
        {offenesMaterial && (
          <MaterialAnsicht
            material={offenesMaterial}
            onClose={() => setOffenesMaterial(null)}
          />
        )}
      </div>
    );
  }

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
      {zielBlock}
      {vorBlock}
      {[aufgabenBlock, schritteBlock, nachschlagenBlock, bereitBlock]}
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
