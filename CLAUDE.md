# CLAUDE.md

Leitfaden für die Arbeit an diesem Repo. Kurz halten, beim Ändern aktuell halten.

## Vor konzeptioneller Arbeit IMMER lesen

Bei Feature-Brainstormings, Konzept-Diskussionen, neuen Ideen, Vorschlägen für die App-Richtung:

- **VISION.md** lesen, bevor irgendwas vorgeschlagen wird. Mission, fünf Catch-Haltungen, sechs Bereiche, was bewusst NICHT zur App gehört, Prüf-Fragen am Ende.
- **APP.md** lesen, damit nichts vorgeschlagen wird, was schon gebaut ist. Inventar mit Status-Markern pro Vision-Bereich plus Code-Referenzen.
- **SCHULE.md** lesen, damit Begriffe und Schul-Logik korrekt sind. Theresianum-Modell mit KB, Lernweg, Etappe, Cluster, Studierzeit, FREI DAY, ZEuS, Lerncoach.

Wenn ein Vorschlag gegen die VISION verstößt oder doppelt zu APP.md ist, wird er nicht gemacht. Wenn er gegen das Schul-Modell in SCHULE.md verstößt, wird er angepasst.

## Was ist das

**Orgatool** ist ein Schul-Organisationstool (Konzept/Demo, kein Backend) für das
**Theresianum Mainz**, ein katholisches Ganztagsgymnasium. Zielgruppe: Schüler:in der
Mittelstufe (~Klasse 7, 12–14 Jahre), die selbstreguliert lernt. Die ganze Oberfläche ist
**auf Deutsch**, Sprache bewusst einfach und kindgerecht, Fachbegriffe werden erklärt.

Festes Demo-Profil (überall konsistent): **Max, Klasse 7a, altsprachlich** (Englisch,
Latein, Griechisch — kein Französisch). Lerncoach: Fr. Berg. Stichtag der Demo-Daten ist
fest der **2026-05-21** (Donnerstag); relativ wirkende Daten hängen daran.

## Befehle

- `npm run dev` — Vite Dev-Server (Port 5173)
- `npm run build` — Produktions-Build (muss fehlerfrei sein)
- `npm run lint` — ESLint (muss ohne Fehler durchlaufen)

Vor dem Abschluss immer `npm run lint` **und** `npm run build` laufen lassen. UI-Änderungen
zusätzlich im Browser über die preview_* Tools verifizieren (Dev-Server läuft via
`.claude/launch.json`, Name `dev`).

## Stack & Architektur

- **Vite + React 19**, keine zusätzlichen Runtime-Abhängigkeiten (nur react/react-dom).
- **Kein Router.** Ansichtswechsel über State in `src/App.jsx`:
  - `active` — aktive Sektion (`heute`/`aufgaben`/`wissen`)
  - `nachrichtenOffen` — Nachrichten-Overlay (öffnet via Glocke in der Topbar)
  - `einstellungenOffen` — Settings-Modal
  - `wissenInit` — Deep-Link in einen Lernweg (z. B. aus Aufgaben)
  - `coach` — Coach-Modus an/aus (Default aus). Im Coach-Modus erscheinen
    Power-Reiter: in Wissen `Netz` und `Verlauf`, in Aufgaben `Wochenplan`,
    Filter (Etappe/Status). Schüler-Modus hat nur die Basis-Reiter.
  - `show` — geführter „Show Mode" (Vorführung, Schritte 1–4)
- **Gehobener gemeinsamer State** lebt in `App.jsx` und wird als Props durchgereicht:
  `erledigt`, `gelesen`, `hochgeladen`, `lernschritte` (abgehakte Lernweg-Schritte),
  `aufgabenListe` (Seed + selbst hinzugefügte), `name`, `theme`, `active`, `kacheln`.
  Alles reload-fest via localStorage unter `orga.*`. `startShow()` setzt bewusst zurück.
  `Einstellungen` bietet Export/Import/Reset dieser Keys.
- **Dark Mode**: `theme === "dunkel"` setzt die Klasse `dark` auf `<html>`; die dunkle
  Palette überschreibt die CSS-Variablen in `index.css`. Daher Farben über Variablen lösen,
  nicht hart kodieren.
- `ErrorBoundary` umhüllt `App` (ruhige Fallback-Karte).
- State ist in-memory; es gibt kein echtes Login/Backend.

## Verzeichnisstruktur

- `src/views/` — drei Schüler-Seiten: `Heute`, `Aufgaben`, `Wissen` (mit Reitern
  `Lernwege | Ordner | Stand`, im Coach-Modus zusätzlich `Netz | Verlauf`).
  `Nachrichten` ist Overlay (Glocke). `Fortschritt` und `Kalender` werden nur noch
  eingebettet gerendert (Fortschritt in Wissen → Stand, Kalender in Heute → Reiter
  Woche).
- `src/components/` — `Topbar`, `Sidebar`, `Icon`, `Label`, `Begriff` (Glossar-
  Tooltip), `JetztKarte` (Hero auf Heute), `GlobalSuche` (Suche + Command-Palette
  im Coach-Modus), `Einstellungen`, `MaterialVorschau`, `ErrorBoundary`,
  `WissensGraph`, `WissensOrdner`, `Wochenplaner`.
