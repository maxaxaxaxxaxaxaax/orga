import { useRef, useState } from "react";

// Geteilter Prototyp: eine senkrechte Raster-Grenze per Ziehen verschieben. Die
// Grenze rastet auf die 12 Spalten ein, lebt nur im Speicher (Reload setzt
// zurück). Genutzt von Übersicht, Ablage und Fokus (die Bänder/Greifpunkte sind
// die Komponenten in ./raster).
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

// Variante mit kontinuierlichem Morph + magnetischem Einrasten (Übersicht): die
// aktive Grenze folgt beim Ziehen flüssig der Maus, rastet nur nahe ganzer
// Spalten ein ("einhacken") und schnappt beim Loslassen auf die ganze Spalte.
// drag = { id, wert } während des Ziehens (wert kann gebrochen sein), sonst null.
export function useRasterMorph() {
  const ref = useRef(null);
  const [drag, setDrag] = useState(null);

  function spalteAusX(clientX) {
    const el = ref.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!(r.width > 0)) return null;
    return ((clientX - r.left) / r.width) * 12;
  }

  // grenzeZieh(id, start, { min, max, commit }): start = aktueller Wert der
  // Grenze, min/max = Klemmung (aus der anderen Grenze), commit(spalte) schreibt
  // die gerastete Spalte beim Loslassen.
  function grenzeZieh(id, start, opts) {
    return {
      onPointerDown: (e) => {
        e.preventDefault();
        setDrag({ id, wert: start });
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* kein echter Zeiger */
        }
      },
      onPointerMove: (e) => {
        const roh = spalteAusX(e.clientX);
        if (roh == null) return;
        setDrag((d) => {
          if (!d || d.id !== id) return d;
          const c = Math.max(opts.min, Math.min(opts.max, roh));
          const nah = Math.round(c);
          const wert = Math.abs(c - nah) <= 0.18 ? nah : c;
          return d.wert === wert ? d : { id, wert };
        });
      },
      onPointerUp: (e) => {
        setDrag((d) => {
          if (d && d.id === id) opts.commit(Math.round(d.wert));
          return null;
        });
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* schon freigegeben */
        }
      },
      onPointerCancel: () => setDrag(null),
    };
  }

  return { ref, drag, grenzeZieh };
}
