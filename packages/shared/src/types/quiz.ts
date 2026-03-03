import type { OceanScores, RiasecScores, CultureScores } from './api';

export interface QuizQuestion {
  id: string;
  text: string;
  textDe: string;
  category: 'OCEAN' | 'RIASEC' | 'CULTURE';
  trait: keyof OceanScores | keyof RiasecScores | keyof CultureScores;
  reversed: boolean;
}

export interface QuizAnswer {
  questionId: string;
  value: number; // 1-5 Likert scale
}

export interface QuizSubmission {
  answers: QuizAnswer[];
}

export interface QuizResult {
  oceanScores: OceanScores;
  riasecScores: RiasecScores;
  topTraits: string[];
  careerLabel: string;
}

/**
 * 22 personality assessment questions.
 * 10 OCEAN (2 per trait, 1 reversed each) + 12 RIASEC (2 per type).
 * Each answered on 1-5 Likert scale:
 *   1 = Stimme gar nicht zu / Strongly disagree
 *   5 = Stimme voellig zu / Strongly agree
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ===== OCEAN: Openness =====
  {
    id: 'o1',
    text: 'I enjoy exploring new ideas and creative solutions',
    textDe: 'Ich erforsche gerne neue Ideen und kreative Loesungen',
    category: 'OCEAN',
    trait: 'openness',
    reversed: false,
  },
  {
    id: 'o2',
    text: 'I prefer sticking to what I know rather than trying new things',
    textDe: 'Ich bleibe lieber bei dem, was ich kenne, als Neues auszuprobieren',
    category: 'OCEAN',
    trait: 'openness',
    reversed: true,
  },

  // ===== OCEAN: Conscientiousness =====
  {
    id: 'c1',
    text: 'I always plan ahead and organize my tasks carefully',
    textDe: 'Ich plane immer voraus und organisiere meine Aufgaben sorgfaeltig',
    category: 'OCEAN',
    trait: 'conscientiousness',
    reversed: false,
  },
  {
    id: 'c2',
    text: 'I often leave things unfinished or wait until the last minute',
    textDe: 'Ich lasse Dinge oft unfertig oder warte bis zur letzten Minute',
    category: 'OCEAN',
    trait: 'conscientiousness',
    reversed: true,
  },

  // ===== OCEAN: Extraversion =====
  {
    id: 'e1',
    text: 'I feel energized when working with other people',
    textDe: 'Ich fuehle mich voller Energie, wenn ich mit anderen Menschen arbeite',
    category: 'OCEAN',
    trait: 'extraversion',
    reversed: false,
  },
  {
    id: 'e2',
    text: 'I prefer working alone rather than in a group',
    textDe: 'Ich arbeite lieber alleine als in einer Gruppe',
    category: 'OCEAN',
    trait: 'extraversion',
    reversed: true,
  },

  // ===== OCEAN: Agreeableness =====
  {
    id: 'a1',
    text: 'I care a lot about helping others and being fair',
    textDe: 'Es ist mir sehr wichtig, anderen zu helfen und fair zu sein',
    category: 'OCEAN',
    trait: 'agreeableness',
    reversed: false,
  },
  {
    id: 'a2',
    text: 'I focus on my own goals even if it means competing with others',
    textDe: 'Ich konzentriere mich auf meine eigenen Ziele, auch wenn es bedeutet, mit anderen zu konkurrieren',
    category: 'OCEAN',
    trait: 'agreeableness',
    reversed: true,
  },

  // ===== OCEAN: Neuroticism =====
  {
    id: 'n1',
    text: 'I often worry about things that might go wrong',
    textDe: 'Ich mache mir oft Sorgen ueber Dinge, die schiefgehen koennten',
    category: 'OCEAN',
    trait: 'neuroticism',
    reversed: false,
  },
  {
    id: 'n2',
    text: 'I stay calm and relaxed even in stressful situations',
    textDe: 'Ich bleibe ruhig und entspannt, auch in stressigen Situationen',
    category: 'OCEAN',
    trait: 'neuroticism',
    reversed: true,
  },

  // ===== RIASEC: Realistic =====
  {
    id: 'r1',
    text: 'I enjoy building, fixing, or working with my hands',
    textDe: 'Ich baue, repariere und arbeite gerne mit meinen Haenden',
    category: 'RIASEC',
    trait: 'realistic',
    reversed: false,
  },
  {
    id: 'r2',
    text: 'I like working with tools, machines, or outdoor activities',
    textDe: 'Ich arbeite gerne mit Werkzeugen, Maschinen oder in der Natur',
    category: 'RIASEC',
    trait: 'realistic',
    reversed: false,
  },

  // ===== RIASEC: Investigative =====
  {
    id: 'i1',
    text: 'I love solving puzzles and figuring out how things work',
    textDe: 'Ich liebe es, Raetsel zu loesen und herauszufinden, wie Dinge funktionieren',
    category: 'RIASEC',
    trait: 'investigative',
    reversed: false,
  },
  {
    id: 'i2',
    text: 'I enjoy researching topics and analyzing data or information',
    textDe: 'Ich recherchiere gerne Themen und analysiere Daten oder Informationen',
    category: 'RIASEC',
    trait: 'investigative',
    reversed: false,
  },

  // ===== RIASEC: Artistic =====
  {
    id: 'ar1',
    text: 'I express myself through art, music, writing, or design',
    textDe: 'Ich druecke mich durch Kunst, Musik, Schreiben oder Design aus',
    category: 'RIASEC',
    trait: 'artistic',
    reversed: false,
  },
  {
    id: 'ar2',
    text: 'I enjoy creative projects where I can use my imagination',
    textDe: 'Ich mag kreative Projekte, bei denen ich meine Fantasie einsetzen kann',
    category: 'RIASEC',
    trait: 'artistic',
    reversed: false,
  },

  // ===== RIASEC: Social =====
  {
    id: 's1',
    text: 'I enjoy helping, teaching, or taking care of other people',
    textDe: 'Ich helfe, unterrichte oder kuemmere mich gerne um andere Menschen',
    category: 'RIASEC',
    trait: 'social',
    reversed: false,
  },
  {
    id: 's2',
    text: 'I feel fulfilled when I can make a difference in someone\'s life',
    textDe: 'Ich fuehle mich erfuellt, wenn ich im Leben anderer etwas bewirken kann',
    category: 'RIASEC',
    trait: 'social',
    reversed: false,
  },

  // ===== RIASEC: Enterprising =====
  {
    id: 'en1',
    text: 'I like leading projects and convincing others of my ideas',
    textDe: 'Ich leite gerne Projekte und ueberzeuge andere von meinen Ideen',
    category: 'RIASEC',
    trait: 'enterprising',
    reversed: false,
  },
  {
    id: 'en2',
    text: 'I enjoy selling, negotiating, or starting new ventures',
    textDe: 'Ich verkaufe, verhandle oder starte gerne neue Vorhaben',
    category: 'RIASEC',
    trait: 'enterprising',
    reversed: false,
  },

  // ===== RIASEC: Conventional =====
  {
    id: 'co1',
    text: 'I like organizing information, following clear rules, and keeping things in order',
    textDe: 'Ich ordne gerne Informationen, folge klaren Regeln und halte Ordnung',
    category: 'RIASEC',
    trait: 'conventional',
    reversed: false,
  },
  {
    id: 'co2',
    text: 'I enjoy working with numbers, spreadsheets, or detailed records',
    textDe: 'Ich arbeite gerne mit Zahlen, Tabellen oder detaillierten Aufzeichnungen',
    category: 'RIASEC',
    trait: 'conventional',
    reversed: false,
  },
];

/**
 * 16 culture preference questions (2 per dimension, 1 reversed each).
 * Answered on 1-5 Likert scale, normalized to 0-100.
 * Separate from OCEAN/RIASEC quiz — students can complete them independently.
 */
