import Foundation

/// All quiz content for the "Build Your Day" personality assessment.
/// Edit this file to change questions, tiles, or scoring.
enum QuizContent {

    // MARK: - Phase 1: Morning Activity Tiles (16 total)

    static let morningTiles: [ActivityTile] = [
        ActivityTile(id: "m01", label: "Maschine bedienen",         iconName: "gearshape.2",                                    scores: [.realistic: 1.0, .investigative: 0.3]),
        ActivityTile(id: "m02", label: "Holz bearbeiten",           iconName: "hammer",                                         scores: [.realistic: 1.0, .artistic: 0.3]),
        ActivityTile(id: "m03", label: "Code schreiben",            iconName: "chevron.left.forwardslash.chevron.right",         scores: [.investigative: 1.0, .realistic: 0.3]),
        ActivityTile(id: "m04", label: "Experimente machen",        iconName: "flask",                                          scores: [.investigative: 1.0]),
        ActivityTile(id: "m05", label: "Logo gestalten",            iconName: "paintbrush",                                     scores: [.artistic: 1.0, .enterprising: 0.3]),
        ActivityTile(id: "m06", label: "Musik / Video produzieren", iconName: "music.note",                                     scores: [.artistic: 1.0]),
        ActivityTile(id: "m07", label: "Patienten betreuen",        iconName: "heart.text.clipboard",                           scores: [.social: 1.0]),
        ActivityTile(id: "m08", label: "Kinder unterrichten",       iconName: "book",                                           scores: [.social: 1.0, .artistic: 0.3]),
        ActivityTile(id: "m09", label: "Kunden beraten",            iconName: "person.2",                                       scores: [.social: 0.8, .enterprising: 0.5]),
        ActivityTile(id: "m10", label: "Team leiten",               iconName: "person.3.sequence",                              scores: [.enterprising: 1.0, .social: 0.3]),
        ActivityTile(id: "m11", label: "Produkte verkaufen",        iconName: "storefront",                                     scores: [.enterprising: 1.0]),
        ActivityTile(id: "m12", label: "Daten ordnen",              iconName: "tablecells",                                     scores: [.conventional: 1.0, .investigative: 0.3]),
        ActivityTile(id: "m13", label: "Büro organisieren",         iconName: "folder",                                         scores: [.conventional: 1.0]),
        ActivityTile(id: "m14", label: "Elektrisch installieren",   iconName: "bolt",                                           scores: [.realistic: 0.8, .investigative: 0.5]),
        ActivityTile(id: "m15", label: "Texte schreiben",           iconName: "doc.text",                                       scores: [.artistic: 0.5, .conventional: 0.5]),
        ActivityTile(id: "m16", label: "Projekte planen",           iconName: "calendar",                                       scores: [.enterprising: 0.5, .conventional: 0.5]),
    ]

    // MARK: - Phase 2: Afternoon Environment Tiles (16 total)

    static let afternoonTiles: [ActivityTile] = [
        ActivityTile(id: "a01", label: "Draussen arbeiten",          iconName: "sun.max",                             scores: [.realistic: 1.0]),
        ActivityTile(id: "a02", label: "In der Werkstatt",           iconName: "wrench.and.screwdriver",              scores: [.realistic: 1.0]),
        ActivityTile(id: "a03", label: "Im Labor / Techraum",        iconName: "desktopcomputer",                     scores: [.investigative: 1.0]),
        ActivityTile(id: "a04", label: "Probleme analysieren",       iconName: "magnifyingglass",                     scores: [.investigative: 1.0, .conventional: 0.3]),
        ActivityTile(id: "a05", label: "Im Atelier / Studio",        iconName: "paintpalette",                        scores: [.artistic: 1.0]),
        ActivityTile(id: "a06", label: "Auf der Bühne / vor Kamera", iconName: "video",                               scores: [.artistic: 0.8, .enterprising: 0.5]),
        ActivityTile(id: "a07", label: "Im Spital / Praxis",         iconName: "cross.case",                          scores: [.social: 1.0]),
        ActivityTile(id: "a08", label: "Menschen zuhören",           iconName: "ear",                                 scores: [.social: 1.0]),
        ActivityTile(id: "a09", label: "Verhandlungen führen",       iconName: "bubble.left.and.bubble.right",        scores: [.enterprising: 1.0]),
        ActivityTile(id: "a10", label: "Präsentationen halten",      iconName: "person.and.background.dotted",        scores: [.enterprising: 0.8, .artistic: 0.3]),
        ActivityTile(id: "a11", label: "Listen und Tabellen führen", iconName: "list.clipboard",                      scores: [.conventional: 1.0]),
        ActivityTile(id: "a12", label: "Abläufe kontrollieren",      iconName: "checklist",                           scores: [.conventional: 1.0]),
        ActivityTile(id: "a13", label: "Körperlich aktiv sein",      iconName: "figure.run",                          scores: [.realistic: 0.8, .social: 0.3]),
        ActivityTile(id: "a14", label: "Mit Zahlen arbeiten",        iconName: "function",                            scores: [.investigative: 0.5, .conventional: 0.5]),
        ActivityTile(id: "a15", label: "Events organisieren",        iconName: "party.popper",                        scores: [.enterprising: 0.5, .social: 0.5]),
        ActivityTile(id: "a16", label: "Tiere / Pflanzen pflegen",   iconName: "leaf",                                scores: [.realistic: 0.7, .social: 0.3]),
    ]

