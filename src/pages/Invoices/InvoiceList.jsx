import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, FileQuestion, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { invoiceService } from '../../services';
import InvoiceDetailModal from '../../components/Invoices/InvoiceDetailModal';
import InvoiceUploadModal from '../../components/Invoices/InvoiceUploadModal';
import { InvoicesSkeleton } from '../../components/Skeleton';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from './InvoiceList.module.css';

const STATUS_FILTERS = [
    { id: 'ALL',      label: 'Todas' },
    { id: 'PENDING',  label: 'Pendentes' },
    { id: 'PAID',     label: 'Pagas' },
    { id: 'REJECTED', label: 'Rejeitadas' },
];

const STATUS_CONFIG = {
    PENDING:  { label: 'Pendente',  cls: 'sPending'  },
    PAID:     { label: 'Pago',      cls: 'sPaid'      },
    REJECTED: { label: 'Rejeitado', cls: 'sRejected'  },
    CANCELLED:{ label: 'Cancelado', cls: 'sCancelled' },
};

const fmt = {
    date:     (d) => d ? new Date(d).toLocaleDateString('pt-PT') : '—',
    currency: (v) => v != null
        ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v)
        : '—',
};

const ITEMS_PER_PAGE = 15;

const InvoiceList = () => {
    const { user, isAdmin, isSuperAdmin } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [statusActionTarget, setStatusActionTarget] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const data = await invoiceService.getAll();
            setInvoices(data);
        } catch (error) {
            console.error('Erro ao carregar faturas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvoices(); }, []);

    // Reset pagination on filter or search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const filterCounts = useMemo(() => ({
        ALL:      invoices.length,
        PENDING:  invoices.filter(i => i.status === 'PENDING').length,
        PAID:     invoices.filter(i => i.status === 'PAID').length,
        REJECTED: invoices.filter(i => i.status === 'REJECTED').length,
    }), [invoices]);

    const filteredInvoices = useMemo(() => invoices.filter(inv => {
        const matchesSearch =
            (inv.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (inv.nif?.includes(searchTerm));
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    }), [invoices, searchTerm, statusFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE) || 1;
    const currentData = filteredInvoices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const startResult = filteredInvoices.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endResult = Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length);

    const canDeleteInvoice = (inv) => isSuperAdmin || inv?.userId === user?.id;

    const handleDeleteInvoice = (inv) => { if (canDeleteInvoice(inv)) setDeleteTarget(inv); };
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try { await invoiceService.delete(deleteTarget.id); await fetchInvoices(); }
        catch (err) { console.error(err); }
        finally { setDeleteTarget(null); }
    };

    const handleStatusChange = (inv, newStatus) => { if (isAdmin) setStatusActionTarget({ invoice: inv, newStatus }); };
    const confirmStatusChange = async () => {
        if (!statusActionTarget) return;
        const { invoice, newStatus } = statusActionTarget;
        try { await invoiceService.update(invoice.id, { status: newStatus }); await fetchInvoices(); }
        catch (err) { console.error(err); }
        finally { setStatusActionTarget(null); }
    };

    return (
        <div className={styles.page}>
            {/* ── Toolbar ────────────────────────────────────────── */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <h1 className={styles.title}>
                        {isSuperAdmin ? 'Gestão Global de Faturas' : isAdmin ? 'Faturas da Empresa' : 'As Minhas Faturas'}
                    </h1>
                    {isAdmin && (
                        <span className={styles.rbacBadge}>
                            <CheckCircle2 size={11} /> Admin
                        </span>
                    )}
                </div>
                <div className={styles.toolbarRight}>
                    <div className={styles.searchBox}>
                        <Search size={14} className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            placeholder="NIF ou descrição…"
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
                    <button className={styles.newBtn} onClick={() => setIsUploadOpen(true)}>
                        <Plus size={15} /> Nova Fatura
                    </button>
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
                                    <th>Data</th>
                                    <th>NIF</th>
                                    <th className={styles.colDesc}>Descrição</th>
                                    <th className={styles.colRight}>Valor</th>
                                    <th>Estado</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <motion.tbody layout>
                                <AnimatePresence>
                                    {filteredInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
                                                <div className={styles.emptyContainer}>
                                                    <FileQuestion size={40} style={{ opacity: 0.5, marginBottom: '10px' }} />
                                                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Nenhum resultado encontrado</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentData.map(inv => (
                                            <motion.tr
                                                key={inv.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className={styles.row}
                                                onClick={() => setSelectedInvoice(inv)}
                                            >
                                                <td className={styles.cellMeta} data-label="Data">{fmt.date(inv.createdAt)}</td>
                                                <td className={styles.cellMono} data-label="NIF">{inv.nif ?? '—'}</td>
                                                <td className={styles.cellDesc} data-label="Descrição">{inv.description ?? '—'}</td>
                                                <td className={`${styles.cellMono} ${styles.colRight}`} data-label="Valor">{fmt.currency(inv.totalAmount)}</td>
                                                <td data-label="Estado">
                                                    <span className={`${styles.badge} ${styles[STATUS_CONFIG[inv.status]?.cls] ?? ''}`}>
                                                        {STATUS_CONFIG[inv.status]?.label ?? inv.status}
                                                    </span>
                                                </td>
                                                <td data-label="Ações">
                                                    <div className={styles.actions} onClick={e => e.stopPropagation()}>
                                                        <button
                                                            className={styles.actBtn}
                                                            title="Descarregar"
                                                            onClick={() => window.open(
                                                                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${invoiceService.getDownloadUrl(inv.id)}`,
                                                                '_blank'
                                                            )}
                                                        >↓</button>

                                                        {isAdmin && inv.status === 'PENDING' && (
                                                            <button
                                                                className={`${styles.actBtn} ${styles.actApprove}`}
                                                                title="Aprovar"
                                                                onClick={() => handleStatusChange(inv, 'PAID')}
                                                            ><CheckCircle2 size={13} /></button>
                                                        )}

                                                        {isAdmin && inv.status === 'PENDING' && (
                                                            <button
                                                                className={`${styles.actBtn} ${styles.actReject}`}
                                                                title="Rejeitar"
                                                                onClick={() => handleStatusChange(inv, 'REJECTED')}
                                                            ><XCircle size={13} /></button>
                                                        )}

                                                        {canDeleteInvoice(inv) && (
                                                            <button
                                                                className={`${styles.actBtn} ${styles.actDelete}`}
                                                                title="Eliminar"
                                                                onClick={() => handleDeleteInvoice(inv)}
                                                            >✕</button>
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
                {!loading && filteredInvoices.length > 0 && (
                    <div className={styles.pagination}>
                        <span className={styles.pageInfo}>
                            A mostrar {startResult} a {endResult} de {filteredInvoices.length} resultados
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
            <InvoiceDetailModal
                isOpen={!!selectedInvoice}
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                onUpdateSuccess={fetchInvoices}
            />
            <InvoiceUploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={fetchInvoices}
            />
            <ConfirmationModal
                isOpen={!!deleteTarget}
                title="Eliminar Fatura"
                message={`Tem a certeza que deseja eliminar a fatura de NIF ${deleteTarget?.nif ?? ''}? Esta ação não pode ser revertida.`}
                confirmText="Sim, Eliminar"
                onConfirm={confirmDelete}
                onClose={() => setDeleteTarget(null)}
            />
            <ConfirmationModal
                isOpen={!!statusActionTarget}
                title={statusActionTarget?.newStatus === 'PAID' ? 'Aprovar Fatura' : 'Rejeitar Fatura'}
                message={
                    statusActionTarget?.newStatus === 'PAID'
                        ? `Aprovar a fatura de NIF ${statusActionTarget?.invoice?.nif ?? ''}?`
                        : `Rejeitar a fatura de NIF ${statusActionTarget?.invoice?.nif ?? ''}?`
                }
                confirmText={statusActionTarget?.newStatus === 'PAID' ? 'Aprovar' : 'Rejeitar'}
                onConfirm={confirmStatusChange}
                onClose={() => setStatusActionTarget(null)}
            />
        </div>
    );
};

export default InvoiceList;
