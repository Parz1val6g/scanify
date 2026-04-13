import styles from './Button.module.css';

export const Button = ({ children, variant = 'primary', ...props }) => {
  const buttonClass = `${styles.btn} ${styles[variant] || styles.primary}`;

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};