import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, FileQuestion, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { userService } from '../../services';
import UserDetailsModal from '../../components/Users/UserDetailsModal';
import UserUploadModal from '../../components/Users/UserUploadModal';
import { InvoicesSkeleton } from '../../components/Skeleton';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from './UserList.module.css';

const STATUS_FILTERS = [
    { id: 'ALL',      label: 'Todos' },
    { id: 'ACTIVE',   label: 'Ativos' },
    { id: 'PENDING',  label: 'Pendentes' },
    { id: 'INACTIVE', label: 'Inativos' },
];

const STATUS_CONFIG = {
    ACTIVE:   { label: 'Ativo',    cls: 'sActive' },
    PENDING:  { label: 'Pendente', cls: 'sPending' },
    INACTIVE: { label: 'Inativo',  cls: 'sInactive' },
    SUSPENDED:{ label: 'Suspenso', cls: 'sSuspended' },
    BLOCKED:  { label: 'Bloqueado',cls: 'sBlocked' }
};

const ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    COMPANY_ADMIN: 'Admin',
    USER: 'Utilizador'
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-PT') : '—';
const ITEMS_PER_PAGE = 15;

const UserList = () => {
    const { isAdmin, isSuperAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedUser, setSelectedUser] = useState(null);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Erro ao carregar utilizadores:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Reset pagination on filter or search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const filterCounts = useMemo(() => ({
        ALL:     users.length,
        ACTIVE:  users.filter(u => u.status === 'ACTIVE').length,
        PENDING: users.filter(u => u.status === 'PENDING').length,
        INACTIVE: users.filter(u => u.status === 'INACTIVE').length,
    }), [users]);

    const filteredUsers = useMemo(() => users.filter(u => {
        const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || (u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
        return matchesSearch && matchesStatus;
    }), [users, searchTerm, statusFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
    const currentData = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const startResult = filteredUsers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endResult = Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await userService.delete(deleteTarget.id);
            await fetchUsers();
        } catch (err) {
            console.error('Erro ao eliminar utilizador:', err);
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <div className={styles.page}>
            {/* ── Toolbar ────────────────────────────────────────── */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <h1 className={styles.title}>
                        {isSuperAdmin ? 'Gestão Global de Utilizadores' : 'Gestão de Utilizadores'}
                    </h1>
                </div>
                <div className={styles.toolbarRight}>
                    <div className={styles.searchBox}>
                        <Search size={14} className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            placeholder="Pesquisar por nome ou email…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterPills}>
                        {STATUS_FILTERS.map(f => (
                            <button
                                key={f.id}
                                className={`${styles.pill} ${statusFilter === f.id ? styles.pillActive : ''}`}
                                onClick={() => setStatusFilter(f.id)}
                            >
                                {f.label}
                                <span className={styles.pillCount}>{filterCounts[f.id] ?? 0}</span>
                            </button>
                        ))}
                    </div>
                    {isAdmin && (
                        <button className={styles.newBtn} onClick={() => setIsInviteOpen(true)}>
                            <Plus size={15} /> Convidar
                        </button>
                    )}
                </div>
            </div>

            {/* ── Data Table ─────────────────────────────────────── */}
            <div className={styles.tableWrap}>
                {loading ? (
                    <InvoicesSkeleton />
                ) : (
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th className={styles.colDesc}>Empresa</th>
                                    <th>Cargo</th>
                                    <th>Estado</th>
                                    <th className={styles.colRight}>Registado</th>
                                    <th className={styles.colCenter}>Ações</th>
                                </tr>
                            </thead>
                            <motion.tbody layout>
                                <AnimatePresence>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7}>
                                                <div className={styles.emptyContainer}>
                                                    <FileQuestion size={40} style={{ opacity: 0.5, marginBottom: '10px' }} />
                                                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Nenhum resultado encontrado</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentData.map(u => (
                                            <motion.tr
                                                key={u.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className={styles.row}
                                                onClick={() => setSelectedUser(u)}
                                            >
                                                <td className={styles.cellBold} data-label="Nome">{u.firstName} {u.lastName}</td>
                                                <td className={styles.cellMeta} data-label="Email">{u.email}</td>
                                                <td className={styles.cellDesc} data-label="Empresa">{u.company?.name || '—'}</td>
                                                <td data-label="Cargo"><span className={styles.roleText}>{ROLE_LABELS[u.role] || u.role}</span></td>
                                                <td data-label="Estado">
                                                    <span className={`${styles.badge} ${styles[STATUS_CONFIG[u.status]?.cls] ?? ''}`}>
                                                        {STATUS_CONFIG[u.status]?.label ?? u.status}
                                                    </span>
                                                </td>
                                                <td className={`${styles.cellMeta} ${styles.colRight}`} data-label="Registado">{fmtDate(u.createdAt)}</td>
                                                <td className={styles.colCenter} data-label="Ações">
                                                    <div className={styles.actions} onClick={e => e.stopPropagation()}>
                                                        <button
                                                            className={`${styles.actBtn} ${styles.actEdit}`}
                                                            title="Editar"
                                                            onClick={() => setSelectedUser(u)}
                                                        ><Edit2 size={13} /></button>

                                                        {(isAdmin && u.role !== 'SUPER_ADMIN') && (
                                                            <button
                                                                className={`${styles.actBtn} ${styles.actDelete}`}
                                                                title="Eliminar"
                                                                onClick={() => setDeleteTarget(u)}
                                                            ><Trash2 size={13} /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </motion.tbody>
                        </table>
                    </div>
                )}
                
                {/* ── Pagination ─────────────────────────────────────── */}
                {!loading && filteredUsers.length > 0 && (
                    <div className={styles.pagination}>
                        <span className={styles.pageInfo}>
                            A mostrar {startResult} a {endResult} de {filteredUsers.length} resultados
                        </span>
                        <div className={styles.pageControls}>
                            <button
                                className={styles.pageBtn}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                Anterior
                            </button>
                            <button
                                className={styles.pageBtn}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ─────────────────────────────────────────── */}
            <UserDetailsModal
                isOpen={!!selectedUser}
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onUpdateSuccess={fetchUsers}
            />
            <UserUploadModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onUploadSuccess={fetchUsers}
            />
            <ConfirmationModal
                isOpen={!!deleteTarget}
                title="Eliminar Utilizador"
                message={`Tem a certeza que deseja eliminar o utilizador ${deleteTarget?.firstName} ${deleteTarget?.lastName}?`}
                confirmText="Sim, Eliminar"
                onConfirm={confirmDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default UserList;
