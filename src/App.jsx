import { useEffect, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Icon from "./components/Icon";
import Heute from "./views/Heute";
import Aufgaben from "./views/Aufgaben";
import Wissen from "./views/Wissen";
import Nachrichten from "./views/Nachrichten";
import Einstellungen from "./components/Einstellungen";
import WochenstartModal from "./components/WochenstartModal";
import EtappenstartModal from "./components/EtappenstartModal";
import DemoBar from "./components/DemoBar";
import { aktuellerEtappenplanStatus, aktuelleWocheStatus } from "./lib/wochenplan";
import { aktuelleEtappe } from "./data/etappen";
import { dokumentAusDatei } from "./lib/einsortieren";
import { startUploads } from "./data/uploads";
import { faecher } from "./data/wissen";
import { aufgaben as seedAufgaben } from "./data/aufgaben";
import { nachrichten } from "./data/nachrichten";
import { student } from "./data/schule";
import { tageBis } from "./lib/zeit";
import "./App.css";

// localStorage-Helfer (Stand übersteht einen Reload).
function laden(key, fallback) {
  try {
    const roh = localStorage.getItem(key);
    return roh ? JSON.parse(roh) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [active, setActive] = useState(() => {
    const v = laden("orga.active", "heute");
    // Alte Werte aus der vorigen IA auf die neuen drei Bereiche umlenken.
    if (v === "kalender") return "heute";
    if (v === "kommunikation") return "heute";
    if (v === "entwicklung") return "wissen";
    return v;
  });
  const [aufgabenModus, setAufgabenModus] = useState("liste");
  // Echtes Jetzt-Datum (alle 30s aktualisiert). jetzt wird unten aus
  // demoDatum oder echteJetzt berechnet, sobald demoDatum deklariert ist.
  const [echteJetzt, setEchteJetzt] = useState(new Date());

  // Gemeinsamer Zustand (Schnellaktionen + Seiten + Show), reload-fest.
  const [erledigt, setErledigt] = useState(() => laden("orga.erledigt", {}));
  const [gelesen, setGelesen] = useState(() => laden("orga.gelesen", {}));
  const [hochgeladen, setHochgeladen] = useState(() => laden("orga.hochgeladen", startUploads));
  // Manuell abgehakte Lernweg-Schritte (Override über die Vorgabe in wissen.js).
  const [lernschritte, setLernschritte] = useState(() => laden("orga.lernschritte", {}));
  // Aufgabenliste = Seed + selbst hinzugefügte (Schnell-Eingabe), reload-fest.
  const [aufgabenListe, setAufgabenListe] = useState(() => laden("orga.aufgaben", seedAufgaben));
  // Personalisierung.
  const [name, setName] = useState(() => laden("orga.name", student.name));
  const [theme, setTheme] = useState(() => laden("orga.theme", "hell"));
  const [coach, setCoach] = useState(() => laden("orga.coach", false));
  // Demo-Modus: startet jede Sitzung mit frischer Etappenplanung + erlaubt
  // Time-Travel über die DemoBar.
  const [demoModus, setDemoModus] = useState(() => laden("orga.demo", false));
  const [demoDatum, setDemoDatum] = useState(() => laden("orga.demoDatum", null));
  // jetzt aus demoDatum (Time-Travel) oder echtem Tick.
  const jetzt = demoDatum ? new Date(demoDatum) : echteJetzt;
  const [einstellungenOffen, setEinstellungenOffen] = useState(false);
  const [nachrichtenOffen, setNachrichtenOffen] = useState(false);
  // Deep-Link für Wissen (z. B. aus Aufgaben oder Heute auf einen Lernweg springen).
  const [wissenInit, setWissenInit] = useState(null);
  // Pflicht-Planungs-Status (Etappen- + Wochenstart). Bump = neu prüfen.
  const [planungVersion, setPlanungVersion] = useState(0);
  const [willkommen, setWillkommen] = useState(() => !laden("orga.tourGesehen", false));

  // Show Mode (geführte Vorführung).
  const [show, setShow] = useState({ aktiv: false, schritt: 0 });

  useEffect(() => {
    const id = setInterval(() => setEchteJetzt(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Persistenz
  useEffect(() => localStorage.setItem("orga.erledigt", JSON.stringify(erledigt)), [erledigt]);
  useEffect(() => localStorage.setItem("orga.gelesen", JSON.stringify(gelesen)), [gelesen]);
  useEffect(() => localStorage.setItem("orga.hochgeladen", JSON.stringify(hochgeladen)), [hochgeladen]);
  useEffect(() => localStorage.setItem("orga.lernschritte", JSON.stringify(lernschritte)), [lernschritte]);
  useEffect(() => localStorage.setItem("orga.aufgaben", JSON.stringify(aufgabenListe)), [aufgabenListe]);
  useEffect(() => localStorage.setItem("orga.active", JSON.stringify(active)), [active]);
  useEffect(() => localStorage.setItem("orga.name", JSON.stringify(name)), [name]);
  useEffect(() => localStorage.setItem("orga.coach", JSON.stringify(coach)), [coach]);
  useEffect(() => localStorage.setItem("orga.demo", JSON.stringify(demoModus)), [demoModus]);
  useEffect(() => {
    if (demoDatum) localStorage.setItem("orga.demoDatum", JSON.stringify(demoDatum));
    else localStorage.removeItem("orga.demoDatum");
  }, [demoDatum]);

  // Demo-Modus: bei jedem Mount alle Planungsdaten löschen, damit der Etappen-
  // und Wochenstart-Flow frisch durchlaufen wird. Settings/Theme bleiben.
  useEffect(() => {
    if (!demoModus) return;
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith("orga.etappenplan.") ||
          k.startsWith("orga.wochenplan.") ||
          k.startsWith("orga.kbFertig."))
      ) {
        toRemove.push(k);
      }
    }
    for (const k of toRemove) localStorage.removeItem(k);
    localStorage.setItem("orga.tourGesehen", "true");
    // Datum auf den Start der aktuellen Etappe stellen -> immer Woche 1.
    const etappe = aktuelleEtappe(new Date());
    const start = new Date(etappe.von + "T08:00:00").toISOString();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDemoDatum(start);
    setPlanungVersion((v) => v + 1);
    setWillkommen(false);
  }, [demoModus]);
  useEffect(() => {
    if (!nachrichtenOffen) return;
    const onKey = (e) => e.key === "Escape" && setNachrichtenOffen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [nachrichtenOffen]);
  useEffect(() => {
    localStorage.setItem("orga.theme", JSON.stringify(theme));
    document.documentElement.classList.toggle("dark", theme === "dunkel");
  }, [theme]);

  // Schritt 3 → 4: erkennen, wenn alle heute fälligen Aufgaben abgehakt sind.
  const offenHeute = aufgabenListe.filter(
    (a) => tageBis(a.faellig, jetzt) <= 0 && !erledigt[a.id]
  ).length;
  // Ungelesene Nachrichten (für den Glocken-Punkt).
  const ungeleseneCount = nachrichten.filter((n) => !n.gelesen && !gelesen[n.id]).length;

  // Pflicht-Planung: erst Etappe planen, dann Woche planen, bevor die App
  // genutzt wird. planungVersion erzwingt Neu-Lesen nach onFertig.
  const etappenstatus = aktuellerEtappenplanStatus(jetzt);
  const wochenstatus = aktuelleWocheStatus(jetzt);
  // Im Show-Mode oder beim Onboarding-Banner kein Blocker, sonst wäre der Ablauf zu hart.
  const planungBlocker =
    !show.aktiv && !willkommen
      ? !etappenstatus.fertig
        ? "etappe"
        : !wochenstatus.fertig
        ? "woche"
        : null
      : null;
  // planungVersion in Effekt-Liste, damit re-Render nach Speichern triggern.
  void planungVersion;

  function addAufgabe(neu) {
    if (neu) setAufgabenListe((l) => [neu, ...l]);
  }

  function tourSchliessen(starten) {
    localStorage.setItem("orga.tourGesehen", "true");
    setWillkommen(false);
    if (starten) startShow();
  }
  useEffect(() => {
    // Bewusster geführter Übergang im Show Mode (seltenes Ereignis).
    if (show.schritt === 3 && offenHeute === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow((s) => ({ ...s, schritt: 4 }));
      setActive("wissen");
    }
  }, [show.schritt, offenHeute]);

  function addDokumente(files, zielFach) {
    const neu = files.map((f) =>
      dokumentAusDatei(f, { zielFach, fallbackFach: faecher[0].fach })
    );
    setHochgeladen((g) => [...neu, ...g]);
    return neu;
  }
  function oeffnen(id) {
    if (id === "kommunikation") {
      setNachrichtenOffen(true);
      return;
    }
    setActive(id);
  }
  function oeffneLernweg(fachId, themaId) {
    setWissenInit({ fachId, themaId });
    setActive("wissen");
  }

  // --- Show-Steuerung ---
  function startShow() {
    setErledigt({});
    setActive("heute");
    setAufgabenModus("liste");
    setShow({ aktiv: true, schritt: 1 });
  }
  function toastKlick() {
    setAufgabenModus("plan");
    setActive("aufgaben");
    setShow((s) => ({ ...s, schritt: 2 }));
  }
  function weiter() {
    setActive("heute");
    setShow((s) => ({ ...s, schritt: 3 }));
  }
  function endShow() {
    setShow({ aktiv: false, schritt: 0 });
    setAufgabenModus("liste");
  }

  const guide = {
    2: { text: "Schritt 2 von 4 · Plane deine Woche im Etappenplan.", weiter: true },
    3: { text: "Schritt 3 von 4 · Hake auf der Startseite deine heutigen Aufgaben ab.", weiter: false },
    4: { text: "Geschafft! Dein Fortschritt ist gewachsen. 🎉", weiter: false },
  }[show.schritt];

  return (
    <div className="shell">
      <Topbar
        jetzt={jetzt}
        onStartShow={startShow}
        onOpen={oeffnen}
        onSettings={() => setEinstellungenOffen(true)}
        onNachrichten={() => setNachrichtenOffen(true)}
        ungelesen={ungeleseneCount}
        showSchritt={show.schritt}
        coach={coach}
      />
      <Sidebar active={active} onSelect={(id) => setActive(id)} />
      <main className="content">
          <>
            {active === "heute" && (
              <Heute
                jetzt={jetzt}
                erledigt={erledigt}
                setErledigt={setErledigt}
                aufgaben={aufgabenListe}
                lernschritte={lernschritte}
                name={name}
                coach={coach}
                onOpen={oeffnen}
                onOpenLernweg={oeffneLernweg}
              />
            )}
            {active === "aufgaben" && (
              <Aufgaben
                jetzt={jetzt}
                erledigt={erledigt}
                setErledigt={setErledigt}
                initialModus={aufgabenModus}
                aufgaben={aufgabenListe}
                onAdd={addAufgabe}
                coach={coach}
                onOpen={oeffnen}
                onOpenLernweg={oeffneLernweg}
              />
            )}
            {active === "wissen" && (
              <Wissen
                hochgeladen={hochgeladen}
                setHochgeladen={setHochgeladen}
                addDokumente={addDokumente}
                erledigt={erledigt}
                lernschritte={lernschritte}
                setLernschritte={setLernschritte}
                aufgaben={aufgabenListe}
                coach={coach}
                init={wissenInit}
                onInitConsumed={() => setWissenInit(null)}
              />
            )}
          </>
      </main>

      {nachrichtenOffen && (
        <div className="overlay-screen" role="dialog" aria-modal="true" aria-label="Nachrichten">
          <button
            className="overlay-close"
            onClick={() => setNachrichtenOffen(false)}
            aria-label="Nachrichten schließen"
          >
            ×
          </button>
          <Nachrichten gelesen={gelesen} setGelesen={setGelesen} />
        </div>
      )}

      {/* Show: Benachrichtigungs-Toast (Schritt 1) */}
      {show.schritt === 1 && (
        <button className="show-toast" onClick={toastKlick}>
          <span className="show-toast-icon"><Icon name="glocke" size={18} /></span>
          <span className="show-toast-text">
            <strong>Neuer Etappenplan ist da!</strong>
            <span>Jetzt deine Woche planen →</span>
          </span>
        </button>
      )}

      {/* Show: Guide-Leiste (Schritt 2–4) */}
      {show.aktiv && guide && (
        <div className="show-guide">
          <span className="show-guide-text">{guide.text}</span>
          <span className="show-guide-btns">
            {guide.weiter && (
              <button className="show-guide-weiter" onClick={weiter}>Weiter</button>
            )}
            <button className="show-guide-ende" onClick={endShow}>Show beenden</button>
          </span>
        </div>
      )}

      {willkommen && !show.aktiv && (
        <div className="willkommen">
          <div className="willkommen-text">
            <strong>Willkommen im Orgatool!</strong>
            <span>Möchtest du eine kurze Vorführung sehen, wie alles zusammenspielt?</span>
          </div>
          <div className="willkommen-btns">
            <button className="willkommen-start" onClick={() => tourSchliessen(true)}>Tour starten</button>
            <button className="willkommen-spaeter" onClick={() => tourSchliessen(false)}>Später</button>
          </div>
        </div>
      )}

      {einstellungenOffen && (
        <Einstellungen
          name={name}
          setName={setName}
          theme={theme}
          setTheme={setTheme}
          coach={coach}
          setCoach={setCoach}
          demoModus={demoModus}
          setDemoModus={setDemoModus}
          onClose={() => setEinstellungenOffen(false)}
        />
      )}

      {demoModus && (
        <DemoBar
          jetzt={jetzt}
          onSetDatum={setDemoDatum}
          onReset={() => setDemoDatum(null)}
        />
      )}

      {planungBlocker === "etappe" && (
        <EtappenstartModal
          etappe={etappenstatus.etappe}
          onFertig={() => setPlanungVersion((v) => v + 1)}
        />
      )}
      {planungBlocker === "woche" && (
        <WochenstartModal
          jetzt={jetzt}
          onFertig={() => setPlanungVersion((v) => v + 1)}
        />
      )}
    </div>
  );
}
