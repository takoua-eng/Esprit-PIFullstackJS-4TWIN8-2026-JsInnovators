import { Types } from 'mongoose';
import type { VitalParametersDocument } from '../vital-parameters/vital-parameters.schema';
import type { SymptomsDocument } from '../symptoms/symptoms.schema';
import type { VitalDocument } from '../vitals/vital.schema';

/** Parse "120/80", "120 - 90", "150" from nurse `/vitals` string BP field. */
export function parseBloodPressureString(
  raw?: string | null,
): { systolic?: number; diastolic?: number } {
  if (!raw || typeof raw !== 'string') return {};
  const s = raw.trim();
  const m = s.match(/(\d{2,3})\s*[/\u002d\u2013\u2014]\s*(\d{2,3})/);
  if (m) {
    return {
      systolic: Number(m[1]),
      diastolic: Number(m[2]),
    };
  }
  const single = s.match(/^(\d{2,3})\s*$/);
  if (single) return { systolic: Number(single[1]) };
  return {};
}

export type HeuristicLevel = 'urgent' | 'warning' | 'info';

/** Matches frontend `ClinicalReviewQueueItemDto.heuristicSeverity` */
export type QueueSeverity = 'high' | 'medium' | 'low';

export type ClinicalQueueRow = {
  queueId: string;
  sourceType: 'vital' | 'symptom';
  sourceId: string;
  patientId: string;
  patientName: string;
  summary: string;
  parameter?: string;
  value?: number;
  threshold?: number;
  recordedAt: string;
  heuristicSeverity: QueueSeverity;
  /** urgent | warning | info — for UI labels */
  severityCategory: HeuristicLevel;
  sortScore: number;
};

function levelToSeverity(l: HeuristicLevel): QueueSeverity {
  if (l === 'urgent') return 'high';
  if (l === 'warning') return 'medium';
  return 'low';
}

function scoreForLevel(l: HeuristicLevel): number {
  if (l === 'urgent') return 100;
  if (l === 'warning') return 60;
  return 25;
}

function maxHeuristic(a: HeuristicLevel, b: HeuristicLevel): HeuristicLevel {
  const order: Record<HeuristicLevel, number> = {
    info: 0,
    warning: 1,
    urgent: 2,
  };
  return order[a] >= order[b] ? a : b;
}

type VitalLikeFields = {
  temperature?: number | null;
  heartRate?: number | null;
  bloodPressuresystolic?: number | null;
  bloodPressureDiastolic?: number | null;
};

/**
 * Shared rules for VitalParameters and legacy `Vital` documents.
 * HR: flag >110 (above common 50–110 rest range) and &lt;50; aligns with issued alerts ~100–120 band.
 */
