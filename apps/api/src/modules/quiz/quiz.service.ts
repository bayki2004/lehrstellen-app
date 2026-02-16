import { prisma } from '@lehrstellen/database';
import {
  QUIZ_QUESTIONS,
  type QuizAnswer,
  type QuizResult,
  type OceanScores,
  type RiasecScores,
} from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

export async function submitQuiz(userId: string, answers: QuizAnswer[]): Promise<QuizResult> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Student profile not found. Create your profile first.');
  }

  if (answers.length !== QUIZ_QUESTIONS.length) {
    throw ApiError.badRequest(
      `Expected ${QUIZ_QUESTIONS.length} answers, got ${answers.length}`,
    );
  }

  const oceanScores = computeOceanScores(answers);
  const riasecScores = computeRiasecScores(answers);

  await prisma.studentProfile.update({
    where: { userId },
    data: {
      oceanOpenness: oceanScores.openness,
      oceanConscientiousness: oceanScores.conscientiousness,
      oceanExtraversion: oceanScores.extraversion,
      oceanAgreeableness: oceanScores.agreeableness,
      oceanNeuroticism: oceanScores.neuroticism,
      riasecRealistic: riasecScores.realistic,
      riasecInvestigative: riasecScores.investigative,
      riasecArtistic: riasecScores.artistic,
      riasecSocial: riasecScores.social,
      riasecEnterprising: riasecScores.enterprising,
      riasecConventional: riasecScores.conventional,
      quizCompletedAt: new Date(),
    },
  });

  const topTraits = getTopTraits(oceanScores, riasecScores);
  const careerLabel = getCareerLabel(riasecScores);

  return { oceanScores, riasecScores, topTraits, careerLabel };
}

function computeOceanScores(answers: QuizAnswer[]): OceanScores {
  const traits: (keyof OceanScores)[] = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
  ];

  const scores: OceanScores = {
    openness: 0.5,
    conscientiousness: 0.5,
    extraversion: 0.5,
    agreeableness: 0.5,
    neuroticism: 0.5,
  };

  for (const trait of traits) {
    const questions = QUIZ_QUESTIONS.filter(
      (q) => q.category === 'OCEAN' && q.trait === trait,
    );
    let total = 0;
    let count = 0;

    for (const q of questions) {
      const answer = answers.find((a) => a.questionId === q.id);
      if (!answer) continue;

      // Normalize 1-5 to 0-1, reverse if needed
      let value = (answer.value - 1) / 4;
      if (q.reversed) value = 1 - value;

      total += value;
      count++;
    }

    if (count > 0) {
      scores[trait] = Math.round((total / count) * 100) / 100;
    }
  }

  return scores;
}

function computeRiasecScores(answers: QuizAnswer[]): RiasecScores {
  const types: (keyof RiasecScores)[] = [
    'realistic',
    'investigative',
    'artistic',
    'social',
    'enterprising',
    'conventional',
  ];

  const scores: RiasecScores = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  for (const type of types) {
    const questions = QUIZ_QUESTIONS.filter(
      (q) => q.category === 'RIASEC' && q.trait === type,
    );
    let total = 0;
    let count = 0;

    for (const q of questions) {
      const answer = answers.find((a) => a.questionId === q.id);
      if (!answer) continue;

      let value = (answer.value - 1) / 4;
      if (q.reversed) value = 1 - value;

      total += value;
      count++;
    }

    if (count > 0) {
      scores[type] = Math.round((total / count) * 100) / 100;
    }
  }

  return scores;
}

function getTopTraits(ocean: OceanScores, riasec: RiasecScores): string[] {
  const traitLabels: Record<string, string> = {
    openness: 'Kreativ & Offen',
    conscientiousness: 'Organisiert & Zuverlaessig',
    extraversion: 'Kommunikativ & Energiegeladen',
    agreeableness: 'Hilfsbereit & Teamfaehig',
    neuroticism: 'Sensibel & Nachdenklich',
    realistic: 'Praktisch & Handwerklich',
    investigative: 'Analytisch & Forschend',
    artistic: 'Kreativ & Kuenstlerisch',
    social: 'Sozial & Betreuend',
    enterprising: 'Unternehmerisch & Fuehrend',
    conventional: 'Strukturiert & Ordentlich',
  };

  const allScores = [
    ...Object.entries(ocean).map(([k, v]) => ({ key: k, value: v })),
    ...Object.entries(riasec).map(([k, v]) => ({ key: k, value: v })),
  ];

  return allScores
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((s) => traitLabels[s.key] || s.key);
}

function getCareerLabel(riasec: RiasecScores): string {
  const labels: Record<keyof RiasecScores, string> = {
    realistic: 'Hands-On Builder',
    investigative: 'Analytical Thinker',
    artistic: 'Creative Designer',
    social: 'People Connector',
    enterprising: 'Future Leader',
    conventional: 'Detail Organizer',
  };

  const top = Object.entries(riasec).sort(([, a], [, b]) => b - a)[0];
  return labels[top[0] as keyof RiasecScores] || 'Explorer';
}
