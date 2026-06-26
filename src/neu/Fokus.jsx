import { useState, useEffect, useRef } from "react";
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
import { addSekunden, zeitInfo, formatMin } from "./zeitmessung";
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
import { pruefeKi, pruefeVision, systemPromptCoach } from "./kiClient";
import { materialHinweis } from "./materialHinweis";
import { addNotiz, ladeNotizen, entferneNotiz } from "./notizen";
import {
  istOeffenbar,
  aktivitaetLabel,
  istAufgabeMaterial,
  materialKontext,
} from "./interaktiv";
import { CHIPS, iconFuerMaterial, chipFuerMaterial } from "./materialTypen";
import Quiz from "./Quiz";
import MaterialInhalt from "./MaterialInhalt";
import MaterialUpload from "./MaterialUpload";
import MaterialChat from "./MaterialChat";
import Rechenweg from "./Rechenweg";
import Aufschrieb from "./Aufschrieb";
import MarkierenFrage from "./MarkierenFrage";
import LiveCoach from "./LiveCoach";
import { hatRechenweg } from "./rechenwegSpeicher";
import "./Fokus.css";

// Fokus: Vollbild-Arbeitsumgebung für eine Aufgabe. Links eine schlanke
// Werkzeug-Toolbar (Chat mit KI-Coach und Lerncoach, Notizen, Markieren mit
// Screenshot, Aufschrieb digitalisieren), in der Mitte das aktive Material, rechts
// die passenden Materialien. Der Schritt-Stand teilt sich mit Ablage/Heute
// (gleiche localStorage-Quelle). Reduktion und Fokus-Session aus der Vision.

// Synthetisches "Material" für die generierte Übung (Quiz) in der Mitte.
const QUIZ = { id: "__quiz__" };

