# Mathe-Themennetz in der Ablage: Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (empfohlen) oder superpowers:executing-plans, um diesen Plan Task für Task umzusetzen. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Goal:** Die gesamte Schulmathematik als trackbares Themennetz (7 Kategorien, Kapitel als Lernwege, Sub-Themen als Schritte) in der Ablage anzeigen, mit Gesamt-Fortschritt.

**Architecture:** Erweiterung des bestehenden Wissens-Netzes (`src/data/wissen.js`). Jeder Mathe-Lernweg bekommt ein Feld `kategorie`; Netz-Lernwege (nicht in der Etappe) bekommen zusätzlich `landkarte: true` und einen synthetischen `kbId`. Die Ablage gruppiert die Mathe-Lernwege nach Kategorie (einklappbar) und zeigt einen Gesamt-Fortschritt. Andere `wissen.js`-Verbraucher (Graph, Fortschritt, Suche, Einsortieren) filtern Landkarten-Lernwege, wo sie nicht hingehören. Der Datenbaum wird aus Lehrplan-Wissen generiert.

**Tech Stack:** Vite + React 19, kein Router, localStorage. **Kein Test-Runner im Projekt** (bewusst, siehe CLAUDE.md). Verifikation pro Task daher: `npm run lint` + `npm run build` müssen grün sein, plus gezielte `preview_eval`-Assertions im laufenden Dev-Server und Sichtprüfung. Commits häufig.

**Spec:** `docs/superpowers/specs/2026-06-17-mathe-themennetz-ablage-design.md`

---

## Datei-Struktur

- `src/data/wissen.js` — MODIFY: Feld `kategorie` an allen Mathe-Themen; viele neue Landkarten-Lernwege im Fach `mathe`; `landkarte: true` an Netz-Lernwegen.
- `src/data/matheKategorien.js` — CREATE: Konstante `MATHE_KATEGORIEN` (Reihenfolge der 7 Kategorien) + reine Validierungsfunktion `pruefeMatheNetz(faecher)`.
- `src/neu/Ablage.jsx` — MODIFY: linke Liste nach Kategorie gruppieren (einklappbar), Gesamt-Fortschritt, Aktiv-Markierung, Detail-Guard für Lernwege ohne echten KB.
- `src/neu/Ablage.css` — MODIFY: Stile für Kategorie-Sektionen, Gesamt-Leiste, Aktiv-Marker.
- `src/neu/KbInhalt.jsx` — MODIFY: tolerieren, dass ein Lernweg keinen echten KB hat (kein `cluster`/`code`).
- `src/neu/zeitmessung.js` — MODIFY (nur falls nötig): `zeitInfo(kb)` muss fehlendes `kb.cluster` vertragen.
- Verbraucher-Audit (READ + ggf. kleiner Filter): `src/neu/Fortschritt`-Quelle, `WissensGraph`, `GlobalSuche`-Äquivalent im neu-Branch, `einsortieren`-Äquivalent.

---

## Konventionen für jeden Task

- Deutsche Bezeichner/Texte, keine Gedankenstriche.
- Farben nur über CSS-Variablen.
- Verifikation: `npm run lint` und `npm run build` grün; UI per `preview_eval` prüfen.
- Der Dev-Server heißt in `.claude/launch.json` `schulhub` (mit preview_start starten).
- localStorage wird beim preview-Reload geleert: zum Navigieren NICHT `location.reload()` nutzen, sondern in-App klicken bzw. Module per dynamischem Import testen (`await import('/src/data/wissen.js?v='+performance.now())`).

---

### Task 1: Kategorie-Konstante und Validierung

**Files:**
- Create: `src/data/matheKategorien.js`

- [ ] **Schritt 1: Konstante + Validierung anlegen**

