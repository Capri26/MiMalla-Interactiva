import { useState, useCallback, useMemo, useRef } from "react";
import {
  COURSE_DB,
  SEMESTERS,
  isUnlocked,
  buildDependents,
  downstreamOf,
  normalizeCompleted,
  type Semester,
} from "@/data/courses";

const LS_KEY = "malla_minas_v1";

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x: unknown) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveCompleted(set: Set<string>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...set]));
}

const DEPENDENTS = buildDependents(COURSE_DB);
const ALL_CODES = Object.keys(COURSE_DB);

function groupSpans(semesters: Semester[]) {
  const spans: { group: string; start: number; count: number }[] = [];
  let start = 1;
  let count = 0;
  let cur = semesters[0]?.group ?? "";

  semesters.forEach((s, i) => {
    if (s.group !== cur) {
      spans.push({ group: cur, start, count });
      cur = s.group;
      start = i + 1;
      count = 1;
    } else {
      count++;
    }
  });
  spans.push({ group: cur, start, count });
  return spans;
}

const GROUP_COLORS: Record<string, string> = {
  "PLAN COMÚN": "rgba(119,167,255,0.18)",
  LICENCIATURA: "rgba(53,208,127,0.14)",
  ESPECIALIDAD: "rgba(255,206,106,0.16)",
};

