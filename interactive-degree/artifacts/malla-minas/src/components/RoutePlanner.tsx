import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Download, Route as RouteIcon, Sparkles, SlidersHorizontal } from "lucide-react";
import { COURSE_DB } from "../data/courses";
import { DEFAULT_SETTINGS, planRoute, validLimits, type PlannerSettings, type Limits } from "../lib/planner";

const KEY = "malla_minas_route_v1";
function parseSettings(value: unknown): PlannerSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Preferencias inválidas");
  const s = value as PlannerSettings;
  if (!validLimits(s) || !Number.isInteger(s.year) || s.year < 2000 || s.year > 2200 || ![1,2].includes(s.term) || !Number.isInteger(s.currentSemester) || s.currentSemester < 1 || s.currentSemester > 40) throw new Error("Preferencias inválidas");
  const overrides: PlannerSettings["overrides"] = {};
  const rules: PlannerSettings["rules"] = {};
  for (const [i, limits] of Object.entries(s.overrides ?? {})) {
    if (!Number.isInteger(+i) || +i < 1 || +i > 40 || !limits || !validLimits(limits)) throw new Error("Carga personalizada inválida");
    overrides[+i] = { min: limits.min, max: limits.max };
  }
  for (const [c, rule] of Object.entries(s.rules ?? {})) {
    if (!COURSE_DB[c] || !rule || typeof rule !== "object" || (rule.earliest !== undefined && (!Number.isInteger(rule.earliest) || rule.earliest < 1 || rule.earliest > 40)) || (rule.offered !== undefined && !["both", "first", "second"].includes(rule.offered))) throw new Error("Preferencia de ramo inválida");
    rules[c] = { earliest: rule.earliest, offered: rule.offered };
  }
  return { min: s.min, max: s.max, year: s.year, term: s.term, currentSemester: s.currentSemester, overrides, rules };
}
function load(): PlannerSettings {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (value) return parseSettings(value);
  } catch { /* Keep the curriculum usable if stored preferences cannot be read. */ }
  return { ...DEFAULT_SETTINGS };
}

