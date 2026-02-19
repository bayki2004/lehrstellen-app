import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear all data in dependency order
  await prisma.message.deleteMany();
  await prisma.application.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.schnupperlehreEntry.deleteMany();
  await prisma.studentLanguage.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.studentSchool.deleteMany();
  await prisma.studentDesiredField.deleteMany();
  await prisma.companyLink.deleteMany();
  await prisma.companyPhoto.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.beruf.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash('Test1234!', 10);

  // ============================================
  // BERUFE
  // ============================================
  await prisma.beruf.createMany({
    data: [
      { name: 'Informatiker/in EFZ', field: 'Informatik', educationType: 'EFZ',
        description: 'Entwickle Software, administriere Systeme oder betreue Netzwerke.',
        riasecR: 0.4, riasecI: 0.9, riasecA: 0.3, riasecS: 0.3, riasecE: 0.3, riasecC: 0.6 },
      { name: 'Mediamatiker/in EFZ', field: 'Medien & Gestaltung', educationType: 'EFZ',
        description: 'Verbinde IT, Design und Marketing in einem vielseitigen Beruf.',
        riasecR: 0.2, riasecI: 0.4, riasecA: 0.9, riasecS: 0.5, riasecE: 0.6, riasecC: 0.3 },
      { name: 'Kaufmann/Kauffrau EFZ', field: 'Kaufmännisch', educationType: 'EFZ',
        description: 'Büroarbeit, Buchhaltung und Korrespondenz in verschiedenen Branchen.',
        riasecR: 0.1, riasecI: 0.4, riasecA: 0.1, riasecS: 0.5, riasecE: 0.6, riasecC: 0.9 },
      { name: 'Polymechaniker/in EFZ', field: 'Maschinen & Metall', educationType: 'EFZ',
        description: 'Fertige Präzisionsbauteile mit CNC-Maschinen.',
        riasecR: 0.95, riasecI: 0.6, riasecA: 0.2, riasecS: 0.2, riasecE: 0.2, riasecC: 0.5 },
      { name: 'Elektroinstallateur/in EFZ', field: 'Elektro & Energie', educationType: 'EFZ',
        description: 'Installiere und warte elektrische Anlagen in Gebäuden und Industrie.',
        riasecR: 0.9, riasecI: 0.5, riasecA: 0.1, riasecS: 0.3, riasecE: 0.2, riasecC: 0.6 },
      { name: 'Fachmann/Fachfrau Gesundheit EFZ', field: 'Gesundheit & Pflege', educationType: 'EFZ',
        description: 'Betreue und pflege Patientinnen und Patienten.',
        riasecR: 0.5, riasecI: 0.5, riasecA: 0.2, riasecS: 0.95, riasecE: 0.2, riasecC: 0.4 },
      { name: 'Koch/Köchin EFZ', field: 'Gastronomie', educationType: 'EFZ',
        description: 'Kreiere Gerichte und lerne alles über Lebensmittel und Küchentechnik.',
        riasecR: 0.6, riasecI: 0.3, riasecA: 0.7, riasecS: 0.5, riasecE: 0.3, riasecC: 0.4 },
      { name: 'Detailhandelsfachmann/-fachfrau EFZ', field: 'Detailhandel', educationType: 'EFZ',
        description: 'Berate Kunden und arbeite im Verkauf verschiedener Branchen.',
        riasecR: 0.3, riasecI: 0.2, riasecA: 0.2, riasecS: 0.8, riasecE: 0.7, riasecC: 0.5 },
      { name: 'Grafiker/in EFZ', field: 'Gestaltung & Kunst', educationType: 'EFZ',
        description: 'Gestalte visuelle Kommunikation für Print und Digital.',
        riasecR: 0.2, riasecI: 0.3, riasecA: 0.95, riasecS: 0.3, riasecE: 0.4, riasecC: 0.3 },
      { name: 'Logistiker/in EFZ', field: 'Logistik & Transport', educationType: 'EFZ',
        description: 'Koordiniere Warenflüsse und sorge für reibungslose Abläufe.',
        riasecR: 0.7, riasecI: 0.3, riasecA: 0.1, riasecS: 0.3, riasecE: 0.4, riasecC: 0.7 },
    ],
  });
  console.log('  ✅ 10 Berufe seeded');

  // ============================================
  // STUDENTS
  // ============================================

  type StudentSeed = {
    email: string;
    profile: any;
    desiredFields: string[];
    schools: any[];
    skills: string[];
    languages: any[];
    schnupperlehren: any[];
  };

  const studentSeeds: StudentSeed[] = [
    {
      email: 'lena.mueller@test.ch',
      profile: {
        firstName: 'Lena', lastName: 'Mueller', dateOfBirth: new Date('2010-03-15'),
        canton: 'ZH', city: 'Zürich',
        bio: 'Ich bin kreativ und liebe es, neue Dinge zu lernen. In meiner Freizeit programmiere ich kleine Spiele und baue Websites.',
        phone: '+41 79 123 45 67', nationality: 'Schweizerin',
        motivationLetter: 'Seit ich zwölf Jahre alt bin, fasziniert mich die Programmierung. Ich möchte in einem innovativen Unternehmen lernen, wie man professionelle Software entwickelt.',
        profileCompleteness: 85,
        oceanOpenness: 0.85, oceanConscientiousness: 0.7, oceanExtraversion: 0.6,
        oceanAgreeableness: 0.75, oceanNeuroticism: 0.3,
        riasecRealistic: 0.4, riasecInvestigative: 0.8, riasecArtistic: 0.7,
        riasecSocial: 0.5, riasecEnterprising: 0.3, riasecConventional: 0.2,
        quizCompletedAt: new Date(),
      },
      desiredFields: ['Informatik', 'Mediamatiker/in'],
      schools: [
        { name: 'Sekundarschule Zürich Fluntern', level: 'Sek A', startYear: 2021, endYear: 2024, isCurrent: false },
        { name: 'Kantonsschule Zürich', level: 'Gymnasium', startYear: 2024, isCurrent: true },
      ],
      skills: ['JavaScript', 'Python', 'HTML/CSS', 'Figma'],
      languages: [
        { language: 'Deutsch', proficiency: 'Muttersprache' },
        { language: 'Englisch', proficiency: 'C1' },
        { language: 'Französisch', proficiency: 'B1' },
      ],
      schnupperlehren: [
        { companyName: 'Zürcher Kantonalbank', beruf: 'Informatiker/in', canton: 'ZH',
          notes: 'Sehr interessant! Habe gelernt wie grosse IT-Systeme aufgebaut sind.' },
      ],
    },
    {
      email: 'marco.bianchi@test.ch',
      profile: {
        firstName: 'Marco', lastName: 'Bianchi', dateOfBirth: new Date('2010-07-22'),
        canton: 'ZH', city: 'Winterthur',
        bio: 'Sportlich und handwerklich begabt. Ich baue gerne Sachen und arbeite mit meinen Händen. Autos und Maschinen begeistern mich.',
        phone: '+41 76 234 56 78', nationality: 'Schweizer/Italiener',
        motivationLetter: 'Ich wollte schon immer mit Maschinen arbeiten. Als Kind habe ich alles auseinandergebaut und wieder zusammengesetzt.',
        profileCompleteness: 75,
        oceanOpenness: 0.5, oceanConscientiousness: 0.8, oceanExtraversion: 0.7,
        oceanAgreeableness: 0.6, oceanNeuroticism: 0.25,
        riasecRealistic: 0.9, riasecInvestigative: 0.4, riasecArtistic: 0.2,
        riasecSocial: 0.5, riasecEnterprising: 0.3, riasecConventional: 0.5,
        quizCompletedAt: new Date(),
      },
      desiredFields: ['Polymechaniker/in', 'Elektroinstallateur/in'],
      schools: [
        { name: 'Sekundarschule Winterthur Töss', level: 'Sek B', startYear: 2021, isCurrent: true },
      ],
      skills: ['CNC-Grundlagen', 'Schweissen (Kurs)', 'AutoCAD Grundkenntnisse'],
      languages: [
        { language: 'Deutsch', proficiency: 'Muttersprache' },
        { language: 'Italienisch', proficiency: 'B2' },
        { language: 'Englisch', proficiency: 'A2' },
      ],
      schnupperlehren: [
        { companyName: 'Sulzer AG', beruf: 'Polymechaniker/in', canton: 'ZH',
          notes: 'Eine Woche. Habe an echten Bauteilen gearbeitet. Sehr praktisch.' },
        { companyName: 'ABB Schweiz', beruf: 'Elektroinstallateur/in', canton: 'ZH',
          notes: 'Interessant aber viel Theorie am Anfang.' },
      ],
    },
    {
      email: 'sara.keller@test.ch',
      profile: {
        firstName: 'Sara', lastName: 'Keller', dateOfBirth: new Date('2011-01-10'),
        canton: 'BE', city: 'Bern',
        bio: 'Ich helfe gerne Menschen und interessiere mich für Medizin und Gesundheit. Ich bin geduldig und einfühlsam.',
        phone: '+41 78 345 67 89', nationality: 'Schweizerin',
        motivationLetter: 'Menschen in schwierigen Situationen zu helfen ist meine grösste Motivation. Im Gesundheitsbereich kann ich diese Leidenschaft mit einem sinnvollen Beruf verbinden.',
        profileCompleteness: 90,
        oceanOpenness: 0.6, oceanConscientiousness: 0.85, oceanExtraversion: 0.75,
        oceanAgreeableness: 0.9, oceanNeuroticism: 0.35,
        riasecRealistic: 0.5, riasecInvestigative: 0.6, riasecArtistic: 0.3,
        riasecSocial: 0.9, riasecEnterprising: 0.2, riasecConventional: 0.4,
        quizCompletedAt: new Date(),
      },
      desiredFields: ['Fachmann/Fachfrau Gesundheit', 'Medizinische/r Praxisassistent/in'],
      schools: [
        { name: 'Sekundarschule Bern Kirchenfeld', level: 'Sek A', startYear: 2021, endYear: 2024, isCurrent: false },
        { name: 'Berufsfachschule Bern', level: 'Berufsmittelschule', startYear: 2024, isCurrent: true },
      ],
      skills: ['Erste Hilfe SRC', 'MS Office', 'Blutentnahme (Schnupperlehre)'],
      languages: [
        { language: 'Deutsch', proficiency: 'Muttersprache' },
        { language: 'Französisch', proficiency: 'B2' },
        { language: 'Englisch', proficiency: 'B1' },
      ],
      schnupperlehren: [
        { companyName: 'Inselspital Bern', beruf: 'Fachmann/Fachfrau Gesundheit', canton: 'BE',
          notes: 'Sehr beeindruckend. Habe auf einer Abteilung mitgearbeitet.' },
        { companyName: 'Arztpraxis Dr. Müller', beruf: 'Medizinische/r Praxisassistent/in', canton: 'BE',
          notes: 'Familiäres Umfeld, viel gelernt über den Alltag einer Praxis.' },
      ],
    },
    {
      email: 'noah.schmid@test.ch',
      profile: {
        firstName: 'Noah', lastName: 'Schmid', dateOfBirth: new Date('2010-11-05'),
        canton: 'BS', city: 'Basel',
        bio: 'Zahlen und Organisation sind meine Stärke. Ich möchte in einem professionellen Unternehmen Kaufmann werden.',
        phone: '+41 79 456 78 90', nationality: 'Schweizer',
        motivationLetter: 'Ich bin sehr gut in Mathematik und Organisation. Eine kaufmännische Ausbildung ist der ideale Einstieg in die Geschäftswelt.',
        profileCompleteness: 70,
        oceanOpenness: 0.4, oceanConscientiousness: 0.9, oceanExtraversion: 0.45,
        oceanAgreeableness: 0.65, oceanNeuroticism: 0.2,
        riasecRealistic: 0.2, riasecInvestigative: 0.5, riasecArtistic: 0.1,
        riasecSocial: 0.4, riasecEnterprising: 0.6, riasecConventional: 0.9,
        quizCompletedAt: new Date(),
      },
      desiredFields: ['Kaufmann/Kauffrau (KV)', 'Informatik'],
      schools: [
        { name: 'Sekundarschule Basel Gundeldingen', level: 'Sek A', startYear: 2021, isCurrent: true },
      ],
      skills: ['Excel (fortgeschritten)', 'SAP Grundkurs', 'PowerPoint'],
      languages: [
        { language: 'Deutsch', proficiency: 'Muttersprache' },
        { language: 'Englisch', proficiency: 'B2' },
      ],
      schnupperlehren: [
        { companyName: 'UBS Basel', beruf: 'Kaufmann/Kauffrau', canton: 'BS',
          notes: 'Fünf Tage in der Kundenberatung. Sehr professionelles Umfeld.' },
      ],
    },
    {
      email: 'emma.weber@test.ch',
      profile: {
        firstName: 'Emma', lastName: 'Weber', dateOfBirth: new Date('2011-05-20'),
        canton: 'ZH', city: 'Zürich',
        bio: 'Kreativ und kommunikativ. Design und digitale Medien faszinieren mich. Ich fotografiere und mache Videos in meiner Freizeit.',
        phone: '+41 76 567 89 01', nationality: 'Schweizerin',
        motivationLetter: 'Kreativität und Technologie zusammenzubringen ist meine Leidenschaft. Als Mediamatikerin kann ich genau das tun.',
        profileCompleteness: 80,
        oceanOpenness: 0.9, oceanConscientiousness: 0.55, oceanExtraversion: 0.8,
        oceanAgreeableness: 0.7, oceanNeuroticism: 0.4,
        riasecRealistic: 0.3, riasecInvestigative: 0.4, riasecArtistic: 0.95,
        riasecSocial: 0.6, riasecEnterprising: 0.7, riasecConventional: 0.1,
        quizCompletedAt: new Date(),
      },
      desiredFields: ['Mediamatiker/in', 'Grafiker/in'],
      schools: [
        { name: 'Sekundarschule Zürich Enge', level: 'Sek A', startYear: 2021, isCurrent: true },
      ],
      skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Premiere Pro', 'Canva'],
      languages: [
        { language: 'Deutsch', proficiency: 'Muttersprache' },
        { language: 'Englisch', proficiency: 'C1' },
        { language: 'Spanisch', proficiency: 'A2' },
      ],
      schnupperlehren: [
        { companyName: 'Ringier AG', beruf: 'Mediamatiker/in', canton: 'ZH',
          notes: 'Einblick in die Medienbranche. War spannend, echte Artikel und Videos zu sehen.' },
        { companyName: 'Eclat Studio', beruf: 'Grafiker/in', canton: 'ZH',
          notes: 'Kleine Agentur, sehr persönlich. Habe an einem echten Kundenprojekt mitgearbeitet.' },
      ],
    },
    {
      email: 'jan.hofmann@test.ch',
      profile: {
        firstName: 'Jan', lastName: 'Hofmann', dateOfBirth: new Date('2010-09-12'),
        canton: 'ZH', city: 'Zürich',
        bio: 'Technikbegeistert und sehr neugierig. Ich interessiere mich für Elektronik und IoT. Zuhause baue ich eigene Arduino-Projekte.',
        phone: '+41 78 678 90 12', nationality: 'Deutscher',
        profileCompleteness: 55,
        oceanOpenness: 0.8, oceanConscientiousness: 0.75, oceanExtraversion: 0.5,
        oceanAgreeableness: 0.6, oceanNeuroticism: 0.3,
        riasecRealistic: 0.8, riasecInvestigative: 0.85, riasecArtistic: 0.3,
        riasecSocial: 0.3, riasecEnterprising: 0.4, riasecConventional: 0.4,
        quizCompletedAt: new Date(),
      },
      desiredFields: ['Informatik', 'Elektroinstallateur/in'],
      schools: [
        { name: 'Sekundarschule Zürich Leimbach', level: 'Sek B', startYear: 2021, isCurrent: true },
      ],
      skills: ['Arduino / Raspberry Pi', 'C++ Grundlagen', 'Löten'],
      languages: [
        { language: 'Deutsch', proficiency: 'Muttersprache' },
        { language: 'Englisch', proficiency: 'B1' },
      ],
      schnupperlehren: [],
    },
  ];

  // Create all students, store userId + studentProfileId + index
  const students: Array<{ userId: string; studentId: string }> = [];

  for (const s of studentSeeds) {
    const user = await prisma.user.create({
      data: {
        email: s.email, passwordHash: pw,
        role: UserRole.STUDENT, isVerified: true,
        studentProfile: { create: s.profile },
      },
      include: { studentProfile: true },
    });

    const studentId = user.studentProfile!.id;

    for (let i = 0; i < s.desiredFields.length; i++) {
      await prisma.studentDesiredField.create({ data: { studentId, field: s.desiredFields[i], priority: i } });
    }
    for (const name of s.skills) {
      await prisma.studentSkill.create({ data: { studentId, name } });
    }
    for (const lang of s.languages) {
      await prisma.studentLanguage.create({ data: { studentId, ...lang } });
    }
    for (const e of s.schnupperlehren) {
      await prisma.schnupperlehreEntry.create({ data: { studentId, ...e } });
    }
    for (const school of s.schools) {
      await prisma.studentSchool.create({ data: { studentId, ...school } });
    }

    students.push({ userId: user.id, studentId });
    console.log(`  ✅ Student: ${s.profile.firstName} ${s.profile.lastName}`);
  }

  const [lena, marco, sara, noah, emma, jan] = students;

  // ============================================
  // COMPANIES
  // ============================================

  type CompanySeed = {
    email: string;
    profile: any;
    links: any[];
    listings: any[];
  };

  const companySeeds: CompanySeed[] = [
    {
      email: 'hr@swisstech.ch',
      profile: {
        companyName: 'SwissTech Solutions AG',
        description: 'Wir sind ein innovatives IT-Unternehmen in Zürich, spezialisiert auf Cloud-Lösungen und Softwareentwicklung. Bei uns lernst du in einem modernen Umfeld mit agilen Teams, echten Projekten und flachen Hierarchien.',
        industry: 'Informatik & Technologie', companySize: '51-200',
        website: 'https://swisstech-solutions.ch',
        canton: 'ZH', city: 'Zürich', address: 'Technoparkstrasse 1, 8005 Zürich',
        contactPersonName: 'Anna Brunner', contactPersonRole: 'HR-Leiterin', isVerified: true,
      },
      links: [
        { label: 'Website', url: 'https://swisstech-solutions.ch', sortOrder: 0 },
        { label: 'LinkedIn', url: 'https://linkedin.com/company/swisstech', sortOrder: 1 },
      ],
      listings: [
        {
          title: 'Informatiker/in EFZ (Applikationsentwicklung)',
          description: 'Lerne bei uns die Welt der Softwareentwicklung kennen! Du arbeitest in agilen Teams, entwickelst Web- und Mobile-Applikationen und lernst moderne Technologien wie React, Node.js und Cloud-Services. Wir bieten echte Projekte, einen Laptop ab Tag 1 und ein junges Team.',
          field: 'Informatik', berufsfeld: '47613',
          durationYears: 4, startDate: new Date('2026-08-01'), spotsAvailable: 2,
          requiredSchoolLevel: 'Sek A', requiredLanguages: ['de', 'en'],
          canton: 'ZH', city: 'Zürich',
          idealOceanOpenness: 0.8, idealOceanConscientiousness: 0.7, idealOceanExtraversion: 0.5,
          idealOceanAgreeableness: 0.6, idealOceanNeuroticism: 0.3,
          idealRiasecRealistic: 0.5, idealRiasecInvestigative: 0.9, idealRiasecArtistic: 0.4,
          idealRiasecSocial: 0.4, idealRiasecEnterprising: 0.3, idealRiasecConventional: 0.3,
        },
        {
          title: 'Mediamatiker/in EFZ',
          description: 'Als Mediamatiker/in bei SwissTech verbindest du digitales Marketing, Content Creation und IT. Du erstellst Social-Media-Content, pflegst unsere Website und unterstützt das Design-Team.',
          field: 'Mediamatiker/in', berufsfeld: '47623',
          durationYears: 4, startDate: new Date('2026-08-01'), spotsAvailable: 1,
          canton: 'ZH', city: 'Zürich',
          idealOceanOpenness: 0.85, idealOceanConscientiousness: 0.6, idealOceanExtraversion: 0.75,
          idealOceanAgreeableness: 0.65, idealOceanNeuroticism: 0.35,
          idealRiasecArtistic: 0.8, idealRiasecEnterprising: 0.6, idealRiasecSocial: 0.5,
          idealRiasecInvestigative: 0.3, idealRiasecRealistic: 0.2, idealRiasecConventional: 0.2,
        },
      ],
    },
    {
      email: 'ausbildung@muellerag.ch',
      profile: {
        companyName: 'Müller Maschinenbau AG',
        description: 'Seit 1965 führend im Präzisionsmaschinenbau in der Region Winterthur. Als Familienunternehmen in dritter Generation bieten wir eine gründliche Ausbildung mit viel praktischer Erfahrung und modernsten CNC-Maschinen.',
        industry: 'Maschinen- & Metallbau', companySize: '11-50',
        canton: 'ZH', city: 'Winterthur', address: 'Industriestrasse 45, 8400 Winterthur',
        contactPersonName: 'Peter Müller', contactPersonRole: 'Lehrmeister & Geschäftsführer', isVerified: true,
      },
      links: [],
      listings: [
        {
          title: 'Polymechaniker/in EFZ',
          description: 'Arbeite mit modernsten CNC-Maschinen und lerne, wie Präzisionsbauteile für die Industrie und Medizintechnik hergestellt werden. Du wirst von erfahrenen Lehrmeistern begleitet und lernst CAD/CAM.',
          field: 'Polymechaniker/in', berufsfeld: '44726',
          durationYears: 4, startDate: new Date('2026-08-01'), spotsAvailable: 3,
          canton: 'ZH', city: 'Winterthur',
          idealOceanOpenness: 0.5, idealOceanConscientiousness: 0.85, idealOceanExtraversion: 0.4,
          idealOceanAgreeableness: 0.6, idealOceanNeuroticism: 0.25,
          idealRiasecRealistic: 0.95, idealRiasecInvestigative: 0.6, idealRiasecArtistic: 0.2,
          idealRiasecSocial: 0.3, idealRiasecEnterprising: 0.2, idealRiasecConventional: 0.5,
        },
        {
          title: 'Elektroinstallateur/in EFZ',
          description: 'Installiere Elektrosysteme in Wohngebäuden und Industrieanlagen. Du lernst alles über Strom, Schaltungen, Smart-Home und Photovoltaik.',
          field: 'Elektroinstallateur/in', berufsfeld: '47105',
          durationYears: 4, startDate: new Date('2026-08-01'), spotsAvailable: 1,
          canton: 'ZH', city: 'Winterthur',
          idealOceanOpenness: 0.55, idealOceanConscientiousness: 0.8, idealOceanExtraversion: 0.5,
          idealOceanAgreeableness: 0.55, idealOceanNeuroticism: 0.2,
          idealRiasecRealistic: 0.9, idealRiasecInvestigative: 0.5, idealRiasecArtistic: 0.1,
          idealRiasecSocial: 0.3, idealRiasecEnterprising: 0.2, idealRiasecConventional: 0.6,
        },
      ],
    },
    {
      email: 'jobs@gesundheitszentrum-bern.ch',
      profile: {
        companyName: 'Gesundheitszentrum Bern GmbH',
        description: 'Modernes Gesundheitszentrum in Bern mit erstklassiger Medizin und persönlicher Betreuung. Wir bilden jedes Jahr junge Menschen in Gesundheitsberufen aus und legen grossen Wert auf praxisnahe Ausbildung.',
        industry: 'Gesundheit & Soziales', companySize: '201-1000',
        canton: 'BE', city: 'Bern', address: 'Spitalstrasse 12, 3011 Bern',
        contactPersonName: 'Dr. Thomas Gerber', contactPersonRole: 'Ausbildungsverantwortlicher', isVerified: true,
      },
      links: [],
      listings: [
        {
          title: 'Fachmann/Fachfrau Gesundheit EFZ (FaGe)',
          description: 'Betreue und pflege Patientinnen und Patienten in unserem modernen Zentrum. Du lernst medizinische Grundlagen, Pflege und den einfühlsamen Umgang mit Menschen in verschiedenen Lebenssituationen.',
          field: 'Fachmann/Fachfrau Gesundheit', berufsfeld: '86911',
          durationYears: 3, startDate: new Date('2026-08-01'), spotsAvailable: 4,
          canton: 'BE', city: 'Bern',
          idealOceanOpenness: 0.6, idealOceanConscientiousness: 0.8, idealOceanExtraversion: 0.7,
          idealOceanAgreeableness: 0.9, idealOceanNeuroticism: 0.3,
          idealRiasecRealistic: 0.5, idealRiasecInvestigative: 0.5, idealRiasecArtistic: 0.2,
          idealRiasecSocial: 0.95, idealRiasecEnterprising: 0.2, idealRiasecConventional: 0.4,
        },
        {
          title: 'Medizinische/r Praxisassistent/in EFZ (MPA)',
          description: 'Unterstütze Ärztinnen bei Untersuchungen, führe Laborarbeiten durch und betreue Patienten am Empfang. Ein vielseitiger Beruf an der Schnittstelle von Medizin und Administration.',
          field: 'Medizinische/r Praxisassistent/in', berufsfeld: '86621',
          durationYears: 3, startDate: new Date('2026-08-01'), spotsAvailable: 2,
          canton: 'BE', city: 'Bern',
          idealOceanOpenness: 0.55, idealOceanConscientiousness: 0.85, idealOceanExtraversion: 0.6,
          idealOceanAgreeableness: 0.85, idealOceanNeuroticism: 0.25,
          idealRiasecRealistic: 0.4, idealRiasecInvestigative: 0.6, idealRiasecArtistic: 0.1,
          idealRiasecSocial: 0.85, idealRiasecEnterprising: 0.2, idealRiasecConventional: 0.5,
        },
      ],
    },
    {
      email: 'lernende@migros-zh.ch',
      profile: {
        companyName: 'Migros Zürich',
        description: 'Die Migros ist das grösste Detailhandelsunternehmen der Schweiz. Über 1000 Lernende schweizweit. Wir bieten eine abwechslungsreiche Ausbildung im Kundenkontakt, in der Warenbewirtschaftung und Teamarbeit.',
        industry: 'Detailhandel', companySize: '1000+',
        website: 'https://karriere.migros.ch',
        canton: 'ZH', city: 'Zürich', address: 'Limmatstrasse 152, 8031 Zürich',
        contactPersonName: 'Sandra Zimmermann', contactPersonRole: 'Berufsbildnerin', isVerified: true,
      },
      links: [
        { label: 'Karriere', url: 'https://karriere.migros.ch', sortOrder: 0 },
      ],
      listings: [
        {
          title: 'Detailhandelsfachmann/-fachfrau EFZ',
          description: 'Lerne bei der Migros alles über den Detailhandel. Berate Kundinnen und Kunden, bewirtschafte Waren und lerne Kassen- und Verkaufstechniken. 100+ Filialen in der Region.',
          field: 'Detailhandel', berufsfeld: '82103',
          durationYears: 3, startDate: new Date('2026-08-01'), spotsAvailable: 8,
          canton: 'ZH', city: 'Zürich',
          idealOceanOpenness: 0.5, idealOceanConscientiousness: 0.75, idealOceanExtraversion: 0.8,
          idealOceanAgreeableness: 0.85, idealOceanNeuroticism: 0.3,
          idealRiasecRealistic: 0.3, idealRiasecInvestigative: 0.2, idealRiasecArtistic: 0.2,
          idealRiasecSocial: 0.85, idealRiasecEnterprising: 0.7, idealRiasecConventional: 0.5,
        },
        {
          title: 'Kaufmann/Kauffrau EFZ (M-Profil)',
          description: 'Kaufmännische Ausbildung beim grössten Detailhändler der Schweiz. Du lernst Buchhaltung, Korrespondenz, Einkauf und Logistik. Das M-Profil ermöglicht nach der Lehre den direkten Einstieg in die Berufsmaturität.',
          field: 'Kaufmann/Kauffrau (KV)', berufsfeld: '68103',
          durationYears: 3, startDate: new Date('2026-08-01'), spotsAvailable: 3,
          requiredSchoolLevel: 'Sek A',
          canton: 'ZH', city: 'Zürich',
          idealOceanOpenness: 0.5, idealOceanConscientiousness: 0.85, idealOceanExtraversion: 0.55,
          idealOceanAgreeableness: 0.7, idealOceanNeuroticism: 0.2,
          idealRiasecRealistic: 0.2, idealRiasecInvestigative: 0.4, idealRiasecArtistic: 0.1,
          idealRiasecSocial: 0.5, idealRiasecEnterprising: 0.6, idealRiasecConventional: 0.9,
        },
      ],
    },
    {
      email: 'hr@creativeagency.ch',
      profile: {
        companyName: 'Creative Agency Zürich GmbH',
        description: 'Zürcher Kreativagentur mit Fokus auf Branding, Digital Design und Videoproduktion. 15 kreative Köpfe, grosse Kundennamen, flache Hierarchien. Ideal für alle, die wirklich kreativ arbeiten wollen.',
        industry: 'Medien & Werbung', companySize: '11-50',
        website: 'https://creative-agency-zh.ch',
        canton: 'ZH', city: 'Zürich', address: 'Langstrasse 89, 8004 Zürich',
        contactPersonName: 'Nina Hofer', contactPersonRole: 'Creative Director & Ausbildnerin', isVerified: true,
      },
      links: [
        { label: 'Portfolio', url: 'https://creative-agency-zh.ch', sortOrder: 0 },
        { label: 'Instagram', url: 'https://instagram.com/creativeagency_zh', sortOrder: 1 },
      ],
      listings: [
        {
          title: 'Grafiker/in EFZ',
          description: 'Gestalte visuelle Kommunikation für echte Kunden. Von Tag 1 arbeitest du an echten Projekten: Logos, Broschüren, Websites, Social-Media-Visuals. Software: Adobe Creative Suite, Figma.',
          field: 'Grafiker/in', berufsfeld: '90202',
          durationYears: 4, startDate: new Date('2026-08-01'), spotsAvailable: 1,
          requiredSchoolLevel: 'Sek A',
          canton: 'ZH', city: 'Zürich',
          idealOceanOpenness: 0.95, idealOceanConscientiousness: 0.6, idealOceanExtraversion: 0.65,
          idealOceanAgreeableness: 0.7, idealOceanNeuroticism: 0.4,
          idealRiasecRealistic: 0.2, idealRiasecInvestigative: 0.3, idealRiasecArtistic: 0.98,
          idealRiasecSocial: 0.4, idealRiasecEnterprising: 0.5, idealRiasecConventional: 0.2,
        },
        {
          title: 'Mediamatiker/in EFZ (Schwerpunkt Video)',
          description: 'Spezialisiere dich auf Videoproduktion. Du lernst Drehen, Schneiden und Color Grading mit Premiere Pro und DaVinci Resolve für KMUs, NGOs und Stadtmarketing.',
          field: 'Mediamatiker/in', berufsfeld: '47623',
          durationYears: 4, startDate: new Date('2026-08-01'), spotsAvailable: 1,
          canton: 'ZH', city: 'Zürich',
          idealOceanOpenness: 0.9, idealOceanConscientiousness: 0.6, idealOceanExtraversion: 0.7,
          idealOceanAgreeableness: 0.65, idealOceanNeuroticism: 0.35,
          idealRiasecRealistic: 0.3, idealRiasecInvestigative: 0.3, idealRiasecArtistic: 0.95,
          idealRiasecSocial: 0.5, idealRiasecEnterprising: 0.6, idealRiasecConventional: 0.2,
        },
      ],
    },
  ];

  const companies: Array<{ userId: string; companyId: string; listings: any[] }> = [];

  for (const c of companySeeds) {
    const user = await prisma.user.create({
      data: {
        email: c.email, passwordHash: pw,
        role: UserRole.COMPANY, isVerified: true,
        companyProfile: { create: c.profile },
      },
      include: { companyProfile: true },
    });

    const companyId = user.companyProfile!.id;
    for (const link of c.links) {
      await prisma.companyLink.create({ data: { companyId, ...link } });
    }

    const listings: any[] = [];
    for (const listing of c.listings) {
      const l = await prisma.listing.create({ data: { companyId, ...listing } });
      listings.push(l);
    }

    companies.push({ userId: user.id, companyId, listings });
    console.log(`  ✅ Company: ${c.profile.companyName}`);
  }

  const [swisstech, mueller, gesundheit, migros, creative] = companies;

  // ============================================
  // HELPER: create match + optional app + messages
  // ============================================
  async function createMatch(
    student: { userId: string; studentId: string },
    company: { userId: string; companyId: string; listings: any[] },
    listingIndex: number,
    score: number,
    appStatus: string | null,
    msgs: Array<{ fromStudent: boolean; content: string; minsAgo: number }> = []
  ) {
    const listing = company.listings[listingIndex];
    await prisma.swipe.create({
      data: { studentId: student.studentId, listingId: listing.id, direction: 'RIGHT' },
    });

    const match = await prisma.match.create({
      data: { studentId: student.studentId, listingId: listing.id, compatibilityScore: score },
    });

    if (appStatus) {
      const timeline: any[] = [
        { status: 'PENDING', timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), note: 'Bewerbung eingereicht' },
      ];
      if (appStatus !== 'PENDING') {
        timeline.push({ status: appStatus, timestamp: new Date(Date.now() - 2 * 86400000).toISOString() });
      }
      await prisma.application.create({
        data: {
          studentId: student.studentId, listingId: listing.id, matchId: match.id,
          status: appStatus as any, timeline: JSON.stringify(timeline),
        },
      });
    }

    for (const msg of msgs) {
      await prisma.message.create({
        data: {
          matchId: match.id,
          senderId: msg.fromStudent ? student.userId : company.userId,
          content: msg.content, type: 'TEXT', isRead: true,
          createdAt: new Date(Date.now() - msg.minsAgo * 60000),
        },
      });
    }

    return match;
  }

  // ============================================
  // MATCHES & CONVERSATIONS
  // ============================================

  // Lena → SwissTech Informatiker (92% match, VIEWED, active conversation)
  await createMatch(lena, swisstech, 0, 92, 'VIEWED', [
    { fromStudent: false, content: 'Hallo Lena! Wir haben dein Profil gesehen und sind sehr beeindruckt. Hast du Interesse an einem Vorstellungsgespräch?', minsAgo: 2880 },
    { fromStudent: true, content: 'Hallo! Ja, sehr gerne! Ich freue mich über diese Möglichkeit.', minsAgo: 2760 },
    { fromStudent: false, content: 'Super! Wäre nächste Woche Mittwoch um 14:00 Uhr möglich?', minsAgo: 2700 },
    { fromStudent: true, content: 'Perfekt, das passt mir sehr gut. Muss ich etwas mitbringen?', minsAgo: 1440 },
    { fromStudent: false, content: 'Bitte bring deinen aktuellen Schulzeugnis und das ausgefüllte Formular mit. Link folgt per E-Mail!', minsAgo: 480 },
  ]);

  // Lena → SwissTech Mediamatiker (78%, PENDING)
  await createMatch(lena, swisstech, 1, 78, 'PENDING', [
    { fromStudent: false, content: 'Hallo Lena! Dein Profil passt auch gut zu unserer Mediamatiker-Stelle. Wir melden uns in Kürze.', minsAgo: 5760 },
  ]);

  // Lena → Creative Agency Grafiker (71%, SHORTLISTED)
  await createMatch(lena, creative, 0, 71, 'SHORTLISTED', [
    { fromStudent: false, content: 'Hi Lena! Wir haben dich auf unsere Shortlist gesetzt. Kannst du uns dein Portfolio schicken?', minsAgo: 1440 },
    { fromStudent: true, content: 'Klar! Hier ist mein Behance-Profil: behance.net/lenamueller – ich freue mich, von euch zu hören!', minsAgo: 720 },
    { fromStudent: false, content: 'Wunderbar, schauen wir uns das an und melden uns bis Ende Woche!', minsAgo: 360 },
  ]);

  // Marco → Müller Polymechaniker (95%, INTERVIEW_SCHEDULED)
  await createMatch(marco, mueller, 0, 95, 'INTERVIEW_SCHEDULED', [
    { fromStudent: false, content: 'Hallo Marco! Wir laden dich herzlich zu einem Schnuppertag ein. Bist du nächsten Freitag verfügbar?', minsAgo: 4320 },
    { fromStudent: true, content: 'Ja, perfekt! Ich freue mich riesig darauf!', minsAgo: 4200 },
    { fromStudent: false, content: 'Super! Bitte bringe deinen Lehrvertragsentwurf und einen gültigen Ausweis mit. Start um 07:30 Uhr.', minsAgo: 3600 },
    { fromStudent: true, content: 'Verstanden! Bis Freitag 💪', minsAgo: 2880 },
    { fromStudent: false, content: 'Sehr gut. Wir freuen uns auf dich! Parkplätze gibt es auf der Rückseite des Gebäudes.', minsAgo: 1440 },
  ]);

  // Marco → Müller Elektro (82%, PENDING)
  await createMatch(marco, mueller, 1, 82, 'PENDING', [
    { fromStudent: true, content: 'Guten Tag! Ich bewerbe mich auch für die Elektroinstallateur-Stelle.', minsAgo: 720 },
    { fromStudent: false, content: 'Hallo Marco! Danke für deine Bewerbung. Wir schauen uns dein Profil an.', minsAgo: 360 },
  ]);

  // Sara → Gesundheitszentrum FaGe (97%, ACCEPTED, offer received!)
  await createMatch(sara, gesundheit, 0, 97, 'ACCEPTED', [
    { fromStudent: false, content: 'Liebe Sara! Es freut uns sehr, dir mitteilen zu können, dass wir dir einen Ausbildungsplatz als FaGe anbieten möchten!', minsAgo: 10080 },
    { fromStudent: true, content: 'Oh wow, das ist fantastisch!! Ich nehme das Angebot sehr gerne an! Vielen herzlichen Dank!', minsAgo: 9000 },
    { fromStudent: false, content: 'Herzlich willkommen im Team! Die Lehrvertragsunterlagen senden wir dir per Post zu.', minsAgo: 8640 },
    { fromStudent: true, content: 'Ich freue mich so sehr! Wann genau beginnt die Ausbildung?', minsAgo: 7200 },
    { fromStudent: false, content: 'Start ist der 4. August 2026. Du erhältst demnächst alle Infos per Post.', minsAgo: 6480 },
    { fromStudent: true, content: 'Super, ich warte gespannt auf die Unterlagen! 😊', minsAgo: 5760 },
  ]);

  // Sara → Gesundheitszentrum MPA (88%, REJECTED)
  await createMatch(sara, gesundheit, 1, 88, 'REJECTED', [
    { fromStudent: false, content: 'Liebe Sara, leider müssen wir Ihnen mitteilen, dass wir uns für eine andere Kandidatin entschieden haben. Wir wünschen Ihnen alles Gute.', minsAgo: 2880 },
    { fromStudent: true, content: 'Schade, aber danke für die Rückmeldung. Ich habe ja zum Glück schon das FaGe-Angebot!', minsAgo: 1440 },
  ]);

  // Noah → Migros KV (88%, VIEWED)
  await createMatch(noah, migros, 1, 88, 'VIEWED', [
    { fromStudent: false, content: 'Guten Tag Noah! Ihr Profil hat uns überzeugt. Wir möchten Sie zu einem Bewerbungsgespräch einladen.', minsAgo: 2160 },
    { fromStudent: true, content: 'Guten Tag! Sehr gerne! Ich bin flexibel was den Termin betrifft.', minsAgo: 2040 },
    { fromStudent: false, content: 'Wie wäre der 3. März um 10:00 Uhr in unserer Filiale am Hauptbahnhof?', minsAgo: 1440 },
    { fromStudent: true, content: 'Das passt perfekt. Ich bin dabei!', minsAgo: 720 },
  ]);

  // Noah → Migros Detailhandel (58%, PENDING)
  await createMatch(noah, migros, 0, 58, 'PENDING');

  // Emma → Creative Agency Mediamatiker Video (96%, SHORTLISTED)
  await createMatch(emma, creative, 1, 96, 'SHORTLISTED', [
    { fromStudent: false, content: 'Hey Emma! Dein Instagram-Portfolio ist der Hammer 😍 Wir würden dich gerne kennenlernen!', minsAgo: 2880 },
    { fromStudent: true, content: 'Oh wow, das freut mich so sehr! Wann könnte ich vorbeikommen?', minsAgo: 2760 },
    { fromStudent: false, content: 'Wie wäre Donnerstag um 16 Uhr? Bring gerne eigene Videoprojekte mit.', minsAgo: 1440 },
    { fromStudent: true, content: 'Perfekt! Ich freue mich riesig darauf 🎬', minsAgo: 720 },
    { fromStudent: false, content: 'Wir auch! Adresse: Langstrasse 89, 4. Stock. Klingel bei "Creative Agency".', minsAgo: 60 },
  ]);

  // Emma → Creative Agency Grafiker (91%, VIEWED)
  await createMatch(emma, creative, 0, 91, 'VIEWED', [
    { fromStudent: false, content: 'Hallo Emma! Tolles Profil – wir haben dich auch für die Grafiker-Stelle vorgemerkt.', minsAgo: 1440 },
    { fromStudent: true, content: 'Danke! Ich wäre auch sehr interessiert an Grafik 😊', minsAgo: 720 },
  ]);

  // Emma → SwissTech Mediamatiker (74%, PENDING)
  await createMatch(emma, swisstech, 1, 74, 'PENDING', [
    { fromStudent: true, content: 'Hallo! Ich bewerbe mich für die Mediamatiker-Stelle. Kreative Arbeit in einem IT-Umfeld klingt super spannend!', minsAgo: 360 },
  ]);

  // Jan → SwissTech Informatiker (79%, PENDING, conversation started)
  await createMatch(jan, swisstech, 0, 79, 'PENDING', [
    { fromStudent: true, content: 'Hallo! Ich interessiere mich für die Informatiker-Stelle. Ich habe viel Erfahrung mit Arduino und C++.', minsAgo: 4320 },
    { fromStudent: false, content: 'Hallo Jan! Danke für deine Nachricht. Wir schauen uns dein Profil genau an und melden uns.', minsAgo: 3600 },
    { fromStudent: true, content: 'Super, ich freue mich auf eine Rückmeldung!', minsAgo: 3000 },
  ]);

  console.log('\n✅ All matches and conversations created');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 Login credentials — password for ALL: Test1234!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n  STUDENTS:');
  console.log('  lena.mueller@test.ch      → 3 Bewerbungen (Informatik/Mediamatik)');
  console.log('  marco.bianchi@test.ch     → 2 Bewerbungen (Polymechaniker) — Schnuppertag bestätigt!');
  console.log('  sara.keller@test.ch       → 2 Bewerbungen — Lehrvertrag FaGe erhalten! 🎉');
  console.log('  noah.schmid@test.ch       → 2 Bewerbungen (KV) — Gespräch vereinbart');
  console.log('  emma.weber@test.ch        → 3 Bewerbungen (Grafik/Mediamatik)');
  console.log('  jan.hofmann@test.ch       → 1 Bewerbung (Informatik)');
  console.log('\n  COMPANIES:');
  console.log('  hr@swisstech.ch           → SwissTech Solutions AG (Zürich)');
  console.log('  ausbildung@muellerag.ch   → Müller Maschinenbau AG (Winterthur)');
  console.log('  jobs@gesundheitszentrum-bern.ch → Gesundheitszentrum Bern');
  console.log('  lernende@migros-zh.ch     → Migros Zürich');
  console.log('  hr@creativeagency.ch      → Creative Agency Zürich GmbH');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
