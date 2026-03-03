import type {
  ApplicationDossierDTO,
  StudentGradeDTO,
  ZeugnisGrades,
  MulticheckGrades,
  CultureScores,
} from '@lehrstellen/shared';
import {
  getZeugnisSubjects,
  MULTICHECK_SCHULISCHES_WISSEN,
  MULTICHECK_POTENZIAL,
  CULTURE_DIMENSIONS,
} from '@lehrstellen/shared';

// Colors matching DossierDocument.tsx
const C = {
  primary: '#00C2FF',
  primaryLight: '#E6F9FF',
  text: '#1C1C1E',
  textSecondary: '#636366',
  success: '#34C759',
  border: '#E5E5EA',
  surface: '#F2F2F7',
  company: '#AEAEB2',
  white: '#FFFFFF',
};

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

function gradeColorHex(value: number, maxIs6: boolean): string {
  if (maxIs6) {
    if (value >= 5) return C.success;
    if (value >= 4) return '#FF9500';
    return '#FF3B30';
  }
  if (value >= 70) return C.success;
  if (value >= 40) return '#FF9500';
  return '#FF3B30';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- Radar chart as inline SVG ----

const NUM_AXES = CULTURE_DIMENSIONS.length;

function angleFor(index: number) {
  return ((2 * Math.PI) / NUM_AXES) * index - Math.PI / 2;
}

function pointAt(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function scoreToFraction(score: number | null | undefined): number {
  return (score ?? 50) / 100;
}

function buildPolygonPoints(cx: number, cy: number, radius: number, scores: Partial<CultureScores>) {
  return CULTURE_DIMENSIONS.map((dim, i) => {
    const val = scoreToFraction(scores[dim.key as keyof CultureScores]);
    const p = pointAt(cx, cy, radius * Math.max(val, 0.05), angleFor(i));
    return `${p.x},${p.y}`;
  }).join(' ');
}

function octagonPoints(cx: number, cy: number, radius: number, scale: number) {
  return Array.from({ length: NUM_AXES }, (_, i) => {
    const p = pointAt(cx, cy, radius * scale, angleFor(i));
    return `${p.x},${p.y}`;
  }).join(' ');
}

function buildRadarSvg(studentScores: Partial<CultureScores>, companyScores: Partial<CultureScores>): string {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 32;

  const gridLines = [0.25, 0.5, 0.75, 1.0]
    .map((s) => `<polygon points="${octagonPoints(cx, cy, radius, s)}" fill="none" stroke="rgba(174,174,178,0.3)" stroke-width="0.5"/>`)
    .join('');

  const axisLines = Array.from({ length: NUM_AXES }, (_, i) => {
    const p = pointAt(cx, cy, radius, angleFor(i));
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(174,174,178,0.2)" stroke-width="0.5"/>`;
  }).join('');

  const companyPoly = `<polygon points="${buildPolygonPoints(cx, cy, radius, companyScores)}" fill="${C.company}" fill-opacity="0.15" stroke="${C.company}" stroke-width="1"/>`;
  const studentPoly = `<polygon points="${buildPolygonPoints(cx, cy, radius, studentScores)}" fill="${C.primary}" fill-opacity="0.2" stroke="${C.primary}" stroke-width="1.5"/>`;

  const dots = CULTURE_DIMENSIONS.map((dim, i) => {
    const val = scoreToFraction(studentScores[dim.key as keyof CultureScores]);
    const p = pointAt(cx, cy, radius * Math.max(val, 0.05), angleFor(i));
    return `<circle cx="${p.x}" cy="${p.y}" r="2.5" fill="${C.primary}"/>`;
  }).join('');

  const labels = CULTURE_DIMENSIONS.map((dim, i) => {
    const labelRadius = radius + 22;
    const p = pointAt(cx, cy, labelRadius, angleFor(i));
    return `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" font-size="6" fill="${C.textSecondary}">${escapeHtml(dim.labelHigh)}</text>`;
  }).join('');

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${gridLines}${axisLines}${companyPoly}${studentPoly}${dots}${labels}</svg>`;
}

// ---- Grade sections ----

function zeugnisTableHtml(grade: StudentGradeDTO): string {
  const grades = grade.grades as ZeugnisGrades;
  const subjects = getZeugnisSubjects(grade.canton ?? 'DEFAULT');

  const rows = subjects
    .map((sub, idx) => {
      const value = grades[sub.key];
      const bgColor = idx % 2 === 1 ? C.surface : C.white;
      const color = value != null ? gradeColorHex(value, true) : C.text;
      return `<tr style="background:${bgColor}">
        <td style="padding:3px 6px;font-size:7px;color:${C.text}">${escapeHtml(sub.label)}</td>
        <td style="padding:3px 6px;font-size:7px;font-weight:bold;text-align:right;color:${color}">${value != null ? value.toFixed(1) : '—'}</td>
      </tr>`;
    })
    .join('');

  const verified = grade.isVerified
    ? `<div style="font-size:6px;color:${C.success};margin-top:4px">Bestätigt am ${formatDate(grade.verifiedAt)}</div>`
    : '';

  return `
    <div style="margin-bottom:8px">
      <div style="font-size:7px;color:${C.textSecondary};margin-bottom:4px">
        Zeugnis — ${grade.niveau ?? '—'} | ${grade.canton ?? '—'} | ${grade.schoolYear ?? '—'} Sem. ${grade.semester ?? '—'}
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:${C.primary}">
            <th style="padding:3px 6px;font-size:7px;color:${C.white};text-align:left">Fach</th>
            <th style="padding:3px 6px;font-size:7px;color:${C.white};text-align:right">Note</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${verified}
    </div>`;
}

function multicheckTableHtml(grade: StudentGradeDTO): string {
  const grades = grade.grades as MulticheckGrades;

  const wissenRows = MULTICHECK_SCHULISCHES_WISSEN.map((sub, idx) => {
    const value = grades.schulisches_wissen?.[sub.key as keyof typeof grades.schulisches_wissen];
    const bgColor = idx % 2 === 1 ? C.surface : C.white;
    const color = value != null ? gradeColorHex(value, false) : C.text;
    return `<tr style="background:${bgColor}">
      <td style="padding:3px 6px;font-size:7px;color:${C.text}">${escapeHtml(sub.label)}</td>
      <td style="padding:3px 6px;font-size:7px;font-weight:bold;text-align:right;color:${color}">${value != null ? `${value}%` : '—'}</td>
    </tr>`;
  }).join('');

  const potenzialRows = MULTICHECK_POTENZIAL.map((sub, idx) => {
    const value = grades.potenzial?.[sub.key as keyof typeof grades.potenzial];
    const bgColor = idx % 2 === 1 ? C.surface : C.white;
    const color = value != null ? gradeColorHex(value, false) : C.text;
    return `<tr style="background:${bgColor}">
      <td style="padding:3px 6px;font-size:7px;color:${C.text}">${escapeHtml(sub.label)}</td>
      <td style="padding:3px 6px;font-size:7px;font-weight:bold;text-align:right;color:${color}">${value != null ? `${value}%` : '—'}</td>
    </tr>`;
  }).join('');

  const verified = grade.isVerified
    ? `<div style="font-size:6px;color:${C.success};margin-top:4px">Bestätigt am ${formatDate(grade.verifiedAt)}</div>`
    : '';

  return `
    <div style="margin-bottom:8px">
      <div style="font-size:7px;color:${C.textSecondary};margin-bottom:4px">
        ${grade.testVariant ?? 'Multicheck'} — ${formatDate(grade.testDate)}
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:${C.primary}">
          <th style="padding:3px 6px;font-size:7px;color:${C.white};text-align:left">Schulisches Wissen</th>
          <th style="padding:3px 6px;font-size:7px;color:${C.white};text-align:right">%</th>
        </tr></thead>
        <tbody>${wissenRows}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:6px">
        <thead><tr style="background:${C.primary}">
          <th style="padding:3px 6px;font-size:7px;color:${C.white};text-align:left">Potenzial</th>
          <th style="padding:3px 6px;font-size:7px;color:${C.white};text-align:right">%</th>
        </tr></thead>
        <tbody>${potenzialRows}</tbody>
      </table>
      ${verified}
    </div>`;
}

// ---- Main export ----

export function buildDossierHtml(data: ApplicationDossierDTO): string {
  const { application, student, grades, compatibility, companyCulture } = data;
  const generatedAt = new Date().toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const app = application;
  const initials = `${(student.firstName || '')[0] || ''}`.toUpperCase();

  // Breakdown bars HTML
  const breakdownHtml = compatibility.breakdown
    .map(
      (dim) => `
      <div style="display:flex;align-items:center;margin-bottom:3px">
        <span style="width:80px;font-size:7px;color:${C.textSecondary}">${escapeHtml(BREAKDOWN_LABELS[dim.label] ?? dim.label)}</span>
        <div style="flex:1;height:6px;background:${C.surface};border-radius:3px;overflow:hidden">
          <div style="height:6px;background:${C.primary};border-radius:3px;width:${Math.min(dim.score, 100)}%"></div>
        </div>
        <span style="width:26px;font-size:7px;font-weight:bold;text-align:right;color:${C.text}">${dim.score}%</span>
      </div>`,
    )
    .join('');

  // Culture radar
  let cultureHtml = '';
  if (student.cultureScores && companyCulture) {
    const radarSvg = buildRadarSvg(student.cultureScores, companyCulture);
    cultureHtml = `
      <div style="text-align:center;margin:4px 0">${radarSvg}</div>
      <div style="display:flex;justify-content:center;gap:14px;margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:3px">
          <span style="width:6px;height:6px;border-radius:3px;background:${C.primary};display:inline-block"></span>
          <span style="font-size:6px;color:${C.textSecondary}">Kandidat/in</span>
        </div>
        <div style="display:flex;align-items:center;gap:3px">
          <span style="width:6px;height:6px;border-radius:3px;background:${C.company};display:inline-block"></span>
          <span style="font-size:6px;color:${C.textSecondary}">Unternehmen</span>
        </div>
      </div>`;
  }

  // Motivation answers
  let motivationHtml = '';
  if (app.motivationAnswers && app.motivationAnswers.length > 0) {
    motivationHtml = `
      <div style="font-size:10px;font-weight:bold;color:${C.primary};margin:10px 0 5px;padding-bottom:3px;border-bottom:0.5px solid ${C.border}">Motivationsfragen</div>
      ${app.motivationAnswers.map((qa) => `
        <div style="font-size:8px;font-weight:bold;color:${C.text};margin-top:5px;margin-bottom:1px">${escapeHtml(qa.question)}</div>
        <div style="font-size:8px;color:${C.text};line-height:1.4">${escapeHtml(qa.answer)}</div>
      `).join('')}`;
  }

  // Motivation letter
  let motivationLetterHtml = '';
  if (student.motivationLetter) {
    motivationLetterHtml = `
      <div style="font-size:10px;font-weight:bold;color:${C.primary};margin:10px 0 5px;padding-bottom:3px;border-bottom:0.5px solid ${C.border}">Motivationsschreiben</div>
      <div style="font-size:8px;color:${C.text};line-height:1.4">${escapeHtml(student.motivationLetter)}</div>`;
  }

  // Availability
  let availabilityHtml = '';
  if (app.verfuegbarkeit) {
    availabilityHtml = `
      <div style="font-size:10px;font-weight:bold;color:${C.primary};margin:10px 0 5px;padding-bottom:3px;border-bottom:0.5px solid ${C.border}">Verfügbarkeit</div>
      <div style="font-size:8px;color:${C.text};line-height:1.4">${escapeHtml(app.verfuegbarkeit)}</div>`;
  }

  // Experience tags
  let experienceHtml = '';
  if (app.relevanteErfahrungen && app.relevanteErfahrungen.length > 0) {
    experienceHtml = `
      <div style="font-size:10px;font-weight:bold;color:${C.primary};margin:10px 0 5px;padding-bottom:3px;border-bottom:0.5px solid ${C.border}">Relevante Erfahrungen</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:3px">
        ${app.relevanteErfahrungen.map((exp) => `<span style="background:${C.primaryLight};padding:2px 6px;border-radius:8px;font-size:7px;color:${C.primary};font-weight:bold">${escapeHtml(exp)}</span>`).join('')}
      </div>`;
  }

  // Questions to company
  let questionsHtml = '';
  if (app.fragenAnBetrieb) {
    questionsHtml = `
      <div style="font-size:10px;font-weight:bold;color:${C.primary};margin:10px 0 5px;padding-bottom:3px;border-bottom:0.5px solid ${C.border}">Fragen an den Betrieb</div>
      <div style="font-size:8px;color:${C.text};line-height:1.4">${escapeHtml(app.fragenAnBetrieb)}</div>`;
  }

  // Schnupperlehre badge
  let schnupperlehreHtml = '';
  if (app.schnupperlehreWunsch) {
    schnupperlehreHtml = `
      <div style="margin-top:6px">
        <span style="display:inline-flex;align-items:center;gap:3px;background:#E8FAF0;padding:2px 6px;border-radius:8px;font-size:7px;color:${C.success};font-weight:bold">Wünscht Schnupperlehre</span>
      </div>`;
  }

  // Grades
  let gradesHtml = '';
  if (grades.length > 0) {
    const zeugnisse = grades.filter((g) => g.documentType === 'zeugnis');
    const multichecks = grades.filter((g) => g.documentType === 'multicheck' || g.documentType === 'basic_check');
    gradesHtml = `
      <div style="font-size:10px;font-weight:bold;color:${C.primary};margin:10px 0 5px;padding-bottom:3px;border-bottom:0.5px solid ${C.border}">Schulische Leistungen</div>
      ${zeugnisse.map((g) => zeugnisTableHtml(g)).join('')}
      ${multichecks.map((g) => multicheckTableHtml(g)).join('')}`;
  }

  // Desired fields
  let desiredFieldsHtml = '';
  if (student.desiredFields.length > 0) {
    desiredFieldsHtml = `<div style="font-size:8px;color:${C.textSecondary};margin-bottom:1px">Wunschberufe: ${escapeHtml(student.desiredFields.join(', '))}</div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    @page { size: A4; margin: 32px; }
    body { font-family: Helvetica, Arial, sans-serif; font-size: 8px; color: ${C.text}; margin: 0; padding: 32px; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <!-- PAGE 1: Header + Lehrstelle + Proof of Work -->
  <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid ${C.primary}">
    <div style="flex:1">
      <div style="font-size:17px;font-weight:bold;color:${C.text};margin-bottom:3px">${escapeHtml(student.firstName)} ${escapeHtml(student.lastName)}</div>
      <div style="font-size:8px;color:${C.textSecondary};margin-bottom:1px">${escapeHtml(student.canton)}, ${escapeHtml(student.city)}</div>
      ${student.dateOfBirth ? `<div style="font-size:8px;color:${C.textSecondary};margin-bottom:1px">Geb.: ${formatDate(student.dateOfBirth)}</div>` : ''}
      ${desiredFieldsHtml}
    </div>
    <div style="width:52px;height:52px;border-radius:26px;background:${C.primaryLight};display:flex;align-items:center;justify-content:center">
      <span style="font-size:20px;font-weight:bold;color:${C.primary}">${initials}</span>
    </div>
  </div>

  <div style="background:${C.primaryLight};padding:8px;border-radius:4px;margin-bottom:10px">
    <div style="font-size:10px;font-weight:bold;color:${C.primary};margin-bottom:1px">${escapeHtml(app.listing.title)}</div>
    <div style="font-size:7px;color:${C.textSecondary}">${escapeHtml(app.listing.companyName)} — ${escapeHtml(app.listing.field)} — ${escapeHtml(app.listing.canton)}, ${escapeHtml(app.listing.city)}</div>
  </div>

  ${motivationLetterHtml}
  ${motivationHtml}
  ${availabilityHtml}
  ${experienceHtml}
  ${questionsHtml}
  ${schnupperlehreHtml}

  <div style="position:fixed;bottom:14px;left:32px;right:32px;display:flex;justify-content:space-between;border-top:0.5px solid ${C.border};padding-top:4px">
    <span style="font-size:6px;color:${C.textSecondary}">Erstellt via LehrMatch</span>
    <span style="font-size:6px;color:${C.textSecondary}">${generatedAt}</span>
  </div>

  <!-- PAGE 2: Compatibility + Culture + Grades -->
  <div class="page-break"></div>

  <div style="font-size:10px;font-weight:bold;color:${C.primary};margin-bottom:5px;padding-bottom:3px;border-bottom:0.5px solid ${C.border}">Kompatibilität</div>
  <div style="display:flex;gap:14px;margin-bottom:8px">
    <div style="text-align:center">
      <div style="width:60px;height:60px;border-radius:30px;border:2.5px solid ${C.primary};display:flex;align-items:center;justify-content:center">
        <span style="font-size:18px;font-weight:bold;color:${C.primary}">${compatibility.totalScore}%</span>
      </div>
      <div style="font-size:6px;color:${C.textSecondary};margin-top:3px">Gesamtscore</div>
    </div>
    <div style="flex:1">${breakdownHtml}</div>
  </div>

  ${cultureHtml}
  ${gradesHtml}

  <div style="position:fixed;bottom:14px;left:32px;right:32px;display:flex;justify-content:space-between;border-top:0.5px solid ${C.border};padding-top:4px">
    <span style="font-size:6px;color:${C.textSecondary}">Erstellt via LehrMatch</span>
    <span style="font-size:6px;color:${C.textSecondary}">${generatedAt}</span>
  </div>
</body>
</html>`;
}
