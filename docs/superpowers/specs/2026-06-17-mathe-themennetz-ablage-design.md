# Mathe-Themennetz in der Ablage (Design-Spec)

Datum: 2026-06-17
Branch: `neu`
Status: zur Review

## Ziel

Die Ablage soll die **gesamte Schulmathematik** als trackbares Themennetz zeigen,
strukturiert nach den 7 studyflix-Kategorien. Jedes Kapitel wird ein Lernweg, jedes
Sub-Thema ein abhakbarer Schritt. Der Schüler sieht so seinen **Gesamt-Fortschritt**
über die ganze Mathematik, nicht nur über die aktuelle Etappe.

Es geht um **Struktur und Fortschritt**, nicht um Lerninhalte: keine Videos, keine
eingebetteten Erklärungen, keine externen Links. Das hält die App auf der richtigen
Seite der Vision (kein Lerntool, keine Inhalts-Bibliothek, keine Antwort-KI). Die
Themen- und Schrittnamen sind Standard-Lehrplan-Bezeichnungen (Allgemeingut), nicht
von studyflix übernommene Inhalte.

## Vision-Abgleich

- **Bereich Wissen + Entwicklung**: Orientierung ("was lerne ich, wo stehe ich") und
  Selbst-Tracking über die Zeit. Kein Ausliefern von Lösungen.
- **Material folgt dem Kontext**: neue Lernwege starten leer; Material sammelt der
  Schüler selbst, es landet am richtigen Lernweg.
- **Reduktion**: ~100 Lernwege erscheinen nicht als Lawine, sondern nach Kategorien
  gruppiert und eingeklappt.
- **Trennung Netz vs. Etappe**: das volle Netz lebt in `wissen.js`, die terminierten
  KBs in `koennensbeweise.js`. Das Themennetz pollutiert Heute/Planung/Wochenplan
  nicht, weil die über `koennensbeweise` iterieren, nicht über das Netz.

## Modell

Dreistufig, gemappt auf das bestehende Datenmodell ohne neue Hierarchie-Ebene:

| studyflix | App |
|---|---|
| Kategorie (7) | Feld `kategorie` am Lernweg |
| Kapitel / Playlist | Lernweg (`themen[]`-Eintrag) |
| Sub-Thema / Video | Schritt (`schritte[]`-Eintrag, Textname) |

### Die 7 Kategorien (feste Reihenfolge)

1. Mathematische Grundlagen
2. Algebra
3. Funktionen
4. Geometrie
5. Analysis
6. Stochastik
7. Angewandte Mathematik

### Lernweg-Struktur (`src/data/wissen.js`, Fach `mathe`, `themen[]`)

Bestehende Felder: `id`, `label`, `etappe`, `kbId`, `schritte[{text, fertig}]`.

Neu/erweitert:

```js
{
  id: "alg-einfache-gleichungen",      // global eindeutig im Fach
  label: "Einfache Gleichungen",        // = Kapitelname
  kategorie: "Algebra",                 // NEU: eine der 7 Kategorien
  kbId: "MAP-alg-einfache-gleichungen", // Netz-Lernweg: synthetischer, stabiler Schlüssel
  schritte: [
    { text: "Gleichungen", fertig: false },
    { text: "Gleichungen umstellen", fertig: false },
    { text: "Lineare Gleichungen", fertig: false }
    // ...
  ]
  // kein etappe-Feld (oder etappe: null) bei Netz-Lernwegen
}
```

- **Aktive Lernwege** (aktuelle Etappe): behalten ihren echten `kbId` aus
  `koennensbeweise.js` (z.B. `7MA1`) und ein `etappe`-Feld. Die 5 bestehenden
  Klasse-7-Lernwege (negative Zahlen) bekommen `kategorie: "Mathematische Grundlagen"`.
- **Netz-Lernwege** (Landkarte): synthetischer `kbId` nach Konvention `"MAP-" + id`.
  Dient nur als Schlüssel für den Lernstand, steht NICHT in `koennensbeweise.js`.

### Lernstand (unverändert)

- `neu.lernschritte` = `{ [kbId]: { [index]: bool } }`
- `neu.erledigt` = `{ [kbId]: true }`

Schritte abhaken läuft über die vorhandene Mechanik. Netz-Lernwege funktionieren
sofort über ihren synthetischen `kbId`, ohne Sonderbehandlung. `schrittFortschritt(thema)`
(`Ablage.jsx:53`) berechnet den Fortschritt bereits korrekt.

