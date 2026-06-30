import { useEffect, useState } from "react";
import Etappenplan from "./Etappenplan";
import Wochenplan from "./Wochenplan";
import Heute from "./Heute";
import Ablage from "./Ablage";
import NavLeiste from "./NavLeiste";
import Topbar from "./Topbar";
import WegLeiste from "./WegLeiste";
import IntroOverlay from "./IntroOverlay";
import Login from "./Login";
import Fokus from "./Fokus";
import { koennensbeweise } from "../data/koennensbeweise";
import {
  planungsScreen,
  planungFertig,
  ladeErledigt,
  ERLEDIGT_KEY,
  meldeAenderung,
} from "./planung";
import { heuteOffeneZiele, nachzuegler } from "./weg";

const INTRO_KEY = "neu.intro.gesehen";
const LOGIN_KEY = "neu.login";

// Funktioniert der lokale Speicher ueberhaupt? Im privaten Modus oder bei
// gesperrtem Speicher (Schulnetz) schlagen Schreibvorgaenge still fehl, und die
// Planung waere beim Neuladen weg. Einmal kurz testen, damit wir ehrlich warnen
// koennen (Datenhoheit: der Schueler soll wissen, wenn nichts gesichert wird).
function speicherGeht() {
  try {
    const k = "neu.speichertest";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

// Drei Räume, je ein Job: Heute (der Tag), Plan (die Etappe), Ablage (das
// Material). Die schwebende Nav-Leiste ist die einzige Navigation. Solange die
// Planung offen ist, führt "Plan" in den Wizard (Etappenplan -> Wochenplanung),
// danach zeigt er die Etappe mit Fortschritt. Smart-Start: wer fertig geplant
// hat, landet direkt auf Heute.

// Reihenfolge der Nav-Bereiche (Pille): Planung links, Übersicht Mitte, Ablage
// rechts. Daraus folgt die Wischrichtung beim Screen-Wechsel.
const NAV_INDEX = { plan: 0, heute: 1, ablage: 2 };
function bereichVon(s) {
  return s === "heute" ? "heute" : s === "ablage" ? "ablage" : "plan";
}

export default function App() {
  // Startansicht für bereits angemeldete Rückkehrer (Reload). Nach einem echten
  // Login führt anmelden() bewusst direkt in die Planung (siehe dort).
  const [screen, setScreen] = useState("heute");
  // Wechsel zwischen Nav-Bereichen wird als horizontaler Wisch gezeigt: der alte
  // Screen läuft kurz mit, der neue schiebt sich in Pillen-Richtung herein.
  const [anzeige, setAnzeige] = useState(() => ({
    screen: "heute",
    prev: null,
    dir: 0,
  }));
  const [fokusKbId, setFokusKbId] = useState(null); // Ziel im Fokus-Modus (Vollbild)
  // Fester Anker für die untere Leiste außerhalb der wischenden Schiene: die
  // Planungs-Leiste wird hierher portaliert, damit sie beim Screen-Wechsel nicht
  // mitrutscht, sondern als Leiste stehen bleibt und nur ihr Inhalt wechselt.
  const [untenSlot, setUntenSlot] = useState(null);
  const [toast, setToast] = useState(null); // kurze Rückmeldung unten mittig
  const [speicherOk] = useState(speicherGeht); // einmal beim Start pruefen
  // Anmeldung (Demo): die App startet hinter einem Login mit Schulaccount.
  const [eingeloggt, setEingeloggt] = useState(() => {
    try {
      return !!localStorage.getItem(LOGIN_KEY);
    } catch {
      return false;
    }
  });
  function anmelden() {
    try {
      localStorage.setItem(LOGIN_KEY, "1");
    } catch {
      /* localStorage blockiert: dann nur diese Sitzung */
    }
    // Nach dem Login direkt in die Planung (planen-Seite mit Intro), nicht auf die
    // Übersicht: dort startet der Einstieg ins Planen (gleiche Logik wie der
    // Nav-Button "Planung"). So landet man auch nach Abmelden/Anmelden verlässlich
    // dort und nicht auf einem zufällig zuletzt offenen Screen.
    setFokusKbId(null);
    const ziel = planungFertig() ? "plan" : planungsScreen();
    setScreen(ziel);
    // Ohne Wisch in die App einsteigen (kein Slide direkt aus dem Login).
    setAnzeige({ screen: ziel, prev: null, dir: 0 });
    setEingeloggt(true);
  }
  function abmelden() {
    try {
      localStorage.removeItem(LOGIN_KEY);
    } catch {
      /* localStorage blockiert: dann nur diese Sitzung */
    }
    setEingeloggt(false);
  }
  // Erststart-Intro: einmal zeigen, bis es weggeklickt ist.
  const [introOffen, setIntroOffen] = useState(() => {
    try {
      return !localStorage.getItem(INTRO_KEY);
    } catch {
      return false;
    }
  });
  function introFertig() {
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* localStorage blockiert: dann eben nur diese Sitzung */
    }
    setIntroOffen(false);
  }

  // Die Oberfläche bleibt bewusst im hellen Cremepapier-Schema, auch wenn das
  // System auf dunkel steht. Die dunkle Palette (an .dark auf <html>) wird daher
  // nicht aktiviert; falls die Klasse irgendwo gesetzt wurde, hier entfernen.
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  // Toast blendet sich nach kurzer Zeit selbst aus.
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // Nach dem Wisch (0.38s) den alten Screen wieder entfernen.
  useEffect(() => {
    if (anzeige.prev == null) return undefined;
    const t = setTimeout(
      () => setAnzeige((a) => (a.prev == null ? a : { ...a, prev: null, dir: 0 })),
      380
    );
    return () => clearTimeout(t);
  }, [anzeige.prev, anzeige.screen]);

  // "Aufgabe wechseln" im Fokus: zurück in die Planung (dort umsortieren) plus
  // kurzer Toast zur Orientierung.
  function fokusZurPlanung() {
    setFokusKbId(null);
    setScreen(planungFertig() ? "plan" : planungsScreen());
    setToast("In der Planung kannst du deine Aufgaben neu ordnen.");
  }

  const bereich =
    screen === "heute" ? "heute" : screen === "ablage" ? "ablage" : "plan";

  function wechsle(ziel) {
    if (ziel === "plan") {
      setScreen(planungFertig() ? "plan" : planungsScreen());
    } else {
      setScreen(ziel);
    }
  }

  // "Mein Weg": ein Schritt-Klick springt zum passenden Screen. Die "Jetzt"-Aktion
  // auf ein Tagesziel öffnet es direkt auf Heute (kbId).
  function wegGo(ziel, kbId) {
    if (ziel === "etappe") setScreen("etappenplan");
    else if (ziel === "woche") setScreen("wochenplan");
    else {
      setScreen("heute");
      if (kbId) setFokusKbId(kbId);
    }
  }

  // Fokus-Abschluss: das Ziel als heute geschafft abhaken (eine Quelle für
  // Heute-Haken, Weg-Fortschritt und Fokus). KEIN automatischer Sprung mehr:
  // der Fokus zeigt danach eine Auswahl (weitermachen oder zurück zur Übersicht),
  // damit der Schüler die Orientierung behält.
  function fokusFertig(kbId) {
    try {
      const e = ladeErledigt();
      e[kbId] = true;
      localStorage.setItem(ERLEDIGT_KEY, JSON.stringify(e));
    } catch {
      /* localStorage blockiert: dann nur diese Sitzung */
    }
    meldeAenderung();
  }
  // Der Weg begleitet die Reihenfolge (Planung + Heute + Plan), nicht das
  // Nachschlage-Werkzeug Ablage. In den Planungs-Wizards (Etappe, Woche) blendet
  // er sich aus: dort führt die eigene Planungs-Leiste unten durch den Schritt.
  const zeigeWeg =
    screen !== "ablage" &&
    screen !== "etappenplan" &&
    screen !== "wochenplan" &&
    screen !== "plan";
  // Die obere Nav-Leiste ist überall sichtbar, auch in der Planung (Wunsch:
  // jederzeit zwischen Übersicht/Planung/Ablage wechseln können). Die Planungs-
  // Leiste unten führt zusätzlich durch den Schritt ("Weiter" / "‹ Etappe").
  const zeigeNav = true;

  // Screen-Wechsel erkennen und die Wischrichtung aus der Nav-Reihenfolge ableiten.
  // setState direkt im Render beim State-Wechsel ist hier das von React empfohlene
  // Muster (konvergiert sofort, da danach anzeige.screen === screen gilt), und
  // vermeidet im Gegensatz zum Effekt einen Frame mit dem alten Screen.
  if (anzeige.screen !== screen) {
    const altIdx = NAV_INDEX[bereichVon(anzeige.screen)];
    const neuIdx = NAV_INDEX[bereichVon(screen)];
    // Inhalt wischt entgegen der Pillen-Richtung (wie Blättern): zu einem Tab weiter
    // rechts kommt der neue Screen von rechts herein, der alte geht nach links raus.
    const dir = neuIdx === altIdx ? 0 : neuIdx > altIdx ? -1 : 1;
    setAnzeige({ screen, prev: dir === 0 ? null : anzeige.screen, dir });
  }

  // Vor der App steht die Anmeldung: ohne Login zeigt der ganze Bildschirm den
  // Schulaccount-Einstieg (alle Hooks laufen davor, daher ist der frühe Ausstieg
  // hier sicher).
  if (!eingeloggt) {
    return <Login onLogin={anmelden} />;
  }

  // vorn = dieser Screen ist der aktive (nicht der gerade hinauswischende). Nur der
  // vordere Screen zeigt seine untere Leiste, sonst lägen beim Wechsel zwei Leisten
  // übereinander.
  function renderScreen(s, vorn) {
    if (s === "wochenplan" || s === "plan") {
      // "plan" = Neu planen: gleicher Wizard-Stil. Da die Woche schon gefüllt ist,
      // bietet die untere Leiste dort "Umplanen".
      return (
        <Wochenplan
          untenSlot={untenSlot}
          vorn={vorn}
          onZurueck={() => setScreen("etappenplan")}
          onWeiter={() => setScreen("heute")}
        />
      );
    }
    if (s === "heute") return <Heute onFokus={setFokusKbId} />;
    if (s === "ablage") return <Ablage />;
    return (
      <Etappenplan
        untenSlot={untenSlot}
        vorn={vorn}
        onWeiter={() => setScreen("wochenplan")}
        onZurueck={() => setScreen("heute")}
      />
    );
  }

  // Beim Bereichswechsel beide Screens auf einer Schiene zeigen und in Pillen-
  // Richtung wischen; danach bleibt nur der neue (statisch, normale Höhe).
  const imWechsel = anzeige.prev != null;
  const blaetter = !imWechsel
    ? [{ s: anzeige.screen, alt: false }]
    : anzeige.dir > 0
      ? [
          { s: anzeige.screen, alt: false },
          { s: anzeige.prev, alt: true },
        ]
      : [
          { s: anzeige.prev, alt: true },
          { s: anzeige.screen, alt: false },
        ];
  const inhalt = (
    <div className={"screen-buehne" + (imWechsel ? " im-wechsel" : "")}>
      <div
        className={
          "screen-track" +
          (imWechsel ? (anzeige.dir > 0 ? " track-rechts" : " track-links") : "")
        }
      >
        {blaetter.map(({ s, alt }) => (
          <div
            className={"screen-blatt" + (alt ? " screen-blatt-alt" : "")}
            key={s}
          >
            {renderScreen(s, !alt)}
          </div>
        ))}
      </div>
    </div>
  );

  const fokusKb = fokusKbId
    ? koennensbeweise.find((k) => k.id === fokusKbId)
    : null;
  const fokusNaechste = fokusKb
    ? [...heuteOffeneZiele(), ...nachzuegler()].find((k) => k.id !== fokusKbId) ||
      null
    : null;

  return (
    <>
      {!speicherOk && (
        <div
          className="speicher-warnung"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          Änderungen werden gerade nicht gespeichert. Prüfe den Browser-Speicher
          (privater Modus?).
        </div>
      )}
      {zeigeWeg && <WegLeiste onGo={wegGo} />}
      {/* Anker für die untere Leiste, außerhalb der wischenden Schiene. */}
      <div className="unten-leiste-slot" ref={setUntenSlot} />
      {inhalt}
      {zeigeNav && <NavLeiste aktiv={bereich} onWechsel={wechsle} />}
      {zeigeNav && (
        <Topbar
          onResetDemo={() => window.location.reload()}
          onAbmelden={abmelden}
        />
      )}
      {introOffen && screen === "etappenplan" && (
        <IntroOverlay onLos={introFertig} />
      )}
      {fokusKb && (
        <Fokus
          key={fokusKb.id}
          kb={fokusKb}
          naechste={fokusNaechste}
          onFertig={fokusFertig}
          onWeiter={(id) => setFokusKbId(id)}
          onPlanung={fokusZurPlanung}
          onClose={() => setFokusKbId(null)}
        />
      )}
      {toast && (
        <div className="app-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}
