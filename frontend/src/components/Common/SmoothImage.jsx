import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import styles from './SmoothImage.module.css';

const SmoothImage = ({ src, alt, className, fallbackIcon: FallbackIcon = FileText }) => {
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        if (!src) setStatus('error');
    }, [src]);

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <AnimatePresence mode="wait">
                {status === 'loading' && (
                    <motion.div 
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.skeleton}
                    />
                )}
                
                {status === 'error' && (
                    <motion.div 
                        key="fallback"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={styles.fallback}
                    >
                        <FallbackIcon size={24} />
                    </motion.div>
                )}
            </AnimatePresence>

            {src && (
                <img 
                    src={src} 
                    alt={alt} 
                    className={`${styles.image} ${status === 'success' ? styles.visible : ''}`}
                    onLoad={() => setStatus('success')}
                    onError={() => setStatus('error')}
                />
            )}
        </div>
    );
};

export default SmoothImage;
