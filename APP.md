# APP.md - Was die App heute kann

Inventar des aktuellen Implementierungsstands, gegliedert nach den sechs Bereichen
aus VISION.md. Pro Bereich: was bereits umgesetzt ist (mit Code-Referenz) und was laut
Vision noch fehlt (Gap-Liste).

**Vor jedem Feature-Vorschlag lesen**: damit nicht vorgeschlagen wird, was schon da ist.
Vor jedem Implementierungs-Plan zur Hand nehmen: damit Erweiterungen am vorhandenen
Code andocken statt parallel neu zu bauen.

Status-Symbole:
- ✓ umgesetzt und stabil
- ◐ teilweise umgesetzt (Grundgerüst da, Tiefe fehlt)
- ○ konzeptionell vorgesehen, aber noch nicht da

## Gesamtarchitektur in einem Satz

Vite + React 19 SPA, kein Router, State in `App.jsx`, drei Hauptansichten
(Heute / Aufgaben / Wissen), Glocken-Overlay für Nachrichten, Modal für Einstellungen,
alles in localStorage unter `orga.*` persistiert.

## Bereich 1: Orientierung (Heute)

**Schülerfrage**: Was steht heute an? Was ist diese Woche wichtig?
**Code**: `src/views/Heute.jsx`, `src/components/JetztKarte.jsx`, `src/lib/empfehlung.js`,
`src/views/Kalender.jsx`, `src/data/stundenplanWoche.js`

| Status | Feature | Wo |
|---|---|---|
| ✓ | JetztKarte als Hero (eine dominante Aktion) | `JetztKarte.jsx` |
| ✓ | Tages-Empfehlung "Als Nächstes dran" + freier Slot-Check | `empfehlung.js → tagesEmpfehlung` |
| ✓ | Risiko-Hinweise (überfällige Aufgaben, KB-Lernweg-Lag) | `empfehlung.js` |
| ✓ | Heute-fällig-Liste mit Deadline-Farben (rot/orange/grau) | `Heute.jsx` |
| ✓ | Tag / Woche Reiter mit Stundenplan-Integration | `Heute.jsx`, `Kalender.jsx` |
| ✓ | Rhythmisierter Ganztag-Stundenplan (Doppelstunden, Studierzeit, ZEuS, FREI DAY) | `stundenplanWoche.js` |
| ✓ | Etappen-Status sichtbar | `empfehlung.js`, `etappen.js` |
| ✓ | Top-Level Reiter "Mein Tag / Wir" auf Heute | `Heute.jsx` |
| ✓ | Klassen-Puls (Wir-Reiter): aggregierter Schul-Verband, dynamisch nach Etappen-Woche, ohne eigene Position | `KlassenPuls.jsx`, `klassenPuls.js` |
| ◐ | "Diese Woche wichtig" als eigene Sektion | nur Anriss |
| ○ | Vertretungs-Hinweis (Stundenplan-Änderungen) | fehlt |
| ○ | Wetter / Pendel-Info (Außenkontext) | fehlt, evtl. nicht im Scope |

## Bereich 2: Aufgaben

**Schülerfrage**: Was muss ich erledigen, was hat Vorrang?
**Code**: `src/views/Aufgaben.jsx`, `src/data/aufgaben.js`, `src/lib/aufgabeParser.js`,
`src/components/Wochenplaner.jsx`

| Status | Feature | Wo |
|---|---|---|
| ✓ | Aufgaben-Liste als Default-Ansicht | `Aufgaben.jsx` |
| ✓ | Quick-Add per Schnell-Eingabe (Parser erkennt Fach + Frist) | `aufgabeParser.js` |
| ✓ | Deadline-Farbcode (überfällig / heute / diese Woche / später) | `App.css` |
| ✓ | Lernweg-Verknüpfung (`lernweg: { fachId, themaId, schritt }`) koppelt Aufgabe ↔ Schritt | `aufgaben.js`, `lernstand.js → schrittFertig` |
| ✓ | Aufgabe abhaken bewegt Lernweg-Schritt automatisch | `lernstand.js` |
| ✓ | Wochenplaner mit KB-Board + Drag&Drop (im Coach-Modus) | `Wochenplaner.jsx` |
| ✓ | Etappenstart-Modal: KB-Verteilung über Wochen | `EtappenstartModal.jsx`, `wochenplan.js` |
| ✓ | Wochenstart-Modal: Tages-Verteilung der KBs der Woche | `WochenstartModal.jsx` |
| ✓ | Carry-over: unerledigte Aufgaben wandern automatisch weiter | `wochenplan.js` |
| ✓ | Lag-Warnung in Wochenstart | `WochenstartModal.jsx` |
| ◐ | Prioritäten (Prio-Flag exists, UI dafür schwach) | `aufgaben.js` |
| ○ | Automatische Extraktion aus Lehrer-Nachrichten (Vision: "aus Chats") | fehlt |
| ○ | Gruppenarbeiten als eigener Typ | fehlt |
| ○ | Abgaben mit Datei-Upload als Aufgaben-Typ | fehlt |

