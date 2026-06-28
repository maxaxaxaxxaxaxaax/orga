// Etappenfortschritt: ein konzentrischer Ring je Fach (Fachfarbe), der ganze
// Kreis in gemeinsame Wochen-Stücke geteilt (Größe nach Aufgabenzahl, mit Lücken).
// In jedem Wochen-Stück zeigt jeder Fach-Ring, wie weit dieses Fach in der Woche
// ist (Track = offen, gefüllt = erledigt). Die aktuelle Woche ist dezent markiert,
// damit man pro Fach und gesamt sieht, was diese Woche noch fehlt. Mitte bleibt
// leer (Spiegeln statt Werten, VISION). Kein Gamification.
const GROESSE = 240;
const MITTE = GROESSE / 2;
const RING_BREITE = 12;
const RING_GAP = 5; // Abstand zwischen den konzentrischen Fach-Ringen
const AUSSEN = MITTE - RING_BREITE / 2 - 2;
const LUECKE = 0.035; // Anteil des Kreises je Lücke zwischen zwei Wochen

export default function Etappenring({ faecher, animiert }) {
  const liste = faecher && faecher.length ? faecher : null;

  // Gemeinsame Wochen-Stücke: pro Woche die Gesamt-Aufgabenzahl über alle Fächer.
  const wochenTotal = new Map();
  let aktW = null;
  if (liste) {
    liste.forEach((f) =>
      f.wochen.forEach((w) => {
        wochenTotal.set(w.woche, (wochenTotal.get(w.woche) || 0) + w.total);
        if (w.istAktuell) aktW = w.woche;
      })
    );
  }
  const wochen = [...wochenTotal.keys()].sort((a, b) => a - b);
  const gesamtKbs = wochen.reduce((s, w) => s + wochenTotal.get(w), 0) || 1;
  const verfuegbar = Math.max(0.1, 1 - wochen.length * LUECKE);
  const slice = new Map(); // woche -> { start, len } (Bruchteile des Kreises)
  let cursor = 0;
  wochen.forEach((w) => {
    const len = (wochenTotal.get(w) / gesamtKbs) * verfuegbar;
    slice.set(w, { start: cursor, len });
    cursor += len + LUECKE;
  });

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
              return (
                <g key={f.fach}>
                  {f.wochen.map((w) => {
                    const s = slice.get(w.woche);
                    if (!s) return null;
                    const doneFrac = w.total ? w.done / w.total : 0;
                    return (
                      <g key={w.woche}>
                        <circle
                          className={
                            "hu-ring-track" +
                            (w.woche === aktW ? " aktuell" : "")
                          }
                          cx={MITTE}
                          cy={MITTE}
                          r={radius}
                          fill="none"
                          strokeWidth={RING_BREITE}
                          strokeLinecap="round"
                          strokeDasharray={`${s.len * umfang} ${umfang}`}
                          strokeDashoffset={`${-s.start * umfang}`}
                        />
                        {doneFrac > 0 && (
                          <circle
                            cx={MITTE}
                            cy={MITTE}
                            r={radius}
                            fill="none"
                            stroke={f.color}
                            strokeWidth={RING_BREITE}
                            strokeLinecap="round"
                            strokeDasharray={`${doneFrac * s.len * umfang} ${umfang}`}
                            strokeDashoffset={`${-s.start * umfang}`}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
}
