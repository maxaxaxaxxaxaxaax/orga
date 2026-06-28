// Etappenfortschritt: ein konzentrischer Ring je Fach (Fachfarbe), in die Wochen
// DIESES Fachs geteilt (Stückgröße nach Aufgabenzahl). Die Lücken zwischen den
// Wochen-Stücken sind variabel: gapFaktor 0 = Lücken zu (ein glatter, durchgehender
// Kreis), gapFaktor 1 = volle Lücken (segmentiert). Beim Ziehen wächst der Faktor
// kontinuierlich, dadurch MORPHT der Ring vom glatten Kreis in die Segmente. Die
// Füllung (anteilig, auch in Arbeit) läuft durchgehend von vorne und wächst sanft
// mit dem Fortschritt. Track = heller Fachton, farbiger Punkt am Start ordnet jeden
// Ring seinem Fach zu. Mitte bleibt leer (Spiegeln statt Werten, VISION).
const GROESSE = 240;
const MITTE = GROESSE / 2;
const RING_BREITE = 12;
const RING_GAP = 5; // Abstand zwischen den konzentrischen Fach-Ringen
const AUSSEN = MITTE - RING_BREITE / 2 - 2;
const LUECKE_PX = 20; // volle Segment-Lücke in px (bei gapFaktor 1)

export default function Etappenring({ faecher, animiert, gapFaktor = 1 }) {
  const liste = faecher && faecher.length ? faecher : null;
  const gf = Math.max(0, Math.min(1, gapFaktor));

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
              // Variable Lücke: bei gapFaktor 0 sind die Stücke zu (glatter Kreis),
              // bei 1 volle Lücke. Per fester px-Lücke, damit innen wie außen gleich.
              const luecke = (gf * LUECKE_PX) / umfang;
              const fachTotal = f.wochen.reduce((s, w) => s + w.total, 0) || 1;
              const fachDone = f.wochen.reduce((s, w) => s + w.done, 0);
              const verfuegbar = Math.max(0.1, 1 - f.wochen.length * luecke);
              let cursor = 0;
              let restDone = fachDone;
              const segmente = f.wochen.map((w) => {
                const len = (w.total / fachTotal) * verfuegbar;
                const start = cursor;
                cursor += len + luecke;
                const fuellKbs = Math.max(0, Math.min(w.total, restDone));
                restDone -= fuellKbs;
                const fuellLen = (fuellKbs / fachTotal) * verfuegbar;
                return { ...w, start, len, fuellLen };
              });
              return (
                <g key={f.fach} className="hu-ring-fach">
                  {/* Tracks (offene Wochen-Stücke). Die aktuelle Woche hebt sich
                     dezent ab, aber erst wenn die Segmente da sind (gapFaktor). */}
                  {segmente.map((s) => (
                    <circle
                      key={"t" + s.woche}
                      cx={MITTE}
                      cy={MITTE}
                      r={radius}
                      fill="none"
                      style={{
                        stroke: `color-mix(in srgb, ${f.color} ${
                          22 + (s.istAktuell ? gf * 20 : 0)
                        }%, var(--card))`,
                      }}
                      strokeWidth={RING_BREITE}
                      strokeLinecap="round"
                      strokeDasharray={`${s.len * umfang} ${umfang}`}
                      strokeDashoffset={`${-s.start * umfang}`}
                    />
                  ))}
                  {/* Fach-Punkt am Ring-Start (Zuordnung auch ohne Fortschritt). */}
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
                  {/* Füllungen (erledigt, durchgehend von vorne). */}
                  {segmente.map((s) =>
                    s.fuellLen > 0 ? (
                      <circle
                        key={"f" + s.woche}
                        cx={MITTE}
                        cy={MITTE}
                        r={radius}
                        fill="none"
                        stroke={f.color}
                        strokeWidth={RING_BREITE}
                        strokeLinecap="round"
                        strokeDasharray={`${s.fuellLen * umfang} ${umfang}`}
                        strokeDashoffset={`${-s.start * umfang}`}
                      />
                    ) : null
                  )}
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
}
