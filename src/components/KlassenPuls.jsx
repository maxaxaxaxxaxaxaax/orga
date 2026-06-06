import { klassenPuls } from "../data/klassenPuls";
import { fachFarbe } from "../data/stundenplanWoche";
import { student } from "../data/schule";
import Begriff from "./Begriff";

// Verbands-Karte für den Wir-Reiter auf Heute. Zeigt aggregierte, anonyme
// Information über die Klasse, OHNE den Schüler in Vergleich zur Klasse zu
// stellen (keine eigene Position). Daten kommen aus klassenPuls.js und
// wandern mit der DemoBar-Time-Travel.
export default function KlassenPuls({ jetzt }) {
  const puls = klassenPuls(jetzt);
  const { schritteErledigt, wocheVon, wochenGesamt, aktiveFaecher, etappe } = puls;
  const [fach1, fach2] = aktiveFaecher;

  return (
    <section
      className="klassen-puls"
      role="region"
      aria-label={`Klassen-Puls der ${student.klasse}`}
    >
      <header className="klassen-puls-kopf">
        <h2 className="klassen-puls-titel">
          Die {student.klasse} in dieser <Begriff name="etappe">Etappe</Begriff>
        </h2>
        <p className="klassen-puls-sub">{etappe.label}</p>
      </header>

      <ul className="klassen-puls-liste">
        <li className="klassen-puls-zeile">
          <span className="klassen-puls-wert">{schritteErledigt}</span>
          <span className="klassen-puls-text">Schritte gemeinsam erledigt</span>
        </li>
        <li className="klassen-puls-zeile">
          <span className="klassen-puls-wert">
            {wocheVon}
            <span className="klassen-puls-wert-aus">/{wochenGesamt}</span>
          </span>
          <span className="klassen-puls-text">
            Im Schnitt in Etappen-Woche {wocheVon} von {wochenGesamt}
          </span>
        </li>
        <li className="klassen-puls-zeile">
          <span className="klassen-puls-faecher">
            <span
              className="fach-chip"
              style={{ "--c": fachFarbe[fach1] || "#868e96" }}
            >
              {fach1}
            </span>
            <span
              className="fach-chip"
              style={{ "--c": fachFarbe[fach2] || "#868e96" }}
            >
              {fach2}
            </span>
          </span>
          <span className="klassen-puls-text">
            Mehrheit arbeitet an {fach1} und {fach2}
          </span>
        </li>
      </ul>

      <p className="klassen-puls-hinweis">
        Du bist nicht allein. Ihr seid als Klasse gemeinsam unterwegs.
      </p>
    </section>
  );
}
