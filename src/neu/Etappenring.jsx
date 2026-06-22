// Etappenfortschritt als ruhiger, sachlicher Ring (kein Gamification-Konfetti,
// VISION: Spiegeln statt Belohnen). Pro Fach ein konzentrischer Bogen, gefüllt
// nach Anteil erledigter Ziele. Farbe = Fach (kbFarbe), nicht Status.
const GROESSE = 132;
const MITTE = GROESSE / 2;
const RING_BREITE = 7;
const LUECKE = 4.5;
const AUSSEN = MITTE - RING_BREITE / 2 - 1;

export default function Etappenring({ ringe }) {
  return (
    <div className="hu-ring-wrap">
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
      <ul className="hu-ring-legende">
        {ringe.map((r) => (
          <li className="hu-ring-zeile" key={r.fach}>
            <span
              className="hu-ring-punkt"
              style={{ background: r.color }}
              aria-hidden="true"
            />
            <span className="hu-ring-fach">{r.fach}</span>
            <span className="hu-ring-wert">
              {r.done}/{r.total}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