// ---- Werkzeug-Icons (Toolbar) -------------------------------------------
function IcChat(p) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z" />
    </svg>
  );
}
function IcNotizen(p) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4M8 12h8M8 16h6" />
    </svg>
  );
}
function IcStift(p) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}
function IcKamera(p) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function IcLive(p) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Fokus({ kb, naechste, onFertig, onWeiter, onClose }) {
  const lw = lernwegFuerKb(kb.id);
  const thema = lw?.thema || null;
  const schritte = thema?.schritte || [];
  const istMathe = kb.fach === "Mathematik";

  const [stand, setStand] = useState(() => ladeSchritte(kb.id));
  const [abgeschlossen, setAbgeschlossen] = useState(false);
  const [gefuehl, setGefuehl] = useState(() => ladeGefuehl(kb.id));

  // Welches geöffnete Panel-Werkzeug? Nur eins offen, erneuter Klick schließt.
  const [werkzeug, setWerkzeug] = useState(null); // "chat" | "notizen" | null
  const [chatTab, setChatTab] = useState("coach"); // "coach" | "lerncoach"

  // Vollbild-Werkzeuge mit eigenem Overlay.
  const [markierenOffen, setMarkierenOffen] = useState(false);
  const [aufschriebOffen, setAufschriebOffen] = useState(false);
  const [rechenwegOffen, setRechenwegOffen] = useState(false);
  const [uploadOffen, setUploadOffen] = useState(false);

  // Lokale KI (einmal beim Öffnen proben), Muster wie im Rechenweg.
  const [kiModell, setKiModell] = useState(null);
  const [visionModell, setVisionModell] = useState(null);

  // Lerncoach (Fr. Berg): stiller Hilferuf + offene Frage (geht an den Menschen).
  const [hilfe, setHilfe] = useState(() => !!ladeHilferufe()[kb.id]);
  const [frage, setFrage] = useState(() => ladeFragen()[kb.id] || "");
  const [entwurf, setEntwurf] = useState("");

  // Notizen (Gedanken-Parkplatz als Werkzeug).
  const [notizen, setNotizen] = useState(() => ladeNotizen());
  const [notizEntwurf, setNotizEntwurf] = useState("");

  // Rechte Leiste: Material-Filter, Suche, aktives Material in der Mitte.
  const [chip, setChip] = useState("alle");
  const [suche, setSuche] = useState("");
  // Frische eigene Materialien nach dem Speichern neu einlesen (Render-Trigger).
  const [, setEigeneStand] = useState(0);

  // Material-Lücke (Leerzustand der rechten Leiste).
  const [matWunsch, setMatWunsch] = useState(() => !!ladeMaterialwuensche()[kb.id]);
  const [hinweisOffen, setHinweisOffen] = useState(false);

  // Screenshot-Ziel fürs Stift-Werkzeug: die Material-Fläche in der Mitte.
  const mitteRef = useRef(null);

  const materialien = lw
    ? [
        ...(lw.fach.materialien || []).filter((m) => m.thema === thema.label),
        ...eigeneFuerThema(lw.fachId, thema.label),
      ]
    : [];
  const genKey = generatorFuerKb(kb.id);
  const aufgabenMats = materialien.filter(istAufgabeMaterial);

  const [aktivesMaterial, setAktivesMaterial] = useState(
    () => aufgabenMats[0] || (genKey ? QUIZ : materialien[0]) || null
  );

  // Lernzeit im Fokus messen: beim Schliessen die verstrichene Zeit aufs Ziel
  // buchen (speist die realistische Zeitschätzung).
  useEffect(() => {
    const start = Date.now();
    return () => addSekunden(kb.id, (Date.now() - start) / 1000);
  }, [kb.id]);

  // Lokale Modelle einmal proben (mit aktiv-Guard gegen späte Antworten).
  useEffect(() => {
    let aktiv = true;
    pruefeKi().then((m) => {
      if (aktiv) setKiModell(m);
    });
    pruefeVision().then((m) => {
      if (aktiv) setVisionModell(m);
    });
    return () => {
      aktiv = false;
    };
  }, []);

  // Esc schließt verschachtelt: ein offenes Vollbild-Werkzeug kümmert sich
  // selbst, sonst erst das Panel, sonst der Fokus.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (markierenOffen || aufschriebOffen || rechenwegOffen || uploadOffen)
        return;
      if (werkzeug) setWerkzeug(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [markierenOffen, aufschriebOffen, rechenwegOffen, uploadOffen, werkzeug, onClose]);

  const fertig = (i) => (stand[i] != null ? stand[i] : !!schritte[i]?.fertig);
  const aktuell = schritte.findIndex((_, i) => !fertig(i));
  const alleFertig = schritte.length === 0 || aktuell === -1;
  const fertigeAnzahl = schritte.filter((_, i) => fertig(i)).length;
  const proz = schritte.length
    ? Math.round((fertigeAnzahl / schritte.length) * 100)
    : 100;

  // Coach-Kontext: Schritt + Zeit. Der KI-Coach kennt beides, spiegelt aber nur
  // ruhig (nichts wird an die Lehrkraft gemeldet, keine fertige Lösung).
  const aktSchrittText = !alleFertig ? schritte[aktuell]?.text : null;
  const kontextName =
    kb.fach +
    ": " +
    kb.titel +
    (aktSchrittText ? ` · Schritt ${aktuell + 1} von ${schritte.length}` : "");
  const zi = zeitInfo(kb);
  const gelerntMin = Math.round((zi.gelerntSek || 0) / 60);
  const zeitText = [
    gelerntMin >= 1
      ? `An diesem Ziel wurde bisher etwa ${gelerntMin} ${
          gelerntMin === 1 ? "Minute" : "Minuten"
        } gelernt.`
      : null,
    zi.realistischMin
      ? `Realistisch dauert dieses Ziel für diese Person etwa ${formatMin(
          zi.realistischMin
        )}.`
      : zi.geplantMin
        ? `Eingeplant sind ungefähr ${formatMin(zi.geplantMin)}.`
        : null,
  ]
    .filter(Boolean)
    .join(" ");
  // Konkreter Inhalt der gerade offenen Aufgabe, damit der Coach nicht nur den
  // Titel kennt (z.B. die Vokabel mit Bedeutung), sondern wirklich helfen kann.
  const aufgabenInhalt =
    aktivesMaterial?.id === "__quiz__"
      ? "Eine generierte Übung (Quiz) zum aktuellen Schritt."
      : materialKontext(aktivesMaterial);
  const coachSystem = systemPromptCoach({
    kontextName,
    materialien,
    schritt: aktSchrittText,
    zeit: zeitText || null,
    inhalt: aufgabenInhalt,
  });

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
    setWerkzeug("chat");
    setChatTab("lerncoach");
    setEntwurf(frage);
  }
  function hilfeSenden() {
    setzeHilferuf(kb.id, true);
    setzeFrage(kb.id, entwurf);
    setFrage(entwurf.trim());
    setHilfe(true);
  }
  function hilfeZuruecknehmen() {
    setzeHilferuf(kb.id, false);
    setHilfe(false);
  }

  function notizHinzufuegen() {
    const t = notizEntwurf.trim();
    if (!t) return;
    const kontext =
      kb.titel + (aktuell >= 0 ? " · Schritt " + (aktuell + 1) : "");
    addNotiz(t, kontext);
    setNotizEntwurf("");
    setNotizen(ladeNotizen());
  }
  function notizEntfernen(i) {
    entferneNotiz(i);
    setNotizen(ladeNotizen());
  }

  // Werkzeug umschalten (Toggle).
  function toggleWerkzeug(w) {
    setWerkzeug((cur) => (cur === w ? null : w));
  }
  // Vollbild-Werkzeug öffnen: erst das Panel schließen, damit der Screenshot die
  // Material-Fläche trifft und die Ansicht ruhig ist.
  function oeffneMarkieren() {
    setWerkzeug(null);
    setMarkierenOffen(true);
  }
  function oeffneAufschrieb() {
    setWerkzeug(null);
    setAufschriebOffen(true);
  }

  // Rechte-Leiste-Zeilen: Materialien (gefiltert über Chip + Suche).
  let railRows = materialien.map((m) => ({
    m,
    chip: chipFuerMaterial(m),
    Icon: iconFuerMaterial(m),
  }));
  if (chip !== "alle") railRows = railRows.filter((r) => r.chip === chip);
  const q = suche.trim().toLowerCase();
  if (q) railRows = railRows.filter((r) => r.m.titel.toLowerCase().includes(q));

  const aktivId = aktivesMaterial?.id || null;

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
          <span className="fokus-kb-eyebrow">Lernweg</span>
          {kb.fach}: {kb.titel}
        </span>
        <span className="fokus-zaehler">
          {alleFertig ? schritte.length : aktuell + 1} / {schritte.length}
        </span>
        {!alleFertig && (
          <button
            type="button"
            className={"fokus-kopf-hilfe" + (hilfe ? " aktiv" : "")}
            onClick={hilfeOeffnen}
            title={`Frage an ${COACH}`}
          >
            {hilfe ? `${COACH} ist informiert ✓` : `Frag ${COACH}`}
          </button>
        )}
        {naechste && !alleFertig && (
          <button
            type="button"
            className="fokus-wechsel"
            onClick={() => onWeiter(naechste.id)}
            title={`Weiter mit ${naechste.fach}: ${naechste.titel}`}
          >
            Aufgabe wechseln
          </button>
        )}
      </header>
      <div className="fokus-balken" aria-hidden="true">
        <div className="fokus-balken-fuell" style={{ width: proz + "%" }} />
      </div>

      {alleFertig ? (
        <div className="fokus-abschluss">
          {abgeschlossen ? (
            <main className="fokus-abschluss-karte">
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
            <main className="fokus-abschluss-karte">
              <p className="fokus-eyebrow">Geschafft ✓</p>
              <h1 className="fokus-titel">{kb.titel}</h1>
              <p className="fokus-info">
                {schritte.length > 0 ? "Alle Schritte erledigt. " : ""}
                Wenn du dich sicher fühlst, melde den Könnensbeweis bei {COACH}{" "}
                zur Abnahme an. Sonst hakst du ihn nur für heute ab.
              </p>
              {hilfe && (
                <p className="fokus-hilfe-laeuft" role="status">
                  Dein Hilferuf an {COACH} läuft noch. {COACH} kümmert sich
                  später darum, du kannst ruhig weitermachen.
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
              <button type="button" className="fokus-textlink" onClick={onClose}>
                Erst mal schließen
              </button>
            </main>
          )}
        </div>
      ) : (
        <div className="fokus-koerper">
          {/* Linke Werkzeug-Toolbar */}
          <nav className="fokus-werkzeuge" aria-label="Werkzeuge">
            <button
              type="button"
              className={"fokus-wz" + (werkzeug === "chat" ? " aktiv" : "")}
              onClick={() => toggleWerkzeug("chat")}
              aria-pressed={werkzeug === "chat"}
              aria-label="Chat mit Coach"
              title="Chat: KI-Coach und Lerncoach"
            >
              <IcChat aria-hidden="true" />
            </button>
            <button
              type="button"
              className={"fokus-wz" + (werkzeug === "notizen" ? " aktiv" : "")}
              onClick={() => toggleWerkzeug("notizen")}
              aria-pressed={werkzeug === "notizen"}
              aria-label="Notizen"
              title="Notizen"
            >
              <IcNotizen aria-hidden="true" />
              {notizen.length > 0 && (
                <span className="fokus-wz-zahl">{notizen.length}</span>
              )}
            </button>
            <button
              type="button"
              className={"fokus-wz" + (werkzeug === "live" ? " aktiv" : "")}
              onClick={() => toggleWerkzeug("live")}
              aria-pressed={werkzeug === "live"}
              aria-label="Live-Coach"
              title="Live-Coach: schaut beim Arbeiten mit"
            >
              <IcLive aria-hidden="true" />
            </button>
            <button
              type="button"
              className="fokus-wz"
              onClick={oeffneMarkieren}
              aria-label="Markieren und fragen"
              title="Stift: markieren und den KI-Coach fragen"
            >
              <IcStift aria-hidden="true" />
            </button>
            <span className="fokus-wz-spacer" aria-hidden="true" />
            <button
              type="button"
              className="fokus-wz"
              onClick={oeffneAufschrieb}
              aria-label="Aufschrieb digitalisieren"
              title="Kamera: deinen Aufschrieb digitalisieren"
            >
              <IcKamera aria-hidden="true" />
            </button>
          </nav>

          {/* Mitte: aktives Material + schmale Schritt-Steuerung */}
          <main className="fokus-mitte">
            <div className="fokus-mitte-inhalt" ref={mitteRef}>
              {aktivId === "__quiz__" && genKey ? (
                <div className="fokus-material">
                  <div className="fokus-material-kopf">
                    <span className="fokus-mat-art">Übung</span>
                    <span className="fokus-material-titel">Dazu üben</span>
                    <span className="fokus-material-aktiv">Quiz</span>
                  </div>
                  <div className="fokus-material-inhalt">
                    <Quiz generatorKey={genKey} />
                  </div>
                </div>
              ) : aktivesMaterial ? (
                <div className="fokus-material">
                  <div className="fokus-material-kopf">
                    <span className="fokus-mat-art">
                      {ART_LABEL[aktivesMaterial.art] ||
                        aktivitaetLabel(aktivesMaterial) ||
                        "Material"}
                    </span>
                    <span className="fokus-material-titel">
                      {aktivesMaterial.titel}
                    </span>
                    {aktivitaetLabel(aktivesMaterial) && (
                      <span className="fokus-material-aktiv">
                        {aktivitaetLabel(aktivesMaterial)}
                      </span>
                    )}
                  </div>
                  <div className="fokus-material-inhalt">
                    <MaterialInhalt material={aktivesMaterial} />
                  </div>
                </div>
              ) : (
                <div className="fokus-mitte-leer">
                  <p className="fokus-eyebrow">
                    Schritt {aktuell + 1} von {schritte.length}
                  </p>
                  <h1 className="fokus-mitte-leer-titel">
                    {schritte[aktuell]?.text}
                  </h1>
                  <p className="fokus-info">
                    Wähle rechts ein Material, um hier damit zu arbeiten.
                  </p>
                </div>
              )}
            </div>

            <div className="fokus-schrittleiste">
              <div className="fokus-sl-info">
                <span className="fokus-sl-nr">
                  Schritt {aktuell + 1} / {schritte.length}
                </span>
                <span className="fokus-sl-text" title={schritte[aktuell]?.text}>
                  {schritte[aktuell]?.text}
                </span>
              </div>
              <div
                className="fokus-sl-gefuehl"
                role="group"
                aria-label="Wie läuft dieser Schritt?"
              >
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
                    title={GEFUEHL_LABEL[g]}
                  >
                    {GEFUEHL_LABEL[g]}
                  </button>
                ))}
              </div>
              <div className="fokus-sl-nav">
                {istMathe && (
                  <button
                    type="button"
                    className="fokus-sl-rechenweg"
                    onClick={() => setRechenwegOffen(true)}
                    title="Rechenweg mit Coach"
                  >
                    ✎ Rechenweg
                    {hatRechenweg(kb.id, "rechenweg") && (
                      <span className="fokus-sl-badge">✓</span>
                    )}
                  </button>
                )}
                {aktuell > 0 && (
                  <button
                    type="button"
                    className="fokus-sl-zurueck"
                    onClick={zurueck}
                  >
                    ← zurück
                  </button>
                )}
                <button
                  type="button"
                  className="fokus-sl-weiter"
                  onClick={weiter}
                >
                  Geschafft, weiter →
                </button>
              </div>
            </div>

            {/* Panel-Werkzeug: links angedockt über der Mitte */}
            {werkzeug === "chat" && (
              <aside className="fokus-panel" aria-label="Chat">
                <header className="fokus-panel-kopf">
                  <div className="fokus-panel-tabs" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={chatTab === "coach"}
                      className={
                        "fokus-panel-tab" + (chatTab === "coach" ? " an" : "")
                      }
                      onClick={() => setChatTab("coach")}
                    >
                      KI-Coach
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={chatTab === "lerncoach"}
                      className={
                        "fokus-panel-tab" +
                        (chatTab === "lerncoach" ? " an" : "")
                      }
                      onClick={() => setChatTab("lerncoach")}
                    >
                      Lerncoach ({COACH})
                    </button>
                  </div>
                  <button
                    type="button"
                    className="fokus-panel-zu"
                    onClick={() => setWerkzeug(null)}
                    aria-label="Chat schließen"
                  >
                    ✕
                  </button>
                </header>

                {chatTab === "coach" ? (
                  <div className="fokus-panel-mc">
                    <MaterialChat
                      kontextName={kontextName}
                      materialien={materialien}
                      kiModell={kiModell}
                      visionModell={visionModell}
                      systemText={coachSystem}
                      onHeften={({ titel, inhalt }) => {
                        speichereEigenes({
                          titel,
                          inhalt,
                          fachId: lw?.fachId,
                          thema: thema?.label || null,
                          art: "lernzettel",
                          bereich: "selbstlernen",
                        });
                        setEigeneStand((n) => n + 1);
                      }}
                    />
                  </div>
                ) : (
                  <div className="fokus-panel-lerncoach">
                    <p className="fokus-lc-info">
                      Hier erreichst du {COACH} (ein Mensch, kein Automat).
                      Schreib kurz, woran es hängt: deine Frage wartet bis zum
                      Tutorentermin, du musst dich nicht melden.
                    </p>
                    {hilfe ? (
                      <div className="fokus-lc-status">
                        <p className="fokus-hilfe-info">
                          <span
                            className="fokus-hilfe-haken"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                          {COACH} ist informiert.
                        </p>
                        {frage && (
                          <p className="fokus-hilfe-frage">„{frage}"</p>
                        )}
                        <button
                          type="button"
                          className="fokus-textlink"
                          onClick={hilfeZuruecknehmen}
                        >
                          Hilferuf zurücknehmen
                        </button>
                      </div>
                    ) : (
                      <>
                        <textarea
                          className="fokus-lc-feld"
                          rows={4}
                          value={entwurf}
                          onChange={(e) => setEntwurf(e.target.value)}
                          placeholder="Zum Beispiel: Ich verstehe diesen Schritt nicht."
                        />
                        <button
                          type="button"
                          className="fokus-lc-senden"
                          onClick={hilfeSenden}
                          disabled={!entwurf.trim()}
                        >
                          An {COACH} senden
                        </button>
                      </>
                    )}
                  </div>
                )}
              </aside>
            )}

            {werkzeug === "notizen" && (
              <aside className="fokus-panel" aria-label="Notizen">
                <header className="fokus-panel-kopf">
                  <span className="fokus-panel-titel">Notizen</span>
                  <button
                    type="button"
                    className="fokus-panel-zu"
                    onClick={() => setWerkzeug(null)}
                    aria-label="Notizen schließen"
                  >
                    ✕
                  </button>
                </header>
                <p className="fokus-lc-info">
                  Park einen Gedanken kurz hier, ohne den Fokus zu verlieren. Du
                  findest ihn später auf der Übersicht wieder.
                </p>
                <div className="fokus-notiz-neu">
                  <input
                    type="text"
                    value={notizEntwurf}
                    onChange={(e) => setNotizEntwurf(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") notizHinzufuegen();
                    }}
                    placeholder="Was dir gerade durch den Kopf geht …"
                    aria-label="Neue Notiz"
                  />
                  <button
                    type="button"
                    className="fokus-notiz-add"
                    onClick={notizHinzufuegen}
                    disabled={!notizEntwurf.trim()}
                  >
                    Parken
                  </button>
                </div>
                {notizen.length === 0 ? (
                  <p className="fokus-notiz-leer">Noch nichts geparkt.</p>
                ) : (
                  <ul className="fokus-notiz-liste">
                    {notizen.map((n, i) => (
                      <li key={i} className="fokus-notiz">
                        <div className="fokus-notiz-text">
                          {n.text}
                          {n.kontext && (
                            <span className="fokus-notiz-kontext">
                              {n.kontext}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="fokus-notiz-weg"
                          onClick={() => notizEntfernen(i)}
                          aria-label="Notiz entfernen"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            )}

            {werkzeug === "live" && (
              <LiveCoach
                kontextName={kontextName}
                materialien={materialien}
                schritt={aktSchrittText}
                inhalt={aufgabenInhalt}
                istMathe={istMathe}
                visionModell={visionModell}
                mitteRef={mitteRef}
                onClose={() => setWerkzeug(null)}
              />
            )}
          </main>

          {/* Rechte Leiste: passende Materialien */}
          <aside className="fokus-rail" aria-label="Passende Materialien">
            <div className="fokus-rail-kopf">
              <span className="fokus-rail-fach">{kb.fach}</span>
              <h2 className="fokus-rail-titel">Passende Materialien</h2>
            </div>

            {materialien.length === 0 ? (
              <div className="fokus-rail-leer">
                <p className="fokus-mat-leer">
                  Zu diesem Schritt gibt es noch kein eigenes Material.
                </p>
                {matWunsch ? (
                  <p className="fokus-luecke-gesendet" role="status">
                    <span className="fokus-hilfe-haken" aria-hidden="true">
                      ✓
                    </span>
                    Material bei {COACH} angefragt.
                    <button
                      type="button"
                      className="fokus-textlink"
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
                <button
                  type="button"
                  className="fokus-mat-add"
                  onClick={() => setUploadOffen(true)}
                >
                  + anhängen
                </button>
              </div>
            ) : (
              <>
                <div
                  className="fokus-rail-chips"
                  role="tablist"
                  aria-label="Material-Typ"
                >
                  {CHIPS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      role="tab"
                      aria-selected={chip === c.key}
                      className={"fokus-chip" + (chip === c.key ? " an" : "")}
                      onClick={() => setChip(c.key)}
                    >
                      {c.Icon && <c.Icon className="fokus-chip-icon" />}
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="fokus-rail-suche">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={suche}
                    onChange={(e) => setSuche(e.target.value)}
                    placeholder="Suche"
                    aria-label="Materialien durchsuchen"
                  />
                </div>

                <ul className="fokus-rail-liste">
                  {genKey && (chip === "alle" || chip === "aufgaben") && (
                    <li>
                      <button
                        type="button"
                        className={
                          "fokus-rail-mat fokus-rail-klick" +
                          (aktivId === "__quiz__" ? " aktiv" : "")
                        }
                        onClick={() => setAktivesMaterial(QUIZ)}
                      >
                        <span className="fokus-rail-icon" aria-hidden="true">
                          ▸
                        </span>
                        <span className="fokus-rail-mat-titel">Dazu üben</span>
                        <span className="fokus-rail-mat-typ">Quiz</span>
                      </button>
                    </li>
                  )}
                  {railRows.map(({ m, Icon }) => {
                    const offenbar = istOeffenbar(m);
                    const inhalt = (
                      <>
                        <span className="fokus-rail-icon" aria-hidden="true">
                          <Icon />
                        </span>
                        <span className="fokus-rail-mat-titel">{m.titel}</span>
                        <span className="fokus-rail-mat-typ">
                          {aktivitaetLabel(m) || ART_LABEL[m.art] || m.art}
                        </span>
                      </>
                    );
                    return (
                      <li key={m.id}>
                        {offenbar ? (
                          <button
                            type="button"
                            className={
                              "fokus-rail-mat fokus-rail-klick" +
                              (aktivId === m.id ? " aktiv" : "")
                            }
                            onClick={() => setAktivesMaterial(m)}
                          >
                            {inhalt}
                          </button>
                        ) : (
                          <div className="fokus-rail-mat">{inhalt}</div>
                        )}
                      </li>
                    );
                  })}
                  {railRows.length === 0 && (
                    <li className="fokus-rail-nichts">Nichts gefunden.</li>
                  )}
                </ul>

                <button
                  type="button"
                  className="fokus-mat-add fokus-rail-add"
                  onClick={() => setUploadOffen(true)}
                >
                  + anhängen
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      {markierenOffen && (
        <MarkierenFrage
          kontextName={kontextName}
          zielRef={mitteRef}
          visionModell={visionModell}
          systemText={coachSystem}
          onClose={() => setMarkierenOffen(false)}
        />
      )}
      {aufschriebOffen && (
        <Aufschrieb
          kb={kb}
          schritt={aktuell}
          aufgabe={schritte[aktuell]?.text}
          onClose={() => setAufschriebOffen(false)}
          onGespeichert={(text) => {
            const schrittText = schritte[aktuell]?.text;
            speichereEigenes({
              titel: schrittText
                ? "Aufschrieb: " + schrittText
                : "Mein Aufschrieb",
              fachId: lw?.fachId,
              thema: thema?.label || null,
              art: "aufschrieb",
              inhalt: text,
              bereich: "selbstlernen",
              schritt: aktuell,
            });
            setEigeneStand((n) => n + 1);
            setAufschriebOffen(false);
          }}
        />
      )}
      {rechenwegOffen && (
        <Rechenweg
          kb={kb}
          aufgabe={schritte[aktuell]?.text}
          onClose={() => setRechenwegOffen(false)}
        />
      )}
      {uploadOffen && (
        <MaterialUpload
          startFachId={lw?.fachId}
          startThema={thema?.label || ""}
          onSpeichern={(m) => {
            speichereEigenes(m);
            setEigeneStand((n) => n + 1);
            setUploadOffen(false);
          }}
          onClose={() => setUploadOffen(false)}
        />
      )}
    </div>
  );
}
