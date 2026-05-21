// Regelbasierte Tages-Empfehlung: "Was jetzt?" + Risiko-Hinweise.
// Kein echtes Backend, nur Heuristik über Fristen, Lernweg-Stand und Stundenplan.
import { aufgaben as seedAufgaben } from "../data/aufgaben";
import { naechsterKnb } from "../data/schule";
import { faecher } from "../data/wissen";
import { stundenHeute } from "../data/stundenplanWoche";
import { effektiveSchritte, lernwegStand, themaStatus } from "./lernstand";
import { tageBis, toMinutes, formatTage } from "./zeit";

// Freier Lern-Slot jetzt? (Studierzeit/selbstreguliert in der aktuellen Stunde)
function freierSlotJetzt(jetzt) {
  const min = jetzt.getHours() * 60 + jetzt.getMinutes();
  return stundenHeute(jetzt).find(
    (s) =>
      (s.art === "studierzeit" || s.art === "selbst") &&
      min >= toMinutes(s.von) &&
      min < toMinutes(s.bis)
  );
}

export function tagesEmpfehlung({ jetzt, erledigt = {}, lernschritte = {}, aufgaben = seedAufgaben }) {
  const ctx = { lernschritte, erledigt, aufgaben };

  const offen = aufgaben
    .map((a) => ({ ...a, tage: tageBis(a.faellig, jetzt) }))
    .filter((a) => !erledigt[a.id])
    .sort(
      (a, b) =>
        a.tage - b.tage ||
        (b.prio === "hoch" ? 1 : 0) - (a.prio === "hoch" ? 1 : 0)
    );

  const top = offen[0] || null;
  const ueberfaellig = offen.filter((a) => a.tage < 0).length;
  const heuteFaellig = offen.filter((a) => a.tage <= 0).length;
  const slot = freierSlotJetzt(jetzt);

  // Empfehlungstext fürs "Jetzt".
  let jetztText;
  if (!top) {
    jetztText = "Alles erledigt. Gönn dir eine Pause oder arbeite an einem Lernweg vor.";
  } else if (slot) {
    jetztText = `Du hast gerade ${slot.fach}. Nutze die Zeit für: ${top.titel} (${top.fach}).`;
  } else {
    jetztText = `Als Nächstes dran: ${top.titel} (${top.fach}, ${formatTage(top.tage)}).`;
  }

  // Risiko-Hinweise.
  const risiken = [];
  if (ueberfaellig > 0) {
    risiken.push(`${ueberfaellig} Aufgabe${ueberfaellig > 1 ? "n" : ""} überfällig.`);
  }
  const kbTage = tageBis(naechsterKnb.datum, jetzt);
  const fachObj = faecher.find((f) => f.fach === naechsterKnb.fach);
  if (fachObj && kbTage >= 0 && kbTage <= 6) {
    const aktiv = fachObj.themen
      .map((t) => {
        const schritte = effektiveSchritte(fachObj.id, t, ctx);
        return { schritte, status: themaStatus({ schritte }) };
      })
      .find((x) => x.status === "current");
    if (aktiv) {
      const stand = lernwegStand(aktiv.schritte);
      if (stand.fertig < stand.gesamt) {
        risiken.push(
          `Könnensbeweis ${naechsterKnb.fach} ${formatTage(kbTage)}: Lernweg erst ${stand.fertig}/${stand.gesamt}.`
        );
      }
    }
  }

  return { jetztText, top, heuteFaellig, ueberfaellig, risiken };
}
