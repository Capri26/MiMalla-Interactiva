export interface CourseInfo {
  nombre: string;
  creditos: number;
  requisitos: string[];
}

export const COURSE_DB: Record<string, CourseInfo> = {
  MA1001: { nombre: "Introducción al Cálculo", creditos: 6, requisitos: [] },
  MA1101: { nombre: "Introducción al Álgebra", creditos: 6, requisitos: [] },
  FI1000: { nombre: "Introducción a la Física Clásica", creditos: 6, requisitos: [] },
  CC1000: { nombre: "Herramientas Computacionales para Ing. y Cs.", creditos: 3, requisitos: [] },
  CD1100: { nombre: "Desafíos de Innovación en Ing. y Cs.", creditos: 6, requisitos: [] },
  BT1211: { nombre: "Aplicaciones de la Biología a la Ing. y Cs.", creditos: 3, requisitos: [] },

  MA1002: { nombre: "Cálculo Diferencial e Integral", creditos: 6, requisitos: ["MA1001"] },
  MA1102: { nombre: "Álgebra Lineal", creditos: 6, requisitos: ["MA1101"] },
  FI1100: { nombre: "Introducción a la Física Moderna", creditos: 6, requisitos: ["FI1000", "MA1101", "MA1001"] },
  CC1002: { nombre: "Introducción a la Programación", creditos: 6, requisitos: [] },
  CD1201: { nombre: "Proyecto de Innovación en Ing. y Cs.", creditos: 3, requisitos: ["CD1100"] },
  FI_FORM_II: { nombre: "Formación Integral DR/EH/FG/EI/FT (II)", creditos: 3, requisitos: [] },

  MA2001: { nombre: "Cálculo en Varias Variables", creditos: 6, requisitos: ["MA1002", "MA1102"] },
  MA2601: { nombre: "Ecuaciones Diferenciales Ordinarias", creditos: 6, requisitos: ["MA1002", "MA1102"] },
  FI2001: { nombre: "Mecánica", creditos: 6, requisitos: ["FI1100", "MA1002", "MA1102"] },
  FI2003: { nombre: "Métodos Experimentales", creditos: 6, requisitos: ["MA1002", "FI1100"] },
  IQ2211: { nombre: "Química", creditos: 6, requisitos: ["FI1100", "CC1002"] },

  MA2002: { nombre: "Cálculo Avanzado y Aplicaciones", creditos: 6, requisitos: ["MA2001", "MA2601"] },
  IN2201: { nombre: "Economía", creditos: 6, requisitos: ["MA2001"] },
  FI2002: { nombre: "Electromagnetismo", creditos: 6, requisitos: ["MA2001", "MA2601", "FI2001"] },
  "FI2004/IQ2212": { nombre: "Termodinámica / Termodinámica Química", creditos: 6, requisitos: ["IQ2211", "MA2001", "FI2001"] },
  CD2201: { nombre: "Módulo Interdisciplinario", creditos: 3, requisitos: ["CD1201", "FI2003"] },
  FI_FORM_IV: { nombre: "Formación Integral DR/EH/FG/EI/FT (IV)", creditos: 3, requisitos: [] },

  MA3403: { nombre: "Probabilidades y Estadística", creditos: 6, requisitos: ["MA2001"] },
  MI3100: { nombre: "Química Mineralógica", creditos: 6, requisitos: ["IQ2211"] },
  MI3105: { nombre: "Geología para Ingenieros", creditos: 6, requisitos: ["MA1002", "CD2201"] },
  MI3110: { nombre: "Minería y Sustentabilidad", creditos: 6, requisitos: ["CD2201"] },
  MI3115: { nombre: "Mecánica de Rocas I", creditos: 6, requisitos: ["FI2001"] },

  "MA3701/IN3171": { nombre: "Optimización / Modelamiento y Optimización", creditos: 6, requisitos: ["MA2002"] },
  MI3230: { nombre: "Fisicoquímica Metalúrgica", creditos: 6, requisitos: ["FI2004/IQ2212"] },
  MI3210: { nombre: "Introducción a Yacimientos Minerales", creditos: 6, requisitos: ["MI3105", "MI3100"] },
  MI3235: { nombre: "Fenómenos de Transporte", creditos: 6, requisitos: ["FI2004/IQ2212"] },
  MI3215: { nombre: "Mecánica de Rocas II", creditos: 6, requisitos: ["MI3115", "MI3105"] },

  IN3301: { nombre: "Evaluación de Proyectos", creditos: 6, requisitos: ["IN2201", "MA3403"] },
  MI4135: { nombre: "Metalurgia Extractiva", creditos: 6, requisitos: ["MI3100", "MI3235", "MI3230"] },
  MI4040: { nombre: "Análisis Estadístico y Geoestadístico de Datos", creditos: 6, requisitos: ["MA3403"] },
  MI4070: { nombre: "Fundamentos de Tecnología Minera", creditos: 6, requisitos: ["MI3215"] },
  MI4150: { nombre: "Procesamiento de Minerales I", creditos: 6, requisitos: ["MI3100", "MI3110"] },
  MI4901: { nombre: "Práctica Profesional I", creditos: 7, requisitos: ["MI3110", "MI3105"] },

  MI4260: { nombre: "Economía de Minerales", creditos: 3, requisitos: ["IN3301", "MI3110", "MA3701/IN3171"] },
  MI4240: { nombre: "Evaluación de Yacimientos", creditos: 6, requisitos: ["MI3210", "MI4040"] },
  MI4265: { nombre: "Legislación Minera", creditos: 3, requisitos: ["MI3110"] },
  MI5160: { nombre: "Medio Ambiente y Comunidades", creditos: 6, requisitos: ["MI4135", "MI4070"] },
  MI4250: { nombre: "Procesamiento de Minerales II", creditos: 6, requisitos: ["MI4150", "MI3235"] },
  FI_FORM_VIII: { nombre: "Formación Integral EH/FG (VIII)", creditos: 3, requisitos: [] },
  E1090: { nombre: "Examen de Suficiencia en Inglés I", creditos: 0, requisitos: [] },

  MI5120: { nombre: "Diseño y Planificación de Minas Subterráneas", creditos: 6, requisitos: ["IN3301", "MI4070", "MI4040"] },
  MI5115: { nombre: "Diseño y Planificación de Minas a Cielo Abierto", creditos: 6, requisitos: ["IN3301", "MI4070", "MI4040"] },
  MI5110: { nombre: "Gestión de Operaciones Mineras", creditos: 3, requisitos: ["MI4070", "MI4250", "MI4260"] },
  MI5260: { nombre: "Seguridad Minera", creditos: 3, requisitos: ["MI4901", "MI4070"] },
  MI5170: { nombre: "Aguas y Relaves", creditos: 3, requisitos: ["MI4250", "MI4135"] },
  ELEC_ESP_IX: { nombre: "Electivo de Especialidad (IX)", creditos: 9, requisitos: [] },

  MI5902: { nombre: "Práctica Profesional II", creditos: 14, requisitos: ["MI4901", "MI4135", "MI4070"] },
  MI6907: { nombre: "Introducción al Trabajo de Título", creditos: 6, requisitos: ["MI5902"] },
  MI5210: { nombre: "Taller de Proyecto Minero", creditos: 6, requisitos: ["MI4250", "MI5160", "MI5115", "MI5120"] },
  MI5265: { nombre: "Evaluación y Gestión de Proyectos Mineros", creditos: 6, requisitos: ["MI4260", "MI4250", "MI4070"] },
  ELEC_ESP_X1: { nombre: "Electivo de Especialidad (X-1)", creditos: 6, requisitos: [] },
  ELEC_ESP_X2: { nombre: "Electivo de Especialidad (X-2)", creditos: 6, requisitos: [] },

  MI6919: { nombre: "Trabajo de Título", creditos: 30, requisitos: ["MI6907", "MI5210"] },
  E2090: { nombre: "Examen de Suficiencia en Inglés II", creditos: 0, requisitos: ["E1090"] },
};

