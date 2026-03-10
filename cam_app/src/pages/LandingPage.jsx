import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

export const LandingPage = () => {
    const navigate = useNavigate();
    // const handleEntry = ()=>{
    //     navigate('/login', {replace:true});
    // };
    return (
        <div className={styles.hero}>
            <h1>Digitalização de Faturas</h1>
            <p>Connosco consegue digitalizar todo o tipo de faturas. Experimente já!</p>
            {/* <button onClick={handleEntry}>Entrar</button> */}
            <Link to='/login'>Entrar</Link>
        </div>
    );
}

export default LandingPage;