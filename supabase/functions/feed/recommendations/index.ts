import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { computeScore, type LehrstelleCandidate, type StudentData } from "./scoring.ts";

interface FeedRequest {
  studentId: string;
  batchSize: number;
  filters?: {
    cantons?: string[];
    berufsfelder?: string[];
    educationType?: string;
    minCompatibility?: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const body: FeedRequest = await req.json();
    const { studentId, batchSize = 20, filters } = body;

    if (!studentId) {
      return jsonResponse({ error: "studentId is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --- Fetch student data + personality profile ---
    const { data: studentRow, error: studentError } = await supabase
      .from("students")
      .select(`
        id, canton, preferred_language, interests, skills, multicheck_score,
        personality_profiles (
          holland_codes, work_values
        )
      `)
      .eq("id", studentId)
      .single();

    if (studentError || !studentRow) {
      return jsonResponse({ error: "Student not found" }, 404);
    }

    const personalityProfile = Array.isArray(studentRow.personality_profiles)
      ? studentRow.personality_profiles[0]
      : studentRow.personality_profiles;

    const student: StudentData = {
      canton: studentRow.canton,
      preferredLanguage: studentRow.preferred_language ?? "de",
      interests: studentRow.interests ?? [],
      skills: studentRow.skills ?? [],
      multicheckScore: studentRow.multicheck_score,
      hollandCodes: personalityProfile
        ? hollandCodesToVector(personalityProfile.holland_codes)
        : null,
      workValues: personalityProfile
        ? workValuesToVector(personalityProfile.work_values)
        : null,
    };

    // --- Fetch candidate Lehrstellen ---
    let query = supabase
      .from("lehrstellen")
      .select(`
        id, company_id, beruf_code, title, description, requirements,
        education_type, start_date, duration_years, canton, city, postal_code,
        video_url, photos, culture_description, berufsschule_canton,
        companies!inner (
          company_name, logo_url, company_size, culture_tags,
          verified, premium
        ),
        berufe!inner (
          name_de, field, personality_fit
        )
      `)
      .eq("status", "active")
      .not("id", "in", `(${await getSwipedIds(supabase, studentId)})`)
      .limit(200);

    // Apply filters
    if (filters?.cantons && filters.cantons.length > 0) {
      query = query.in("canton", filters.cantons);
    }
    if (filters?.educationType) {
      query = query.eq("education_type", filters.educationType);
    }

    const { data: candidates, error: candidateError } = await query;

    if (candidateError) {
      return jsonResponse({ error: candidateError.message }, 500);
    }

    if (!candidates || candidates.length === 0) {
      return jsonResponse([], 200);
    }

    // --- Filter by Berufsfeld (applied in memory since it's on the joined table) ---
    let filtered = candidates;
    if (filters?.berufsfelder && filters.berufsfelder.length > 0) {
      const fields = new Set(filters.berufsfelder);
      filtered = candidates.filter((c: any) => fields.has(c.berufe.field));
    }

    // --- Score each candidate ---
    const scored = filtered.map((c: any) => {
      const company = c.companies;
      const beruf = c.berufe;

      const candidate: LehrstelleCandidate = {
        id: c.id,
        canton: c.canton,
        berufsschuleCanton: c.berufsschule_canton,
        educationType: c.education_type,
        berufField: beruf.field,
        personalityFit: beruf.personality_fit ?? {},
        cultureTags: company.culture_tags ?? [],
        verified: company.verified ?? false,
        premium: company.premium ?? false,
      };

      const score = computeScore(student, candidate);

      return {
        id: c.id,
        company_id: c.company_id,
        company_name: company.company_name,
        company_logo_url: company.logo_url,
        beruf_code: c.beruf_code,
        beruf_title: beruf.name_de,
        title: c.title,
        description: c.description,
        canton: c.canton,
        city: c.city,
        education_type: c.education_type,
        start_date: c.start_date,
        duration_years: c.duration_years,
        video_url: c.video_url,
        photo_urls: c.photos ?? [],
        culture_description: c.culture_description,
        culture_tags: company.culture_tags ?? [],
        requirements: c.requirements ?? [],
        compatibility_score: Math.round(score * 100) / 100,
        berufsschule_canton: c.berufsschule_canton,
        company_size: company.company_size,
        is_verified: company.verified ?? false,
        is_premium: company.premium ?? false,
      };
    });

    // --- Sort by score descending ---
    scored.sort((a: any, b: any) => b.compatibility_score - a.compatibility_score);

    // --- Apply minimum compatibility filter ---
    const minCompat = filters?.minCompatibility ?? 0;
    const finalResults = scored
      .filter((r: any) => r.compatibility_score >= minCompat)
      .slice(0, batchSize);

    // --- Cold start: enforce Berufsfeld diversity ---
    if (!student.hollandCodes) {
      return jsonResponse(enforceDiversity(finalResults, batchSize), 200);
    }

    return jsonResponse(finalResults, 200);
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});

// --- Helpers ---

function hollandCodesToVector(codes: Record<string, number>): number[] {
  return [
    codes.realistic ?? 0,
    codes.investigative ?? 0,
    codes.artistic ?? 0,
    codes.social ?? 0,
    codes.enterprising ?? 0,
    codes.conventional ?? 0,
  ];
}

function workValuesToVector(values: Record<string, number>): number[] {
  return [
    values.teamwork ?? 0,
    values.independence ?? 0,
    values.creativity ?? 0,
    values.stability ?? 0,
    values.variety ?? 0,
    values.helping_others ?? 0,
    values.physical_activity ?? 0,
    values.technology ?? 0,
  ];
}

async function getSwipedIds(
  supabase: any,
  studentId: string,
): Promise<string> {
  const { data } = await supabase
    .from("swipes")
    .select("lehrstelle_id")
    .eq("student_id", studentId);

  if (!data || data.length === 0) {
    // Return a UUID that won't match anything to avoid empty IN clause
    return "'00000000-0000-0000-0000-000000000000'";
  }

  return data.map((s: any) => `'${s.lehrstelle_id}'`).join(",");
}

/**
 * For cold start: cap at max 3 positions per Berufsfeld for diversity.
 */
function enforceDiversity(results: any[], maxTotal: number): any[] {
  const fieldCounts: Record<string, number> = {};
  const diverse: any[] = [];

  for (const r of results) {
    const field = r.beruf_field ?? "unknown";
    const count = fieldCounts[field] ?? 0;
    if (count < 3) {
      diverse.push(r);
      fieldCounts[field] = count + 1;
      if (diverse.length >= maxTotal) break;
    }
  }

  return diverse;
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
