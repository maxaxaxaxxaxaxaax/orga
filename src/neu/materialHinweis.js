// Coach-artiger Hinweis bei fehlendem Material. Zeigt NUR auf schon Vorhandenes
// (Materialien zum Thema, sonst verwandte Lernwege, sonst der Weg über den
// Lerncoach). Erfindet keinen Inhalt und gibt keine Lösung (Vision: KI als
// Coach, kein Antwort-Automat). Rein deterministisch, damit es immer funktioniert
// und nichts halluziniert wird.
import { COACH } from "./coach";

// Geschwister-Lernwege derselben Subkategorie (Fallback Kategorie), die echtes
// Material haben. So findet der Schüler verwandten Stoff, wo schon etwas liegt.
export function geschwisterMitMaterial(lw) {
  if (!lw?.fach?.themen || !lw.thema) return [];
  const gruppe = lw.thema.subkategorie || lw.thema.kategorie;
  if (!gruppe) return [];
  const mats = lw.fach.materialien || [];
  const ergebnis = [];
  for (const g of lw.fach.themen) {
    if (g.id === lw.thema.id) continue;
    if ((g.subkategorie || g.kategorie) !== gruppe) continue;
    const titel = mats.filter((m) => m.thema === g.label).map((m) => m.titel);
    if (titel.length) ergebnis.push({ label: g.label, materialTitel: titel });
  }
  return ergebnis;
}

export function materialHinweis({ lw, materialien, naechsterSchrittText }) {
  const schritt = (naechsterSchrittText || "").trim();
  const schrittSatz = schritt
    ? `Nimm dir als Nächstes diesen Schritt vor: ${schritt}.`
    : "";

  // 1) Material liegt direkt am Lernweg.
  if (materialien && materialien.length) {
    const titel = materialien.slice(0, 2).map((m) => m.titel);
    const liste = titel.length === 1 ? titel[0] : `${titel[0]} und ${titel[1]}`;
    return [`Schau zuerst hier rein: ${liste}.`, schrittSatz]
      .filter(Boolean)
      .join("\n");
  }

  // 2) Nichts direkt, aber ein verwandter Lernweg hat Material.
  const geschwister = geschwisterMitMaterial(lw);
  if (geschwister.length) {
    const g = geschwister[0];
    return [
      "Zu genau diesem Lernweg liegt noch nichts.",
      `Im verwandten Lernweg ${g.label} gibt es aber: ${g.materialTitel[0]}. Das hilft dir oft auch hier weiter.`,
      schrittSatz,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // 3) Gar nichts vorhanden: Brücke zum Lerncoach.
  return [
    "Hier liegt noch kein Material.",
    `Frag ${COACH} über den Knopf oben nach Material.`,
    schrittSatz ||
      "Hak so lange die Schritte einzeln ab, das bringt dich trotzdem weiter.",
  ]
    .filter(Boolean)
    .join("\n");
}
