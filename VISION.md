# VISION.md - Orca

Dieses Dokument hält die Mission, den Catch und die Grenzen der App fest.
**Vor jedem Feature-Brainstorming, Konzept-Vorschlag oder Design-Entscheidung lesen.**
Wenn ein Vorschlag mit dieser Vision kollidiert, gehört er nicht in die App.

## Mission

> **Das Lernen ist digital, die Organisation ist analog.**

Genau dieser Medienbruch ist die Hauptursache der Schüler-Last im
Theresianum-Modell. Lernwege und Fachinhalte liegen auf Moodle, der
Planungsstand aber in einem gedruckten Schulplaner. Schüler:innen verbringen
zu viel mentale Energie damit, beide Welten zusammenzuführen.

Diese App schließt den Bruch, indem sie die Organisations-Seite digitalisiert
und in den selben Raum wie das Lernen bringt. Sie nimmt die Orga-Last, damit
kognitive Kapazität für das eigentliche Lernen frei wird. Sie ist explizit
**kein Lerntool**, sondern ein Organisationspartner.

## How Might We

Wie können wir Schüler:innen dabei unterstützen, sich weniger auf Organisation und mehr auf das eigentliche Lernen zu konzentrieren?

## Die App im hybriden Ökosystem

Die Gesamt-Lösung der Thesis ist ein **hybrides Ökosystem** aus drei verwobenen Räumen.
Diese App ist der **digitale** davon und bewusst kein Alleskönner:

- **Digitaler Raum (diese App)**: trägt die kognitive Last der Strukturierung
  (KI-Wochenplanung, KB-Erinnerungen, Fortschritts-Tracking, alle To-Dos an einem Ort).
- **Physischer Raum (smarter Tisch im Silentium)**: schlägt die Brücke zur analogen
  Arbeit. Eine verbaute Kamera scannt Hefte, Skizzen und Könnensbeweise ohne manuellen
  Aufwand in den digitalen Raum (plus Strom, Ablagefläche, Ergonomie).
- **Sozialer Raum (Verhalten)**: Status-LEDs am Tisch signalisieren nonverbal Fokus
  (bitte nicht stören) oder Hilfebedarf (Lehrkraft wird gerufen) und senken die
  Hemmschwelle, zu fragen.

Konsequenz für den Bau: Die **Foto- und Kamera-Funktionen** der App (Material scannen,
Fragen zum Bild stellen) sind die Software-Seite genau dieser Kamera-Brücke. Die Hardware
(Tisch, LEDs) ist nicht Teil dieser Demo, ihre Datenpunkte (Standort, Hilferuf) werden
aber konzeptionell mitgedacht und folgen den Leitplanken weiter unten.

## Der Catch (fünf konsequente Haltungen)

Das Differenzierende ist nicht ein einzelnes Feature, sondern eine Haltung, die sich durch alles zieht.

### 1. Single Source of Truth statt App-Sammlung
Ein System ersetzt das Nebeneinander aus **Moodle** (Lerninhalte), **TH Portal**
(interne Kommunikation), **analogem Schulplaner** (Selbst-Organisation),
Hausaufgaben-Notizen und Klassenchats. Diese drei Theresianum-Werkzeuge werden
nicht ersetzt, sondern über Schnittstellen eingebunden. Die App wird zur
**einheitlichen Oberfläche darüber**, die den heutigen Medienbruch zwischen
digital lernen und analog organisieren schließt.

### 2. Default ist Reduktion (Cognitive Load minimieren)
Nur eine Sache gleichzeitig sichtbar. Alles andere trägt das System, nicht der Schüler. Kein endloses Scrollen, keine vollen Menüs, keine Such-Lawine. Wer eine Übersicht will, klappt sie auf. Der Default ist Fokus.

### 3. Automatische Extraktion statt manueller Eingabe
Aufgaben, Materialien und Termine werden aus Lehrer-Uploads, Chats und Stundenplan herausgelesen. Schüler:innen bestätigen, aber tippen nicht ab. Eingabe ist die Ausnahme, nicht die Regel.