export const CULTURE_QUIZ_QUESTIONS: QuizQuestion[] = [
  // ===== Hierarchy Focus (0=Autonomy, 100=Obedience) =====
  {
    id: 'cu_h1',
    text: 'I want clear instructions from my supervisor',
    textDe: 'Ich möchte klare Anweisungen von meinem/meiner Vorgesetzten bekommen',
    category: 'CULTURE',
    trait: 'hierarchyFocus',
    reversed: false,
  },
  {
    id: 'cu_h2',
    text: 'I prefer deciding on my own how to do my work',
    textDe: 'Ich entscheide am liebsten selber, wie ich meine Arbeit erledige',
    category: 'CULTURE',
    trait: 'hierarchyFocus',
    reversed: true,
  },

  // ===== Punctuality / Rigidity (0=Flexible, 100=Strict) =====
  {
    id: 'cu_p1',
    text: 'I value strict schedules and punctuality',
    textDe: 'Mir sind feste Zeiten und Pünktlichkeit sehr wichtig',
    category: 'CULTURE',
    trait: 'punctualityRigidity',
    reversed: false,
  },
  {
    id: 'cu_p2',
    text: 'I work best when I can set my own pace and timing',
    textDe: 'Ich arbeite am besten, wenn ich mir mein Tempo selber einteilen kann',
    category: 'CULTURE',
    trait: 'punctualityRigidity',
    reversed: true,
  },

  // ===== Resilience / Grit (0=Variety, 100=Routine/Endurance) =====
  {
    id: 'cu_r1',
    text: 'I can focus on the same task for a long time without getting bored',
    textDe: 'Ich kann mich lange auf dieselbe Aufgabe konzentrieren, ohne dass es mir langweilig wird',
    category: 'CULTURE',
    trait: 'resilienceGrit',
    reversed: false,
  },
  {
    id: 'cu_r2',
    text: 'I need variety in my tasks to stay motivated',
    textDe: 'Ich brauche Abwechslung bei meinen Aufgaben, um motiviert zu bleiben',
    category: 'CULTURE',
    trait: 'resilienceGrit',
    reversed: true,
  },

  // ===== Social Environment (0=Solo, 100=Team) =====
  {
    id: 'cu_s1',
    text: 'I enjoy working closely with a team every day',
    textDe: 'Ich arbeite gerne jeden Tag eng mit einem Team zusammen',
    category: 'CULTURE',
    trait: 'socialEnvironment',
    reversed: false,
  },
  {
    id: 'cu_s2',
    text: 'I prefer quiet workspaces where I can concentrate alone',
    textDe: 'Ich bevorzuge ruhige Arbeitsplätze, an denen ich mich alleine konzentrieren kann',
    category: 'CULTURE',
    trait: 'socialEnvironment',
    reversed: true,
  },

  // ===== Error Culture (0=Fast/Fail, 100=Precision/Safety) =====
  {
    id: 'cu_e1',
    text: 'I think it is important to get things right the first time',
    textDe: 'Ich finde es wichtig, Dinge beim ersten Mal richtig zu machen',
    category: 'CULTURE',
    trait: 'errorCulture',
    reversed: false,
  },
  {
    id: 'cu_e2',
    text: 'I learn best by trying things out, even if I make mistakes',
    textDe: 'Ich lerne am besten, indem ich Dinge ausprobiere, auch wenn ich Fehler mache',
    category: 'CULTURE',
    trait: 'errorCulture',
    reversed: true,
  },

  // ===== Client Facing (0=Back-office, 100=Front-stage) =====
  {
    id: 'cu_c1',
    text: 'I like interacting with customers and clients regularly',
    textDe: 'Ich habe gerne regelmässig Kontakt mit Kunden',
    category: 'CULTURE',
    trait: 'clientFacing',
    reversed: false,
  },
  {
    id: 'cu_c2',
    text: 'I prefer working behind the scenes rather than dealing with customers',
    textDe: 'Ich arbeite lieber im Hintergrund als direkt mit Kunden',
    category: 'CULTURE',
    trait: 'clientFacing',
    reversed: true,
  },

  // ===== Digital Affinity (0=Analog/Hand, 100=Digital/Screen) =====
  {
    id: 'cu_d1',
    text: 'I enjoy working with computers, apps, and digital tools',
    textDe: 'Ich arbeite gerne mit Computern, Apps und digitalen Werkzeugen',
    category: 'CULTURE',
    trait: 'digitalAffinity',
    reversed: false,
  },
  {
    id: 'cu_d2',
    text: 'I prefer hands-on work with physical materials over screen work',
    textDe: 'Ich arbeite lieber mit den Händen und echten Materialien als am Bildschirm',
    category: 'CULTURE',
    trait: 'digitalAffinity',
    reversed: true,
  },

  // ===== Pride Focus (0=Speed/Output, 100=Quality/Masterpiece) =====
  {
    id: 'cu_q1',
    text: 'I take pride in delivering perfect quality, even if it takes longer',
    textDe: 'Ich bin stolz darauf, perfekte Qualität zu liefern, auch wenn es länger dauert',
    category: 'CULTURE',
    trait: 'prideFocus',
    reversed: false,
  },
  {
    id: 'cu_q2',
    text: 'I prefer getting things done quickly rather than making them perfect',
    textDe: 'Ich erledige Dinge lieber schnell, als sie perfekt zu machen',
    category: 'CULTURE',
    trait: 'prideFocus',
    reversed: true,
  },
];
