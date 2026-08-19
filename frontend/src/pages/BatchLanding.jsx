import { useState } from 'react';
import { BatchForm, STEP_COUNT } from '../components/batch001/BatchForm';
import { SplitLayout } from '../components/batch001/SplitLayout';
import { submitBatchApplication } from '../lib/batch001';
import { scrollToTop } from '../lib/scroll';
import styles from '../components/batch001/BatchLanding.module.css';

const LAST_STEP = STEP_COUNT - 1;

const DEFAULT_STATE = {
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
  website: '', // honeypot anti-spam
};

export function BatchLanding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(DEFAULT_STATE);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const payload = {
      full_name: formData.fullName,
      age: Number(formData.age),
      gender: formData.gender,
      address: formData.address,
      email: formData.email,
      lifestyle: formData.lifestyle,
      goal: formData.goal,
      goal_other: formData.goal === 'other' ? formData.goalOther : null,
      expectations: formData.expectations,
      commit_consume_week: formData.commitments.consumeWeek,
      commit_whatsapp_checkins: formData.commitments.whatsappCheckins,
      commit_final_survey: formData.commitments.finalSurvey,
      commit_honest_feedback: formData.commitments.honestFeedback,
      commit_terms_accepted: formData.commitments.termsAccepted,
      client_ts: new Date().toISOString(),
      website: formData.website,
    };
    // Envío no bloqueante — avanzamos a la confirmación de forma optimista.
    submitBatchApplication(payload);
    setSubmitted(true);
    scrollToTop();
  };

  const handleNext = () => {
    if (step < LAST_STEP) {
      setStep(s => s + 1);
      scrollToTop();
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
      scrollToTop();
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.noiseLayer} />
        <div className={styles.confirm}>
          <div className={styles.confirmInner}>
            <span className={styles.eyebrow}>Founding Batch #001</span>
            <h1 className={styles.headline}>¡Gracias por aplicar!</h1>
            <p className={styles.subtitle}>
              Recibimos tu formulario. Te contactaremos por email o WhatsApp con los próximos pasos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.noiseLayer} />
      <input
        type="text"
        name="website"
        value={formData.website}
        onChange={e => setFormData({ ...formData, website: e.target.value })}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
        aria-hidden="true"
      />
      <SplitLayout>
        <BatchForm
          step={step}
          formData={formData}
          onChange={setFormData}
          onNext={handleNext}
          onBack={handleBack}
        />
      </SplitLayout>
    </div>
  );
}