### 4. Material folgt dem Kontext
Mitschriften, Arbeitsblätter und Erklärungen landen automatisch beim richtigen Fach und Lernweg. Suche per Frage, nicht per Dateiname. Wer an einem KB arbeitet, hat das Material schon dabei.

### 5. KI als Lern-Coach, nicht als Antwortmaschine
Stellt Rückfragen statt Lösungen zu liefern. Schlägt nächste Schritte vor, erinnert an Schwächen aus früheren Themen. Schützt das selbstständige Lernen aktiv, ersetzt es nicht.

## Gestaltungsprinzipien: Selbstbestimmung als Leitplanke

Die App erzeugt Daten (Fortschritt, Aufenthaltsort, Hilfebedarf), und genau diese
Daten sind, über Minderjährige im Schulraum erhoben, hochsensibel. Das pädagogische
Ziel der Studierzeit ist aber **Selbstregulation, nicht Kontrolle** (siehe das
Stempelsystem in SCHULE.md). Ein Werkzeug, das dauerhaft beobachtet und an die
Lehrkraft meldet, erzöge zur Anpassung an eine beobachtende Instanz statt zur
Selbstständigkeit. Darum behandeln wir Autonomie und Privatsphäre nach dem **Value
Sensitive Design** als Eingangsgröße der Konzeption, nicht als Datenschutz-Korrektiv
am Ende. Vier Leitplanken, an denen sich jede Funktion messen lassen muss:

### Spiegeln statt Überwachen
Wir bauen nur Funktionen, bei denen die Schülerin selbst ein Signal sendet (ein
Hilferuf ist eine Einladung, sie behält die Handlungsmacht), nie eine, die das System
eigenständig über sie erhebt (z. B. automatische Ablenkungs-Erkennung). Die Lehrkraft
bekommt keinen verborgenen Beobachtungsmonitor, sondern einen Spiegel der Daten, die
die Schülerin ohnehin selbst erzeugt und einsieht.

### Das verblassende Gerüst
Die Intensität der Unterstützung ist an den erreichten Grad der Selbstständigkeit
gekoppelt, analog zum Stempelsystem. Wer viel Struktur braucht, bekommt klare Etappen
und sanfte Erinnerungen; wer selbstständig arbeitet, bekommt nahezu kein Monitoring,
nur Werkzeuge nach eigenem Ermessen. Das System nimmt sich mit wachsender Kompetenz
selbst zurück: ein temporäres Trainingsrad für Selbstregulation, das verschwindet,
wenn es seine Aufgabe erfüllt hat.

### Datenhoheit und Reziprozität
Die Hoheit über die Daten liegt bei den Lernenden. Per Default sehen sie alles, was
über sie erfasst wird, und sie steuern, was nach oben sichtbar wird. Es gibt keinen
Auswertungsblick der Lehrkraft, den die Schülerin nicht ebenso einsehen kann. Diese
Symmetrie ist der bewusste Gegenentwurf zur Disziplinierung durch bloßes
Beobachtetwerden.

### Verdichtung vor Einzelbild
Auf Lehrerseite hat Aggregation Vorrang vor der Einzelbeobachtung. Der Lerncoach
braucht nicht „Schüler X schweift ab", sondern das Muster „dieser Lernweg überfordert
die Kohorte zeitlich". Erhoben wird nur das Nötigste: selbstberichteter Fortschritt
und ein freiwilliger Standort, der allein dem Zustellen einer Hilfeanfrage dient und
nicht dauerhaft gespeichert wird. Verhaltens- oder Aufmerksamkeitsdaten erfasst die
App nicht (Datenminimierung und Zweckbindung nach DSGVO, besonders für die geschützten
Daten Minderjähriger).

Diese Leitplanken schränken den Funktionsumfang bewusst ein. Genau darin liegt ihre
Stärke: Sie stellen sicher, dass die App die Selbstbestimmung, die das Theresianum
mühsam aufbaut, nicht im Hintergrund wieder einkassiert.

## Die sechs Bereiche der App

Die App denkt in sechs Bereichen, die im Schüleralltag echte Fragen beantworten. Die aktuelle Implementierung bündelt einige davon (siehe APP.md).

