import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.application.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.studentDesiredField.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Test1234!', 10);

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
          create: c.profile,
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

  console.log('Seeding complete!');
  console.log('Created 5 students and 3 companies with 7 listings.');
  console.log('All accounts use password: Test1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
