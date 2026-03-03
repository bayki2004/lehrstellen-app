import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type {
  ApplicationDossierDTO,
  StudentGradeDTO,
  ZeugnisGrades,
  MulticheckGrades,
} from '@lehrstellen/shared';
import {
  getZeugnisSubjects,
  MULTICHECK_SCHULISCHES_WISSEN,
  MULTICHECK_POTENZIAL,
} from '@lehrstellen/shared';
import PdfRadarChart from './PdfRadarChart';

const C = {
  primary: '#00C2FF',
  primaryLight: '#E6F9FF',
  accent: '#B026FF',
  text: '#1C1C1E',
  textSecondary: '#636366',
  success: '#34C759',
  border: '#E5E5EA',
  surface: '#F2F2F7',
  company: '#AEAEB2',
  white: '#FFFFFF',
};

const s = StyleSheet.create({
  page: {
    padding: 32,
    paddingBottom: 36,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: C.text,
  },
  // Header
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
  },
  headerLeft: { flex: 1 },
  studentName: {
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
    marginBottom: 3,
  },
  headerDetail: {
    fontSize: 8,
    color: C.textSecondary,
    marginBottom: 1,
  },
  photo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    objectFit: 'cover',
  },
  photoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitial: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.primary,
  },
  // Lehrstelle info
  lehrstelleBox: {
    backgroundColor: C.primaryLight,
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  lehrstelleTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.primary,
    marginBottom: 1,
  },
  lehrstelleSub: {
    fontSize: 7,
    color: C.textSecondary,
  },
  // Section
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.primary,
    marginBottom: 5,
    marginTop: 10,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  sectionHeaderFirst: {
    marginTop: 0,
  },
  // Match block
  matchRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  matchScoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchScoreText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.primary,
  },
  matchScoreLabel: {
    fontSize: 6,
    color: C.textSecondary,
    marginTop: 2,
  },
  breakdownCol: { flex: 1 },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  breakdownLabel: {
    width: 80,
    fontSize: 7,
    color: C.textSecondary,
  },
  breakdownBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: C.surface,
    borderRadius: 3,
  },
  breakdownBarFill: {
    height: 6,
    backgroundColor: C.primary,
    borderRadius: 3,
  },
  breakdownScore: {
    width: 26,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    color: C.text,
  },
  // Culture chart area
  cultureArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 6,
    color: C.textSecondary,
  },
  // Text blocks
  bodyText: {
    fontSize: 8,
    color: C.text,
    lineHeight: 1.4,
  },
  questionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
    marginBottom: 1,
    marginTop: 5,
  },
  // Tags
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 3,
  },
  tag: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 7,
    color: C.primary,
    fontFamily: 'Helvetica-Bold',
  },
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E8FAF0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 7,
    color: C.success,
    fontFamily: 'Helvetica-Bold',
  },
  // Grade tables
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.primary,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  tableRowAlt: {
    backgroundColor: C.surface,
  },
  tableCell: {
    fontSize: 7,
    color: C.text,
  },
  gradeValue: {
    fontFamily: 'Helvetica-Bold',
  },
  gradeGood: { color: C.success },
  gradeOk: { color: '#FF9500' },
  gradeBad: { color: '#FF3B30' },
  // Grade meta
  gradeMeta: {
    fontSize: 7,
    color: C.textSecondary,
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 6,
    color: C.success,
  },
  // Two-column layout
  twoCol: {
    flexDirection: 'row',
    gap: 16,
  },
  colHalf: {
    flex: 1,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 4,
  },
  footerText: {
    fontSize: 6,
    color: C.textSecondary,
  },
});

// ---- Helpers ----