```js
// Die sieben Kategorien der Schulmathematik (Reihenfolge = Anzeige-Reihenfolge
// in der Ablage). Quelle: Standard-Lehrplan-Gliederung.
export const MATHE_KATEGORIEN = [
  "Mathematische Grundlagen",
  "Algebra",
  "Funktionen",
  "Geometrie",
  "Analysis",
  "Stochastik",
  "Angewandte Mathematik",
];

// Prüft das Mathe-Netz auf Integrität. Reine Funktion, im Browser/Node nutzbar.
// Gibt eine Liste von Fehlern zurück (leer = alles ok).
export function pruefeMatheNetz(faecher) {
  const fehler = [];
  const mathe = faecher.find((f) => f.id === "mathe");
  if (!mathe) return ["Fach 'mathe' fehlt"];
  const kbIds = new Set();
  const ids = new Set();
  for (const t of mathe.themen) {
    if (!t.id) fehler.push(`Thema ohne id: ${t.label}`);
    if (ids.has(t.id)) fehler.push(`Doppelte Thema-id: ${t.id}`);
    ids.add(t.id);
    if (!t.kbId) fehler.push(`Thema ohne kbId: ${t.id}`);
    if (kbIds.has(t.kbId)) fehler.push(`Doppelte kbId: ${t.kbId}`);
    kbIds.add(t.kbId);
    if (!t.kategorie) fehler.push(`Thema ohne kategorie: ${t.id}`);
    else if (!MATHE_KATEGORIEN.includes(t.kategorie))
      fehler.push(`Unbekannte kategorie '${t.kategorie}' bei ${t.id}`);
    if (!Array.isArray(t.schritte) || t.schritte.length === 0)
      fehler.push(`Thema ohne schritte: ${t.id}`);
  }
  return fehler;
}
```

- [ ] **Schritt 2: Lint + Build**

Run: `npm run lint && npm run build`
Expected: grün.

- [ ] **Schritt 3: Commit**

```bash
git add src/data/matheKategorien.js
git commit -F- <<'EOF'
Mathe-Netz: Kategorie-Konstante und Netz-Validierung

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: Bestehende Mathe-Lernwege kategorisieren

**Files:**
- Modify: `src/data/wissen.js` (Fach `mathe`, die 5 bestehenden `themen`)

- [ ] **Schritt 1: `kategorie` an die 5 bestehenden Themen ergänzen**

An jedem der 5 Mathe-Themen (`7MA1`..`7MA5`, negative Zahlen) das Feld `kategorie: "Mathematische Grundlagen"` ergänzen. Beispiel für den ersten:

```js
{
  id: "grundlagen",
  label: "Grundlagen negative Zahlen",
  etappe: 4,
  kbId: "7MA1",
  kategorie: "Mathematische Grundlagen",
  schritte: [ /* unverändert */ ],
}
```

Die echten KBs behalten ihren `kbId` und `etappe` und bekommen KEIN `landkarte`-Flag (sie sind aktiv).

- [ ] **Schritt 2: Validierung im Browser prüfen**

Dev-Server starten (preview_start `schulhub`), dann preview_eval:

```js
(async () => {
  const w = await import('/src/data/wissen.js?v=' + performance.now());
  const k = await import('/src/data/matheKategorien.js?v=' + performance.now());
  return k.pruefeMatheNetz(w.faecher);
})()
```
Expected: `[]` (keine Fehler).

- [ ] **Schritt 3: Lint + Build**

Run: `npm run lint && npm run build`
Expected: grün.

- [ ] **Schritt 4: Commit**

```bash
git add src/data/wissen.js
git commit -F- <<'EOF'
Mathe-Netz: bestehende Lernwege der Kategorie Grundlagen zuordnen

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: Detail-Guard fuer Lernwege ohne echten KB

Damit ein Landkarten-Lernweg (synthetischer `kbId`, nicht in `koennensbeweise.js`) in der Ablage geöffnet werden kann, ohne in den falschen Zweig zu fallen oder abzustürzen.

