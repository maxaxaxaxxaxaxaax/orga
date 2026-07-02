// Touch-Drag für die Planer-Chips: iOS Safari kennt kein HTML5-Drag&Drop per
// Finger, deshalb ein eigener Pointer-Pfad NUR für Touch/Stift; die Maus behält
// das native Drag&Drop (echtes Drag-Bild, bewährtes Verhalten).
//
// Prinzip: pointerdown merkt sich den Start. Zieht der Finger deutlich eher
// horizontal als vertikal, startet der Drag (die Chips liegen in scrollenden
// Listen: vertikal bleibt Scrollen, dafür brauchen die Chips touch-action:
// pan-y). Ein Geist-Chip folgt dem Finger, das Ziel unterm Finger kommt über
// data-drop-Attribute (elementFromPoint), pointerup lässt fallen. Nach einem
// echten Drag wird der nachlaufende Klick geschluckt, damit der Tipp-Flow
// (antippen und Ziel wählen) nicht versehentlich mit auslöst.
import { useRef, useState } from "react";

const SCHWELLE = 12; // px, ab hier gilt die Bewegung als Drag (nicht als Tipp)

export function zielAusPunkt(x, y) {
  return (
    document.elementFromPoint(x, y)?.closest("[data-drop]")?.dataset.drop ||
    null
  );
}

export function useTouchDrag({ onStart, onHover, onDrop, onEnde }) {
  const zug = useRef(null); // { nutzlast, daten, startX, startY, aktiv }
  const klickSperre = useRef(false);
  const [geist, setGeist] = useState(null); // { ...daten, x, y }

  function beenden() {
    zug.current = null;
    setGeist(null);
    if (onEnde) onEnde();
  }

  // nutzlast = was beim Drop gemeldet wird (id oder Objekt), daten = Geist-Optik.
  function press(nutzlast, daten) {
    return {
      onPointerDown(e) {
        if (e.pointerType === "mouse") return; // Maus: natives Drag&Drop
        zug.current = {
          nutzlast,
          daten,
          startX: e.clientX,
          startY: e.clientY,
          aktiv: false,
        };
      },
      onPointerMove(e) {
        const z = zug.current;
        if (!z) return;
        if (!z.aktiv) {
          const dx = e.clientX - z.startX;
          const dy = e.clientY - z.startY;
          if (Math.abs(dx) < SCHWELLE && Math.abs(dy) < SCHWELLE) return;
          if (Math.abs(dy) > Math.abs(dx)) {
            // Eher vertikal: die Liste scrollen lassen (pointercancel folgt).
            zug.current = null;
            return;
          }
          z.aktiv = true;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* kein echter Zeiger (z. B. Test): dann ohne Capture */
          }
          if (onStart) onStart();
        }
        setGeist({ ...z.daten, x: e.clientX, y: e.clientY });
        onHover(zielAusPunkt(e.clientX, e.clientY));
      },
      onPointerUp(e) {
        const z = zug.current;
        if (!z?.aktiv) {
          zug.current = null;
          return; // war nur ein Tipp: der normale Klick läuft weiter
        }
        // Den direkt nachlaufenden Klick schlucken; die Sperre verfällt von
        // selbst, denn nicht jeder Browser feuert nach einem Drag einen Klick
        // (sonst würde sie den NÄCHSTEN echten Tipp fressen).
        klickSperre.current = true;
        setTimeout(() => {
          klickSperre.current = false;
        }, 350);
        const ziel = zielAusPunkt(e.clientX, e.clientY);
        beenden();
        onDrop(z.nutzlast, ziel);
      },
      onPointerCancel() {
        if (zug.current?.aktiv) beenden();
        else zug.current = null;
      },
      onClickCapture(e) {
        if (klickSperre.current) {
          klickSperre.current = false;
          e.preventDefault();
          e.stopPropagation();
        }
      },
    };
  }

  return { press, geist };
}
