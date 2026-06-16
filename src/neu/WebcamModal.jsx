import { useEffect, useRef, useState } from "react";
import "./WebcamModal.css";

// Foto per Webcam aufnehmen. Startet die Kamera beim Öffnen, friert beim
// Aufnehmen ein Standbild ein und gibt es als Daten-URL an den Chat zurück.
export default function WebcamModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [bereit, setBereit] = useState(false);
  const [fehler, setFehler] = useState(null);

  useEffect(() => {
    let abgebrochen = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (abgebrochen) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setBereit(true);
      } catch {
        setFehler(
          "Kamera nicht verfügbar oder Zugriff abgelehnt. Du kannst stattdessen ein Bild hochladen."
        );
      }
    }
    start();
    return () => {
      abgebrochen = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  function aufnehmen() {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    canvas.getContext("2d").drawImage(v, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/jpeg", 0.85));
  }

  return (
    <div className="wc-overlay" onClick={onClose}>
      <div
        className="wc-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Foto aufnehmen"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="wc-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
        <p className="wc-titel">Foto aufnehmen</p>

        {fehler ? (
          <p className="wc-fehler">{fehler}</p>
        ) : (
          <div className="wc-video-wrap">
            <video ref={videoRef} className="wc-video" playsInline muted />
            {!bereit && <span className="wc-laedt">Kamera startet …</span>}
          </div>
        )}

        <div className="wc-aktionen">
          <button type="button" className="wc-abbrechen" onClick={onClose}>
            Abbrechen
          </button>
          <button
            type="button"
            className="wc-aufnehmen"
            onClick={aufnehmen}
            disabled={!bereit || !!fehler}
          >
            Aufnehmen
          </button>
        </div>
      </div>
    </div>
  );
}
