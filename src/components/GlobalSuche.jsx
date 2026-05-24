import { useEffect, useMemo, useRef, useState } from "react";
import { aufgaben } from "../data/aufgaben";
import { nachrichten } from "../data/nachrichten";
import { faecher } from "../data/wissen";
import { stundenWoche } from "../data/stundenplanWoche";
import Icon from "./Icon";

// Durchsuchbarer Index über die ganze App (einmalig gebaut).
function baueIndex() {
  const items = [];
  aufgaben.forEach((a) =>
    items.push({ typ: "Aufgabe", view: "aufgaben", titel: a.titel, meta: a.fach })
  );
  nachrichten.forEach((n) =>
    items.push({ typ: "Nachricht", view: "kommunikation", titel: n.betreff, meta: n.von })
  );
  faecher.forEach((f) => {
    f.themen.forEach((t) =>
      items.push({ typ: "Thema", view: "wissen", titel: t.label, meta: f.fach })
    );
    f.materialien.forEach((m) =>
      items.push({ typ: "Material", view: "wissen", titel: m.titel, meta: f.fach })
    );
  });
  [...new Set(stundenWoche.map((s) => s.fach))].forEach((f) =>
    // Stundenplan lebt jetzt als Reiter in Heute, kein eigener View mehr.
    items.push({ typ: "Stundenplan", view: "heute", titel: f, meta: "Fach" })
  );
  return items;
}

export default function GlobalSuche({ onOpen, aktionen = [] }) {
  const [q, setQ] = useState("");
  const [offen, setOffen] = useState(false);
  const wrapRef = useRef(null);
  const index = useMemo(() => baueIndex(), []);

  const s = q.trim().toLowerCase();
  const aktTreffer = useMemo(
    () => (s ? aktionen.filter((a) => a.titel.toLowerCase().includes(s)).slice(0, 5) : []),
    [s, aktionen]
  );
  const treffer = useMemo(() => {
    if (!s) return [];
    return index
      .filter((it) => it.titel.toLowerCase().includes(s) || it.meta.toLowerCase().includes(s))
      .slice(0, 8);
  }, [s, index]);

  // Klick außerhalb schließt das Dropdown.
  useEffect(() => {
    function aufKlick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOffen(false);
    }
    document.addEventListener("pointerdown", aufKlick);
    return () => document.removeEventListener("pointerdown", aufKlick);
  }, []);

  function waehle(it) {
    onOpen(it.view);
    setQ("");
    setOffen(false);
  }
  function waehleAktion(a) {
    a.run();
    setQ("");
    setOffen(false);
  }

  return (
    <div className="topbar-suche-wrap" ref={wrapRef}>
      <div className="topbar-suche">
        <Icon name="suche" size={18} className="topbar-suche-icon" />
        <input
          className="topbar-suche-input"
          placeholder="Suchen: Fächer, Aufgaben, Termine …"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOffen(true);
          }}
          onFocus={() => setOffen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOffen(false);
              e.currentTarget.blur();
            }
            if (e.key === "Enter") {
              if (aktTreffer[0]) waehleAktion(aktTreffer[0]);
              else if (treffer[0]) waehle(treffer[0]);
            }
          }}
          aria-label="App durchsuchen und Befehle ausführen"
        />
        {q && (
          <button
            className="suche-clear"
            onClick={() => {
              setQ("");
              setOffen(false);
            }}
            aria-label="Suche löschen"
          >
            ×
          </button>
        )}
      </div>
      {offen && q.trim() && (
        <div className="gsuche-pop">
          {aktTreffer.length + treffer.length === 0 ? (
            <p className="gsuche-leer">Nichts gefunden für „{q.trim()}“.</p>
          ) : (
            <ul className="gsuche-liste" role="listbox">
              {aktTreffer.map((a, i) => (
                <li key={"a" + i} role="option" aria-selected="false">
                  <button className="gsuche-treffer" onClick={() => waehleAktion(a)}>
                    <span className="gsuche-typ gsuche-typ-befehl">Befehl</span>
                    <span className="gsuche-titel">{a.titel}</span>
                    <span className="gsuche-meta">↵</span>
                  </button>
                </li>
              ))}
              {treffer.map((it, i) => (
                <li key={i} role="option" aria-selected="false">
                  <button className="gsuche-treffer" onClick={() => waehle(it)}>
                    <span className="gsuche-typ">{it.typ}</span>
                    <span className="gsuche-titel">{it.titel}</span>
                    <span className="gsuche-meta">{it.meta}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
