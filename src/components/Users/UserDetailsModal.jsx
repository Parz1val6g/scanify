import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Shield, ShieldCheck, Activity, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { userService } from '../../services';
import styles from './UserDetailsModal.module.css';

const ROLE_OPTIONS = [
    { value: 'USER', label: 'Utilizador', icon: User },
    { value: 'COMPANY_ADMIN', label: 'Admin de Empresa', icon: Shield },
];

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'SUSPENDED', label: 'Suspenso' },
    { value: 'BLOCKED', label: 'Bloqueado' },
];

const UserDetailsModal = ({ isOpen, user, onClose, onUpdateSuccess }) => {
    const { isSuperAdmin, isAdmin } = useAuth();
    const [role, setRole] = useState(user?.role || 'USER');
    const [status, setStatus] = useState(user?.status || 'ACTIVE');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Sync state when user prop changes
    useEffect(() => {
        if (user) {
            setRole(user.role || 'USER');
            setStatus(user.status || 'ACTIVE');
            setError(null);
            setSuccess(false);
        }
    }, [user]);

    if (!user) return null;

    const canEditRole = isSuperAdmin; // only SuperAdmin can change roles
    const canEditStatus = isAdmin;    // both admin types can change status

    const handleSave = async () => {
        if (!isAdmin) return;
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const promises = [];

            // Update role if changed and user is SuperAdmin
            if (canEditRole && role !== user.role) {
                promises.push(userService.updateById(user.id, { role }));
            }

            // Update status if changed
            if (canEditStatus && status !== user.status) {
                promises.push(userService.updateStatus(user.id, status));
            }

            await Promise.all(promises);
            setSuccess(true);
            if (onUpdateSuccess) onUpdateSuccess();
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao atualizar utilizador. Tenta novamente.');
        } finally {
            setSaving(false);
        }
    };

    const initials = `${user.firstName?.[0] ?? '?'}${user.lastName?.[0] ?? ''}`.toUpperCase();
    const hasChanges = role !== user.role || status !== user.status;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
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
                            <div className={styles.userIdentity}>
                                <div className={styles.avatar}>{initials}</div>
                                <div>
                                    <h2>{user.firstName} {user.lastName}</h2>
                                    <div className={styles.email}>
                                        <Mail size={13} />
                                        <span>{user.email}</span>
                                    </div>
                                </div>
                            </div>
                            <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                                <X size={22} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className={styles.body}>
                            {/* Role section — SuperAdmin only */}
                            {canEditRole ? (
                                <div className={styles.section}>
                                    <label className={styles.sectionLabel}>
                                        <ShieldCheck size={15} />
                                        Função (Role)
                                    </label>
                                    <div className={styles.optionGroup}>
                                        {ROLE_OPTIONS.map(opt => {
                                            const Icon = opt.icon;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    className={`${styles.optionBtn} ${role === opt.value ? styles.optionBtnActive : ''}`}
                                                    onClick={() => setRole(opt.value)}
                                                    disabled={saving}
                                                >
                                                    <Icon size={16} />
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.section}>
                                    <label className={styles.sectionLabel}>
                                        <ShieldCheck size={15} />
                                        Função
                                    </label>
                                    <span className={styles.readOnlyValue}>{user.role}</span>
                                </div>
                            )}

                            {/* Status section — any admin */}
                            {canEditStatus ? (
                                <div className={styles.section}>
                                    <label className={styles.sectionLabel}>
                                        <Activity size={15} />
                                        Estado da Conta
                                    </label>
                                    <div className={styles.optionGroup}>
                                        {STATUS_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                className={`${styles.optionBtn} ${styles['status' + opt.value]} ${status === opt.value ? styles.optionBtnActive : ''}`}
                                                onClick={() => setStatus(opt.value)}
                                                disabled={saving}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.section}>
                                    <label className={styles.sectionLabel}>
                                        <Activity size={15} />
                                        Estado
                                    </label>
                                    <span className={styles.readOnlyValue}>{user.status}</span>
                                </div>
                            )}

                            {/* Context info */}
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Empresa</span>
                                <span className={styles.metaValue}>{user.company?.name || '—'}</span>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Membro desde</span>
                                <span className={styles.metaValue}>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-PT') : '—'}
                                </span>
                            </div>

                            {/* Feedback */}
                            {error && <p className={styles.errorMsg}>{error}</p>}
                            {success && <p className={styles.successMsg}>✓ Utilizador atualizado com sucesso.</p>}
                        </div>

                        {/* Footer */}
                        <div className={styles.footer}>
                            <button className="btn-secondary" onClick={onClose} disabled={saving}>
                                Fechar
                            </button>
                            {isAdmin && (
                                <button
                                    className="btn-primary"
                                    onClick={handleSave}
                                    disabled={saving || !hasChanges}
                                >
                                    {saving ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
                                    {saving ? 'A guardar...' : 'Guardar Alterações'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserDetailsModal;