export interface Semester {
  group: "PLAN COMÚN" | "LICENCIATURA" | "ESPECIALIDAD";
  label: string;
  courses: string[];
}

export const SEMESTERS: Semester[] = [
  {
    group: "PLAN COMÚN",
    label: "I Semestre",
    courses: ["MA1001", "MA1101", "FI1000", "CC1000", "CD1100", "BT1211"],
  },
  {
    group: "PLAN COMÚN",
    label: "II Semestre",
    courses: ["MA1002", "MA1102", "FI1100", "CC1002", "CD1201", "FI_FORM_II"],
  },
  {
    group: "PLAN COMÚN",
    label: "III Semestre",
    courses: ["MA2001", "MA2601", "FI2001", "FI2003", "IQ2211"],
  },
  {
    group: "PLAN COMÚN",
    label: "IV Semestre",
    courses: ["MA2002", "IN2201", "FI2002", "FI2004/IQ2212", "CD2201", "FI_FORM_IV"],
  },
  {
    group: "LICENCIATURA",
    label: "V Semestre",
    courses: ["MA3403", "MI3100", "MI3105", "MI3110", "MI3115"],
  },
  {
    group: "LICENCIATURA",
    label: "VI Semestre",
    courses: ["MA3701/IN3171", "MI3230", "MI3210", "MI3235", "MI3215"],
  },
  {
    group: "LICENCIATURA",
    label: "VII Semestre",
    courses: ["IN3301", "MI4135", "MI4040", "MI4070", "MI4150", "MI4901"],
  },
  {
    group: "LICENCIATURA",
    label: "VIII Semestre",
    courses: ["MI4260", "MI4240", "MI4265", "MI5160", "MI4250", "FI_FORM_VIII", "E1090"],
  },
  {
    group: "ESPECIALIDAD",
    label: "IX Semestre",
    courses: ["MI5120", "MI5115", "MI5110", "MI5260", "MI5170", "ELEC_ESP_IX"],
  },
  {
    group: "ESPECIALIDAD",
    label: "X Semestre",
    courses: ["MI5902", "MI6907", "MI5210", "MI5265", "ELEC_ESP_X1", "ELEC_ESP_X2"],
  },
  {
    group: "ESPECIALIDAD",
    label: "XI Semestre",
    courses: ["MI6919", "E2090"],
  },
];