**Files:**
- Modify: `src/neu/Ablage.jsx:177-179` (gewaehltKb), `:551-574` (Detail-Zweig)
- Modify: `src/neu/KbInhalt.jsx` (kb ohne cluster/code tolerieren)
- Modify (nur falls Build/Run es zeigt): `src/neu/zeitmessung.js` (`zeitInfo` ohne `kb.cluster`)

- [ ] **Schritt 1: Vorübergehenden Landkarten-Lernweg zum Testen einfügen**

In `src/data/wissen.js` im Fach `mathe` EINEN Test-Lernweg ergänzen:

```js
{
  id: "test-landkarte",
  label: "Testkapitel Landkarte",
  kategorie: "Algebra",
  kbId: "MAP-test-landkarte",
  landkarte: true,
  schritte: [
    { text: "Testschritt eins", fertig: false },
    { text: "Testschritt zwei", fertig: false },
  ],
}
```

- [ ] **Schritt 2: Reproduzieren, dass das Öffnen heute scheitert**

preview_start, in die Ablage → Mathematik → "Testkapitel Landkarte" klicken (per preview_eval den Button mit dem Label klicken). Beobachten: Detail zeigt fälschlich "Alle Materialien" statt der Schritte (weil `gewaehltKb` null ist), oder ein Konsolenfehler.

- [ ] **Schritt 3: Ablage-Detail-Guard einbauen**

In `Ablage.jsx` die Detail-Bedingung von `gewaehlt && gewaehltKb` auf nur `gewaehlt` umstellen und einen Ersatz-KB bilden. Konkret:

`Ablage.jsx:177-179` lassen, darunter ergänzen:

```js
// Landkarten-Lernwege haben keinen echten KB. Ersatz-Objekt nur mit id/label,
// damit KbInhalt (das über kb.id den Lernweg findet) funktioniert.
const detailKb = gewaehltKb || (gewaehlt ? { id: gewaehlt.kbId, label: gewaehlt.label } : null);
```

Den Detail-Block (`Ablage.jsx:552`) von `gewaehlt && gewaehltKb ?` auf `gewaehlt ?` ändern und im Block `gewaehltKb` durch `detailKb` ersetzen. Die Meta-Zeile mit Code/Cluster nur zeigen, wenn ein echter KB existiert:

```jsx
{gewaehltKb && (
  <p className="ab-detail-meta">
    {gewaehltKb.code} · {gewaehltKb.cluster}{" "}
    <Begriff name="cluster">
      {gewaehltKb.cluster === 1 ? "Clusterstunde" : "Clusterstunden"}
    </Begriff>
  </p>
)}
```

Und `<KbInhalt key={detailKb.id} kb={detailKb} kompakt />`. Das "✓ erledigt"-Badge bezieht sich auf `erledigt[detailKb.id]`.

- [ ] **Schritt 4: KbInhalt gegen fehlenden KB härten**

In `KbInhalt.jsx` prüfen, wo `kb.cluster`/`kb.code` gelesen werden (u.a. `zeitInfo(kb)` Zeile 48). Jede solche Stelle gegen `undefined` absichern, z.B. eine "veranschlagte Zeit"-Anzeige nur rendern, wenn `kb.cluster` gesetzt ist. Falls `zeitmessung.js → zeitInfo` auf `kb.cluster` zugreift und ohne abstürzt: dort `const cluster = kb.cluster || 0;` als Fallback einsetzen. (Genaue Zeilen beim Umsetzen lesen.)

- [ ] **Schritt 5: Verifizieren, dass der Test-Lernweg jetzt korrekt öffnet**

preview_eval: in Mathematik den "Testkapitel Landkarte"-Button klicken, dann prüfen, dass rechts die zwei Testschritte erscheinen und ein Schritt abhakbar ist (Klick auf den Schritt, danach erneut lesen). Konsole ohne Fehler (`preview_console_logs` level error).

- [ ] **Schritt 6: Test-Lernweg wieder entfernen**

