import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { faecher, lernwegFuerKb } from "../data/wissen";
import { lehrkraefte } from "../data/stundenplanWoche";
import { ladeErledigt, fachWochenFortschritt } from "./planung";
import { fachTextFarbe } from "./farbe";
import Etappenring from "./Etappenring";
import { ART_LABEL, plattformLabel } from "./material";
import { ladeEigene, speichereEigenes } from "./eigeneMaterialien";
import { ladeFavoriten, ladeOrte, ortVon, META_EVENT } from "./materialMeta";
import { addMitteilung } from "./benachrichtigungen";
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
import { introNachricht } from "./materialAssistent";
import { streameChatAntwort } from "./chatStream";
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
import Icon from "./Icon";
import MaterialInhalt from "./MaterialInhalt";
import MaterialUpload from "./MaterialUpload";
import MaterialChat from "./MaterialChat";
import Rechenweg from "./Rechenweg";
import Aufschrieb from "./Aufschrieb";
import MarkierenFrage from "./MarkierenFrage";
import LiveCoach from "./LiveCoach";
import { useRasterZiehen } from "./rasterZiehen";
import { RasterGriff, RasterOverlay } from "./raster";
import "./Fokus.css";

// Messbereich für das Fokus-Raster: die 12 fraktionalen Spalten beginnen rechts
// der schmalen Werkzeug-Leiste, daher deren Breite plus ein Gutter abziehen.
function fokusMessbereich(koerper) {
  const tools = koerper.querySelector(".fokus-werkzeuge");
  if (!tools) return null;
  const kr = koerper.getBoundingClientRect();
  const tr = tools.getBoundingClientRect();
  const cs = getComputedStyle(koerper);
  const gap = parseFloat(cs.columnGap) || 18;
  const padR = parseFloat(cs.paddingRight) || 28;
  const left = tr.right + gap;
  return { left, width: kr.right - padR - left };
}

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
      <Icon name="clock" width={13} height={13} />
      {mmss(sek)}
    </span>
  );
}

