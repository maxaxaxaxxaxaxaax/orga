// Demo-Assistent: ohne Backend, heuristische Antworten, die die Materialien des
// aktuellen Kontexts kennen und beim Namen nennen. Ersetzt später ein echtes LLM.

function titelListe(materialien, max = 4) {
  const teile = materialien.slice(0, max).map((m) => `„${m.titel}"`);
  if (materialien.length > max) {
    teile.push(`und ${materialien.length - max} weitere`);
  }
  return teile.join(", ");
}

// Bestes Material zum Einstieg: Überblick vor Notiz vor Arbeitsblatt.
function bestes(materialien) {
  const reihenfolge = ["zusammenfassung", "notiz", "tafelnotiz", "arbeitsblatt"];
  for (const art of reihenfolge) {
    const t = materialien.find((m) => m.art === art);
    if (t) return t;
  }
  return materialien[0] || null;
}

export function introNachricht({ kontextName, materialien }) {
  if (!materialien.length) {
    return {
      text: `Zu ${kontextName} sind noch keine Materialien da. Lade oben mit „+ Material" etwas hoch, dann helfe ich dir damit.`,
    };
  }
  const wort = materialien.length === 1 ? "Material" : "Materialien";
  return {
    text: `Du hast ${materialien.length} ${wort} zu ${kontextName}: ${titelListe(
      materialien
    )}. Frag mich, was du damit machen kannst.`,
  };
}

export function antwortAuf(frage, { materialien }) {
  const f = frage.toLowerCase();
  if (!materialien.length) {
    return {
      text: "Dazu habe ich noch keine Materialien. Lade etwas hoch, dann schauen wir es uns zusammen an.",
    };
  }
  const finde = (art) => materialien.find((m) => m.art === art);

  if (/welche|was f[uü]r|was hab|liste|alle materi/.test(f)) {
    return {
      text: `Du hast: ${titelListe(materialien, 8)}.`,
      quellen: materialien.slice(0, 8).map((m) => m.titel),
    };
  }
  if (/[uü]ben|[uü]bung|aufgabe|test|pr[uü]fung|quiz|trainier/.test(f)) {
    const ab = finde("arbeitsblatt") || bestes(materialien);
    return {
      text: ab
        ? `Zum Üben nimm „${ab.titel}". Im Lernweg kannst du außerdem direkt eine Übung starten.`
        : "Im Lernweg kannst du direkt eine Übung starten.",
      quellen: ab ? [ab.titel] : [],
    };
  }
  if (/zusammenfass|kurz|wichtigste|merk|[uü]berblick/.test(f)) {
    const zf = finde("zusammenfassung") || finde("notiz") || bestes(materialien);
    return {
      text: zf
        ? `„${zf.titel}" gibt dir den schnellen Überblick. Sollen wir die wichtigsten Punkte durchgehen?`
        : "Geh deine Notizen durch und schreib dir die drei wichtigsten Punkte heraus.",
      quellen: zf ? [zf.titel] : [],
    };
  }
  if (/erkl[aä]r|verstehe|wie geht|wie funktion|was bedeutet|hilf|schwer|kapier/.test(f)) {
    const n = finde("notiz") || finde("tafelnotiz") || bestes(materialien);
    return {
      text: n
        ? `Schau in „${n.titel}". Welche Stelle ist dir noch unklar? Sag sie mir, dann gehen wir sie Schritt für Schritt durch.`
        : "Erzähl mir, was genau dir unklar ist, dann gehen wir es Schritt für Schritt durch.",
      quellen: n ? [n.titel] : [],
    };
  }
  if (/danke|super|cool|verstanden|alles klar|passt/.test(f)) {
    return { text: "Gern. Frag jederzeit weiter zu deinen Materialien." };
  }

  const b = bestes(materialien);
  return {
    text: b
      ? `Am besten startest du mit „${b.titel}". Was genau möchtest du dazu wissen?`
      : "Was genau möchtest du wissen?",
    quellen: b ? [b.titel] : [],
  };
}

// Einfacher Lernzettel ohne KI: die Antworten des Assistenten aus dem Verlauf
// als Stichpunkte sammeln. Wird genutzt, wenn keine lokale KI läuft.
export function lernzettelAusVerlauf(verlauf, kontextName) {
  const punkte = verlauf
    .filter((m) => m.von === "ki" && m.text)
    .map((m) => m.text.split(/(?<=[.!?])\s/)[0].trim())
    .filter((s) => s.length > 0)
    .slice(0, 5);
  const zeilen = ["Das Wichtigste:"];
  if (punkte.length) {
    punkte.forEach((p) => zeilen.push("- " + p));
  } else {
    zeilen.push(`- Wiederhole das Thema ${kontextName} mit deinen Materialien.`);
  }
  zeilen.push("Nächster Schritt: Übe das Thema und prüfe dich selbst.");
  return zeilen.join("\n");
}
