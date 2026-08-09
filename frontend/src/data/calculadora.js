// Coeficientes base g/kg por objetivo.
// muscle 1.6 (Morton et al. 2018); maintain 1.4 (Phillips et al. 2016);
// recomp/lose 1.3 — redondeo fiel al ~1.25 g/kg medido en recomposición corporal
// (Wycherley et al. 2012). Decisión de founder: recomp y lose comparten 1.3.
const BASE_COEF = { muscle: 1.6, recomp: 1.3, lose: 1.3, maintain: 1.4 };
const TRAINING_DELTA = { strength_high: 0.2, strength_some: 0, none: -0.2 };
// ACTIVITY_DELTA eliminado (T1.2): Newman et al. 2023 (Health ABC) — el nivel de
// actividad no cambia el requerimiento diario total, solo la eficiencia por comida.
// El campo `activity` se conserva en el formulario como dato de segmentación.

export function computeProtein(state) {
  // `activity` se conserva en el estado (segmentación/lead) pero ya no afecta el coef (T1.2).
  const { goal, weight, target, training, currentIntake, age } = state;

  let coef = BASE_COEF[goal] ?? 1.4;
  coef += TRAINING_DELTA[training] ?? 0;
  // Piso general defensivo por debajo de 1.2 (permite que un <65 recomp/lose sin
  // entreno llegue a 1.1); techo defensivo 2.0 (nunca alcanzado con las opciones).
  coef = Math.max(1.0, Math.min(2.0, coef));

  // T1.1 — adultos mayores: piso de 1.2 g/kg por resistencia anabólica
  // (Moore et al. 2015; Newman et al. 2023). coefFloorApplied indica que ese piso
  // fue el que fijó el coeficiente final (insumo para la cita en CalcResult).
  let coefFloorApplied = false;
  if (age === 'over65' && coef < 1.2) {
    coef = 1.2;
    coefFloorApplied = true;
  }

  let baseWeight;
  if (goal === 'lose' || goal === 'recomp') baseWeight = Math.min(weight, target);
  else if (goal === 'muscle') baseWeight = Math.max(weight, Math.min(target, weight + 5));
  else baseWeight = weight;

  const grams = Math.round(baseWeight * coef);
  // T1.5 — rda sobre la misma base de peso que grams (comparabilidad de las barras).
  const rda = Math.round(baseWeight * 0.8);
  const gap = Math.max(0, grams - currentIntake);

  let status;
  if (currentIntake >= grams) status = 'above';
  else if (currentIntake >= rda) status = 'between';
  else status = 'below';

  return {
    grams,
    rda,
    coef: +coef.toFixed(2),
    baseWeight,
    currentIntake,
    gap,
    status,
    goal,
    age,
    coefFloorApplied,
  };
}

export function buildMealPlan({ grams }) {
  const numShakes = grams > 100 ? 2 : 1;
  const shakeBudget = numShakes * 30;
  const foodBudget = Math.max(20, grams - shakeBudget);

  const breakfast = Math.max(5, Math.round(foodBudget * 0.30));
  const lunch = Math.max(8, Math.round(foodBudget * 0.45));
  const dinner = Math.max(5, foodBudget - breakfast - lunch);

  const meals = [
    {
      name: 'Desayuno',
      emoji: '🌅',
      items: [
        { label: 'Shake Chocolate', grams: 30, kcal: 189, isShake: true, flavor: 'chocolate', emoji: '🥤' },
        { label: 'Huevos revueltos con palta', grams: breakfast, kcal: Math.round(breakfast * 6), emoji: '🍳' },
      ],
    },
    {
      name: 'Almuerzo',
      emoji: '☀️',
      items: [{ label: 'Pechuga de pollo + arroz integral y camote', grams: lunch, kcal: Math.round(lunch * 6), emoji: '🍗' }],
    },
  ];

  if (numShakes >= 2) {
    meals.push({
      name: 'Post-entreno',
      emoji: '💪',
      items: [
        { label: 'Shake Mango + plátano', grams: 30, kcal: 250, isShake: true, flavor: 'mango', emoji: '🥤' },
      ],
    });
  }

  meals.push({
    name: 'Cena',
    emoji: '🌙',
    items: [{ label: 'Lomo de res + camote y ensalada', grams: dinner, kcal: Math.round(dinner * 6), emoji: '🥩' }],
  });

  const totalGrams = meals.reduce((s, m) => s + m.items.reduce((ss, i) => ss + i.grams, 0), 0);
  const totalKcal = meals.reduce((s, m) => s + m.items.reduce((ss, i) => ss + i.kcal, 0), 0);

  return { meals, total: { grams: totalGrams, kcal: totalKcal } };
}

