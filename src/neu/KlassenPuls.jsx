import "./KlassenPuls.css";

// Aggregierter, anonymer Klassen-Puls (VISION: "aggregierter Klassenkontext ohne
// Personenbezug ist ausdrücklich erlaubt"; SCHULE.md Cluster 7 Isolation). Nur
// Summen: keine Namen, kein Vergleich zu deinem Stand, keine Rangliste. Ziel:
// das Gefühl, nicht allein zu lernen, und nachfragen normalisieren. Demo-Werte
// (im echten System aggregierte, selbstberichtete Daten, nie Überwachung).
const PULS = {
  klasse: "7a",
  imClusterJetzt: 19,
  beliebteFaecher: ["Französisch", "Mathematik", "Englisch"],
  hilferufeHeute: 4,
};

export default function KlassenPuls() {
  return (
    <section className="kp">
      <h2 className="kp-titel">Deine Klasse {PULS.klasse}</h2>
      <p className="kp-zeile">
        <span className="kp-zahl">{PULS.imClusterJetzt}</span> aus deiner Klasse
        lernen gerade mit dir im Cluster.
      </p>
      <p className="kp-zeile">
        Diese Woche oft dran: {PULS.beliebteFaecher.join(" · ")}.
      </p>
      <p className="kp-zeile kp-leise">
        {PULS.hilferufeHeute} aus 7a haben heute den Lerncoach gefragt:
        nachfragen ist ganz normal.
      </p>
    </section>
  );
}