| Bereich | Schülerfrage | Default-Haltung |
|---|---|---|
| **Orientierung** | Was steht heute / diese Woche an? | Tages-Dashboard, nur das wirklich Relevante: nächste Stunde, nächste Aufgabe, nächste Frist. Keine Tabs, keine Suche. |
| **Aufgaben** | Was muss ich erledigen, was hat Vorrang? | Hausaufgaben, Abgaben, Projekte, Lernziele, Gruppenarbeiten. Automatisch erkannt und vorgeschlagen, nicht manuell gepflegt. |
| **Wissen** | Was lerne ich, wo finde ich das Material? | Unterrichtsinhalte, Mitschriften, Materialien, Lernstände. Automatisch dem richtigen Fach und Thema zugeordnet. |
| **Produktivität** | Wann lerne ich was, wie hab ich gearbeitet? | Lernsessions statt To-Do-Listen. Das System schlägt vor, wann was sinnvoll ist, basiert auf Fristen, Klausuren, persönlichem Rhythmus. |
| **Kommunikation** | Was muss ich beantworten oder lesen? | Ein einziger Posteingang für alles Schulische. KI fasst zusammen und markiert, was eine Reaktion braucht. |
| **Entwicklung** | Wo stehe ich, wo will ich hin? | Stärken, Schwächen, Interessen, Fortschritt. Gespiegelt aus echtem Lernverhalten, nicht aus Selbstauskunft. |

## Die Hauptbühne: Phase 2 der individualisierten Übung

Auch wenn die App alle sechs Bereiche bedient, lebt sie strategisch vor allem in
**Phase 2 des Drei-Phasen-Modells** (siehe SCHULE.md): der individualisierten
Übungsphase, in der der Schüler allein vor dem Stoff sitzt und ihn festigt.

Diese Phase trägt laut Schulpraxis das ganze Drei-Phasen-Konzept. Wer in ihr nichts
tut, hat den Stoff am Ende nicht wirklich gelernt, egal wie gut die Erklärung war.
Sie ist gleichzeitig die organisatorisch verletzlichste Phase: hier ist der Schüler
auf sich allein gestellt, Reibung (Material suchen, Priorisieren, "was jetzt?")
frisst direkt von der eigentlichen Übungszeit ab.

Die konkreten strukturellen Probleme dieser Phase (Motivation, Struktur, Hilfe,
Selbsteinschätzung, Aufmerksamkeit, Kontrolle, Isolation, Verantwortung) sind in
SCHULE.md geclustert beschrieben. Pro Cluster ist dort markiert, was ein
**App-Hebel** ist und wo die **Didaktik-Grenze** liegt. Jede Feature-Idee sollte
auf mindestens einen App-Hebel zielen.

**Konsequenz für das Design der App**:

- Was der Schüler in Phase 2 braucht, muss ohne Sucharbeit verfügbar sein.
- Was Reibung erzeugt, muss in den Hintergrund.
- Was die Phase abbricht (Blockaden, fehlendes Material, Unklarheit über den nächsten Schritt), muss minimiert oder still in Richtung Lerncoach weitergereicht werden.

Phase 1 (Instruktion) und Phase 3 (Kooperation) werden bedient, aber nicht primär.
In Phase 1 ist die Hauptaufgabe die saubere Materialerfassung im richtigen Kontext.
In Phase 3 die transparente Beitrags-Dokumentation für den Schüler selbst.

## Was bewusst NICHT zur App gehört

Jeder Vorschlag, der in eine dieser Kategorien fällt, wird abgelehnt.

