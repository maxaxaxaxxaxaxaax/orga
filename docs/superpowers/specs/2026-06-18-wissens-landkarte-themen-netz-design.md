# Wissens-Landkarte (Themen-Netz) — Design-Spec

Datum: 2026-06-18
Status: freigegeben (Brainstorming abgeschlossen)
Branch: neu

## Ziel

Die Wissens-Inhalte eines Fachs zusaetzlich zur Listen-Ablage als grafisches,
geclustertes Themen-Netz darstellen (Vorbild: die math.stackexchange Tag-Karte).
Man soll sehen, wie die Bereiche zusammenhaengen und worauf was aufbaut, mit
Lernstand-Faerbung. Bewusst eine sachliche Daten-Visualisierung (Wissens-Landkarte),
KEIN gamifizierter Skilltree mit Freischalt-Mechanik.

## Kontext und Ausgangslage

- Live-App ist `src/neu` (Einstieg `src/main.jsx` -> `src/neu/App.jsx`). `src/views`
  und das meiste in `src/lib` sind die alte, ungenutzte App.
- Es existiert bereits eine Force-Graph-Komponente `src/components/WissensGraph.jsx`
  (imperatives SVG-Force-Layout, Drag, Nachbar-Hervorhebung, respektiert
  `prefers-reduced-motion`), aber nur in der alten App und nur im Coach-Modus
  gerendert. Sie dient als Vorlage.
- Daten: `src/data/wissen.js` (faecher -> themen mit `kategorie`, `subkategorie`,
  `kbId`, `landkarte`, `schritte`/`erklaerung`), Gliederung je Fach in
  `src/data/fachStruktur.js` (`FACH_STRUKTUR`, `pruefeFachNetz`), Mathe zusaetzlich
  `src/data/matheKategorien.js`.
- Lernstand in `src/neu`: localStorage ueber `src/neu/lernschritte.js` und
  `src/neu/planung.js`, inline je Lernweg berechnet (NICHT die alte `lib/lernstand.js`).
- WICHTIG: In den Daten gibt es KEINE echten Voraussetzungs-Kanten zwischen Themen
  (nur die Hierarchie Fach > Kategorie > Subkategorie > Lernweg). Recherche bestaetigt:
  es gibt online keine frei nutzbare, gerichtete Voraussetzungs-Datenquelle fuer
  deutschen Schulstoff. Die math.SE-Karte zeigt nur statistisches Mit-Vorkommen, keine
  Lernreihenfolge. Die "baut-auf"-Kanten muessen daher selbst erzeugt werden.

## Entscheidungen (festgelegt)

1. Form: organisches, geclustertes Netz (Force-Look), nicht Pyramide/Spalten/Pfad.
2. Umfang: ein Netz PRO FACH. Die Kategorien sind die farbigen Cluster.
3. Platz: zusaetzliche Ansicht. Umschalter `Liste | Netz` im Wissens-Bereich.
   Die Liste bleibt Standard und barrierearme Alternative.
4. Linien-Bedeutung: gerichtetes "baut auf" GROB zwischen den Kategorien
   (Grundlagen als Wurzel, mit allem verbunden) plus duenne "gehoert-zu"-Linien
   Kategorie -> Subkategorie -> Lernweg.
5. Kanten-Quelle: einmalig per Agenten am deutschen Lehrplan generiert und mit
   einem Check (analog `pruefeFachNetz`) geprueft, als kleine Datenstruktur abgelegt.
   Kein laufender Pflegeaufwand, keine erfundenen Zufallslinien.
6. Knotengroesse: strikt nach Hierarchie-Ebene. Kategorie gross, Subkategorie
   mittel, Lernweg klein.
7. Farbe = Kategorie (jede Kategorie eine eigene Farbe aus CSS-Variablen,
   dark-mode-sicher).
8. Lernstand ueber FUELLUNG (nicht Farbe): blass = offen, voll = erledigt,
   mit Ring = aktuell. Zusaetzlich als Text/Icon, nie nur ueber Farbe.
9. Technik: kein neues Runtime-Paket. Auf `WissensGraph.jsx` aufbauen, Layout
   einmal rechnen und einfrieren (settle-then-freeze), reines SVG, CSS-Variablen.

## Datenmodell

### Knoten (zur Laufzeit aus vorhandenen Daten abgeleitet, nicht gespeichert)

Pro Fach werden drei Knotenarten erzeugt:
- Kategorie-Knoten: aus `FACH_STRUKTUR[fachId].kategorien`. Ebene 1 (gross).
- Subkategorie-Knoten: aus `FACH_STRUKTUR[fachId].subkategorien`. Ebene 2 (mittel).
- Lernweg-Knoten: aus `fach.themen` (ein Knoten je Thema). Ebene 3 (klein).

Jeder Knoten: `{ id, label, ebene (1|2|3), kategorie, color, status }`.
`status` (offen|erledigt|aktuell) wird aus dem `neu`-Lernstand berechnet, identisch
zur Logik der Ablage (erledigt-Flag + abgehakte Schritte; aktiv = echter KB der
aktuellen Etappe).

Faecher OHNE `FACH_STRUKTUR` (aktuell Latein, Griechisch) bekommen vorerst keinen
Netz-Reiter und bleiben bei der Liste. Der Umschalter erscheint nur, wenn das Fach
eine Struktur hat (mathe, deutsch, englisch).

### Kanten

- "gehoert zu" (abgeleitet, nicht gespeichert): Kategorie -> ihre Subkategorien,
  Subkategorie -> ihre Lernwege. Duenn, in der Kategorie-Farbe.
