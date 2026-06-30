import { useEffect, useRef, useState } from "react";

// Fach-Farben je Buchstabe (wie in der App).
const FARBE = { o: "#61DA85", r: "#7DC0FE", c: "#FF7DA9", a: "#FFE37D" };

// Die gefüllten Buchstaben-Glyphen (aus dem orca-Wortmark).
const PFAD = {
  o: "M6.53803 35.9289C13.1312 22.3719 22.5513 14.7438 28.5456 10.6619C34.5399 6.57995 46.5153 0.788397 61.0714 0.122182C68.6644 -0.225345 74.9964 0.318432 83.2976 2.96167C89.9226 5.0712 91.0929 12.5703 89.1512 16.6831C87.2095 20.7958 82.0299 23.509 77.1783 21.9794C72.1131 20.3824 68.0872 19.5795 61.0714 20.0132C52.1121 20.567 45.0374 24.1478 41.4638 26.1278C31.7604 31.5037 26.2156 40.7499 24.3082 44.8331C19.9994 53.432 18.6109 64.9745 21.0599 74.2589C23.008 83.6656 28.586 91.9994 35.9629 98.2153C43.3398 104.431 53.1165 107.869 62.7865 108.252C72.4565 108.635 82.2195 105.419 90.0722 99.8068C97.9249 94.1941 103.726 85.7737 106.423 76.551C109.121 67.3284 108.847 57.228 105.242 48.3156C101.884 39.5085 96.1401 33.4899 93.1867 30.8562C90.2333 28.2225 89.2498 22.1059 92.5688 17.7396C93.9281 15.9514 97.525 13.2751 102.073 14.1399C104.77 14.6526 106.96 16.5274 108.924 18.4452C113.722 23.1325 119.274 30.1143 123.732 40.8792C129.034 53.9887 129.433 68.4719 125.465 82.0379C121.497 95.6039 113.287 107.573 101.736 115.829C90.1853 124.085 76.2507 128.591 62.0267 128.028C47.8027 127.464 33.8981 122.458 23.0471 113.315C12.1961 104.172 4.16809 91.1146 1.30257 77.2779C-1.56296 63.4412 0.350582 48.6517 6.53803 35.9289Z",
  r: "M193.011 1.6708C199.507 0.192835 206.683 -0.61059 209.955 0.562406C215.11 2.26761 216.781 6.3955 216.781 10.1913C216.951 15.7698 211.923 19.8273 206.39 19.7235C190.505 19.4253 181.656 25.732 176.924 29.33C174.353 31.2848 173.104 32.6574 171.009 34.9765C167.488 38.8741 165.419 43.9076 165.439 49.1601L165.702 118.242C165.702 123.765 161.224 128.242 155.702 128.242C150.179 128.242 145.702 123.765 145.702 118.242V32.1884C145.613 31.47 145.611 30.7438 145.702 30.0253V10.1913C145.702 4.66853 150.179 0.191425 155.702 0.191312C161.224 0.191312 165.702 4.66847 165.702 10.1913V15.1786C166.244 14.7467 166.582 14.3856 167.304 13.8495C174.223 8.71042 178.392 6.71752 182.277 5.03799C184.74 3.97311 188.709 2.64968 193.011 1.6708Z",
  c: "M312.648 9.42939C308.598 6.99155 310.35 7.99729 307.68 6.69848C294.957 0.51107 280.167 -1.4025 266.331 1.46303C252.494 4.32855 239.437 12.3566 230.294 23.2076C221.15 34.0585 216.144 47.9632 215.581 62.1872C215.017 76.4112 219.523 90.3457 227.779 101.897C236.035 113.447 248.005 121.658 261.571 125.625C275.137 129.593 289.62 129.195 302.729 123.893C307.519 121.956 309.134 121.17 313.04 118.842C317.582 115.308 319.025 108.795 314.616 103.924C311.193 100.141 305.295 100.147 302.126 102.278C300.511 103.117 297.865 104.565 295.347 105.492C287.317 108.724 276.28 109.281 267.057 106.584C257.835 103.886 249.414 98.0854 243.802 90.2327C238.189 82.38 234.974 72.617 235.357 62.947C235.74 53.277 239.177 43.5002 245.393 36.1233C251.609 28.7465 259.943 23.1684 269.35 21.2203C278.634 18.7714 290.176 20.1598 298.775 24.4686C299.734 25.1298 299.299 24.5863 302.179 26.2903C305.059 27.9942 311.244 28.7123 315.033 24.0409C319.647 18.3509 316.698 11.8672 312.648 9.42939Z",
};
const PFAD_A = [
  "M434.84 91.5386C434.336 92.1878 433.813 92.8213 433.271 93.4374C431.838 95.0686 430.264 96.5878 428.578 97.9841C430.861 96.0292 432.967 93.8702 434.84 91.5386ZM444.238 110.601C443.249 111.549 442.232 112.464 441.188 113.344C442.231 112.472 443.248 111.559 444.238 110.601ZM441.133 113.39C437.575 116.355 433.715 118.837 429.628 120.991C433.724 118.905 437.59 116.368 441.133 113.39ZM355.82 110.326C354.704 109.242 353.622 108.116 352.576 106.95C346.495 100.076 341.753 91.4749 338.976 82.8383C341.698 92.0787 346.515 100.192 352.576 106.95C353.619 108.129 354.701 109.257 355.82 110.326ZM416.093 105.31C411.41 107.081 406.415 108.084 401.449 108.28C391.779 108.663 382.016 105.448 374.163 99.8354C373.433 99.3137 372.721 98.7678 372.028 98.1993C372.277 98.4087 372.528 98.6149 372.781 98.8179C381.482 105.786 392.741 109.225 403.774 108.245C407.941 107.875 412.115 106.87 416.093 105.31Z",
  "M443.176 74.2875C441.862 80.633 438.896 86.4903 434.84 91.5386C441.203 83.3405 444.541 72.6179 444.285 62.1856C444.147 59.5017 443.787 56.8164 443.212 54.1744C444.735 60.8508 444.814 68.0747 443.176 74.2875ZM429.628 120.991C421.186 125.292 411.77 127.678 402.209 128.056C387.985 128.62 374.05 124.114 362.499 115.858C360.129 114.164 357.9 112.314 355.82 110.326C357.291 111.756 358.835 113.12 360.447 114.411C373.246 124.661 389.407 129.506 405.637 128.064C414.091 127.313 422.233 124.89 429.628 120.991ZM357.812 76.5796C357.231 74.5932 356.788 72.5661 356.486 70.5189C358.207 81.1189 363.885 91.3494 372.028 98.1993C365.259 92.6506 360.259 84.9452 357.812 76.5796ZM416.093 105.31C420.528 103.633 424.684 101.267 428.273 98.2439C424.631 101.204 420.479 103.591 416.093 105.31Z",
  "M338.976 82.8383C341.698 92.0787 346.515 100.192 352.576 106.95C346.495 100.076 341.753 91.4749 338.976 82.8383ZM441.188 113.344C442.231 112.472 443.248 111.559 444.238 110.601C443.249 111.549 442.232 112.464 441.188 113.344Z",
  "M434.84 91.5386C434.336 92.1878 433.813 92.8213 433.271 93.4374L434.974 91.3703C434.93 91.4265 434.885 91.4826 434.84 91.5386ZM463.929 57.9712L463.966 58.2625C463.97 58.2982 463.975 58.3335 463.979 58.3682C463.963 58.2422 463.947 58.1102 463.929 57.9712Z",
  "M463.929 57.9712C463.943 58.0797 463.956 58.184 463.968 58.2844C463.968 58.2771 463.967 58.2698 463.966 58.2625L463.929 57.9712Z",
  "M433.271 93.4374C433.813 92.8213 434.336 92.1878 434.84 91.5386C438.896 86.4903 441.862 80.633 443.176 74.2875C444.814 68.0747 444.735 60.8508 443.212 54.1744C442.459 50.8735 441.353 47.7065 439.927 44.8617C438.02 40.7785 432.475 31.5323 422.772 26.1564C419.198 24.1764 412.123 20.5956 403.164 20.0418C396.148 19.6081 392.122 20.411 387.057 22.008C382.206 23.5376 377.026 20.8244 375.084 16.7117C373.143 12.5989 374.313 5.09978 380.938 2.99026C389.239 0.347014 395.558 -0.0623482 403.164 0.150764C415.122 0.48582 425.327 4.62296 431.915 8.35221C433.352 9.1656 434.617 9.95959 435.69 10.6905C441.684 14.7724 451.104 22.4005 457.697 35.9575C460.827 42.3918 462.863 49.3547 463.74 56.4556C463.795 56.8947 463.843 57.2824 463.887 57.6294L463.909 57.8087L463.929 57.9712C463.942 58.0718 463.954 58.1688 463.966 58.2625C463.981 58.3843 463.995 58.5005 464.009 58.6119C464.257 60.6425 464.258 61.0601 464.258 64.3104V118.306C464.258 123.838 459.647 128.299 454.164 128.299C448.682 128.299 444.238 123.814 444.238 118.282V110.601C443.249 111.549 442.232 112.464 441.188 113.344L441.133 113.39C437.575 116.355 433.715 118.837 429.628 120.991C421.186 125.292 411.77 127.678 402.209 128.056C387.985 128.62 374.05 124.114 362.499 115.858C360.129 114.164 357.9 112.314 355.82 110.326C354.704 109.242 353.622 108.116 352.576 106.95C346.495 100.076 341.753 91.4749 338.976 82.8383C334.96 70.5189 335.201 54.0173 340.503 40.9077C341.721 37.9664 343.021 35.3076 344.365 32.9007C347.939 26.4989 351.824 21.8804 355.312 18.4738C357.275 16.556 359.466 14.6811 362.162 14.1685C366.71 13.3037 370.307 15.98 371.667 17.7682C374.986 22.1344 374.002 28.2511 371.049 30.8848C368.095 33.5185 362.351 39.5371 358.993 48.3442C356.165 55.337 355.387 63.0612 356.486 70.5189C356.788 72.5661 357.231 74.5932 357.812 76.5796C360.259 84.9452 365.259 92.6506 372.028 98.1993C372.277 98.4087 372.528 98.6149 372.781 98.8179C381.482 105.786 392.741 109.225 403.774 108.245C407.941 107.875 412.115 106.87 416.093 105.31C420.528 103.633 424.684 101.267 428.273 98.2439C428.318 98.2053 428.367 98.1638 428.414 98.1243L428.434 98.1072L428.48 98.0679L428.512 98.041L428.526 98.0286L428.551 98.0074L428.578 97.9841C430.264 96.5878 431.838 95.0686 433.271 93.4374Z",
];

