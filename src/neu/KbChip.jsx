import { kbFarbe } from "../data/koennensbeweise";
import { textAuf } from "./farbe";
import "./KbChip.css";

// Ein Etappenziel als bunte Vollton-Kachel, exakt wie im Etappenplan (.ep-kb):
// Titel oben, darunter eine Meta-Zeile (Uhr-Symbol, offene Uhren, Code). Ziehbar
// (Laptop) und antippbar (Touch): onTippen wählt die Kachel aus, danach tippt man
// eine Stunde an. gewaehlt = aktuell ausgewählt. zahl überschreibt die Uhren-Zahl
// (im Wochenplan die noch offenen Stunden).
export default function KbChip({
  k,
  gewaehlt,
  onDragStart,
  onDragEnd,
  onTippen,
  zahl,
}) {
  const zahlWert = zahl === undefined ? k.cluster : zahl;
  const farbe = kbFarbe[k.fach] || "#868e96";
  return (
    <button
      type="button"
      className={"kbc" + (gewaehlt ? " kbc-gewaehlt" : "")}
      style={{ "--c": farbe, "--kbt": textAuf(farbe) }}
      draggable
      onDragStart={(e) => onDragStart(e, k.id)}
      onDragEnd={onDragEnd}
      onClick={
        onTippen
          ? (e) => {
              e.stopPropagation();
              onTippen(k.id);
            }
          : undefined
      }
      aria-pressed={onTippen ? !!gewaehlt : undefined}
      title={
        gewaehlt
          ? `${k.code} · antippen zum Abwählen`
          : `${k.code} · antippen, dann eine Stunde wählen`
      }
    >
      <span className="kbc-titel">{k.titel}</span>
      <span className="kbc-meta">
        <span className="kbc-uhr" aria-hidden="true">
          ◷
        </span>
        {zahlWert}
        {k.code && <span className="kbc-code">{k.code}</span>}
      </span>
    </button>
  );
}
