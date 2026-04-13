import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
import { Input, Button } from '../components';
import { forgotPassword } from '../services/auth';
import { SkeletonBlock } from '../components/Skeleton';

function ForgotPasswordSkeleton() {
    return (
        <div className={styles.main}>
            <div className={styles.formContainer}>
                <SkeletonBlock className="title" style={{ width: 180, height: 32, marginBottom: 24 }} />
                <SkeletonBlock className="textLine" style={{ width: 320, height: 16, marginBottom: 16 }} />
                <SkeletonBlock className="textLine" style={{ width: 220, height: 16, marginBottom: 16 }} />
                <SkeletonBlock className="tableRow" style={{ width: 120, height: 40 }} />
            </div>
        </div>
    );
}

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ForgotPasswordSkeleton />;

    return (
        <div className={styles.main}>
            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h1>Recuperar Palavra-Passe</h1>

                    {success ? (
                        <div className={styles.successMessage}>
                            <p>E-mail enviado com sucesso!</p>
                            <p>Verifique a sua caixa de entrada (e spam) para encontrar o link de recuperação.</p>
                            <Link to="/login">
                                <Button type="button" variant="primary">Voltar ao Início de Sessão</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p className={styles.description}>
                                Introduza o seu e-mail e enviaremos um link para redefinir a sua palavra-passe.
                                O link expira em 15 minutos.
                            </p>

                            {error && <p className={styles.error}>{error}</p>}

                            <Input
                                type="mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <div className={styles.buttons}>
                                <Button
                                    type="submit"
                                    variant="primary"
                                >Enviar</Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;