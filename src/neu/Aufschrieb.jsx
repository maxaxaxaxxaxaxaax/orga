import { useEffect, useRef, useState } from "react";
import { ladeStriche, speichereStriche } from "./rechenwegSpeicher";
import { pruefeVision, lieRechenweg } from "./kiClient";
import "./Aufschrieb.css";

// Aufschrieb-Schreibfläche: der Schüler hält fest, was er analog am Tisch
// gemacht hat (Stift, Finger, Maus), und digitalisiert es am Ende per lokaler
// KI zu Text. Verallgemeinerung des Mathe-Rechenwegs auf alle Fächer, aber ohne
// Coach-Chat: hier geht es nur ums Erfassen und Digitalisieren. Das Bild bleibt
// auf dem Gerät (Datenhoheit), das Ergebnis wird eigenes Material des Schülers.
//
// Das Zeichnen ist imperativ (Canvas-Kontext): nur in Event-Handlern und
// Effekten, nie im Render (Ref-Regeln bleiben sauber).
export default function Aufschrieb({ kb, schritt, aufgabe, onGespeichert, onClose }) {
  // Eigener Speicher-Slot pro Schritt: so vermischt sich der Aufschrieb nicht
  // mit dem des naechsten Schritts und nicht mit dem Mathe-Coach (Slot "rechenweg").
  const slot = "schritt-" + (schritt ?? 0);
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const ctxRef = useRef(null);
  const aktuellRef = useRef(null); // laufender Strich {punkte:[{x,y,p}]}
  const [striche, setStriche] = useState(() => ladeStriche(kb.id, slot));
  const stricheRef = useRef(striche);
  const [visionModell, setVisionModell] = useState(null);
  const [bearbeiten, setBearbeiten] = useState(false); // Vorschau/Tippen offen?
  const [text, setText] = useState(""); // digitalisierter, bearbeitbarer Text
  const [laeuft, setLaeuft] = useState(false); // OCR in Arbeit
  const [fehler, setFehler] = useState(false);
  const abbruchRef = useRef(null);

  const tinteRef = useRef("#001818");
  const BREITE = 2.4;

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
    tinteRef.current =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text")
        .trim() || "#001818";
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

  useEffect(() => {
    stricheRef.current = striche;
    alleNeu();
    // alleNeu nutzt nur Refs; bewusst nur bei Striche-Änderung neu zeichnen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [striche]);

  // Esc schließt erst die Vorschau (falls offen), dann das Overlay.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (bearbeiten) setBearbeiten(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, bearbeiten]);

  // Läuft ein lokales Vision-Modell? Nur dann kann automatisch gelesen werden.
  useEffect(() => {
    let aktiv = true;
    pruefeVision().then((m) => {
      if (aktiv) setVisionModell(m);
    });
    return () => {
      aktiv = false;
    };
  }, []);

  // Laufenden OCR-Lauf beim Schließen abbrechen.
  useEffect(() => {
    return () => abbruchRef.current?.abort();
  }, []);

  // Aufschrieb als Bild exportieren (schwarze Tinte auf Weiß, zugeschnitten),
  // damit das Vision-Modell ihn wie auf Papier lesen kann.
  function exportiereBild() {
    const liste = stricheRef.current;
    if (!liste.length) return null;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const s of liste)
      for (const q of s.punkte) {
        if (q.x < minX) minX = q.x;
        if (q.y < minY) minY = q.y;
        if (q.x > maxX) maxX = q.x;
        if (q.y > maxY) maxY = q.y;
      }
    const pad = 28;
    const w = Math.max(1, maxX - minX) + pad * 2;
    const h = Math.max(1, maxY - minY) + pad * 2;
    const skala = Math.min(4, Math.max(2, 1100 / w));
    const off = document.createElement("canvas");
    off.width = Math.round(w * skala);
    off.height = Math.round(h * skala);
    const ctx = off.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.scale(skala, skala);
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const dx = pad - minX;
    const dy = pad - minY;
    for (const s of liste) {
      const p = s.punkte;
      if (p.length === 1) {
        ctx.beginPath();
        ctx.arc(p[0].x + dx, p[0].y + dy, 2.6, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      for (let i = 1; i < p.length; i++) {
        const a = p[i - 1];
        const b = p[i];
        ctx.lineWidth = BREITE * (0.9 + (b.p || 0.5));
        ctx.beginPath();
        ctx.moveTo(a.x + dx, a.y + dy);
        ctx.lineTo(b.x + dx, b.y + dy);
        ctx.stroke();
      }
    }
    return off.toDataURL("image/png");
  }

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
      /* manche Pointer lassen sich nicht einfangen: dann ohne Capture */
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
    const kompakt = {
      punkte: s.punkte.map((q) => ({
        x: Math.round(q.x * 10) / 10,
        y: Math.round(q.y * 10) / 10,
        p: Math.round((q.p || 0.5) * 100) / 100,
      })),
    };
    setStriche((prev) => {
      const next = [...prev, kompakt];
      speichereStriche(kb.id, slot, next);
      return next;
    });
  }
  function zurueck() {
    setStriche((prev) => {
      const next = prev.slice(0, -1);
      speichereStriche(kb.id, slot, next);
      return next;
    });
  }
  function loeschen() {
    speichereStriche(kb.id, slot, []);
    setStriche([]);
  }

  // Digitalisieren: Vorschau öffnen und, wenn ein Vision-Modell läuft, den
  // Aufschrieb ablesen. Ohne Modell bleibt das Feld leer zum Abtippen.
  async function digitalisieren() {
    if (!stricheRef.current.length) return;
    setBearbeiten(true);
    setFehler(false);
    if (!visionModell) return; // Fallback: Schüler tippt selbst ab
    const bild = exportiereBild();
    if (!bild) return;
    setLaeuft(true);
    abbruchRef.current?.abort();
    const ac = new AbortController();
    abbruchRef.current = ac;
    try {
      const erkannt = await lieRechenweg({
        bild,
        modell: visionModell,
        signal: ac.signal,
      });
      setText((erkannt || "").trim());
    } catch (e) {
      if (e.name !== "AbortError") setFehler(true);
    } finally {
      setLaeuft(false);
    }
  }

  function speichern() {
    const t = text.trim();
    if (!t) return;
    onGespeichert(t);
  }

  return (
    <div className="au" role="dialog" aria-modal="true" aria-label="Aufschrieb">
      <header className="au-kopf">
        <button
          type="button"
          className="au-zu"
          onClick={onClose}
          aria-label="Aufschrieb schließen"
        >
          ✕
        </button>
        <span className="au-titel">Dein Aufschrieb: {kb.titel}</span>
        <div className="au-werkzeuge">
          <button
            type="button"
            className="au-werkzeug"
            onClick={zurueck}
            disabled={striche.length === 0}
            title="Letzten Strich rückgängig"
          >
            ↶ Rückgängig
          </button>
          <button
            type="button"
            className="au-werkzeug"
            onClick={loeschen}
            disabled={striche.length === 0}
            title="Alles löschen"
          >
            Alles löschen
          </button>
        </div>
      </header>

      {aufgabe && (
        <p className="au-aufgabe">
          <span className="au-aufgabe-label">Aufgabe</span>
          {aufgabe}
        </p>
      )}
      <p className="au-hinweis">
        Schreib oder skizziere hier, was du auf Papier gemacht hast. Tipp dann
        auf Digitalisieren, dann wird daraus Text für dein Material.
      </p>

      <div className="au-flaeche" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="au-canvas"
          onPointerDown={start}
          onPointerMove={bewege}
          onPointerUp={ende}
          onPointerLeave={ende}
          onPointerCancel={ende}
        />
        {striche.length === 0 && (
          <span className="au-platzhalter" aria-hidden="true">
            Hier schreiben …
          </span>
        )}
      </div>

      {bearbeiten ? (
        <div className="au-vorschau">
          <p className="au-vorschau-label">
            {laeuft
              ? "Ich lese deinen Aufschrieb …"
              : visionModell
                ? "Ich habe das gelesen. Korrigier, was nicht stimmt, dann speichern."
                : "Gerade läuft keine lokale KI zum Lesen. Tipp ab, was du geschrieben hast."}
          </p>
          {fehler && (
            <p className="au-fehler" role="status">
              Das Lesen hat nicht geklappt. Tipp es ab oder versuch es nochmal.
            </p>
          )}
          <textarea
            className="au-feld"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={laeuft}
            placeholder="Dein digitalisierter Aufschrieb …"
            aria-label="Digitalisierter Aufschrieb"
          />
          <div className="au-vorschau-aktionen">
            <button
              type="button"
              className="au-speichern"
              onClick={speichern}
              disabled={laeuft || !text.trim()}
            >
              Als Material speichern
            </button>
            {visionModell && !laeuft && (
              <button
                type="button"
                className="au-nochmal"
                onClick={digitalisieren}
              >
                Nochmal lesen
              </button>
            )}
            <button
              type="button"
              className="au-zurueck"
              onClick={() => setBearbeiten(false)}
            >
              Zurück zum Zeichnen
            </button>
          </div>
        </div>
      ) : (
        <div className="au-fuss">
          <button
            type="button"
            className="au-digitalisieren"
            onClick={digitalisieren}
            disabled={striche.length === 0}
          >
            Aufschrieb digitalisieren
          </button>
          <p className="au-fuss-hinweis">
            Dein Aufschrieb bleibt auf diesem Gerät, nichts wird ins Internet
            geladen.
          </p>
        </div>
      )}
    </div>
  );
}
