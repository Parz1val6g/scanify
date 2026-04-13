import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, User, Loader2, CheckCircle2 } from 'lucide-react';
import { userService } from '../../services';
import styles from './UserUploadModal.module.css';

const UserUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError(null);
    };

    const resetForm = () => {
        setForm({ firstName: '', lastName: '', email: '' });
        setError(null);
        setSuccess(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic frontend validation
        if (!form.firstName.trim() || form.firstName.trim().length < 2)
            return setError('O primeiro nome deve ter pelo menos 2 caracteres.');
        if (!form.lastName.trim() || form.lastName.trim().length < 2)
            return setError('O apelido deve ter pelo menos 2 caracteres.');
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            return setError('Introduza um email válido.');

        setLoading(true);
        setError(null);

        try {
            await userService.invite({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim()
            });
            setSuccess(true);
            if (onUploadSuccess) onUploadSuccess();
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao convidar utilizador. Tenta de novo.');
        } finally {
            setLoading(false);
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
                    onClick={handleClose}
                >
                    <motion.div
                        className={styles.modal}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.headerInfo}>
                                <div className={styles.iconWrap}>
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h2>Convidar Colaborador</h2>
                                    <p>Será enviado um email com link de acesso inicial.</p>
                                </div>
                            </div>
                            <button className={styles.closeBtn} onClick={handleClose} aria-label="Fechar">
                                <X size={22} />
                            </button>
                        </div>

                        {/* Form */}
                        <form className={styles.form} onSubmit={handleSubmit}>
                            {success ? (
                                <motion.div
                                    className={styles.successState}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <CheckCircle2 size={48} className={styles.successIcon} />
                                    <h3>Convite enviado!</h3>
                                    <p>{form.email} receberá instruções de acesso em breve.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className={styles.fieldRow}>
                                        <div className={styles.field}>
                                            <label htmlFor="inv-firstName" className={styles.label}>
                                                <User size={13} /> Primeiro Nome
                                            </label>
                                            <input
                                                id="inv-firstName"
                                                name="firstName"
                                                type="text"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                placeholder="João"
                                                className={styles.input}
                                                autoComplete="given-name"
                                                disabled={loading}
                                                required
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label htmlFor="inv-lastName" className={styles.label}>
                                                <User size={13} /> Apelido
                                            </label>
                                            <input
                                                id="inv-lastName"
                                                name="lastName"
                                                type="text"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                placeholder="Silva"
                                                className={styles.input}
                                                autoComplete="family-name"
                                                disabled={loading}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <label htmlFor="inv-email" className={styles.label}>
                                            <Mail size={13} /> Email
                                        </label>
                                        <input
                                            id="inv-email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="colaborador@empresa.pt"
                                            className={styles.input}
                                            autoComplete="email"
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    {error && <p className={styles.errorMsg}>{error}</p>}

                                    <div className={styles.footer}>
                                        <button
                                            type="button"
                                            className={styles.cancelBtn}
                                            onClick={handleClose}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className={styles.submitBtn}
                                            disabled={loading}
                                        >
                                            {loading
                                                ? <><Loader2 size={16} className={styles.spinner} /> A enviar...</>
                                                : <><UserPlus size={16} /> Enviar Convite</>
                                            }
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserUploadModal;
