import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Landmark, FileText, Image as ImageIcon, CheckCircle2, Clock, AlertCircle, Save } from 'lucide-react';
import { invoiceService } from '../../services';
import styles from './InvoiceDetailModal.module.css';

const InvoiceDetailModal = ({ isOpen, onClose, invoice, onUpdateSuccess }) => {
    const [isZoomed, setIsZoomed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(invoice?.status || 'PENDING');

    if (!invoice) return null;

    const { 
        id,
        nif, 
        value, 
        description, 
        date, 
        imagePath
    } = invoice;

    const statusOptions = [
        { id: 'PENDING', label: 'Pendente', icon: Clock },
        { id: 'PAID', label: 'Pago', icon: CheckCircle2 },
        { id: 'REJECTED', label: 'Rejeitado', icon: AlertCircle }
    ];

    const formattedDate = new Date(date).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const formattedValue = new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);

    const imageUrl = id ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${invoiceService.getDownloadUrl(id)}` : imagePath;

    const handleUpdateStatus = async (newStatus) => {
        if (newStatus === invoice.status) return;
        setSaving(true);
        try {
            await invoiceService.update(id, { status: newStatus });
            setCurrentStatus(newStatus);
            if (onUpdateSuccess) onUpdateSuccess();
        } catch (error) {
            console.error("Erro ao atualizar estado:", error);
            alert("Não foi possível atualizar o estado da fatura.");
        } finally {
            setSaving(false);
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
                    onClick={onClose}
                >
                    <motion.div 
                        className={styles.modal}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.header}>
                            <h2>Detalhes da Fatura</h2>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.content}>
                            <div className={styles.imageSection}>
                                <div 
                                    className={`${styles.imageWrapper} ${isZoomed ? styles.zoomed : ''}`}
                                    onClick={() => setIsZoomed(!isZoomed)}
                                >
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Fatura" />
                                    ) : (
                                        <div className={styles.placeholderImage}>
                                            <ImageIcon size={64} />
                                            <span>Sem imagem disponível</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.dataSection}>
                                <div className={styles.infoGroup}>
                                    <span className={styles.label}>Alterar Estado</span>
                                    <div className={styles.statusSelector}>
                                        {statusOptions.map(opt => {
                                            const Icon = opt.icon;
                                            const isActive = (invoice.status === opt.id);
                                            return (
                                                <button
                                                    key={opt.id}
                                                    disabled={saving}
                                                    className={`${styles.statusOption} ${isActive ? `${styles.statusActive} ${styles['status' + opt.id]}` : ''}`}
                                                    onClick={() => handleUpdateStatus(opt.id)}
                                                >
                                                    <Icon size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={styles.infoGroup}>
                                    <span className={styles.label}>Valor Global</span>
                                    <span className={styles.valueHighlight}>{formattedValue}</span>
                                </div>

                                <div className={styles.infoGroup}>
                                    <span className={styles.label}>NIF Contribuinte</span>
                                    <div className={styles.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Landmark size={20} />
                                        {nif || 'Não identificado'}
                                    </div>
                                </div>

                                <div className={styles.infoGroup}>
                                    <span className={styles.label}>Data do Documento</span>
                                    <div className={styles.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={20} />
                                        {formattedDate}
                                    </div>
                                </div>

                                <div className={styles.infoGroup}>
                                    <span className={styles.label}>Referência / Descrição</span>
                                    <div className={styles.value} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-md)' }}>
                                        <FileText size={20} style={{ marginTop: '4px' }} />
                                        {description || 'Sem descrição registada.'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <button className="btn-secondary" onClick={onClose} disabled={saving}>Fechar</button>
                            <button className="btn-primary" onClick={() => handleUpdateStatus(invoice.status)} disabled={saving}>
                                <Save size={18} />
                                Guardar Alterações
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InvoiceDetailModal;
