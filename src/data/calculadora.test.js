import { computeProtein, buildMealPlan } from './calculadora';

// Spec formal en MASTER_PROMPT.md §Algoritmo:
// coef base { muscle/recomp/lose: 1.6, maintain: 1.4 }
// + training { strength_high: +0.2, strength_some: 0, none: -0.2 }
// + activity { very_active: +0.1, moderate: 0, sedentary: -0.1 }
// clamp [1.2, 2.0]; baseWeight según objetivo; grams = round(baseWeight * coef)

const base = {
  goal: 'maintain',
  weight: 75,
  target: 78,
  training: 'strength_some',
  activity: 'moderate',
  currentIntake: 60,
};

test('coeficiente base por objetivo', () => {
  expect(computeProtein({ ...base, goal: 'muscle' }).coef).toBe(1.6);
  expect(computeProtein({ ...base, goal: 'recomp' }).coef).toBe(1.6);
  expect(computeProtein({ ...base, goal: 'lose' }).coef).toBe(1.6);
  expect(computeProtein({ ...base, goal: 'maintain' }).coef).toBe(1.4);
});

test('deltas de entrenamiento y actividad se suman', () => {
  const r = computeProtein({ ...base, goal: 'muscle', training: 'strength_high', activity: 'very_active' });
  // 1.6 + 0.2 + 0.1 = 1.9
  expect(r.coef).toBe(1.9);
});

test('clamp superior en 2.0', () => {
  // maintain 1.4 con máximos: 1.4+0.2+0.1 = 1.7 (no clampa);
  // muscle con máximos: 1.6+0.2+0.1 = 1.9 (no clampa) — forzar el clamp inferior:
  const low = computeProtein({ ...base, goal: 'maintain', training: 'none', activity: 'sedentary' });
  // 1.4 - 0.2 - 0.1 = 1.1 → clamp a 1.2
  expect(low.coef).toBe(1.2);
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

test('grams, rda, gap y status coherentes', () => {
  const r = computeProtein({ ...base, goal: 'muscle', weight: 75, target: 78 });
  // coef 1.6, baseWeight max(75, min(78, 80)) = 78 → grams = round(78*1.6) = 125
  expect(r.grams).toBe(125);
  expect(r.rda).toBe(60); // round(75*0.8)
  expect(r.gap).toBe(65); // 125-60 de ingesta actual 60
  expect(r.status).toBe('between'); // 60 >= rda(60) pero < grams
});

test('status below y above', () => {
  expect(computeProtein({ ...base, currentIntake: 10 }).status).toBe('below');
  expect(computeProtein({ ...base, currentIntake: 300 }).status).toBe('above');
});

test('gap nunca es negativo', () => {
  expect(computeProtein({ ...base, currentIntake: 300 }).gap).toBe(0);
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
  // El plan reparte comida + shakes; el total debe quedar cerca de la meta
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
