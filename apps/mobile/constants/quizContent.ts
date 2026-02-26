import type { ActivityTile, PersonalityQuestion } from '../types/quiz.types';

// SF Symbol → emoji mapping for tiles
export const MORNING_TILES: ActivityTile[] = [
  { id: 'm01', label: 'Maschine bedienen', icon: '⚙️', scores: { realistic: 1.0, investigative: 0.3 }, isSelected: false },
  { id: 'm02', label: 'Holz bearbeiten', icon: '🔨', scores: { realistic: 1.0, artistic: 0.3 }, isSelected: false },
  { id: 'm03', label: 'Code schreiben', icon: '💻', scores: { investigative: 1.0, realistic: 0.3 }, isSelected: false },
  { id: 'm04', label: 'Experimente machen', icon: '🧪', scores: { investigative: 1.0 }, isSelected: false },
  { id: 'm05', label: 'Logo gestalten', icon: '🎨', scores: { artistic: 1.0, enterprising: 0.3 }, isSelected: false },
  { id: 'm06', label: 'Musik / Video produzieren', icon: '🎵', scores: { artistic: 1.0 }, isSelected: false },
  { id: 'm07', label: 'Patienten betreuen', icon: '❤️‍🩹', scores: { social: 1.0 }, isSelected: false },
  { id: 'm08', label: 'Kinder unterrichten', icon: '📚', scores: { social: 1.0, artistic: 0.3 }, isSelected: false },
  { id: 'm09', label: 'Kunden beraten', icon: '👥', scores: { social: 0.8, enterprising: 0.5 }, isSelected: false },
  { id: 'm10', label: 'Team leiten', icon: '👨‍👩‍👦', scores: { enterprising: 1.0, social: 0.3 }, isSelected: false },
  { id: 'm11', label: 'Produkte verkaufen', icon: '🏪', scores: { enterprising: 1.0 }, isSelected: false },
  { id: 'm12', label: 'Daten ordnen', icon: '📊', scores: { conventional: 1.0, investigative: 0.3 }, isSelected: false },
  { id: 'm13', label: 'Büro organisieren', icon: '📁', scores: { conventional: 1.0 }, isSelected: false },
  { id: 'm14', label: 'Elektrisch installieren', icon: '⚡', scores: { realistic: 0.8, investigative: 0.5 }, isSelected: false },
  { id: 'm15', label: 'Texte schreiben', icon: '📝', scores: { artistic: 0.5, conventional: 0.5 }, isSelected: false },
  { id: 'm16', label: 'Projekte planen', icon: '📅', scores: { enterprising: 0.5, conventional: 0.5 }, isSelected: false },
];

export const AFTERNOON_TILES: ActivityTile[] = [
  { id: 'a01', label: 'Draussen arbeiten', icon: '☀️', scores: { realistic: 1.0 }, isSelected: false },
  { id: 'a02', label: 'In der Werkstatt', icon: '🔧', scores: { realistic: 1.0 }, isSelected: false },
  { id: 'a03', label: 'Im Labor / Techraum', icon: '🖥️', scores: { investigative: 1.0 }, isSelected: false },
  { id: 'a04', label: 'Probleme analysieren', icon: '🔍', scores: { investigative: 1.0, conventional: 0.3 }, isSelected: false },
  { id: 'a05', label: 'Im Atelier / Studio', icon: '🎭', scores: { artistic: 1.0 }, isSelected: false },
  { id: 'a06', label: 'Auf der Bühne / vor Kamera', icon: '🎬', scores: { artistic: 0.8, enterprising: 0.5 }, isSelected: false },
  { id: 'a07', label: 'Im Spital / Praxis', icon: '🏥', scores: { social: 1.0 }, isSelected: false },
  { id: 'a08', label: 'Menschen zuhören', icon: '👂', scores: { social: 1.0 }, isSelected: false },
  { id: 'a09', label: 'Verhandlungen führen', icon: '💬', scores: { enterprising: 1.0 }, isSelected: false },
  { id: 'a10', label: 'Präsentationen halten', icon: '🎤', scores: { enterprising: 0.8, artistic: 0.3 }, isSelected: false },
  { id: 'a11', label: 'Listen und Tabellen führen', icon: '📋', scores: { conventional: 1.0 }, isSelected: false },
  { id: 'a12', label: 'Abläufe kontrollieren', icon: '✅', scores: { conventional: 1.0 }, isSelected: false },
  { id: 'a13', label: 'Körperlich aktiv sein', icon: '🏃', scores: { realistic: 0.8, social: 0.3 }, isSelected: false },
  { id: 'a14', label: 'Mit Zahlen arbeiten', icon: '🔢', scores: { investigative: 0.5, conventional: 0.5 }, isSelected: false },
  { id: 'a15', label: 'Events organisieren', icon: '🎉', scores: { enterprising: 0.5, social: 0.5 }, isSelected: false },
  { id: 'a16', label: 'Tiere / Pflanzen pflegen', icon: '🌿', scores: { realistic: 0.7, social: 0.3 }, isSelected: false },
];

