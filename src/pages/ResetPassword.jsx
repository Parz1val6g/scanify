import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import styles from './ResetPassword.module.css';
import { Input, Button } from '../components';
import { resetPassword, validatePassword } from '../services/auth';

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);

    // Verificar se tem token
    useEffect(() => {
        if (!token) {
            setError('Link inválido. Pede um novo email de recuperação.');
        }
    }, [token]);

    // Validar password em tempo real
    useEffect(() => {
        if (password) {
            const validation = validatePassword(password);
            setPasswordErrors(validation.errors);
        } else {
            setPasswordErrors([]);
        }
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validações
    }

    export default ResetPassword;
    const validation = validatePassword(password);
    if (!validation.isValid) {
        setError(validation.errors[0]);
        return;
    }

    if (password !== confirmPassword) {
        setError('As passwords não coincidem.');
        return;
    }

    setLoading(true);

    try {
        await resetPassword(token, password);
        setSuccess(true);
        // Redirect após 3 segundos
        setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
if (!token) {
    return (
        <div className={styles.main}>
            <div className={styles.formContainer}>
                <div className={styles.form}>
                    <h1>Link Inválido</h1>
                    <p className={styles.description}>
                        Este link de recuperação é inválido ou expirou.
                    </p>
                    <div className={styles.buttons}>
                        <Link to="/forgot-password">
                            <Button variant="primary">Pedir Novo Link</Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="secondary">Voltar ao Login</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

return (
    <div className={styles.main}>
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h1>Nova Password</h1>

                {success ? (
                    <div className={styles.successMessage}>
                        <p>Password alterada com sucesso!</p>
                        <p>Vais ser redirecionado para o login em 3 segundos...</p>
                        <Link to="/login">
                            <Button type="button" variant="primary">Ir para Login</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className={styles.description}>
                            Cria uma nova password segura para a tua conta.
                        </p>

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Nova Password</label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            {/* Password requirements checklist */}
                            {password && (
                                <ul className={styles.requirements}>
                                    <li className={password.length >= 8 ? styles.valid : styles.invalid}>
                                        Mínimo 8 caracteres
                                    </li>
                                    <li className={/[A-Z]/.test(password) ? styles.valid : styles.invalid}>
                                        Uma letra maiúscula
                                    </li>
                                    <li className={/[a-z]/.test(password) ? styles.valid : styles.invalid}>
                                        Uma letra minúscula
                                    </li>
                                    <li className={/\d/.test(password) ? styles.valid : styles.invalid}>
                                        Um número
                                    </li>
                                    <li className={/[@$!%*?&#+\-_]/.test(password) ? styles.valid : styles.invalid}>
                                        Um caractere especial (@$!%*?&#+_-)
                                    </li>
                                </ul>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">Confirmar Password</label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Password match indicator */}
                        {confirmPassword && (
                            <p className={password === confirmPassword ? styles.match : styles.noMatch}>
                                {password === confirmPassword ? '✓ Passwords coincidem' : '✗ Passwords não coincidem'}
                            </p>
                        )}

                        <div className={styles.buttons}>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading || !password || !confirmPassword || passwordErrors.length > 0}
                            >
                                {loading ? 'A guardar...' : 'Guardar Password'}
                            </Button>
                            <Link to="/login">
                                <Button type="button" variant="secondary">Cancelar</Button>
                            </Link>
                        </div>
                    </>
                )}
            </form>
        </div>
    </div>
);
};