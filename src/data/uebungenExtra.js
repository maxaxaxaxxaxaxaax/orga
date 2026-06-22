// Zusatz-Uebungen (Rollout): pro Fach ergaenzte Anwendungs- und Transfer-Uebungen
// mit Fehler-Begruendungen an den falschen Antworten. Werden in interaktiv.js
// nach Typ eingemischt (INTERAKTIV[id] = { typ, daten }) und in wissen.js ueber
// thema===label als Materialien an den Lernweg gehaengt.
export const UEBUNGEN_EXTRA = {
  auswahlquiz: {
    e10: {
      fragen: [
        {
          frage: 'Das Telefon klingelt. Niemand geht ran. Du sagst: "OK, ___ answer it." Welche Form passt?',
          optionen: [
            "I will",
            {
              text: "I'm going to",
              erklaerung: "going to ist für feste Pläne oder sichtbare Anzeichen. Hier entscheidest du gerade im Moment, also spontan, deshalb passt es nicht.",
            },
            {
              text: "I going to",
              erklaerung: "going to braucht immer eine Form von be (am/is/are). Außerdem ist es hier eine spontane Entscheidung.",
            },
          ],
          richtig: 0,
          erklaerung: "Eine spontane Entscheidung im Moment des Sprechens bildet man mit will. Niemand hat es geplant, du entscheidest dich gerade eben.",
        },
        {
          frage: 'Du hast schon alles geplant: "Next summer we ___ visit our grandparents in Ireland." Welche Form passt?',
          optionen: [
            "are going to",
            {
              text: "will",
              erklaerung: 'will nimmt man für spontane Entscheidungen. Hier steht der Plan aber schon fest ("schon alles geplant"), deshalb passt going to besser.',
            },
            {
              text: "going to",
              erklaerung: "Inhaltlich richtig, aber going to braucht die be-Form: we are going to visit. Ohne are ist der Satz grammatisch falsch.",
            },
          ],
          richtig: 0,
          erklaerung: "Ein fester Plan, den man sich schon vorgenommen hat, wird mit be going to ausgedrückt: we are going to visit.",
        },
        {
          frage: 'Dunkle Wolken am Himmel. Du siehst das Anzeichen und sagst: "Look at those clouds! It ___ rain." Welche Form passt?',
          optionen: [
            "is going to",
            {
              text: "will",
              erklaerung: "will nimmt man für Vorhersagen ohne Beweis, also bloße Vermutungen. Hier siehst du aber ein sichtbares Anzeichen (die Wolken), deshalb passt going to.",
            },
            {
              text: "is going",
              erklaerung: "Nach is going fehlt das to: It is going to rain. Ohne to ist die Form unvollständig.",
            },
          ],
          richtig: 0,
          erklaerung: "Wenn es ein sichtbares Anzeichen für etwas gibt (die Wolken), benutzt man be going to: It is going to rain.",
        },
        {
          frage: 'Ein Freund ist traurig. Du machst ihm ein festes Versprechen: "Don\'t worry, I ___ help you." Welche Form passt?',
          optionen: [
            "will",
            {
              text: "am going to",
              erklaerung: "going to ist für vorher gefasste Pläne. Ein spontanes Versprechen im Moment des Sprechens drückt man aber mit will aus.",
            },
            {
              text: "would",
              erklaerung: 'would ist die Vergangenheits-/Konditionalform und meint "würde". Für ein direktes Versprechen in der Zukunft braucht man will.',
            },
          ],
          richtig: 0,
          erklaerung: "Ein Versprechen, das man im Moment gibt, bildet man mit will: I will help you.",
        },
        {
          frage: 'Eine Vorhersage ohne Beweis, nur eine Vermutung: "I think our team ___ win the game tomorrow." Welche Form passt?',
          optionen: [
            "will",
            {
              text: "is going to",
              erklaerung: 'going to nimmt man bei sichtbaren Anzeichen. Hier gibt es keinen Beweis, es ist nur eine Vermutung ("I think"), deshalb passt will.',
            },
            {
              text: "wins",
              erklaerung: "Das simple present (wins) beschreibt etwas Regelmäßiges oder einen Fahrplan, keine Vorhersage für morgen. Für die Vermutung über die Zukunft braucht man will.",
            },
          ],
          richtig: 0,
          erklaerung: 'Eine reine Vermutung oder Vorhersage ohne Beweis, oft nach "I think", bildet man mit will.',
        },
        {
          frage: 'if-clause Typ 1: "If it ___ tomorrow, we will stay at home." Welche Form passt in den if-Satz?',
          optionen: [
            "rains",
            {
              text: "will rain",
              erklaerung: "Im if-Satz (nach if) steht kein will. Das will gehört nur in den anderen Satzteil (we will stay).",
            },
            {
              text: "is going to rain",
              erklaerung: "Im if-Satz vom Typ 1 steht das simple present (rains), nicht going to. Die Zukunftsform gehört in den Hauptsatz.",
            },
          ],
          richtig: 0,
          erklaerung: "In der if-clause Typ 1 steht nach if das simple present (rains). Das will steht nur im Hauptsatz: If it rains, we will stay at home.",
        },
      ],
    },
    e11: {
      fragen: [
        {
          frage: 'Regelmäßiges Verb: "Yesterday I ___ (play) football with my friends." Welche Form passt?',
          optionen: [
            "played",
            {
              text: "playd",
              erklaerung: "Bei regelmäßigen Verben hängt man immer -ed an: play wird zu played. Ein bloßes -d ist falsch.",
            },
            {
              text: "plaied",
              erklaerung: "Das y nach einem Vokal (a) bleibt erhalten: played. Man wandelt es nicht in i um.",
            },
          ],
          richtig: 0,
          erklaerung: "Regelmäßige Verben bilden das simple past mit -ed: play wird zu played.",
        },
        {
          frage: 'Unregelmäßiges Verb: "She ___ (go) to school by bike last Monday." Welche Form passt?',
          optionen: [
            "went",
            {
              text: "goed",
              erklaerung: "go ist ein unregelmäßiges Verb. Man hängt kein -ed an, sondern muss die Form went auswendig lernen.",
            },
            {
              text: "gone",
              erklaerung: "gone ist das third form (past participle) für das present perfect (has gone). Für das simple past braucht man went.",
            },
          ],
          richtig: 0,
          erklaerung: "go ist unregelmäßig: das simple past ist went. Solche Formen lernt man auswendig.",
        },
        {
          frage: 'Frage im simple past: "___ you ___ (see) the film last night?" Welche Lücken sind richtig?',
          optionen: [
            "Did / see",
            {
              text: "Did / saw",
              erklaerung: "Nach did steht immer die Grundform (see), nicht die past-Form. did zeigt schon die Vergangenheit, deshalb darf das Vollverb nicht auch in der past-Form stehen.",
            },
            {
              text: "Do / see",
              erklaerung: "do ist die Gegenwart. Für eine Frage in der Vergangenheit braucht man did.",
            },
          ],
          richtig: 0,
          erklaerung: "Fragen im simple past bildet man mit did + Grundform: Did you see the film? Das did trägt die Vergangenheit, das Vollverb bleibt im Infinitiv.",
        },
        {
          frage: 'Verneinung im simple past: "We ___ (not / watch) TV yesterday." Welche Form passt?',
          optionen: [
            "did not watch",
            {
              text: "did not watched",
              erklaerung: "Nach did not steht die Grundform (watch), nicht die past-Form. Das did not zeigt schon die Vergangenheit an.",
            },
            {
              text: "not watched",
              erklaerung: "Für die Verneinung braucht man das Hilfsverb did: We did not watch. Ein bloßes not reicht nicht.",
            },
          ],
          richtig: 0,
          erklaerung: "Verneinungen im simple past bildet man mit did not (didn't) + Grundform: We did not watch TV.",
        },
        {
          frage: "Welches Wort ist ein typisches Signalwort für das simple past?",
          optionen: [
            "yesterday",
            {
              text: "now",
              erklaerung: "now (jetzt) zeigt die Gegenwart an und passt zum present, nicht zum simple past.",
            },
            {
              text: "tomorrow",
              erklaerung: "tomorrow (morgen) zeigt auf die Zukunft und passt zum will-future, nicht zum simple past.",
            },
          ],
          richtig: 0,
          erklaerung: "yesterday (gestern) ist ein typisches Signalwort für das simple past, ebenso last week oder two days ago.",
        },
      ],
    },
    l8: {
      fragen: [
        {
          frage: "Wie lautet der Genitiv Singular des Adjektivs felix (glücklich)?",
          optionen: [
            "felicis",
            {
              text: "felixis",
              erklaerung: "Den Stamm bildest du nicht aus der Nennform felix, sondern aus dem Genitiv: felic-.",
            },
            {
              text: "felici",
              erklaerung: "Das ist der Dativ (oder Ablativ) Singular, nicht der Genitiv.",
            },
            {
              text: "felicium",
              erklaerung: "Das ist der Genitiv Plural. Gefragt war der Singular.",
            },
          ],
          richtig: 0,
          erklaerung: "felix gehört zur 3. Deklination. Der Stamm steckt im Genitiv: felic-, also Genitiv Singular felicis.",
        },
        {
          frage: "Bestimme die Form felicem in vir felicem (Achtung, gefragt ist felicem allein).",
          optionen: [
            "Akkusativ Singular maskulin/feminin",
            {
              text: "Ablativ Singular",
              erklaerung: "Der Ablativ Singular lautet felici (mit -i), nicht felicem.",
            },
            {
              text: "Nominativ Singular",
              erklaerung: "Der Nominativ Singular lautet felix, nicht felicem.",
            },
            {
              text: "Genitiv Plural",
              erklaerung: "Der Genitiv Plural lautet felicium. Die Endung -em zeigt den Akkusativ Singular.",
            },
          ],
          richtig: 0,
          erklaerung: "Die Endung -em ist der Akkusativ Singular für Maskulinum und Femininum: felicem.",
        },
        {
          frage: "Welche Endung hat felix im Ablativ Singular?",
          optionen: [
            "-i (felici)",
            {
              text: "-e (felice)",
              erklaerung: "Auf -e enden konsonantische Substantive wie milite. Adjektive der 3. Deklination haben aber den Ablativ Singular auf -i.",
            },
            {
              text: "-is (felicis)",
              erklaerung: "Auf -is endet der Genitiv Singular, nicht der Ablativ.",
            },
            {
              text: "-em (felicem)",
              erklaerung: "Auf -em endet der Akkusativ Singular, nicht der Ablativ.",
            },
          ],
          richtig: 0,
          erklaerung: "Adjektive der 3. Deklination folgen der i-Deklination: Ablativ Singular auf -i, also felici.",
        },
        {
          frage: "Das Nomen miles, militis steht im Ablativ Singular: milite. Warum nicht militi?",
          optionen: [
            "miles ist ein konsonantisches Substantiv und hat den Ablativ Singular auf -e.",
            {
              text: "Weil milite ein Schreibfehler ist, richtig wäre militi.",
              erklaerung: "milite ist korrekt. Konsonantische Substantive bilden den Ablativ Singular regelmäßig auf -e.",
            },
            {
              text: "Weil miles weiblich ist.",
              erklaerung: "miles ist maskulin (der Soldat). Das Geschlecht ändert die Ablativ-Endung hier nicht.",
            },
            {
              text: "Weil miles ein Adjektiv ist.",
              erklaerung: "miles ist ein Substantiv. Nur Adjektive der 3. Deklination haben den Ablativ Singular auf -i.",
            },
          ],
          richtig: 0,
          erklaerung: "Substantive der konsonantischen Deklination wie miles bilden den Ablativ Singular auf -e (milite). Das -i im Ablativ haben dagegen die Adjektive (felici).",
        },
        {
          frage: "Wie passt du felix an das Nomen matres (Nominativ Plural, feminin) an, also welche Form steht in matres ___?",
          optionen: [
            "felices",
            {
              text: "felix",
              erklaerung: "felix ist Nominativ Singular. matres ist aber Plural, das Adjektiv muss in KNG mitgehen.",
            },
            {
              text: "felicia",
              erklaerung: "felicia ist Nominativ/Akkusativ Plural Neutrum. matres ist feminin, nicht neutrum.",
            },
            {
              text: "felicibus",
              erklaerung: "felicibus ist Dativ oder Ablativ Plural. matres steht im Nominativ Plural.",
            },
          ],
          richtig: 0,
          erklaerung: "KNG-Kongruenz: matres ist Nominativ Plural feminin. Für Maskulinum und Femininum lautet der Nominativ Plural felices, also matres felices.",
        },
      ],
    },
    d6: {
      fragen: [
        {
          frage: "Du beginnst deinen Mini-Vortrag über „Reise um die Welt“. Was gehört in die Einleitung?",
          optionen: [
            "Du sagst, worum es geht, und nennst dein Thema.",
            {
              text: "Du erzählst sofort alle Einzelheiten und Zahlen.",
              erklaerung: "Alle Einzelheiten kommen in den Hauptteil. In der Einleitung würden sie die Zuhörer gleich am Anfang überfordern.",
            },
            {
              text: "Du sagst „Tschüss“ und dankst fürs Zuhören.",
              erklaerung: "Das ist der Schluss, nicht der Anfang. Mit einem Gruß zum Abschied kann ein Vortrag nicht starten.",
            },
          ],
          richtig: 0,
          erklaerung: "In der Einleitung sagst du kurz, worum es geht und nennst dein Thema. So wissen alle gleich, was sie erwartet.",
        },
        {
          frage: "Womit fängst du deinen Vortrag am besten an, damit alle gleich zuhören?",
          optionen: [
            "Mit einer Frage oder einem spannenden Satz zum Thema.",
            {
              text: "Mit dem Satz „Ähm, ich weiß nicht so genau, wie ich anfangen soll.“",
              erklaerung: "So ein Anfang klingt unsicher und zieht die Zuhörer nicht ins Thema. Ein klarer Einstieg ist besser.",
            },
            {
              text: "Du liest erst einmal leise die Überschrift von deiner Karte ab.",
              erklaerung: "Leises Ablesen erreicht die Zuhörer nicht. Ein lebendiger Einstieg weckt das Interesse viel besser.",
            },
          ],
          richtig: 0,
          erklaerung: "Eine Frage oder ein spannender Satz macht neugierig, und alle hören von Anfang an aufmerksam zu.",
        },
        {
          frage: "Du übst den Vortrag. Was schreibst du dir auf deine Stichwortkarte?",
          optionen: [
            "Nur kurze Stichworte, die dich an die wichtigen Punkte erinnern.",
            {
              text: "Den ganzen Vortrag Wort für Wort als Fließtext.",
              erklaerung: "Einen ganzen Text liest man nur ab und schaut kaum hoch. Mit Stichworten sprichst du freier und schaust die Zuhörer an.",
            },
            {
              text: "Gar nichts, du sagst alles ganz frei aus dem Kopf.",
              erklaerung: "Ohne jede Stütze vergisst man leicht etwas. Ein paar Stichworte geben Sicherheit, ohne dass du abliest.",
            },
          ],
          richtig: 0,
          erklaerung: "Kurze Stichworte erinnern dich an die wichtigen Punkte, und du kannst trotzdem frei sprechen und hochschauen.",
        },
        {
          frage: "Du stehst vorn und trägst vor. Wie sprichst du am besten?",
          optionen: [
            "Langsam und laut genug, damit alle dich gut verstehen.",
            {
              text: "So schnell wie möglich, damit du schneller fertig bist.",
              erklaerung: "Wer hetzt, wird schwer verstanden. Langsam und deutlich zu sprechen hilft den Zuhörern, dir zu folgen.",
            },
            {
              text: "Ganz leise, damit niemand gestört wird.",
              erklaerung: "Zu leise versteht dich die hintere Reihe nicht. Du darfst und sollst beim Vortrag laut und deutlich sprechen.",
            },
          ],
          richtig: 0,
          erklaerung: "Langsam und laut genug zu sprechen sorgt dafür, dass alle im Raum dich gut verstehen können.",
        },
        {
          frage: "Wie beendest du deinen Mini-Vortrag sinnvoll?",
          optionen: [
            "Du fasst das Wichtigste kurz zusammen und bedankst dich fürs Zuhören.",
            {
              text: "Du hörst einfach mittendrin auf und gehst zum Platz.",
              erklaerung: "Ein Vortrag ohne Abschluss wirkt abgebrochen. Eine kurze Zusammenfassung rundet ihn sauber ab.",
            },
            {
              text: "Du fängst noch ein ganz neues Thema an.",
              erklaerung: "Am Ende kommt kein neues Thema mehr dazu. Der Schluss fasst zusammen, was du erzählt hast.",
            },
          ],
          richtig: 0,
          erklaerung: "Am Schluss fasst du das Wichtigste kurz zusammen und bedankst dich. So merken sich alle deine Hauptpunkte.",
        },
      ],
    },
  },
  lueckentext: {
    l7: {
      saetze: [
        {
          vor: '"Pater filium petit." Übersetzung: ',
          loesung: [
            "Der Vater sucht den Sohn",
            "Der Vater sucht den Sohn auf",
          ],
          nach: ".",
          tipp: "pater ist Nominativ (Subjekt), filium ist Akkusativ (Objekt). petere heißt hier aufsuchen, suchen.",
        },
        {
          vor: '"Mater numquam respondet." Übersetzung: ',
          loesung: [
            "Die Mutter antwortet niemals",
            "Die Mutter antwortet nie",
          ],
          nach: ".",
          tipp: "mater ist Nominativ (Subjekt), numquam heißt niemals. respondet ist 3. Person Singular: sie antwortet.",
        },
        {
          vor: '"Frater militi respondet." Übersetzung: ',
          loesung: [
            "Der Bruder antwortet dem Soldaten",
          ],
          nach: ".",
          tipp: "militi ist Dativ Singular von miles (dem Soldaten). respondere steht hier mit dem Dativ.",
        },
        {
          vor: '"Miles patrem petit." Übersetzung: ',
          loesung: [
            "Der Soldat sucht den Vater",
            "Der Soldat sucht den Vater auf",
          ],
          nach: ".",
          tipp: "miles ist Nominativ (Subjekt), patrem ist Akkusativ Singular von pater (den Vater).",
        },
        {
          vor: '"Pater et mater fratri respondent." Übersetzung: ',
          loesung: [
            "Vater und Mutter antworten dem Bruder",
            "Der Vater und die Mutter antworten dem Bruder",
          ],
          nach: ".",
          tipp: "pater et mater ist das Subjekt im Plural, darum respondent (sie antworten). fratri ist Dativ Singular von frater.",
        },
        {
          vor: '"Milites numquam respondent." Übersetzung: ',
          loesung: [
            "Die Soldaten antworten niemals",
            "Die Soldaten antworten nie",
          ],
          nach: ".",
          tipp: "milites ist Nominativ Plural von miles (die Soldaten), respondent ist die passende Plural-Form: sie antworten.",
        },
      ],
    },
    gr8: {
      saetze: [
        {
          situation: "Übersetze den ganzen Satz ins Deutsche. Suche zuerst das Verb, dann das Subjekt im Nominativ.",
          vor: "ho anthropos ten thalassan blepei bedeutet: ",
          loesung: [
            "Der Mensch sieht das Meer.",
            "Der Mensch sieht das Meer",
            "Der Mensch sieht die See.",
          ],
          nach: "",
          tipp: "ho anthropos steht im Nominativ (Wer?), ist also das Subjekt. ten thalassan steht im Akkusativ (Wen oder Was?), ist also das Objekt. blepei heißt er oder sie sieht.",
        },
        {
          situation: "Achte auf die Endungen, damit du Subjekt und Objekt nicht vertauschst.",
          vor: "he chora potamon echei bedeutet: ",
          loesung: [
            "Das Land hat einen Fluss.",
            "Das Land hat einen Fluss",
            "Die Landschaft hat einen Fluss.",
          ],
          nach: "",
          tipp: "he chora ist Nominativ (a-Deklination) und damit das Subjekt. potamon endet auf -n, steht also im Akkusativ und ist das Objekt. echei heißt er oder sie hat.",
        },
        {
          situation: "Übersetze in flüssigem Deutsch, nicht in der griechischen Wortreihenfolge.",
          vor: "ho doulos to teknon pherei bedeutet: ",
          loesung: [
            "Der Sklave trägt das Kind.",
            "Der Sklave trägt das Kind",
            "Der Diener trägt das Kind.",
          ],
          nach: "",
          tipp: "ho doulos ist Nominativ (Wer trägt?). to teknon ist sächlich und steht hier im Akkusativ (Wen oder Was?). pherei heißt er oder sie trägt.",
        },
        {
          situation: "Frage Wer oder Was, um das Subjekt im Nominativ zu finden.",
          vor: "he thea ton logon legei bedeutet: ",
          loesung: [
            "Die Göttin sagt das Wort.",
            "Die Göttin sagt das Wort",
            "Die Göttin spricht das Wort.",
          ],
          nach: "",
          tipp: "he thea (die Göttin) ist Nominativ und Subjekt. ton logon endet auf -n, ist also Akkusativ und Objekt. legei heißt er oder sie sagt.",
        },
        {
          situation: "Das Wörtchen eis steht vor dem Akkusativ und heißt in oder nach (Richtung wohin?).",
          vor: "ho potamos eis ten thalassan pherei bedeutet: ",
          loesung: [
            "Der Fluss führt ins Meer.",
            "Der Fluss führt ins Meer",
            "Der Fluss fließt ins Meer.",
          ],
          nach: "",
          tipp: "ho potamos ist Nominativ und Subjekt. eis ten thalassan ist Akkusativ mit eis und gibt die Richtung an: ins Meer hinein. pherei heißt hier er führt oder fließt.",
        },
        {
          situation: "Das Wörtchen en steht vor dem Dativ und heißt in (Ort wo?).",
          vor: "ho anthropos en te chora oikei bedeutet: ",
          loesung: [
            "Der Mensch wohnt in dem Land.",
            "Der Mensch wohnt in dem Land",
            "Der Mensch wohnt im Land.",
          ],
          nach: "",
          tipp: "ho anthropos ist Nominativ und Subjekt. en te chora steht im Dativ und gibt den Ort an (wo?): in dem Land. oikei heißt er oder sie wohnt.",
        },
      ],
    },
  },
};
