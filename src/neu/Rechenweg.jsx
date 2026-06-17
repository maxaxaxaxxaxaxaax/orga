import { useEffect, useRef, useState } from "react";
import { ladeStriche, speichereStriche } from "./rechenwegSpeicher";
import {
  pruefeVision,
  pruefeKi,
  lieRechenweg,
  pruefeRechenwegText,
  frageKi,
  systemPromptMathCoach,
} from "./kiClient";
import "./Rechenweg.css";

// Rechenweg-Schreibfläche: der Schüler hält seinen Mathe-Rechenweg handschriftlich
// fest (Stift, Touch oder Maus), in Echtzeit als digitale Tinte. Pointer Events
// liefern auch den Druck (Strichstärke). Die Striche werden reload-fest pro Ziel
// gespeichert. Erste Schicht des Prototyps: das Schreiben. Die KI-Erkennung und
// die Kipp-Punkt-Analyse setzen später auf dieser Tinte (bzw. dem Bild) auf.
//
// Das Zeichnen ist imperativ (Canvas-Kontext, laufender Strich): das passiert
// nur in Event-Handlern und Effekten, nie im Render (Ref-Regeln bleiben sauber).

// Startvorschläge für den Mathe-Coach-Chat (vor der ersten eigenen Frage).
const CHAT_VORSCHLAEGE = [
  "Wie geht der nächste Schritt?",
  "Ich komme hier nicht weiter",
  "Was ist eine negative Zahl?",
  "Schau mal auf meinen Rechenweg",
];