// Die drei runden Buchstaben (o, c, a) werden durch einen wachsenden Kreissektor
// freigelegt: so füllt sich exakt die Glyph-Form, nie die Aussparung, und am Ende
// komplett. Zentren/Winkel aus den gemessenen Glyph-Boxen (Mittellinie R54).
// von/bis = Anteil am Gesamt-Fortschritt (nach Bogenlänge gewichtet).
const KREISE = [
  { id: "o", cx: 64.1, cy: 64.1, a0: 180, sweep: 360, von: 0, bis: 0.325, farbe: FARBE.o, pfade: [PFAD.o], eo: false },
  { id: "c", cx: 279.5, cy: 64.2, a0: -58.9, sweep: -242, von: 0.457, bis: 0.675, farbe: FARBE.c, pfade: [PFAD.c], eo: false },
  { id: "a", cx: 400.2, cy: 64.2, a0: -90, sweep: 360, von: 0.675, bis: 1, farbe: FARBE.a, pfade: PFAD_A, eo: true },
];
const R_VON = 0.325;
const R_BIS = 0.457; // r (Stamm) füllt vertikal von unten nach oben

// Mittellinie (o → r → c → a) nur zum Messen: Punkt-Position und Zieh-Tangente.
const MITTE =
  "M10.1 64.1 A54 54 0 1 1 118.1 64.1 A54 54 0 1 1 10.1 64.1 " +
  "M155.7 118 L155.7 33 C155.7 20 174 14 201 14 " +
  "M307.4 17.9 A54 54 0 1 0 307.4 110.5 " +
  "M400.2 10.2 A54 54 0 1 1 400.2 118.2 A54 54 0 1 1 400.2 10.2";

