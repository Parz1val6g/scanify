import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirmar Ação", 
    message = "Tens a certeza que desejas realizar esta operação?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    icon: Icon = RefreshCw,
    type = 'primary' // 'primary' or 'warning'
}) => {
    const [status, setStatus] = useState('idle'); // idle, loading, success

    // Bloquear scroll quando aberto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setStatus('idle');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Fechar com ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen && status === 'idle') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, status, onClose]);

    const handleConfirm = async () => {
        setStatus('loading');
        try {
            await onConfirm();
            setStatus('success');
            // Fechar automaticamente após 2 segundos de sucesso
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            setStatus('idle');
            // O erro deve ser tratado pelo controller pai
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={status === 'idle' ? onClose : undefined}
                >
                    <motion.div 
                        className={styles.modal}
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalContent}>
                            <motion.div 
                                className={`${styles.iconWrapper} ${type === 'warning' ? styles.iconWrapperWarning : ''} ${status === 'success' ? styles.iconWrapperSuccess : ''}`}
                                animate={status === 'loading' ? { rotate: 360 } : { rotate: 0 }}
                                transition={status === 'loading' ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
                            >
                                {status === 'success' ? (
                                    <CheckCircle2 size={32} />
                                ) : (
                                    <Icon size={32} />
                                )}
                            </motion.div>

                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h3>Sucesso!</h3>
                                    <p>A operação foi concluída com êxito.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <h3>{title}</h3>
                                    <p>{message}</p>
                                </>
                            )}
                        </div>

                        {status !== 'success' && (
                            <div className={styles.footer}>
                                <button 
                                    className={styles.cancelBtn} 
                                    onClick={onClose}
                                    disabled={status === 'loading'}
                                >
                                    {cancelText}
                                </button>
                                <button 
                                    className={styles.confirmBtn} 
                                    onClick={handleConfirm}
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <RefreshCw size={16} className={styles.spinner} />
                                            A processar...
                                        </>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
