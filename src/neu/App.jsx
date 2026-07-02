import { useEffect, useRef, useState } from "react";
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
import DiscordModal from "./DiscordModal";
import {
  ladeDiscord,
  speichereDiscord,
  holeNeueNachrichten,
  neuesteNachrichtId,
  antworteImKanal,
  urlsAus,
  DISCORD_EVENT,
} from "./discord";
import { importiereLinkAuto } from "./linkImport";
import { addMitteilung } from "./benachrichtigungen";
import { quelleLabel } from "./material";

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
  // Screen, von dem aus die Planung geöffnet wurde: der Zurück-Knopf im Etappenplan führt
  // dorthin zurück (nicht fix auf "heute"). Wird auf jedem Nicht-Planungs-Screen (heute/ablage)
  // aktualisiert, hält also beim Betreten der Planung den Ursprung.
  const planungHerRef = useRef("heute");
  // Wechsel zwischen Nav-Bereichen wird als horizontaler Wisch gezeigt: der alte
  // Screen läuft kurz mit, der neue schiebt sich in Pillen-Richtung herein.
  const [anzeige, setAnzeige] = useState(() => ({
    screen: "heute",
    prev: null,
    dir: 0,
  }));
  const [fokusKbId, setFokusKbId] = useState(null); // Ziel im Fokus-Modus (Vollbild)
  // Rechteck der angeklickten Übersichts-Karte, damit der Fokus-Kopf von dort
  // nach oben wandert (FLIP). null = ohne Karten-Übergang geöffnet (z. B. "Weiter").
  const [fokusUrsprung, setFokusUrsprung] = useState(null);
  // Deep-Link in die Ablage: id des Materials, das dort automatisch geöffnet werden
  // soll (Klick auf eine Link-/Material-Benachrichtigung). null = nichts öffnen.
  const [ablageMaterialId, setAblageMaterialId] = useState(null);
  // Fester Anker für die untere Leiste außerhalb der wischenden Schiene: die
  // Planungs-Leiste wird hierher portaliert, damit sie beim Screen-Wechsel nicht
  // mitrutscht, sondern als Leiste stehen bleibt und nur ihr Inhalt wechselt.
  const [untenSlot, setUntenSlot] = useState(null);
  const [toast, setToast] = useState(null); // kurze Rückmeldung unten mittig
  const [speicherOk] = useState(speicherGeht); // einmal beim Start pruefen
  const [discordOffen, setDiscordOffen] = useState(false); // Discord-Einstellungen

  // Ursprung der Planung merken: der letzte Nicht-Planungs-Screen (heute/ablage). Beim
  // Betreten der Planung bleibt er stehen, damit der Zurück-Knopf dorthin zurückführt.
  useEffect(() => {
    if (screen === "heute" || screen === "ablage") planungHerRef.current = screen;
  }, [screen]);

  // Discord-Poller: liest den verbundenen Kanal, gibt neue Links an die Import-
  // Pipeline (scrapen + kategorisieren + in die Ablage) und lässt den Bot kurz
  // bestätigen. Läuft nur, solange die App offen ist. Ein DISCORD_EVENT (Verbinden
  // oder "Jetzt prüfen") stößt sofort einen Durchlauf an.
  useEffect(() => {
    let aktiv = true;
    let timer = null;
    let laeuft = false;
    async function tick() {
      if (!aktiv) return;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (laeuft) return; // ein Durchlauf läuft schon; der plant den nächsten
      const cfg = ladeDiscord();
      if (!cfg.aktiv || !cfg.relayUrl) {
        timer = setTimeout(tick, 10000);
        return;
      }
      laeuft = true;
      try {
        if (!cfg.letzteId) {
          // Basislinie setzen: nur ab jetzt neue Nachrichten importieren.
          const basis = await neuesteNachrichtId(cfg);
          speichereDiscord({ ...ladeDiscord(), letzteId: basis });
        } else {
          const neue = await holeNeueNachrichten(cfg, cfg.letzteId);
          if (neue === null) {
            console.warn("[Discord] Kanal nicht lesbar (Relay/Netz?), nächster Versuch folgt.");
          } else if (neue.length) {
            let verarbeitetBis = cfg.letzteId;
            for (const msg of neue) {
              let msgOk = true;
              for (const url of urlsAus(msg.content)) {
                try {
                  const res = await importiereLinkAuto(url);
                  if (!res || res.doppelt) continue;
                  const { material, analyse } = res;
                  const fach = analyse?.erkannt?.fach || "Weiteres";
                  addMitteilung({
                    art: material.art === "link" ? "link" : "material",
                    titel: material.titel,
                    text: analyse?.thema
                      ? `In der Ablage bei ${fach} · ${analyse.thema}`
                      : `In der Ablage bei ${fach}`,
                    materialId: material.id,
                    quelle: material.quelle,
                    tags: material.tags,
                  });
                  if (cfg.antwort !== false) {
                    const wohin = analyse?.thema ? `${fach} · ${analyse.thema}` : fach;
                    antworteImKanal(
                      cfg,
                      `✓ „${material.titel}" bei ${wohin} einsortiert (${quelleLabel(material)}).`
                    );
                  }
                } catch (err) {
                  console.warn("[Discord] Link-Import fehlgeschlagen:", url, err);
                  msgOk = false;
                }
              }
              // letzteId nur bis zur letzten vollständig verarbeiteten Nachricht vorrücken:
              // ein Fehler überspringt die Nachricht so nicht, der nächste Poll versucht sie erneut.
              if (!msgOk) break;
              verarbeitetBis = msg.id;
            }
            if (verarbeitetBis !== cfg.letzteId) {
              speichereDiscord({ ...ladeDiscord(), letzteId: verarbeitetBis });
            }
          }
        }
      } catch {
        /* Netzfehler: nächster Durchlauf versucht es erneut */
      } finally {
        laeuft = false;
        if (aktiv) timer = setTimeout(tick, 10000);
      }
    }
    tick();
    const sofort = () => tick();
    window.addEventListener(DISCORD_EVENT, sofort);
    return () => {
      aktiv = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener(DISCORD_EVENT, sofort);
    };
  }, []);
  // Anmeldung (Demo): die App startet hinter einem Login mit Schulaccount.
  const [eingeloggt, setEingeloggt] = useState(() => {
    try {
      return !!localStorage.getItem(LOGIN_KEY);
    } catch {
      return false;
    }
  });
  // Bei welchem Schritt die Login-Screens öffnen. Normal "willkommen"; geht man aus der
  // Onboarding-Planung zurück, direkt beim letzten Login-Schritt "konto".
  const [loginSchritt, setLoginSchritt] = useState("willkommen");
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
    // Ursprung der Planung = Onboarding: der Zurück-Knopf führt zurück in die Login-Screens.
    planungHerRef.current = "login";
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
    setLoginSchritt("willkommen"); // echtes Abmelden startet wieder von vorn
    setEingeloggt(false);
  }
  // Zurück aus der Onboarding-Planung in die Login-Screens (Dienste-Seite, der
  // letzte Schritt mit Aktion; "konto" gibt es nicht mehr).
  function zurueckZumLogin() {
    try {
      localStorage.removeItem(LOGIN_KEY);
    } catch {
      /* localStorage blockiert: dann nur diese Sitzung */
    }
    setLoginSchritt("dienste");
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
      if (kbId) {
        setFokusUrsprung(null);
        setFokusKbId(kbId);
      }
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
    return <Login onLogin={anmelden} startSchritt={loginSchritt} />;
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
    if (s === "heute")
      return (
        <Heute
          onFokus={(id, rect) => {
            setFokusUrsprung(rect || null);
            setFokusKbId(id);
          }}
          onOeffneAblage={(materialId) => {
            setAblageMaterialId(materialId || null);
            setScreen("ablage");
          }}
        />
      );
    if (s === "ablage")
      return (
        <Ablage
          untenSlot={untenSlot}
          vorn={vorn}
          oeffneMaterialId={ablageMaterialId}
          onGeoeffnet={() => setAblageMaterialId(null)}
        />
      );
    return (
      <Etappenplan
        untenSlot={untenSlot}
        vorn={vorn}
        onWeiter={() => setScreen("wochenplan")}
        onZurueck={() =>
          planungHerRef.current === "login"
            ? zurueckZumLogin()
            : setScreen(planungHerRef.current)
        }
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
          onDiscord={() => setDiscordOffen(true)}
        />
      )}
      {discordOffen && <DiscordModal onClose={() => setDiscordOffen(false)} />}
      {introOffen && screen === "etappenplan" && (
        <IntroOverlay onLos={introFertig} />
      )}
      {fokusKb && (
        <Fokus
          key={fokusKb.id}
          kb={fokusKb}
          naechste={fokusNaechste}
          ursprung={fokusUrsprung}
          onFertig={fokusFertig}
          onWeiter={(id) => {
            setFokusUrsprung(null);
            setFokusKbId(id);
          }}
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
