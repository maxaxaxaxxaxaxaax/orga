// Welche Etappenziele haben eine interaktive Übung (Quiz-Generator)?
// Geteilt von Heute (Badge) und KbDetail (Quiz).
export const GENERATOR_FUER_KB = {
  "7MA1": "negativeZahlen",
  "7MA2": "negativeZahlen",
  "7MA3": "negativeMultDiv",
  "7LA2": "ACILatein",
  "7EA3": "willFuture",
  "7GA1": "griechAlphabet",
};

export function generatorFuerKb(kbId) {
  return GENERATOR_FUER_KB[kbId] || null;
}
