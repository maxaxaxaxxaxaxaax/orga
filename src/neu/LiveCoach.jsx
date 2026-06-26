import { useEffect, useRef, useState } from "react";
import { begleiteArbeit, frageKi, systemPromptLiveBegleiter } from "./kiClient";
import { domBild } from "./domBild";
import { useLiveLoop } from "./useLiveLoop";
import "./LiveCoach.css";

// Live-Coach: ein bewusst einschaltbarer Modus, der beim Arbeiten mitliest und im
// Takt eine kurze, lehrerhafte Rückmeldung gibt (bestätigen plus etwas Nützliches,
// kein leeres Lob). Quelle "Bildschirm" liest die digitale Arbeitsfläche in der
// Mitte über domBild, Quelle "Kamera" beobachtet den analogen Tisch (Webcam als
// Stand-in für die spätere Tisch-Kamera). Beide füttern dieselbe Engine. Unten ein
// Antwortfeld für echten Dialog: man kann zurückfragen, der Coach sieht den
// aktuellen Frame und kennt den konkreten Aufgaben-Inhalt. VISION-Leitplanken:
// Default AUS (der Schüler startet selbst), lokal über Ollama, nur der Schüler
// sieht es, nichts wird gespeichert, spiegeln statt überwachen, nie die Lösung.
const TAKT_MS = 7000;
const FEED_MAX = 8;

const STATUS_TEXT = {
  schaut: "Ich schaue gerade kurz hin …",
  ruhig: "Alles ruhig, ich warte auf den nächsten Schritt.",
  keinframe:
    "Diese Ansicht kann ich gerade nicht mitlesen. Schalte auf Kamera um oder öffne ein anderes Material.",
  bereit: "Ich lese mit.",
  fehler: "Das hat gerade nicht geklappt, ich versuche es gleich wieder.",
};

