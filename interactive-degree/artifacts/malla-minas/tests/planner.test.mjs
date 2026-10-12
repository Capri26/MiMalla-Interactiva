import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planRoute, DEFAULT_SETTINGS } from '../src/lib/planner.ts';
import { COURSE_DB } from '../src/data/courses.ts';
const settings = changes => ({ ...DEFAULT_SETTINGS, year: 2027, term: 1, min: 0, max: 12, ...changes });
const course = (creditos, requisitos = []) => ({ nombre: 'Ramo', creditos, requisitos });
function verify(route, initial, db) {
  const done = new Set(initial);
  for (const term of route.terms) {
    assert.ok(term.credits <= term.limits.max);
    assert.equal(term.credits, term.courses.reduce((n,c) => n + db[c].creditos, 0));
    for (const c of term.courses) {
      assert.ok(!done.has(c));
      assert.ok(db[c].requisitos.every(r => done.has(r)), `${c} requires previous-semester completion`);
    }
    term.courses.forEach(c => done.add(c));
  }
}
test('full curriculum and delayed progress never violate requirements or credits', () => {
  for (const max of [6, 18, 24, 30, 36]) {
    for (const initial of [[], ['MA1001', 'MA1101', 'FI1000', 'CC1000']]) {
      for (const mode of ['fast', 'light']) {
        const route = planRoute(new Set(initial), settings({ max, min: Math.min(18, max) }), mode);
        verify(route, initial, COURSE_DB);
        if (max >= 30) assert.equal(route.remaining.length, 0);
        else assert.ok(route.remaining.includes('MI6919'));
      }
    }
  }
});
test('a prerequisite cannot be completed in the same semester as its dependent', () => {
  const db = { A: course(6), B: course(6, ['A']), C: course(6, ['B']) };
  const route = planRoute(new Set(), settings(), 'fast', db);
  assert.deepEqual(route.terms.map(t => t.courses), [['A'], ['B'], ['C']]);
});
test('a temporary low maximum waits for the normal limit to resume', () => {
  const db = { A: course(6) };
  const route = planRoute(new Set(), settings({ overrides: { 1: { min: 0, max: 3 } } }), 'fast', db);
  assert.deepEqual(route.terms.map(t => t.courses), [[], ['A']]);
  assert.equal(route.remaining.length, 0);
});
test('postponement and confirmed semester offer are respected', () => {
  const db = { A: course(6) };
  const route = planRoute(new Set(), settings({ rules: { A: { earliest: 3, offered: 'second' } } }), 'fast', db);
  assert.equal(route.terms.at(-1).index, 4);
  assert.equal(route.terms.at(-1).term, 2);
});
test('future higher credit override can fit the thesis', () => {
  const db = { T: course(30) };
  const route = planRoute(new Set(), settings({ overrides: { 3: { min: 0, max: 30 } } }), 'fast', db);
  assert.equal(route.terms.at(-1).index, 3);
  assert.equal(route.remaining.length, 0);
});
test('cycles and unknown requirements remain unassigned without looping', () => {
  const db = { A: course(6, ['B']), B: course(6, ['A']), C: course(6, ['missing']), D: course(6, ['A']), E: course(6) };
  const route = planRoute(new Set(), settings(), 'fast', db);
  assert.deepEqual(route.terms[0].courses, ['E']);
  assert.equal(route.remaining.length, 4);
  assert.ok(route.warnings.length);
});
test('zero credit exams still follow prerequisites', () => {
  const db = { A: course(0), B: course(0, ['A']) };
  const route = planRoute(new Set(), settings(), 'fast', db);
  assert.equal(route.terms.length, 2);
  verify(route, [], db);
});
test('invalid intervals fail clearly, unattainable minimum is only a warning', () => {
  assert.ok(planRoute(new Set(), settings({ min: 18, max: 12 })).error);
  assert.ok(planRoute(new Set(), settings({ max: 6.5 })).error);
  const route = planRoute(new Set(), settings({ min: 12 }), 'fast', { A: course(3) });
  assert.equal(route.remaining.length, 0);
  assert.equal(route.terms[0].credits, 3);
  assert.ok(route.terms[0].warnings.length);
});
test('priority favors unlocks over isolated credits', () => {
  const db = { A: course(6), B: course(6), C: course(6, ['B']), D: course(6, ['C']) };
  const route = planRoute(new Set(), settings({ max: 6 }), 'fast', db);
  assert.deepEqual(route.terms[0].courses, ['B']);
});
test('already completed curriculum produces no future terms', () => {
  assert.equal(planRoute(new Set(Object.keys(COURSE_DB)), settings()).terms.length, 0);
});
