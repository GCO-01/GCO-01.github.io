import styles from './Calculadora.module.css';

export function MealPlan({ meals }) {
  return (
    <div className={styles.mealSection}>
      <h3 className={styles.mealSectionTitle}>Tu plan de comidas</h3>
      {meals.map(meal => (
        <div key={meal.name} className={styles.mealCard}>
          <div className={styles.mealHeader}>
            <span className={styles.mealEmoji}>{meal.emoji}</span>
            <p className={styles.mealName}>{meal.name}</p>
          </div>
          <div className={styles.mealItems}>
            {meal.items.map((item, i) => (
              <div key={i} className={styles.mealItem}>
                <span className={`${styles.mealItemLabel} ${item.isShake ? styles.mealItemShake : ''}`}>
                  {item.emoji} {item.label}
                </span>
                <span className={styles.mealItemMacros}>{item.grams}g · {item.kcal} kcal</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
