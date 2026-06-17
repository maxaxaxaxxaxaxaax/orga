// Pflicht-Wochenplanung: Etappenstart + Wochenstart. Persistiert pro Etappe
// und pro ISO-Woche in localStorage. Daten verzahnen sich mit lernschritte +
// erledigt (über lib/lernstand.js).
import { aktuelleEtappe } from "../data/etappen";
import { faecher } from "../data/wissen";
import { koennensbeweise } from "../data/koennensbeweise";
import { effektiveSchritte, themaStatus } from "./lernstand";

// ----- ISO-Wochen-Helper (deutsche Wochenlogik, Mo-So) -----

export function isoKW(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((t - first) / 86400000 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
}

// Eindeutiger Schlüssel pro ISO-Woche (für localStorage).
export function isoWocheKey(d) {
  return `${d.getFullYear()}-W${String(isoKW(d)).padStart(2, "0")}`;
}

// Wochentag-Index Mo=0 ... Fr=4, Sa=5, So=6.
export function wochentagIndex(d) {
  return (d.getDay() + 6) % 7;
}

export const wochentage = [
  { kurz: "Mo", lang: "Montag" },
  { kurz: "Di", lang: "Dienstag" },
  { kurz: "Mi", lang: "Mittwoch" },
  { kurz: "Do", lang: "Donnerstag" },
  { kurz: "Fr", lang: "Freitag" },
];

// ----- Storage-Keys -----

const ETAPPEN_KEY = (id) => `orga.etappenplan.${id}`;
const WOCHEN_KEY = (key) => `orga.wochenplan.${key}`;

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ----- Status-Lookups (für die App-Blocker-Logik) -----

export function aktuellerEtappenplanStatus(jetzt) {
  const etappe = aktuelleEtappe(jetzt);
  const o = safeRead(ETAPPEN_KEY(etappe.id), null);
  return { etappe, fertig: !!o?.fertig, plan: o?.plan || null };
}

export function aktuelleWocheStatus(jetzt) {
  const key = isoWocheKey(jetzt);
  const o = safeRead(WOCHEN_KEY(key), null);
  return {
    key,
    fertig: !!o?.fertig,
    skipped: !!o?.skipped,
    plan: o?.plan || null,
  };
}

// ----- Speichern -----

export function speichereEtappenplan(etappeId, plan) {
  localStorage.setItem(ETAPPEN_KEY(etappeId), JSON.stringify({ plan, fertig: true }));
}

export function speichereWochenplan(jetzt, plan, skipped = false) {
  const key = isoWocheKey(jetzt);
  localStorage.setItem(
    WOCHEN_KEY(key),
    JSON.stringify({ plan, fertig: true, skipped })
  );
}

// ----- Vorschläge fürs Wochenstart-Modal -----

// Welche Lernweg-Schritte könnten diese Woche sinnvoll dran sein?
// Heuristik: pro Fach das aktuelle (sonst erste upcoming) Thema, davon die
// nächsten 1-2 offenen Schritte.
export function vorgeschlageneWochenSchritte(ctx) {
  const ergebnis = [];
  for (const f of faecher) {
    const mitStatus = f.themen.filter((t) => !t.landkarte).map((t) => {
      const schritte = effektiveSchritte(f.id, t, ctx);
      return { f, t, schritte, status: themaStatus({ schritte }) };
    });
    const aktiv =
      mitStatus.find((x) => x.status === "current") ||
      mitStatus.find((x) => x.status === "upcoming");
    if (!aktiv) continue;
    const offen = aktiv.schritte.filter((s) => !s.fertig).slice(0, 2);
    for (const s of offen) {
      ergebnis.push({
        key: `${f.id}:${aktiv.t.id}:${s.idx}`,
        fachId: f.id,
        themaId: aktiv.t.id,
        idx: s.idx,
        fachName: f.fach,
        fachFarbe: f.farbe,
        themaLabel: aktiv.t.label,
        schrittText: s.text,
      });
    }
  }
  return ergebnis;
}

// Verteile gleichmäßig auf Mo-Fr (Round-Robin).
export function autoTagesverteilung(schritte) {
  const plan = {};
  schritte.forEach((s, i) => {
    plan[s.key] = i % 5;
  });
  return plan;
}

// ----- KB-Fertig-Status (vom Schüler manuell gesetzt) -----

const KB_FERTIG_KEY = (id) => `orga.kbFertig.${id}`;

export function istKbFertig(kbId) {
  return localStorage.getItem(KB_FERTIG_KEY(kbId)) === "true";
}
export function setzeKbFertig(kbId, fertig) {
  if (fertig) localStorage.setItem(KB_FERTIG_KEY(kbId), "true");
  else localStorage.removeItem(KB_FERTIG_KEY(kbId));
}

// ----- Wochen-Index innerhalb der Etappe -----

export function wocheInEtappe(jetzt, etappe) {
  if (!etappe) return 0;
  const von = new Date(etappe.von + "T00:00:00");
  const tage = Math.floor((jetzt - von) / 86400000);
  return Math.max(0, Math.floor(tage / 7));
}

// ----- KBs dieser Woche + Carry-overs aus vorherigen -----

// Aus dem aktuellen Etappenplan die KBs dieser Wochen-Position, plus alle
// nicht-fertigen KBs aus früheren Wochen der Etappe (übernommen).
export function aktiveKbsDieserWoche(jetzt) {
  const status = aktuellerEtappenplanStatus(jetzt);
  if (!status.fertig || !status.plan) {
    return { dieseWoche: [], carryOver: [], aktuelleWocheIdx: 0 };
  }
  const wocheIdx = wocheInEtappe(jetzt, status.etappe);
  const planEntries = Object.entries(status.plan); // [[kbId, wocheIdx], ...]

  const dieseWoche = [];
  const carryOver = [];
  for (const [kbId, weekIdx] of planEntries) {
    const kb = koennensbeweise.find((k) => k.id === kbId);
    if (!kb) continue;
    if (istKbFertig(kbId)) continue;
    if (weekIdx === wocheIdx) dieseWoche.push(kb);
    else if (weekIdx < wocheIdx) carryOver.push({ kb, ursprung: weekIdx });
  }
  return { dieseWoche, carryOver, aktuelleWocheIdx: wocheIdx };
}

// Wie viele KBs sind aus früheren Wochen offen geblieben (Lag-Indikator)?
export function etappenLag(jetzt) {
  const status = aktuellerEtappenplanStatus(jetzt);
  if (!status.fertig || !status.plan) return 0;
  const wocheIdx = wocheInEtappe(jetzt, status.etappe);
  let lag = 0;
  for (const [kbId, weekIdx] of Object.entries(status.plan)) {
    if (weekIdx < wocheIdx && !istKbFertig(kbId)) lag += 1;
  }
  return lag;
}

// Verteile Könnensbeweise auf die Wochen der Etappe (load-balancing nach Cluster-Stunden).
// pflichtId landet in Woche 0, gesperrtesFach wird ausgelassen.
export function autoEtappenverteilung(koennensbeweise, wochenAnzahl, pflichtId, gesperrtesFach) {
  const summen = Array.from({ length: wochenAnzahl }, () => 0);
  const result = {};
  for (const k of koennensbeweise) {
    if (k.fach === gesperrtesFach) continue;
    if (k.id === pflichtId) {
      result[k.id] = 0;
      summen[0] += k.cluster;
    }
  }
  const offen = koennensbeweise
    .filter((k) => k.fach !== gesperrtesFach && k.id !== pflichtId)
    .sort((a, b) => b.cluster - a.cluster);
  for (const k of offen) {
    let ziel = 0;
    for (let w = 1; w < wochenAnzahl; w++) {
      if (summen[w] < summen[ziel]) ziel = w;
    }
    result[k.id] = ziel;
    summen[ziel] += k.cluster;
  }
  return result;
}

// Welche KBs sind für einen bestimmten Wochentag geplant (Mo=0..Fr=4)?
// Liefert KB-Objekte plus fertig-Status; ohne Carry-over.
export function geplantFuerTag(jetzt, tag) {
  const status = aktuelleWocheStatus(jetzt);
  if (!status.fertig || status.skipped || !status.plan) return [];
  return Object.entries(status.plan)
    .filter(([, t]) => t === tag)
    .map(([kbId]) => koennensbeweise.find((k) => k.id === kbId))
    .filter(Boolean)
    .map((kb) => ({ kb, fertig: istKbFertig(kb.id) }));
}

// Welche KBs sind heute zu machen? Dazu gehören: die für heute geplanten KBs,
// plus alle nicht-fertigen KBs aus früheren Tagen dieser Woche (Tages-Carry-over).
export function heuteGeplanteKbs(jetzt) {
  const status = aktuelleWocheStatus(jetzt);
  if (!status.fertig || status.skipped || !status.plan) return [];
  const heute = wochentagIndex(jetzt);
  if (heute > 4) return []; // Sa/So: keine Tagesaufgaben
  const ergebnis = [];
  for (const [kbId, tag] of Object.entries(status.plan)) {
    const kb = koennensbeweise.find((k) => k.id === kbId);
    if (!kb) continue;
    const fertig = istKbFertig(kbId);
    if (tag === heute) {
      ergebnis.push({ kb, fertig, ursprungsTag: tag, istUebernommen: false });
    } else if (tag < heute && tag >= 0 && !fertig) {
      ergebnis.push({ kb, fertig: false, ursprungsTag: tag, istUebernommen: true });
    }
  }
  return ergebnis;
}

// Fortschritt für den Wochenrückblick: wie viele der geplanten KBs sind fertig?
export function wochenplanFortschritt(jetzt) {
  const status = aktuelleWocheStatus(jetzt);
  if (!status.fertig || status.skipped || !status.plan) return null;
  const keys = Object.keys(status.plan);
  if (keys.length === 0) return null;
  let fertig = 0;
  for (const kbId of keys) {
    if (istKbFertig(kbId)) fertig += 1;
  }
  return { fertig, gesamt: keys.length };
}

// ----- Wochenrückblick (vollautomatisch) -----

// Zählt erledigte Schritte und erledigte Aufgaben innerhalb der aktuellen ISO-Woche.
// Heuristik: wir können nicht wissen, wann ein Schritt fertig wurde (kein
// Timestamp), daher wertet die Funktion auf Basis des aktuellen Stands gegen
// einen Schnappschuss aus, der beim Wochenstart abgelegt wurde.
// Falls kein Schnappschuss vorhanden, wird der aktuelle Stand als 0-Basis genommen.
export function wochenrueckblick(ctx) {
  // Anzahl effektiv fertiger Schritte über alle Fächer.
  let fertig = 0;
  let gesamt = 0;
  for (const f of faecher) {
    for (const t of f.themen.filter((t) => !t.landkarte)) {
      for (const s of effektiveSchritte(f.id, t, ctx)) {
        gesamt += 1;
        if (s.fertig) fertig += 1;
      }
    }
  }
  return { fertig, gesamt };
}
