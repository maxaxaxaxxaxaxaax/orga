# Orgatool · Theresianum Mainz

Eine Lern-App-Konzeptstudie, maßgeschneidert für das **selbstständige Lernen am
Theresianum Mainz** (Ganztagsgymnasium, Orientierungs-/Mittelstufe). Sie bündelt
Organisation, Lernplanung und Wissen an einem Ort, damit Schüler:innen weniger Zeit mit
Orga und mehr mit dem eigentlichen Lernen verbringen.

Zielgruppe: Schüler:in der Klasse ~7 (12–14 Jahre), altsprachliches Profil
(Englisch · Latein · Griechisch), die selbstreguliert mit **Lernwegen, Etappen,
Clusterstunden und Könnensbeweisen** arbeitet und vom **Tutor/Lerncoach** begleitet wird.

## Bereiche

- **Dashboard (Kacheln)** – alles auf einen Blick, mit Schnellfunktionen
  (Datei per Drag & Drop ablegen, Schnellnotiz, Fokus-Timer). Umschaltbar zur Fokusansicht.
- **Heute** – „Mein Tag": aktuelle Stunde, heutige Aufgaben, nächster Könnensbeweis.
- **Stundenplan** – rhythmisierter Ganztag (Doppelstunden, Mittagessen, Studierzeit,
  FREI DAY, ZEuS), mit Anker-/Clusterstunden-Kennzeichnung.
- **Aufgaben** – Posteingang nach Dringlichkeit **und** Wochenplan: Könnensbeweise des
  Etappenplans auf die Wochen verteilen (Ziel ~10 Clusterstunden/Woche), inkl. Aufhol-Hilfe.
- **Wissen** – Themen als Netz (Obsidian-Stil) je Fach + Ringbuchordner (Unterricht /
  Selbstlernen) mit automatischer Einsortierung von Uploads und Verlauf.
- **Nachrichten** – ein Posteingang für Lehrkräfte, Lerncoach, Klasse, Schule.
- **Fortschritt** – Kompetenzstand statt Noten; erbrachte Könnensbeweise je Fach.
- **Show Mode** – geführte Vorführung des typischen Ablaufs.

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver (http://localhost:5173)
npm run build    # Produktions-Build nach dist/
npm run preview  # Build lokal ansehen
```

## Deployment

Reine statische Single-Page-App (Vite + React). `dist/` auf einem beliebigen
Static-Host veröffentlichen, z. B. **Cloudflare Pages**, **Netlify** oder **Vercel**
(Build: `npm run build`, Ausgabe-Verzeichnis: `dist`).

## Hinweise

- **Konzept/Prototyp**: Daten sind Beispieldaten; es gibt kein Backend. Eigene Eingaben
  (abgehakte Aufgaben, gelesene Nachrichten, Uploads) werden im **Browser
  (localStorage)** gespeichert und überstehen einen Reload.
- Tech: React + Vite, ohne weitere Laufzeit-Abhängigkeiten.
