import { koennensbeweise } from "../data/koennensbeweise";
import { lernwegFuerKb } from "../data/wissen";
import { ladeSchritte } from "./lernschritte";
import {
  lade,
  WOCHEN_KEY,
  ERLEDIGT_KEY,
  AKTUELLE_WOCHE,
  heuteTag,
  slotTag,
  ladeStunden,
  startScreen,
} from "./planung";

// Belegt ein KB an einem Wochentag mindestens eine Stunde?
function hatStundeAnTag(slotIds, tag) {
  return (slotIds || []).some((sid) => slotTag(sid) === tag);
}

// "Mein Weg": macht die ohnehin vorhandene Reihenfolge sichtbar.
// Zwei Phasen:
//  - Planung: der Drei-Schritte-Weg (Etappe -> Woche -> Heute) mit Status.
//  - Machen: sobald geplant ist, fallen diese Schritte weg. Stattdessen zeigt
//    die Leiste die Lernweg-Schritte des aktuellen Tagesziels als Fortschritt,
//    damit man immer sieht, wo man in der Aufgabe steht, an der man arbeitet.
const RANG = { etappe: 0, woche: 1, heute: 2 };

export function wegStatus() {
  const s = startScreen();
  const aktiv =
    s === "etappenplan" ? "etappe" : s === "wochenplan" ? "woche" : "heute";

  // Planungsphase: der sichtbare Drei-Schritte-Weg.
  if (aktiv !== "heute") {
    const stufe = RANG[aktiv];
    const schritt = (id, nr, label) => ({
      id,
      nr,
      label,
      status:
        RANG[id] < stufe ? "fertig" : RANG[id] === stufe ? "aktuell" : "offen",
    });
    const schritte = [
      schritt("etappe", 1, "Etappe planen"),
      schritt("woche", 2, "Woche planen"),
      schritt("heute", 3, "Übersicht"),
    ];
    const jetzt =
      aktiv === "etappe"
        ? { text: "Plane deine Etappe", ziel: "etappe" }
        : { text: "Plane deine Woche", ziel: "woche" };
    return { phase: "planung", aktiv, schritte, jetzt };
  }

  // Mach-Phase: das aktuelle (erste offene) Tagesziel mit seinen Lernweg-
  // Schritten als Fortschritt.
  const zuordnung = lade(WOCHEN_KEY);
  const stunden = ladeStunden();
  const erledigt = lade(ERLEDIGT_KEY);
  const ht = heuteTag();
  const heuteKbs = koennensbeweise.filter(
    (k) =>
      zuordnung[k.id] === AKTUELLE_WOCHE && hatStundeAnTag(stunden[k.id], ht)
  );
  const heuteGesamt = heuteKbs.length;
  const heuteFertig = heuteKbs.filter((k) => erledigt[k.id]).length;
  // Aktuelles Ziel: erst die offenen von heute, dann ein offener Nachzügler aus
  // einem früheren Tag (stilles Carry-over, siehe SCHULE.md Cluster 2 + 8).
  const frueher = nachzuegler();
  const ersterOffen = heuteKbs.find((k) => !erledigt[k.id]) || frueher[0] || null;

  // Nichts mehr offen: kurzer Endzustand statt einer Aufgabe.
  if (!ersterOffen) {
    const jetzt =
      heuteGesamt > 0
        ? { text: "Heute geschafft", ziel: "heute", fertig: true }
        : { text: "Für heute nichts geplant", ziel: "heute" };
    return { phase: "heute", aufgabe: null, heuteFertig, heuteGesamt, jetzt };
  }

  // Lernweg-Schritte des aktuellen Ziels mit eigenem Hak-Stand (Override vor
  // der Vorgabe aus wissen.js), gleiche Quelle wie Fokus und Ablage.
  const lw = lernwegFuerKb(ersterOffen.id);
  const roh = lw?.thema?.schritte || [];
  const stand = ladeSchritte(ersterOffen.id);
  const schritte = roh.map((st, i) => ({
    text: st.text,
    fertig: stand[i] != null ? stand[i] : !!st.fertig,
  }));
  const fertigeAnzahl = schritte.filter((x) => x.fertig).length;
  const aktuellerSchritt = schritte.findIndex((x) => !x.fertig);

  const aufgabe = {
    kbId: ersterOffen.id,
    titel: ersterOffen.titel,
    fach: ersterOffen.fach,
    schritte,
    fertigeAnzahl,
    gesamt: schritte.length,
    aktuellerSchritt,
  };
  const jetzt = {
    text: fertigeAnzahl > 0 ? "Weiter" : "Loslegen",
    ziel: "heute",
    kbId: ersterOffen.id,
  };
  return { phase: "heute", aufgabe, heuteFertig, heuteGesamt, jetzt };
}

// Die heute geplanten, noch offenen Ziele in Planungsreihenfolge. Quelle für die
// durchgehende Fokus-Session: ein Ziel fertig -> direkt ins nächste offene.
export function heuteOffeneZiele() {
  const zuordnung = lade(WOCHEN_KEY);
  const stunden = ladeStunden();
  const erledigt = lade(ERLEDIGT_KEY);
  const ht = heuteTag();
  return koennensbeweise.filter(
    (k) =>
      zuordnung[k.id] === AKTUELLE_WOCHE &&
      hatStundeAnTag(stunden[k.id], ht) &&
      !erledigt[k.id]
  );
}

// Nachzügler: noch offene Ziele aus früheren Tagen dieser Woche. Stilles
// Carry-over, damit liegengebliebene Arbeit nicht spurlos verschwindet, aber
// ohne Schuld-Ton (SCHULE.md Cluster 2 + 8).
export function nachzuegler() {
  const zuordnung = lade(WOCHEN_KEY);
  const stunden = ladeStunden();
  const erledigt = lade(ERLEDIGT_KEY);
  const ht = heuteTag();
  return koennensbeweise.filter((k) => {
    if (zuordnung[k.id] !== AKTUELLE_WOCHE || erledigt[k.id]) return false;
    const sids = stunden[k.id] || [];
    // Alle geplanten Stunden liegen in der Vergangenheit (nichts heute/künftig).
    return sids.length > 0 && sids.every((sid) => slotTag(sid) < ht);
  });
}
