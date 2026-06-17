// Handschriftlicher Rechenweg pro Könnensbeweis: die Striche (digitale Tinte)
// reload-fest sichern. Ein Strich ist { punkte: [{x, y, p}] } in Canvas-Koordinaten.
// Bewusst lokal (Datenhoheit), wie der übrige Lernstand.
const KEY = "neu.rechenweg"; // { [kbId]: [strich, ...] }

function ladeAlle() {
  try {
    const r = localStorage.getItem(KEY);
    const v = r ? JSON.parse(r) : {};
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function ladeStriche(kbId) {
  const s = ladeAlle()[kbId];
  return Array.isArray(s) ? s : [];
}

export function speichereStriche(kbId, striche) {
  const alle = ladeAlle();
  if (Array.isArray(striche) && striche.length > 0) alle[kbId] = striche;
  else delete alle[kbId];
  try {
    localStorage.setItem(KEY, JSON.stringify(alle));
  } catch {
    /* localStorage blockiert oder voll: dann nur diese Sitzung */
  }
}

export function hatRechenweg(kbId) {
  return ladeStriche(kbId).length > 0;
}