- `src/data/` — alle Demo-Daten plus `glossar.js` (acht Theresianum-Begriffe).
- `src/lib/` — `zeit.js`, `lernstand.js` (`effektiveSchritte`/`schrittFertig`),
  `empfehlung.js` (Tages-Empfehlung + Risiken, speist `JetztKarte`),
  `aufgabeParser.js`, `einsortieren.js`.
- Styles: globale Variablen in `src/index.css`, alles andere in `src/App.css`.

## Datenmodell (`src/data/`)

- `schule.js` — Stammdaten (Max, 7a, Lerncoach), nächster Könnensbeweis.
- `stundenplanWoche.js` — rhythmisierter Ganztag (Doppelstunden, Mittagessen, Studierzeit,
  ZEuS, FREI DAY; Mittwoch kurz). `fachFarbe` ist die **maßgebliche Fach-Farbpalette**.
- `koennensbeweise.js` — Planungsblatt der Etappe (Wochenplaner): KBs in Clusterstunden,
  Pflicht-KB + gesperrtes Fach.
- `etappen.js` — Schuljahres-Etappen (Ferien zu Ferien) inkl. `aktuelleEtappe(date)`.
- `wissen.js` — **Netz pro Fach = Lernwege.** Jeder Knoten (`themen[]`) hat `schritte[]`
  (`{text, fertig}`) und eine `etappe`. Materialien (`materialien[]`) hängen über
  `thema === themen[].label` an einem Lernweg.
- `fortschritt.js` — Kompetenzstand je Fach (mit `verlauf` für die Mini-Kurve). Die aktiven
  Lernwege der Fortschritt-Seite werden aus `wissen.js` abgeleitet (eine Quelle).
- `aufgaben.js` — Aufgaben; optionales `lernweg: { fachId, themaId, schritt }` koppelt eine
  Aufgabe an einen Schritt im Netz. `nachrichten.js` (mit `text`-Bodies), `uploads.js`.

## Wichtige Konzepte im Code

- **Wissen-Netz = Lernwege.** Der Status eines Knotens kommt aus den Schritten
  (`lib/lernstand.js` → `themaStatus`): alle fertig = `done`, einige = `current`, keine =
  `upcoming`. Die **Knotenfarbe zeigt den Lernstand** (grün/blau/grau), nicht die Etappe.
  Etappen sind ein **neutraler Filter** (keine eigene Farbe). Klick auf einen Knoten zeigt
  die Schritte (Stand + nächster Schritt) und darunter die Materialien.
- **Etappenfarben nicht für andere Zwecke verwenden** — sie kollidierten früher mit den
  Fachfarben und dem Lernstand. Farbsysteme bewusst trennen: Fach = Fachfarbe, Knoten =
  Lernstand, Etappe = neutral.
- **Schritte sind interaktiv.** Effektiver Stand = manuelles Override (`lernschritte`) >
  Vorgabe in `wissen.js` > gekoppelte Aufgabe erledigt (`schrittFertig` in `lib/lernstand.js`).
  Eine Aufgabe abhaken bewegt also den Lernweg; ein Schritt-Klick im Netz setzt ein Override.
- **`GlobalSuche`** (Topbar) ist Suche + Command-Palette: durchsucht Aufgaben, Nachrichten,
  Wissen-Lernwege/Materialien, Stundenplan-Fächer und führt Befehle aus (`aktionen`-Prop).
- **`Tagesfokus`** (Dashboard) nutzt `lib/empfehlung.js` für „Was jetzt?" + Risiko-Hinweise.
- **`WissensGraph`** ist ein imperatives Force-Layout (requestAnimationFrame, Positionen in
  einer ref). Es verletzt absichtlich React-Compiler-Regeln und hat dafür am Dateianfang
  `/* eslint-disable react-hooks/refs, react-hooks/purity */`. Nicht „aufräumen".

## Konventionen

- **UI-Text und Bezeichner auf Deutsch** (Variablen, Funktionen, Klassen). Bestehendem Stil
  folgen.
- **Keine Gedankenstriche (—)** in Texten/Prosa; stattdessen Doppelpunkt, Komma, Punkt oder
  Klammern.
- ESLint nutzt `eslint-plugin-react-hooks` mit React-Compiler-Regeln. Effekte, die State
  setzen, oder bewusste Ausnahmen mit gezieltem `// eslint-disable-next-line` kennzeichnen
  (siehe `App.jsx` Show-Effekt). Keine pauschalen Disables.
- Sparsam kommentieren: nur das Warum, wenn es nicht offensichtlich ist.
- Keine neuen Abhängigkeiten ohne Grund; alles soll als statische Single-Page-App bauen.

## Browser-Verifikation

- Dev-Server über `preview_start` (Name `dev`). Screenshots wirken klein/verzögert; zum
  Prüfen `preview_eval` mit gezielten DOM-Abfragen nutzen.
- Graph-Knoten lassen sich per `preview_eval` selektieren: PointerEvent `pointerdown` +
  `pointerup` mit `clientX/clientY` aus `getBoundingClientRect()` auf das `.graph-node`.
- Konsolen-Buffer ist kumulativ; nach vielen Edits den Dev-Server neu starten, um veraltete
  HMR-Fehler von echten zu trennen.

## Noch offen / bewusst nicht gemacht

- **TypeScript-Migration** und ein **Test-Runner (z. B. Vitest)** sind nicht eingerichtet:
  größere Tooling-Schritte, für die Demo bewusst zurückgestellt.
- PWA ist über das Manifest installierbar, hat aber **keinen Service Worker** (kein echtes
  Offline-Caching).
