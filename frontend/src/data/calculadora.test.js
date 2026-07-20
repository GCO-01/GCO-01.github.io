import {
  computeProtein,
  buildMealPlan,
  intakeForPattern,
  selectCitation,
  CITATIONS,
} from './calculadora';

// Fase 1 (spec VAGGO_Calculadora):
// BASE_COEF { muscle: 1.6, recomp/lose: 1.3, maintain: 1.4 }
// + training { strength_high: +0.2, strength_some: 0, none: -0.2 }
// (ACTIVITY_DELTA eliminado — no afecta el coef)
// piso general 1.0, piso 1.2 exclusivo de age 'over65'; rda sobre baseWeight.

const base = {
  goal: 'maintain',
  weight: 75,
  target: 78,
  training: 'strength_some',
  activity: 'moderate',
  currentIntake: 60,
  age: 'under65',
};

test('coeficiente base por objetivo (T1.3: recomp/lose = 1.3)', () => {
  expect(computeProtein({ ...base, goal: 'muscle' }).coef).toBe(1.6);
  expect(computeProtein({ ...base, goal: 'recomp' }).coef).toBe(1.3);
  expect(computeProtein({ ...base, goal: 'lose' }).coef).toBe(1.3);
  expect(computeProtein({ ...base, goal: 'maintain' }).coef).toBe(1.4);
});

test('solo el delta de entrenamiento afecta el coef (T1.2: sin activity)', () => {
  const r = computeProtein({ ...base, goal: 'muscle', training: 'strength_high', activity: 'very_active' });
  // 1.6 + 0.2 = 1.8 (la actividad ya no suma)
  expect(r.coef).toBe(1.8);
});

test('T1.2: dos usuarios idénticos salvo actividad obtienen el mismo grams/coef', () => {
  const a = computeProtein({ ...base, goal: 'muscle', activity: 'sedentary' });
  const b = computeProtein({ ...base, goal: 'muscle', activity: 'very_active' });
  expect(a.coef).toBe(b.coef);
  expect(a.grams).toBe(b.grams);
});

test('T1.1: adulto mayor recibe piso 1.2 cuando la combinación daría menos', () => {
  // recomp 1.3 - 0.2 (none) = 1.1
  const under = computeProtein({ ...base, goal: 'recomp', training: 'none', age: 'under65' });
  expect(under.coef).toBe(1.1);
  expect(under.coefFloorApplied).toBe(false);

  const over = computeProtein({ ...base, goal: 'recomp', training: 'none', age: 'over65' });
  expect(over.coef).toBe(1.2);
  expect(over.coefFloorApplied).toBe(true);
});

test('T1.1: el piso de edad no altera coeficientes que ya superan 1.2', () => {
  const over = computeProtein({ ...base, goal: 'muscle', age: 'over65' });
  expect(over.coef).toBe(1.6);
  expect(over.coefFloorApplied).toBe(false);
});

test('baseWeight: lose/recomp usan el menor entre peso y objetivo', () => {
  const r = computeProtein({ ...base, goal: 'lose', weight: 90, target: 80 });
  expect(r.baseWeight).toBe(80);
});

test('baseWeight: muscle limita el objetivo a peso+5', () => {
  const r = computeProtein({ ...base, goal: 'muscle', weight: 70, target: 90 });
  expect(r.baseWeight).toBe(75); // min(90, 70+5)
});

test('baseWeight: maintain usa el peso actual', () => {
  const r = computeProtein({ ...base, goal: 'maintain', weight: 75, target: 60 });
  expect(r.baseWeight).toBe(75);
});

test('T1.5: rda se calcula sobre baseWeight, no sobre weight', () => {
  // muscle weight 75, target 78 → baseWeight 78 → rda = round(78*0.8) = 62
  const r = computeProtein({ ...base, goal: 'muscle', weight: 75, target: 78 });
  expect(r.baseWeight).toBe(78);
  expect(r.rda).toBe(62);
  expect(r.grams).toBe(125); // round(78 * 1.6)
  expect(r.gap).toBe(65); // 125 - 60
});

test('status below/above', () => {
  expect(computeProtein({ ...base, currentIntake: 10 }).status).toBe('below');
  expect(computeProtein({ ...base, currentIntake: 300 }).status).toBe('above');
});

test('gap nunca es negativo', () => {
  expect(computeProtein({ ...base, currentIntake: 300 }).gap).toBe(0);
});

test('T1.6: intakeForPattern escala con el peso', () => {
  expect(intakeForPattern('average', 70)).toBe(Math.round(70 * 1.17)); // 82
  expect(intakeForPattern('average', 90)).toBe(Math.round(90 * 1.17)); // 105
  expect(intakeForPattern('low', 70)).toBe(Math.round(70 * 0.85));
  expect(intakeForPattern('conscious', 70)).toBe(Math.round(70 * 1.35));
  // dos pesos distintos, mismo patrón → gramaje absoluto distinto
  expect(intakeForPattern('average', 70)).not.toBe(intakeForPattern('average', 90));
  // custom no tiene valor derivado
  expect(intakeForPattern('custom', 70)).toBeNull();
});

test('T1.4: cada rama de cita es alcanzable', () => {
  // adulto mayor con piso aplicado → newman
  expect(selectCitation({ coef: 1.2, goal: 'recomp', age: 'over65', coefFloorApplied: true })).toBe(CITATIONS.newman);
  // coef alto → morton
  expect(selectCitation({ coef: 1.8, goal: 'muscle', age: 'under65', coefFloorApplied: false })).toBe(CITATIONS.morton);
  // recomp/lose → wycherley (fuente específica de recomposición)
  expect(selectCitation({ coef: 1.3, goal: 'recomp', age: 'under65', coefFloorApplied: false })).toBe(CITATIONS.wycherley);
  expect(selectCitation({ coef: 1.5, goal: 'lose', age: 'under65', coefFloorApplied: false })).toBe(CITATIONS.wycherley);
  // salud general 1.4–1.6 → phillips (deja de ser código muerto)
  expect(selectCitation({ coef: 1.4, goal: 'maintain', age: 'under65', coefFloorApplied: false })).toBe(CITATIONS.phillips);
  // fallback < 1.4 → patrick
  expect(selectCitation({ coef: 1.2, goal: 'maintain', age: 'under65', coefFloorApplied: false })).toBe(CITATIONS.patrick);
});

test('buildMealPlan: 1 shake hasta 100g, 2 shakes por encima', () => {
  const plan1 = buildMealPlan({ grams: 90 });
  const shakes1 = plan1.meals.flatMap(m => m.items).filter(i => i.isShake);
  expect(shakes1).toHaveLength(1);

  const plan2 = buildMealPlan({ grams: 140 });
  const shakes2 = plan2.meals.flatMap(m => m.items).filter(i => i.isShake);
  expect(shakes2).toHaveLength(2);
  expect(plan2.meals.some(m => m.name === 'Post-entreno')).toBe(true);
});

test('buildMealPlan: el total de gramos cubre aproximadamente la meta', () => {
  const grams = 140;
  const plan = buildMealPlan({ grams });
  expect(plan.total.grams).toBeGreaterThanOrEqual(grams - 5);
  expect(plan.total.kcal).toBeGreaterThan(0);
});

test('buildMealPlan: mínimos de comida se respetan con metas bajas', () => {
  const plan = buildMealPlan({ grams: 40 });
  const food = plan.meals.flatMap(m => m.items).filter(i => !i.isShake);
  for (const item of food) {
    expect(item.grams).toBeGreaterThanOrEqual(5);
  }
});