// T1.6 — patrones de ingesta como función del peso (g/kg × peso), no valores fijos.
// low 0.85 (segmento con restricción económica, Ipsos/Perú21 2024);
// average 1.17 (consumo real peruano ~1.1–1.2 g/kg, ELANS/Herrera-Cuenca 2023);
// conscious 1.35 (estimación editorial: por encima del promedio real).
export const INTAKE_PATTERNS = [
  { id: 'low',       mult: 0.85, emoji: '🍞', title: 'Carbs y poco más',     sub: 'Pan, arroz, fideos. Casi nada de proteína animal (Ipsos/Perú21 2024).' },
  { id: 'average',   mult: 1.17, emoji: '🍗', title: 'Día promedio peruano',  sub: 'Algún huevo o pollo en una comida, cena ligera (ELANS 2023).' },
  { id: 'conscious', mult: 1.35, emoji: '🥩', title: 'Como consciente',       sub: 'Proteína decente en 2–3 comidas, sin contar macros (estimación).' },
  { id: 'custom',    mult: null, emoji: '📊', title: 'Cuento mis macros',     sub: 'Quiero ingresar mi número exacto.' },
];

// Gramos absolutos de un patrón para un peso dado. `custom` (mult null) → null.
export function intakeForPattern(pattern, weight) {
  const p = typeof pattern === 'string' ? INTAKE_PATTERNS.find(x => x.id === pattern) : pattern;
  if (!p || p.mult === null) return null;
  return Math.round(weight * p.mult);
}

export const CITATIONS = {
  morton:   { author: 'Morton et al.',               year: '2018', journal: 'Br. J. Sports Med., 52(6)',            note: '~1.6 g/kg maximiza la ganancia muscular (techo prudente 2.2).' },
  phillips: { author: 'Phillips, Chevalier & Leidy', year: '2016', journal: 'Appl. Physiol. Nutr. Metab., 41(5)',   note: 'La RDA de 0.8 g/kg está obsoleta; el óptimo de salud es 1.2–1.6.' },
  patrick:  { author: 'Patrick (FoundMyFitness)',    year: '2024', journal: 'The Science of Protein',              note: 'Rango óptimo 1.2–1.6 g/kg para salud general.' },
  moore:    { author: 'Moore et al.',                year: '2015', journal: 'J. Gerontol. A Biol. Sci. Med. Sci., 70(1)', note: 'Los adultos mayores requieren ~0.40 g/kg por comida (vs. 0.24 en jóvenes).' },
  newman:   { author: 'Newman et al.',               year: '2023', journal: 'J. Gerontol. A Biol. Sci. Med. Sci., 78(11)', note: 'En adultos mayores, ≥1.2 g/kg/día preserva músculo (Health ABC).' },
  wycherley:{ author: 'Wycherley et al.',            year: '2012', journal: 'Am. J. Clin. Nutr., 96(6)',            note: 'Recomposición: ~1.25 g/kg/día preserva masa magra en déficit.' },
  nunes:    { author: 'Nunes et al.',                year: '2022', journal: 'J. Cachexia Sarcopenia Muscle, 13(2)', note: '<65: ≥1.6 g/kg/día; ≥65: 1.2–1.59 g/kg/día (74 RCTs).' },
  elans:    { author: 'Herrera-Cuenca et al. (ELANS)', year: '2023', journal: 'Nutrients, 15, 669',                note: 'El consumo promedio en Perú (~1.1–1.2 g/kg) está en el borde inferior del óptimo.' },
  ipsos:    { author: 'Ipsos / Perú21',              year: '2024', journal: 'Situación Social — Alimentación',      note: 'Solo 1 de cada 3 peruanos come proteína animal a diario.' },
};

// T1.4 — selección de cita según el resultado. Cada rama es alcanzable:
// newman (adulto mayor con piso 1.2), morton (coef ≥ 1.6), wycherley (recomp/lose),
// phillips (salud general 1.4–1.6), patrick (fallback < 1.4).
export function selectCitation({ coef, goal, age, coefFloorApplied }) {
  if (age === 'over65' && coefFloorApplied) return CITATIONS.newman;
  if (coef >= 1.6) return CITATIONS.morton;
  if (goal === 'recomp' || goal === 'lose') return CITATIONS.wycherley;
  if (coef >= 1.4) return CITATIONS.phillips;
  return CITATIONS.patrick;
}
