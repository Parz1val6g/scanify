import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, FileQuestion, LayoutGrid } from 'lucide-react';
import { invoiceService } from '../../services';
import { Input, InvoiceCard, InvoiceDetailModal, InvoiceUploadModal } from '../../components';
import { InvoicesSkeleton } from '../../components/Skeleton';
import styles from './InvoiceList.module.css';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    
    // Modal states
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const data = await invoiceService.getAll();
            setInvoices(data);
        } catch (error) {
            console.error("Erro ao carregar faturas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const filterCounts = useMemo(() => {
        const counts = {
            ALL: invoices.length,
            PENDING: invoices.filter(i => i.status === 'PENDING').length,
            PAID: invoices.filter(i => i.status === 'PAID').length,
            REJECTED: invoices.filter(i => i.status === 'REJECTED').length
        };
        return counts;
    }, [invoices]);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch = 
                (invoice.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (invoice.nif?.includes(searchTerm));
            
            const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, statusFilter]);

    const handleDeleteInvoice = async (invoice) => {
        if (window.confirm(`Tem a certeza que deseja eliminar a fatura de ${invoice.nif}?`)) {
            try {
                await invoiceService.delete(invoice.id);
                fetchInvoices();
            } catch (err) {
                console.error("Erro ao eliminar fatura:", err);
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
                        Gestão de Faturas
                    </motion.h1>
                    <p>Visualize e gira o fluxo de faturas e extrações OCR com precisão.</p>
                </div>
                <button 
                    className={styles.newInvoiceBtn}
                    onClick={() => setIsUploadOpen(true)}
                >
                    <Plus size={20} />
                    <span className={styles.btnText}>Nova Fatura</span>
                </button>
            </header>

            <div className={styles.filterBar}>
                <div className={styles.searchWrapper}>
                    <Input 
                        placeholder="Pesquisar por NIF ou descrição..."
                        icon={Search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.statusFilters}>
                    {[
                        { id: 'ALL', label: 'Todas' },
                        { id: 'PENDING', label: 'Pendentes' },
                        { id: 'PAID', label: 'Pagas' },
                        { id: 'REJECTED', label: 'Rejeitadas' }
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
                <InvoicesSkeleton />
            ) : (
                <>
                    {filteredInvoices.length === 0 ? (
                        <div className={styles.emptyState}>
                            <FileQuestion size={64} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
                            <h3>{statusFilter === 'ALL' ? 'Sem faturas registadas' : `Nenhuma fatura ${statusFilter === 'PENDING' ? 'pendente' : statusFilter === 'PAID' ? 'paga' : 'rejeitada'} encontrada`}</h3>
                            <p>Tente ajustar os filtros ou carregue uma nova fatura para começar.</p>
                        </div>
                    ) : (
                        <motion.div 
                            layout
                            className={styles.invoiceGrid}
                        >
                            <AnimatePresence>
                                {filteredInvoices.map(invoice => (
                                    <InvoiceCard 
                                        key={invoice.id} 
                                        invoice={invoice} 
                                        onClick={() => setSelectedInvoice(invoice)}
                                        onDelete={handleDeleteInvoice}
                                        onDownload={(inv) => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${invoiceService.getDownloadUrl(inv.id)}`, '_blank')}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </>
            )}

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
        </div>
    );
};

export default InvoiceList;
