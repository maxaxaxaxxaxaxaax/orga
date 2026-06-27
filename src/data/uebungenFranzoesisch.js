// Französisch-Übungen (Rollout): didaktische Übungen mit Fehler-Begründungen,
// damit jeder Französisch-Lernweg neben dem Lernzettel auch etwas zum Üben hat.
// Aufbau wie UEBUNGEN_EXTRA (nach Typ gruppiert), wird in interaktiv.js
// eingemischt. Die IDs verweisen auf die Materialien f1..f10 in wissen.js, die
// über thema===label am jeweiligen Lernweg hängen. Antworten zum Tippen bewusst
// ohne Akzente (der Lückentext prüft akzent-genau, deutsche Tastatur).
export const UEBUNGEN_FRANZOESISCH = {
  // ---- 7FA1 Vocabulaire Unité 3: en ville (Karteikarten f1) -----------------
  karteikarten: {
    f1: {
      hinweis: "Unité 3: en ville. Lerne jedes Wort mit seinem Artikel (le/la/l').",
      karten: [
        { vorne: "la ville", hinten: "die Stadt", beispiel: "J'habite dans une grande ville. (Ich wohne in einer großen Stadt.)" },
        { vorne: "la rue", hinten: "die Straße", beispiel: "La poste est dans cette rue. (Die Post ist in dieser Straße.)" },
        { vorne: "la gare", hinten: "der Bahnhof", beispiel: "Le train part de la gare. (Der Zug fährt vom Bahnhof ab.)" },
        { vorne: "la place", hinten: "der Platz", beispiel: "On se retrouve sur la place. (Wir treffen uns auf dem Platz.)" },
        { vorne: "le pont", hinten: "die Brücke", beispiel: "Le pont est très long. (Die Brücke ist sehr lang.)" },
        { vorne: "l'église (f.)", hinten: "die Kirche", beispiel: "L'église est sur la place. (Die Kirche ist am Platz.)" },
        { vorne: "le musée", hinten: "das Museum", beispiel: "Le musée est fermé le lundi. (Das Museum ist montags geschlossen.)" },
        { vorne: "à gauche", hinten: "(nach) links", beispiel: "Tourne à gauche. (Bieg links ab.)" },
        { vorne: "à droite", hinten: "(nach) rechts", beispiel: "La banque est à droite. (Die Bank ist rechts.)" },
        { vorne: "tout droit", hinten: "geradeaus", beispiel: "Continue tout droit. (Geh geradeaus weiter.)" },
        { vorne: "près de", hinten: "in der Nähe von", beispiel: "J'habite près de l'école. (Ich wohne in der Nähe der Schule.)" },
        { vorne: "loin de", hinten: "weit weg von", beispiel: "La gare est loin d'ici. (Der Bahnhof ist weit weg von hier.)" },
      ],
    },
    // ---- 7FA4 Vocabulaire: les loisirs (Karteikarten f5) --------------------
    f5: {
      hinweis: "les loisirs: Hobbys und Freizeit. Achte auf jouer à (Ball/Spiel) und jouer de (Instrument).",
      karten: [
        { vorne: "le sport", hinten: "der Sport", beispiel: "Je fais du sport le mercredi. (Ich mache mittwochs Sport.)" },
        { vorne: "la musique", hinten: "die Musik", beispiel: "J'écoute de la musique. (Ich höre Musik.)" },
        { vorne: "le foot", hinten: "der Fußball", beispiel: "Je joue au foot avec mes amis. (Ich spiele mit meinen Freunden Fußball.)" },
        { vorne: "les jeux vidéo", hinten: "die Videospiele", beispiel: "Il aime les jeux vidéo. (Er mag Videospiele.)" },
        { vorne: "la guitare", hinten: "die Gitarre", beispiel: "Je joue de la guitare. (Ich spiele Gitarre.)" },
        { vorne: "la danse", hinten: "der Tanz", beispiel: "Elle fait de la danse. (Sie tanzt.)" },
        { vorne: "lire", hinten: "lesen", beispiel: "J'aime lire des BD. (Ich lese gern Comics.)" },
        { vorne: "nager", hinten: "schwimmen", beispiel: "Le samedi, je vais nager. (Samstags gehe ich schwimmen.)" },
        { vorne: "le cinéma", hinten: "das Kino", beispiel: "On va au cinéma ce soir. (Wir gehen heute Abend ins Kino.)" },
        { vorne: "le week-end", hinten: "das Wochenende", beispiel: "Le week-end, je sors avec mes amis. (Am Wochenende gehe ich mit meinen Freunden aus.)" },
        { vorne: "ensemble", hinten: "zusammen", beispiel: "On joue ensemble. (Wir spielen zusammen.)" },
        { vorne: "préféré, préférée", hinten: "Lieblings-", beispiel: "Mon sport préféré, c'est le foot. (Mein Lieblingssport ist Fußball.)" },
      ],
    },
  },

  // ---- 7FA2 Présent: verbes en -ir (Lückentext f3) --------------------------
  // Antworten ohne Akzent (finir, choisir, grandir), damit man sie tippen kann.
  lueckentext: {
    f3: {
      saetze: [
        { situation: "Konjugiere finir (beenden) im Präsens.", vor: "Je ", loesung: ["finis"], nach: " mes devoirs à 17 heures.", tipp: "1. Person Singular: Stamm fin + Endung -is." },
        { situation: "Konjugiere finir (beenden) im Präsens.", vor: "Nous ", loesung: ["finissons"], nach: " le travail ensemble.", tipp: "1. Person Plural: erst -iss-, dann -ons." },
        { situation: "choisir heißt wählen.", vor: "Tu ", loesung: ["choisis"], nach: " un dessert?", tipp: "2. Person Singular: Endung -is, kein -iss-." },
        { situation: "choisir heißt wählen.", vor: "Vous ", loesung: ["choisissez"], nach: " un cadeau pour Marie.", tipp: "2. Person Plural: -iss- plus -ez." },
        { vor: "Ils ", loesung: ["finissent"], nach: " à six heures.", tipp: "3. Person Plural: -iss- plus -ent." },
        { vor: "Elle ", loesung: ["finit"], nach: " son exercice.", tipp: "3. Person Singular: Endung -it mit t am Ende." },
        { situation: "grandir heißt wachsen.", vor: "Les enfants ", loesung: ["grandissent"], nach: " vite.", tipp: "3. Person Plural: grand + -issent." },
        { vor: "Nous ", loesung: ["choisissons"], nach: " un film pour ce soir.", tipp: "1. Person Plural von choisir: choisi + ss + ons." },
      ],
    },
  },

  // ---- Auswahlquiz: 7FA3 passé composé (f4) und 7FA4 les loisirs (f10) ------
  // Anwendung mit Begründung an jeder falschen Antwort (Gold-Standard).
  auswahlquiz: {
    f4: {
      fragen: [
        {
          frage: "Bilde das passé composé: \"Hier, j'___ (manger) une pizza.\" Welche Form passt?",
          optionen: [
            "ai mangé",
            { text: "ai manger", erklaerung: "Nach avoir steht das participe passé, nicht der Infinitiv. Von manger ist es mangé mit Akzent é." },
            { text: "mange", erklaerung: "mange ist das Präsens (ich esse). Für die Vergangenheit brauchst du avoir plus participe passé: ai mangé." },
          ],
          richtig: 0,
          erklaerung: "passé composé = Form von avoir (j'ai) plus participe passé. Bei -er-Verben endet das participe passé auf -é: mangé.",
        },
        {
          frage: "\"Tu ___ (finir) tes devoirs?\" Welche Form passt?",
          optionen: [
            "as fini",
            { text: "as finir", erklaerung: "Nach avoir steht das participe passé, nicht der Infinitiv. Von finir ist es fini." },
            { text: "a fini", erklaerung: "a fini gehört zu il/elle. Bei tu heißt die Form von avoir as: tu as fini." },
          ],
          richtig: 0,
          erklaerung: "Bei -ir-Verben endet das participe passé auf -i: finir wird fini. Mit tu: tu as fini.",
        },
        {
          frage: "\"Nous ___ (regarder) un film.\" Welche Form von avoir passt?",
          optionen: [
            "avons regardé",
            { text: "avez regardé", erklaerung: "avez gehört zu vous. Zu nous gehört avons: nous avons regardé." },
            { text: "ont regardé", erklaerung: "ont gehört zu ils/elles. Zu nous gehört avons." },
          ],
          richtig: 0,
          erklaerung: "avoir richtet sich nach dem Subjekt: nous avons. Dahinter das participe passé regardé.",
        },
        {
          frage: "Welches participe passé ist richtig gebildet?",
          optionen: [
            "choisir wird choisi",
            { text: "choisir wird choisé", erklaerung: "Nur -er-Verben enden auf -é. choisir ist ein -ir-Verb und endet auf -i: choisi." },
            { text: "choisir bleibt choisir", erklaerung: "Das ist der Infinitiv. Das participe passé von choisir ist choisi." },
          ],
          richtig: 0,
          erklaerung: "Faustregel für regelmäßige Verben: -er wird -é, -ir wird -i. Also choisir wird choisi.",
        },
        {
          frage: "Ein unregelmäßiges Partizip: \"J'___ (avoir) de la chance.\" Welche Form passt?",
          optionen: [
            "ai eu",
            { text: "ai avé", erklaerung: "avoir ist unregelmäßig, sein participe passé ist eu, nicht avé." },
            { text: "ai avu", erklaerung: "Das participe passé von avoir ist eu. avu gibt es nicht." },
          ],
          richtig: 0,
          erklaerung: "avoir hat ein unregelmäßiges participe passé: eu. Solche Formen muss man auswendig lernen (être wird été, faire wird fait).",
        },
        {
          frage: "Verneinung im passé composé: \"Je n'ai pas mangé.\" Wo stehen ne und pas?",
          optionen: [
            "ne und pas klammern avoir ein: n'ai pas mangé",
            { text: "ne und pas stehen vor mangé: ai ne pas mangé", erklaerung: "Im passé composé umschließen ne und pas das Hilfsverb avoir, nicht das participe passé." },
            { text: "nur pas am Ende: ai mangé pas", erklaerung: "Die Verneinung braucht ne UND pas, und sie stehen um avoir herum: n'ai pas." },
          ],
          richtig: 0,
          erklaerung: "Bei der Verneinung umschließen ne ... pas das Hilfsverb avoir: je n'ai pas mangé.",
        },
      ],
    },
    f10: {
      fragen: [
        {
          frage: "Fußball spielen: \"Le week-end, je ___ foot.\" Welche Form passt?",
          optionen: [
            "joue au",
            { text: "joue du", erklaerung: "du (de + le) ist für Instrumente. Bei Ballsport heißt es jouer à, und à + le wird au: joue au foot." },
            { text: "joue à le", erklaerung: "à + le verschmilzt immer zu au. Richtig ist also joue au foot." },
          ],
          richtig: 0,
          erklaerung: "Bei Ballsport und Spielen: jouer à. à + le foot wird zu au foot.",
        },
        {
          frage: "Gitarre spielen: \"Elle ___ guitare.\" Welche Form passt?",
          optionen: [
            "joue de la",
            { text: "joue à la", erklaerung: "à ist für Ball und Spiele. Bei Instrumenten heißt es jouer de: joue de la guitare." },
            { text: "joue la", erklaerung: "Zwischen jouer und dem Instrument muss de stehen: joue de la guitare." },
          ],
          richtig: 0,
          erklaerung: "Bei Instrumenten: jouer de. Vor einem weiblichen Wort: de la guitare.",
        },
        {
          frage: "Sport machen: \"Le mercredi, je ___ sport.\" Welche Form passt?",
          optionen: [
            "fais du",
            { text: "joue du", erklaerung: "jouer ist für bestimmte Spiele oder Instrumente. Für Sport allgemein nimmt man faire: je fais du sport." },
            { text: "fais de", erklaerung: "faire braucht den Teilungsartikel: de + le sport wird du sport. Also je fais du sport." },
          ],
          richtig: 0,
          erklaerung: "Für eine Aktivität allgemein: faire de. de + le sport wird du sport: je fais du sport.",
        },
        {
          frage: "Tanzen: \"Ma copine ___ danse.\" Welche Form passt?",
          optionen: [
            "fait de la",
            { text: "fait du", erklaerung: "danse ist weiblich (la danse). de + la bleibt de la: fait de la danse, nicht du." },
            { text: "joue de la", erklaerung: "Tanzen ist eine Aktivität, dafür nimmt man faire: elle fait de la danse." },
          ],
          richtig: 0,
          erklaerung: "faire de vor einem weiblichen Wort: de la danse. Also elle fait de la danse.",
        },
        {
          frage: "Karten spielen: \"Nous ___ cartes.\" Welche Form passt?",
          optionen: [
            "jouons aux",
            { text: "jouons des", erklaerung: "Bei Spielen heißt es jouer à. à + les wird aux: jouons aux cartes." },
            { text: "jouons à les", erklaerung: "à + les verschmilzt zu aux. Richtig ist jouons aux cartes." },
          ],
          richtig: 0,
          erklaerung: "jouer à + les cartes. à + les wird aux: nous jouons aux cartes.",
        },
      ],
    },
  },

  // ---- 7FA5 Lektüre & Dialog: Au café (Zuordnung f7) ------------------------
  zuordnung: {
    f7: {
      aufgabe: "Ordne jede französische Café-Wendung ihrer deutschen Bedeutung zu.",
      paare: [
        { links: "Je voudrais un café, s'il vous plaît.", rechts: "Ich hätte gern einen Kaffee, bitte.", tipp: "voudrais kommt von vouloir (wollen).", erklaerung: "je voudrais heißt höflich ich hätte gern." },
        { links: "C'est combien?", rechts: "Wie viel kostet das?", tipp: "combien heißt wie viel.", erklaerung: "Mit C'est combien? fragst du nach dem Preis." },
        { links: "L'addition, s'il vous plaît.", rechts: "Die Rechnung, bitte.", tipp: "addition erinnert an Rechnung.", erklaerung: "Mit L'addition bittest du um die Rechnung." },
        { links: "Vous avez de l'eau?", rechts: "Haben Sie Wasser?", tipp: "l'eau heißt das Wasser.", erklaerung: "Vous avez ...? heißt Haben Sie ...?" },
        { links: "Et avec ça?", rechts: "Und sonst noch etwas?", tipp: "wörtlich: und mit dem?", erklaerung: "Et avec ça? fragt, ob du noch etwas möchtest." },
        { links: "C'est tout, merci.", rechts: "Das ist alles, danke.", tipp: "tout heißt alles.", erklaerung: "Mit C'est tout sagst du, dass du nichts mehr möchtest." },
      ],
    },
  },

  // ---- 7FA3 passé composé: Sätze produktiv bauen (Satzbau f9) ---------------
  satzbau: {
    f9: {
      sprache: "französischen",
      saetze: [
        { woerter: ["J'ai", "mangé", "une", "pizza."], uebersetzung: "Ich habe eine Pizza gegessen.", erklaerung: "passé composé: avoir (j'ai) plus participe passé. Bei -er-Verben endet es auf -é: mangé." },
        { woerter: ["Tu", "as", "fini", "tes", "devoirs."], uebersetzung: "Du hast deine Hausaufgaben fertig gemacht.", erklaerung: "tu as (avoir) plus fini. Bei -ir-Verben endet das participe passé auf -i." },
        { woerter: ["Nous", "avons", "regardé", "un", "film."], uebersetzung: "Wir haben einen Film geschaut.", erklaerung: "nous avons (avoir im Plural) plus regardé (regarder, -er wird -é)." },
        { woerter: ["Elle", "a", "choisi", "un", "cadeau."], uebersetzung: "Sie hat ein Geschenk ausgesucht.", erklaerung: "il/elle a (avoir) plus choisi (choisir, -ir wird -i)." },
        { woerter: ["Ils", "ont", "joué", "au", "foot."], uebersetzung: "Sie haben Fußball gespielt.", erklaerung: "ils ont (avoir im Plural) plus joué. jouer wird zu joué." },
        { woerter: ["J'ai", "eu", "de", "la", "chance."], uebersetzung: "Ich habe Glück gehabt.", erklaerung: "avoir ist unregelmäßig: das participe passé ist eu. Also j'ai eu." },
      ],
    },
  },
};
