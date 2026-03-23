import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, FileQuestion, LayoutGrid } from 'lucide-react';
import { userService } from '../../services';
import { Input, UserCard, UserDetailsModal, UserUploadModal } from '../../components';
import { UsersSkeleton } from '../../components/Skeleton';
import styles from './UserList.module.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modal states
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error("Erro ao carregar utilizadores:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filterCounts = useMemo(() => {
        const counts = {
            ALL: users.length,
            ACTIVE: users.filter(i => i.status === 'ACTIVE').length,
            INACTIVE: users.filter(i => i.status === 'INACTIVE').length,
            PENDING: users.filter(i => i.status === 'PENDING').length
        };
        return counts;
    }, [users]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email?.includes(searchTerm));

            const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, statusFilter]);

    const handleDeleteUser = async (user) => {
        if (window.confirm(`Tem a certeza que deseja eliminar o utilizador ${user.name}?`)) {
            try {
                await userService.delete(user.id);
                fetchUsers();
            } catch (err) {
                console.error("Erro ao eliminar utilizador:", err);
            }
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Gestão de Utilizadores
                    </motion.h1>
                    <p>Visualize e gere o fluxo de utilizadores com precisão.</p>
                </div>
                <button
                    className={styles.newUserBtn}
                    onClick={() => setIsUploadOpen(true)}
                >
                    <Plus size={20} />
                    <span className={styles.btnText}>Novo Utilizador</span>
                </button>
            </header>

            <div className={styles.filterBar}>
                <div className={styles.searchWrapper}>
                    <Input
                        placeholder="Pesquisar por nome ou email..."
                        icon={Search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.statusFilters}>
                    {[
                        { id: 'ALL', label: 'Todos' },
                        { id: 'ACTIVE', label: 'Ativos' },
                        { id: 'INACTIVE', label: 'Inativos' },
                        { id: 'PENDING', label: 'Pendentes' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            className={`${styles.statusBtn} ${statusFilter === filter.id ? styles.statusBtnActive : ''}`}
                            onClick={() => setStatusFilter(filter.id)}
                        >
                            {filter.label}
                            <span className={styles.countBadge}>{filterCounts[filter.id] || 0}</span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <UsersSkeleton />
            ) : (
                <>
                    {filteredUsers.length === 0 ? (
                        <div className={styles.emptyState}>
                            <FileQuestion size={64} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
                            <h3>{statusFilter === 'ALL' ? 'Sem utilizadores registados' : `Nenhum utilizador ${statusFilter === 'ACTIVE' ? 'ativo' : statusFilter === 'INACTIVE' ? 'inativo' : 'pendente'} encontrado`}</h3>
                            <p>Tente ajustar os filtros ou carregue um novo utilizador para começar.</p>
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className={styles.userGrid}
                        >
                            <AnimatePresence>
                                {filteredUsers.map(user => (
                                    <UserCard
                                        key={user.id}
                                        user={user}
                                        onClick={() => setSelectedUser(user)}
                                        onDelete={handleDeleteUser}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </>
            )}

            <UserDetailsModal
                isOpen={!!selectedUser}
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onUpdateSuccess={fetchUsers}
            />

            <UserUploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={fetchUsers}
            />
        </div>
    );
};

export default UserList;