export default function LiveCoach({
  kontextName,
  materialien,
  schritt,
  inhalt,
  istMathe,
  visionModell,
  mitteRef,
  onClose,
}) {
  const [aktiv, setAktiv] = useState(false); // Default AUS = Signal des Schülers
  const [pausiert, setPausiert] = useState(false);
  const [quelle, setQuelle] = useState("bildschirm"); // "bildschirm" | "kamera"
  const [feed, setFeed] = useState([]); // ephemer, gedeckelt, nichts gespeichert
  const [status, setStatus] = useState(null);
  const [kameraFehler, setKameraFehler] = useState(null);
  const [frageEntwurf, setFrageEntwurf] = useState("");
  const [antwortet, setAntwortet] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const grabCanvasRef = useRef(null);
  const idRef = useRef(0);
  const feedEndeRef = useRef(null);
  const replyAbortRef = useRef(null);

  // Kamera-Stream nur holen, wenn Quelle Kamera UND aktiv (Datensparsamkeit: die
  // Kamera-LED leuchtet nur, wenn der Schüler den Live-Modus mit Kamera bewusst
  // eingeschaltet hat). Tracks im Cleanup stoppen.
  useEffect(() => {
    if (!(quelle === "kamera" && aktiv)) return undefined;
    let abgebrochen = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        if (abgebrochen) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {
        if (!abgebrochen)
          setKameraFehler(
            "Kamera nicht verfügbar oder Zugriff abgelehnt. Du kannst stattdessen den Bildschirm mitlesen lassen."
          );
      });
    return () => {
      abgebrochen = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [quelle, aktiv]);

  // Laufende Antwort beim Schließen abbrechen.
  useEffect(() => () => replyAbortRef.current?.abort(), []);

  // Neue Meldung ans Feed-Ende scrollen.
  useEffect(() => {
    feedEndeRef.current?.scrollIntoView({ block: "end" });
  }, [feed]);

  // Frame der gewählten Quelle holen. Bildschirm: echter DOM-Screenshot der Mitte.
  // Kamera: aktuelles Video-Standbild auf ein wiederverwendetes Offscreen-Canvas.
  async function grabFrame() {
    if (quelle === "kamera") {
      const v = videoRef.current;
      if (!v || !v.videoWidth) return null;
      const c =
        grabCanvasRef.current ||
        (grabCanvasRef.current = document.createElement("canvas"));
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
      return c.toDataURL("image/jpeg", 0.7);
    }
    return domBild(mitteRef?.current);
  }

  async function analysiere({ bild, signal, onToken }) {
    await begleiteArbeit({
      bild,
      kontextName,
      materialien,
      schritt,
      inhalt,
      istMathe,
      visionModell,
      onToken,
      signal,
    });
  }

  function meldung(text) {
    idRef.current += 1;
    const id = idRef.current;
    setFeed((f) => [...f, { id, von: "coach", text }].slice(-FEED_MAX));
  }

  useLiveLoop({
    aktiv: aktiv && !!visionModell,
    pausiert,
    quelle,
    intervallMs: TAKT_MS,
    grabFrame,
    analysiere,
    onMeldung: meldung,
    onStatus: setStatus,
  });

  function wechsleQuelle(q) {
    if (q === quelle) return;
    setKameraFehler(null);
    setQuelle(q);
  }
  function starten() {
    setKameraFehler(null);
    setPausiert(false);
    setAktiv(true);
  }
  function stoppen() {
    setAktiv(false);
    setPausiert(false);
    setStatus(null);
  }

  // Dialog: der Schüler fragt zurück. Der Coach sieht den aktuellen Frame (falls
  // vorhanden) und kennt den konkreten Aufgaben-Inhalt über den Systemtext.
  async function senden(e) {
    if (e) e.preventDefault();
    const f = frageEntwurf.trim();
    if (!f || !visionModell || antwortet) return;
    setFrageEntwurf("");
    idRef.current += 1;
    const duId = idRef.current;
    idRef.current += 1;
    const coachId = idRef.current;
    const verlauf = feed.map((m) => ({
      von: m.von === "du" ? "ich" : "ki",
      text: m.text,
    }));
    setFeed((prev) =>
      [
        ...prev,
        { id: duId, von: "du", text: f },
        { id: coachId, von: "coach", text: "" },
      ].slice(-FEED_MAX)
    );
    setAntwortet(true);
    replyAbortRef.current?.abort();
    const ac = new AbortController();
    replyAbortRef.current = ac;
    let bild;
    try {
      bild = await grabFrame();
    } catch {
      bild = null;
    }
    try {
      let voll = "";
      await frageKi({
        frage: f,
        verlauf,
        kontextName,
        materialien: [],
        modell: visionModell,
        bild,
        systemText: systemPromptLiveBegleiter({
          kontextName,
          materialien,
          schritt,
          inhalt,
        }),
        signal: ac.signal,
        onToken: (s) => {
          voll += s;
          setFeed((prev) =>
            prev.map((m) => (m.id === coachId ? { ...m, text: voll } : m))
          );
        },
      });
      if (!voll.trim()) {
        setFeed((prev) =>
          prev.map((m) =>
            m.id === coachId
              ? { ...m, text: "Ich kann gerade nicht antworten, versuch es gleich nochmal." }
              : m
          )
        );
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setFeed((prev) =>
          prev.map((m) =>
            m.id === coachId
              ? { ...m, text: "Ich kann gerade nicht antworten, versuch es gleich nochmal." }
              : m
          )
        );
      }
    } finally {
      setAntwortet(false);
    }
  }

  return (
    <aside className="fokus-panel fokus-panel-live lc" aria-label="Live-Coach">
      <header className="fokus-panel-kopf">
        <span className="fokus-panel-titel">Live-Coach</span>
        <button
          type="button"
          className="fokus-panel-zu"
          onClick={onClose}
          aria-label="Live-Coach schließen"
        >
          ✕
        </button>
      </header>

      <div className="lc-inhalt">
        <p className="lc-datenschutz">
          Läuft lokal auf deinem Gerät. Nur du siehst das, nichts geht an die
          Lehrkraft. Du kannst es jederzeit ausschalten.
        </p>

        {!visionModell ? (
          <p className="lc-keinki">
            Für den Live-Coach brauche ich ein lokales KI-Vision-Modell (Ollama).
            Gerade läuft keins. Die anderen Werkzeuge (Rechenweg, Aufschrieb,
            Markieren) helfen dir trotzdem weiter.
          </p>
        ) : (
          <>
            <div className="lc-quelle" role="tablist" aria-label="Quelle">
              <button
                type="button"
                role="tab"
                aria-selected={quelle === "bildschirm"}
                className={"lc-quelle-tab" + (quelle === "bildschirm" ? " an" : "")}
                onClick={() => wechsleQuelle("bildschirm")}
              >
                Bildschirm
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={quelle === "kamera"}
                className={"lc-quelle-tab" + (quelle === "kamera" ? " an" : "")}
                onClick={() => wechsleQuelle("kamera")}
              >
                Kamera (am Tisch)
              </button>
            </div>

            <div className="lc-vorschau">
              {quelle === "kamera" ? (
                kameraFehler ? (
                  <p className="lc-fehler">{kameraFehler}</p>
                ) : aktiv ? (
                  <video ref={videoRef} className="lc-video" playsInline muted />
                ) : (
                  <p className="lc-vorschau-hint">
                    Richte die Kamera auf dein Blatt und starte den Live-Coach.
                  </p>
                )
              ) : (
                <p className="lc-vorschau-hint">
                  Ich lese deine Arbeitsfläche in der Mitte mit.
                </p>
              )}
            </div>

            <div className="lc-steuer">
              {!aktiv ? (
                <button type="button" className="lc-start" onClick={starten}>
                  Live-Coach starten
                </button>
              ) : (
                <>
                  <button type="button" className="lc-stop" onClick={stoppen}>
                    Stopp
                  </button>
                  <button
                    type="button"
                    className="lc-pause"
                    onClick={() => setPausiert((p) => !p)}
                  >
                    {pausiert ? "Weiter" : "Pause"}
                  </button>
                </>
              )}
            </div>

            {aktiv && (
              <p className="lc-status" role="status">
                {pausiert
                  ? "Pausiert. Ich schaue gerade nicht mit."
                  : STATUS_TEXT[status] || "Ich lese mit."}
              </p>
            )}

            <div className="lc-feed" role="log" aria-live="polite">
              {feed.length === 0 ? (
                <p className="lc-feed-leer">
                  Starte den Live-Coach oder frag mich direkt etwas zur Aufgabe.
                </p>
              ) : (
                feed.map((m) => (
                  <div key={m.id} className={"lc-meldung lc-" + m.von}>
                    <span className="lc-meldung-label">
                      {m.von === "du" ? "Du" : "Live-Coach"}
                    </span>
                    <p className="lc-meldung-text">
                      {m.text || (antwortet ? "…" : "")}
                    </p>
                  </div>
                ))
              )}
              <div ref={feedEndeRef} />
            </div>

            <form className="lc-frage" onSubmit={senden}>
              <input
                type="text"
                value={frageEntwurf}
                onChange={(e) => setFrageEntwurf(e.target.value)}
                placeholder="Frag den Coach etwas zur Aufgabe"
                aria-label="Frage an den Live-Coach"
                disabled={antwortet}
              />
              <button
                type="submit"
                className="lc-frage-senden"
                aria-label="Senden"
                disabled={antwortet || !frageEntwurf.trim()}
              >
                →
              </button>
            </form>
          </>
        )}
      </div>
    </aside>
  );
}