- **Kein Lern-Tutor, kein Vokabeltrainer** (die App ersetzt nicht das Lernen selbst)
- **Keine Antworten-KI** (Chatbot, der Hausaufgaben löst, ist explizit nicht Teil davon)
- **Keine eigene Klassenchat-Plattform** (bestehende Chats werden eingebunden, nicht dupliziert). **Aggregierter Klassenkontext (Verbandsgefühl ohne Personenbezug) ist ausdrücklich erlaubt**. Individuelle Vergleichs-Logik, Ranglisten, Rang-Positionen und Wettkampf-Mechaniken bleiben draußen.
- **Keine Gamification mit Punkten oder Badges** (Schüler:innen wollen ernstgenommen werden, nicht bespaßt)
- **Keine bevormundenden Erinnerungen** ("hast du heute schon gelernt?")
- **Keine Lehrer-Administrationsoberfläche, keine Klassen-Übersicht für die Lehrkraft** (Fokus bleibt konsequent der Schüler). **Punktuelle Lehrer-Brücken** (Schritt-Abnahme, stiller Hilferuf, KB-Anmeldung) sind erlaubt, **aber nur schülergeführt**: die Lehrkraft sieht den Schüler nur dort, wo der Schüler selbst eine Brücke öffnet.
- **Keine Eltern-Kontroll-Features** (Eltern-Einsicht nur Read-Only und vom Schüler selbst freigegeben)
- **Keine kindische Bildsprache** (keine Maskottchen, keine Wetter-Metaphern, keine Sticker)

## Thesis-Argumentation

Die Bachelor-Thesis "Lernen lernen im Zeitalter KI" untersucht, wie KI als
organisatorischer Entlastungspartner für Schüler:innen funktionieren kann.

**Ausgangslage**: Das starre, synchrone Schulmodell stößt messbar an Grenzen (PISA 2022:
Leistungsrückgang in Mathematik um 15 Punkte, schon vor der Pandemie einsetzend; weniger
als die Hälfte der Schüler:innen lernt, Wissen proaktiv zu verknüpfen). Der Paradigmen-
wechsel geht zu offenen, individualisierten Lernlandschaften, in denen die Lehrkraft vom
Wissenssender zum Lerncoach wird. Gleichzeitig ein Paradox: laut OECD nutzen 94 % der
Befragten in Deutschland KI, aber nur 20 % für organisatorische Zwecke. Genau in diese
Lücke (KI als Orga-Partner in der neuen Freiheit) positioniert sich die App.

Der Argumentationsstrang in vier Schritten:

**1. Phase 2 trägt das Modell.**
Das Drei-Phasen-Konzept des Theresianums steht und fällt mit dem Erfolg der
individualisierten Übungsphase. Hier wird das Verstandene gefestigt; wer hier nichts
tut, lernt nichts, egal wie gut die Erklärung in Phase 1 war.

**2. Phase 2 ist organisatorisch verletzlich.**
In dieser Phase ist der Schüler auf sich allein gestellt. Material suchen,
Priorisieren, Entscheiden was als nächstes dran ist: diese Orga-Tätigkeiten ziehen
direkt von der eigentlichen Übungszeit ab. Schwache Schüler verlieren hier
überproportional, weil sie ohnehin schon Aufholbedarf haben und nicht zusätzlich
gegen Verwaltungsreibung ankämpfen können.

**3. KI kann die Orga-Last übernehmen.**
Was heute der Schüler organisiert (Aufgaben einsortieren, Material zuordnen, Fristen
priorisieren, Posteingang scannen, nächsten Schritt finden), kann KI tun. Nicht als
Lehrer-Ersatz, nicht als Antwortmaschine, sondern als stiller Verwaltungsassistent
im Hintergrund.

**4. Also: KI stabilisiert die Phase, die das Modell trägt.**
Wenn die ersten drei Schritte stimmen, entlastet die App nicht beliebig irgendwo,
sondern genau dort, wo der pädagogische Hebel am größten ist.

### Der strategische Pivot: der Domino-Effekt

Nach der Zwischenpräsentation wurde der Fokus bewusst **von der Lehrkraft weg zur
Schülerschaft** verschoben. Drei Gründe:

- **Scope**: Ein Redesign des Moodle-Backends oder ein Authoring-Tool für Lehrkräfte ist
  primär ein fachdidaktisches Problem (die Verlage arbeiten selbst daran), nicht unser
  gestalterischer Hebel.
- **Frequenz**: Lehrkräfte leiden punktuell (bei der Kurserstellung), Schüler:innen
  **täglich und stündlich** an der Selbstverwaltung im Raum. Dort ist der Design-Hebel am
  größten.
