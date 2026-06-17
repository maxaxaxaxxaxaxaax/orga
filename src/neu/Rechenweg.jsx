import { useEffect, useRef, useState } from "react";
import { ladeStriche, speichereStriche } from "./rechenwegSpeicher";
import "./Rechenweg.css";

// Rechenweg-Schreibfläche: der Schüler hält seinen Mathe-Rechenweg handschriftlich
// fest (Stift, Touch oder Maus), in Echtzeit als digitale Tinte. Pointer Events
// liefern auch den Druck (Strichstärke). Die Striche werden reload-fest pro Ziel
// gespeichert. Erste Schicht des Prototyps: das Schreiben. Die KI-Erkennung und
// die Kipp-Punkt-Analyse setzen später auf dieser Tinte (bzw. dem Bild) auf.
//
// Das Zeichnen ist imperativ (Canvas-Kontext, laufender Strich): das passiert
// nur in Event-Handlern und Effekten, nie im Render (Ref-Regeln bleiben sauber).

export default function Rechenweg({ kb, onClose }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const ctxRef = useRef(null);
  const aktuellRef = useRef(null); // laufender Strich {punkte:[{x,y,p}]}
  const [striche, setStriche] = useState(() => ladeStriche(kb.id));
  const stricheRef = useRef(striche); // Spiegel für die Zeichen-Routine

  const tinteRef = useRef("#1f2933"); // Tinten-Farbe, folgt dem Theme (--text)
  const BREITE = 2.4;

  // Einen einzelnen Strich glatt zeichnen (quadratische Mittelpunkte = Tinten-Look).
  function zeichneStrich(ctx, strich) {
    const p = strich.punkte;
    if (!p.length) return;
    ctx.strokeStyle = tinteRef.current;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (p.length === 1) {
      ctx.beginPath();
      ctx.arc(p[0].x, p[0].y, (BREITE * (p[0].p || 0.5)) / 1.5, 0, Math.PI * 2);
      ctx.fillStyle = tinteRef.current;
      ctx.fill();
      return;
    }
    for (let i = 1; i < p.length; i++) {
      const a = p[i - 1];
      const b = p[i];
      ctx.beginPath();
      ctx.lineWidth = BREITE * (0.5 + (b.p || 0.5));
      ctx.moveTo(a.x, a.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      ctx.quadraticCurveTo(a.x, a.y, mx, my);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  function alleNeu() {
    const ctx = ctxRef.current;
    const c = canvasRef.current;
    if (!ctx || !c) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, c.width / dpr, c.height / dpr);
    for (const s of stricheRef.current) zeichneStrich(ctx, s);
  }

  // Canvas an die Container-Größe anpassen (scharf via devicePixelRatio).
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
    // Tinte folgt dem Theme (im Dark Mode hell, im Light Mode dunkel).
    tinteRef.current =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text")
        .trim() || "#1f2933";
    alleNeu();
  }

  useEffect(() => {
    passeGroesseAn();
    const onResize = () => passeGroesseAn();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // einmalig beim Öffnen; kb-Wechsel kommt hier nicht vor (neues Overlay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bei jeder Striche-Änderung (Commit, Rückgängig, Löschen): Spiegel-Ref
  // aktualisieren und neu zeichnen. Während des aktiven Zeichnens läuft das
  // Segment-für-Segment direkt (ohne State), das hier ist nur die saubere
  // Komplett-Neuzeichnung.
  useEffect(() => {
    stricheRef.current = striche;
    alleNeu();
    // alleNeu nutzt nur Refs; bewusst nur bei Striche-Änderung neu zeichnen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [striche]);

  // Esc schließt das Overlay.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function pos(e) {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      p: e.pressure && e.pressure > 0 ? e.pressure : 0.5,
    };
  }

  function start(e) {
    e.preventDefault();
    try {
      canvasRef.current.setPointerCapture(e.pointerId);
    } catch {
      /* manche Pointer lassen sich nicht einfangen: dann ohne Capture zeichnen */
    }
    aktuellRef.current = { punkte: [pos(e)] };
    const ctx = ctxRef.current;
    if (ctx) zeichneStrich(ctx, aktuellRef.current);
  }
  function bewege(e) {
    if (!aktuellRef.current) return;
    e.preventDefault();
    const punkte = aktuellRef.current.punkte;
    const np = pos(e);
    punkte.push(np);
    // Nur das neue Segment zeichnen (flüssig, ohne alles neu zu rendern).
    const ctx = ctxRef.current;
    if (ctx && punkte.length >= 2) {
      const a = punkte[punkte.length - 2];
      ctx.strokeStyle = tinteRef.current;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = BREITE * (0.5 + (np.p || 0.5));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(np.x, np.y);
      ctx.stroke();
    }
  }
  function ende() {
    const s = aktuellRef.current;
    aktuellRef.current = null;
    if (!s || s.punkte.length === 0) return;
    // Punkte gerundet sichern (kompakt, reload-fest).
    const kompakt = {
      punkte: s.punkte.map((q) => ({
        x: Math.round(q.x * 10) / 10,
        y: Math.round(q.y * 10) / 10,
        p: Math.round((q.p || 0.5) * 100) / 100,
      })),
    };
    setStriche((prev) => {
      const next = [...prev, kompakt];
      speichereStriche(kb.id, next);
      return next;
    });
  }

  function zurueck() {
    setStriche((prev) => {
      const next = prev.slice(0, -1);
      speichereStriche(kb.id, next);
      return next;
    });
  }
  function loeschen() {
    speichereStriche(kb.id, []);
    setStriche([]);
  }

  return (
    <div className="rw" role="dialog" aria-modal="true" aria-label="Rechenweg">
      <header className="rw-kopf">
        <button
          type="button"
          className="rw-zu"
          onClick={onClose}
          aria-label="Rechenweg schließen"
        >
          ✕
        </button>
        <span className="rw-titel">Dein Rechenweg: {kb.titel}</span>
        <div className="rw-werkzeuge">
          <button
            type="button"
            className="rw-werkzeug"
            onClick={zurueck}
            disabled={striche.length === 0}
            title="Letzten Strich rückgängig"
          >
            ↶ Rückgängig
          </button>
          <button
            type="button"
            className="rw-werkzeug"
            onClick={loeschen}
            disabled={striche.length === 0}
            title="Alles löschen"
          >
            Alles löschen
          </button>
        </div>
      </header>

      <p className="rw-hinweis">
        Schreib deinen Rechenweg Schritt für Schritt auf, mit Stift, Finger oder
        Maus. Alles bleibt erhalten, bis du es löschst.
      </p>

      <div className="rw-flaeche" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="rw-canvas"
          onPointerDown={start}
          onPointerMove={bewege}
          onPointerUp={ende}
          onPointerLeave={ende}
          onPointerCancel={ende}
        />
        {striche.length === 0 && (
          <span className="rw-platzhalter" aria-hidden="true">
            Hier schreiben …
          </span>
        )}
      </div>
    </div>
  );
}