const klemm = (v, a, b) => Math.max(a, Math.min(b, v));

function sektorD(cx, cy, a0, sweep, local) {
  const sw = sweep * klemm(local, 0, 1);
  if (Math.abs(sw) < 0.05) return "NONE";
  if (Math.abs(sw) >= 359.5) return "FULL";
  const bigR = 92;
  const r0 = (a0 * Math.PI) / 180;
  const r1 = ((a0 + sw) * Math.PI) / 180;
  const x0 = (cx + bigR * Math.cos(r0)).toFixed(2);
  const y0 = (cy + bigR * Math.sin(r0)).toFixed(2);
  const x1 = (cx + bigR * Math.cos(r1)).toFixed(2);
  const y1 = (cy + bigR * Math.sin(r1)).toFixed(2);
  const gross = Math.abs(sw) > 180 ? 1 : 0;
  const richtung = sw > 0 ? 1 : 0;
  return `M${cx} ${cy} L${x0} ${y0} A${bigR} ${bigR} 0 ${gross} ${richtung} ${x1} ${y1} Z`;
}

function leitFarbe(p) {
  if (p < R_VON) return FARBE.o;
  if (p < R_BIS) return FARBE.r;
  if (p < 0.675) return FARBE.c;
  return FARBE.a;
}

export default function OrcaLogo({ className, interaktiv = false, onVoll }) {
  const svgRef = useRef(null);
  const mitteRef = useRef(null);
  const letztPunkt = useRef(null);
  const vollRef = useRef(false);
  const progRef = useRef(0); // aktueller Stand, unabhängig vom Render-Takt
  const ziehtRef = useRef(false);
  const [len, setLen] = useState(0);
  const [progress, setProgress] = useState(0);
  const [griff, setGriff] = useState({ x: 10.1, y: 64.1 });
  const [zieht, setZieht] = useState(false);
  const [reduce] = useState(
    () =>
      interaktiv &&
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (interaktiv && mitteRef.current) {
      setLen(mitteRef.current.getTotalLength());
      const q = mitteRef.current.getPointAtLength(0);
      setGriff({ x: q.x, y: q.y });
    }
  }, [interaktiv]);

  function punktBei(t) {
    const path = mitteRef.current;
    const L = len || (path && path.getTotalLength()) || 1;
    if (!path) return { x: 10.1, y: 64.1 };
    const q = path.getPointAtLength(klemm(t, 0, 1) * L);
    return { x: q.x, y: q.y };
  }

  function setze(t) {
    const v = klemm(t, 0, 1);
    progRef.current = v;
    setProgress(v);
    setGriff(punktBei(v));
    if (v >= 0.992 && !vollRef.current) {
      vollRef.current = true;
      if (onVoll) onVoll();
    } else if (v < 0.992) {
      vollRef.current = false;
    }
  }

  function zuSvg(e) {
    const svg = svgRef.current;
    const ctm = svg && svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(ctm.inverse());
  }

  function beiDown(e) {
    if (!interaktiv) return;
    e.preventDefault();
    try {
      svgRef.current.setPointerCapture(e.pointerId);
    } catch {
      /* z. B. synthetische Events ohne aktiven Pointer */
    }
    letztPunkt.current = zuSvg(e);
    ziehtRef.current = true;
    setZieht(true);
  }

  // Fortschritt zählt nur die Bewegung ENTLANG des Pfades (Projektion auf die
  // Tangente). Quer zum Pfad (durch die Aussparung) bewegt nichts: man muss die
  // Kreisform wirklich nachziehen. 1 Einheit entlang ≈ 1/Länge Fortschritt, also
  // füllt ein einmal nachgezogener Kreis genau diesen Buchstaben.
  function beiMove(e) {
    if (!ziehtRef.current) return;
    const p = zuSvg(e);
    const vor = letztPunkt.current;
    letztPunkt.current = p;
    if (!p || !vor) return;
    const path = mitteRef.current;
    const L = len;
    if (!path || !L) return;
    const stand = progRef.current;
    const a = path.getPointAtLength(klemm(stand - 0.004, 0, 1) * L);
    const b = path.getPointAtLength(klemm(stand + 0.004, 0, 1) * L);
    let tx = b.x - a.x;
    let ty = b.y - a.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const entlang = (p.x - vor.x) * tx + (p.y - vor.y) * ty;
    const d = klemm(entlang / L, -0.06, 0.06);
    setze(stand + d);
  }

  function beiUp(e) {
    if (!zieht) return;
    setZieht(false);
    letztPunkt.current = null;
    try {
      svgRef.current.releasePointerCapture(e.pointerId);
    } catch {
      /* Pointer schon freigegeben */
    }
  }

  // Statisch (z. B. Masthead): einfache gefüllte Glyphen in currentColor.
  if (!interaktiv) {
    return (
      <svg
        viewBox="0 0 465 129"
        className={className}
        role="img"
        aria-label="Orca"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={PFAD.o} />
        <path d={PFAD.r} />
        <path d={PFAD.c} />
        {PFAD_A.map((d, i) => (
          <path key={i} fillRule="evenodd" clipRule="evenodd" d={d} />
        ))}
      </svg>
    );
  }

  // Freilege-Sektoren je rundem Buchstaben.
  const sektoren = KREISE.map((k) => ({
    k,
    d: sektorD(k.cx, k.cy, k.a0, k.sweep, (progress - k.von) / (k.bis - k.von)),
  }));
  // r: vertikaler Freilege-Streifen (unten -> oben).
  const rLocal = klemm((progress - R_VON) / (R_BIS - R_VON), 0, 1);
  const rTop = 118 - 114 * rLocal;
  const griffFarbe = leitFarbe(progress);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 465 129"
      className={className}
      role="img"
      aria-label="Orca, zum Füllen am Punkt entlang der Kreise ziehen"
      xmlns="http://www.w3.org/2000/svg"
      onPointerDown={beiDown}
      onPointerMove={beiMove}
      onPointerUp={beiUp}
      onPointerCancel={beiUp}
      style={{ touchAction: "none", cursor: zieht ? "grabbing" : "grab" }}
    >
      <defs>
        {sektoren.map(({ k, d }) =>
          d === "NONE" || d === "FULL" ? null : (
            <clipPath key={k.id} id={`orca-rev-${k.id}`}>
              <path d={d} />
            </clipPath>
          )
        )}
        {rLocal > 0 && rLocal < 0.999 && (
          <clipPath id="orca-rev-r">
            <rect x="140" y={rTop} width="84" height={130 - rTop} />
          </clipPath>
        )}
      </defs>

      {/* Blasse Spur: alle Buchstaben ungefüllt. */}
      <g fill="#e1e4e3">
        <path d={PFAD.o} />
        <path d={PFAD.r} />
        <path d={PFAD.c} />
        {PFAD_A.map((d, i) => (
          <path key={i} fillRule="evenodd" clipRule="evenodd" d={d} />
        ))}
      </g>

      {/* Gefüllte Buchstaben, durch Sektor/Streifen freigelegt. */}
      {sektoren.map(({ k, d }) => {
        if (d === "NONE") return null;
        const glyphen = k.pfade.map((pd, i) => (
          <path
            key={i}
            d={pd}
            fill={k.farbe}
            fillRule={k.eo ? "evenodd" : "nonzero"}
            clipRule="evenodd"
          />
        ));
        return d === "FULL" ? (
          <g key={k.id}>{glyphen}</g>
        ) : (
          <g key={k.id} clipPath={`url(#orca-rev-${k.id})`}>
            {glyphen}
          </g>
        );
      })}
      {rLocal > 0 &&
        (rLocal >= 0.999 ? (
          <path d={PFAD.r} fill={FARBE.r} />
        ) : (
          <g clipPath="url(#orca-rev-r)">
            <path d={PFAD.r} fill={FARBE.r} />
          </g>
        ))}

      {/* Mittellinie, unsichtbar, nur zum Messen. */}
      <path ref={mitteRef} d={MITTE} fill="none" stroke="none" />

      {/* Griff-Punkt: führt die Spur, pulst am Start als Einladung. */}
      <g>
        {progress < 0.02 && !zieht && !reduce && (
          <circle cx={griff.x} cy={griff.y} r="12" fill="none" stroke={griffFarbe} strokeWidth="2.5">
            <animate attributeName="r" values="12;24" dur="1.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.55;0" dur="1.7s" repeatCount="indefinite" />
          </circle>
        )}
        <circle
          cx={griff.x}
          cy={griff.y}
          r="13"
          fill={griffFarbe}
          stroke="#fff"
          strokeWidth="3.5"
          style={{ filter: "drop-shadow(0 2px 6px rgba(0, 24, 24, 0.28))" }}
        />
      </g>
    </svg>
  );
}