Den `test-landkarte`-Eintrag aus `wissen.js` löschen (war nur zum Verifizieren des Guards).

- [ ] **Schritt 7: Lint + Build**

Run: `npm run lint && npm run build`
Expected: grün.

- [ ] **Schritt 8: Commit**

```bash
git add src/neu/Ablage.jsx src/neu/KbInhalt.jsx src/neu/zeitmessung.js src/data/wissen.js
git commit -F- <<'EOF'
Ablage: Lernwege ohne echten Koennensbeweis sauber oeffnen

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 4: Verbraucher-Audit (Landkarte filtern wo noetig)

`wissen.js` wird breit gelesen. Landkarten-Lernwege sollen NICHT in Bereiche lecken, die nur die aktiven Lernwege meinen.

**Files (lesen, dann gezielt filtern):**
- Fortschritt-Quelle (aktive Lernwege je Fach)
- `WissensGraph` (Force-Layout der Knoten, Coach-Modus)
- Suche im neu-Branch (Ablage-Suche durchsucht `faecher.themen`)
- Einsortier-Logik (`einsortieren`-Äquivalent), falls vorhanden im neu-Branch

- [ ] **Schritt 1: Verbraucher finden**

Run (Grep): nach `\.themen` und `faecher` in `src/neu` und `src/lib` suchen. Jede Fundstelle einordnen: "will nur aktive Lernwege" → `landkarte` filtern; "Überblick/Suche" → darf alle zeigen.

- [ ] **Schritt 2: Fortschritt auf aktive Lernwege beschränken**

Wo die Fortschritts-/Stand-Anzeige die Lernwege eines Fachs ableitet: `themen.filter((t) => !t.landkarte)` einsetzen, damit der Kompetenzstand nicht von ~100 unbearbeiteten Landkarten-Lernwegen verwässert wird.

- [ ] **Schritt 3: Graph/Suche bewusst entscheiden**

- Wissens-Netz-Graph: Landkarten-Knoten würden den Graph überladen. Default: `landkarte` herausfiltern (der Graph zeigt das aktive Netz). Falls der Graph nur im Coach-Modus erscheint, ist das Risiko gering, trotzdem filtern.
- Ablage-Suche: darf Landkarten-Lernwege finden (das ist gewollt, "alles sichtbar"). Hier NICHT filtern.

- [ ] **Schritt 4: Verifizieren**

preview: Fortschritt/Stand zeigt weiterhin nur die echten Mathe-Lernwege; Graph (falls Coach-Modus) ist nicht überladen; Ablage-Suche findet ein Landkarten-Kapitel. Konsole fehlerfrei.

- [ ] **Schritt 5: Lint + Build + Commit**

Run: `npm run lint && npm run build` (grün), dann:

```bash
git add -A
git commit -F- <<'EOF'
Mathe-Netz: Landkarten-Lernwege aus Fortschritt und Graph filtern

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 5: Ablage links nach Kategorie gruppieren (einklappbar)

**Files:**
- Modify: `src/neu/Ablage.jsx` (linke Liste `ab-liste`, ab `:503`; State + Helper)
- Modify: `src/neu/Ablage.css`

- [ ] **Schritt 1: Klapp-Zustand als State + Persistenz**

In der `Ablage`-Komponente (bei den anderen `useState`, ~`:140`) ergänzen:

```js
const KAT_KEY = "neu.ablage.mathe.kategorien"; // oben bei GRUPPE_KEY/SORT_KEY
// eingeklappte Kategorien als Set (Default: alle eingeklappt ausser der ersten)
const [katOffen, setKatOffen] = useState(() => {
  try {
    const r = localStorage.getItem(KAT_KEY);
    return new Set(r ? JSON.parse(r) : ["Mathematische Grundlagen"]);
  } catch {
    return new Set(["Mathematische Grundlagen"]);
  }
});
function toggleKat(name) {
  setKatOffen((prev) => {
    const next = new Set(prev);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    try {
      localStorage.setItem(KAT_KEY, JSON.stringify([...next]));
    } catch {
      /* localStorage nicht verfuegbar */
    }
    return next;
  });
}
```

