import React, { forwardRef, useState } from 'react';
import {
    User, Mail, Lock, Hash, Calendar,
    FileText, Phone, Euro, AtSign
} from 'lucide-react';
import styles from './Input.module.css';

// Configuração centralizada para facilitar manutenção
const INPUT_CONFIGS = {
    name: { Icon: User, type: 'text', placeholder: 'Nome Completo', label: 'Nome' },
    username: { Icon: AtSign, type: 'text', placeholder: 'Utilizador', label: 'Utilizador' },
    mail: { Icon: Mail, type: 'email', placeholder: 'exemplo@mail.com', label: 'Email' },
    password: { Icon: Lock, type: 'password', placeholder: '••••••••', label: 'Password' },
    valor: { Icon: Euro, type: 'number', placeholder: '0.00', label: 'Valor' },
    km: { Icon: Hash, type: 'number', placeholder: 'Quilometragem', label: 'Km' },
    date: { Icon: Calendar, type: 'date', placeholder: '', label: 'Data' },
    phone: { Icon: Phone, type: 'tel', placeholder: '9xx xxx xxx', label: 'Telefone' },
    text: { Icon: FileText, type: 'text', placeholder: 'Escreva aqui...', label: 'Texto' }
};

// Usamos forwardRef para que o React Hook Form consiga "tocar" no input real
export const Input = forwardRef(({
    type = 'text',
    label: customLabel,
    error,
    placeholder: customPlaceholder,
    value,
    ...props
}, ref) => {
    const config = INPUT_CONFIGS[type] || INPUT_CONFIGS.text;
    const { Icon, type: inputType, placeholder: defaultPlaceholder, label: defaultLabel } = config;
    const [isFocused, setIsFocused] = useState(false);

    const label = customLabel ?? defaultLabel;
    const hasValue = value !== undefined ? value.length > 0 : false;
    const isFloating = isFocused || hasValue;

    return (
        <div className={styles.wrapper}>
            <div className={`${styles.inputContainer} ${error ? styles.errorBorder : ''} ${isFocused ? styles.focused : ''}`}>
                <div className={styles.iconArea}>
                    <Icon size={20} strokeWidth={2} />
                </div>

                <div className={styles.fieldWrapper}>
                    {label && (
                        <label className={`${styles.floatingLabel} ${isFloating ? styles.floatingLabelActive : ''}`}>
                            {label}
                        </label>
                    )}
                    <input
                        ref={ref}
                        type={inputType}
                        placeholder={isFloating ? (customPlaceholder ?? defaultPlaceholder) : ''}
                        className={`${styles.field} ${label ? styles.fieldWithLabel : ''}`}
                        value={value}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        {...props}
                    />
                </div>
            </div>

            {/* Feedback de erro dinâmico */}
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';