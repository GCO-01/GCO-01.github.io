import { useState } from 'react';
import { computeProtein, buildMealPlan } from '../data/calculadora';
import { CalcIntro } from '../components/calculadora/CalcIntro';
import { CalcForm } from '../components/calculadora/CalcForm';
import { CalcResult } from '../components/calculadora/CalcResult';
import { CalcUnlocked } from '../components/calculadora/CalcUnlocked';
import styles from '../components/calculadora/Calculadora.module.css';

const DEFAULT_STATE = {
  goal: '',
  weight: 75,
  target: 78,
  diet: 'omnivore',
  training: '',
  activity: '',
  intakePattern: '',
  currentIntake: 0,
};

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function Calculadora() {
  const [phase, setPhase] = useState('intro');
  const [step, setStep]   = useState(0);
  const [formData, setFormData] = useState(DEFAULT_STATE);
  const [user, setUser]   = useState({ name: '', email: '' });

  const result = phase !== 'intro' ? computeProtein(formData) : null;
  const plan   = result ? buildMealPlan({ grams: result.grams, diet: formData.diet }) : null;

  const goPhase = p => { setPhase(p); scrollTop(); };

  const handleNext = () => {
    if (step < 2) {
      setStep(s => s + 1);
      scrollTop();
    } else {
      goPhase('result');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
      scrollTop();
    } else {
      goPhase('intro');
    }
  };

  const handleUnlock = ({ name, email }) => {
    setUser({ name, email });
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
        <CalcResult result={result} onUnlock={handleUnlock} />
      )}
      {phase === 'unlocked' && result && plan && (
        <CalcUnlocked user={user} result={result} plan={plan} />
      )}
    </div>
  );
}