Import ergänzen: `import { MATHE_KATEGORIEN } from "../data/matheKategorien";`

- [ ] **Schritt 2: Den Lernweg-Button als Helfer herausziehen**

Den bestehenden Button-Render (`Ablage.jsx:514-547`) in eine lokale Funktion `function lernwegButton(t)` auslagern (genau derselbe JSX-Inhalt, mit `t` als Parameter), damit er sowohl flach als auch gruppiert genutzt werden kann.

- [ ] **Schritt 3: Liste gruppieren, wenn das Fach Kategorien hat**

In `ab-liste` nach dem "Alle Materialien"-Button:

```jsx
{fach.themen.some((t) => t.kategorie) ? (
  MATHE_KATEGORIEN.map((kat) => {
    const wege = fach.themen.filter((t) => t.kategorie === kat);
    if (!wege.length) return null;
    const offen = katOffen.has(kat);
    const erledigteWege = wege.filter((t) => {
      const f = schrittFortschritt(t);
      return f && f.fertig === f.gesamt;
    }).length;
    return (
      <div className="ab-kat" key={kat}>
        <button
          type="button"
          className="ab-kat-kopf"
          onClick={() => toggleKat(kat)}
          aria-expanded={offen}
        >
          <span className="ab-kat-pfeil" aria-hidden="true">
            {offen ? "▾" : "▸"}
          </span>
          <span className="ab-kat-name">{kat}</span>
          <span className="ab-kat-stand">
            {erledigteWege} / {wege.length}
          </span>
        </button>
        {offen && wege.map((t) => lernwegButton(t))}
      </div>
    );
  })
) : (
  fach.themen.map((t) => lernwegButton(t))
)}
```

- [ ] **Schritt 4: CSS für Kategorie-Sektionen**

In `Ablage.css` ergänzen (Variablen nutzen):

```css
.ab-kat { display: flex; flex-direction: column; }
.ab-kat-kopf {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border: none; background: none; cursor: pointer;
  color: var(--text-2); font-weight: 700; font-size: 0.82rem; text-align: left;
}
.ab-kat-kopf:hover { color: var(--text); }
.ab-kat-name { flex: 1; }
.ab-kat-stand { color: var(--muted); font-weight: 600; }
.ab-kat-pfeil { width: 1em; color: var(--muted); }
```

- [ ] **Schritt 5: Verifizieren**

preview: in Mathematik erscheinen 7 einklappbare Kategorie-Sektionen, Default nur "Mathematische Grundlagen" offen; Klick auf einen Kopf klappt auf/zu; in anderen Fächern (z.B. Latein) bleibt die Liste flach (kein `kategorie`). Konsole fehlerfrei.

- [ ] **Schritt 6: Lint + Build + Commit**

Run grün, dann:

