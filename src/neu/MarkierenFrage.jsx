import { useEffect, useRef, useState } from "react";
import { domBild } from "./domBild";
import { frageKi } from "./kiClient";
import "./MarkierenFrage.css";

// Stift-Werkzeug: macht beim Öffnen einen echten Screenshot der gerade offenen
// Material-Fläche, legt eine durchsichtige Marker-Ebene darüber, und schickt
// Bild plus Markierung mit einer Frage an den KI-Coach. Der Coach schaut auf die
// markierte Stelle und hilft mit einer Rückfrage weiter, ohne die Lösung zu
// verraten. Das Bild bleibt auf dem Gerät (Datenhoheit). Ohne lokales
// Vision-Modell ist Senden deaktiviert (Hinweis wie beim Rechenweg).
//
// Das Zeichnen ist imperativ (Canvas-Kontext): nur in Event-Handlern und
// Effekten, nie im Render.
export default function MarkierenFrage({
  kontextName,
  zielRef,
  visionModell,
  systemText,
  onClose,
  // mitFrage=false: reines Markier-Werkzeug (Toolbar-Stift), ohne Frage/KI-Teil.
  // mitFrage=true: Markieren und den KI-Coach fragen (Zauberstab im Chat).
  mitFrage = true,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const aktuellRef = useRef(null); // laufender Strich {punkte:[{x,y}]}
  const bgImgRef = useRef(null); // geladenes Hintergrund-Bild (zum Zusammenführen)

  const [hintergrund, setHintergrund] = useState(null); // Daten-URL oder null (weißes Blatt)
  const [bereit, setBereit] = useState(false); // Screenshot fertig (oder Fallback)
  const [striche, setStriche] = useState([]);
  const stricheRef = useRef(striche);
  const [frage, setFrage] = useState("");
  const [antwort, setAntwort] = useState(""); // gestreamte Coach-Antwort
  const [denkt, setDenkt] = useState(false); // Tipp-Punkte bis zum ersten Token
  const [laeuft, setLaeuft] = useState(false);
  const abbruchRef = useRef(null);

  const markerRef = useRef("rgba(245,197,24,0.4)");
  const BREITE = 16;

  function einStrich(ctx, strich) {
    const p = strich.punkte;
    if (!p.length) return;
    ctx.strokeStyle = markerRef.current;
    ctx.lineWidth = BREITE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
    if (p.length === 1) ctx.lineTo(p[0].x + 0.1, p[0].y + 0.1);
    ctx.stroke();
  }

  function zeichneAlles() {
    const ctx = ctxRef.current;
    const c = canvasRef.current;
    if (!ctx || !c) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, c.width / dpr, c.height / dpr);
    for (const s of stricheRef.current) einStrich(ctx, s);
  }

  // Beim Öffnen: echten Screenshot der Ziel-Fläche machen. Klappt das nicht
  // (Canvas-Widget, fremde Bilder), bleibt ein weißes Blatt zum Markieren.
  useEffect(() => {
    let aktiv = true;
    domBild(zielRef?.current)
      .then((url) => {
        if (!aktiv) return;
        setHintergrund(url);
        setBereit(true);
      })
      .catch(() => {
        if (aktiv) setBereit(true);
      });
    return () => {
      aktiv = false;
    };
  }, [zielRef]);

  function passeGroesseAn() {
    const c = canvasRef.current;
    const wrap = wrapRef.current;
    if (!c || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const b = wrap.getBoundingClientRect();
    c.width = Math.round(b.width * dpr);
    c.height = Math.round(b.height * dpr);
    c.style.width = b.width + "px";
    c.style.height = b.height + "px";
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;
    markerRef.current =
      getComputedStyle(c).getPropertyValue("--mf-marker").trim() ||
      "rgba(245,197,24,0.4)";
    zeichneAlles();
  }

  // Canvas erst aufspannen, wenn die Fläche steht (nach dem Screenshot-Versuch).
  useEffect(() => {
    if (!bereit) return;
    passeGroesseAn();
    const onResize = () => passeGroesseAn();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // einmalig, sobald die Fläche bereit ist
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bereit]);

  useEffect(() => {
    stricheRef.current = striche;
    zeichneAlles();
    // zeichneAlles nutzt nur Refs; bewusst nur bei Striche-Änderung neu zeichnen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [striche]);

  // Esc: schließt das Werkzeug (der Fokus übernimmt den Rest der Kaskade).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => abbruchRef.current?.abort();
  }, []);

  function pos(e) {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function start(e) {
    e.preventDefault();
    try {
      canvasRef.current.setPointerCapture(e.pointerId);
    } catch {
      /* ohne Capture weiterzeichnen */
    }
    aktuellRef.current = { punkte: [pos(e)] };
    const ctx = ctxRef.current;
    if (ctx) einStrich(ctx, aktuellRef.current);
  }
  function bewege(e) {
    if (!aktuellRef.current) return;
    e.preventDefault();
    const punkte = aktuellRef.current.punkte;
    const np = pos(e);
    punkte.push(np);
    const ctx = ctxRef.current;
    if (ctx && punkte.length >= 2) {
      const a = punkte[punkte.length - 2];
      ctx.strokeStyle = markerRef.current;
      ctx.lineWidth = BREITE;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(np.x, np.y);
      ctx.stroke();
    }
  }
  function ende() {
    const s = aktuellRef.current;
    aktuellRef.current = null;
    if (!s || !s.punkte.length) return;
    setStriche((prev) => [...prev, s]);
  }
  function zurueck() {
    setStriche((prev) => prev.slice(0, -1));
  }
  function loeschen() {
    setStriche([]);
  }

  // Hintergrund-Bild und Markierung zu einem PNG zusammenführen (gleiche Fläche,
  // deckungsgleich). object-fit: contain wird nachgebildet, damit die Markierung
  // genau auf der Stelle sitzt, die der Schüler gesehen hat.
  function fuehreBildZusammen() {
    const c = canvasRef.current;
    if (!c) return null;
    const dpr = window.devicePixelRatio || 1;
    const cssW = c.width / dpr;
    const cssH = c.height / dpr;
    const off = document.createElement("canvas");
    off.width = c.width;
    off.height = c.height;
    const ctx = off.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.scale(dpr, dpr);
    const bg = bgImgRef.current;
    if (bg && bg.naturalWidth) {
      const skala = Math.min(cssW / bg.naturalWidth, cssH / bg.naturalHeight);
      const w = bg.naturalWidth * skala;
      const h = bg.naturalHeight * skala;
      ctx.drawImage(bg, (cssW - w) / 2, (cssH - h) / 2, w, h);
    }
    for (const s of stricheRef.current) einStrich(ctx, s);
    try {
      return off.toDataURL("image/png");
    } catch {
      return null;
    }
  }

  async function senden() {
    if (laeuft) return;
    const f = frage.trim();
    if (!f && !striche.length) return;
    const bild = fuehreBildZusammen();
    if (!bild) return;
    setAntwort("");
    setLaeuft(true);
    setDenkt(true);
    abbruchRef.current?.abort();
    const ac = new AbortController();
    abbruchRef.current = ac;
    try {
      await frageKi({
        frage:
          f || "Schau dir die markierte Stelle an und hilf mir hier weiter.",
        verlauf: [],
        kontextName,
        materialien: [],
        modell: visionModell,
        bild,
        systemText,
        signal: ac.signal,
        onToken: (stueck) => {
          setDenkt(false);
          setAntwort((a) => a + stueck);
        },
      });
    } catch (e) {
      if (e.name !== "AbortError") {
        setAntwort(
          "Ich konnte das Bild gerade nicht ansehen. Versuch es gleich noch einmal."
        );
      }
    } finally {
      setDenkt(false);
      setLaeuft(false);
    }
  }

  return (
    <div
      className="mf"
      role="dialog"
      aria-modal="true"
      aria-label={mitFrage ? "Markieren und fragen" : "Markieren"}
    >
      <header className="mf-kopf">
        <button
          type="button"
          className="mf-zu"
          onClick={onClose}
          aria-label="Markieren schließen"
        >
          ✕
        </button>
        <span className="mf-titel">
          {mitFrage ? "Markieren und fragen" : "Markieren"}
        </span>
        <div className="mf-werkzeuge">
          <button
            type="button"
            className="mf-werkzeug"
            onClick={zurueck}
            disabled={striche.length === 0}
            title="Letzte Markierung zurück"
          >
            ↶ Rückgängig
          </button>
          <button
            type="button"
            className="mf-werkzeug"
            onClick={loeschen}
            disabled={striche.length === 0}
            title="Alle Markierungen löschen"
          >
            Leeren
          </button>
        </div>
      </header>

      <p className="mf-hinweis">
        {mitFrage
          ? "Markiere mit dem Stift die Stelle, bei der du nicht weiterkommst, und frag den KI-Coach dazu. Dein Bild bleibt auf diesem Gerät."
          : "Markiere mit dem Stift die wichtigen Stellen im Material. Dein Bild bleibt auf diesem Gerät."}
      </p>

      <div className="mf-flaeche" ref={wrapRef}>
        {!bereit ? (
          <span className="mf-laedt" aria-hidden="true">
            Material wird aufgenommen …
          </span>
        ) : hintergrund ? (
          <img
            ref={bgImgRef}
            className="mf-bg"
            src={hintergrund}
            alt="Aufnahme des Materials"
          />
        ) : (
          <div className="mf-bg mf-bg-leer" aria-hidden="true">
            Kein Bild vom Material möglich. Du kannst trotzdem hier markieren und
            schreiben.
          </div>
        )}
        {bereit && (
          <canvas
            ref={canvasRef}
            className="mf-canvas"
            onPointerDown={start}
            onPointerMove={bewege}
            onPointerUp={ende}
            onPointerLeave={ende}
            onPointerCancel={ende}
          />
        )}
      </div>

      {mitFrage && antwort && (
        <div className="mf-antwort" role="status">
          <span className="mf-antwort-label">KI-Coach</span>
          <p className="mf-antwort-text">
            {antwort}
            {denkt && <span className="mf-cursor" aria-hidden="true" />}
          </p>
        </div>
      )}
      {mitFrage && denkt && !antwort && (
        <div className="mf-antwort" role="status">
          <span className="mf-antwort-label">KI-Coach</span>
          <p className="mf-antwort-text mf-denkt">
            <span />
            <span />
            <span />
          </p>
        </div>
      )}

      {mitFrage && (
        <form
          className="mf-eingabe"
          onSubmit={(e) => {
            e.preventDefault();
            senden();
          }}
        >
          <input
            type="text"
            value={frage}
            onChange={(e) => setFrage(e.target.value)}
            placeholder={
              visionModell
                ? "Was möchtest du zur markierten Stelle wissen?"
                : "Schreiben geht, zum Ansehen braucht es eine lokale KI"
            }
            aria-label="Frage zur Markierung"
            disabled={!visionModell || laeuft}
          />
          <button
            type="submit"
            className="mf-senden"
            disabled={!visionModell || laeuft}
          >
            An KI-Coach senden
          </button>
        </form>
      )}
      {mitFrage && !visionModell && (
        <p className="mf-keinki">
          Zum Ansehen deiner Markierung brauche ich ein lokales KI-Vision-Modell
          (Ollama). Gerade läuft keins. Markieren und Schreiben geht trotzdem.
        </p>
      )}
    </div>
  );
}
