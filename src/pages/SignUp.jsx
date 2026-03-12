import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import styles from './SignUp.module.css';
import { Input, Button, PasswordCriteria, validatePasswordCriteria } from '../components/';
import { SkeletonBlock } from '../components/Skeleton';

function SignUpSkeleton() {
    return (
        <div className={styles.main}>
            <div id={styles.form}>
                <SkeletonBlock className="title" style={{ width: 220, height: 32, marginBottom: 24 }} />
                <SkeletonBlock className="textLine" style={{ width: 320, height: 16, marginBottom: 16 }} />
                <SkeletonBlock className="textLine" style={{ width: 220, height: 16, marginBottom: 16 }} />
                <SkeletonBlock className="tableRow" style={{ width: 120, height: 40 }} />
            </div>
        </div>
    );
}

export const SignUp = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // Validação em tempo real
    const passwordValidation = useMemo(() => validatePasswordCriteria(password1), [password1]);
    const passwordsMatch = password1 === password2 && password2.length > 0;

    // Validação de nome (2+ palavras)
    const nameValid = fullName.trim().split(/\s+/).filter(Boolean).length >= 2;
    const nameError = fullName.length > 0 && !nameValid ? 'Introduz primeiro e último nome' : undefined;

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(email);
    const emailError = email.length > 0 && !emailValid ? 'Email inválido' : undefined;

    // Form é válido se todos os critérios forem cumpridos
    const isFormValid = useMemo(() => {
        return (
            nameValid &&
            emailValid &&
            passwordValidation.isValid &&
            passwordsMatch
        );
    }, [nameValid, emailValid, passwordValidation.isValid, passwordsMatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        try {
            await register({ fullName, email, password: password1, confirmPassword: password2 });
            // Usamos replace: true para limpar a stack após o registo com sucesso
            navigate('/login', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) return <SignUpSkeleton />;

    return (
        <div className={styles.main}>
            <div id={styles.form}>
                <form onSubmit={handleSubmit}>
                    <h1>Registar</h1>

                    {error && <p className={styles.error} role="alert">{error}</p>}

                    <Input
                        type="name"
                        label="Nome Completo"
                        value={fullName}
                        placeholder="Primeiro e Último nome"
                        onChange={(e) => setFullName(e.target.value)}
                        error={nameError}
                    />

                    <Input
                        type="mail"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={emailError}
                    />

                    <div className={styles.passwordSection}>
                        <Input
                            type="password"
                            label="Password"
                            value={password1}
                            onChange={(e) => setPassword1(e.target.value)}
                        />
                        <PasswordCriteria
                            password={password1}
                            show={password1.length > 0}
                        />
                    </div>

                    <Input
                        type="password"
                        label="Confirmar Password"
                        value={password2}
                        placeholder="Repete a password"
                        onChange={(e) => setPassword2(e.target.value)}
                        error={password2.length > 0 && !passwordsMatch ? 'Passwords não coincidem' : undefined}
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? 'A registar...' : 'Registar'}
                    </Button>

                    <p className={styles.loginLink}>
                        Já tens conta? <Link to="/login" replace>Entrar</Link>
                    </p>
                </form>
            </div>

            <div id={styles.banner}></div>
        </div>
    );
};

export default SignUp;