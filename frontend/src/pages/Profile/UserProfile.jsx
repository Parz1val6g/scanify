import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, Eye, EyeOff, Loader2, ShieldCheck, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { userService } from '../../services';
import styles from './UserProfile.module.css';

// Role labels matching the Prisma enum exactly
const ROLE_LABELS = {
    SUPER_ADMIN:   'Super Administrador',
    COMPANY_ADMIN: 'Administrador de Empresa',
    USER:          'Utilizador'
};

const STATUS_LABELS = {
    ACTIVE:    'Ativo',
    INACTIVE:  'Inativo',
    PENDING:   'Pendente',
    SUSPENDED: 'Suspenso',
    BLOCKED:   'Bloqueado',
    BANNED:    'Banido',
    DELETED:   'Eliminado'
};

// Inline feedback banner
const FeedbackBanner = ({ type, message, onDismiss }) => {
    if (!message) return null;
    const isError = type === 'error';
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`${styles.banner} ${isError ? styles.bannerError : styles.bannerSuccess}`}
        >
            {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{message}</span>
            <button onClick={onDismiss} className={styles.bannerClose}>✕</button>
        </motion.div>
    );
};

const UserProfile = () => {
    const { user, login } = useAuth();

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName ?? '',
        lastName:  user?.lastName  ?? '',
        email:     user?.email     ?? ''
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileFeedback, setProfileFeedback] = useState(null); // { type: 'success'|'error', msg }

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword:     '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState(null);
    const [showPasswords, setShowPasswords] = useState({ current: false, newPw: false, confirm: false });

    // Sync when user object changes
    useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.firstName ?? '',
                lastName:  user.lastName  ?? '',
                email:     user.email     ?? ''
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (profileFeedback) setProfileFeedback(null);
    };

    const handlePasswordChange = (e) => {
        setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (passwordFeedback) setPasswordFeedback(null);
    };

    // Submit profile update → PUT /users/me
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!profileForm.firstName.trim() || profileForm.firstName.trim().length < 2)
            return setProfileFeedback({ type: 'error', msg: 'O primeiro nome deve ter pelo menos 2 caracteres.' });
        if (!profileForm.lastName.trim() || profileForm.lastName.trim().length < 2)
            return setProfileFeedback({ type: 'error', msg: 'O apelido deve ter pelo menos 2 caracteres.' });

        setProfileLoading(true);
        try {
            await userService.updateMe({
                firstName: profileForm.firstName.trim(),
                lastName:  profileForm.lastName.trim(),
                email:     profileForm.email.trim()
            });
            setProfileFeedback({ type: 'success', msg: 'Perfil atualizado com sucesso.' });
        } catch (err) {
            setProfileFeedback({ type: 'error', msg: err.response?.data?.error || 'Erro ao atualizar perfil.' });
        } finally {
            setProfileLoading(false);
        }
    };

    // Submit password change → PATCH /users/me/password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!passwordForm.currentPassword)
            return setPasswordFeedback({ type: 'error', msg: 'Introduz a password atual.' });
        if (passwordForm.newPassword.length < 8)
            return setPasswordFeedback({ type: 'error', msg: 'A nova password deve ter pelo menos 8 caracteres.' });
        if (!/[A-Z]/.test(passwordForm.newPassword))
            return setPasswordFeedback({ type: 'error', msg: 'A nova password deve conter pelo menos uma maiúscula.' });
        if (!/[0-9]/.test(passwordForm.newPassword))
            return setPasswordFeedback({ type: 'error', msg: 'A nova password deve conter pelo menos um número.' });
        if (!/[@$!%*?&#\+\-_]/.test(passwordForm.newPassword))
            return setPasswordFeedback({ type: 'error', msg: 'A nova password deve conter um caractere especial.' });
        if (passwordForm.newPassword !== passwordForm.confirmPassword)
            return setPasswordFeedback({ type: 'error', msg: 'As passwords não coincidem.' });

        setPasswordLoading(true);
        try {
            await userService.changePasswordMe({
                currentPassword: passwordForm.currentPassword,
                newPassword:     passwordForm.newPassword
            });
            setPasswordFeedback({ type: 'success', msg: 'Password alterada com sucesso.' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordFeedback({ type: 'error', msg: err.response?.data?.error || 'Erro ao alterar password.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const toggleShow = (field) =>
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

    const initials = `${user?.firstName?.[0] ?? '?'}${user?.lastName?.[0] ?? ''}`.toUpperCase();
    const profileHasChanges =
        profileForm.firstName !== (user?.firstName ?? '') ||
        profileForm.lastName  !== (user?.lastName  ?? '') ||
        profileForm.email     !== (user?.email     ?? '');

    return (
        <div className={styles.container}>
            {/* Page header */}
            <header className={styles.pageHeader}>
                <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    O Meu Perfil
                </motion.h1>
                <p>Gere as tuas informações pessoais e segurança da conta.</p>
            </header>

            <div className={styles.layout}>
                {/* ─── Left: Identity Card ─── */}
                <aside className={styles.identityCard}>
                    <div className={styles.avatarLarge}>{initials}</div>
                    <h2 className={styles.fullName}>{user?.firstName} {user?.lastName}</h2>
                    <p className={styles.userEmail}>{user?.email}</p>

                    <div className={styles.infoChip}>
                        <ShieldCheck size={14} />
                        {ROLE_LABELS[user?.role] ?? user?.role}
                    </div>

                    {user?.company && (
                        <div className={styles.infoChip}>
                            <Building2 size={14} />
                            {user.company.name}
                        </div>
                    )}

                    <div className={styles.statusChip} data-status={user?.status}>
                        {STATUS_LABELS[user?.status] ?? user?.status}
                    </div>

                    <p className={styles.memberSince}>
                        Membro desde {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
                            : '—'}
                    </p>
                </aside>

                {/* ─── Right: Forms ─── */}
                <div className={styles.forms}>
                    {/* Personal Info Section */}
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <User size={18} />
                            <h3>Informações Pessoais</h3>
                        </div>

                        <FeedbackBanner
                            type={profileFeedback?.type}
                            message={profileFeedback?.msg}
                            onDismiss={() => setProfileFeedback(null)}
                        />

                        <form onSubmit={handleProfileSubmit} className={styles.form}>
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label htmlFor="prof-firstName" className={styles.label}>Primeiro Nome</label>
                                    <input
                                        id="prof-firstName"
                                        name="firstName"
                                        type="text"
                                        value={profileForm.firstName}
                                        onChange={handleProfileChange}
                                        className={styles.input}
                                        disabled={profileLoading}
                                        placeholder="João"
                                        autoComplete="given-name"
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label htmlFor="prof-lastName" className={styles.label}>Apelido</label>
                                    <input
                                        id="prof-lastName"
                                        name="lastName"
                                        type="text"
                                        value={profileForm.lastName}
                                        onChange={handleProfileChange}
                                        className={styles.input}
                                        disabled={profileLoading}
                                        placeholder="Silva"
                                        autoComplete="family-name"
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="prof-email" className={styles.label}>
                                    <Mail size={13} /> Email
                                </label>
                                <input
                                    id="prof-email"
                                    name="email"
                                    type="email"
                                    value={profileForm.email}
                                    onChange={handleProfileChange}
                                    className={styles.input}
                                    disabled={profileLoading}
                                    placeholder="email@exemplo.pt"
                                    autoComplete="email"
                                />
                            </div>

                            <div className={styles.cardFooter}>
                                <button
                                    type="submit"
                                    className={styles.saveBtn}
                                    disabled={profileLoading || !profileHasChanges}
                                >
                                    {profileLoading
                                        ? <><Loader2 size={16} className={styles.spinner} /> A guardar...</>
                                        : <><Save size={16} /> Guardar Alterações</>
                                    }
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Security Section */}
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Lock size={18} />
                            <h3>Alterar Password</h3>
                        </div>

                        <FeedbackBanner
                            type={passwordFeedback?.type}
                            message={passwordFeedback?.msg}
                            onDismiss={() => setPasswordFeedback(null)}
                        />

                        <form onSubmit={handlePasswordSubmit} className={styles.form}>
                            {[
                                { id: 'current', name: 'currentPassword', label: 'Password Atual', placeholder: '••••••••' },
                                { id: 'newPw',   name: 'newPassword',     label: 'Nova Password',   placeholder: 'Mín. 8 caracteres' },
                                { id: 'confirm', name: 'confirmPassword', label: 'Confirmar Nova Password', placeholder: '••••••••' }
                            ].map(field => (
                                <div key={field.id} className={styles.field}>
                                    <label htmlFor={`pw-${field.id}`} className={styles.label}>{field.label}</label>
                                    <div className={styles.passwordWrapper}>
                                        <input
                                            id={`pw-${field.id}`}
                                            name={field.name}
                                            type={showPasswords[field.id] ? 'text' : 'password'}
                                            value={passwordForm[field.name]}
                                            onChange={handlePasswordChange}
                                            className={styles.input}
                                            disabled={passwordLoading}
                                            placeholder={field.placeholder}
                                            autoComplete={field.id === 'current' ? 'current-password' : 'new-password'}
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeBtn}
                                            onClick={() => toggleShow(field.id)}
                                            tabIndex={-1}
                                            aria-label={showPasswords[field.id] ? 'Ocultar password' : 'Mostrar password'}
                                        >
                                            {showPasswords[field.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className={styles.cardFooter}>
                                <button
                                    type="submit"
                                    className={styles.saveBtn}
                                    disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword}
                                >
                                    {passwordLoading
                                        ? <><Loader2 size={16} className={styles.spinner} /> A alterar...</>
                                        : <><Lock size={16} /> Alterar Password</>
                                    }
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
