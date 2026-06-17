// Deterministische Arithmetik-Pruefung eines Rechenwegs. Ein lokales Sprachmodell
// verrechnet sich gelegentlich (es winkt Falsches durch oder erfindet Fehler bei
// Richtigem). Reine Zahlen-Rechenwege pruefen wir deshalb exakt selbst, mit einem
// kleinen eigenen Parser (kein eval, keine Abhaengigkeit). Das ist verlaesslich und
// sagt genau, an welcher Stelle es nicht aufgeht. Rechenwege mit Variablen oder
// Gleichungs-Umformungen sind so nicht eindeutig pruefbar: die uebernimmt das Modell.

// Wert eines reinen Zahlen-Ausdrucks (oder null, wenn nicht rein numerisch lesbar).
// Rekursiver Abstieg: Ausdruck = Term (+/-), Term = Faktor (*//), Faktor = Zahl,
// Klammer oder Vorzeichen. So gilt Punkt vor Strich und Klammern werden geachtet.
function evaluiere(ausdruck) {
  const s = ausdruck
    .replace(/[·×∙*]/g, "*")
    .replace(/[:÷/]/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, "");
  if (!s || !/^[0-9+\-*/(),.]+$/.test(s)) return null;
  let i = 0;
  const ende = () => i >= s.length;

  function ausdruckP() {
    let w = termP();
    if (w === null) return null;
    while (!ende() && (s[i] === "+" || s[i] === "-")) {
      const op = s[i++];
      const t = termP();
      if (t === null) return null;
      w = op === "+" ? w + t : w - t;
    }
    return w;
  }
  function termP() {
    let w = faktorP();
    if (w === null) return null;
    while (!ende() && (s[i] === "*" || s[i] === "/")) {
      const op = s[i++];
      const f = faktorP();
      if (f === null) return null;
      if (op === "/") {
        if (f === 0) return null;
        w = w / f;
      } else w = w * f;
    }
    return w;
  }
  function faktorP() {
    if (s[i] === "+") {
      i++;
      return faktorP();
    }
    if (s[i] === "-") {
      i++;
      const f = faktorP();
      return f === null ? null : -f;
    }
    if (s[i] === "(") {
      i++;
      const w = ausdruckP();
      if (w === null || s[i] !== ")") return null;
      i++;
      return w;
    }
    let j = i;
    while (i < s.length && /[0-9.,]/.test(s[i])) i++;
    if (i === j) return null;
    const n = parseFloat(s.slice(j, i).replace(",", "."));
    return isNaN(n) ? null : n;
  }

  const w = ausdruckP();
  return w === null || !ende() ? null : w;
}

// Prueft einen abgeschriebenen Rechenweg, der eine Kette von Gleichheiten ist
// (z.B. "(4-2)-2 = 2-2 = 0"). Rueckgabe:
//   { status: "richtig" }                         alle Zahlen-Gleichheiten gehen auf
//   { status: "falsch", schritt, vorher, nachher } erste Stelle, die nicht aufgeht
//   { status: "offen" }                            nicht deterministisch pruefbar
export function pruefeArithmetik(transkript) {
  if (!transkript || /\[unklar\]/i.test(transkript)) return { status: "offen" };
  // Gleichungs-Umformungen (mit | oder Pfeilen) sind keine reine Zahlen-Kette.
  if (/=>|⇒|→|\|/.test(transkript)) return { status: "offen" };

  const kette = transkript
    .replace(/\n/g, " ")
    .split("=")
    .map((teil) => teil.trim())
    .filter(Boolean);
  if (kette.length < 2) return { status: "offen" };

  const werte = kette.map(evaluiere);
  let vergleiche = 0;
  for (let k = 0; k < werte.length - 1; k++) {
    // Seiten mit Buchstaben (z.B. das Label "f(x)") sind null: die ueberspringen wir,
    // pruefen aber alle rein numerischen Uebergaenge dazwischen.
    if (werte[k] === null || werte[k + 1] === null) continue;
    vergleiche++;
    if (Math.abs(werte[k] - werte[k + 1]) > 1e-9) {
      return {
        status: "falsch",
        schritt: k + 1,
        vorher: kette[k],
        nachher: kette[k + 1],
      };
    }
  }
  if (!vergleiche) return { status: "offen" };
  return { status: "richtig" };
}
