import { useEffect, useRef, useState } from "react";
import { begleiteArbeit } from "./kiClient";
import { domBild } from "./domBild";
import { useLiveLoop } from "./useLiveLoop";
import "./LiveCoach.css";

// Live-Coach: ein bewusst einschaltbarer Modus, der beim Arbeiten mitliest und im
// Takt eine kurze, lehrerhafte Rückmeldung gibt (bestätigen plus etwas Nützliches,
// kein leeres Lob). Quelle "Bildschirm" liest die digitale Arbeitsfläche in der
// Mitte über domBild, Quelle "Kamera" beobachtet den analogen Tisch (Webcam als
// Stand-in für die spätere Tisch-Kamera). Beide füttern dieselbe Engine. Das
// Fenster ist bewusst KEIN Chat: es zeigt nur Steuerung, Status und die jeweils
// letzte Meldung; Fragen stellt man im Chats-Panel. VISION-Leitplanken:
// Default AUS (der Schüler startet selbst), lokal über Ollama, nur der Schüler
// sieht es, nichts wird gespeichert, spiegeln statt überwachen, nie die Lösung.
const TAKT_MS = 7000;

export default function LiveCoach({
  kontextName,
  materialien,
  schritt,
  inhalt,
  istMathe,
  visionModell,
  mitteRef,
  onClose,
  // Fenster zu, Modus läuft weiter: der Coach bleibt unsichtbar gemountet.
  sichtbar = true,
  // Jede Beobachtung geht als Nachricht in den Materialien-Chat (nicht mehr hier
  // im Fenster): der Chat hält so den ganzen Verlauf, und man kann nachfragen.
  onMeldung,
  // Meldet dem Fokus, ob der Live-Modus läuft (fürs Auge und das Weiterleben).
  onAktivWechsel,
  // Start (bei Bildschirm) schließt die Box; bei Kamera bleibt sie offen. Der
  // Modus bleibt an, bis er hier gestoppt wird.
  onGestartet,
  // z. B. der Zieh-Griff an der rechten Kante (Grenze zum Chats-Panel).
  children,
}) {
  const [aktiv, setAktiv] = useState(false); // Default AUS = Signal des Schülers
  const [pausiert, setPausiert] = useState(false);
  const [quelle, setQuelle] = useState("bildschirm"); // "bildschirm" | "kamera"
  const [kameraFehler, setKameraFehler] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const grabCanvasRef = useRef(null);

  // Kamera-Stream nur holen, wenn Quelle Kamera UND aktiv (Datensparsamkeit: die
  // Kamera-LED leuchtet nur, wenn der Schüler den Live-Modus mit Kamera bewusst
  // eingeschaltet hat). Tracks im Cleanup stoppen.
  useEffect(() => {
    if (!(quelle === "kamera" && aktiv)) return undefined;
    // iOS/Safari gibt die Kamera nur in sicheren Kontexten frei (https oder
    // localhost). Über eine LAN-IP per http fehlt navigator.mediaDevices
    // komplett: freundlich auffangen statt abstürzen (ErrorBoundary).
    if (!navigator.mediaDevices?.getUserMedia) {
      // Bewusste Ausnahme (wie der Show-Effekt in App.jsx): einmalige
      // Umgebungs-Prüfung beim Start des Kamera-Modus, kaskadiert nicht.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKameraFehler(
        "Die Kamera geht auf diesem Gerät leider nicht (dafür braucht die Seite eine sichere Verbindung). Nimm hier den Bildschirm-Modus."
      );
      return undefined;
    }
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
      // Kamera: live mitverfolgen und laut sagen, was gerade passiert (nie die
      // Lösung). Bildschirm bleibt der zurückhaltende Begleiter (darf STILL sein).
      modus: quelle === "kamera" ? "verfolgen" : "live",
    });
  }

  useLiveLoop({
    aktiv: aktiv && !!visionModell,
    pausiert,
    quelle,
    intervallMs: TAKT_MS,
    grabFrame,
    analysiere,
    // Beobachtungen landen im Materialien-Chat (Fokus reicht onMeldung durch).
    onMeldung,
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
    onAktivWechsel?.(true);
    onGestartet?.(quelle);
  }
  function stoppen() {
    setAktiv(false);
    setPausiert(false);
    onAktivWechsel?.(false);
  }

  return (
    <aside
      className={"fokus-live lc" + (sichtbar ? "" : " lc-verborgen")}
      aria-label="Live-Coach"
      aria-hidden={!sichtbar}
    >
      {children}
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
            {/* Quellen-Umschalter, keine echten Tabs: group + aria-pressed
                (einheitlich mit den Chip-Gruppen der App). */}
            <div className="lc-quelle" role="group" aria-label="Quelle">
              <button
                type="button"
                aria-pressed={quelle === "bildschirm"}
                className={"lc-quelle-tab" + (quelle === "bildschirm" ? " an" : "")}
                onClick={() => wechsleQuelle("bildschirm")}
              >
                Bildschirm
              </button>
              <button
                type="button"
                aria-pressed={quelle === "kamera"}
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

            {/* Ein kurzer Aktiv-Hinweis: die eigentlichen Beobachtungen laufen
                rechts im Materialien-Chat mit (voller Verlauf, Nachfragen
                möglich). */}
            {aktiv && (
              <p className="lc-status" role="status">
                {pausiert
                  ? "Pausiert. Ich schaue gerade nicht mit."
                  : "Ich lese mit, die Hinweise stehen im Chat rechts."}
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