export const SCENARIO_QUESTIONS: PersonalityQuestion[] = [
  {
    id: 's01',
    text: 'Dein Kollege hat Stress mit einer Aufgabe. Was machst du?',
    options: [
      { text: 'Ich helfe sofort mit', icon: '✋', scores: { social: 1.0, teamwork: 0.8 } },
      { text: 'Ich zeige einen effizienteren Weg', icon: '💡', scores: { investigative: 0.8, independence: 0.5 } },
      { text: 'Ich motiviere und muntere auf', icon: '📣', scores: { enterprising: 0.8, social: 0.5 } },
      { text: 'Ich mache mein eigenes Ding weiter', icon: '🎧', scores: { conventional: 0.5, independence: 1.0 } },
    ],
    dimension: 'social',
  },
  {
    id: 's02',
    text: 'Dein Traum-Arbeitsweg sieht so aus:',
    options: [
      { text: 'Mit dem Velo zur Baustelle', icon: '🚲', scores: { realistic: 1.0, physicalActivity: 0.8 } },
      { text: 'Zu Fuss ins Büro in der Stadt', icon: '🏢', scores: { conventional: 0.5, stability: 0.8 } },
      { text: 'Homeoffice, Laptop auf', icon: '💻', scores: { investigative: 0.8, independence: 0.8 } },
      { text: 'Egal, Hauptsache mit coolen Leuten', icon: '👫', scores: { social: 0.8, teamwork: 1.0 } },
    ],
    dimension: 'realistic',
  },
  {
    id: 's03',
    text: 'Du gewinnst 1000 CHF. Was machst du?',
    options: [
      { text: 'Neues Werkzeug oder Gadget kaufen', icon: '🔧', scores: { realistic: 0.8, technology: 0.8 } },
      { text: 'In einen Online-Kurs investieren', icon: '🎓', scores: { investigative: 1.0, independence: 0.5 } },
      { text: 'Ein kreatives Projekt starten', icon: '🖌️', scores: { artistic: 1.0, creativity: 1.0 } },
      { text: 'Etwas mit Freunden unternehmen', icon: '👨‍👩‍👦', scores: { social: 0.8, teamwork: 0.5 } },
    ],
    dimension: 'artistic',
  },
  {
    id: 's04',
    text: 'Welchen Social-Media-Kanal würdest du am liebsten betreiben?',
    options: [
      { text: 'DIY / Handwerk Tutorials', icon: '🔨', scores: { realistic: 0.8, creativity: 0.5 } },
      { text: 'Tech Reviews / Science Content', icon: '🖥️', scores: { investigative: 1.0, technology: 0.8 } },
      { text: 'Design / Art / Fotografie', icon: '📸', scores: { artistic: 1.0, creativity: 1.0 } },
      { text: 'Lifestyle / People / Vlogs', icon: '🤳', scores: { social: 0.5, enterprising: 0.5, helpingOthers: 0.5 } },
    ],
    dimension: 'artistic',
  },
  {
    id: 's05',
    text: 'Was nervt dich am meisten?',
    options: [
      { text: 'Den ganzen Tag stillsitzen', icon: '🪑', scores: { realistic: 1.0, physicalActivity: 1.0, variety: 0.5 } },
      { text: 'Immer das Gleiche machen', icon: '🔄', scores: { artistic: 0.5, enterprising: 0.5, variety: 1.0 } },
      { text: 'Alleine arbeiten ohne Teamkontakt', icon: '🚫', scores: { social: 1.0, teamwork: 1.0 } },
      { text: 'Chaos ohne klare Struktur', icon: '⚠️', scores: { conventional: 1.0, stability: 1.0 } },
    ],
    dimension: 'conventional',
  },
  {
    id: 's06',
    text: 'Ein neues Schulprojekt steht an. Du übernimmst am liebsten:',
    options: [
      { text: 'Den praktischen Teil (bauen, basteln)', icon: '🔨', scores: { realistic: 1.0, independence: 0.5 } },
      { text: 'Die Recherche und Analyse', icon: '🔎', scores: { investigative: 1.0, independence: 0.8 } },
      { text: 'Das Design und die Gestaltung', icon: '🎨', scores: { artistic: 1.0, creativity: 1.0 } },
      { text: 'Die Koordination im Team', icon: '👥', scores: { enterprising: 0.8, teamwork: 0.8 } },
    ],
    dimension: 'realistic',
  },
  {
    id: 's07',
    text: 'Stell dir vor, du könntest ein Problem der Welt lösen. Welches?',
    options: [
      { text: 'Kaputte Infrastruktur reparieren', icon: '🔧', scores: { realistic: 1.0, helpingOthers: 0.5 } },
      { text: 'Eine Krankheit heilen', icon: '💊', scores: { investigative: 0.8, social: 0.5, helpingOthers: 1.0 } },
      { text: 'Mehr Zugang zu Kunst und Kultur', icon: '🎭', scores: { artistic: 1.0, helpingOthers: 0.8 } },
      { text: 'Einsamkeit bekämpfen', icon: '❤️', scores: { social: 1.0, helpingOthers: 1.0 } },
    ],
    dimension: 'social',
  },
  {
    id: 's08',
    text: 'Wie lernst du am besten?',
    options: [
      { text: 'Learning by Doing — einfach ausprobieren', icon: '👆', scores: { realistic: 1.0, independence: 0.5 } },
      { text: 'Selber recherchieren und lesen', icon: '📖', scores: { investigative: 1.0, independence: 1.0 } },
      { text: 'Notizen skizzieren oder Mindmaps machen', icon: '✏️', scores: { artistic: 0.8, creativity: 0.5 } },
      { text: 'Im Gespräch mit anderen', icon: '💬', scores: { social: 1.0, teamwork: 0.8 } },
    ],
    dimension: 'investigative',
  },
  {
    id: 's09',
    text: 'Dein Chef sagt: «Mach einfach, wie du willst.» Wie reagierst du?',
    options: [
      { text: 'Super, ich lege direkt los!', icon: '⚡', scores: { realistic: 0.5, enterprising: 0.5, independence: 1.0 } },
      { text: 'Ich mache erstmal einen Plan', icon: '📋', scores: { conventional: 1.0, stability: 0.8 } },
      { text: 'Ich frage Kollegen, was sie denken', icon: '🗣️', scores: { social: 0.8, teamwork: 1.0 } },
      { text: 'Ich probiere was Kreatives aus', icon: '✨', scores: { artistic: 1.0, creativity: 1.0 } },
    ],
    dimension: 'enterprising',
  },
  {
    id: 's10',
    text: 'In 10 Jahren willst du:',
    options: [
      { text: 'Mein eigenes Unternehmen führen', icon: '🏢', scores: { enterprising: 1.0, independence: 1.0 } },
      { text: 'Expert/in in meinem Fachgebiet sein', icon: '⭐', scores: { investigative: 0.8, realistic: 0.5, stability: 0.5 } },
      { text: 'Einen Job, der Menschen hilft', icon: '❤️', scores: { social: 1.0, helpingOthers: 1.0 } },
      { text: 'Kreative Projekte verwirklichen', icon: '✨', scores: { artistic: 1.0, creativity: 1.0 } },
    ],
    dimension: 'enterprising',
  },
];
