// El prompt del coach vive como archivo Markdown editable (coachPrompt.md) y se
// importa como texto crudo (?raw, feature de Vite) → se edita ahí sin tocar lógica.
import COACH_PROMPT_TEMPLATE from './coachPrompt.md?raw';

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

// Patrones de ingesta como GRAMOS ABSOLUTOS por día (cifra poblacional), no
// escalados por peso. El ancla es el dato duro de ELANS:
//   average 79 g/día → consumo real promedio en Perú 78.6–79.8 g/día
//   (Herrera-Cuenca et al., Nutrients 2023). Es una cifra absoluta poblacional
//   (peso promedio ~65–70 kg ≈ 1.1–1.2 g/kg); NO se re-escala por el peso del
//   usuario, porque entonces dejaría de ser "el promedio peruano".
//   low 60 g/día — segmento con menor proteína animal (Ipsos/Perú21 2024, cualitativo);
//   conscious 100 g/día — por encima del promedio (estimación editorial).
export const INTAKE_PATTERNS = [
  { id: 'low',       grams: 60,   emoji: '🍞', title: 'Carbs y poco más',     sub: 'Pan, arroz, fideos. Casi nada de proteína animal (Ipsos 2024).' },
  { id: 'average',   grams: 79,   emoji: '🍗', title: 'Día promedio peruano',  sub: 'El consumo real promedio en Perú: 78.6–79.8 g/día (ELANS 2023).' },
  { id: 'conscious', grams: 100,  emoji: '🥩', title: 'Como consciente',       sub: 'Proteína decente en 2–3 comidas, sin contar macros (estimación).' },
  { id: 'custom',    grams: null, emoji: '📊', title: 'Cuento mis macros',     sub: 'Quiero ingresar mi número exacto.' },
];

