// Leitet den Lernstand eines Themas aus den Schritten seines Lernwegs ab.
// alle Schritte fertig = "done", einige = "current", keine = "upcoming".

export function lernwegStand(schritte = []) {
  const gesamt = schritte.length;
  const fertig = schritte.filter((s) => s.fertig).length;
  return { gesamt, fertig, naechster: schritte.findIndex((s) => !s.fertig) };
}

// Gibt "done" | "current" | "upcoming" zurück.
export function themaStatus({ schritte, hatMaterial }) {
  if (schritte && schritte.length) {
    const { gesamt, fertig } = lernwegStand(schritte);
    if (fertig >= gesamt) return "done";
    if (fertig > 0) return "current";
    return "upcoming";
  }
  return hatMaterial ? "done" : "upcoming";
}

// Effektiver Stand eines Schritts: manuelles Override > Vorgabe > gekoppelte
// Aufgabe erledigt. ctx = { lernschritte, erledigt, aufgaben }.
export function schrittFertig(fachId, themaId, idx, vorgabe, ctx = {}) {
  const { lernschritte = {}, erledigt = {}, aufgaben = [] } = ctx;
  const key = `${fachId}:${themaId}:${idx}`;
  if (lernschritte[key] !== undefined) return lernschritte[key];
  if (vorgabe) return true;
  return aufgaben.some(
    (a) =>
      a.lernweg &&
      a.lernweg.fachId === fachId &&
      a.lernweg.themaId === themaId &&
      a.lernweg.schritt === idx &&
      erledigt[a.id]
  );
}

// Schritte eines Themas mit effektivem Stand (inkl. idx).
export function effektiveSchritte(fachId, thema, ctx) {
  return (thema.schritte || []).map((s, idx) => ({
    ...s,
    idx,
    fertig: schrittFertig(fachId, thema.id, idx, s.fertig, ctx),
  }));
}

// Dynamischer KB-Stand pro Fach für die Stand-Kopfzeile: ein Lernweg gilt als
// erbrachter Könnensbeweis, wenn alle seine Schritte fertig sind. So bleiben
// die Zahlen immer konsistent zum echten Lernweg-Modell (kein Hardcoding).
// Lazy import: vermeidet Zyklus zwischen lib/lernstand und data/wissen.
export function fachKbStand(fach, ctx) {
  if (!fach) return { erbracht: 0, gesamt: 0 };
  let erbracht = 0;
  for (const t of fach.themen) {
    const s = effektiveSchritte(fach.id, t, ctx);
    if (s.length > 0 && s.every((x) => x.fertig)) erbracht++;
  }
  return { erbracht, gesamt: fach.themen.length };
}
