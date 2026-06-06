// Mock-KI-Antworten für den KI-Chat. In der echten App würde hier ein LLM
// aufgerufen, das den Kontext (aktuelle Notiz + Lernweg) bekommt und sokratisch
// antwortet. Für die Demo: simple Heuristiken über Stichwörter, plus immer ein
// Verweis auf einen passenden Abschnitt aus der Notiz, damit Max selbst nach-
// schauen kann statt eine fertige Antwort zu bekommen.
//
// Vision-Anker: KI fragt zurück, gibt keine Lösung, verweist auf eigene Materialien.

function ersterAbschnitt(inhalt, typ) {
  if (!inhalt?.abschnitte) return null;
  return inhalt.abschnitte.find((a) => a.typ === typ) || null;
}

function verweisAusAbschnitt(abschnitt, tab = "Erklärung") {
  if (!abschnitt) return null;
  return {
    titel: abschnitt.ueberschrift || "in der Notiz",
    typ: abschnitt.typ,
    tab,
  };
}

function bevorzugterVerweis(inhalt, bevorzugteTypen) {
  if (!inhalt?.abschnitte) return null;
  for (const t of bevorzugteTypen) {
    const a = ersterAbschnitt(inhalt, t);
    if (a) return verweisAusAbschnitt(a);
  }
  return null;
}

// Antwort aus User-Text und Inhalt der Notiz berechnen.
export function kiAntwortText(text, inhalt) {
  const t = (text || "").toLowerCase();

  if (/wie (geht|macht|funktioniert|löst|löse)/.test(t)) {
    return {
      text: "Lass uns das gemeinsam durchdenken. Was hast du schon probiert? Was ist dein erster Gedanke?",
      verweis: bevorzugterVerweis(inhalt, ["regel", "schema", "tipp"]),
    };
  }
  if (/was (ist|bedeutet|heißt)/.test(t)) {
    return {
      text: "Versuche es in eigenen Worten zu erklären, als würdest du es einem Mitschüler sagen. Schau kurz in deine Notiz.",
      verweis: bevorzugterVerweis(inhalt, ["regel", "schema"]),
    };
  }
  if (/verstehe (das )?nicht|kapiere|schwierig|kompliziert|hänge|häng/.test(t)) {
    return {
      text: "Welcher Teil genau? Sag mir, an welchem Wort oder Schritt du hängst.",
      verweis: bevorzugterVerweis(inhalt, ["beispiel", "tipp"]),
    };
  }
  if (/beispiel|aufgabe|übung/.test(t)) {
    return {
      text: "In deiner Notiz hast du schon ein Beispiel. Welches Wort oder welcher Schritt darin ist dir am unklarsten?",
      verweis: bevorzugterVerweis(inhalt, ["beispiel"]),
    };
  }
  if (/regel|formel|merksatz/.test(t)) {
    return {
      text: "Was steht in der Regel? Probier sie in einem Satz für dich nachzuformulieren.",
      verweis: bevorzugterVerweis(inhalt, ["regel", "schema"]),
    };
  }
  if (/hilfe|hilf mir|kannst du helfen/.test(t)) {
    return {
      text: "Klar. Welche konkrete Frage? Je genauer, desto besser kann ich dich anstoßen.",
      verweis: null,
    };
  }
  if (/lös(e|ung)|antwort/.test(t)) {
    return {
      text: "Ich sag dir keine Lösung. Aber ich helfe dir, sie selbst zu finden. Was wäre dein nächster Schritt?",
      verweis: bevorzugterVerweis(inhalt, ["beispiel", "tipp"]),
    };
  }
  if (/danke|cool|super|verstanden|klar/.test(t)) {
    return {
      text: "Stark. Probier es jetzt selbst im Quiz aus.",
      verweis: null,
    };
  }
  // Generischer sokratischer Reflex
  return {
    text: "Gute Frage. Was hast du dazu schon gedacht? Was wäre dein erster Versuch?",
    verweis: bevorzugterVerweis(inhalt, ["tipp", "regel"]),
  };
}

// Antwort beim Bild-Upload: KI „erkennt" was drauf ist (Mock) und stellt
// eine konkrete Rückfrage statt einer Lösung.
export function kiAntwortBild(inhalt) {
  return {
    text: "Ich sehe dein Bild. Erzähl mir kurz: was hast du da probiert, und an welcher Stelle bist du stecken geblieben?",
    verweis: bevorzugterVerweis(inhalt, ["beispiel", "regel"]),
  };
}
