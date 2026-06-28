// Etappenfortschritt als ruhiger, sachlicher Ring (kein Gamification-Konfetti,
// VISION: Spiegeln statt Belohnen). Pro Fach ein konzentrischer Bogen, gefüllt
// nach Anteil erledigter Ziele; die Gesamtzahl steht ruhig in der Mitte des
// Rings. Farbe = Fach (kbFarbe), nicht Status.
const GROESSE = 240;
const MITTE = GROESSE / 2;
const RING_BREITE = 14;
const LUECKE = 5;
const AUSSEN = MITTE - RING_BREITE / 2 - 2;

export default function Etappenring({
  ringe,
  gesamtDone,
  gesamtTotal,
  animiert,
}) {
  return (
    <div className={"hu-ring-wrap" + (animiert ? " hu-ring-animiert" : "")}>
      <svg
        className="hu-ring"
        viewBox={`0 0 ${GROESSE} ${GROESSE}`}
        aria-hidden="true"
      >
        <g transform={`rotate(-90 ${MITTE} ${MITTE})`}>
          {ringe.map((r, i) => {
            const radius = AUSSEN - i * (RING_BREITE + LUECKE);
            if (radius < RING_BREITE) return null;
            const umfang = 2 * Math.PI * radius;
            const bogen = Math.max(0, Math.min(1, r.fraction)) * umfang;
            return (
              <g key={r.fach}>
                <circle
                  cx={MITTE}
                  cy={MITTE}
                  r={radius}
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth={RING_BREITE}
                />
                <circle
                  cx={MITTE}
                  cy={MITTE}
                  r={radius}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={RING_BREITE}
                  strokeLinecap="round"
                  strokeDasharray={`${bogen} ${umfang - bogen}`}
                />
              </g>
            );
          })}
        </g>
      </svg>
      <div className="hu-ring-mitte">
        <span
          className="hu-ring-bruch"
          aria-label={`${gesamtDone} von ${gesamtTotal} Könnensbeweisen`}
        >
          <span className="hu-ring-zaehler" aria-hidden="true">
            {gesamtDone}
          </span>
          <span className="hu-ring-strich" aria-hidden="true">
            /
          </span>
          <span className="hu-ring-nenner" aria-hidden="true">
            {gesamtTotal}
          </span>
        </span>
      </div>
    </div>
  );
}
