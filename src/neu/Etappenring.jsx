// Etappenfortschritt: ein konzentrischer Ring je Fach (Fachfarbe). Jeder Ring ist
// ein vollständig geschlossener Kreis, in sich in die Wochen DIESES Fachs geteilt
// (Stückgröße nach Aufgabenzahl, mit Lücken). Alle Ringe starten oben am selben
// Punkt, sind aber je Fach unterschiedlich segmentiert. Track = offen, Füllung =
// erledigt; die aktuelle Woche ist dezent markiert. Mitte bleibt leer (Spiegeln
// statt Werten, VISION). Kein Gamification.
//
// Auf der kleinsten Box-Stufe (stufe === 1) wird stattdessen ein einzelner,
// glatt gefuellter Ring gezeigt, der nur den Stand der aktuellen Woche spiegelt
// (kein Aufteilen in Faecher/Segmente, ruhig wie der urspruengliche Ring).
const GROESSE = 240;
const MITTE = GROESSE / 2;
const RING_BREITE = 12;
const RING_GAP = 5; // Abstand zwischen den konzentrischen Fach-Ringen
const AUSSEN = MITTE - RING_BREITE / 2 - 2;
const LUECKE_PX = 20; // konstante Lücke in px, damit innen wie außen gleich aussieht

export default function Etappenring({ faecher, animiert, stufe, woche }) {
  const liste = faecher && faecher.length ? faecher : null;

  // Kleinste Stufe: ein einzelner Ring, der nur den Stand DIESER Woche spiegelt
  // (glatt gefüllt, ein Akzentton, keine Fächer/Segmente).
  if (stufe === 1) {
    const total = woche?.total || 0;
    const done = woche?.done || 0;
    const frac = total > 0 ? Math.max(0, Math.min(1, done / total)) : 0;
    const umfang = 2 * Math.PI * AUSSEN;
    const bogen = frac * umfang;
    return (
      <div className={"hu-ring-wrap" + (animiert ? " hu-ring-animiert" : "")}>
        <svg
          className="hu-ring"
          viewBox={`0 0 ${GROESSE} ${GROESSE}`}
          aria-hidden="true"
        >
          <g transform={`rotate(-90 ${MITTE} ${MITTE})`}>
            <circle
              cx={MITTE}
              cy={MITTE}
              r={AUSSEN}
              fill="none"
              stroke="var(--accent-soft)"
              strokeWidth={RING_BREITE}
            />
            {bogen > 0 && (
              <circle
                cx={MITTE}
                cy={MITTE}
                r={AUSSEN}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={RING_BREITE}
                strokeLinecap="round"
                strokeDasharray={`${bogen} ${umfang}`}
              />
            )}
          </g>
        </svg>
      </div>
    );
  }

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
              // Eigene Segmentierung: die Wochen dieses Fachs füllen den ganzen
              // Kreis (Größe nach Aufgabenzahl), mit Lücken dazwischen. Die Lücke
              // wird pro Ring aus festen px berechnet, damit sie innen wie außen
              // gleich groß aussieht.
              const luecke = LUECKE_PX / umfang;
              const fachTotal = f.wochen.reduce((s, w) => s + w.total, 0) || 1;
              const fachDone = f.wochen.reduce((s, w) => s + w.done, 0);
              const verfuegbar = Math.max(0.1, 1 - f.wochen.length * luecke);
              let cursor = 0;
              // Füllung läuft durchgehend von vorne durch die Segmente (wie der
              // frühere Ring den Gesamt-Fortschritt zeigte), nur jetzt sieht man
              // an den Stücken, in welcher Woche man steht.
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
                <g key={f.fach}>
                  {/* Tracks (offene Wochen-Stücke). */}
                  {segmente.map((s) => (
                    <circle
                      key={"t" + s.woche}
                      cx={MITTE}
                      cy={MITTE}
                      r={radius}
                      fill="none"
                      style={{
                        stroke: `color-mix(in srgb, ${f.color} ${
                          s.istAktuell ? 42 : 22
                        }%, var(--card))`,
                      }}
                      strokeWidth={RING_BREITE}
                      strokeLinecap="round"
                      strokeDasharray={`${s.len * umfang} ${umfang}`}
                      strokeDashoffset={`${-s.start * umfang}`}
                    />
                  ))}
                  {/* Fach-Markierung: farbiger Punkt oben am Ring-Start, damit man
                     jeden Ring seinem Fach zuordnen kann, auch ohne Fortschritt. */}
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