- "baut auf" (gespeichert, generiert): gerichtete Paare zwischen Kategorien.
  Neue Datei `src/data/voraussetzungen.js`:
  `export const VORAUSSETZUNGEN = { mathe: [["Mathematische Grundlagen","Algebra"], ...], deutsch: [...], englisch: [...] }`
  Konvention: `[prereq, dependent]` (Pfeil zeigt von Grundlage zum Aufbauenden).
  Nur Kategorie-Namen, die in `FACH_STRUKTUR[fach].kategorien` existieren.
- Validierung: Funktion `pruefeVoraussetzungen(fachId)` prueft, dass alle genannten
  Kategorien existieren, keine Selbstkante, keine Dublette, kein Zyklus. Wird beim
  Build/Test geprueft (wie `pruefeFachNetz`).

### Generierung der baut-auf-Kanten (einmalig, vor der Implementierung)

Agenten-Lauf (analog studyflix-Abgleich): je Fach die Kategorien-Liste vorgeben,
am deutschen Lehrplan (KMK/LehrplanPLUS) orientierte gerichtete "baut-auf"-Paare
auf Bereichs-Ebene erzeugen, Grundlagen/Basis als Wurzel. Ergebnis in
`voraussetzungen.js` ablegen, mit `pruefeVoraussetzungen` validieren, kurz manuell
sichten. Optional Gegencheck gegen AL-CPL / K12-KGraph.

## Komponenten

- `src/neu/Netz.jsx` (neu): rendert das Themen-Netz eines Fachs als SVG. Baut die
  Knoten/Kanten aus `wissen.js` + `fachStruktur.js` + `voraussetzungen.js`,
  berechnet das Layout einmal (settle-then-freeze), rendert Kreise (Groesse=Ebene,
  Fuellung=Lernstand, Farbe=Kategorie), Kanten (baut-auf mit Pfeil, gehoert-zu duenn),
  Labels. Hover hebt Nachbarn hervor. Klick auf einen Lernweg-Knoten oeffnet das
  bestehende Lernweg-Detail (`KbInhalt`). Pan/Zoom. `prefers-reduced-motion` -> statisch.
- `src/neu/netzLayout.js` (neu): reine Funktion, die aus Knoten+Kanten stabile
  Positionen rechnet (adaptierte Force-Logik aus `WissensGraph.jsx`, ohne Paket,
  deterministisch durch festen Startzustand, N Iterationen, dann eingefroren).
  Gut testbar (gleiche Eingabe -> gleiche Ausgabe).
- `src/neu/Ablage.jsx` (Aenderung): Ansichts-Umschalter `Liste | Netz` einbauen.
  In der Fach-Detailansicht zwischen Liste und `Netz` umschalten; Fach-Auswahl und
  Lernweg-Detail bleiben geteilt.
- `src/neu/Netz.css` (neu) bzw. Erweiterung vorhandener CSS, Farben ueber Variablen.

## Lernstand-Kodierung (Barrierefreiheit)

- offen: Kategorie-Farbe mit reduzierter Deckkraft.
- erledigt: volle Deckkraft + Haken-Icon/Markierung.
- aktuell: volle Deckkraft + deutlicher Ring + Text "aktuell".
- Jeder Knoten ist per Tastatur fokussierbar, `aria-label` nennt Titel, Ebene und
  Lernstand als Text. Kontraste WCAG-konform, Status nie nur ueber Farbe.
- Die `Liste`-Ansicht ist die gleichwertige nicht-visuelle Darstellung.

## Interaktion

- Klick Lernweg-Knoten -> oeffnet `KbInhalt` (Erklaerung + Materialien), wie in der Liste.
- Hover/Fokus -> Nachbarn hervorgehoben, Rest gedimmt.
- Progressive Offenlegung gegen Dichte (~145 Knoten bei Mathe): Default zeigt
  Kategorie- + Subkategorie-Knoten; eine Subkategorie klappt ihre Lernwege auf/zu.
  (Genauer Default in der Umsetzung abstimmbar.)
- Sanftes Pan/Zoom ueber SVG-Transform. Kein Auto-Animieren bei reduced-motion.

## Vision-Konformitaet

- Zusatz-Ansicht, nicht neuer Default -> "Default ist Reduktion" bleibt gewahrt
  ("Uebersicht auf Abruf").
- Sachliche Netz-Darstellung, keine Spiel-/Gamification-Optik, keine Freischalt-Logik,
  Schul-Vokabular (Lernweg, Schritt, Koennensbeweis).
- Nur selbstberichteter Lernstand wird gespiegelt, keine neuen Datenpunkte.
- Liste bleibt barrierearme, gleichwertige Alternative.

## Out of scope

- Cross-Fach-Verbindungen (faecheruebergreifende Voraussetzungen).
- Feinkoernige Lernweg-zu-Lernweg-Voraussetzungen (bewusst nur Bereichs-Ebene).
- Externe Datenquellen als Live-Abhaengigkeit (nur optionaler Gegencheck offline).
- Neue Runtime-Abhaengigkeiten (kein d3 o.ae. in der App).

## Abschlusskriterien

- `npm run lint` und `npm run build` fehlerfrei.
- `pruefeFachNetz` weiter fehlerfrei; neuer `pruefeVoraussetzungen`-Check fehlerfrei.
- Browser-Check: Umschalter funktioniert, Netz rendert je Fach, Farben = Kategorie,
  Groesse = Ebene, Fuellung = Lernstand, Klick oeffnet Lernweg-Detail, Liste bleibt
  Default und unveraendert nutzbar, Dark Mode korrekt.
