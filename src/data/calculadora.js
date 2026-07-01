// Phillips et al. 2016, Morton et al. 2018
const BASE_COEF = { muscle: 1.6, recomp: 1.6, lose: 1.6, maintain: 1.4 };
const TRAINING_DELTA = { strength_high: 0.2, strength_some: 0, none: -0.2 };
const ACTIVITY_DELTA = { very_active: 0.1, moderate: 0, sedentary: -0.1 };
const DIET_BUMP = { vegan: 1.1, vegetarian: 1.05, omnivore: 1.0 };

export function computeProtein(state) {
  const { goal, weight, target, diet, training, activity, currentIntake } = state;

  let coef = BASE_COEF[goal] ?? 1.4;
  coef += TRAINING_DELTA[training] ?? 0;
  coef += ACTIVITY_DELTA[activity] ?? 0;
  coef = Math.max(1.2, Math.min(2.0, coef));

  const bump = DIET_BUMP[diet] ?? 1.0;

  let baseWeight;
  if (goal === 'lose' || goal === 'recomp') baseWeight = Math.min(weight, target);
  else if (goal === 'muscle') baseWeight = Math.max(weight, Math.min(target, weight + 5));
  else baseWeight = weight;

  const grams = Math.round(baseWeight * coef * bump);
  const rda = Math.round(weight * 0.8);
  const gap = Math.max(0, grams - currentIntake);
  const monthlyKg = +(gap * 30 / 1000).toFixed(1);

  let status;
  if (currentIntake >= grams) status = 'above';
  else if (currentIntake >= rda) status = 'between';
  else status = 'below';

  return {
    grams,
    rda,
    coef: +(coef * bump).toFixed(2),
    baseWeight,
    proteinKcal: grams * 4,
    surplus: grams - rda,
    currentIntake,
    gap,
    monthlyKg,
    status,
  };
}

export function buildMealPlan({ grams, diet }) {
  const numShakes = grams > 100 ? 2 : 1;
  const shakeBudget = numShakes * 30;
  const foodBudget = Math.max(20, grams - shakeBudget);

  const breakfast = Math.max(5, Math.round(foodBudget * 0.30));
  const lunch = Math.max(8, Math.round(foodBudget * 0.45));
  const dinner = Math.max(5, foodBudget - breakfast - lunch);

  const isVegan = diet === 'vegan';
  const isVegetarian = diet === 'vegetarian';

  const meals = [
    {
      name: 'Desayuno',
      emoji: '🌅',
      items: [
        { label: 'Shake Chocolate', grams: 30, kcal: 189, isShake: true, flavor: 'chocolate', emoji: '🥤' },
        isVegan
          ? { label: 'Avena con plátano y mantequilla de maní', grams: breakfast, kcal: Math.round(breakfast * 5.5), emoji: '🥣' }
          : { label: 'Huevos revueltos con palta', grams: breakfast, kcal: Math.round(breakfast * 6), emoji: '🍳' },
      ],
    },
    {
      name: 'Almuerzo',
      emoji: '☀️',
      items: isVegan
        ? [{ label: 'Bowl quinoa, lentejas y tofu + palta', grams: lunch, kcal: Math.round(lunch * 5), emoji: '🥗' }]
        : isVegetarian
          ? [{ label: 'Legumbres con huevo + ensalada', grams: lunch, kcal: Math.round(lunch * 5.5), emoji: '🥗' }]
          : [{ label: 'Pechuga de pollo + arroz integral y camote', grams: lunch, kcal: Math.round(lunch * 6), emoji: '🍗' }],
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
    items: isVegan
      ? [{ label: 'Tempeh salteado + camote y edamame', grams: dinner, kcal: Math.round(dinner * 5), emoji: '🥦' }]
      : isVegetarian
        ? [{ label: 'Tortilla de claras + quinoa y yogurt griego', grams: dinner, kcal: Math.round(dinner * 5.5), emoji: '🥚' }]
        : [{ label: 'Lomo de res + camote y ensalada', grams: dinner, kcal: Math.round(dinner * 6), emoji: '🥩' }],
  });

  const totalGrams = meals.reduce((s, m) => s + m.items.reduce((ss, i) => ss + i.grams, 0), 0);
  const totalKcal = meals.reduce((s, m) => s + m.items.reduce((ss, i) => ss + i.kcal, 0), 0);

  return { meals, total: { grams: totalGrams, kcal: totalKcal } };
}

export const INTAKE_PATTERNS = [
  { id: 'low',       grams: 35,   emoji: '🍞', title: 'Carbs y poco más',     sub: 'Pan, arroz, fideos. Casi nada de proteína animal o legumbres.' },
  { id: 'average',   grams: 60,   emoji: '🍗', title: 'Día promedio peruano',  sub: 'Algún huevo o pollo en una comida, cena ligera.' },
  { id: 'conscious', grams: 95,   emoji: '🥩', title: 'Como consciente',       sub: 'Proteína decente en 2–3 comidas, pero sin contar macros.' },
  { id: 'custom',    grams: null, emoji: '📊', title: 'Cuento mis macros',     sub: 'Quiero ingresar mi número exacto.' },
];

export const RANGE_ROWS = [
  { range: '0.8 g/kg',       label: 'RDA oficial',                   min: 0.8,  max: 0.8,  source: 'phillips' },
  { range: '1.2 – 1.6 g/kg', label: 'Salud general y mantenimiento', min: 1.2,  max: 1.6,  source: 'patrick'  },
  { range: 'mín. 1.2 g/kg',  label: 'Adultos mayores',               min: 1.2,  max: 1.2,  source: 'patrick'  },
  { range: '1.6 g/kg',       label: 'Entrenamiento de resistencia',   min: 1.6,  max: 1.6,  source: 'morton'   },
  { range: '> 1.6 g/kg',     label: 'Recomposición corporal',         min: 1.61, max: 1.99, source: 'morton'   },
  { range: 'hasta 2.2 g/kg', label: 'Atletas de alto rendimiento',    min: 2.0,  max: 2.2,  source: 'patrick'  },
];

export const CITATIONS = {
  morton:  { author: 'Morton et al.',               year: '2018', journal: 'Br. J. Sports Med., 52(6)',              note: '1.6 g/kg maximiza la ganancia de músculo.' },
  phillips:{ author: 'Phillips, Chevalier & Leidy', year: '2016', journal: 'Appl. Physiol. Nutr. Metab., 41(5)',     note: 'La RDA de 0.8 g/kg está obsoleta para adultos activos.' },
  patrick: { author: 'Patrick (FoundMyFitness)',     year: '2024', journal: 'The Science of Protein',                note: 'Rango óptimo 1.2–1.6; atletas hasta 2.2.' },
};
