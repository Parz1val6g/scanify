import { Check, X } from 'lucide-react';
import styles from './PasswordCriteria.module.css';

const CRITERIA = [
    { key: 'length', label: '8+ caracteres', test: (p) => p.length >= 8 },
    { key: 'uppercase', label: '1 maiúscula', test: (p) => /[A-Z]/.test(p) },
    { key: 'lowercase', label: '1 minúscula', test: (p) => /[a-z]/.test(p) },
    { key: 'number', label: '1 número', test: (p) => /\d/.test(p) },
    { key: 'symbol', label: '1 símbolo', test: (p) => /[@$!%*?&#+\-_]/.test(p) }
];

export const validatePasswordCriteria = (password = '') => {
    const results = CRITERIA.reduce((acc, { key, test }) => {
        acc[key] = test(password);
        return acc;
    }, {});

    return {
        ...results,
        isValid: Object.values(results).every(Boolean)
    };
};

export const PasswordCriteria = ({ password = '', show = true }) => {
    if (!show) return null;

    const validation = validatePasswordCriteria(password);

    return (
        <ul className={styles.criteria} role="list" aria-label="Requisitos da password">
            {CRITERIA.map(({ key, label }) => {
                const met = validation[key];
                return (
                    <li
                        key={key}
                        className={`${styles.item} ${met ? styles.met : styles.unmet}`}
                        aria-label={`${label}: ${met ? 'cumprido' : 'não cumprido'}`}
                    >
                        {met ? (
                            <Check size={14} strokeWidth={3} className={styles.iconMet} />
                        ) : (
                            <X size={14} strokeWidth={2} className={styles.iconUnmet} />
                        )}
                        <span>{label}</span>
                    </li>
                );
            })}
        </ul>
    );
};