export default function RoutePlanner({ completed, onImportCompleted }: { completed: Set<string>; onImportCompleted: (codes: string[]) => void }) {
  const [settings, setSettings] = useState(load);
  const [generated, setGenerated] = useState(() => { try { return localStorage.getItem(KEY) !== null; } catch { return false; } });
  const [mode, setMode] = useState<"fast" | "light">(() => { try { return localStorage.getItem(KEY + "_mode") === "light" ? "light" : "fast"; } catch { return "fast"; } });
  const [storageError, setStorageError] = useState(false);
  const [course, setCourse] = useState("");
  const [search, setSearch] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [customSemester, setCustomSemester] = useState(1);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(settings)); setStorageError(false); } catch { setStorageError(true); } }, [settings]);
  useEffect(() => { try { localStorage.setItem(KEY + "_mode", mode); } catch { setStorageError(true); } }, [mode]);
  const fast = useMemo(() => planRoute(completed, settings), [completed, settings]);
  const light = useMemo(() => planRoute(completed, settings, "light"), [completed, settings]);
  const route = mode === "fast" ? fast : light;
  const pending = Object.keys(COURSE_DB).filter(c => !completed.has(c));
  const remainingCredits = pending.reduce((n, c) => n + COURSE_DB[c].creditos, 0);
  const update = (key: keyof PlannerSettings, value: number) => setSettings(s => ({ ...s, [key]: value }));
  const override = (i: number, key: keyof Limits, value: number) => setSettings(s => ({ ...s, overrides: { ...s.overrides, [i]: { ...(s.overrides[i] ?? { min: s.min, max: s.max }), [key]: value } } }));
  const editRule = (key: "earliest" | "offered", value: number | string) => setSettings(s => ({ ...s, rules: { ...s.rules, [course]: { ...s.rules[course], [key]: value } } }));
  const download = () => {
    const data = { version: 1, completed: [...completed], settings, strategy: mode, route };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "mi-ruta-minas.json"; a.click(); URL.revokeObjectURL(url);
  };
  const importBackup = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error("Archivo demasiado grande.");
      const value = JSON.parse(await file.text());
      if (value.version !== 1 || !Array.isArray(value.completed) || value.completed.some((c: unknown) => typeof c !== "string" || !COURSE_DB[c])) throw new Error("Respaldo inválido.");
      const next = parseSettings(value.settings);
      onImportCompleted(value.completed);
      setSettings(next); setMode(value.strategy === "light" ? "light" : "fast"); setGenerated(true);
      setImportMessage("Ruta y progreso restaurados. La ruta se recalculó con tus preferencias.");
    } catch { setImportMessage("No se pudo importar. Usa el archivo JSON descargado desde este planificador."); }
  };
  const finish = route.terms.at(-1);
  return <section className="planner" id="mi-ruta" aria-labelledby="planner-title">
    <div className="planner-heading"><div><span className="eyebrow"><RouteIcon size={15} /> TU PRÓXIMO PASO</span><h2 id="planner-title">Mi ruta para terminar<span>.</span></h2><p>Tu malla cuenta lo que falta. Aquí decides cómo avanzar.</p></div><span className="planner-badge"><Sparkles size={15} /> Hecha para tu progreso</span></div>
    <div className="planner-layout">
      <aside className="planner-controls">
        <h3><SlidersHorizontal size={18} /> Define tu ritmo</h3>
        <p className="help">El máximo es un límite estricto. El mínimo es tu objetivo; puede no alcanzarse.</p>
        <div className="field-pair"><label>Desde el año<input type="number" min="2000" max="2200" value={settings.year} onChange={e => update("year", +e.target.value)} /></label><label>Período<select value={settings.term} onChange={e => update("term", +e.target.value)}><option value={1}>1.er semestre</option><option value={2}>2.º semestre</option></select></label></div>
        <label>Mi semestre de carrera<input type="number" min="1" max="40" value={settings.currentSemester} onChange={e => update("currentSemester", +e.target.value)} /><span className="help">Permite identificar los ramos atrasados.</span></label>
        <div className="field-pair"><label>Mínimo de créditos<input type="number" min="0" max="60" value={settings.min} onChange={e => update("min", +e.target.value)} /></label><label>Máximo de créditos<input type="number" min="1" max="60" value={settings.max} onChange={e => update("max", +e.target.value)} /></label></div>
        <div className="credit-presets">{[[12, 18], [18, 24], [24, 30]].map(([min, max]) => <button key={max} className="btn" onClick={() => setSettings(s => ({ ...s, min, max }))}>{min}–{max} cr</button>)}</div>
        <details><summary>Cargas distintas por semestre</summary><p className="help">S1 es el primer semestre de tu ruta. Los demás usan tu intervalo general.</p>{Object.keys(settings.overrides).map(Number).sort((a,b) => a-b).map(i => <div className="override-row" key={i}><strong>S{i}</strong><input aria-label={`Mínimo S${i}`} type="number" min="0" max="60" value={settings.overrides[i].min} onChange={e => override(i, "min", +e.target.value)} /><span>–</span><input aria-label={`Máximo S${i}`} type="number" min="1" max="60" value={settings.overrides[i].max} onChange={e => override(i, "max", +e.target.value)} /><button className="btn" aria-label={`Quitar carga S${i}`} onClick={() => setSettings(s => { const overrides = { ...s.overrides }; delete overrides[i]; return { ...s, overrides }; })}>×</button></div>)}<label>Semestre que quiero personalizar<input type="number" min="1" max="40" value={customSemester} onChange={e => setCustomSemester(+e.target.value)} /></label><button className="btn" disabled={!Number.isInteger(customSemester) || customSemester < 1 || customSemester > 40} onClick={() => override(customSemester, "max", settings.max)}>+ Personalizar S{customSemester}</button></details>
        <details><summary>Oferta y ramos que quiero posponer</summary><label>Buscar ramo<input type="search" placeholder="Nombre o código" value={search} onChange={e => setSearch(e.target.value)} /></label><label>Ramo<select value={course} onChange={e => setCourse(e.target.value)}><option value="">Seleccionar…</option>{pending.filter(c => `${c} ${COURSE_DB[c].nombre}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(c => <option key={c} value={c}>{c} · {COURSE_DB[c].nombre}</option>)}</select></label>{course && <><label>Ofrecido en<select value={settings.rules[course]?.offered ?? "both"} onChange={e => editRule("offered", e.target.value)}><option value="both">Ambos períodos (supuesto)</option><option value="first">Solo primer semestre</option><option value="second">Solo segundo semestre</option></select></label><label>Tomarlo desde S…<input type="number" min="1" max="40" value={settings.rules[course]?.earliest ?? 1} onChange={e => editRule("earliest", +e.target.value)} /></label></>}<p className="help">{Object.keys(settings.rules).length} ramos con preferencias guardadas. No modifica tu malla.</p></details>
        <button className="btn btn-primary generate-btn" onClick={() => setGenerated(true)}>Generar mi ruta <ArrowRight size={17} /></button>
        <label className="backup-import">Restaurar ruta y progreso<input type="file" accept=".json,application/json" onChange={e => { void importBackup(e.target.files?.[0]); e.target.value = ""; }} /></label>
        {importMessage && <p className="help" role="status">{importMessage}</p>}
        {storageError && <p className="warning" role="alert">El navegador no permite guardar. Descarga tu ruta para conservarla.</p>}
      </aside>
      <div className="planner-result" aria-live="polite">
        {!generated ? <div className="planner-empty"><CalendarDays size={42} /><h3>Un semestre a la vez.</h3><p>Define tu carga y descubre qué ramos conviene priorizar para abrir el camino a los siguientes.</p><div className="empty-stats"><strong>{pending.length} ramos pendientes</strong><span>{remainingCredits} créditos por completar</span></div></div> : <>
          <div className="route-tabs" role="group" aria-label="Estrategia de planificación"><button aria-pressed={mode === "fast"} onClick={() => setMode("fast")} className={mode === "fast" ? "active" : ""}>Avanzar más rápido <small>{fast.error ? "Revisar límites" : `${fast.terms.length} semestres${fast.remaining.length ? " · parcial" : ""}`}</small></button><button aria-pressed={mode === "light"} onClick={() => setMode("light")} className={mode === "light" ? "active" : ""}>Menor carga <small>{light.error ? "Revisar límites" : `${light.terms.length} semestres${light.remaining.length ? " · parcial" : ""}`}</small></button></div>
          {route.error ? <p className="warning" role="alert">{route.error}</p> : <>
            <div className="route-summary"><div><strong>{remainingCredits}</strong><span>créditos pendientes</span></div><div><strong>{route.terms.length}</strong><span>semestres {route.remaining.length ? "planificados" : "estimados"}</span></div><div><strong>{!pending.length ? "¡Completada!" : !route.remaining.length && finish ? `${finish.year} · ${finish.term}` : "Por resolver"}</strong><span>término proyectado</span></div></div>
            <p className="route-assumptions">Propuesta aproximada: prioriza ramos que desbloquean otros y ramos atrasados. Supone aprobación de cada semestre y oferta en ambos períodos salvo tus ajustes. No contempla horarios, cupos ni correquisitos que no figuren en la malla. En menor carga, un ramo pesado puede superar el mínimo objetivo, pero nunca el máximo.</p>
            {route.warnings.map(w => <p className="warning" key={w}>{w}</p>)}
            {!!route.remaining.length && <details className="unassigned"><summary>Ver ramos sin asignar ({route.remaining.length})</summary>{route.remaining.map(c => <p key={c}>{c} · {COURSE_DB[c].nombre} · {COURSE_DB[c].creditos} cr</p>)}</details>}
            {!pending.length && <div className="planner-empty"><Sparkles size={38} /><h3>¡Todos los ramos están aprobados!</h3><p>Tu ruta académica está completa según esta malla.</p></div>}
            <div className="route-timeline">{route.terms.map(t => <article className="route-term" key={t.index}><header><div><span className="eyebrow">SEMESTRE {t.index}</span><h3>{t.year} <span>· {t.term === 1 ? "Primer" : "Segundo"} semestre</span></h3></div><strong className="term-credits">{t.credits}<small> / {t.limits.max} cr</small></strong></header><div className="term-meter"><span style={{ width: `${t.credits / t.limits.max * 100}%` }} /></div><ul>{t.courses.map(c => <li key={c}><div><span className="route-code">{c}</span><strong>{COURSE_DB[c].nombre}</strong><p>{route.reasons[c]}</p></div><span className="badge-cr">{COURSE_DB[c].creditos} cr</span></li>)}</ul>{t.warnings.map(w => <p className="term-warning" key={w}>{w}</p>)}</article>)}</div>
            <div className="route-bottom"><span>Se actualiza al cambiar tu progreso o tus preferencias.</span><button className="btn" onClick={download}><Download size={15} /> Descargar ruta y progreso</button></div>
          </>}
        </>}
      </div>
    </div>
  </section>;
}
