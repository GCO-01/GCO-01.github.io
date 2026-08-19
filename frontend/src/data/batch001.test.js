import { isStepValid } from '../components/batch001/BatchForm';

// Founding Batch #001 — tests de validación por paso (table-driven, mismo
// estilo que calculadora.test.js).

const base = {
  fullName: '',
  age: '',
  gender: '',
  address: '',
  email: '',
  lifestyle: [],
  goal: '',
  goalOther: '',
  expectations: '',
  commitments: {
    consumeWeek: true,
    whatsappCheckins: true,
    finalSurvey: true,
    honestFeedback: true,
    termsAccepted: true,
  },
};

test('paso 0: todos los campos vacíos → inválido', () => {
  expect(isStepValid(0, base)).toBe(false);
});

test('paso 0: todos los campos completos y válidos → válido', () => {
  const formData = {
    ...base,
    fullName: 'Juan Pérez',
    age: '28',
    gender: 'male',
    address: 'Av. Siempre Viva 123',
    email: 'juan@example.com',
  };
  expect(isStepValid(0, formData)).toBe(true);
});

test('paso 0: email inválido → inválido', () => {
  const formData = {
    ...base,
    fullName: 'Juan Pérez',
    age: '28',
    gender: 'male',
    address: 'Av. Siempre Viva 123',
    email: 'no-es-un-email',
  };
  expect(isStepValid(0, formData)).toBe(false);
});

test('paso 1: lifestyle vacío → inválido', () => {
  expect(isStepValid(1, { ...base, lifestyle: [] })).toBe(false);
});

test('paso 1: lifestyle con al menos una opción → válido', () => {
  expect(isStepValid(1, { ...base, lifestyle: ['employed'] })).toBe(true);
});

test('paso 2: goal "other" sin goalOther → inválido', () => {
  const formData = { ...base, goal: 'other', goalOther: '', expectations: 'Quiero mejorar' };
  expect(isStepValid(2, formData)).toBe(false);
});

test('paso 2: goal "other" con goalOther → válido', () => {
  const formData = { ...base, goal: 'other', goalOther: 'Correr una maratón', expectations: 'Quiero mejorar' };
  expect(isStepValid(2, formData)).toBe(true);
});

test('paso 2: sin expectations → inválido', () => {
  const formData = { ...base, goal: 'maintain', goalOther: '', expectations: '' };
  expect(isStepValid(2, formData)).toBe(false);
});

test('paso 3: un compromiso en false → inválido', () => {
  const formData = { ...base, commitments: { ...base.commitments, termsAccepted: false } };
  expect(isStepValid(3, formData)).toBe(false);
});

test('paso 3: todos los compromisos en true → válido', () => {
  expect(isStepValid(3, base)).toBe(true);
});
