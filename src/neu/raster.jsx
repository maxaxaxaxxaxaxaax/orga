// Bausteine für den Raster-Ziehen-Prototyp (Hook in ./rasterZiehen).

// Greifpunkt am rechten Rand einer Box (die Box braucht position: relative).
// aktiv=true (während diese Kante gezogen wird) zeigt statt des Punkts eine dünne
// Linie über die ganze Box-Höhe an der Kante.
export function RasterGriff({ aktiv, ...props }) {
  return (
    <span
      className={"raster-griff" + (aktiv ? " aktiv" : "")}
      role="separator"
      aria-orientation="vertical"
      aria-label="Breite ziehen"
      {...props}
    />
  );
}

// Raster-Overlay (12 Spaltenbänder), nur beim Ziehen einblenden. `von` = erste
// Rasterlinie: 1 = ganze Breite, 2 = ohne die schmale Werkzeug-Spalte (Fokus).
export function RasterOverlay({ von = 1 }) {
  return (
    <div
      className="raster-overlay"
      style={{ gridColumn: `${von} / -1` }}
      aria-hidden="true"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span className="raster-overlay-spalte" key={i} />
      ))}
    </div>
  );
}