export default function Fokus({
  kb,
  naechste,
  onFertig,
  onWeiter,
  onPlanung,
  onClose,
  ursprung,
}) {
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

  // FLIP-Übergang (Shared Element): Wird der Fokus aus einer Übersichts-Karte
  // geöffnet, liefert ursprung deren Rechteck. Der Kopf (Fach + Titel) startet an
  // der Karten-Position/-Größe und gleitet an seinen Platz oben, die Karte „wird"
  // der Kopf. Bewegungs-Design nach Emil Kowalski:
  //  - starke Ease-out-Kurve (--ease-out-strong), ein eintretendes Element soll
  //    schnell anlaufen und sanft ankommen (kein Bounce),
  //  - Dauer 340ms (Sheet-Klasse, unter 500ms, wirkt reaktionsschnell),
  //  - Opacity startet bei 0.55, nicht 0 (nichts erscheint aus dem Nichts),
  //  - kurzer Blur überbrückt den Größen-/Text-Mismatch zwischen Karte und Kopf,
  //  - nur transform/opacity/filter (GPU), will-change nur während der Animation.
  const kopfRef = useRef(null);
  useLayoutEffect(() => {
    const el = kopfRef.current;
    if (!el || !ursprung) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const ziel = el.getBoundingClientRect();
    if (!ziel.width || !ziel.height) return undefined;
    const dx = ursprung.left + ursprung.width / 2 - (ziel.left + ziel.width / 2);
    const dy = ursprung.top + ursprung.height / 2 - (ziel.top + ziel.height / 2);
    // Kopf startet etwa in Kartengröße und schrumpft an seinen Platz (Größen-
    // Kontinuität), gedeckelt gegen Textverzerrung; den Rest kaschiert der Blur.
    const skala = Math.min(1.3, Math.max(1, ursprung.width / ziel.width));
    if (!dx && !dy && skala === 1) return undefined;
    el.style.willChange = "transform, opacity, filter";
    el.style.transformOrigin = "center center";
    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${skala})`;
    el.style.opacity = "0.55";
    el.style.filter = "blur(5px)";
    void el.offsetWidth; // Reflow, damit der Startzustand greift, dann animieren
    const raf = requestAnimationFrame(() => {
      el.style.transition =
        "transform var(--dur-overlay) var(--ease-out-strong)," +
        " opacity var(--dur-slow) var(--ease-out)," +
        " filter var(--dur-slow) var(--ease-out)";
      el.style.transform = "translate(0, 0) scale(1)";
      el.style.opacity = "1";
      el.style.filter = "blur(0px)";
    });
    const aufraeumen = () => {
      el.style.transition = "";
      el.style.transform = "";
      el.style.opacity = "";
      el.style.filter = "";
      el.style.transformOrigin = "";
      el.style.willChange = "";
    };
    const t = setTimeout(aufraeumen, 440); // knapp nach --dur-overlay (340ms)
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [ursprung]);

  // Linkes Panel: über die Werkzeug-Leiste geöffnet. "materialien" | "notizen" |
  // "live" | null (zu). Erneuter Klick auf dasselbe Icon schließt. Start: Materialien.
  const [werkzeug, setWerkzeug] = useState("materialien");
  const [chatTab, setChatTab] = useState("coach"); // "coach" | "lerncoach"
  const [chatsOffen, setChatsOffen] = useState(true); // rechtes Chats-Panel auf/zu
  // Prototyp: die zwei Grenzen im Fokus-Raster per Ziehen verschieben. R = rail|
  // mitte, C = mitte|chats, als Bruchteil der 12 Spalten (geteilt mit Übersicht/
  // Ablage, siehe ./rasterZiehen).
  const [rasterR, setRasterR] = useState(3);
  const [rasterC, setRasterC] = useState(9);
  // L = Material|Live-Coach (nur bei offenem Auge sichtbar).
  const [rasterL, setRasterL] = useState(4);
  // Live-Coach läuft weiter, auch wenn sein Fenster zu ist (Start schließt die
  // Box, der Modus bleibt an, bis er im Fenster gestoppt wird).
  const [liveLaeuft, setLiveLaeuft] = useState(false);
  const {
    ref: koerperRef,
    zieht: rasterZieht,
    griff: rasterGriff,
  } = useRasterZiehen(fokusMessbereich);

  // Vollbild-Werkzeuge mit eigenem Overlay.
  // Markieren hat zwei Einstiege: Toolbar-Stift = nur markieren ("stift"),
  // Zauberstab im KI-Chat = markieren und den Coach fragen ("fragen").
  const [markierenModus, setMarkierenModus] = useState(null);
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

  // Favoriten-Sterne und verschobene Ablageorte aus der Ablage (materialMeta.js):
  // Favoriten stehen bei den passenden Materialien ganz oben, in ein anderes
  // Fach verschobene Materialien tauchen hier nicht mehr auf.
  const [favoriten, setFavoriten] = useState(ladeFavoriten);
  const [orte, setOrte] = useState(ladeOrte);
  useEffect(() => {
    const f = () => {
      setFavoriten(ladeFavoriten());
      setOrte(ladeOrte());
    };
    window.addEventListener(META_EVENT, f);
    return () => window.removeEventListener(META_EVENT, f);
  }, []);

  // Effektiver Ablageort zählt: ein verschobenes Material gehört zu dem
  // Fach/Thema aus der Ablage-Korrektur, sonst zu seinem Heimat-Ort.
  const gehoertHierher = (m, heimatFachId) => {
    const o = ortVon(orte, m.id);
    const fachEff = o?.fachId || heimatFachId;
    const themaEff = o ? o.thema : m.thema;
    return fachEff === lw?.fachId && themaEff === thema.label;
  };
  const materialien = lw
    ? [
        ...faecher.flatMap((f) =>
          (f.materialien || []).filter((m) => gehoertHierher(m, f.id))
        ),
        ...ladeEigene().filter((m) => gehoertHierher(m, m.fachId)),
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
      if (markierenModus || aufschriebOffen || rechenwegOffen || uploadOffen)
        return;
      if (werkzeug) setWerkzeug(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [markierenModus, aufschriebOffen, rechenwegOffen, uploadOffen, werkzeug, onClose]);

  const fertig = (i) => (stand[i] != null ? stand[i] : !!schritte[i]?.fertig);
  const aktuell = schritte.findIndex((_, i) => !fertig(i));
  const alleFertig = schritte.length === 0 || aktuell === -1;
  const fertigeAnzahl = schritte.filter((_, i) => fertig(i)).length;
  const proz = schritte.length
    ? Math.round((fertigeAnzahl / schritte.length) * 100)
    : 100;

  // J1: Auf dem Abschluss spiegelt derselbe Wochen-Ring wie auf der Übersicht den
  // Stand (gleiche Bildsprache). Dieser Könnensbeweis zählt erst mit, sobald er
  // bestätigt ist (angemeldet oder für heute abgehakt): dann wächst das Segment
  // seiner Woche ruhig mit. Spiegeln statt Belohnen (VISION).
  let ringFaecher = null;
  if (alleFertig) {
    const erledigtBasis = ladeErledigt();
    ringFaecher = fachWochenFortschritt({
      ...erledigtBasis,
      [kb.id]: abgeschlossen,
    });
  }

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

  // Der Materialien-Chat-Verlauf lebt hier oben (nicht in MaterialChat), damit der
  // Live-Coach seine Beobachtungen direkt in denselben Thread schreiben kann und
  // der Verlauf erhalten bleibt, auch wenn das Chat-Panel gerade zu ist.
  const [chatNachrichten, setChatNachrichten] = useState(() => [
    { von: "ki", ...introNachricht({ kontextName, materialien }) },
  ]);
  // Eine Live-Coach-Beobachtung als Chat-Nachricht anhängen (linke KI-Blase mit
  // Live-Coach-Marke). Wird dem LiveCoach als onMeldung gereicht.
  function coachMeldung(text) {
    setChatNachrichten((n) => [...n, { von: "ki", coach: true, text }]);
  }
  // Markieren-und-fragen (Zauberstab): das markierte Bild + die Frage laufen im
  // Materialien-Chat weiter (nicht auf der Markieren-Seite). Chat aufmachen,
  // Frage samt Bild anhängen, Antwort dort streamen.
  function frageMitBild({ bild, frage }) {
    setChatsOffen(true);
    setChatTab("coach");
    streameChatAntwort({
      setNachrichten: setChatNachrichten,
      frage:
        (frage || "").trim() ||
        "Schau dir die markierte Stelle an und hilf mir hier weiter.",
      bild,
      verlauf: chatNachrichten,
      kontextName,
      materialien,
      modell: visionModell,
      systemText: coachSystem,
      onFehler: (setze) =>
        setze(() => ({
          von: "ki",
          text: "Ich konnte das Bild gerade nicht ansehen. Versuch es gleich noch einmal.",
        })),
    });
  }
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
    aktivId: aktivesMaterial?.id,
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
    // An diese Aufgabe binden: im Fokus nur hier sichtbar, in der Übersicht
    // (die alles zeigt) taucht sie trotzdem auf.
    addNotiz(t, kontext, kb.id);
    setNotizEntwurf("");
    setNotizen(ladeNotizen());
  }
  function notizEntfernen(i) {
    entferneNotiz(i);
    setNotizen(ladeNotizen());
  }
  // Nur die Notizen dieser Aufgabe (Scope = kb.id). Der Originalindex (_i) bleibt
  // erhalten, damit Entfernen die richtige Notiz im Gesamtspeicher trifft.
  const meineNotizen = notizen
    .map((n, i) => ({ ...n, _i: i }))
    .filter((n) => n.kbId === kb.id);

  // Werkzeug umschalten (Toggle).
  function toggleWerkzeug(w) {
    setWerkzeug((cur) => (cur === w ? null : w));
  }
  // Vollbild-Werkzeug öffnen: erst das Panel schließen, damit der Screenshot die
  // Material-Fläche trifft und die Ansicht ruhig ist.
  function oeffneMarkieren(modus) {
    setWerkzeug(null);
    setMarkierenModus(modus);
  }
  function oeffneAufschrieb() {
    setWerkzeug(null);
    setAufschriebOffen(true);
  }

  // Herkunft trennt die beiden Abschnitte: Schulisches (Moodle) steht oben
  // unter "Zum Thema", extern Dazugekommenes (Discord, YouTube, eigene
  // Uploads) unten.
  const istExtern = (m) => plattformLabel(m) !== "Moodle";

  // "Zum Thema" oben: ALLES Schulische zum Thema, der Lernzettel zuerst.
  const zumThemaMats = [
    ...materialien.filter((m) => m.art === "lernzettel" && !istExtern(m)),
    ...materialien.filter((m) => m.art !== "lernzettel" && !istExtern(m)),
  ];

  // Rechte-Leiste-Zeilen darunter: ohne aktiven Filter nur das extern
  // Hinzugefügte (keine Dopplung mit oben); wer sucht oder filtert,
  // durchsucht wieder alle Materialien.
  const q = suche.trim().toLowerCase();
  const filterAktiv = chip !== "alle" || q;
  let railRows = (
    filterAktiv ? materialien : materialien.filter(istExtern)
  ).map((m) => ({
    m,
    chip: chipFuerMaterial(m),
    Icon: iconFuerMaterial(m),
  }));
  if (chip !== "alle") railRows = railRows.filter((r) => r.chip === chip);
  if (q) railRows = railRows.filter((r) => r.m.titel.toLowerCase().includes(q));
  // Favoriten (Stern aus der Ablage) ganz nach oben; danach Schulisches vor
  // Externem (zählt nur, wenn Suche/Filter alles zeigen). sort ist stabil.
  railRows.sort((a, b) => {
    const fav =
      (favoriten[b.m.id] ? 1 : 0) - (favoriten[a.m.id] ? 1 : 0);
    if (fav) return fav;
    return (istExtern(a.m) ? 1 : 0) - (istExtern(b.m) ? 1 : 0);
  });

  const aktivId = aktivesMaterial?.id || null;

  // "Zum Thema": Lernzettel + Übungen/Aufgaben (das, was man jetzt liest und tut).
  const zumThemaRows = zumThemaMats.map((m) => ({
    m,
    Icon: iconFuerMaterial(m),
  }));
  // Eine Material-Zeile (geteilt von "Zum Thema" und "Alle").
  const matZeile = ({ m, Icon: TypIcon }) => {
    const inhalt = (
      <>
        <span className="fokus-rail-icon" aria-hidden="true">
          <TypIcon />
        </span>
        <span className="fokus-rail-mat-titel">{m.titel}</span>
        {favoriten[m.id] && (
          <Icon
            name="stern"
            className="fokus-rail-stern"
            title="Favorit aus der Ablage"
          />
        )}
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
        <span className="fokus-kb" ref={kopfRef}>
          <span
            className="fokus-kb-eyebrow"
            style={{ color: fachTextFarbe(kb.fach) }}
          >
            {kb.fach}
          </span>
          {kb.titel}
        </span>
        <div className="fokus-kopf-rechts">
          <Lernzeit />
          <span className="fokus-zaehler">
            {alleFertig ? schritte.length : aktuell + 1} / {schritte.length}
          </span>
          {!alleFertig && (
            <button
              type="button"
              className="fokus-wechsel"
              onClick={onPlanung}
              title="Zur Planung, um die Aufgaben neu zu ordnen"
            >
              Aufgabe wechseln
            </button>
          )}
        </div>
      </header>
      <div className="fokus-balken" aria-hidden="true">
        <div className="fokus-balken-fuell" style={{ width: proz + "%" }} />
      </div>

      {alleFertig ? (
        <div className="fokus-abschluss">
          <main className="fokus-abschluss-karte">
            {/* Ring + Titel bleiben stabil, damit der Bogen beim Abnehmen sanft
                von N auf N+1 wächst (nur der Inhalt darunter wechselt). */}
            {ringFaecher && ringFaecher.length > 0 && (
              <div className="fokus-abschluss-ring">
                <Etappenring faecher={ringFaecher} animiert />
              </div>
            )}
            <p className="fokus-eyebrow">Geschafft ✓</p>
            <h1 className="fokus-titel">{kb.titel}</h1>
            {abgeschlossen ? (
              <>
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
              </>
            ) : (
              <>
                <p className="fokus-info">
                  {schritte.length > 0 ? "Alle Schritte erledigt. " : ""}
                  Wenn du dich sicher fühlst, melde den Könnensbeweis bei {COACH}{" "}
                  zur Abnahme an. Sonst hakst du ihn nur für heute ab.
                </p>
                <div className="fokus-zeit">
                  <span className="fokus-zeit-label">
                    So lange hast du gebraucht
                  </span>
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
                <button
                  type="button"
                  className="fokus-textlink"
                  onClick={onClose}
                >
                  Erst mal schließen
                </button>
              </>
            )}
          </main>
        </div>
      ) : (
        <div
          ref={koerperRef}
          className={
            "fokus-koerper" +
            (werkzeug === "materialien" || werkzeug === "notizen"
              ? ""
              : " ohne-rail") +
            (chatsOffen ? "" : " chats-zu") +
            (werkzeug === "live" ? " mit-live" : "") +
            (rasterZieht ? " raster-zieht" : "")
          }
          style={{
            "--fok-rm": rasterR + 2,
            "--fok-mc": rasterC + 2,
            "--fok-ml": rasterL + 2,
          }}
        >
          <RasterOverlay von={2} />
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
              <Icon name="folder" width={22} height={22} />
            </button>
            <button
              type="button"
              className={"fokus-wz" + (werkzeug === "notizen" ? " aktiv" : "")}
              onClick={() => toggleWerkzeug("notizen")}
              aria-pressed={werkzeug === "notizen"}
              aria-label="Notizen"
              title="Notizen"
            >
              <Icon name="erinnerung" width={22} height={22} />
              {meineNotizen.length > 0 && (
                <span className="fokus-wz-zahl">{meineNotizen.length}</span>
              )}
            </button>
            <button
              type="button"
              className="fokus-wz"
              onClick={() => oeffneMarkieren("stift")}
              aria-label="Markieren"
              title="Stift: wichtige Stellen im Material markieren"
            >
              <Icon name="marker" width={22} height={22} />
            </button>
            <button
              type="button"
              className="fokus-wz"
              onClick={oeffneAufschrieb}
              aria-label="Aufschrieb digitalisieren"
              title="Kamera: deinen Aufschrieb digitalisieren"
            >
              <Icon name="camera" width={22} height={22} />
            </button>
          </nav>

          {/* Mitte: aktives Material + schmale Schritt-Steuerung. Mit offenem
              Live-Coach (Auge) endet sie an der ziehbaren Grenze --fok-ml, das
              Coach-Fenster drückt sich rechts daneben ins Raster (wie das
              Dokument in der Ablage). */}
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
                  {/* Gleicher Aufbau wie die Planungs-Pille (.ep-bar): links der
                     Zurück-Chevron, dann Hairline, Fach, Hairline, der Schritt-Text
                     (mit Hinweis darunter), Hairline, der Button. */}
                  {aktuell > 0 && (
                    <button
                      type="button"
                      className="fokus-sl-zurueck"
                      onClick={zurueck}
                      aria-label="Ein Schritt zurück"
                      title="Ein Schritt zurück"
                    >
                      <Icon name="chevron-left" width={20} height={20} />
                    </button>
                  )}
                  {aktuell > 0 && (
                    <span className="fokus-sl-trenner" aria-hidden="true" />
                  )}
                  <div className="fokus-sl-info">
                    <span className="fokus-sl-text">
                      {schritte[aktuell]?.text}
                    </span>
                    {!kannWeiter && (
                      <span className="fokus-sl-hinweis">
                        Arbeite die Übung erst ganz durch, dann geht es weiter.
                      </span>
                    )}
                  </div>
                  <span className="fokus-sl-trenner" aria-hidden="true" />
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
                </>
              )}
            </div>

            {/* Grenze Material|Live-Coach ziehen (nur bei offenem Auge). */}
            {werkzeug === "live" && (
              <RasterGriff
                {...rasterGriff("ml", (s) =>
                  setRasterL(
                    Math.max(2, Math.min((chatsOffen ? rasterC : 10) - 2, s))
                  )
                )}
              />
            )}
            {/* Grenze Mitte|Chats ziehen: bei offenem Live-Coach sitzt sie an
               dessen rechter Kante (siehe unten), sonst hier an der Mitte. */}
            {chatsOffen && werkzeug !== "live" && (
              <RasterGriff
                {...rasterGriff("mc", (s) =>
                  setRasterC(Math.max(rasterR + 2, Math.min(10, s)))
                )}
              />
            )}
          </main>

          {/* Live-Coach (Auge): eigene Raster-Spalte rechts neben dem Material,
             direkt an der Chat-Karte, wie das Dokument in der Ablage. Läuft der
             Modus, bleibt der Coach auch bei zuem Fenster unsichtbar gemountet,
             damit der Live-Takt weiterläuft. */}
          {(werkzeug === "live" || liveLaeuft) && (
            <LiveCoach
              kontextName={kontextName}
              materialien={materialien}
              schritt={aktSchrittText}
              inhalt={aufgabenInhalt}
              istMathe={istMathe}
              visionModell={visionModell}
              mitteRef={mitteRef}
              sichtbar={werkzeug === "live"}
              onMeldung={coachMeldung}
              onAktivWechsel={setLiveLaeuft}
              onGestartet={(quelle) => {
                // Kamera: Box bleibt offen, damit man das Kamerabild sieht.
                // Bildschirm: Box zu, man arbeitet in der Mitte weiter.
                if (quelle !== "kamera") setWerkzeug(null);
              }}
              onClose={() => setWerkzeug(null)}
            >
              {chatsOffen && (
                <RasterGriff
                  {...rasterGriff("mc", (s) =>
                    setRasterC(Math.max(rasterL + 2, Math.min(10, s)))
                  )}
                />
              )}
            </LiveCoach>
          )}

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
                  {meineNotizen.length === 0 ? (
                    <p className="fokus-notiz-leer">Noch nichts geparkt.</p>
                  ) : (
                    <ul className="fokus-notiz-liste">
                      {meineNotizen.map((n) => (
                        <li key={n._i} className="fokus-notiz">
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
                            onClick={() => notizEntfernen(n._i)}
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
                  + hinzufügen
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
                              <Icon name="chevron-right" size={18} />
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
                  <Icon name="search" />
                  <input
                    type="text"
                    value={suche}
                    onChange={(e) => setSuche(e.target.value)}
                    placeholder="Suche"
                    aria-label="Materialien durchsuchen"
                  />
                </div>
                {/* Filter, keine echten Tabs: daher group + aria-pressed (einheitlich
                    mit den Filter-Chips in Ablage und Übersicht). */}
                <div
                  className="fokus-rail-chips"
                  role="group"
                  aria-label="Material-Typ"
                >
                  {CHIPS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={chip === c.key}
                      className={"fokus-chip" + (chip === c.key ? " an" : "")}
                      onClick={() =>
                        setChip((v) => (v === c.key ? "alle" : c.key))
                      }
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
                  + hinzufügen
                </button>
              </>
            )}
            {/* Grenze Materialien|Mitte ziehen. */}
            <RasterGriff
              {...rasterGriff("rm", (s) =>
                setRasterR(Math.max(2, Math.min(rasterC - 2, s)))
              )}
            />
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
              <div className="fokus-chats-aktionen">
                <button
                  type="button"
                  className={
                    "fokus-chats-auge" +
                    (werkzeug === "live" || liveLaeuft ? " an" : "")
                  }
                  onClick={() => toggleWerkzeug("live")}
                  aria-pressed={werkzeug === "live"}
                  aria-label={
                    liveLaeuft
                      ? "Live-Coach läuft: Fenster öffnen"
                      : "Live-Coach: schaut beim Arbeiten mit"
                  }
                  title={
                    liveLaeuft
                      ? "Live-Coach läuft: Fenster öffnen"
                      : "Live-Coach: schaut beim Arbeiten mit"
                  }
                >
                  <Icon name="eye" width={22} height={22} />
                </button>
                <button
                  type="button"
                  className="fokus-chats-toggle"
                  onClick={() => setChatsOffen((o) => !o)}
                  aria-expanded={chatsOffen}
                  aria-label={
                    chatsOffen ? "Chats einklappen" : "Chats ausklappen"
                  }
                >
                  {/* Ein Chevron, das per [aria-expanded] animiert dreht (zu = zeigt hoch). */}
                  <Icon name="chevron-down" className="klapp-chevron" size={18} />
                </button>
              </div>
            </header>
            {chatsOffen && (
              <>
            {/* Umschalter ohne echte Tab-Semantik (kein tabpanel/Tastatur-Modell):
                daher group + aria-pressed wie alle Chip-Gruppen. */}
            <div className="fokus-chats-tabs" role="group" aria-label="Chat wählen">
              <button
                type="button"
                aria-pressed={chatTab === "coach"}
                className={"fokus-chats-tab" + (chatTab === "coach" ? " an" : "")}
                onClick={() => setChatTab("coach")}
              >
                Lerncoach
              </button>
              <button
                type="button"
                aria-pressed={chatTab === "lerncoach"}
                className={
                  "fokus-chats-tab" + (chatTab === "lerncoach" ? " an" : "")
                }
                onClick={() => setChatTab("lerncoach")}
              >
                {lehrkraefte[kb.fach] || "Tutor"}
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
                    nachrichten={chatNachrichten}
                    setNachrichten={setChatNachrichten}
                    onZauberstab={() => oeffneMarkieren("fragen")}
                    aktivId={aktivesMaterial?.id || null}
                    aktivTitel={
                      aktivesMaterial?.id === "__quiz__"
                        ? "die Übung"
                        : aktivesMaterial?.titel || null
                    }
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
              <div className="fokus-tutor">
                {/* Live-Region: neue Antworten werden vom Screenreader vorgelesen */}
                <div
                  className="fokus-tutor-verlauf"
                  role="log"
                  aria-live="polite"
                >
                  <div className="fokus-tutor-blase tutor">
                    Hier erreichst du {lehrkraefte[kb.fach] || COACH} (ein Mensch,
                    kein Automat). Schreib kurz, woran es hängt. Deine Frage
                    wartet bis zum nächsten Termin.
                  </div>
                  {hilfe && (
                    <>
                      {frage && (
                        <div className="fokus-tutor-blase du">„{frage}"</div>
                      )}
                      <div className="fokus-tutor-blase tutor">
                        <span className="fokus-hilfe-haken" aria-hidden="true">
                          ✓
                        </span>{" "}
                        Ist angekommen, Antwort kommt zum Termin.{" "}
                        <button
                          type="button"
                          className="fokus-textlink"
                          onClick={hilfeZuruecknehmen}
                        >
                          zurücknehmen
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {!hilfe && (
                  <form
                    className="fokus-tutor-eingabe"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (entwurf.trim()) hilfeSenden();
                    }}
                  >
                    <input
                      type="text"
                      className="fokus-tutor-feld"
                      value={entwurf}
                      onChange={(e) => setEntwurf(e.target.value)}
                      placeholder={`Frag ${
                        lehrkraefte[kb.fach] || "den Tutor"
                      } etwas …`}
                      aria-label="Frage an die Lehrkraft"
                    />
                    <button
                      type="submit"
                      className="fokus-tutor-senden"
                      disabled={!entwurf.trim()}
                      aria-label="Senden"
                    >
                      →
                    </button>
                  </form>
                )}
              </div>
            )}
              </>
            )}
          </aside>
        </div>
      )}

      {markierenModus && (
        <MarkierenFrage
          zielRef={mitteRef}
          visionModell={visionModell}
          mitFrage={markierenModus === "fragen"}
          onFrageGestellt={(daten) => {
            setMarkierenModus(null);
            frageMitBild(daten);
          }}
          onClose={() => setMarkierenModus(null)}
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
            // A2: hochgeladener Content meldet sich ruhig im Postfach.
            addMitteilung({
              art: "material",
              titel: "Hochgeladen",
              text: `„${m.titel || "Neues Material"}“ liegt jetzt bei ${kb.fach} in der Ablage.`,
            });
          }}
          onClose={() => setUploadOffen(false)}
        />
      )}
    </div>
  );
}