export default function Rechenweg({ kb, onClose }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const ctxRef = useRef(null);
  const aktuellRef = useRef(null); // laufender Strich {punkte:[{x,y,p}]}
  const [striche, setStriche] = useState(() => ladeStriche(kb.id));
  const stricheRef = useRef(striche); // Spiegel für die Zeichen-Routine
  const [visionModell, setVisionModell] = useState(null); // lokales Vision-Modell
  const [textModell, setTextModell] = useState(null); // lokales Text-Modell (Rechnen)
  const [analyse, setAnalyse] = useState(null); // { lauft, stufe, transkript, text, fehler, hinweis }

  // Mathe-Coach-Chat: Fragen stellen, während man schreibt (optional mit Handschrift-Bild).
  const [chatOffen, setChatOffen] = useState(false);
  const [chatNachrichten, setChatNachrichten] = useState(() => [
    {
      von: "ki",
      text: "Hier kannst du mir Fragen stellen, während du schreibst, etwa wie der nächste Schritt geht oder was eine negative Zahl ist. Ich gebe dir keine fertige Lösung, sondern bringe dich mit Rückfragen weiter. Deinen ganzen Weg prüfst du mit dem Knopf Rechenweg vom Coach prüfen lassen.",
    },
  ]);
  const [chatEingabe, setChatEingabe] = useState("");
  const [chatDenkt, setChatDenkt] = useState(false); // Tipp-Punkte bis zum ersten Token
  const [chatLaeuft, setChatLaeuft] = useState(false); // Anfrage in Arbeit (sperrt Senden)
  const [handschriftMit, setHandschriftMit] = useState(false);
  const chatEndeRef = useRef(null); // Autoscroll-Anker
  const chatInputRef = useRef(null); // Fokus beim Öffnen
  const chatFabRef = useRef(null); // Fokus zurück beim Schließen
  const chatWarOffenRef = useRef(false); // war der Chat schon mal offen?
  const chatAbbruchRef = useRef(null); // AbortController des laufenden Streams

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

  // Esc schließt erst den Chat (falls offen), dann das Overlay.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (chatOffen) setChatOffen(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, chatOffen]);

  // Welche lokalen Modelle laufen? Vision zum Ablesen, Text zum Nachrechnen.
  // Läuft ein Vision-Modell, ist das Handschrift-Mitschicken im Chat per Default
  // an (im Chat-Kopf abschaltbar: Datenhoheit).
  useEffect(() => {
    let aktiv = true;
    pruefeVision().then((m) => {
      if (!aktiv) return;
      setVisionModell(m);
      if (m) setHandschriftMit(true);
    });
    pruefeKi().then((m) => {
      if (aktiv) setTextModell(m);
    });
    return () => {
      aktiv = false;
    };
  }, []);

  // Fokus mitführen: beim Öffnen ins Eingabefeld, beim Schließen zurück auf den
  // Knopf, der den Chat öffnet (nur wenn er vorher offen war, nicht beim Mount).
  useEffect(() => {
    if (chatOffen) {
      chatWarOffenRef.current = true;
      chatInputRef.current?.focus();
    } else if (chatWarOffenRef.current) {
      chatFabRef.current?.focus();
    }
  }, [chatOffen]);

  // Bei neuer Nachricht ans Listenende scrollen.
  useEffect(() => {
    chatEndeRef.current?.scrollIntoView({ block: "end" });
  }, [chatNachrichten]);

  // Laufenden Chat-Stream beim Schließen des Overlays abbrechen.
  useEffect(() => {
    return () => chatAbbruchRef.current?.abort();
  }, []);

  // Den Rechenweg als Bild exportieren (dunkle Tinte auf Weiß, auf den Inhalt
  // zugeschnitten), damit das Vision-Modell ihn wie auf Papier lesen kann.
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
    const off = document.createElement("canvas");
    off.width = Math.round(w);
    off.height = Math.round(h);
    const ctx = off.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.strokeStyle = "#14202b";
    ctx.fillStyle = "#14202b";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const dx = pad - minX;
    const dy = pad - minY;
    for (const s of liste) {
      const p = s.punkte;
      if (p.length === 1) {
        ctx.beginPath();
        ctx.arc(p[0].x + dx, p[0].y + dy, 2.2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      for (let i = 1; i < p.length; i++) {
        const a = p[i - 1];
        const b = p[i];
        ctx.lineWidth = BREITE * (0.6 + (b.p || 0.5));
        ctx.beginPath();
        ctx.moveTo(a.x + dx, a.y + dy);
        ctx.lineTo(b.x + dx, b.y + dy);
        ctx.stroke();
      }
    }
    return off.toDataURL("image/png");
  }

  async function pruefen() {
    if (!stricheRef.current.length) return;
    if (!visionModell) {
      setAnalyse({
        lauft: false,
        stufe: "fehler",
        transkript: "",
        text: "",
        fehler: true,
        hinweis:
          "Für die Analyse deines Rechenwegs braucht es ein lokales KI-Vision-Modell (Ollama). Gerade läuft keins. Das Aufschreiben funktioniert trotzdem.",
      });
      return;
    }
    const bild = exportiereBild();
    if (!bild) return;
    setAnalyse({ lauft: true, stufe: "lese", transkript: "", text: "", fehler: false, hinweis: "" });
    try {
      // Schritt 1: ablesen (Vision). Schritt 2: nachrechnen (Text-Modell, sonst Vision).
      const transkript = await lieRechenweg({ bild, modell: visionModell });
      setAnalyse((a) => (a ? { ...a, stufe: "pruefe", transkript } : a));
      await pruefeRechenwegText({
        transkript,
        modell: textModell || visionModell,
        onToken: (st) =>
          setAnalyse((a) => (a ? { ...a, text: a.text + st } : a)),
      });
      setAnalyse((a) => (a ? { ...a, lauft: false } : a));
    } catch {
      setAnalyse((a) => ({
        lauft: false,
        stufe: "fehler",
        transkript: a ? a.transkript : "",
        text: "",
        fehler: true,
        hinweis: "Die Analyse hat nicht geklappt. Versuch es gleich nochmal.",
      }));
    }
  }

  // Eine Frage an den Mathe-Coach schicken. Optional reist die aktuelle
  // Handschrift als Bild mit (dann übers Vision-Modell), sonst reine Textfrage.
  async function sendeChat(text) {
    const frage = (text ?? chatEingabe).trim();
    if (!frage || chatLaeuft) return;
    const bild =
      handschriftMit && visionModell ? exportiereBild() : null;
    const modell = bild ? visionModell : textModell || visionModell;
    const verlauf = chatNachrichten;
    setChatEingabe("");
    setChatNachrichten((n) => [
      ...n,
      { von: "ich", text: frage },
      { von: "ki", text: "" },
    ]);
    setChatLaeuft(true);
    setChatDenkt(true);
    chatAbbruchRef.current?.abort();
    const ac = new AbortController();
    chatAbbruchRef.current = ac;
    const setzeLetzte = (aender) =>
      setChatNachrichten((n) => {
        const kopie = [...n];
        const i = kopie.length - 1;
        kopie[i] = aender(kopie[i]);
        return kopie;
      });
    try {
      if (!modell) throw new Error("keine KI");
      await frageKi({
        frage,
        verlauf,
        kontextName: "Rechenweg",
        materialien: [],
        modell,
        bild,
        systemText: systemPromptMathCoach(),
        signal: ac.signal,
        onToken: (stueck) => {
          setChatDenkt(false);
          setzeLetzte((m) => ({ ...m, text: m.text + stueck }));
        },
      });
    } catch (e) {
      if (e.name !== "AbortError") {
        setzeLetzte(() => ({
          von: "ki",
          text: "Ich kann gerade nicht antworten. Der Mathe-Coach braucht eine laufende lokale KI. Schreib ruhig weiter, das klappt auch ohne mich.",
        }));
      }
    } finally {
      setChatDenkt(false);
      setChatLaeuft(false);
    }
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

  const chatNochKeineFrage = !chatNachrichten.some((m) => m.von === "ich");

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

      <div className="rw-arbeit">
        <div className="rw-haupt">
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

          <div className="rw-coach">
        {analyse && (
          <div className={"rw-coach-panel" + (analyse.fehler ? " fehler" : "")}>
            <div className="rw-coach-kopf">
              <span className="rw-coach-label">Lerncoach</span>
              {!analyse.lauft && (
                <button
                  type="button"
                  className="rw-coach-zu"
                  onClick={() => setAnalyse(null)}
                >
                  Schließen
                </button>
              )}
            </div>
            {analyse.fehler ? (
              <p className="rw-coach-text">{analyse.hinweis}</p>
            ) : (
              <>
                {analyse.transkript && (
                  <p className="rw-coach-gelesen">
                    Ich lese deinen Weg als:{" "}
                    <span className="rw-coach-transkript">
                      {analyse.transkript}
                    </span>
                  </p>
                )}
                <p className="rw-coach-text">
                  {analyse.text ||
                    (analyse.stufe === "lese"
                      ? "Ich lese deinen Rechenweg …"
                      : "Ich rechne deinen Weg Schritt für Schritt nach …")}
                </p>
              </>
            )}
          </div>
        )}
          <button
            type="button"
            className="rw-pruefen"
            onClick={pruefen}
            disabled={striche.length === 0 || (analyse && analyse.lauft)}
          >
            {analyse && analyse.lauft
              ? "Der Coach schaut …"
              : "Rechenweg vom Coach prüfen lassen"}
          </button>
          </div>
        </div>

        {chatOffen && (
          <aside className="rw-chat" id="rw-chat" aria-label="Mathe-Coach Chat">
            <header className="rw-chat-kopf">
              <span className="rw-chat-titel">Mathe-Coach</span>
              <span
                className={
                  "rw-chat-modus" +
                  (textModell || visionModell ? " lokal" : "")
                }
              >
                {textModell || visionModell ? "lokale KI" : "keine KI"}
              </span>
              <label
                className="rw-chat-handschrift"
                title={
                  visionModell
                    ? "Deine Handschrift als Bild mitschicken"
                    : "Braucht ein lokales KI-Vision-Modell"
                }
              >
                <input
                  type="checkbox"
                  checked={handschriftMit}
                  disabled={!visionModell}
                  onChange={(e) => setHandschriftMit(e.target.checked)}
                  aria-label="Meinen Rechenweg mitschicken"
                />
                Weg mitschicken
              </label>
              <button
                type="button"
                className="rw-chat-zu"
                onClick={() => setChatOffen(false)}
                aria-label="Chat schließen"
              >
                Schließen
              </button>
            </header>

            <div className="rw-chat-verlauf" role="log" aria-live="polite">
              {chatNachrichten.map((m, i) => (
                <div key={i} className={"rw-chat-msg rw-chat-" + m.von}>
                  {m.text ? (
                    <p className="rw-chat-text">{m.text}</p>
                  ) : (
                    chatDenkt && (
                      <p className="rw-chat-text rw-chat-denkt">
                        <span />
                        <span />
                        <span />
                      </p>
                    )
                  )}
                </div>
              ))}
              <div ref={chatEndeRef} />
            </div>

            {chatNochKeineFrage && (
              <div className="rw-chat-vorschlaege">
                {CHAT_VORSCHLAEGE.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="rw-chat-chip"
                    onClick={() => sendeChat(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}

            <form
              className="rw-chat-eingabe"
              onSubmit={(e) => {
                e.preventDefault();
                sendeChat();
              }}
            >
              <input
                ref={chatInputRef}
                type="text"
                value={chatEingabe}
                onChange={(e) => setChatEingabe(e.target.value)}
                placeholder="Frag den Coach etwas"
                aria-label="Frage an den Mathe-Coach"
              />
              <button
                type="submit"
                className="rw-chat-senden"
                aria-label="Senden"
                disabled={chatLaeuft}
              >
                →
              </button>
            </form>

            <p className="rw-chat-fuss">
              Dein Rechenweg wird nur auf diesem Gerät angesehen, nichts wird
              ins Internet geladen.
            </p>
          </aside>
        )}

        {!chatOffen && (
          <button
            ref={chatFabRef}
            type="button"
            className="rw-chat-fab"
            onClick={() => setChatOffen(true)}
          >
            Coach fragen
          </button>
        )}
      </div>
    </div>
  );
}
