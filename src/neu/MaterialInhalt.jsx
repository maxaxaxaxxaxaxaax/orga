import Karteikarten from "./Karteikarten";
import Zahlenstrahl from "./Zahlenstrahl";
import Merkblatt from "./Merkblatt";
import Lueckentext from "./Lueckentext";
import Zuordnung from "./Zuordnung";
import Reihenfolge from "./Reihenfolge";
import Auswahlquiz from "./Auswahlquiz";
import { interaktivFuerMaterial } from "./interaktiv";

// Leichter Text-Renderer für Materialien mit Volltext (Lernzettel u. ä.):
// "- " wird Stichpunkt, eine Zeile auf ":" wird kleine Überschrift.
function Textinhalt({ text }) {
  const zeilen = (text || "").split("\n");
  return (
    <div className="ma-inhalt">
      {zeilen.map((z, i) => {
        const t = z.trim();
        if (!t) return null;
        if (t.startsWith("- "))
          return (
            <p className="ma-punkt" key={i}>
              {t.slice(2)}
            </p>
          );
        if (t.endsWith(":"))
          return (
            <p className="ma-ueberschrift" key={i}>
              {t}
            </p>
          );
        return (
          <p className="ma-zeile" key={i}>
            {t}
          </p>
        );
      })}
    </div>
  );
}

// Dispatcher: wählt die passende Darstellung für ein Material. Interaktive
// Formate zuerst, dann Volltext, sonst ein ruhiger Platzhalter.
export default function MaterialInhalt({ material }) {
  const eintrag = interaktivFuerMaterial(material.id);
  if (eintrag?.typ === "karteikarten")
    return <Karteikarten daten={eintrag.daten} />;
  if (eintrag?.typ === "zahlenstrahl")
    return <Zahlenstrahl daten={eintrag.daten} />;
  if (eintrag?.typ === "merkblatt") return <Merkblatt daten={eintrag.daten} />;
  if (eintrag?.typ === "lueckentext")
    return <Lueckentext daten={eintrag.daten} />;
  if (eintrag?.typ === "zuordnung") return <Zuordnung daten={eintrag.daten} />;
  if (eintrag?.typ === "reihenfolge")
    return <Reihenfolge daten={eintrag.daten} />;
  if (eintrag?.typ === "auswahlquiz")
    return <Auswahlquiz daten={eintrag.daten} />;
  if (material.inhalt) return <Textinhalt text={material.inhalt} />;
  return (
    <p className="ma-leer">Für dieses Material gibt es noch keine Vorschau.</p>
  );
}
