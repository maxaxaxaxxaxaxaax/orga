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

// Zeit als m:ss, exakt (nicht auf Minuten gerundet). Geteilt von der laufenden
// Lernzeit und der genauen Anzeige im Abschluss.
function mmss(sek) {
  const ganz = Math.max(0, Math.round(sek));
  const m = Math.floor(ganz / 60);
  const s = ganz % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Live-Lernzeit: zeigt, wie lange man in dieser Sitzung schon an dem Ziel
// arbeitet (m:ss). Eigene Komponente, damit nur sie im Sekundentakt rendert,
// nicht der ganze Fokus. Spiegelt die eigene Zeit, misst sie nicht zur Kontrolle.
function Lernzeit() {
  const [sek, setSek] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setSek(Math.round((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="fokus-lernzeit" title="So lange arbeitest du in dieser Sitzung schon an diesem Ziel">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 2.5h6" />
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9.5V13l2.4 1.6" />
      </svg>
      {mmss(sek)}
    </span>
  );
}

// ---- Werkzeug-Icons (Toolbar) -------------------------------------------
function IcOrdner(p) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
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
  // Nach jedem Schritt eine kurze Selbsteinschätzung, bevor es weitergeht.
  const [reflektiereSchritt, setReflektiereSchritt] = useState(null);
  // Abschluss: die genau gemessene Lernzeit dieser Sitzung in Sekunden (einmal
  // beim Erreichen des Abschlusses erfasst, nicht auf Minuten gerundet).
  const [gemessenSek, setGemessenSek] = useState(null);

  // Linkes Panel: über die Werkzeug-Leiste geöffnet. "materialien" | "notizen" |
  // "live" | null (zu). Erneuter Klick auf dasselbe Icon schließt. Start: Materialien.
  const [werkzeug, setWerkzeug] = useState("materialien");
  const [chatTab, setChatTab] = useState("coach"); // "coach" | "lerncoach"
  const [chatsOffen, setChatsOffen] = useState(true); // rechtes Chats-Panel auf/zu

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
  // Lernzeit dieser Sitzung (zum Anzeigen und Bestätigen am Ende). Start wird im
  // Effekt gesetzt (Date.now() gehört nicht in den Render).
  const startRef = useRef(0);
  const gebuchtRef = useRef(false);

  const materialien = lw
    ? [
        ...(lw.fach.materialien || []).filter((m) => m.thema === thema.label),
        ...eigeneFuerThema(lw.fachId, thema.label),
      ]
    : [];
  const genKey = generatorFuerKb(kb.id);
  const aufgabenMats = materialien.filter(istAufgabeMaterial);

  // Material in der Mitte: standardmäßig das des aktuellen Schritts. Eine manuell
  // (rechts) gewählte Karte überschreibt das, bis der Schritt wechselt.
  const [manuellesMaterial, setManuellesMaterial] = useState(null);
  const [manuellFuerSchritt, setManuellFuerSchritt] = useState(-1);
  // Welche Übungen hat der Schüler in dieser Sitzung ganz durchgearbeitet?
  // Erst dann lässt sich der Schritt abschließen (durch das Material arbeiten).
  const [fertigeMaterialien, setFertigeMaterialien] = useState(() => new Set());
  function markiereMaterialFertig(id) {
    if (!id) return;
    setFertigeMaterialien((prev) =>
      prev.has(id) ? prev : new Set(prev).add(id)
    );
  }

  // Lernzeit im Fokus messen: beim Schliessen die verstrichene Zeit aufs Ziel
  // buchen (speist die realistische Zeitschätzung).
  // Lernzeit buchen: am Ende bestätigt der Schüler die Zeit (bucheZeit). Schliesst
  // er vorher, wird die gemessene Zeit beim Schliessen gebucht. gebuchtRef
  // verhindert doppeltes Buchen.
  function bucheZeit(sekunden) {
    if (gebuchtRef.current) return;
    gebuchtRef.current = true;
    addSekunden(kb.id, sekunden);
  }
  useEffect(() => {
    const start = Date.now();
    startRef.current = start;
    return () => {
      if (!gebuchtRef.current) addSekunden(kb.id, (Date.now() - start) / 1000);
    };
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

  // Material des aktuellen Schritts. Jeder Schritt hat sein eigenes (verstehen →
  // üben → anwenden). Ohne material-Feld greift unten der alte Fallback.
  const aktSchritt = aktuell >= 0 ? schritte[aktuell] : null;
  const aktSchrittMatId = aktSchritt?.material || null;
  const aktSchrittMaterial =
    aktSchrittMatId === "__quiz__"
      ? QUIZ
      : aktSchrittMatId
        ? materialien.find((m) => m.id === aktSchrittMatId) || null
        : null;
  // Abgeleitet: das Schritt-Material, außer es wurde für genau diesen Schritt
  // manuell etwas anderes gewählt. So zeigt die Mitte automatisch, was der
  // Schritt verlangt, ohne Effekt. Fallback (altes Modell): erste Übung.
  const fallbackMaterial =
    aufgabenMats[0] || (genKey ? QUIZ : materialien[0]) || null;
  const aktivesMaterial =
    manuellesMaterial && manuellFuerSchritt === aktuell
      ? manuellesMaterial
      : aktSchrittMaterial || fallbackMaterial;
  function setAktivesMaterial(m) {
    setManuellesMaterial(m);
    setManuellFuerSchritt(aktuell);
  }

  // Beim Erreichen des Abschlusses die genaue Lernzeit einmal festhalten
  // (Sekunden, ungerundet), damit der Abschluss sie exakt anzeigen kann.
  useEffect(() => {
    if (alleFertig && gemessenSek === null) {
      setGemessenSek(Math.round((Date.now() - startRef.current) / 1000));
    }
    // nur einmal beim Erreichen des Abschlusses
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alleFertig]);

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

  // Schritt abschliessen: erst die kurze Selbsteinschätzung zeigen, dann erst
  // abhaken und weitergehen (ein klares, einziges Weiter).
  function schrittGeschafft() {
    if (aktuell < 0) return;
    setReflektiereSchritt(aktuell);
  }
  function bestaetigeSchritt(wert) {
    const i = reflektiereSchritt;
    if (i == null) return;
    if (wert) {
      setzeGefuehl(kb.id, i, wert);
      setGefuehl((g) => ({ ...g, [i]: wert }));
    }
    const next = { ...stand, [i]: true };
    setStand(next);
    speichereSchritte(kb.id, next);
    setReflektiereSchritt(null);
  }
  function zurueck() {
    const i = (aktuell === -1 ? schritte.length : aktuell) - 1;
    if (i < 0) return;
    const next = { ...stand, [i]: false };
    setStand(next);
    speichereSchritte(kb.id, next);
  }

  function hilfeOeffnen() {
    // Chat ist jetzt dauerhaft rechts: nur auf den Tutor-Tab (Mensch) wechseln.
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

  // "Zum Thema": die Übungen/Aufgaben des Schritts (das, was man jetzt tut).
  const zumThemaRows = aufgabenMats.map((m) => ({
    m,
    Icon: iconFuerMaterial(m),
  }));
  // Eine Material-Zeile (geteilt von "Zum Thema" und "Alle").
  const matZeile = ({ m, Icon }) => {
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
        {istOeffenbar(m) ? (
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
  };

  // "Schritt geschafft" erst, wenn die Übung(en) des Schritts durchgearbeitet
  // sind. Hat der Schritt keine interaktive Übung (nur Lese-Material), geht es
  // direkt. Sonst muss mindestens eine Übung abgeschlossen sein.
  // Gate pro Schritt: Hat der Schritt eine Übung als Material, muss genau die
  // durchgearbeitet sein. Lese-Material (Lernzettel/Text) lässt direkt weiter.
  // Ohne material-Feld (altes Modell) zählt wie früher jede Übung des Lernwegs.
  const gatebareIds = aktSchritt?.material
    ? aktSchrittMaterial &&
      (aktSchrittMatId === "__quiz__" || istAufgabeMaterial(aktSchrittMaterial))
      ? [aktSchrittMatId]
      : []
    : [...aufgabenMats.map((m) => m.id), ...(genKey ? ["__quiz__"] : [])];
  const kannWeiter =
    gatebareIds.length === 0 ||
    gatebareIds.some((id) => fertigeMaterialien.has(id));

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
        <Lernzeit />
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
              <div className="fokus-zeit">
                <span className="fokus-zeit-label">So lange hast du gebraucht</span>
                <span className="fokus-zeit-gross">
                  {gemessenSek != null ? mmss(gemessenSek) : "0:00"}
                </span>
                <p className="fokus-zeit-hint">
                  Genau gemessen in dieser Sitzung (Minuten:Sekunden). Die Zeit
                  bleibt auf diesem Gerät und hilft nur dir bei der Einschätzung.
                </p>
              </div>
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
                    bucheZeit(gemessenSek ?? 0);
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
                    bucheZeit(gemessenSek ?? 0);
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
              className={"fokus-wz" + (werkzeug === "materialien" ? " aktiv" : "")}
              onClick={() => toggleWerkzeug("materialien")}
              aria-pressed={werkzeug === "materialien"}
              aria-label="Materialien"
              title="Passende Materialien"
            >
              <IcOrdner aria-hidden="true" />
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
                    <Quiz
                      generatorKey={genKey}
                      onAbgeschlossen={() => markiereMaterialFertig("__quiz__")}
                    />
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
                    <MaterialInhalt
                      material={aktivesMaterial}
                      onAbgeschlossen={() => markiereMaterialFertig(aktivId)}
                    />
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
              {reflektiereSchritt != null ? (
                <div className="fokus-sl-reflexion">
                  <span className="fokus-sl-reflexion-frage">
                    Wie lief dieser Schritt?
                  </span>
                  <div
                    className="fokus-sl-gefuehl"
                    role="group"
                    aria-label="Wie lief dieser Schritt?"
                  >
                    {GEFUEHLE.map((g) => (
                      <button
                        key={g}
                        type="button"
                        className={
                          "fokus-gefuehl-knopf" +
                          (gefuehl[reflektiereSchritt] === g ? " gewaehlt" : "")
                        }
                        data-g={g}
                        onClick={() => bestaetigeSchritt(g)}
                        title={GEFUEHL_LABEL[g]}
                      >
                        {GEFUEHL_LABEL[g]}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="fokus-sl-skip"
                    onClick={() => bestaetigeSchritt(null)}
                  >
                    ohne Angabe weiter →
                  </button>
                </div>
              ) : (
                <>
                  <div className="fokus-sl-info">
                    <span className="fokus-sl-kopf">
                      <span className="fokus-sl-fach">{kb.fach}</span>
                      <span className="fokus-sl-text">
                        {schritte[aktuell]?.text}
                      </span>
                    </span>
                    {!kannWeiter && (
                      <span className="fokus-sl-hinweis">
                        Arbeite die Übung erst ganz durch, dann geht es weiter.
                      </span>
                    )}
                  </div>
                  <span className="fokus-sl-segmente" aria-hidden="true">
                    {schritte.map((st, i) => (
                      <span
                        key={i}
                        className={
                          "fokus-sl-seg" +
                          (i < aktuell ? " fertig" : "") +
                          (i === aktuell ? " aktuell" : "")
                        }
                      />
                    ))}
                  </span>
                  <span className="fokus-sl-zahl">
                    {aktuell}/{schritte.length}
                  </span>
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
                      onClick={schrittGeschafft}
                      disabled={!kannWeiter}
                      title={
                        kannWeiter
                          ? undefined
                          : "Arbeite die Übung erst ganz durch"
                      }
                    >
                      Schritt geschafft →
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Panel-Werkzeug: links angedockt über der Mitte */}


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

          {/* Linkes Panel: über die Werkzeug-Leiste geöffnet (Materialien oder
             Notizen). Geschlossen, wenn werkzeug null/live ist. */}
          {(werkzeug === "materialien" || werkzeug === "notizen") && (
            <aside
              className="fokus-rail"
              aria-label={
                werkzeug === "notizen" ? "Notizen" : "Passende Materialien"
              }
            >
              <div className="fokus-rail-kopf">
                <div className="fokus-rail-kopf-text">
                  <h2 className="fokus-rail-titel">
                    {werkzeug === "notizen" ? "Notizen" : "Passende Materialien"}
                  </h2>
                  {werkzeug === "materialien" && (
                    <span className="fokus-rail-fach">{kb.fach}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="fokus-rail-zu"
                  onClick={() => setWerkzeug(null)}
                  aria-label="Panel schließen"
                >
                  ✕
                </button>
              </div>

              {werkzeug === "notizen" ? (
                <div className="fokus-notiz-panel">
                  <div className="fokus-notiz-neu">
                    <input
                      type="text"
                      value={notizEntwurf}
                      onChange={(e) => setNotizEntwurf(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") notizHinzufuegen();
                      }}
                      placeholder="Mache dir Notizen …"
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
                </div>
              ) : materialien.length === 0 ? (
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
                {(genKey || zumThemaRows.length > 0) && (
                  <>
                    <p className="fokus-rail-sektion">Zum Thema</p>
                    <ul className="fokus-rail-liste fokus-rail-liste-thema">
                      {genKey && (
                        <li>
                          <button
                            type="button"
                            className={
                              "fokus-rail-mat fokus-rail-klick" +
                              (aktivId === "__quiz__" ? " aktiv" : "")
                            }
                            onClick={() => setAktivesMaterial(QUIZ)}
                          >
                            <span
                              className="fokus-rail-icon"
                              aria-hidden="true"
                            >
                              ▸
                            </span>
                            <span className="fokus-rail-mat-titel">
                              Dazu üben
                            </span>
                            <span className="fokus-rail-mat-typ">Quiz</span>
                          </button>
                        </li>
                      )}
                      {zumThemaRows.map(matZeile)}
                    </ul>
                  </>
                )}

                <p className="fokus-rail-sektion">Alle</p>
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

                <ul className="fokus-rail-liste">
                  {railRows.map(matZeile)}
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
          )}

          {/* Rechtes Panel: Chats (dauerhaft). Tab "Lerncoach" = lokale KI,
             "Tutor" = Mensch (Fr. Berg) für Hilferufe. */}
          <aside
            className={"fokus-chats" + (chatsOffen ? "" : " zu")}
            aria-label="Chats"
          >
            <header className="fokus-chats-kopf">
              <span className="fokus-chats-titel">Chats</span>
              <button
                type="button"
                className="fokus-chats-toggle"
                onClick={() => setChatsOffen((o) => !o)}
                aria-expanded={chatsOffen}
                aria-label={chatsOffen ? "Chats einklappen" : "Chats ausklappen"}
              >
                {chatsOffen ? "⌄" : "⌃"}
              </button>
            </header>
            {chatsOffen && (
              <>
            <div className="fokus-chats-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={chatTab === "coach"}
                className={"fokus-chats-tab" + (chatTab === "coach" ? " an" : "")}
                onClick={() => setChatTab("coach")}
              >
                Lerncoach
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={chatTab === "lerncoach"}
                className={
                  "fokus-chats-tab" + (chatTab === "lerncoach" ? " an" : "")
                }
                onClick={() => setChatTab("lerncoach")}
              >
                Tutor
              </button>
            </div>
            {chatTab === "coach" ? (
              <>
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
                <p className="fokus-chats-hinweis">
                  Was du hier schreibst, bleibt auf diesem Gerät. Nichts wird ins
                  Internet geladen.
                </p>
              </>
            ) : (
              <div className="fokus-panel-lerncoach">
                <p className="fokus-lc-info">
                  Hier erreichst du {COACH} (ein Mensch, kein Automat). Schreib
                  kurz, woran es hängt: deine Frage wartet bis zum Tutorentermin,
                  du musst dich nicht melden.
                </p>
                {hilfe ? (
                  <div className="fokus-lc-status">
                    <p className="fokus-hilfe-info">
                      <span className="fokus-hilfe-haken" aria-hidden="true">
                        ✓
                      </span>
                      {COACH} ist informiert.
                    </p>
                    {frage && <p className="fokus-hilfe-frage">„{frage}"</p>}
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