## Bereich 3: Wissen

**Schülerfrage**: Was lerne ich, wo finde ich das Material?
**Code**: `src/views/Wissen.jsx`, `src/data/wissen.js`, `src/lib/lernstand.js`,
`src/lib/einsortieren.js`, `src/components/WissensGraph.jsx`, `WissensOrdner.jsx`,
`MaterialVorschau.jsx`

| Status | Feature | Wo |
|---|---|---|
| ✓ | Sichtmappe mit Fach-Chip-Register (Fach = Tab) | `Wissen.jsx` |
| ✓ | Lernwege-Reiter mit Schritte-Checkliste pro Knoten | `Wissen.jsx`, `lernstand.js` |
| ✓ | Ordner-Reiter mit thematischer Material-Sortierung | `WissensOrdner.jsx` |
| ✓ | Stand-Kopfzeile pro Fach (KB-Fortschritt, dynamisch berechnet) | `Wissen.jsx`, `lernstand.js → fachKbStand` |
| ✓ | Material hängt an Lernweg-Knoten (Materialien pro Thema) | `wissen.js` |
| ✓ | Universal Drop Spot: Datei rein, automatisch sortiert | `Wissen.jsx`, `einsortieren.js` |
| ✓ | Auto-Sortierung in Fach (Synonyme + KB-Code-Match) | `einsortieren.js → rateFach` |
| ✓ | Auto-Sortierung in Lernweg (Stamm-Match + KB-Code) | `einsortieren.js → rateThema` |
| ✓ | Auto-Erkennung von Art (PDF/Bild/Notiz) und Bereich (Unterricht/Selbstlernen) | `einsortieren.js` |
| ✓ | Schnellnotiz als Material-Eintrag | `einsortieren.js → notizDokument` |
| ✓ | Material-Vorschau-Komponente | `MaterialVorschau.jsx` |
| ✓ | Force-Graph der Lernwege im Coach-Modus | `WissensGraph.jsx` |
| ✓ | Knotenfarbe spiegelt Lernstand (grün/blau/grau), nicht Etappe | `WissensGraph.jsx` |
| ✓ | Etappen-Filter (neutral, ohne Farbe) im Coach-Modus | `Wissen.jsx` |
| ◐ | Suche per Frage (Vision: nicht per Dateiname) | aktuell Stichwort-Suche in GlobalSuche |
| ○ | Material an einzelnen Schritt hängen (heute am Thema) | fehlt |
| ○ | "Welcher Schritt fehlt noch Material?"-Indikator | fehlt |
| ○ | Wiederholungen / Spaced Repetition über Schritte | fehlt |

## Bereich 4: Produktivität

**Schülerfrage**: Wann lerne ich was, wie habe ich gearbeitet?
**Code**: `src/lib/wochenplan.js`, `src/components/Wochenplaner.jsx`,
`EtappenstartModal.jsx`, `WochenstartModal.jsx`, `DemoBar.jsx`

| Status | Feature | Wo |
|---|---|---|
| ✓ | Pflicht-Planung: Etappe planen → dann Woche planen → dann nutzen | `App.jsx → planungBlocker` |
| ✓ | Etappenplan: KBs werden auf Wochen verteilt | `EtappenstartModal.jsx` |
| ✓ | Wochenplan: KBs der Woche auf Tage verteilen | `WochenstartModal.jsx` |
| ✓ | Tages-Carry-over innerhalb der Woche | `wochenplan.js` |
| ✓ | Vorgreifen aufs Morgen wenn heute durch | `wochenplan.js` |
| ✓ | "Heute geplant" + Wochenrückblick auf Heute | `Heute.jsx` |
| ◐ | Routinen (Vision-Punkt) als Konzept, aber nicht als Feature | fehlt expliziter Routinen-Bereich |
| ○ | Lernsessions: das System schlägt aktive Lernzeiten vor | fehlt (heute nur Planung, kein Session-Start) |
| ○ | Fokus-Phasen / Pomodoro-artige Sessions an KB-Schritt gekoppelt | fehlt |
| ○ | "Wie wurde gearbeitet?": Tageszeit, Dauer, Erfolgsrate tracken | fehlt |
| ○ | "Was wurde erledigt?" als Tagesrückblick mit Zeit-Verteilung | nur als Liste vorhanden |
| ○ | Tagesziele / Wochenziele explizit setzbar (über KBs hinaus) | fehlt |

