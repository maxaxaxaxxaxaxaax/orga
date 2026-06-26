import { useEffect, useRef } from "react";

// Live-Loop-Engine: nimmt im Takt einen Frame (grabFrame) und lässt ihn ansehen
// (analysiere). Selbst-planend mit setTimeout (kein Stau, wenn ein Blick länger
// dauert als der Takt), bricht veraltete Anfragen ab (AbortController), überspringt
// unveränderte Frames (grobe Signatur, kein Spam), pausiert bei verstecktem Tab und
// räumt sauber auf. Quellen-unabhängig: grabFrame/analysiere kommen von außen.

// Grobe Frame-Signatur gegen Spam: identische Frames (Schüler denkt nach) sollen
// keinen neuen KI-Blick auslösen. Bewusst grob (keine Pixel-Analyse): Länge plus
// charCodes an gestreuten Positionen der Daten-URL.
function frameHash(dataUrl) {
  let h = dataUrl.length;
  const schritt = Math.max(1, Math.floor(dataUrl.length / 512));
  for (let i = 0; i < dataUrl.length; i += schritt) {
    h = (h * 31 + dataUrl.charCodeAt(i)) | 0;
  }
  return h;
}

export function useLiveLoop({
  aktiv,
  pausiert,
  quelle,
  intervallMs = 7000,
  grabFrame,
  analysiere,
  onMeldung,
  onStatus,
}) {
  // Callbacks in einem Ref spiegeln, damit der Loop-Effekt nicht bei jeder
  // Render-Identität neu startet (nur Takt/Quelle/aktiv sollen ihn neu starten).
  const cbRef = useRef({});
  useEffect(() => {
    cbRef.current = { grabFrame, analysiere, onMeldung, onStatus };
  });

  const timerRef = useRef(null);
  const abbruchRef = useRef(null);
  const letzterHashRef = useRef(null);

  useEffect(() => {
    if (!aktiv || pausiert) return undefined;
    let lebt = true;

    async function einBlick() {
      const cb = cbRef.current;
      cb.onStatus?.("schaut");
      let bild;
      try {
        bild = await cb.grabFrame();
      } catch {
        bild = null;
      }
      if (!lebt) return;
      if (!bild) {
        cb.onStatus?.("keinframe");
        plane();
        return;
      }
      const h = frameHash(bild);
      if (h === letzterHashRef.current) {
        cb.onStatus?.("ruhig");
        plane();
        return;
      }
      letzterHashRef.current = h;
      abbruchRef.current?.abort();
      const ac = new AbortController();
      abbruchRef.current = ac;
      try {
        let voll = "";
        await cb.analysiere({
          bild,
          signal: ac.signal,
          onToken: (s) => {
            voll += s;
          },
        });
        if (lebt && voll.trim()) cb.onMeldung?.(voll.trim());
        if (lebt) cb.onStatus?.("bereit");
      } catch (e) {
        if (e.name !== "AbortError" && lebt) cb.onStatus?.("fehler");
      } finally {
        if (lebt) plane();
      }
    }

    function plane() {
      if (lebt) timerRef.current = setTimeout(einBlick, intervallMs);
    }

    // Versteckter Tab: nichts senden (Frame wäre nutzlos), beim Zurückkommen weiter.
    function onSicht() {
      if (document.hidden) {
        clearTimeout(timerRef.current);
        abbruchRef.current?.abort();
      } else if (lebt) {
        clearTimeout(timerRef.current);
        einBlick();
      }
    }
    document.addEventListener("visibilitychange", onSicht);

    letzterHashRef.current = null;
    einBlick(); // erster Blick sofort, dann im Takt

    return () => {
      lebt = false;
      clearTimeout(timerRef.current);
      abbruchRef.current?.abort();
      document.removeEventListener("visibilitychange", onSicht);
    };
    // Callbacks liegen stabil in cbRef; der Effekt startet nur bei Takt-/Quellen-/aktiv-Wechsel neu.
  }, [aktiv, pausiert, quelle, intervallMs]);
}
