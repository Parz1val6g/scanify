import styles from './NotFound.module.css';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFound = () => (
    <div className={styles.container}>
        <div className={styles.glassCard}>
            <h1 className={styles.errorCode}>404</h1>
            <h2 className={styles.title}>Página não encontrada</h2>
            <p className={styles.description}>
                Oops! Não conseguimos encontrar a página que procuras.<br />
                Verifica o endereço ou volta ao início.
            </p>
            <Link to="/" className={styles.homeBtn} replace>
                <Home size={20} />
                Voltar ao Início
            </Link>
        </div>
    </div>
);

export default NotFound;
