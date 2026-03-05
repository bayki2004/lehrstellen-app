import { PrismaClient, UserRole, SwipeDirection, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.application.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.studentGrade.deleteMany();
  await prisma.studentDesiredField.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.companyCulturePreset.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Test1234!', 10);

  // ============================================
  // CULTURE PRESETS
  // ============================================

  const presetData = [
    { name: 'Schreiner/in', hierarchyFocus: 55, punctualityRigidity: 60, resilienceGrit: 75, socialEnvironment: 45, errorCulture: 80, clientFacing: 40, digitalAffinity: 15, prideFocus: 90 },
    { name: 'Bank / Versicherung', hierarchyFocus: 80, punctualityRigidity: 90, resilienceGrit: 65, socialEnvironment: 60, errorCulture: 95, clientFacing: 75, digitalAffinity: 85, prideFocus: 70 },
    { name: 'Detailhandel', hierarchyFocus: 50, punctualityRigidity: 65, resilienceGrit: 60, socialEnvironment: 70, errorCulture: 50, clientFacing: 95, digitalAffinity: 40, prideFocus: 45 },
    { name: 'IT / Software', hierarchyFocus: 25, punctualityRigidity: 35, resilienceGrit: 55, socialEnvironment: 65, errorCulture: 40, clientFacing: 35, digitalAffinity: 95, prideFocus: 75 },
    { name: 'Spital / Pflege', hierarchyFocus: 70, punctualityRigidity: 85, resilienceGrit: 80, socialEnvironment: 85, errorCulture: 95, clientFacing: 90, digitalAffinity: 50, prideFocus: 80 },
    { name: 'Gastgewerbe', hierarchyFocus: 60, punctualityRigidity: 75, resilienceGrit: 70, socialEnvironment: 80, errorCulture: 55, clientFacing: 95, digitalAffinity: 20, prideFocus: 65 },
    { name: 'Maschinenbau', hierarchyFocus: 55, punctualityRigidity: 70, resilienceGrit: 80, socialEnvironment: 50, errorCulture: 90, clientFacing: 20, digitalAffinity: 60, prideFocus: 85 },
    { name: 'Grafik / Design', hierarchyFocus: 20, punctualityRigidity: 30, resilienceGrit: 40, socialEnvironment: 50, errorCulture: 30, clientFacing: 55, digitalAffinity: 90, prideFocus: 95 },
    { name: 'Buero / KV', hierarchyFocus: 65, punctualityRigidity: 75, resilienceGrit: 55, socialEnvironment: 60, errorCulture: 70, clientFacing: 50, digitalAffinity: 80, prideFocus: 55 },
    { name: 'Elektro / Installationen', hierarchyFocus: 50, punctualityRigidity: 70, resilienceGrit: 75, socialEnvironment: 40, errorCulture: 90, clientFacing: 45, digitalAffinity: 45, prideFocus: 80 },
  ];

  const presets: Record<string, string> = {};
  for (const p of presetData) {
    const preset = await prisma.companyCulturePreset.create({ data: p });
    presets[p.name] = preset.id;
  }

  // ============================================
  // STUDENTS
  // ============================================

  const students = [
    {
      email: 'lena.mueller@test.ch',
      profile: {
        firstName: 'Lena',
        lastName: 'Mueller',
        dateOfBirth: new Date('2010-03-15'),
        canton: 'ZH',
        city: 'Zurich',
        bio: 'Ich bin kreativ und liebe es, neue Dinge zu lernen. In meiner Freizeit programmiere ich kleine Spiele.',
        motivationLetter: 'Sehr geehrte Damen und Herren,\n\nSchon seit der Primarschule begeistere ich mich fuer Computer und Technologie. In der 5. Klasse habe ich mein erstes Spiel in Scratch programmiert, und seither hat mich die Faszination fuer die Informatik nicht mehr losgelassen.\n\nIn meiner Freizeit entwickle ich kleine Webseiten mit HTML und CSS und habe begonnen, Python zu lernen. Besonders reizt mich die Idee, Applikationen zu entwickeln, die Menschen im Alltag helfen.\n\nIch bin eine zielstrebige und neugierige Person, die gerne im Team arbeitet und sich fuer neue Herausforderungen begeistert. Eine Informatiklehre wuerde mir die Moeglichkeit geben, meine Leidenschaft zum Beruf zu machen.\n\nIch freue mich auf Ihre Rueckmeldung.\n\nFreundliche Gruesse\nLena Mueller',
        oceanOpenness: 0.85,
        oceanConscientiousness: 0.7,
        oceanExtraversion: 0.6,
        oceanAgreeableness: 0.75,
        oceanNeuroticism: 0.3,
        riasecRealistic: 0.4,
        riasecInvestigative: 0.8,
        riasecArtistic: 0.7,
        riasecSocial: 0.5,
        riasecEnterprising: 0.3,
        riasecConventional: 0.2,
        quizCompletedAt: new Date(),
        // Culture: IT-creative student — autonomous, flexible, team-oriented, digital
        cultureHierarchyFocus: 20,
        culturePunctualityRigidity: 30,
        cultureResilienceGrit: 50,
        cultureSocialEnvironment: 70,
        cultureErrorCulture: 35,
        cultureClientFacing: 40,
        cultureDigitalAffinity: 95,
        culturePrideFocus: 80,
        cultureQuizCompletedAt: new Date(),
      },
      desiredFields: ['Informatik', 'Mediamatiker/in'],
    },
    {
      email: 'marco.bianchi@test.ch',
      profile: {
        firstName: 'Marco',
        lastName: 'Bianchi',
        dateOfBirth: new Date('2010-07-22'),
        canton: 'ZH',
        city: 'Winterthur',
        bio: 'Sportlich und handwerklich begabt. Ich baue gerne Sachen und arbeite mit meinen Haenden.',
        oceanOpenness: 0.5,
        oceanConscientiousness: 0.8,
        oceanExtraversion: 0.7,
        oceanAgreeableness: 0.6,
        oceanNeuroticism: 0.25,
        riasecRealistic: 0.9,
        riasecInvestigative: 0.4,
        riasecArtistic: 0.2,
        riasecSocial: 0.5,
        riasecEnterprising: 0.3,
        riasecConventional: 0.5,
        quizCompletedAt: new Date(),
        // Culture: hands-on machinist — moderate hierarchy, punctual, endurance, precision
        cultureHierarchyFocus: 55,
        culturePunctualityRigidity: 70,
        cultureResilienceGrit: 80,
        cultureSocialEnvironment: 45,
        cultureErrorCulture: 85,
        cultureClientFacing: 20,
        cultureDigitalAffinity: 55,
        culturePrideFocus: 85,
        cultureQuizCompletedAt: new Date(),
      },
      desiredFields: ['Polymechaniker/in', 'Elektroinstallateur/in'],
    },
    {
      email: 'sara.keller@test.ch',
      profile: {
        firstName: 'Sara',
        lastName: 'Keller',
        dateOfBirth: new Date('2011-01-10'),
        canton: 'BE',
        city: 'Bern',
        bio: 'Ich helfe gerne Menschen und interessiere mich fuer Medizin und Gesundheit.',
        oceanOpenness: 0.6,
        oceanConscientiousness: 0.85,
        oceanExtraversion: 0.75,
        oceanAgreeableness: 0.9,
        oceanNeuroticism: 0.35,
        riasecRealistic: 0.5,
        riasecInvestigative: 0.6,
        riasecArtistic: 0.3,
        riasecSocial: 0.9,
        riasecEnterprising: 0.2,
        riasecConventional: 0.4,
        quizCompletedAt: new Date(),
        // Culture: healthcare student — hierarchical, punctual, team, client-facing, precision
        cultureHierarchyFocus: 65,
        culturePunctualityRigidity: 80,
        cultureResilienceGrit: 75,
        cultureSocialEnvironment: 90,
        cultureErrorCulture: 90,
        cultureClientFacing: 85,
        cultureDigitalAffinity: 45,
        culturePrideFocus: 75,
        cultureQuizCompletedAt: new Date(),
      },
      desiredFields: ['Fachmann/Fachfrau Gesundheit', 'Medizinische/r Praxisassistent/in'],
    },
    {
      email: 'noah.schmid@test.ch',
      profile: {
        firstName: 'Noah',
        lastName: 'Schmid',
        dateOfBirth: new Date('2010-11-05'),
        canton: 'BS',
        city: 'Basel',
        bio: 'Zahlen und Organisation sind meine Staerke. Ich moechte in einem Buero arbeiten.',
        oceanOpenness: 0.4,
        oceanConscientiousness: 0.9,
        oceanExtraversion: 0.45,
        oceanAgreeableness: 0.65,
        oceanNeuroticism: 0.2,
        riasecRealistic: 0.2,
        riasecInvestigative: 0.5,
        riasecArtistic: 0.1,
        riasecSocial: 0.4,
        riasecEnterprising: 0.6,
        riasecConventional: 0.9,
        quizCompletedAt: new Date(),
        // Culture: office/KV student — structured, punctual, digital, moderate hierarchy
        cultureHierarchyFocus: 60,
        culturePunctualityRigidity: 75,
        cultureResilienceGrit: 50,
        cultureSocialEnvironment: 55,
        cultureErrorCulture: 70,
        cultureClientFacing: 50,
        cultureDigitalAffinity: 80,
        culturePrideFocus: 55,
        cultureQuizCompletedAt: new Date(),
      },
      desiredFields: ['Kaufmann/Kauffrau (KV)', 'Informatik'],
    },
    {
      email: 'emma.weber@test.ch',
      profile: {
        firstName: 'Emma',
        lastName: 'Weber',
        dateOfBirth: new Date('2011-05-20'),
        canton: 'ZH',
        city: 'Zurich',
        bio: 'Kreativ und kommunikativ. Design und Medien faszinieren mich.',
        oceanOpenness: 0.9,
        oceanConscientiousness: 0.55,
        oceanExtraversion: 0.8,
        oceanAgreeableness: 0.7,
        oceanNeuroticism: 0.4,
        riasecRealistic: 0.3,
        riasecInvestigative: 0.4,
        riasecArtistic: 0.95,
        riasecSocial: 0.6,
        riasecEnterprising: 0.7,
        riasecConventional: 0.1,
        quizCompletedAt: new Date(),
        // Culture: design student — autonomous, flexible, creative quality focus
        cultureHierarchyFocus: 15,
        culturePunctualityRigidity: 25,
        cultureResilienceGrit: 35,
        cultureSocialEnvironment: 55,
        cultureErrorCulture: 25,
        cultureClientFacing: 60,
        cultureDigitalAffinity: 90,
        culturePrideFocus: 95,
        cultureQuizCompletedAt: new Date(),
      },
      desiredFields: ['Mediamatiker/in', 'Grafiker/in'],
    },
  ];

  for (const s of students) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash,
        role: UserRole.STUDENT,
        isVerified: true,
        studentProfile: {
          create: s.profile,
        },
      },
      include: { studentProfile: true },
    });

    for (let i = 0; i < s.desiredFields.length; i++) {
      await prisma.studentDesiredField.create({
        data: {
          studentId: user.studentProfile!.id,
          field: s.desiredFields[i],
          priority: i,
        },
      });
    }
  }

  // ============================================
  // COMPANIES & LISTINGS
  // ============================================

  const companies = [
    {
      email: 'hr@swisstech.ch',
      presetName: 'IT / Software',
      profile: {
        companyName: 'SwissTech Solutions AG',
        description:
          'Wir sind ein innovatives IT-Unternehmen in Zuerich, spezialisiert auf Cloud-Loesungen und Softwareentwicklung. Bei uns lernst du in einem modernen Umfeld mit agilen Teams.',
        industry: 'Informatik & Technologie',
        companySize: '51-200',
        website: 'https://swisstech-solutions.ch',
        canton: 'ZH',
        city: 'Zurich',
        address: 'Technopark, Technoparkstrasse 1',
        contactPersonName: 'Anna Brunner',
        contactPersonRole: 'HR-Leiterin',
        isVerified: true,
        // Culture: IT / Software preset values
        cultureHierarchyFocus: 25,
        culturePunctualityRigidity: 35,
        cultureResilienceGrit: 55,
        cultureSocialEnvironment: 65,
        cultureErrorCulture: 40,
        cultureClientFacing: 35,
        cultureDigitalAffinity: 95,
        culturePrideFocus: 75,
        // Dealbreakers: must be digital
        dealbreakerDigitalAffinity: true,
      },
      listings: [
        {
          title: 'Informatiker/in EFZ (Applikationsentwicklung)',
          description:
            'Lerne bei uns die Welt der Softwareentwicklung kennen! Du arbeitest in agilen Teams, entwickelst Web- und Mobile-Applikationen und lernst moderne Technologien wie React, Node.js und Cloud-Services.',
          field: 'Informatik',
          berufsfeld: '47613',
          durationYears: 4,
          startDate: new Date('2026-08-01'),
          spotsAvailable: 2,
          canton: 'ZH',
          city: 'Zurich',
          idealOceanOpenness: 0.8,
          idealOceanConscientiousness: 0.7,
          idealOceanExtraversion: 0.5,
          idealOceanAgreeableness: 0.6,
          idealOceanNeuroticism: 0.3,
          idealRiasecRealistic: 0.5,
          idealRiasecInvestigative: 0.9,
          idealRiasecArtistic: 0.4,
          idealRiasecSocial: 0.4,
          idealRiasecEnterprising: 0.3,
          idealRiasecConventional: 0.3,
          motivationQuestions: [
            { question: 'Warum interessierst du dich fuer die Informatik?', placeholder: 'Erzaehl uns von deiner Motivation...' },
            { question: 'Hast du bereits Erfahrung mit Programmieren gesammelt?', placeholder: 'z.B. Scratch, Python, eigene Projekte...' },
            { question: 'Was erwartest du von einer Lehre bei SwissTech?', placeholder: 'Was ist dir bei einem Lehrbetrieb wichtig?' },
          ],
        },
        {
          title: 'Mediamatiker/in EFZ',
          description:
            'Als Mediamatiker/in bei SwissTech lernst du, wie man digitale Medien, Marketing und IT verbindet. Du erstellst Content, pflegst Social Media und unterstuetzt unser Design-Team.',
          field: 'Mediamatiker/in',
          berufsfeld: '47623',
          durationYears: 4,
          startDate: new Date('2026-08-01'),
          spotsAvailable: 1,
          canton: 'ZH',
          city: 'Zurich',
          idealOceanOpenness: 0.85,
          idealOceanConscientiousness: 0.6,
          idealOceanExtraversion: 0.75,
          idealOceanAgreeableness: 0.65,
          idealOceanNeuroticism: 0.35,
          idealRiasecArtistic: 0.8,
          idealRiasecEnterprising: 0.6,
          idealRiasecSocial: 0.5,
          idealRiasecInvestigative: 0.3,
          idealRiasecRealistic: 0.2,
          idealRiasecConventional: 0.2,
        },
      ],
    },
    {
      email: 'ausbildung@muellerag.ch',
      presetName: 'Maschinenbau',
      profile: {
        companyName: 'Mueller Maschinenbau AG',
        description:
          'Seit 1965 sind wir fuehrend im Praezisionsmaschinenbau. Als Familienunternehmen bieten wir eine gruendliche Ausbildung mit viel praktischer Erfahrung in unserer modernen Werkstatt.',
        industry: 'Maschinen- & Metallbau',
        companySize: '11-50',
        canton: 'ZH',
        city: 'Winterthur',
        address: 'Industriestrasse 45',
        contactPersonName: 'Peter Mueller',
        contactPersonRole: 'Lehrmeister',
        isVerified: true,
        // Culture: Maschinenbau preset values
        cultureHierarchyFocus: 55,
        culturePunctualityRigidity: 70,
        cultureResilienceGrit: 80,
        cultureSocialEnvironment: 50,
        cultureErrorCulture: 90,
        cultureClientFacing: 20,
        cultureDigitalAffinity: 60,
        culturePrideFocus: 85,
        // Dealbreakers: precision and endurance are critical
        dealbreakerErrorCulture: true,
        dealbreakerResilienceGrit: true,
      },
      listings: [
        {
          title: 'Polymechaniker/in EFZ',
          description:
            'Arbeite mit modernsten CNC-Maschinen und lerne, wie praezise Bauteile fuer die Industrie hergestellt werden. Du wirst von erfahrenen Lehrmeistern begleitet und lernst CAD/CAM.',
          field: 'Polymechaniker/in',
          berufsfeld: '44726',
          durationYears: 4,
          startDate: new Date('2026-08-01'),
          spotsAvailable: 3,
          canton: 'ZH',
          city: 'Winterthur',
          idealOceanOpenness: 0.5,
          idealOceanConscientiousness: 0.85,
          idealOceanExtraversion: 0.4,
          idealOceanAgreeableness: 0.6,
          idealOceanNeuroticism: 0.25,
          idealRiasecRealistic: 0.95,
          idealRiasecInvestigative: 0.6,
          idealRiasecArtistic: 0.2,
          idealRiasecSocial: 0.3,
          idealRiasecEnterprising: 0.2,
          idealRiasecConventional: 0.5,
        },
        {
          title: 'Elektroinstallateur/in EFZ',
          description:
            'Installiere Elektrosysteme in Gebaeuden und Industrieanlagen. Du lernst alles ueber Strom, Schaltungen und Smart-Home-Technologie.',
          field: 'Elektroinstallateur/in',
          berufsfeld: '47105',
          durationYears: 4,
          startDate: new Date('2026-08-01'),
          spotsAvailable: 1,
          canton: 'ZH',
          city: 'Winterthur',
          idealOceanOpenness: 0.55,
          idealOceanConscientiousness: 0.8,
          idealOceanExtraversion: 0.5,
          idealOceanAgreeableness: 0.55,
          idealOceanNeuroticism: 0.2,
          idealRiasecRealistic: 0.9,
          idealRiasecInvestigative: 0.5,
          idealRiasecArtistic: 0.1,
          idealRiasecSocial: 0.3,
          idealRiasecEnterprising: 0.2,
          idealRiasecConventional: 0.6,
        },
      ],
    },
    {
      email: 'jobs@gesundheitszentrum-bern.ch',
      presetName: 'Spital / Pflege',
      profile: {
        companyName: 'Gesundheitszentrum Bern',
        description:
          'Unser Gesundheitszentrum verbindet moderne Medizin mit persoenlicher Betreuung. Wir bilden engagierte junge Menschen in verschiedenen Gesundheitsberufen aus.',
        industry: 'Gesundheit & Soziales',
        companySize: '201-1000',
        canton: 'BE',
        city: 'Bern',
        address: 'Spitalstrasse 12',
        contactPersonName: 'Dr. Thomas Gerber',
        contactPersonRole: 'Ausbildungsverantwortlicher',
        isVerified: true,
        // Culture: Spital / Pflege preset values
        cultureHierarchyFocus: 70,
        culturePunctualityRigidity: 85,
        cultureResilienceGrit: 80,
        cultureSocialEnvironment: 85,
        cultureErrorCulture: 95,
        cultureClientFacing: 90,
        cultureDigitalAffinity: 50,
        culturePrideFocus: 80,
        // Dealbreakers: precision is critical in healthcare, must be client-facing
        dealbreakerErrorCulture: true,
        dealbreakerClientFacing: true,
      },
      listings: [
        {
          title: 'Fachmann/Fachfrau Gesundheit EFZ',
          description:
            'Betreue Patient/innen in unserem modernen Gesundheitszentrum. Du lernst medizinische Grundlagen, Pflege und den Umgang mit Menschen in verschiedenen Lebenssituationen.',
          field: 'Fachmann/Fachfrau Gesundheit',
          berufsfeld: '86911',
          durationYears: 3,
          startDate: new Date('2026-08-01'),
          spotsAvailable: 4,
          canton: 'BE',
          city: 'Bern',
          idealOceanOpenness: 0.6,
          idealOceanConscientiousness: 0.8,
          idealOceanExtraversion: 0.7,
          idealOceanAgreeableness: 0.9,
          idealOceanNeuroticism: 0.3,
          idealRiasecRealistic: 0.5,
          idealRiasecInvestigative: 0.5,
          idealRiasecArtistic: 0.2,
          idealRiasecSocial: 0.95,
          idealRiasecEnterprising: 0.2,
          idealRiasecConventional: 0.4,
        },
        {
          title: 'Medizinische/r Praxisassistent/in EFZ',
          description:
            'Unterstuetze Aerzt/innen bei Untersuchungen, fuehre Laborarbeiten durch und betreue Patient/innen am Empfang. Ein vielseitiger Beruf im Gesundheitswesen.',
          field: 'Medizinische/r Praxisassistent/in',
          berufsfeld: '86621',
          durationYears: 3,
          startDate: new Date('2026-08-01'),
          spotsAvailable: 2,
          canton: 'BE',
          city: 'Bern',
          idealOceanOpenness: 0.55,
          idealOceanConscientiousness: 0.85,
          idealOceanExtraversion: 0.6,
          idealOceanAgreeableness: 0.85,
          idealOceanNeuroticism: 0.25,
          idealRiasecRealistic: 0.4,
          idealRiasecInvestigative: 0.6,
          idealRiasecArtistic: 0.1,
          idealRiasecSocial: 0.85,
          idealRiasecEnterprising: 0.2,
          idealRiasecConventional: 0.5,
        },
        {
          title: 'Kaufmann/Kauffrau EFZ (Gesundheitswesen)',
          description:
            'Arbeite im administrativen Bereich unseres Gesundheitszentrums. Du lernst Buchhaltung, Korrespondenz und Organisation im Gesundheitswesen.',
          field: 'Kaufmann/Kauffrau (KV)',
          berufsfeld: '68103',
          durationYears: 3,
          startDate: new Date('2026-08-01'),
          spotsAvailable: 1,
          canton: 'BE',
          city: 'Bern',
          idealOceanOpenness: 0.45,
          idealOceanConscientiousness: 0.9,
          idealOceanExtraversion: 0.5,
          idealOceanAgreeableness: 0.7,
          idealOceanNeuroticism: 0.2,
          idealRiasecRealistic: 0.2,
          idealRiasecInvestigative: 0.4,
          idealRiasecArtistic: 0.1,
          idealRiasecSocial: 0.5,
          idealRiasecEnterprising: 0.5,
          idealRiasecConventional: 0.9,
        },
      ],
    },
  ];

  for (const c of companies) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash,
        role: UserRole.COMPANY,
        isVerified: true,
        companyProfile: {
          create: {
            ...c.profile,
            culturePresetId: presets[c.presetName],
          },
        },
      },
      include: { companyProfile: true },
    });

    for (const listing of c.listings) {
      await prisma.listing.create({
        data: {
          companyId: user.companyProfile!.id,
          ...listing,
        },
      });
    }
  }

  // ============================================
  // TEST BEWERBUNG: Lena → SwissTech Informatiker/in
  // ============================================

  const lena = await prisma.studentProfile.findFirst({ where: { firstName: 'Lena' } });
  const swissTechCompany = await prisma.companyProfile.findFirst({ where: { companyName: 'SwissTech Solutions AG' } });
  const informatikListing = await prisma.listing.findFirst({
    where: { title: { contains: 'Informatiker/in EFZ' } },
  });

  if (lena && swissTechCompany && informatikListing) {
    // Swipe RIGHT
    await prisma.swipe.create({
      data: {
        studentId: lena.id,
        listingId: informatikListing.id,
        direction: SwipeDirection.RIGHT,
      },
    });

    // Match
    const match = await prisma.match.create({
      data: {
        studentId: lena.id,
        listingId: informatikListing.id,
        compatibilityScore: 82,
      },
    });

    // Application (Bewerbung)
    await prisma.application.create({
      data: {
        studentId: lena.id,
        listingId: informatikListing.id,
        matchId: match.id,
        status: ApplicationStatus.PENDING,
        motivationAnswers: [
          {
            question: 'Warum interessierst du dich fuer die Informatik?',
            answer: 'Schon seit der Primarschule fasziniert mich die Welt der Computer. Ich habe angefangen, kleine Spiele in Scratch zu bauen, und merkte schnell, dass ich Probleme gerne durch logisches Denken loese. Informatik verbindet Kreativitaet mit Technik — genau das begeistert mich.',
          },
          {
            question: 'Hast du bereits Erfahrung mit Programmieren gesammelt?',
            answer: 'Ja! Ich habe ueber 20 Scratch-Projekte erstellt, darunter ein Quiz-Spiel und einen kleinen Plattformer. Seit einem halben Jahr lerne ich Python mit Online-Kursen und habe eine einfache To-Do-App gebaut. Ausserdem habe ich eine eigene Webseite mit HTML und CSS erstellt.',
          },
          {
            question: 'Was erwartest du von einer Lehre bei SwissTech?',
            answer: 'Ich wuensche mir einen Lehrbetrieb, der moderne Technologien einsetzt und mir die Moeglichkeit gibt, an echten Projekten mitzuarbeiten. Bei SwissTech reizt mich besonders die Arbeit in agilen Teams und die Chance, von erfahrenen Entwicklern zu lernen.',
          },
        ],
        verfuegbarkeit: 'Ab August 2026',
        relevanteErfahrungen: [
          'Scratch-Projekte (2+ Jahre)',
          'Python Grundkenntnisse',
          'HTML & CSS Webseiten',
          'Schulprojekt: Robotik-AG',
        ],
        fragenAnBetrieb: 'Wie sieht ein typischer Arbeitstag fuer Lernende im ersten Jahr aus? Gibt es die Moeglichkeit, an eigenen Projekten zu arbeiten?',
        schnupperlehreWunsch: true,
        timeline: [
          {
            status: 'PENDING',
            timestamp: new Date().toISOString(),
            note: 'Bewerbung eingereicht',
          },
        ],
      },
    });

    // Grades: Zeugnis (ZH, Sek A)
    await prisma.studentGrade.create({
      data: {
        studentId: lena.id,
        documentType: 'zeugnis',
        entryMethod: 'manual',
        canton: 'ZH',
        niveau: 'Sek A',
        semester: 1,
        schoolYear: '2025/2026',
        grades: {
          mathematik: 5.5,
          deutsch: 5.0,
          franzoesisch: 4.5,
          englisch: 5.5,
          natur_und_technik: 5.5,
          raum_zeit_gesellschaft: 5.0,
          bildnerisches_gestalten: 5.5,
          musik: 4.5,
          sport: 5.0,
        },
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Grades: Multicheck ICT
    await prisma.studentGrade.create({
      data: {
        studentId: lena.id,
        documentType: 'multicheck',
        entryMethod: 'manual',
        testVariant: 'Multicheck ICT',
        testDate: new Date('2025-11-15'),
        grades: {
          schulisches_wissen: {
            mathematik: 78,
            deutsch: 65,
            franzoesisch: 52,
            englisch: 72,
          },
          potenzial: {
            logisches_denken: 88,
            konzentration: 75,
            merkfaehigkeit: 70,
            raeumliches_denken: 82,
          },
        },
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    console.log('Created test Bewerbung: Lena Mueller → SwissTech Informatiker/in EFZ');
    console.log('  - Swipe, Match (82% compatibility), Application (PENDING)');
    console.log('  - Zeugnis (ZH Sek A) + Multicheck ICT');
  }

  // ============================================
  // ADDITIONAL DEMO BEWERBUNGEN (Investor Pitch)
  // ============================================

  const emma = await prisma.studentProfile.findFirst({ where: { firstName: 'Emma' } });
  const marco = await prisma.studentProfile.findFirst({ where: { firstName: 'Marco' } });
  const sara = await prisma.studentProfile.findFirst({ where: { firstName: 'Sara' } });
  const noah = await prisma.studentProfile.findFirst({ where: { firstName: 'Noah' } });
  const muellerCompany = await prisma.companyProfile.findFirst({ where: { companyName: 'Mueller Maschinenbau AG' } });
  const gesundheitsCompany = await prisma.companyProfile.findFirst({ where: { companyName: 'Gesundheitszentrum Bern' } });

  const mediamatikListing = await prisma.listing.findFirst({ where: { title: { contains: 'Mediamatiker/in EFZ' } } });
  const polyListing = await prisma.listing.findFirst({ where: { title: { contains: 'Polymechaniker/in EFZ' } } });
  const elektroListing = await prisma.listing.findFirst({ where: { title: { contains: 'Elektroinstallateur/in EFZ' } } });
  const fageListing = await prisma.listing.findFirst({ where: { title: { contains: 'Fachmann/Fachfrau Gesundheit' } } });
  const mpaListing = await prisma.listing.findFirst({ where: { title: { contains: 'Praxisassistent/in' } } });
  const kvGesundheitListing = await prisma.listing.findFirst({ where: { title: { contains: 'Kaufmann/Kauffrau EFZ' } } });

  // Get User IDs for chat messages
  const marcoUser = await prisma.user.findFirst({ where: { email: 'marco.bianchi@test.ch' } });
  const muellerUser = await prisma.user.findFirst({ where: { email: 'ausbildung@muellerag.ch' } });

  // ── 2) Emma Weber → SwissTech Mediamatiker/in (INTERVIEW_SCHEDULED) ──
  if (emma && mediamatikListing) {
    await prisma.swipe.create({ data: { studentId: emma.id, listingId: mediamatikListing.id, direction: SwipeDirection.RIGHT } });
    const emmaMatch = await prisma.match.create({ data: { studentId: emma.id, listingId: mediamatikListing.id, compatibilityScore: 78 } });
    await prisma.application.create({
      data: {
        studentId: emma.id,
        listingId: mediamatikListing.id,
        matchId: emmaMatch.id,
        status: ApplicationStatus.INTERVIEW_SCHEDULED,
        motivationAnswers: [
          {
            question: 'Warum interessierst du dich fuer Mediamatik?',
            answer: 'Mich fasziniert die Verbindung von Kreativitaet und Technologie. Ich gestalte seit zwei Jahren eigene Designs mit Canva und Figma und fuehre einen Instagram-Account fuer den Schuelerrat mit ueber 400 Followern. Mediamatik ist fuer mich der perfekte Beruf, weil ich sowohl visuell als auch technisch arbeiten kann.',
          },
        ],
        verfuegbarkeit: 'Ab August 2026',
        relevanteErfahrungen: [
          'Instagram-Kanal Schuelerrat (2 Jahre)',
          'Canva & Figma Grundkenntnisse',
          'Schulprojekt: Webseite fuer Klassenlager',
          'Fotografie-Kurs VHS Zuerich',
        ],
        fragenAnBetrieb: 'Welche Design-Tools werden bei SwissTech eingesetzt? Gibt es die Moeglichkeit, eigene kreative Ideen einzubringen?',
        schnupperlehreWunsch: false,
        timeline: [
          { status: 'PENDING', timestamp: new Date('2026-01-15T09:30:00').toISOString(), note: 'Bewerbung eingereicht' },
          { status: 'VIEWED', timestamp: new Date('2026-01-17T14:20:00').toISOString(), note: 'Von HR angesehen' },
          { status: 'SHORTLISTED', timestamp: new Date('2026-01-22T10:00:00').toISOString(), note: 'Auf Shortlist gesetzt' },
          { status: 'INTERVIEW_SCHEDULED', timestamp: new Date('2026-02-03T08:45:00').toISOString(), note: 'Schnuppertag vereinbart: 10. Maerz 2026' },
        ],
      },
    });
    console.log('Created: Emma Weber → SwissTech Mediamatiker/in (INTERVIEW_SCHEDULED, 78%)');
  }

  // ── 3) Marco Bianchi → Mueller Polymechaniker/in (ACCEPTED + Chat) ──
  if (marco && polyListing && marcoUser && muellerUser) {
    await prisma.swipe.create({ data: { studentId: marco.id, listingId: polyListing.id, direction: SwipeDirection.RIGHT } });
    const marcoMatch = await prisma.match.create({ data: { studentId: marco.id, listingId: polyListing.id, compatibilityScore: 85 } });
    await prisma.application.create({
      data: {
        studentId: marco.id,
        listingId: polyListing.id,
        matchId: marcoMatch.id,
        status: ApplicationStatus.ACCEPTED,
        motivationAnswers: [
          {
            question: 'Warum moechtest du Polymechaniker werden?',
            answer: 'Mein Vater arbeitet als Mechaniker und ich bin schon als Kind in der Werkstatt gestanden. Praezision und Handwerk faszinieren mich. Ich habe im Werkunterricht die besten Noten und mein Werklehrer hat mir empfohlen, eine Lehre als Polymechaniker zu machen. Bei Mueller Maschinenbau reizt mich besonders die Arbeit mit modernen CNC-Maschinen.',
          },
        ],
        verfuegbarkeit: 'Ab August 2026',
        relevanteErfahrungen: [
          'Werkunterricht: Note 6.0',
          'Schnupperlehre bei Bucher Industries (1 Woche)',
          'Modellbau als Hobby (3 Jahre)',
          'Erste-Hilfe-Kurs absolviert',
        ],
        fragenAnBetrieb: 'Wie viele Lernende betreuen Sie pro Lehrjahr? Gibt es die Moeglichkeit, an Berufswettbewerben teilzunehmen?',
        schnupperlehreWunsch: false,
        timeline: [
          { status: 'PENDING', timestamp: new Date('2025-11-20T10:00:00').toISOString(), note: 'Bewerbung eingereicht' },
          { status: 'VIEWED', timestamp: new Date('2025-11-22T09:15:00').toISOString(), note: 'Von Lehrmeister angesehen' },
          { status: 'SHORTLISTED', timestamp: new Date('2025-12-02T16:30:00').toISOString(), note: 'Einladung zur Schnupperlehre' },
          { status: 'ACCEPTED', timestamp: new Date('2026-01-15T11:00:00').toISOString(), note: 'Lehrvertrag angeboten' },
        ],
      },
    });

    // Chat messages: Marco ↔ Peter Mueller
    await prisma.message.createMany({
      data: [
        {
          matchId: marcoMatch.id,
          senderId: muellerUser.id,
          content: 'Grüezi Marco! Herzlichen Glückwunsch, wir möchten dir eine Lehrstelle als Polymechaniker bei uns anbieten. Deine Schnupperlehre hat uns sehr überzeugt. Hast du nächste Woche Zeit für ein Gespräch mit deinen Eltern, um den Lehrvertrag zu besprechen?',
          createdAt: new Date('2026-01-15T11:05:00'),
        },
        {
          matchId: marcoMatch.id,
          senderId: marcoUser.id,
          content: 'Vielen Dank Herr Mueller! Das freut mich mega! Ja, nächste Woche passt gut. Meine Eltern hätten am Mittwoch oder Donnerstag Nachmittag Zeit. Was würde Ihnen besser passen?',
          createdAt: new Date('2026-01-15T17:22:00'),
        },
        {
          matchId: marcoMatch.id,
          senderId: muellerUser.id,
          content: 'Mittwoch, 22. Januar um 16:00 Uhr passt perfekt. Kommt einfach zu uns an die Industriestrasse 45 in Winterthur. Bring bitte dein letztes Zeugnis und einen Ausweis mit. Wir freuen uns!',
          createdAt: new Date('2026-01-16T08:30:00'),
        },
        {
          matchId: marcoMatch.id,
          senderId: marcoUser.id,
          content: 'Super, das passt! Wir kommen am Mittwoch um 16:00 Uhr. Ich freue mich sehr auf die Lehre bei Ihnen! Bis dann.',
          createdAt: new Date('2026-01-16T12:45:00'),
        },
      ],
    });

    // Grades for Marco: Zeugnis (ZH, Sek B)
    await prisma.studentGrade.create({
      data: {
        studentId: marco.id,
        documentType: 'zeugnis',
        entryMethod: 'manual',
        canton: 'ZH',
        niveau: 'Sek B',
        semester: 1,
        schoolYear: '2025/2026',
        grades: {
          mathematik: 5.0,
          deutsch: 4.5,
          franzoesisch: 4.0,
          englisch: 4.5,
          natur_und_technik: 5.5,
          raum_zeit_gesellschaft: 4.5,
          bildnerisches_gestalten: 5.0,
          musik: 4.0,
          sport: 5.5,
          werken: 6.0,
        },
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    console.log('Created: Marco Bianchi → Mueller Polymechaniker/in (ACCEPTED, 85%) + 4 chat messages');
  }

  // ── 4) Noah Schmid → Mueller Elektroinstallateur/in (REJECTED) ──
  if (noah && elektroListing) {
    await prisma.swipe.create({ data: { studentId: noah.id, listingId: elektroListing.id, direction: SwipeDirection.RIGHT } });
    const noahElektroMatch = await prisma.match.create({ data: { studentId: noah.id, listingId: elektroListing.id, compatibilityScore: 42 } });
    await prisma.application.create({
      data: {
        studentId: noah.id,
        listingId: elektroListing.id,
        matchId: noahElektroMatch.id,
        status: ApplicationStatus.REJECTED,
        motivationAnswers: [
          {
            question: 'Warum moechtest du Elektroinstallateur werden?',
            answer: 'Ich finde Technik interessant und moechte gerne etwas Praktisches lernen. Elektroinstallationen sind wichtig fuer die Zukunft, besonders mit Smart Homes und erneuerbaren Energien.',
          },
        ],
        verfuegbarkeit: 'Ab August 2026',
        relevanteErfahrungen: [
          'Informatik-Kurs in der Schule',
          'Gute Mathematiknoten',
        ],
        fragenAnBetrieb: 'Wie viel Zeit verbringt man auf Baustellen im Vergleich zur Werkstatt?',
        schnupperlehreWunsch: true,
        timeline: [
          { status: 'PENDING', timestamp: new Date('2026-01-10T14:00:00').toISOString(), note: 'Bewerbung eingereicht' },
          { status: 'VIEWED', timestamp: new Date('2026-01-13T09:30:00').toISOString(), note: 'Von Lehrmeister angesehen' },
          { status: 'REJECTED', timestamp: new Date('2026-01-18T16:00:00').toISOString(), note: 'Profil passt nicht zum Anforderungsprofil' },
        ],
      },
    });
    console.log('Created: Noah Schmid → Mueller Elektroinstallateur/in (REJECTED, 42%)');
  }

  // ── 5) Sara Keller → Gesundheitszentrum FaGe (SHORTLISTED) ──
  if (sara && fageListing) {
    await prisma.swipe.create({ data: { studentId: sara.id, listingId: fageListing.id, direction: SwipeDirection.RIGHT } });
    const saraMatch = await prisma.match.create({ data: { studentId: sara.id, listingId: fageListing.id, compatibilityScore: 91 } });
    await prisma.application.create({
      data: {
        studentId: sara.id,
        listingId: fageListing.id,
        matchId: saraMatch.id,
        status: ApplicationStatus.SHORTLISTED,
        motivationAnswers: [
          {
            question: 'Warum moechtest du im Gesundheitswesen arbeiten?',
            answer: 'Seit drei Jahren besuche ich jeden Samstag meine Grossmutter im Pflegeheim und helfe den Pflegerinnen freiwillig bei der Betreuung. Diese Erfahrung hat mir gezeigt, wie wichtig und erfuellend die Arbeit mit Menschen ist. Ich moechte einen Beruf erlernen, in dem ich taeglich etwas Sinnvolles tun kann und Menschen in schwierigen Situationen unterstuetze.',
          },
        ],
        verfuegbarkeit: 'Ab August 2026',
        relevanteErfahrungen: [
          'Freiwilligenarbeit im Pflegeheim (3 Jahre)',
          'Babysitter-Kurs SRK absolviert',
          'Nothelferkurs bestanden',
          'Schnupperlehre Spital Tiefenau (1 Woche)',
          'Samariter-Jugendgruppe Bern',
        ],
        fragenAnBetrieb: 'Wie sieht die Betreuung der Lernenden im Arbeitsalltag aus? Gibt es regelmaessige Reflexionsgespraeche? Kann man waehrend der Lehre auch auf verschiedenen Abteilungen arbeiten?',
        schnupperlehreWunsch: false,
        timeline: [
          { status: 'PENDING', timestamp: new Date('2026-01-08T08:00:00').toISOString(), note: 'Bewerbung eingereicht' },
          { status: 'VIEWED', timestamp: new Date('2026-01-09T10:45:00').toISOString(), note: 'Von Ausbildungsverantwortlichem angesehen' },
          { status: 'SHORTLISTED', timestamp: new Date('2026-01-14T14:30:00').toISOString(), note: 'Vielversprechende Kandidatin — Schnuppertag planen' },
        ],
      },
    });

    // Grades for Sara: Zeugnis (BE, Sek)
    await prisma.studentGrade.create({
      data: {
        studentId: sara.id,
        documentType: 'zeugnis',
        entryMethod: 'manual',
        canton: 'BE',
        niveau: 'Sekundarschule',
        semester: 1,
        schoolYear: '2025/2026',
        grades: {
          mathematik: 5.0,
          deutsch: 5.5,
          franzoesisch: 5.0,
          englisch: 4.5,
          natur_mensch_gesellschaft: 5.5,
          bildnerisches_gestalten: 5.0,
          musik: 5.0,
          sport: 5.5,
          hauswirtschaft: 5.5,
        },
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Grades for Sara: Multicheck Gesundheit + Soziales
    await prisma.studentGrade.create({
      data: {
        studentId: sara.id,
        documentType: 'multicheck',
        entryMethod: 'manual',
        testVariant: 'Multicheck Gesundheit + Soziales',
        testDate: new Date('2025-10-20'),
        grades: {
          schulisches_wissen: {
            mathematik: 62,
            deutsch: 78,
            franzoesisch: 58,
            biologie: 85,
          },
          potenzial: {
            konzentration: 82,
            merkfaehigkeit: 76,
            sprachgefuehl: 80,
            einfuehlungsvermoegen: 92,
          },
        },
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    console.log('Created: Sara Keller → Gesundheitszentrum FaGe (SHORTLISTED, 91%) + Grades');
  }

  // ── 6) Noah Schmid → Gesundheitszentrum Kaufmann/Kauffrau (VIEWED) ──
  if (noah && kvGesundheitListing) {
    await prisma.swipe.create({ data: { studentId: noah.id, listingId: kvGesundheitListing.id, direction: SwipeDirection.RIGHT } });
    const noahKvMatch = await prisma.match.create({ data: { studentId: noah.id, listingId: kvGesundheitListing.id, compatibilityScore: 72 } });
    await prisma.application.create({
      data: {
        studentId: noah.id,
        listingId: kvGesundheitListing.id,
        matchId: noahKvMatch.id,
        status: ApplicationStatus.VIEWED,
        motivationAnswers: [
          {
            question: 'Warum moechtest du eine KV-Lehre im Gesundheitswesen machen?',
            answer: 'Organisation und Verwaltung sind meine Staerken. Ich moechte diese Faehigkeiten in einem Bereich einsetzen, der einen gesellschaftlichen Beitrag leistet. Das Gesundheitswesen bietet genau diese Kombination: strukturierte Arbeit mit einem sinnvollen Zweck. Ich bin sehr zuverlaessig und arbeite gerne mit Zahlen und Dokumenten.',
          },
        ],
        verfuegbarkeit: 'Ab August 2026',
        relevanteErfahrungen: [
          'Tastaturschreiben: 180 Anschlaege/Minute',
          'Excel & Word Grundkenntnisse',
          'Schuelerrat-Kassier (2 Jahre)',
          'Schnupperlehre Kantonsverwaltung Basel',
        ],
        fragenAnBetrieb: 'Welche administrativen Aufgaben uebernehmen KV-Lernende im ersten Lehrjahr? Gibt es Einblicke in verschiedene Abteilungen?',
        schnupperlehreWunsch: true,
        timeline: [
          { status: 'PENDING', timestamp: new Date('2026-02-01T11:00:00').toISOString(), note: 'Bewerbung eingereicht' },
          { status: 'VIEWED', timestamp: new Date('2026-02-04T08:30:00').toISOString(), note: 'Von Ausbildungsverantwortlichem angesehen' },
        ],
      },
    });
    console.log('Created: Noah Schmid → Gesundheitszentrum KV (VIEWED, 72%)');
  }

  // ── 7) Lena Mueller → Gesundheitszentrum Med. Praxisassistent/in (PENDING) ──
  if (lena && mpaListing) {
    await prisma.swipe.create({ data: { studentId: lena.id, listingId: mpaListing.id, direction: SwipeDirection.RIGHT } });
    const lenaMpaMatch = await prisma.match.create({ data: { studentId: lena.id, listingId: mpaListing.id, compatibilityScore: 58 } });
    await prisma.application.create({
      data: {
        studentId: lena.id,
        listingId: mpaListing.id,
        matchId: lenaMpaMatch.id,
        status: ApplicationStatus.PENDING,
        motivationAnswers: [
          {
            question: 'Warum moechtest du Medizinische Praxisassistentin werden?',
            answer: 'Neben meiner Begeisterung fuer Informatik interessiere ich mich auch fuer Naturwissenschaften und den menschlichen Koerper. Die Kombination aus Labor, Patientenkontakt und digitaler Dokumentation reizt mich. Ich moechte erkunden, ob dieser Beruf eine Alternative zur IT-Lehre sein koennte.',
          },
        ],
        verfuegbarkeit: 'Ab August 2026',
        relevanteErfahrungen: [
          'Naturwissenschaften: Note 5.5',
          'Interesse an Biologie und Anatomie',
          'Erste-Hilfe-Kurs in der Schule',
        ],
        fragenAnBetrieb: 'Wie viel digitale Arbeit gibt es als MPA? Wird mit modernen Praxissoftware-Systemen gearbeitet?',
        schnupperlehreWunsch: true,
        timeline: [
          { status: 'PENDING', timestamp: new Date('2026-02-20T15:00:00').toISOString(), note: 'Bewerbung eingereicht' },
        ],
      },
    });
    console.log('Created: Lena Mueller → Gesundheitszentrum MPA (PENDING, 58%)');
  }

  console.log('\nSeeding complete!');
  console.log('Created 10 culture presets, 5 students and 3 companies with 7 listings.');
  console.log('Created 7 demo applications across all statuses for investor pitch.');
  console.log('All accounts use password: Test1234!');
  console.log('\nDemo logins:');
  console.log('  hr@swisstech.ch          → 2 Bewerber (PENDING, INTERVIEW_SCHEDULED)');
  console.log('  ausbildung@muellerag.ch  → 2 Bewerber (ACCEPTED + Chat, REJECTED)');
  console.log('  jobs@gesundheitszentrum-bern.ch → 3 Bewerber (SHORTLISTED, VIEWED, PENDING)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