export default function Malla() {
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompleted());
  const [hovered, setHovered] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }, []);

  const handleClick = useCallback(
    (code: string) => {
      const done = completed.has(code);
      const unlocked = isUnlocked(code, completed);

      if (!done && !unlocked) {
        const reqs = COURSE_DB[code]?.requisitos ?? [];
        const missing = reqs.filter((r) => !completed.has(r));
        showToast(`Bloqueado. Faltan: ${missing.map((r) => COURSE_DB[r]?.nombre ?? r).join(", ")}`);
        return;
      }

      let next = new Set(completed);
      if (done) {
        next.delete(code);
        const down = downstreamOf(code, DEPENDENTS);
        let removed = 0;
        for (const d of down) {
          if (next.delete(d)) removed++;
        }
        if (removed > 0) showToast(`Se desmarcaron ${removed} ramo(s) dependiente(s).`);
      } else {
        next.add(code);
      }

      next = normalizeCompleted(next, COURSE_DB);
      saveCompleted(next);
      setCompleted(next);
    },
    [completed, showToast]
  );

  const handleReset = () => {
    const next = new Set<string>();
    saveCompleted(next);
    setCompleted(next);
    showToast("Progreso reseteado.");
  };

  const handleExport = async () => {
    const payload = JSON.stringify([...completed], null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      showToast("¡Copiado al portapapeles!");
    } catch {
      window.prompt("Copia esto:", payload);
    }
  };

  const handleImport = () => {
    const txt = window.prompt("Pega aquí el JSON exportado:");
    if (!txt) return;
    try {
      const arr = JSON.parse(txt);
      if (!Array.isArray(arr)) throw new Error();
      let next = new Set(arr.filter((x: unknown) => typeof x === "string" && COURSE_DB[x as string]));
      next = normalizeCompleted(next, COURSE_DB);
      saveCompleted(next);
      setCompleted(next);
      showToast("¡Importado correctamente!");
    } catch {
      showToast("Error: JSON inválido.");
    }
  };

  const focusedDown = useMemo(
    () => (hovered ? downstreamOf(hovered, DEPENDENTS) : new Set<string>()),
    [hovered]
  );
  const focusedPrereqs = useMemo(
    () => (hovered ? new Set(COURSE_DB[hovered]?.requisitos ?? []) : new Set<string>()),
    [hovered]
  );

  const totalCredits = useMemo(() => {
    return [...completed].reduce((sum, c) => sum + (COURSE_DB[c]?.creditos ?? 0), 0);
  }, [completed]);

  const spans = useMemo(() => groupSpans(SEMESTERS), []);

  const hoverText = useMemo(() => {
    if (!hovered) return "";
    const info = COURSE_DB[hovered];
    if (!info) return "";
    const prereqNames = (info.requisitos ?? [])
      .map((r) => COURSE_DB[r]?.nombre ?? r)
      .join(" · ");
    const nDown = focusedDown.size;
    return `Requisitos directos: ${prereqNames || "Ninguno"} — ${nDown === 0 ? "No desbloquea más ramos." : `Desbloquea ${nDown} ramo(s).`}`;
  }, [hovered, focusedDown]);

  return (
    <div className="malla-root">
      {/* HEADER */}
      <header className="topbar">
        <div>
          <h1>Malla Ingeniería Civil de Minas</h1>
          <p className="muted">Universidad de Chile · FCFM · Haz clic para aprobar · Hover para ver desbloqueos</p>
          <p className="muted" style={{ marginTop: 2, fontSize: 12 }}>No es oficial — solo una simulación para planificar tu carrera.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={handleReset}>Reset</button>
          <button className="btn" onClick={handleExport}>Exportar progreso</button>
          <button className="btn" onClick={handleImport}>Importar progreso</button>
        </div>
      </header>

      {/* LEGEND */}
      <section className="legend">
        <span className="pill"><span className="dot done" /> Aprobado</span>
        <span className="pill"><span className="dot open" /> Disponible</span>
        <span className="pill"><span className="dot lock" /> Bloqueado</span>
        <span className="pill"><span className="dot hi" /> Resaltado (futuro)</span>
        <span className="pill"><span className="dot pre" /> Prerrequisito directo</span>
      </section>

      {/* STATUS */}
      <div className="status-bar">
        <div className="progress-text">
          Aprobados: <strong>{completed.size}</strong> / {ALL_CODES.length} ramos ·{" "}
          <strong>{totalCredits}</strong> créditos acumulados
        </div>
        {hoverText && <div className="hover-hint">{hoverText}</div>}
        {toast && <div className="toast-msg">{toast}</div>}
      </div>

      {/* GRID */}
      <div className="grid-scroll">
        <div
          className="malla-grid"
          style={{ "--cols": SEMESTERS.length } as React.CSSProperties}
        >
          {/* Group bars */}
          {spans.map((s) => (
            <div
              key={s.group}
              className="group-bar"
              style={{
                gridColumn: `${s.start} / span ${s.count}`,
                background: GROUP_COLORS[s.group] ?? "rgba(255,255,255,0.06)",
              }}
            >
              {s.group}
            </div>
          ))}

          {/* Semester columns */}
          {SEMESTERS.map((sem, idx) => {
            const semDone = sem.courses.filter((c) => completed.has(c)).length;
            return (
              <div key={sem.label} className="sem-col" style={{ gridColumn: idx + 1 }}>
                <div className="sem-head">
                  <span className="sem-title">{sem.label}</span>
                  <span className="sem-count">{semDone}/{sem.courses.length}</span>
                </div>
                <div className="courses-list">
                  {sem.courses.map((code) => {
                    const info = COURSE_DB[code];
                    if (!info) return null;
                    const done = completed.has(code);
                    const unlocked = isUnlocked(code, completed);
                    const locked = !done && !unlocked;

                    let cardClass = "course-card";
                    if (hovered) {
                      if (code === hovered) cardClass += " card-focus";
                      else if (focusedPrereqs.has(code)) cardClass += " card-prereq";
                      else if (focusedDown.has(code)) cardClass += " card-highlight";
                      else cardClass += " card-dim";
                    }
                    if (done) cardClass += " card-done";
                    else if (locked) cardClass += " card-locked";
                    else cardClass += " card-open";

                    return (
                      <div
                        key={code}
                        className={cardClass}
                        onClick={() => handleClick(code)}
                        onMouseEnter={() => setHovered(code)}
                        onMouseLeave={() => setHovered(null)}
                        title={
                          info.requisitos.length
                            ? "Requisitos: " +
                              info.requisitos.map((r) => COURSE_DB[r]?.nombre ?? r).join(", ")
                            : undefined
                        }
                      >
                        <div className="card-meta">
                          <span className="card-code">{code}</span>
                          <span className="card-icon">
                            {done ? "✓" : locked ? "🔒" : ""}
                          </span>
                        </div>
                        <p className="card-title">{info.nombre}</p>
                        <div className="card-badges">
                          <span className={`badge-status ${done ? "s-done" : locked ? "s-lock" : "s-open"}`}>
                            {done ? "Aprobado" : locked ? "Bloqueado" : "Disponible"}
                          </span>
                          <span className="badge-cr">{info.creditos} cr</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="footer">
        Malla simulada · Universidad de Chile · FCFM · Ingeniería Civil de Minas
      </footer>
    </div>
  );
}