## Bereich 5: Kommunikation (Nachrichten)

**Schülerfrage**: Was muss ich beantworten oder lesen?
**Code**: `src/views/Nachrichten.jsx`, `src/data/nachrichten.js`, Glocke in `Topbar.jsx`

| Status | Feature | Wo |
|---|---|---|
| ✓ | Nachrichten-Overlay via Glocken-Icon in der Topbar | `App.jsx`, `Topbar.jsx` |
| ✓ | Ungelesen-Badge an der Glocke | `Topbar.jsx` |
| ✓ | Detail-Ansicht mit Bodies | `Nachrichten.jsx` |
| ✓ | Gelesen-Status reload-fest | `App.jsx → gelesen` |
| ○ | Einheitlicher Posteingang (Lehrer + Klasse + Verwaltung + Eltern) | nur Lehrer-Nachrichten |
| ○ | KI-Zusammenfassung langer Nachrichten | fehlt |
| ○ | "Braucht Reaktion"-Markierung automatisch erkannt | fehlt |
| ○ | Aufgaben-Extraktion aus Nachricht (Vision-Hauptpunkt) | fehlt |
| ○ | Klassenchat-Schnittstelle (Mock einer Teams/IServ-Anbindung) | fehlt |
| ○ | Gruppenarbeit-Kontext (Mitglieder, geteilte Materialien) | fehlt |

## Bereich 6: Entwicklung

**Schülerfrage**: Wo stehe ich, wo will ich hin?
**Code**: `src/views/Fortschritt.jsx` (eingebettet in Wissen → Stand),
`src/data/fortschritt.js`, `src/lib/lernstand.js`

| Status | Feature | Wo |
|---|---|---|
| ✓ | Kompetenzstand pro Fach (sicher / auf gutem Weg / im Aufbau) | `fortschritt.js`, `Fortschritt.jsx` |
| ✓ | KB-Fortschritt pro Fach (dynamisch berechnet aus Lernwegen) | `lernstand.js → fachKbStand` |
| ✓ | Sparkline-Verlauf pro Fach | `Fortschritt.jsx` |
| ✓ | Coach-Einschätzung von Fr. Berg sichtbar | `fortschritt.js → coachEinschaetzung` |
| ✓ | Stärken und "Daran arbeitest du"-Listen | `fortschritt.js` |
| ✓ | Heute-Bonus (KBs die heute erledigt wurden) sichtbar | `Fortschritt.jsx` |
| ◐ | Stand-Reiter im Coach-Modus mit Verlauf | `Wissen.jsx` |
| ○ | Echtes Tracking aus Verhalten (Vision: "aus echtem Lernverhalten gespiegelt") | heute hardcoded Seeds |
| ○ | Interessen-Erfassung | fehlt |
| ○ | Ziele explizit setzbar (über Etappe hinaus) | fehlt |
| ○ | Fähigkeiten-Modell (überfachlich) | fehlt |
| ○ | Lerncoach-Notizen direkt an KBs/Schritte hängbar | fehlt |

## Querschnitt: zieht sich durch alle Bereiche

### Coach-Modus
**Code**: `App.jsx → coach`, `Einstellungen.jsx`
| ✓ | Toggle in Einstellungen, persistiert | `Einstellungen.jsx` |
| ✓ | Versteckt Power-Features (Graph, Wochenplaner, Command-Palette, Filter) | quer |
| ✓ | Wird als Prop in alle Views durchgereicht | `App.jsx` |

### Glossar und Begriffe
**Code**: `src/data/glossar.js`, `src/components/Begriff.jsx`
| ✓ | Zentrale Definitionen für acht Theresianum-Begriffe | `glossar.js` |
| ✓ | `<Begriff>` mit Tooltip + einmaligem Popover pro Session | `Begriff.jsx` |
| ✓ | sessionStorage-Logik für "einmal gezeigt" | `Begriff.jsx` |

