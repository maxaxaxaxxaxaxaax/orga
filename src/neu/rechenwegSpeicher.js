// Handschriftlicher Aufschrieb pro Könnensbeweis UND pro Aufgabe/Schritt: die
// Striche (digitale Tinte) reload-fest sichern. Ein Strich ist
// { punkte: [{x, y, p}] } in Canvas-Koordinaten. Bewusst lokal (Datenhoheit).
//
// Frueher gab es nur einen Puffer pro kbId, den sich Mathe-Rechenweg und der
// allgemeine Aufschrieb teilten (sie ueberschrieben sich). Jetzt: pro Ziel
// mehrere "slots", z. B. "rechenweg" fuer den Mathe-Coach und "schritt-2" fuer
// den Aufschrieb zu einem bestimmten Lernweg-Schritt. So bleibt jede Aufgabe
// fuer sich.
const KEY = "neu.rechenweg"; // { [kbId]: { [slot]: [strich, ...] } }

function ladeAlle() {
  try {
    const r = localStorage.getItem(KEY);
    const v = r ? JSON.parse(r) : {};
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

// Slots eines Ziels lesen und gegen das Altformat absichern: frueher war der
// Wert direkt ein Striche-Array; das uebernehmen wir als Coach-Slot "rechenweg".
function slotsVon(alle, kbId) {
  const e = alle[kbId];
  if (Array.isArray(e)) return { rechenweg: e };
  return e && typeof e === "object" ? e : {};
}

export function ladeStriche(kbId, slot = "rechenweg") {
  const s = slotsVon(ladeAlle(), kbId)[slot];
  return Array.isArray(s) ? s : [];
}

export function speichereStriche(kbId, slot, striche) {
  const alle = ladeAlle();
  const slots = slotsVon(alle, kbId);
  if (Array.isArray(striche) && striche.length > 0) slots[slot] = striche;
  else delete slots[slot];
  if (Object.keys(slots).length > 0) alle[kbId] = slots;
  else delete alle[kbId];
  try {
    localStorage.setItem(KEY, JSON.stringify(alle));
  } catch {
    /* localStorage blockiert oder voll: dann nur diese Sitzung */
  }
}

export function hatRechenweg(kbId, slot = "rechenweg") {
  return ladeStriche(kbId, slot).length > 0;
}
