import { useState } from "react";

// Interaktiver Zahlenstrahl als Vorstellungs-Hilfe für negative Zahlen.
// Marker bewegt sich animiert; Klick auf eine Zahl springt direkt dorthin,
// +1/-1 Buttons schieben um eins, "+(-3)"/"-(-3)" Schnell-Aktionen zeigen
// die Wirkung negativer Vorzeichen.
const MIN = -10;
const MAX = 10;
const PADDING = 24;
const WIDTH = 480;

function xPos(n) {
  return PADDING + ((n - MIN) / (MAX - MIN)) * (WIDTH - 2 * PADDING);
}

export default function ZahlenstrahlInteraktiv() {
  const [pos, setPos] = useState(0);
  const [letzteOp, setLetzteOp] = useState(null);

  function springeZu(n) {
    setPos(n);
    setLetzteOp(null);
  }
  function schritt(delta, label) {
    setPos((p) => Math.max(MIN, Math.min(MAX, p + delta)));
    setLetzteOp(label);
  }
  function reset() {
    setPos(0);
    setLetzteOp(null);
  }

  const zahlen = [];
  for (let n = MIN; n <= MAX; n++) zahlen.push(n);

  return (
    <div className="zs-wrap" aria-label="Interaktiver Zahlenstrahl">
      <div className="zs-anzeige" role="status" aria-live="polite">
        <span className="zs-anzeige-pos">{pos}</span>
        {letzteOp && (
          <span className="zs-anzeige-op">durch {letzteOp}</span>
        )}
      </div>

      <svg
        className="zs-svg"
        viewBox={`0 0 ${WIDTH} 70`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Zahlenstrahl, aktuelle Position ${pos}`}
      >
        {/* Achse mit Pfeilen */}
        <line
          x1={PADDING - 8}
          y1="32"
          x2={WIDTH - PADDING + 8}
          y2="32"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polyline
          points={`${PADDING - 8},32 ${PADDING - 2},27 ${PADDING - 2},37`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polyline
          points={`${WIDTH - PADDING + 8},32 ${WIDTH - PADDING + 2},27 ${WIDTH - PADDING + 2},37`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Zahlen + Tickmarks (klickbar) */}
        {zahlen.map((n) => {
          const x = xPos(n);
          const istNull = n === 0;
          return (
            <g
              key={n}
              className="zs-tick-gruppe"
              onClick={() => springeZu(n)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x - 12}
                y="8"
                width="24"
                height="48"
                fill="transparent"
              />
              <line
                x1={x}
                y1="26"
                x2={x}
                y2="38"
                stroke={istNull ? "var(--zs-akzent)" : "currentColor"}
                strokeWidth={istNull ? "2.2" : "1.5"}
              />
              <text
                x={x}
                y="54"
                textAnchor="middle"
                fontSize="13"
                fill={istNull ? "var(--zs-akzent)" : "currentColor"}
                fontWeight={istNull ? "700" : "500"}
              >
                {n}
              </text>
            </g>
          );
        })}

        {/* Marker (animiert) */}
        <g
          className="zs-marker"
          style={{ transform: `translateX(${xPos(pos)}px)` }}
        >
          <circle cx="0" cy="32" r="10" fill="var(--zs-akzent)" />
          <circle cx="0" cy="32" r="13" fill="none" stroke="var(--zs-akzent)" strokeWidth="2" opacity="0.4" />
        </g>
      </svg>

      <div className="zs-actions">
        <button
          type="button"
          className="zs-btn"
          onClick={() => schritt(-1, "−1")}
          aria-label="Eins nach links"
        >
          −1
        </button>
        <button
          type="button"
          className="zs-btn"
          onClick={() => schritt(+1, "+1")}
          aria-label="Eins nach rechts"
        >
          +1
        </button>
        <button
          type="button"
          className="zs-btn"
          onClick={() => schritt(-3, "+(−3)")}
        >
          + (−3)
        </button>
        <button
          type="button"
          className="zs-btn"
          onClick={() => schritt(+3, "−(−3)")}
        >
          − (−3)
        </button>
        <button
          type="button"
          className="zs-btn zs-btn-reset"
          onClick={reset}
        >
          ↺ Zurück zu 0
        </button>
      </div>

      <p className="zs-hinweis">
        Tipp: Klicke direkt auf eine Zahl, um zu springen. Die roten Knöpfe zeigen
        dir, warum „− (−3)" dasselbe ist wie „+ 3".
      </p>
    </div>
  );
}