    // MARK: - Phase 3: Scenario Questions (10 total)

    static let scenarioQuestions: [PersonalityQuestion] = [
        PersonalityQuestion(
            id: "s01",
            text: "Dein Kollege hat Stress mit einer Aufgabe. Was machst du?",
            options: [
                QuizOption(text: "Ich helfe sofort mit",               imageSystemName: "hand.raised",        scores: [.social: 1.0, .teamwork: 0.8]),
                QuizOption(text: "Ich zeige einen effizienteren Weg",  imageSystemName: "lightbulb",          scores: [.investigative: 0.8, .independence: 0.5]),
                QuizOption(text: "Ich motiviere und muntere auf",      imageSystemName: "megaphone",          scores: [.enterprising: 0.8, .social: 0.5]),
                QuizOption(text: "Ich mache mein eigenes Ding weiter", imageSystemName: "headphones",         scores: [.conventional: 0.5, .independence: 1.0]),
            ],
            dimension: .social
        ),
        PersonalityQuestion(
            id: "s02",
            text: "Dein Traum-Arbeitsweg sieht so aus:",
            options: [
                QuizOption(text: "Mit dem Velo zur Baustelle",         imageSystemName: "bicycle",            scores: [.realistic: 1.0, .physicalActivity: 0.8]),
                QuizOption(text: "Zu Fuss ins Büro in der Stadt",      imageSystemName: "building.2",         scores: [.conventional: 0.5, .stability: 0.8]),
                QuizOption(text: "Homeoffice, Laptop auf",             imageSystemName: "laptopcomputer",     scores: [.investigative: 0.8, .independence: 0.8]),
                QuizOption(text: "Egal, Hauptsache mit coolen Leuten", imageSystemName: "person.3.fill",      scores: [.social: 0.8, .teamwork: 1.0]),
            ],
            dimension: .realistic
        ),
        PersonalityQuestion(
            id: "s03",
            text: "Du gewinnst 1000 CHF. Was machst du?",
            options: [
                QuizOption(text: "Neues Werkzeug oder Gadget kaufen",  imageSystemName: "wrench.and.screwdriver",  scores: [.realistic: 0.8, .technology: 0.8]),
                QuizOption(text: "In einen Online-Kurs investieren",   imageSystemName: "graduationcap",           scores: [.investigative: 1.0, .independence: 0.5]),
                QuizOption(text: "Ein kreatives Projekt starten",      imageSystemName: "paintbrush.pointed",      scores: [.artistic: 1.0, .creativity: 1.0]),
                QuizOption(text: "Etwas mit Freunden unternehmen",     imageSystemName: "figure.2.and.child.holdinghands", scores: [.social: 0.8, .teamwork: 0.5]),
            ],
            dimension: .artistic
        ),
        PersonalityQuestion(
            id: "s04",
            text: "Welchen Social-Media-Kanal würdest du am liebsten betreiben?",
            options: [
                QuizOption(text: "DIY / Handwerk Tutorials",           imageSystemName: "hammer.circle",      scores: [.realistic: 0.8, .creativity: 0.5]),
                QuizOption(text: "Tech Reviews / Science Content",     imageSystemName: "cpu",                scores: [.investigative: 1.0, .technology: 0.8]),
                QuizOption(text: "Design / Art / Fotografie",          imageSystemName: "camera",             scores: [.artistic: 1.0, .creativity: 1.0]),
                QuizOption(text: "Lifestyle / People / Vlogs",         imageSystemName: "person.crop.circle", scores: [.social: 0.5, .enterprising: 0.5, .helpingOthers: 0.5]),
            ],
            dimension: .artistic
        ),
        PersonalityQuestion(
            id: "s05",
            text: "Was nervt dich am meisten?",
            options: [
                QuizOption(text: "Den ganzen Tag stillsitzen",             imageSystemName: "chair.lounge",       scores: [.realistic: 1.0, .physicalActivity: 1.0, .variety: 0.5]),
                QuizOption(text: "Immer das Gleiche machen",               imageSystemName: "repeat",             scores: [.artistic: 0.5, .enterprising: 0.5, .variety: 1.0]),
                QuizOption(text: "Alleine arbeiten ohne Teamkontakt",      imageSystemName: "person.slash",       scores: [.social: 1.0, .teamwork: 1.0]),
                QuizOption(text: "Chaos ohne klare Struktur",              imageSystemName: "exclamationmark.triangle", scores: [.conventional: 1.0, .stability: 1.0]),
            ],
            dimension: .conventional
        ),
        PersonalityQuestion(
            id: "s06",
            text: "Ein neues Schulprojekt steht an. Du übernimmst am liebsten:",
            options: [
                QuizOption(text: "Den praktischen Teil (bauen, basteln)", imageSystemName: "hammer",            scores: [.realistic: 1.0, .independence: 0.5]),
                QuizOption(text: "Die Recherche und Analyse",            imageSystemName: "doc.text.magnifyingglass", scores: [.investigative: 1.0, .independence: 0.8]),
                QuizOption(text: "Das Design und die Gestaltung",        imageSystemName: "paintbrush",         scores: [.artistic: 1.0, .creativity: 1.0]),
                QuizOption(text: "Die Koordination im Team",             imageSystemName: "person.3",           scores: [.enterprising: 0.8, .teamwork: 0.8]),
            ],
            dimension: .realistic
        ),
        PersonalityQuestion(
            id: "s07",
            text: "Stell dir vor, du könntest ein Problem der Welt lösen. Welches?",
            options: [
                QuizOption(text: "Kaputte Infrastruktur reparieren",       imageSystemName: "wrench",             scores: [.realistic: 1.0, .helpingOthers: 0.5]),
                QuizOption(text: "Eine Krankheit heilen",                  imageSystemName: "heart.text.clipboard", scores: [.investigative: 0.8, .social: 0.5, .helpingOthers: 1.0]),
                QuizOption(text: "Mehr Zugang zu Kunst und Kultur",        imageSystemName: "theatermasks",        scores: [.artistic: 1.0, .helpingOthers: 0.8]),
                QuizOption(text: "Einsamkeit bekämpfen",                   imageSystemName: "heart.circle",        scores: [.social: 1.0, .helpingOthers: 1.0]),
            ],
            dimension: .social
        ),
        PersonalityQuestion(
            id: "s08",
            text: "Wie lernst du am besten?",
            options: [
                QuizOption(text: "Learning by Doing — einfach ausprobieren", imageSystemName: "hand.point.up",     scores: [.realistic: 1.0, .independence: 0.5]),
                QuizOption(text: "Selber recherchieren und lesen",           imageSystemName: "book",               scores: [.investigative: 1.0, .independence: 1.0]),
                QuizOption(text: "Notizen skizzieren oder Mindmaps machen", imageSystemName: "scribble.variable",  scores: [.artistic: 0.8, .creativity: 0.5]),
                QuizOption(text: "Im Gespräch mit anderen",                 imageSystemName: "bubble.left.and.bubble.right", scores: [.social: 1.0, .teamwork: 0.8]),
            ],
            dimension: .investigative
        ),
        PersonalityQuestion(
            id: "s09",
            text: "Dein Chef sagt: «Mach einfach, wie du willst.» Wie reagierst du?",
            options: [
                QuizOption(text: "Super, ich lege direkt los!",        imageSystemName: "bolt.fill",          scores: [.realistic: 0.5, .enterprising: 0.5, .independence: 1.0]),
                QuizOption(text: "Ich mache erstmal einen Plan",       imageSystemName: "list.number",        scores: [.conventional: 1.0, .stability: 0.8]),
                QuizOption(text: "Ich frage Kollegen, was sie denken", imageSystemName: "person.2.wave.2",    scores: [.social: 0.8, .teamwork: 1.0]),
                QuizOption(text: "Ich probiere was Kreatives aus",     imageSystemName: "wand.and.stars",     scores: [.artistic: 1.0, .creativity: 1.0]),
            ],
            dimension: .enterprising
        ),
        PersonalityQuestion(
            id: "s10",
            text: "In 10 Jahren willst du:",
            options: [
                QuizOption(text: "Mein eigenes Unternehmen führen",   imageSystemName: "building",           scores: [.enterprising: 1.0, .independence: 1.0]),
                QuizOption(text: "Expert/in in meinem Fachgebiet sein", imageSystemName: "star",              scores: [.investigative: 0.8, .realistic: 0.5, .stability: 0.5]),
                QuizOption(text: "Einen Job, der Menschen hilft",     imageSystemName: "heart.fill",         scores: [.social: 1.0, .helpingOthers: 1.0]),
                QuizOption(text: "Kreative Projekte verwirklichen",   imageSystemName: "sparkles",           scores: [.artistic: 1.0, .creativity: 1.0]),
            ],
            dimension: .enterprising
        ),
    ]
}
