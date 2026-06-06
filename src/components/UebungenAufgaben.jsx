import UebungenQuiz from "./UebungenQuiz";

// Dünner Wrapper: zeigt die Einleitung der Übungen und startet sofort den
// Quiz-Modus (Multiple-Choice mit sofortigem Feedback). Die alte Listen-Ansicht
// mit Eingabefeldern ist absichtlich entfernt; der Quiz hat sich als spürbar
// engagierender erwiesen.
export default function UebungenAufgaben({
  aufgaben,
  einleitung,
  generator,
  fach,
  thema,
  inhalt,
}) {
  return (
    <div className="uebungen">
      {einleitung && <p className="uebungen-einleitung">{einleitung}</p>}
      <UebungenQuiz
        aufgaben={aufgaben}
        generator={generator}
        fach={fach}
        thema={thema}
        inhalt={inhalt}
      />
    </div>
  );
}
