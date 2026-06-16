import { kbFarbe } from "../data/koennensbeweise";
import "./KbChip.css";

// Ein Etappenziel als Chip: auf allen Planungs-Screens dasselbe Aussehen.
// Ziehbar (Laptop) UND antippbar (Touch): onTippen wählt einen Vorrat-Chip aus
// (dann eine Woche/einen Tag antippen), onZurueck legt einen platzierten Chip
// per Tippen zurück. gewaehlt = aktuell ausgewählt.
export default function KbChip({
  k,
  platziert,
  mitFach,
  gewaehlt,
  onDragStart,
  onDragEnd,
  onZurueck,
  onTippen,
  zahl, // überschreibt die Cluster-Zahl: Zahl anzeigen, oder null = ausblenden
  fortschritt, // optional { fertig, gesamt }: duenne Schritt-Fortschrittsleiste
}) {
  const zahlWert = zahl === undefined ? k.cluster : zahl;
  const zeigeFortschritt =
    fortschritt && fortschritt.gesamt > 0 && fortschritt.fertig > 0;
  const klickbar = !!onTippen || (platziert && !!onZurueck);
  function klick(e) {
    e.stopPropagation();
    if (onTippen) onTippen(k.id);
    else if (platziert && onZurueck) onZurueck(k.id);
  }
  return (
    <div
      className={
        "kbc" +
        (platziert ? " kbc-platziert" : "") +
        (gewaehlt ? " kbc-gewaehlt" : "")
      }
      draggable
      onDragStart={(e) => onDragStart(e, k.id)}
      onDragEnd={onDragEnd}
      onClick={klickbar ? klick : undefined}
      aria-pressed={onTippen ? !!gewaehlt : undefined}
      style={{ "--c": kbFarbe[k.fach] || "#868e96" }}
      title={
        gewaehlt
          ? `${k.code} · antippen zum Abwählen`
          : platziert
          ? `${k.code} · antippen, um zurückzulegen`
          : onTippen
          ? `${k.code} · antippen, dann eine Woche wählen`
          : `${k.code} · ${k.cluster} Clusterstunden`
      }
    >
      {mitFach && <span className="kbc-fach">{k.fach}</span>}
      <span className="kbc-titel">{k.titel}</span>
      {zahlWert != null && <span className="kbc-cluster">{zahlWert}</span>}
      {zeigeFortschritt && (
        <span className="kbc-fortschritt" aria-hidden="true">
          <span
            className="kbc-fortschritt-fuell"
            style={{ width: (fortschritt.fertig / fortschritt.gesamt) * 100 + "%" }}
          />
        </span>
      )}
    </div>
  );
}
