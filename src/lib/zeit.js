// Gemeinsame Zeit- und Datums-Helfer, von mehreren Views genutzt.

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function formatTage(diffTage) {
  if (diffTage < 0) return "überfällig";
  if (diffTage === 0) return "heute";
  if (diffTage === 1) return "morgen";
  return `in ${diffTage} Tagen`;
}

export function tageBis(isoDatum, heute) {
  const ziel = new Date(isoDatum + "T00:00:00");
  const start = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate());
  return Math.round((ziel - start) / 86400000);
}

// Findet die aktuelle und die nächste Stunde anhand der Uhrzeit (in Minuten).
export function stundenStatus(stundenplan, jetztMin) {
  let aktuell = null;
  let naechste = null;
  for (const s of stundenplan) {
    const von = toMinutes(s.von);
    const bis = toMinutes(s.bis);
    if (jetztMin >= von && jetztMin < bis) aktuell = s;
    if (jetztMin < von && naechste === null) naechste = s;
  }
  return { aktuell, naechste };
}
