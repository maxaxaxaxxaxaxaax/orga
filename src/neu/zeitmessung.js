import { koennensbeweise } from "../data/koennensbeweise";
import { lade, ERLEDIGT_KEY } from "./planung";

// Datenbasierte Zeiteinschätzung: die App misst still die Lernzeit pro Ziel
// (solange dessen Inhalt offen ist) und leitet daraus einen persönlichen Faktor
// ab. Damit wird aus der pauschalen Cluster-Vorgabe eine realistische Zeit
// "für dich", statt der oft ungenauen Lehrer-Schätzung ("Uhren", siehe SCHULE.md).

const KEY = "neu.zeit"; // kbId -> kumulierte Sekunden
const MIN_PRO_CLUSTER = 45; // Richtwert: 1 Clusterstunde ~ 45 Min (eine "Uhr")

export function ladeZeiten() {
  try {
    const r = localStorage.getItem(KEY);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
}

export function addSekunden(id, sekunden) {
  if (!id || !sekunden || sekunden < 1) return;
  const z = ladeZeiten();
  z[id] = (z[id] || 0) + Math.round(sekunden);
  localStorage.setItem(KEY, JSON.stringify(z));
}

export function gemesseneSekunden(id) {
  return ladeZeiten()[id] || 0;
}

// Persönlicher Faktor: wie viel länger oder kürzer der Schüler im Schnitt
// braucht als die Cluster-Schätzung. Nur aus erledigten Zielen mit gemessener
// Zeit, und erst ab zwei Datenpunkten (sonst zu wackelig).
export function persoenlicherFaktor() {
  const z = ladeZeiten();
  const erledigt = lade(ERLEDIGT_KEY);
  const ratios = [];
  for (const k of koennensbeweise) {
    if (!erledigt[k.id] || !k.cluster) continue;
    const sek = z[k.id];
    if (!sek) continue;
    ratios.push(sek / 60 / (k.cluster * MIN_PRO_CLUSTER));
  }
  if (ratios.length < 2) return null;
  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

// Zeit-Infos für ein Ziel: Plan, persönlich-realistische Minuten (oder null,
// wenn noch zu wenig Daten), bisher gemessene Sekunden.
export function zeitInfo(kb) {
  const faktor = persoenlicherFaktor();
  const geplantMin = (kb.cluster || 0) * MIN_PRO_CLUSTER;
  return {
    geplantMin,
    realistischMin: faktor ? Math.round(geplantMin * faktor) : null,
    gelerntSek: gemesseneSekunden(kb.id),
  };
}

export function formatMin(min) {
  if (min < 1) return "unter 1 min";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} Std ${m} min` : `${h} Std`;
}
