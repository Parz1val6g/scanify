import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import styles from './Login.module.css';
import { Input, Button } from '../components/';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, loading, navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
        }
    };
    return (
        <div className={styles.main}>
            <div id={styles.form}>
                <form onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    {error && <p className={styles.error}>{error}</p>}
                    <Input
                        type="mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Link to="/forgot-password" id={styles.forgotPwd}>
                        Esqueceu-se da sua palavra-passe?
                    </Link>
                    <div className={styles.loginButtons}>
                        <Button
                            type="submit"
                            variant="primary"
                        >
                            Entrar
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/sign-up')}
                        >
                            Criar Conta
                        </Button>
                    </div>
                </form>
            </div>
            <div id={styles.banner}></div>
        </div>
    );
}

export default Login;