import { useState } from 'react';
import { computeProtein, buildMealPlan } from '../data/calculadora';
import { CalcIntro } from '../components/calculadora/CalcIntro';
import { CalcForm } from '../components/calculadora/CalcForm';
import { CalcResult } from '../components/calculadora/CalcResult';
import { CalcUnlocked } from '../components/calculadora/CalcUnlocked';
import styles from '../components/calculadora/Calculadora.module.css';
import { scrollToTop } from '../lib/scroll';
import { captureLead } from '../lib/leads';

const DEFAULT_STATE = {
  goal: '',
  weight: 75,
  target: 78,
  age: 'under65',
  training: '',
  activity: '',
  intakePattern: '',
  currentIntake: 0,
};

export function Calculadora() {
  const [phase, setPhase] = useState('intro');
  const [step, setStep]   = useState(0);
  const [formData, setFormData] = useState(DEFAULT_STATE);
  const [user, setUser]   = useState({ name: '', email: '' });

  const result = phase !== 'intro' ? computeProtein(formData) : null;
  const plan   = result ? buildMealPlan({ grams: result.grams }) : null;

  const goPhase = p => { setPhase(p); scrollToTop(); };

  const handleNext = () => {
    if (step < 2) {
      setStep(s => s + 1);
      scrollToTop();
    } else {
      goPhase('result');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
      scrollToTop();
    } else {
      goPhase('intro');
    }
  };

  const handleUnlock = ({ name, email }) => {
    setUser({ name, email });
    // T1.8 — captura no bloqueante; no esperamos respuesta para avanzar de fase.
    if (result) {
      captureLead({
        name,
        email,
        grams: result.grams,
        gap: result.gap,
        goal: formData.goal,
        age: formData.age,
        training: formData.training,
        activity: formData.activity,
        client_ts: new Date().toISOString(),
      });
    }
    goPhase('unlocked');
  };

  return (
    <div className={styles.page}>
      {phase === 'intro' && (
        <CalcIntro onStart={() => { setStep(0); goPhase('form'); }} />
      )}
      {phase === 'form' && (
        <CalcForm
          step={step}
          formData={formData}
          onChange={setFormData}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {phase === 'result' && result && (
        <CalcResult result={result} formData={formData} onUnlock={handleUnlock} />
      )}
      {phase === 'unlocked' && result && plan && (
        <CalcUnlocked user={user} result={result} plan={plan} />
      )}
    </div>
  );
}
