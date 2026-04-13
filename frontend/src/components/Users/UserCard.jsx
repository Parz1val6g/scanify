import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, User as UserIcon, Shield, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import styles from './UserCard.module.css';

// Role display config
const ROLE_CONFIG = {
    SUPER_ADMIN: { label: 'Super Admin', className: 'roleSuperAdmin', icon: ShieldCheck },
    COMPANY_ADMIN: { label: 'Admin', className: 'roleAdmin', icon: Shield },
    USER: { label: 'Utilizador', className: 'roleUser', icon: UserIcon }
};

// Status display config
const STATUS_CONFIG = {
    ACTIVE: { label: 'Ativo', className: 'statusActive' },
    INACTIVE: { label: 'Inativo', className: 'statusInactive' },
    PENDING: { label: 'Pendente', className: 'statusPending' },
    SUSPENDED: { label: 'Suspenso', className: 'statusSuspended' },
    BLOCKED: { label: 'Bloqueado', className: 'statusBlocked' },
    BANNED: { label: 'Banido', className: 'statusBanned' },
    DELETED: { label: 'Eliminado', className: 'statusDeleted' }
};

const UserCard = ({ user, onClick, onDelete }) => {
    const { user: currentUser, isSuperAdmin, isAdmin } = useAuth();

    const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.USER;
    const status = STATUS_CONFIG[user?.status] || STATUS_CONFIG.ACTIVE;
    const RoleIcon = role.icon;

    const initials = `${user?.firstName?.[0] ?? '?'}${user?.lastName?.[0] ?? ''}`.toUpperCase();

    // Only SuperAdmin can delete any user; Admin can delete non-admins in their company
    const canDelete = isSuperAdmin ||
        (isAdmin && user?.role === 'USER' && user?.id !== currentUser?.id);

    // Don't show delete button for own account
    const showDelete = canDelete && user?.id !== currentUser?.id;

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(user);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={styles.card}
            onClick={() => onClick && onClick(user)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.(user)}
            aria-label={`Utilizador ${user?.firstName} ${user?.lastName}`}
        >
            {/* Glow accent */}
            <div className={`${styles.cardGlow} ${styles[role.className + 'Glow']}`} />

            {/* Header with avatar + role badge */}
            <div className={styles.header}>
                <div className={styles.avatar}>{initials}</div>
                <span className={`${styles.roleBadge} ${styles[role.className]}`}>
                    <RoleIcon size={11} />
                    {role.label}
                </span>
            </div>

            {/* User info */}
            <div className={styles.body}>
                <h3 className={styles.name}>
                    {user?.firstName} {user?.lastName}
                </h3>
                <div className={styles.email}>
                    <Mail size={13} />
                    <span>{user?.email}</span>
                </div>
            </div>

            {/* Footer with status + actions */}
            <div className={styles.footer}>
                <span className={`${styles.statusBadge} ${styles[status.className]}`}>
                    {status.label}
                </span>
                {showDelete && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={styles.deleteBtn}
                        onClick={handleDelete}
                        title="Eliminar utilizador"
                        aria-label="Eliminar utilizador"
                    >
                        <Trash2 size={16} />
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default UserCard;
