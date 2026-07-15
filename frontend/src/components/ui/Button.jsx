import styles from './Button.module.css';

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  confirmed = false,
  children,
  className = '',
  ...props
}) {
  const variantClass = confirmed ? styles.confirmed : styles[variant];
  const classes = [styles.btn, variantClass, styles[size], fullWidth ? styles.full : '', className]
    .filter(Boolean).join(' ');
  return <button className={classes} {...props}>{children}</button>;
}
