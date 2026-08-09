import styles from './Calculadora.module.css';

export function MealPlan({ meals }) {
  return (
    <div data-card className={styles.calcCard}>
      <p className={styles.calcCardLbl}>Tu plan de comidas</p>
      {meals.map(meal => (
        <div key={meal.name} className={styles.calcMealGroup}>
          <div className={styles.calcMealHeader}>
            <span className={styles.calcMealEmoji}>{meal.emoji}</span>
            <p className={styles.calcMealName}>{meal.name}</p>
          </div>
          <div className={styles.calcMealItems}>
            {meal.items.map((item, i) => (
              <div key={i} className={styles.calcMealItem}>
                <span className={`${styles.calcMealItemLabel} ${item.isShake ? styles.calcMealItemShake : ''}`}>
                  {item.emoji} {item.label}
                </span>
                <span className={styles.calcMealItemMacros}>{item.grams}g · ~{item.kcal} kcal</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className={styles.calcMealNote}>Calorías aproximadas, varían según preparación.</p>
    </div>
  );
}
