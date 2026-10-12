import { COURSE_DB, SEMESTERS, buildDependents, downstreamOf, type CourseInfo } from "../data/courses.ts";

export type Limits = { min: number; max: number };
export type CourseRule = { earliest?: number; offered?: "both" | "first" | "second" };
export type PlannerSettings = Limits & {
  year: number; term: number; currentSemester: number;
  overrides: Record<number, Limits>; rules: Record<string, CourseRule>;
};
export type PlannedTerm = { index: number; year: number; term: number; courses: string[]; credits: number; limits: Limits; warnings: string[] };
export type Route = { terms: PlannedTerm[]; remaining: string[]; warnings: string[]; reasons: Record<string, string>; error?: string };
export const DEFAULT_SETTINGS: PlannerSettings = { min: 18, max: 30, year: 2026, term: 2, currentSemester: 1, overrides: {}, rules: {} };
export const nominalSemester = Object.fromEntries(SEMESTERS.flatMap((s, i) => s.courses.map(c => [c, i + 1])));

export function validLimits(l: Limits) {
  return Number.isInteger(l.min) && Number.isInteger(l.max) && l.min >= 0 && l.max >= 1 && l.max <= 60 && l.min <= l.max;
}

/** Bounded semester simulation. Requirements must be met before the term begins. */
export function planRoute(completed: Set<string>, settings: PlannerSettings, mode: "fast" | "light" = "fast", db: Record<string, CourseInfo> = COURSE_DB): Route {
  const route: Route = { terms: [], remaining: [], warnings: [], reasons: {} };
  const pending = new Set(Object.keys(db).filter(c => !completed.has(c)));
  const fail = (error: string) => ({ ...route, error, remaining: [...pending] });
  if (!validLimits(settings) || Object.values(settings.overrides).some(l => !validLimits(l))) return fail("Revisa los créditos: mínimo entre 0 y máximo; máximo entre 1 y 60, sin decimales.");
  if (!Number.isInteger(settings.year) || settings.year < 2000 || settings.year > 2200 || ![1, 2].includes(settings.term) || !Number.isInteger(settings.currentSemester) || settings.currentSemester < 1 || settings.currentSemester > 40) return fail("Revisa el año, el período y tu semestre de carrera.");
  if (Object.values(settings.rules).some(r => r.earliest !== undefined && (!Number.isInteger(r.earliest) || r.earliest < 1 || r.earliest > 40))) return fail("Puedes posponer un ramo hasta el semestre 40 de la ruta.");
  const done = new Set([...completed].filter(c => db[c]));
  const dep = buildDependents(db);
  const bad = new Set<string>();
  for (const c of pending) {
    if (!Number.isInteger(db[c].creditos) || db[c].creditos < 0 || db[c].requisitos.some(r => !db[r])) bad.add(c);
    if (downstreamOf(c, dep).size && db[c].requisitos.some(r => downstreamOf(c, dep).has(r))) bad.add(c);
  }
  for (const c of [...bad]) for (const d of downstreamOf(c, dep)) if (pending.has(d)) bad.add(d);
  if (bad.size) route.warnings.push(`Hay requisitos cíclicos, desconocidos o créditos inválidos que impiden planificar: ${[...bad].join(", ")}.`);
  const eligiblePending = new Set([...pending].filter(c => !bad.has(c)));
  const downCount = (c: string) => [...downstreamOf(c, dep)].filter(d => pending.has(d)).length;
  for (const c of pending) {
    const n = downCount(c);
    route.reasons[c] = `${(nominalSemester[c] ?? 99) < settings.currentSemester ? "Ramo atrasado. " : ""}${n ? `Abre el camino a ${n} ramos pendientes.` : "Completa créditos pendientes de tu malla."}`;
  }
  for (let i = 1; i <= 40 && eligiblePending.size; i++) {
    const absolute = settings.term - 1 + i - 1;
    const term = absolute % 2 + 1;
    const year = settings.year + Math.floor(absolute / 2);
    const limits = settings.overrides[i] ?? { min: settings.min, max: settings.max };
    const available = [...eligiblePending].filter(c => {
      const rule = settings.rules[c];
      return db[c].requisitos.every(r => done.has(r)) && i >= (rule?.earliest ?? 1) && (!rule?.offered || rule.offered === "both" || (rule.offered === "first" ? term === 1 : term === 2));
    });
    // The lighter route targets the minimum, but allows a single heavy course within the hard maximum.
    const cap = mode === "light" ? Math.min(limits.max, Math.max(limits.min, 1, ...available.filter(c => db[c].creditos <= limits.max).map(c => db[c].creditos))) : limits.max;
    const zero = available.filter(c => db[c].creditos === 0);
    const table: ({ score: number; courses: string[] } | undefined)[] = Array(cap + 1).fill(undefined);
    table[0] = { score: 0, courses: [] };
    for (const c of available.filter(c => db[c].creditos > 0)) {
      const credits = db[c].creditos;
      const score = 100 + downCount(c) * 35 + Math.max(0, settings.currentSemester - (nominalSemester[c] ?? settings.currentSemester)) * 12;
      for (let used = cap; used >= credits; used--) {
        const prev = table[used - credits];
        if (prev && (!table[used] || prev.score + score > table[used]!.score)) table[used] = { score: prev.score + score, courses: [...prev.courses, c] };
      }
    }
    const best = table.reduce<{ score: number; courses: string[] }>((a, b) => b && b.score > a.score ? b : a, { score: 0, courses: [] });
    const courses = [...zero, ...best.courses];
    const credits = courses.reduce((sum, c) => sum + db[c].creditos, 0);
    const warnings: string[] = [];
    if (credits < limits.min) warnings.push(`Carga bajo tu mínimo de ${limits.min} cr: los ramos elegibles, sus créditos y esta estrategia no permiten completar el intervalo.`);
    if (!courses.length) warnings.push("Sin ramos asignados: revisa la oferta, las postergaciones, los requisitos y el límite de créditos.");
    route.terms.push({ index: i, year, term, courses, credits, limits, warnings });
    for (const c of courses) { done.add(c); eligiblePending.delete(c); pending.delete(c); }
    // Stop only when no future override, postponement or alternating offer can change eligibility.
    const futureMax = Math.max(settings.max, ...Object.entries(settings.overrides).filter(([idx]) => +idx > i).map(([, l]) => l.max));
    if (!courses.length && ![...eligiblePending].some(c => db[c].requisitos.every(req => done.has(req)) && db[c].creditos <= futureMax)) break;
  }
  route.remaining = [...pending];
  const highestMax = Math.max(settings.max, ...Object.values(settings.overrides).map(l => l.max));
  const tooHeavy = route.remaining.filter(c => db[c].creditos > highestMax);
  if (tooHeavy.length) route.warnings.push(`Estos ramos superan todos tus máximos: ${tooHeavy.map(c => `${db[c].nombre} (${db[c].creditos} cr)`).join(", ")}. Aumenta el máximo general o personaliza un semestre futuro.`);
  if (pending.size) route.warnings.push(`Ruta incompleta: quedan ${pending.size} ramos sin asignar. Revisa créditos máximos, requisitos y oferta. El horizonte máximo es de 40 semestres.`);
  return route;
}