function buildRowsFromVitalFields(
  v: VitalLikeFields,
  patientId: Types.ObjectId,
  patientName: string,
  recordedAt: Date,
  sourceId: string,
  queueIdPrefix: 'v' | 'lv',
): ClinicalQueueRow[] {
  const rows: ClinicalQueueRow[] = [];
  const iso = recordedAt.toISOString();

  const push = (
    parameter: string,
    value: number,
    threshold: number,
    summary: string,
    level: HeuristicLevel,
  ) => {
    rows.push({
      queueId: `${queueIdPrefix}-${patientId}-${parameter}-${sourceId}`,
      sourceType: 'vital',
      sourceId,
      patientId: patientId.toString(),
      patientName,
      summary,
      parameter,
      value,
      threshold,
      recordedAt: iso,
      heuristicSeverity: levelToSeverity(level),
      severityCategory: level,
      sortScore: scoreForLevel(level) + Math.min(value, 30),
    });
  };

  const t = v.temperature;
  if (t !== undefined && t !== null) {
    if (t >= 39.5) push('temperature', t, 39.5, `Fever / high temperature: ${t} °C (≥ 39.5)`, 'urgent');
    else if (t >= 38)
      push('temperature', t, 38, `Fever: ${t} °C (≥ 38)`, 'warning');
    else if (t < 34)
      push('temperature', t, 34, `Hypothermia risk: ${t} °C (< 34)`, 'urgent');
    else if (t < 35)
      push('temperature', t, 35, `Low temperature: ${t} °C (< 35)`, 'warning');
    else if (t > 37.8)
      push('temperature', t, 37.8, `Mild fever: ${t} °C`, 'info');
  }

  const hr = v.heartRate;
  if (hr !== undefined && hr !== null) {
    if (hr > 130) push('heartRate', hr, 130, `Tachycardia: ${hr} bpm (> 130)`, 'urgent');
    else if (hr > 120)
      push('heartRate', hr, 120, `High heart rate: ${hr} bpm (> 120)`, 'warning');
    else if (hr > 110)
      push('heartRate', hr, 110, `Elevated heart rate: ${hr} bpm (> 110)`, 'warning');
    else if (hr > 100)
      push('heartRate', hr, 100, `Heart rate above resting range: ${hr} bpm (> 100)`, 'info');
    else if (hr < 45) push('heartRate', hr, 45, `Severe bradycardia: ${hr} bpm (< 45)`, 'urgent');
    else if (hr < 50) push('heartRate', hr, 50, `Low heart rate: ${hr} bpm (< 50)`, 'warning');
  }

  const sbp = v.bloodPressuresystolic;
  if (sbp !== undefined && sbp !== null) {
    if (sbp > 180)
      push('bloodPressureSystolic', sbp, 180, `Severe hypertension (SBP): ${sbp} mmHg`, 'urgent');
    else if (sbp > 160)
      push('bloodPressureSystolic', sbp, 160, `High systolic BP: ${sbp} mmHg`, 'warning');
    else if (sbp > 140)
      push('bloodPressureSystolic', sbp, 140, `Elevated SBP: ${sbp} mmHg`, 'warning');
    else if (sbp >= 130)
      push('bloodPressureSystolic', sbp, 130, `Borderline high SBP: ${sbp} mmHg`, 'info');
  }

  const dbp = v.bloodPressureDiastolic;
  if (dbp !== undefined && dbp !== null) {
    if (dbp > 110)
      push('bloodPressureDiastolic', dbp, 110, `Severe diastolic hypertension: ${dbp} mmHg`, 'urgent');
    else if (dbp > 100)
      push('bloodPressureDiastolic', dbp, 100, `High diastolic BP: ${dbp} mmHg`, 'warning');
  }

  return rows;
}

/** Derive queue rows from latest vital row for one patient. */
export function buildRowsFromVital(
  v: VitalParametersDocument,
  patientId: Types.ObjectId,
  patientName: string,
): ClinicalQueueRow[] {
  const recordedAt =
    v.recordedAt instanceof Date ? v.recordedAt : new Date(v.recordedAt);
  const fields: VitalLikeFields = {
    temperature: v.temperature,
    heartRate: v.heartRate,
    bloodPressuresystolic: v.bloodPressuresystolic,
    bloodPressureDiastolic: v.bloodPressureDiastolic,
  };
  return buildRowsFromVitalFields(
    fields,
    patientId,
    patientName,
    recordedAt,
    v._id.toString(),
    'v',
  );
}

/** Latest reading from `Vital` collection (`/vitals`) — string BP parsed to numbers. */
export function buildRowsFromLegacyVital(
  v: VitalDocument,
  patientId: Types.ObjectId,
  patientName: string,
): ClinicalQueueRow[] {
  const recordedAt =
    v.recordedAt instanceof Date ? v.recordedAt : new Date(v.recordedAt);
  const bp = parseBloodPressureString(v.bloodPressure);
  const fields: VitalLikeFields = {
    temperature: v.temperature,
    heartRate: v.heartRate,
    bloodPressuresystolic: bp.systolic,
    bloodPressureDiastolic: bp.diastolic,
  };
  return buildRowsFromVitalFields(
    fields,
    patientId,
    patientName,
    recordedAt,
    v._id.toString(),
    'lv',
  );
}

/**
 * One row per latest symptom report: merges pain, fatigue, nausea, SOB, tags, and free text
 * so mild logs still appear and nausea without pain is visible.
 */