const BREAKDOWN_LABELS: Record<string, string> = {
  Persoenlichkeit: 'Persönlichkeit',
  Interessen: 'Interessen',
  Unternehmenskultur: 'Kultur',
  Berufsfeld: 'Berufsfeld',
  Region: 'Region',
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function gradeColor(value: number, maxIs6: boolean) {
  if (maxIs6) {
    if (value >= 5) return s.gradeGood;
    if (value >= 4) return s.gradeOk;
    return s.gradeBad;
  }
  if (value >= 70) return s.gradeGood;
  if (value >= 40) return s.gradeOk;
  return s.gradeBad;
}

// ---- Sub-components ----

function PageFooter({ generatedAt }: { generatedAt: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Erstellt via LehrMatch</Text>
      <Text style={s.footerText}>{generatedAt}</Text>
    </View>
  );
}

function MatchBlock({ data }: { data: ApplicationDossierDTO }) {
  const { compatibility, student, companyCulture } = data;

  return (
    <View>
      <Text style={[s.sectionHeader, s.sectionHeaderFirst]}>Kompatibilität</Text>
      <View style={s.matchRow}>
        <View style={{ alignItems: 'center' }}>
          <View style={s.matchScoreCircle}>
            <Text style={s.matchScoreText}>{compatibility.totalScore}%</Text>
          </View>
          <Text style={[s.matchScoreLabel, { marginTop: 3 }]}>Gesamtscore</Text>
        </View>
        <View style={s.breakdownCol}>
          {compatibility.breakdown.map((dim) => (
            <View key={dim.label} style={s.breakdownRow}>
              <Text style={s.breakdownLabel}>
                {BREAKDOWN_LABELS[dim.label] ?? dim.label}
              </Text>
              <View style={s.breakdownBarBg}>
                <View
                  style={[
                    s.breakdownBarFill,
                    { width: `${Math.min(dim.score, 100)}%` },
                  ]}
                />
              </View>
              <Text style={s.breakdownScore}>{dim.score}%</Text>
            </View>
          ))}
        </View>
      </View>

      {student.cultureScores && companyCulture && (
        <View>
          <View style={s.cultureArea}>
            <PdfRadarChart
              studentScores={student.cultureScores}
              companyScores={companyCulture}
              size={160}
            />
          </View>
          <View style={s.legendRow}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#00C2FF' }]} />
              <Text style={s.legendText}>Kandidat/in</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: C.company }]} />
              <Text style={s.legendText}>Unternehmen</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function ProofOfWork({ data }: { data: ApplicationDossierDTO }) {
  const { application, student } = data;
  const app = application;

  return (
    <View>
      {student.motivationLetter && (
        <View>
          <Text style={s.sectionHeader}>Motivationsschreiben</Text>
          <Text style={s.bodyText}>{student.motivationLetter}</Text>
        </View>
      )}

      {app.motivationAnswers && app.motivationAnswers.length > 0 && (
        <View>
          <Text style={s.sectionHeader}>Motivationsfragen</Text>
          {app.motivationAnswers.map((qa, idx) => (
            <View key={idx}>
              <Text style={s.questionLabel}>{qa.question}</Text>
              <Text style={s.bodyText}>{qa.answer}</Text>
            </View>
          ))}
        </View>
      )}

      {app.verfuegbarkeit && (
        <View>
          <Text style={s.sectionHeader}>Verfügbarkeit</Text>
          <Text style={s.bodyText}>{app.verfuegbarkeit}</Text>
        </View>
      )}

      {app.relevanteErfahrungen && app.relevanteErfahrungen.length > 0 && (
        <View>
          <Text style={s.sectionHeader}>Relevante Erfahrungen</Text>
          <View style={s.tagRow}>
            {app.relevanteErfahrungen.map((exp, i) => (
              <View key={i} style={s.tag}>
                <Text style={s.tagText}>{exp}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {app.fragenAnBetrieb && (
        <View>
          <Text style={s.sectionHeader}>Fragen an den Betrieb</Text>
          <Text style={s.bodyText}>{app.fragenAnBetrieb}</Text>
        </View>
      )}

      {app.schnupperlehreWunsch && (
        <View style={{ marginTop: 6 }}>
          <View style={s.badge}>
            <Text style={s.badgeText}>Wünscht Schnupperlehre</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function ZeugnisTable({ grade }: { grade: StudentGradeDTO }) {
  const grades = grade.grades as ZeugnisGrades;
  const subjects = getZeugnisSubjects(grade.canton ?? 'DEFAULT');

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={s.gradeMeta}>
        Zeugnis — {grade.niveau ?? '—'} | {grade.canton ?? '—'} | {grade.schoolYear ?? '—'}{' '}
        Sem. {grade.semester ?? '—'}
      </Text>
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderCell, { flex: 3 }]}>Fach</Text>
        <Text style={[s.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Note</Text>
      </View>
      {subjects.map((sub, idx) => {
        const value = grades[sub.key];
        return (
          <View
            key={sub.key}
            style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
          >
            <Text style={[s.tableCell, { flex: 3 }]}>{sub.label}</Text>
            <Text
              style={[
                s.tableCell,
                s.gradeValue,
                { flex: 1, textAlign: 'right' },
                value != null ? gradeColor(value, true) : {},
              ]}
            >
              {value != null ? value.toFixed(1) : '—'}
            </Text>
          </View>
        );
      })}
      {grade.isVerified && (
        <View style={s.verifiedBadge}>
          <Text style={s.verifiedText}>
            Bestätigt am {formatDate(grade.verifiedAt)}
          </Text>
        </View>
      )}
    </View>
  );
}

function MulticheckTable({ grade }: { grade: StudentGradeDTO }) {
  const grades = grade.grades as MulticheckGrades;

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={s.gradeMeta}>
        {grade.testVariant ?? 'Multicheck'} — {formatDate(grade.testDate)}
      </Text>

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderCell, { flex: 3 }]}>Schulisches Wissen</Text>
        <Text style={[s.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>%</Text>
      </View>
      {MULTICHECK_SCHULISCHES_WISSEN.map((sub, idx) => {
        const value = grades.schulisches_wissen?.[sub.key as keyof typeof grades.schulisches_wissen];
        return (
          <View
            key={sub.key}
            style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
          >
            <Text style={[s.tableCell, { flex: 3 }]}>{sub.label}</Text>
            <Text
              style={[
                s.tableCell,
                s.gradeValue,
                { flex: 1, textAlign: 'right' },
                value != null ? gradeColor(value, false) : {},
              ]}
            >
              {value != null ? `${value}%` : '—'}
            </Text>
          </View>
        );
      })}

      <View style={[s.tableHeader, { marginTop: 6 }]}>
        <Text style={[s.tableHeaderCell, { flex: 3 }]}>Potenzial</Text>
        <Text style={[s.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>%</Text>
      </View>
      {MULTICHECK_POTENZIAL.map((sub, idx) => {
        const value = grades.potenzial?.[sub.key as keyof typeof grades.potenzial];
        return (
          <View
            key={sub.key}
            style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
          >
            <Text style={[s.tableCell, { flex: 3 }]}>{sub.label}</Text>
            <Text
              style={[
                s.tableCell,
                s.gradeValue,
                { flex: 1, textAlign: 'right' },
                value != null ? gradeColor(value, false) : {},
              ]}
            >
              {value != null ? `${value}%` : '—'}
            </Text>
          </View>
        );
      })}

      {grade.isVerified && (
        <View style={s.verifiedBadge}>
          <Text style={s.verifiedText}>
            Bestätigt am {formatDate(grade.verifiedAt)}
          </Text>
        </View>
      )}
    </View>
  );
}

function GradesSection({ grades }: { grades: StudentGradeDTO[] }) {
  if (grades.length === 0) return null;

  const zeugnisse = grades.filter((g) => g.documentType === 'zeugnis');
  const multichecks = grades.filter(
    (g) => g.documentType === 'multicheck' || g.documentType === 'basic_check',
  );

  return (
    <View>
      <Text style={s.sectionHeader}>Schulische Leistungen</Text>
      {zeugnisse.map((g) => (
        <ZeugnisTable key={g.id} grade={g} />
      ))}
      {multichecks.map((g) => (
        <MulticheckTable key={g.id} grade={g} />
      ))}
    </View>
  );
}

// ---- Main Document ----

interface DossierDocumentProps {
  data: ApplicationDossierDTO;
}

export default function DossierDocument({ data }: DossierDocumentProps) {
  const { application, student } = data;
  const generatedAt = new Date().toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Document>
      {/* Page 1: Header + Lehrstelle + Proof of Work */}
      <Page size="A4" style={s.page}>
        <View style={s.headerBar}>
          <View style={s.headerLeft}>
            <Text style={s.studentName}>
              {student.firstName} {student.lastName}
            </Text>
            <Text style={s.headerDetail}>
              {student.canton}, {student.city}
            </Text>
            {student.dateOfBirth && (
              <Text style={s.headerDetail}>
                Geb.: {formatDate(student.dateOfBirth)}
              </Text>
            )}
            {student.desiredFields.length > 0 && (
              <Text style={s.headerDetail}>
                Wunschberufe: {student.desiredFields.join(', ')}
              </Text>
            )}
          </View>
          {student.profilePhoto ? (
            <Image src={student.profilePhoto} style={s.photo} />
          ) : (
            <View style={s.photoPlaceholder}>
              <Text style={s.photoInitial}>
                {student.firstName[0]}
              </Text>
            </View>
          )}
        </View>

        <View style={s.lehrstelleBox}>
          <Text style={s.lehrstelleTitle}>{application.listing.title}</Text>
          <Text style={s.lehrstelleSub}>
            {application.listing.companyName} — {application.listing.field} — {application.listing.canton}, {application.listing.city}
          </Text>
        </View>

        <ProofOfWork data={data} />
        <PageFooter generatedAt={generatedAt} />
      </Page>

      {/* Page 2: Compatibility + Culture + Grades */}
      <Page size="A4" style={s.page}>
        <MatchBlock data={data} />
        {data.grades.length > 0 && <GradesSection grades={data.grades} />}
        <PageFooter generatedAt={generatedAt} />
      </Page>
    </Document>
  );
}