// Gramos absolutos de un patrón. `custom` (grams null) → null.
export function intakeForPattern(pattern) {
  const p = typeof pattern === 'string' ? INTAKE_PATTERNS.find(x => x.id === pattern) : pattern;
  if (!p || p.grams == null) return null;
  return p.grams;
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

// ── Etiquetas legibles (para el bloque de datos del prompt) ──────────────────
const GOAL_LABEL = {
  muscle:   'ganar masa muscular',
  recomp:   'recomposición corporal (perder grasa y ganar músculo)',
  lose:     'perder grasa preservando músculo',
  maintain: 'mantener masa muscular',
};
const TRAINING_LABEL = {
  strength_high: 'fuerza 3+ veces por semana',
  strength_some: 'fuerza 1–2 veces por semana',
  none:          'sin entrenamiento de fuerza',
};
const ACTIVITY_LABEL = {
  sedentary:   'vida sedentaria',
  moderate:    'actividad moderada',
  very_active: 'muy activo',
};
const GENDER_LABEL = { male: 'hombre', female: 'mujer', other: 'sin especificar' };

// ── Calorías (Mifflin-St Jeor) — solo para el prompt del coach ───────────────
// La calculadora no pedía altura ni calculaba calorías; se agregó para completar
// el "punto de partida" que el prompt del coach entrega (Beat 1 / bloque de datos).
// La edad se estima con el punto medio del rango elegido (la calculadora usa
// rangos, no edad exacta) → el kcal es un ESTIMADO que el agente recalibra (M6).
const AGE_MIDPOINT = { '18-24': 21, '25-34': 30, '35-44': 40, '45-54': 50, '55-64': 60, '65+': 70 };
const ACTIVITY_BASE = { sedentary: 1.2, moderate: 1.375, very_active: 1.55 };
const TRAINING_BUMP = { none: 0, strength_some: 0.075, strength_high: 0.175 };
// Multiplicador calórico por objetivo (déficit / mantenimiento / superávit).
const CALORIE_GOAL_MULT = { muscle: 1.08, maintain: 1.0, recomp: 0.82, lose: 0.82 };

export function computeCalories(state) {
  const { weight, height = 170, gender, age_range, activity, training, goal } = state;
  const age = AGE_MIDPOINT[age_range] ?? 30;
  // Mifflin-St Jeor sobre el PESO ACTUAL (la TMB depende de la masa real).
  const base = 10 * weight + 6.25 * height - 5 * age;
  const sexConst = gender === 'male' ? 5 : gender === 'female' ? -161 : -78; // 'other' = punto medio
  const tmb = Math.round(base + sexConst);
  // Factor de actividad ≈ Mifflin, combinando actividad general + frecuencia de fuerza.
  const factor = Math.min(1.9, Math.max(1.2,
    (ACTIVITY_BASE[activity] ?? 1.375) + (TRAINING_BUMP[training] ?? 0)));
  const get = Math.round(tmb * factor);
  const kcal = Math.round((get * (CALORIE_GOAL_MULT[goal] ?? 1.0)) / 10) * 10;
  return { tmb, activityFactor: +factor.toFixed(3), get, kcal };
}

// ── Prompt del coach nutricional ─────────────────────────────────────────────
// El texto vive en coachPrompt.md (editable). Aquí solo se RELLENA con los datos
// reales del usuario: el bloque {DATOS_CALCULADORA} (todo lo conocido, para que el
// agente no repregunte) y los placeholders del recap (Beat 1). El usuario lo copia
// y lo pega en su propio asistente IA — no consume tokens de VAGGO.
export function buildCoachPrompt({ result, formData, plan }) {
  const goal     = GOAL_LABEL[formData.goal] ?? formData.goal;
  const training = TRAINING_LABEL[formData.training] ?? formData.training;
  const activity = ACTIVITY_LABEL[formData.activity] ?? formData.activity;
  const gender   = GENDER_LABEL[formData.gender] ?? 'sin especificar';
  const cite     = selectCitation(result);
  const cal      = computeCalories(formData);

  const gapTxt = result.gap > 0
    ? `${result.currentIntake} g/día → brecha de ${result.gap} g/día para llegar a la meta`
    : `${result.currentIntake} g/día (ya cubre la meta)`;

  const meals = (plan?.meals ?? [])
    .map(m => `  · ${m.name}: ${m.items.map(i => `${i.label} (${i.grams} g)`).join(', ')}`)
    .join('\n');

  const datos = `== DATOS DE LA CALCULADORA VAGGO (ya conocidos — NO volver a preguntarlos) ==
El usuario ya completó la calculadora VAGGO. Toma estos datos como confirmados. En el
diagnóstico (M5) pide ÚNICAMENTE lo que falta (peso de hace 3–6 meses, historial médico,
sueño/estrés/alcohol, suplementos, tipos de día). No repreguntes lo de abajo.

- Objetivo: ${goal}
- Peso actual: ${formData.weight} kg · Peso objetivo: ${formData.target} kg · Altura: ${formData.height} cm
- Edad: ${formData.age_range || '—'} · Sexo: ${gender}
- Entrenamiento: ${training} · Actividad general: ${activity}
- Proteína recomendada: ${result.grams} g/día (${result.coef} g/kg sobre ${result.baseWeight} kg de peso base)
- Consumo actual estimado: ${gapTxt}
- Calorías objetivo (estimado): ${cal.kcal} kcal/día — Mifflin-St Jeor: TMB ${cal.tmb} × factor ${cal.activityFactor} = GET ${cal.get}, ajustado por objetivo. Recalibrar con datos reales (M6).
- Plan de comidas base sugerido (~${plan?.total?.grams ?? result.grams} g):
${meals || '  · (sin plan)'}
- Referencia científica de la dosis: ${cite.author} ${cite.year} — ${cite.note}
==`;

  return COACH_PROMPT_TEMPLATE
    .replaceAll('{DATOS_CALCULADORA}', datos)
    .replaceAll('{edad}', formData.age_range || '—')
    .replaceAll('{sexo}', gender)
    .replaceAll('{peso_objetivo}', String(formData.target))
    .replaceAll('{peso}', String(formData.weight))
    .replaceAll('{kcal}', String(cal.kcal))
    .replaceAll('{proteína}', String(result.grams));
}