export function buildConsolidatedSymptomRow(
  s: SymptomsDocument,
  patientId: Types.ObjectId,
  patientName: string,
): ClinicalQueueRow | null {
  const recordedAt =
    s.reportedAt instanceof Date ? s.reportedAt : new Date(s.reportedAt);
  const iso = recordedAt.toISOString();
  const sid = s._id.toString();

  const painRaw = s.painLevel as unknown;
  const pain =
    typeof painRaw === 'number' && !Number.isNaN(painRaw) ? painRaw : null;

  const fatigueRaw = s.fatigueLevel as unknown;
  const fatigue =
    typeof fatigueRaw === 'number' && !Number.isNaN(fatigueRaw)
      ? fatigueRaw
      : null;

  let level: HeuristicLevel = 'info';
  const detailParts: string[] = [];

  if (pain !== null) {
    if (pain >= 9) {
      level = maxHeuristic(level, 'urgent');
      detailParts.push(`severe pain ${pain}/10`);
    } else if (pain >= 7) {
      level = maxHeuristic(level, 'warning');
      detailParts.push(`high pain ${pain}/10`);
    } else if (pain >= 5) {
      level = maxHeuristic(level, 'warning');
      detailParts.push(`moderate pain ${pain}/10`);
    } else if (pain >= 4) {
      level = maxHeuristic(level, 'info');
      detailParts.push(`pain ${pain}/10`);
    }
  }

  if (fatigue !== null) {
    if (fatigue >= 9) {
      level = maxHeuristic(level, 'urgent');
      detailParts.push(`severe fatigue ${fatigue}/10`);
    } else if (fatigue >= 7) {
      level = maxHeuristic(level, 'warning');
      detailParts.push(`high fatigue ${fatigue}/10`);
    } else if (fatigue >= 5) {
      level = maxHeuristic(level, 'warning');
      detailParts.push(`notable fatigue ${fatigue}/10`);
    } else if (fatigue >= 4) {
      level = maxHeuristic(level, 'info');
      detailParts.push(`fatigue ${fatigue}/10`);
    }
  }

  if (s.shortnessOfBreath === true) {
    level = maxHeuristic(
      level,
      pain !== null && pain >= 7 ? 'urgent' : 'warning',
    );
    detailParts.push('shortness of breath');
  }

  if (s.nausea === true) {
    level = maxHeuristic(level, 'warning');
    detailParts.push('nausea');
  }

  const blob = [
    ...(s.symptoms || []),
    s.description || '',
  ]
    .join(' ')
    .toLowerCase();

  if (/chest\s*pain|crushing|stroke|unable to breathe|severe headache/i.test(blob)) {
    level = maxHeuristic(level, 'urgent');
  } else if (
    /back\s*pain|abdominal|vomit|dizz|worsening|fever|migraine/i.test(blob)
  ) {
    level = maxHeuristic(level, 'warning');
  }

  const hasContent =
    (s.symptoms && s.symptoms.length > 0) ||
    !!s.description ||
    pain !== null ||
    fatigue !== null ||
    s.nausea === true ||
    s.shortnessOfBreath === true;

  if (!hasContent) return null;

  if (detailParts.length === 0 && (s.symptoms?.length || s.description)) {
    level = maxHeuristic(level, 'info');
    const tagStr = s.symptoms?.length ? s.symptoms.join(', ') : '';
    const desc = s.description?.trim();
    detailParts.push(
      desc
        ? `report: ${tagStr ? `${tagStr} — ` : ''}${desc}`
        : `symptoms: ${tagStr}`,
    );
  }

  if (detailParts.length === 0) return null;

  const summary = detailParts.join(' · ');
  const sortScore =
    scoreForLevel(level) +
    (pain !== null ? Math.min(pain, 10) : 0) +
    (fatigue !== null ? Math.min(fatigue, 10) : 0);

  return {
    queueId: `s-${patientId}-symptom-${sid}`,
    sourceType: 'symptom',
    sourceId: sid,
    patientId: patientId.toString(),
    patientName,
    summary,
    parameter: 'symptomReport',
    value: pain !== null ? pain : fatigue !== null ? fatigue : undefined,
    recordedAt: iso,
    heuristicSeverity: levelToSeverity(level),
    severityCategory: level,
    sortScore,
  };
}