- **Domino-Effekt**: Die Transparenz-Lücke der Lehrkraft ist nur ein **Symptom** der
  chaotischen Schüler-Organisation. Lösen wir die Schüler-Seite (ein System, in dem er
  gern und automatisch seinen Fortschritt dokumentiert), entsteht im Hintergrund eine
  saubere Datenlage, die der Lehrkraft gespiegelt werden kann.

Indem wir den Schülern helfen, helfen wir passiv den Lehrkräften. Die Lehrkraft ist damit
**sekundärer Konsument**, nicht primärer Nutzer.

### Die zweite Säule: Sichtbarkeit für den Lerncoach

Das Orga-Problem hat eine **zweite Dimension**, die das gleiche System verursacht.
In der offenen Lernlandschaft des Theresianums (siehe SCHULE.md) sind Lehrkräfte
zwar physisch anwesend, aber **inhaltlich blind**: sie sehen nicht, wer an einem
Lernweg scheitert, wer für einen KB bereit ist oder wer bei der Etappenplanung
Hilfe braucht. Dieser blinde Fleck entsteht aus demselben Medienbruch wie das
Schüler-Problem: der Planungsstand liegt analog auf dem Tisch des Schülers.

Die App reagiert darauf mit einer **punktuellen, schülergeführten Brücke**, nicht
mit einem klassischen Lehrer-Dashboard:

- **Schüler-First bleibt**. Es gibt keine Klassen-Übersicht für die Lehrkraft,
  keine Schüler-Vergleiche, keine Überwachungs-Logik.
- Wo der **Schüler** explizit eine Brücke öffnet (KB-Abnahme anfordern, stillen
  Hilferuf senden, eine Frage merken), wird das in der Lerncoach-Sicht sichtbar.
- Alles andere bleibt unsichtbar. Der Lehrer sieht den Schüler nur dort, wo der
  Schüler ihn explizit braucht.

So entlastet die App **beide Seiten** desselben Bruchs: dem Schüler die
organisatorische Last, der Lehrkraft die strukturelle Ahnungslosigkeit, ohne dem
Schüler die Selbstbestimmung wegzunehmen.

Die App ist die experimentelle Konkretisierung dieser Argumentation.

Messbare Argumente:
- Klick-Tiefe pro Lernziel (weniger Wege = weniger Orga-Overhead)
- Zeit zwischen Aufgabenerteilung und Erscheinen in der App (manuell vs automatisch)
- Anzahl der parallel benötigten Schul-Tools (vorher vs nachher)
- Kognitive Last beim Tagesstart (subjektiv und über Klicks messbar)
- Wirkung speziell auf schwache Schüler (höhere Baseline-Orga-Last bedeutet höhere relative Entlastung durch dieselbe Automatisierung)

## Der Demo-Kontext

Max, Klasse 7a, Theresianum Mainz, altsprachlich (Englisch, Latein, Griechisch). Lerncoach: Fr. Berg. Stichtag der Demo: 21.05.2026 (Donnerstag).

Die Theresianum-Spezifika (Etappen, Könnensbeweise, Lernwege, Cluster, Studierzeit, FREI DAY, ZEuS) sind in **SCHULE.md** detailliert beschrieben.

Was die App heute schon kann, steht in **APP.md**.

## Prüf-Fragen vor jedem neuen Feature

1. Entlastet es den Schüler organisatorisch, oder macht es eine neue Aufgabe für ihn auf?
2. Reduziert es kognitive Last, oder fügt es einen weiteren Klick-Pfad hinzu?
3. Lässt es sich aus vorhandenen Daten ableiten, oder braucht es neue Pflege-Eingabe?
4. Passt es in eine der sechs Bereiche, oder ist es ein Fremdkörper?
5. Schützt es das selbstständige Lernen, oder droht es, es zu ersetzen?
6. Hilft es schwachen Schülern überdurchschnittlich, oder nur den ohnehin Organisierten?
7. Wirkt es in Phase 2 (Hauptbühne), oder ist es ein Nebenschauplatz?

Wenn eine der ersten sechs Fragen mit nein beantwortet wird: kein Feature.
Wenn Frage 7 mit nein beantwortet wird: nur wenn es in Phase 1 oder Phase 3 einen
sehr klaren, abgegrenzten Schmerz löst, sonst zurückstellen.
