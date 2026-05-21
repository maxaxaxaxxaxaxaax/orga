import { useState } from "react";
import {
  koennensbeweise,
  kbFaecher,
  kbFarbe,
  kbThemen,
  etappeWochen,
  wochenZielCluster,
  systemHinweis,
  startZuordnung,
} from "../data/koennensbeweise";
import { etappen, aktuelleEtappe } from "../data/etappen";
import Icon from "./Icon";

function isoKW(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((t - first) / 86400000 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
}
const fmtDatum = (iso) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "numeric", month: "short" });

function Cluster({ n }) {
  return (
    <span className="cluster" title={n + " Clusterstunden"}>
      {Array.from({ length: n }).map((_, i) => (
        <Icon key={i} name="uhr" size={13} />
      ))}
    </span>
  );
}

export default function Wochenplaner({ jetzt = new Date() }) {
  const [zuordnung, setZuordnung] = useState(startZuordnung);
  const [aktiv, setAktiv] = useState(0);
  const [ueber, setUeber] = useState(null);

  // Etappenziel-Navigation (durch die Schuljahres-Etappen springen).
  const aktuelleIdx = Math.max(
    0,
    etappen.findIndex((e) => e.id === aktuelleEtappe(jetzt).id)
  );
  const [etappeIdx, setEtappeIdx] = useState(aktuelleIdx);
  const etappe = etappen[etappeIdx];
  const istAktuell = etappeIdx === aktuelleIdx;

  const byId = Object.fromEntries(koennensbeweise.map((k) => [k.id, k]));
  const pflichtId = systemHinweis.pflichtId;
  const gesperrt = systemHinweis.gesperrtesFach;
  const kw0 = isoKW(jetzt);

  function zuordnen(id, woche) {
    const k = byId[id];
    if (!k || k.fach === gesperrt) return;
    setZuordnung((z) => ({ ...z, [id]: woche }));
  }
  function entfernen(id) {
    if (id === pflichtId) return;
    setZuordnung((z) => {
      const n = { ...z };
      delete n[id];
      return n;
    });
  }

  function autoVerteilen() {
    setZuordnung((z) => {
      const n = { ...z };
      const summen = Array.from({ length: etappeWochen }, () => 0);
      const faecherProWoche = Array.from({ length: etappeWochen }, () => new Set());
      for (const k of koennensbeweise) {
        if (n[k.id] != null) {
          summen[n[k.id]] += k.cluster;
          faecherProWoche[n[k.id]].add(k.fach);
        }
      }
      const proFach = {};
      for (const k of koennensbeweise) {
        if (k.fach === gesperrt || n[k.id] != null) continue;
        (proFach[k.fach] ||= []).push(k);
      }
      const reihen = Object.values(proFach);
      const reihenfolge = [];
      for (let i = 0; reihen.some((r) => i < r.length); i++) {
        for (const r of reihen) if (i < r.length) reihenfolge.push(r[i]);
      }
      for (const k of reihenfolge) {
        const punkte = (w) =>
          (summen[w] + k.cluster <= wochenZielCluster ? 0 : 100) +
          (faecherProWoche[w].has(k.fach) ? 10 : 0) +
          summen[w] / 100;
        let ziel = 0;
        for (let w = 1; w < etappeWochen; w++) if (punkte(w) < punkte(ziel)) ziel = w;
        n[k.id] = ziel;
        summen[ziel] += k.cluster;
        faecherProWoche[ziel].add(k.fach);
      }
      return n;
    });
  }

  const summeWoche = (w) =>
    koennensbeweise.filter((k) => zuordnung[k.id] === w).reduce((s, k) => s + k.cluster, 0);
  const gesamtAlle = koennensbeweise.reduce((s, k) => s + k.cluster, 0);
  const verplant = koennensbeweise
    .filter((k) => zuordnung[k.id] != null)
    .reduce((s, k) => s + k.cluster, 0);

  return (
    <div className="planer">
      {/* Etappenziel mit Navigation */}
      <section className="fokus">
        <div className="etappe-nav">
          <button
            className="etappe-pfeil"
            disabled={etappeIdx === 0}
            onClick={() => setEtappeIdx(etappeIdx - 1)}
            aria-label="Vorherige Etappe"
          >
            ‹
          </button>
          <span className="label label-light">
            Etappe {etappeIdx + 1} von {etappen.length}{istAktuell ? " · aktuell" : ""}
          </span>
          <button
            className="etappe-pfeil"
            disabled={etappeIdx === etappen.length - 1}
            onClick={() => setEtappeIdx(etappeIdx + 1)}
            aria-label="Nächste Etappe"
          >
            ›
          </button>
        </div>
        <h2 className="fokus-titel">{etappe.label}</h2>
        <p className="fokus-meta">{fmtDatum(etappe.von)} – {fmtDatum(etappe.bis)} · {etappe.ziel}</p>
      </section>

      {!istAktuell ? (
        <p className="woche-leer etappe-leer">
          {etappeIdx < aktuelleIdx
            ? "Diese Etappe ist abgeschlossen."
            : "Diese Etappe kommt noch. Geplant wird, sobald sie aktiv ist."}
        </p>
      ) : (
        <>
          <div className="planer-hilfe">
            <Icon name="funke" size={18} />
            <span>
              Oben der ganze{" "}
              <strong title="Schuljahres-Abschnitt von Ferien zu Ferien">Etappenplan</strong> mit
              allen{" "}
              <strong title="Aufgaben, mit denen du zeigst, dass du etwas kannst – statt Noten">Könnensbeweisen</strong>.
              Wähle unten eine <strong>Woche</strong> und füge sie mit <strong>+</strong> hinzu (oder
              zieh sie auf einen Wochenblock). Ziel: ca. <strong>{wochenZielCluster}</strong>{" "}
              <strong title="Lernzeit-Einheiten (Uhr-Symbole) – so viel Zeit kostet ein Könnensbeweis">Clusterstunden</strong>{" "}
              pro Woche.
            </span>
          </div>

          <div className="sys-hinweis">
            <Icon name="glocke" size={18} className="sys-hinweis-icon" />
            <div>
              <p className="sys-hinweis-titel">Tipp vom System</p>
              <p className="sys-hinweis-text">{systemHinweis.text}</p>
            </div>
          </div>

          {/* Etappenplan oben, volle Breite */}
          <div className="board-leiste">
            <span className="board-kopf">Etappenplan · {etappe.kurz}</span>
            <button className="vorschlag-btn vorschlag-klein" onClick={autoVerteilen}>
              <Icon name="funke" size={15} /> Automatisch & divers aufteilen
            </button>
          </div>
          <section className="planer-board">
            <div
              className="board-spalten"
              style={{ gridTemplateColumns: `repeat(${kbFaecher.length}, minmax(0, 1fr))` }}
            >
              {kbFaecher.map((fach) => {
                const farbe = kbFarbe[fach] || "#868e96";
                const istGesperrt = fach === gesperrt;
                const karten = koennensbeweise.filter((k) => k.fach === fach);
                return (
                  <div
                    key={fach}
                    className={"board-spalte" + (istGesperrt ? " gesperrt" : "")}
                    style={{ "--c": farbe }}
                  >
                    <div className="board-spalte-kopf">
                      <span className="board-punkt" style={{ background: farbe }} />
                      {fach}
                    </div>
                    <div className="board-thema">{kbThemen[fach]}</div>
                    {istGesperrt && <div className="board-sperre">🔒 Gesperrt · erst Mathe abschließen</div>}
                    {karten.map((k) => {
                      const wk = zuordnung[k.id];
                      const hier = wk === aktiv;
                      const woanders = wk != null && wk !== aktiv;
                      return (
                        <div
                          key={k.id}
                          className={"board-karte" + (wk != null ? " geplant" : "") + (istGesperrt ? " gesperrt" : "")}
                          draggable={!istGesperrt}
                          aria-label={`${k.code} ${k.titel} – in eine Woche einplanen`}
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", k.id)}
                        >
                          <span className="kb-code">{k.code}</span>
                          <span className="board-karte-titel">{k.titel}</span>
                          <span className="board-karte-fuss">
                            <Cluster n={k.cluster} />
                            {k.id === pflichtId && <span className="pflicht-badge">Pflicht</span>}
                          </span>
                          {!istGesperrt &&
                            (hier ? (
                              <button className="board-add geplant-btn" onClick={() => entfernen(k.id)}>
                                ✓ in Woche {aktiv + 1}
                              </button>
                            ) : woanders ? (
                              <button className="board-add board-add-move" onClick={() => zuordnen(k.id, aktiv)}>
                                Woche {wk + 1} → Woche {aktiv + 1}
                              </button>
                            ) : (
                              <button className="board-add" onClick={() => zuordnen(k.id, aktiv)}>
                                + in Woche {aktiv + 1}
                              </button>
                            ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </section>

          <p className="etappe-fortschritt">
            {verplant} von {gesamtAlle} Clusterstunden auf Wochen verteilt ·
            wähle unten eine Woche zum Hinzufügen
          </p>

          {/* Wochenblöcke unten */}
          <div className="wochen-bloecke">
            {Array.from({ length: etappeWochen }).map((_, w) => {
              const kbs = koennensbeweise.filter((k) => zuordnung[k.id] === w);
              const sum = summeWoche(w);
              const pct = Math.min(100, Math.round((sum / wochenZielCluster) * 100));
              const voll = sum > wochenZielCluster;
              return (
                <div
                  key={w}
                  className={"wochen-block" + (w === aktiv ? " aktiv" : "") + (ueber === w ? " ueber" : "")}
                  onClick={() => setAktiv(w)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setUeber(w)}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setUeber(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setUeber(null);
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) zuordnen(id, w);
                  }}
                >
                  <div className="wblock-kopf">
                    <span className="wblock-titel">Woche {w + 1}</span>
                    <span className="wblock-kw">KW {kw0 + w}</span>
                    <span className={"wblock-last" + (voll ? " voll" : "")}>{sum}/{wochenZielCluster}</span>
                  </div>
                  <div className="balken wblock-balken">
                    <div
                      className={"balken-fuell" + (sum >= wochenZielCluster ? " fertig" : "")}
                      style={{ width: pct + "%" }}
                    />
                  </div>
                  {kbs.length === 0 ? (
                    <p className="wblock-leer">Klick mich an und füge oben Könnensbeweise hinzu.</p>
                  ) : (
                    <ul className="wblock-liste">
                      {kbs.map((k) => {
                        const farbe = kbFarbe[k.fach] || "#868e96";
                        return (
                          <li key={k.id} className="wblock-item" style={{ "--c": farbe }}>
                            <span className="wblock-code">{k.code}</span>
                            <span className="wblock-item-titel">{k.titel}</span>
                            <Cluster n={k.cluster} />
                            {k.id === pflichtId ? (
                              <span className="woche-item-fix" title="Vom System zugeteilt">★</span>
                            ) : (
                              <button
                                className="woche-item-x"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  entfernen(k.id);
                                }}
                                aria-label="Entfernen"
                              >
                                ×
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
