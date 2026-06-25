// Etappenfortschritt als ruhiger, sachlicher Ring (kein Gamification-Konfetti,
// VISION: Spiegeln statt Belohnen). Pro Fach ein konzentrischer Bogen, gefüllt
// nach Anteil erledigter Ziele; daneben die Gesamtzahl, darunter die Fächer mit
// farbigem Strich und Bruch. Farbe = Fach (kbFarbe), nicht Status.
const GROESSE = 140;
const MITTE = GROESSE / 2;
const RING_BREITE = 8;
const LUECKE = 4.5;
const AUSSEN = MITTE - RING_BREITE / 2 - 1;

export default function Etappenring({ ringe, gesamtDone, gesamtTotal }) {
  return (
    <div className="hu-fort-inhalt">
      <div className="hu-fort-oben">
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
        <div className="hu-fort-gesamt">
          <span className="hu-fort-gesamt-label">Gesamt</span>
          <span className="hu-fort-gesamt-zahl">
            {gesamtDone}
            <span className="hu-fort-gesamt-von">/{gesamtTotal}</span>
          </span>
        </div>
      </div>
      <ul className="hu-fort-faecher">
        {ringe.map((r) => (
          <li className="hu-fort-fach" key={r.fach}>
            <span
              className="hu-fort-fach-bar"
              style={{ background: r.color }}
              aria-hidden="true"
            />
            <span className="hu-fort-fach-name">{r.fach}</span>
            <span className="hu-fort-fach-wert">
              {r.done}/{r.total}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
