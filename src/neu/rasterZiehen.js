import { useEffect, useRef, useState } from "react";

// Geteilter Prototyp: eine senkrechte Raster-Grenze per Ziehen verschieben. Die
// Grenze rastet auf die 12 Spalten ein, lebt nur im Speicher (Reload setzt
// zurück). Genutzt von Ablage (Liste|Dokument) und Fokus (drei Grenzen); die
// Bänder/Greifpunkte sind die Komponenten in ./raster.
//
// messbereich(el) ist optional und liefert { left, width } des Bereichs, über
// dem gemessen wird. Ohne Angabe wird die volle Breite des Rasters genommen; der
// Fokus reicht eine Funktion, die die schmale Werkzeug-Spalte links abzieht.
export function useRasterZiehen(messbereich) {
  const ref = useRef(null);
  const [zieht, setZieht] = useState(null); // id der aktiven Grenze | null

  function spalteAusX(clientX) {
    const el = ref.current;
    if (!el) return null;
    let links, breite;
    if (messbereich) {
      const mb = messbereich(el);
      if (!mb) return null;
      ({ left: links, width: breite } = mb);
    } else {
      const r = el.getBoundingClientRect();
      links = r.left;
      breite = r.width;
    }
    if (!(breite > 0)) return null;
    return Math.round(((clientX - links) / breite) * 12);
  }

  // anwenden(spalte) bekommt die eingerastete Spalte (0..12) und setzt die Grenze.
  function griff(id, anwenden) {
    return {
      onPointerDown: (e) => {
        e.preventDefault();
        setZieht(id);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* kein echter Zeiger (z. B. Test): dann ohne Capture */
        }
      },
      onPointerMove: (e) => {
        if (zieht !== id) return;
        const s = spalteAusX(e.clientX);
        if (s != null) anwenden(s);
      },
      onPointerUp: (e) => {
        setZieht(null);
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* Zeiger schon freigegeben */
        }
      },
    };
  }

  return { ref, zieht, griff };
}

// Variante mit kontinuierlichem Morph + federndem Einrasten (Übersicht): die
// aktive Grenze folgt beim Ziehen der Maus und rastet nahe ganzer Spalten
// magnetisch ein. Statt hart zu stoppen läuft sie über eine Feder (rAF, mit
// leichtem Überschwingen) aus -> fluides "Wackeln" beim Stillstand und beim
// Loslassen. drag = { id, wert } während Ziehen/Auslaufen, sonst null.
export function useRasterMorph() {
  const ref = useRef(null);
  const [drag, setDrag] = useState(null);
  // Feder-Zustand außerhalb des Renders.
  const sim = useRef({
    id: null,
    ziel: 0, // Zielspalte (gerastet)
    wert: 0, // aktueller Federwert
    v: 0, // Geschwindigkeit
    raf: 0,
    aktiv: false, // Finger unten -> folgt der Maus
    min: 0,
    max: 12,
    commit: null,
    zumNaechsten: null, // optional: überschreibt Math.round beim Einrasten
  });

  useEffect(() => {
    const s = sim.current; // stabiles Objekt; .raf wird live aktualisiert
    return () => {
      if (s.raf) cancelAnimationFrame(s.raf);
    };
  }, []);

  function spalteAusX(clientX) {
    const el = ref.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!(r.width > 0)) return null;
    return ((clientX - r.left) / r.width) * 12;
  }

  // Ein Federschritt: zieht wert mit Überschwingen zum ziel. Läuft, solange der
  // Finger unten ist (folgen) oder bis die Feder nach dem Loslassen steht.
  function tick() {
    const s = sim.current;
    s.v += (s.ziel - s.wert) * 0.34;
    s.v *= 0.5;
    s.wert += s.v;
    const steht = Math.abs(s.ziel - s.wert) < 0.0015 && Math.abs(s.v) < 0.0015;
    if (steht && !s.aktiv) {
      // Nach dem Loslassen ausgelaufen: auf ganze Spalte fixieren + committen.
      s.wert = s.ziel;
      s.v = 0;
      s.raf = 0;
      if (s.commit) s.commit(Math.round(s.wert));
      setDrag(null);
      s.id = null;
      return;
    }
    if (steht) {
      s.wert = s.ziel;
      s.v = 0;
    }
    setDrag({ id: s.id, wert: s.wert });
    s.raf = requestAnimationFrame(tick);
  }

  function starte() {
    if (!sim.current.raf) sim.current.raf = requestAnimationFrame(tick);
  }

  // grenzeZieh(id, start, { min, max, commit }): start = aktueller Wert, min/max =
  // Klemmung (aus der anderen Grenze), commit(spalte) schreibt die gerastete Spalte.
  function grenzeZieh(id, start, opts) {
    return {
      onPointerDown: (e) => {
        e.preventDefault();
        const s = sim.current;
        s.id = id;
        s.ziel = start;
        s.wert = start;
        s.v = 0;
        s.aktiv = true;
        s.min = opts.min;
        s.max = opts.max;
        s.commit = opts.commit;
        s.zumNaechsten = opts.zumNaechsten || null;
        setDrag({ id, wert: start });
        starte();
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* kein echter Zeiger */
        }
      },
      onPointerMove: (e) => {
        const s = sim.current;
        if (!s.aktiv || s.id !== id) return;
        const roh = spalteAusX(e.clientX);
        if (roh == null) return;
        const c = Math.max(s.min, Math.min(s.max, roh));
        const nah = s.zumNaechsten ? s.zumNaechsten(c) : Math.round(c);
        s.ziel = Math.abs(c - nah) <= 0.18 ? nah : c; // magnetisch einrasten
        starte();
      },
      onPointerUp: (e) => {
        const s = sim.current;
        if (s.id === id) {
          s.aktiv = false;
          const rund = s.zumNaechsten ? s.zumNaechsten(s.ziel) : Math.round(s.ziel);
          s.ziel = rund; // auf ganze Spalte, Feder läuft dorthin aus
          starte();
        }
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* schon freigegeben */
        }
      },
      onPointerCancel: () => {
        const s = sim.current;
        if (s.id === id) {
          s.aktiv = false;
          s.ziel = s.zumNaechsten ? s.zumNaechsten(s.wert) : Math.round(s.wert);
          starte();
        }
      },
    };
  }

  return { ref, drag, grenzeZieh };
}