### Such- und Aktions-Schicht
**Code**: `src/components/GlobalSuche.jsx`
| ✓ | Globale Suche über Aufgaben, Nachrichten, Lernwege, Materialien, Stundenplan | `GlobalSuche.jsx` |
| ✓ | Command-Palette mit Aktionen (im Coach-Modus) | `GlobalSuche.jsx` |
| ◐ | Frage-Suche statt Dateinamen-Suche (Vision-Catch 4) | aktuell Stichwort |

### Demo-Modus und Show-Tour
**Code**: `App.jsx → demoModus`, `DemoBar.jsx`, Show-State
| ✓ | Demo-Modus: jede Sitzung mit frischer Etappenplanung | `App.jsx` |
| ✓ | Time-Travel über DemoBar | `DemoBar.jsx` |
| ✓ | Show-Mode (geführte 4-Schritt-Tour) | `App.jsx` |
| ✓ | Willkommens-Banner für Erstnutzung | `App.jsx → willkommen` |

### Personalisierung und Persistenz
| ✓ | Name, Theme (hell/dunkel), Coach-Modus, Demo-Modus | `Einstellungen.jsx` |
| ✓ | Alle Zustände in localStorage unter `orga.*` | `App.jsx` |
| ✓ | Export/Import/Reset der Daten | `Einstellungen.jsx` |

### A11y und Robustheit
| ✓ | ErrorBoundary | `ErrorBoundary.jsx` |
| ✓ | Dark Mode über CSS-Variablen, kein hartes Weiß | `index.css` |
| ✓ | Sidebar mit drei Einträgen (reduziert) | `Sidebar.jsx` |

## Datenmodell-Übersicht

| Datei | Zweck |
|---|---|
| `schule.js` | Stammdaten (Max, Klasse, Lerncoach, nächster KB) |
| `stundenplanWoche.js` | Rhythmisierter Ganztagsplan inkl. `fachFarbe` (maßgeblich) |
| `koennensbeweise.js` | Planungsblatt der Etappe (KBs + Pflicht-KB + gesperrtes Fach) |
| `etappen.js` | Schuljahres-Etappen mit `aktuelleEtappe(date)` |
| `wissen.js` | Netz pro Fach: `themen[]` mit `schritte[]`, `materialien[]`, `kbId` |
| `fortschritt.js` | Kompetenzstand-Seeds + Sparkline-Verlauf + Coach-Text |
| `aufgaben.js` | Aufgaben mit optionalem `lernweg`-Verweis |
| `nachrichten.js` | Lehrer-Nachrichten mit `text`-Bodies |
| `uploads.js` | Vorgeladene Materialien (Seed) |
| `glossar.js` | Acht Theresianum-Begriffe (`kurz` + `lang`) |

## Was die App technisch NICHT hat

- Kein Router (State-basierte Navigation in `App.jsx`)
- Kein Backend, kein Login
- Keine TypeScript-Migration
- Kein Test-Runner (Vitest geplant, nicht eingerichtet)
- Kein Service Worker (PWA-Manifest da, kein Offline-Cache)
- Keine echten KI-Aufrufe (Heuristiken simulieren KI: `empfehlung.js`, `einsortieren.js`, `aufgabeParser.js`)

## Konsequenz für nächste Features

Die größten Lücken im Vergleich zur Vision sind, in absteigender Wirkung:

1. **Kommunikation als einheitlicher Posteingang** mit KI-Zusammenfassung und automatischer Aufgaben-Extraktion (Bereich 5, fast komplett offen)
2. **Produktivität als aktive Lern-Session** statt nur als Planung (Bereich 4, Mitte fehlt)
3. **Entwicklung aus echtem Verhalten gespiegelt** statt aus Seeds (Bereich 6, Datenquelle fehlt)
4. **Material am Schritt** statt nur am Thema (Bereich 3, Verfeinerung des Catches)
5. **Schnittstellen-Demo** zu bestehenden Tools (Vision-Catch 1) als sichtbares Mock

Jeder Vorschlag, der eine dieser fünf Lücken adressiert, ist im Sinne der Vision.
Jeder Vorschlag, der außerhalb der sechs Bereiche oder im "Was nicht reingehört"-Kanon
landet, wird abgelehnt (siehe VISION.md → Prüf-Fragen).