## Ablage-Ansicht (`src/neu/Ablage.jsx`, `Ablage.css`)

### Linke Liste: nach Kategorie gruppiert, einklappbar

- Die Lernweg-Liste (`ab-liste`) des Fachs Mathematik wird in 7 einklappbare
  Kategorie-Sektionen gegliedert (für andere Fächer ohne Kategorie unverändert flach).
- Default: eingeklappt (Reduktion). Aufklapp-Zustand pro Kategorie in localStorage
  (neuer Key, z.B. `neu.ablage.mathe.kategorien`).
- Kategorie-Kopfzeile: Name + Fortschritt, z.B. "Algebra · 2 von 8 Kapiteln".

### Gesamt-Überblick

- Über den Kategorien eine schmale Leiste: "Mathematik insgesamt: X von Y Schritten"
  plus 7 Mini-Balken (einer pro Kategorie). Aggregation aus `schrittFortschritt`
  über alle Mathe-Lernwege.

### Lernweg-Detail (rechts, weitgehend unverändert)

- Klick auf einen Lernweg zeigt rechts seine Schritte zum Abhaken und die Materialien
  (bei Netz-Lernwegen zunächst keine Materialien).
- **Aktiv-Markierung**: Lernwege, deren `kbId` in `koennensbeweise` existiert, bekommen
  ein dezentes "aktiv"-Label. Der Rest ist Landkarte.

### Nötige Code-Anpassung: KB-Lookup tolerant machen

`Ablage.jsx` (und `KbInhalt.jsx`) schlagen heute den KB über `kbId` in
`koennensbeweise` nach (`Ablage.jsx:504`). Bei Netz-Lernwegen ist dieser Lookup
`undefined`. Anpassen, sodass:
- kein Cluster/KB-Code-Badge gezeigt wird, wenn kein KB existiert,
- kein Zugriff auf `kb.cluster`/`kb.code` o.Ä. auf `undefined` passiert (Guard).

## Inhalt und Erzeugung

- Der Baum wird aus Standard-Lehrplan-Wissen generiert (deutsche Standard-Bezeichnungen),
  studyflix nur als Abgleich auf Vollständigkeit. Kein Scraping (ToS-/Copyright-Graubereich,
  technisch brüchig, marginaler Mehrwert).
- Umfang: alle 7 Kategorien, je Kategorie alle Kapitel der Schulmathematik, je Kapitel
  die Sub-Themen als Schritte (kein kuratierter Ausschnitt, der ganze Baum).
  Grobschätzung: ~100 Lernwege, mehrere hundert Schritte.
- Erzeugung kategorienweise, mit Gegenprüfung auf Vollständigkeit, Doppelungen und
  sinnvolle Schrittfolge, bevor die Daten in `wissen.js` landen.

## Bewusst NICHT im Scope

- Keine Videos, keine externen Links, kein eingebetteter Lerninhalt.
- Keine Etappen-/Planungs-Integration der Netz-Lernwege (sie erscheinen nicht in
  Heute/Wochenplan/Etappenplan).
- Kein Seeding von Materialien für Netz-Lernwege (starten leer).
- Keine neuen interaktiven Übungen für die Netz-Lernwege.
- Keine hierarchische Umstrukturierung von `wissen.js` (flaches `kategorie`-Feld
  statt Fach → Kategorie → Lernweg).

## Offene/ehrliche Punkte

- Der Gesamt-Zähler startet niedrig (die ganze Schulmathematik bis Abitur), das ist
  gewollt und wird als Landkarte gerahmt (Aktiv-Markierung + Kategorie-Balken), nicht
  als Versagen.
- Persona-Spannung: ein Klasse-7-Schüler sieht auch Oberstufen-Themen (Analysis,
  Stochastik). Bewusst akzeptiert als "die ganze Reise sichtbar".

## Betroffene Dateien

- `src/data/wissen.js` — neues Feld `kategorie`, viele neue Netz-Lernwege im Fach `mathe`.
- `src/neu/Ablage.jsx`, `src/neu/Ablage.css` — Kategorie-Gruppierung, Gesamt-Überblick,
  Aktiv-Markierung, KB-Lookup-Guard.
- `src/neu/KbInhalt.jsx` — KB-Lookup-Guard (Lernwege ohne echten KB).
- ggf. `src/neu/MaterialInhalt.jsx` falls vom KB-Objekt abhängig.