```bash
git add src/neu/Ablage.jsx src/neu/Ablage.css
git commit -F- <<'EOF'
Ablage: Mathe-Lernwege nach Kategorie gruppieren (einklappbar)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 6: Gesamt-Fortschritt ueber das Mathe-Netz

**Files:**
- Modify: `src/neu/Ablage.jsx` (Gesamt-Leiste über den Kategorien), `Ablage.css`

- [ ] **Schritt 1: Aggregation berechnen**

In `Ablage.jsx` als lokale Funktion (neben `schrittFortschritt`):

```js
// Gesamt-Fortschritt eines Fachs: alle Schritte aller Lernwege zusammen.
function fachGesamt(themen) {
  let fertig = 0;
  let gesamt = 0;
  for (const t of themen) {
    const f = schrittFortschritt(t);
    if (f) {
      fertig += f.fertig;
      gesamt += f.gesamt;
    }
  }
  return { fertig, gesamt };
}
```

- [ ] **Schritt 2: Gesamt-Leiste rendern**

Direkt über der Kategorie-Liste in `ab-liste` (nur wenn das Fach Kategorien hat):

```jsx
{fach.themen.some((t) => t.kategorie) && (() => {
  const g = fachGesamt(fach.themen);
  return (
    <div className="ab-gesamt">
      <span className="ab-gesamt-text">
        {fach.fach} insgesamt: {g.fertig} von {g.gesamt} Schritten
      </span>
      <span className="ab-gesamt-balken" aria-hidden="true">
        <span
          className="ab-gesamt-fuell"
          style={{ width: (g.gesamt ? (g.fertig / g.gesamt) * 100 : 0) + "%" }}
        />
      </span>
    </div>
  );
})()}
```

- [ ] **Schritt 3: CSS**

```css
.ab-gesamt { padding: 8px 10px 12px; }
.ab-gesamt-text { display: block; font-size: 0.78rem; color: var(--text-2); margin-bottom: 6px; }
.ab-gesamt-balken { display: block; height: 6px; border-radius: 999px; background: var(--line); overflow: hidden; }
.ab-gesamt-fuell { display: block; height: 100%; background: var(--accent); }
```

- [ ] **Schritt 4: Verifizieren**

preview: über den Kategorien steht "Mathematik insgesamt: X von Y Schritten" mit Balken; nach Abhaken eines Schritts (in einem Lernweg) steigt X beim erneuten Öffnen der Ablage. Konsole fehlerfrei.

- [ ] **Schritt 5: Lint + Build + Commit**

```bash
git add src/neu/Ablage.jsx src/neu/Ablage.css
git commit -F- <<'EOF'
Ablage: Gesamt-Fortschritt ueber das Mathe-Netz anzeigen

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 7: Aktiv-Markierung der Etappen-Lernwege

**Files:**
- Modify: `src/neu/Ablage.jsx` (im `lernwegButton`-Helfer), `Ablage.css`

- [ ] **Schritt 1: Aktiv-Status im Button**

Im `lernwegButton(t)`-Helfer: `t` ist aktiv, wenn ein echter KB existiert (`koennensbeweise.find((k) => k.id === t.kbId)`) und `!t.landkarte`. Ein dezentes Label hinter dem Titel:

```jsx
{!t.landkarte && koennensbeweise.some((k) => k.id === t.kbId) && (
  <span className="ab-zeile-aktiv" title="In dieser Etappe aktiv">aktiv</span>
)}
```

- [ ] **Schritt 2: CSS**

```css
.ab-zeile-aktiv {
  font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--ok-text); background: var(--ok-bg); border: 1px solid var(--ok-text);
  padding: 1px 6px; border-radius: 999px;
}
```

- [ ] **Schritt 3: Verifizieren**

preview: die 5 negative-Zahlen-Lernwege tragen ein "aktiv"-Label, die Landkarten-Lernwege nicht. Konsole fehlerfrei.

- [ ] **Schritt 4: Lint + Build + Commit**