export function isUnlocked(code: string, completed: Set<string>): boolean {
  const reqs = COURSE_DB[code]?.requisitos ?? [];
  return reqs.every((r) => completed.has(r));
}

export function buildDependents(db: Record<string, CourseInfo>): Map<string, string[]> {
  const dep = new Map<string, string[]>();
  for (const code of Object.keys(db)) dep.set(code, []);
  for (const [code, info] of Object.entries(db)) {
    for (const r of info.requisitos) {
      if (!dep.has(r)) dep.set(r, []);
      dep.get(r)!.push(code);
    }
  }
  return dep;
}

export function downstreamOf(code: string, dependents: Map<string, string[]>): Set<string> {
  const seen = new Set<string>();
  const q = [code];
  while (q.length) {
    const x = q.shift()!;
    for (const k of dependents.get(x) ?? []) {
      if (!seen.has(k)) {
        seen.add(k);
        q.push(k);
      }
    }
  }
  seen.delete(code);
  return seen;
}

export function normalizeCompleted(
  set: Set<string>,
  db: Record<string, CourseInfo>
): Set<string> {
  let changed = true;
  const s = new Set(set);
  while (changed) {
    changed = false;
    for (const c of [...s]) {
      const reqs = db[c]?.requisitos ?? [];
      if (reqs.length > 0 && !reqs.every((r) => s.has(r))) {
        s.delete(c);
        changed = true;
      }
    }
  }
  return s;
}
