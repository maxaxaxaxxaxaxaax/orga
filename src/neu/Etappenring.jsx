// Etappenfortschritt: ein konzentrischer Ring je Fach (Fachfarbe), durchgehend
// gefüllt nach Anteil erledigter Etappenziele (anteilig, auch in Arbeit). Die
// Form bleibt über alle Box-Breiten gleich; nur die Füllung wächst sanft mit dem
// Fortschritt (per stroke-dasharray-Transition, siehe .hu-ring-animiert), kein
// Springen, keine Segmente. Track = heller Fachton, ein farbiger Punkt markiert
// jeden Ring auch ohne Fortschritt. Mitte bleibt leer (Spiegeln statt Werten,
// VISION). Kein Gamification.
const GROESSE = 240;
const MITTE = GROESSE / 2;
const RING_BREITE = 12;
const RING_GAP = 5; // Abstand zwischen den konzentrischen Fach-Ringen
const AUSSEN = MITTE - RING_BREITE / 2 - 2;

export default function Etappenring({ faecher, animiert }) {
  const liste = faecher && faecher.length ? faecher : null;

  return (
    <div className={"hu-ring-wrap" + (animiert ? " hu-ring-animiert" : "")}>
      <svg
        className="hu-ring"
        viewBox={`0 0 ${GROESSE} ${GROESSE}`}
        aria-hidden="true"
      >
        <g transform={`rotate(-90 ${MITTE} ${MITTE})`}>
          {!liste && (
            <circle
              cx={MITTE}
              cy={MITTE}
              r={AUSSEN}
              fill="none"
              stroke="var(--line)"
              strokeWidth={RING_BREITE}
            />
          )}
          {liste &&
            liste.map((f, i) => {
              const radius = AUSSEN - i * (RING_BREITE + RING_GAP);
              if (radius < RING_BREITE) return null;
              const umfang = 2 * Math.PI * radius;
              // Anteil der ganzen Etappe für dieses Fach (anteilig, auch in
              // Arbeit). Der Bogen wächst von vorne, ein durchgehender Ring.
              const fachTotal = f.wochen.reduce((s, w) => s + w.total, 0) || 1;
              const fachDone = f.wochen.reduce((s, w) => s + w.done, 0);
              const frac = Math.max(0, Math.min(1, fachDone / fachTotal));
              const bogen = frac * umfang;
              return (
                <g key={f.fach} className="hu-ring-fach">
                  {/* Offener Ring in hellem Fachton. */}
                  <circle
                    cx={MITTE}
                    cy={MITTE}
                    r={radius}
                    fill="none"
                    style={{
                      stroke: `color-mix(in srgb, ${f.color} 22%, var(--card))`,
                    }}
                    strokeWidth={RING_BREITE}
                  />
                  {/* Fach-Punkt am Ring-Start: ordnet jeden Ring seinem Fach zu,
                     auch ohne Fortschritt. */}
                  <circle
                    cx={MITTE}
                    cy={MITTE}
                    r={radius}
                    fill="none"
                    stroke={f.color}
                    strokeWidth={RING_BREITE}
                    strokeLinecap="round"
                    strokeDasharray={`0.1 ${umfang}`}
                  />
                  {/* Füllung: durchgehender Bogen, IMMER gerendert (bei 0 deckungs-
                     gleich mit dem Punkt), damit er beim Fortschritt sanft von vorne
                     wächst statt zu springen. */}
                  <circle
                    cx={MITTE}
                    cy={MITTE}
                    r={radius}
                    fill="none"
                    stroke={f.color}
                    strokeWidth={RING_BREITE}
                    strokeLinecap="round"
                    strokeDasharray={`${bogen} ${umfang}`}
                  />
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
}