```bash
git add src/neu/Ablage.jsx src/neu/Ablage.css
git commit -F- <<'EOF'
Ablage: aktive Etappen-Lernwege im Mathe-Netz markieren

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 8: Den vollstaendigen Themenbaum generieren und einsetzen

Die eigentlichen Daten: alle 7 Kategorien, je Kategorie die Kapitel als Landkarten-Lernwege, je Kapitel die Sub-Themen als Schritte. Aus Lehrplan-Wissen erzeugt, studyflix nur als Abgleich.

**Files:**
- Modify: `src/data/wissen.js` (Fach `mathe`, `themen` um die Landkarten-Lernwege erweitern)

- [ ] **Schritt 1: Baum generieren (kategorienweise, mit Gegenpruefung)**

Pro Kategorie die Kapitel + Sub-Themen erzeugen. Schema je Lernweg:

```js
{
  id: "alg-einfache-gleichungen",          // global eindeutig, kebab, kategorie-Praefix
  label: "Einfache Gleichungen",
  kategorie: "Algebra",
  kbId: "MAP-alg-einfache-gleichungen",     // "MAP-" + id
  landkarte: true,
  schritte: [
    { text: "Gleichungen", fertig: false },
    { text: "Gleichungen umstellen", fertig: false },
    { text: "Lineare Gleichungen", fertig: false },
  ],
}
```

Regeln: deutsche Standard-Themennamen; `id` und `kbId` global eindeutig; jede der 7 Kategorien vertreten; "Mathematische Grundlagen" enthält auch die bestehenden negative-Zahlen-Lernwege (nicht doppeln). Umfang: der ganze Baum (kein kuratierter Ausschnitt). Bei Ultracode: Generierung als Workflow (ein Agent je Kategorie erzeugt die Kapitel+Schritte, ein Prüf-Agent checkt Vollständigkeit, Doppelungen, sinnvolle Reihenfolge), dann zusammenführen.

- [ ] **Schritt 2: In `wissen.js` einsetzen**

Die generierten Lernwege in `faecher`-Fach `mathe` an `themen` anhängen (die 5 bestehenden bleiben vorn).

- [ ] **Schritt 3: Integritaet validieren**

preview_eval:

```js
(async () => {
  const w = await import('/src/data/wissen.js?v=' + performance.now());
  const k = await import('/src/data/matheKategorien.js?v=' + performance.now());
  const mathe = w.faecher.find((f) => f.id === 'mathe');
  return { fehler: k.pruefeMatheNetz(w.faecher), anzahlLernwege: mathe.themen.length };
})()
```
Expected: `fehler: []`, `anzahlLernwege` plausibel groß (grob 80 bis 120).

- [ ] **Schritt 4: Sichtpruefung**

preview: Ablage → Mathematik. Alle 7 Kategorien erscheinen mit plausibler Kapitelzahl; aufklappen zeigt die Lernwege; ein Lernweg öffnet seine Schritte; Gesamt-Leiste zeigt eine große Gesamtzahl. `preview_console_logs` level error: leer.

- [ ] **Schritt 5: Lint + Build**

Run: `npm run lint && npm run build`
Expected: grün. (Achtung Bundle-Größe: viele Daten, aber statisch, unkritisch.)

- [ ] **Schritt 6: Commit**

```bash
git add src/data/wissen.js
git commit -F- <<'EOF'
Mathe-Netz: vollstaendigen Themenbaum (7 Kategorien) als Landkarten-Lernwege

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

## Self-Review (vom Plan-Autor)

- **Spec-Abdeckung:** Kategorie-Feld (Task 2,8), Netz-Lernwege ohne KB (Task 3), Trennung Netz/Etappe + kein Lecken in Heute/Planung (Task 4), Ablage-Gruppierung einklappbar (Task 5), Gesamt-Fortschritt (Task 6), Aktiv-Markierung (Task 7), Datenbaum generiert ohne Scraping (Task 8). Alles abgedeckt.
- **Über die Spec hinaus ergänzt:** `landkarte`-Flag + Verbraucher-Audit (Task 4), weil `wissen.js` breiter gelesen wird als nur von der Ablage. Das war in der Spec implizit ("nicht in Heute/Planung"), hier explizit gemacht.
- **Keine Videos/externen Links** (Schritte sind Textnamen): durchgehalten.
- **Verifikation** an das Projekt angepasst (kein Test-Runner): lint + build + preview_eval + Sichtprüfung statt Unit-Tests.
- **Offene Präzisierung bei Umsetzung:** in Task 3 (KbInhalt/zeitmessung) und Task 4 (Verbraucher) werden die exakten Zeilen beim Lesen der Dateien final gesetzt; Mechanismus (Ersatz-KB-Objekt, `landkarte`-Filter) ist festgelegt.
