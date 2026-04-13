import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Eye, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import styles from './InvoiceCard.module.css';
import { invoiceService } from '../../services';
import SmoothImage from '../Common/SmoothImage';

const InvoiceCard = ({ invoice, onClick, onDelete, onDownload }) => {
    const { 
        id,
        nif, 
        value, 
        description, 
        date, 
        status = 'PENDING' 
    } = invoice;

    const statusMap = {
        'PENDING': 'Pendente',
        'PAID': 'Pago',
        'CANCELLED': 'Cancelado',
        'REJECTED': 'Rejeitado',
        'PROCESSED': 'Processado'
    };

    const formattedDate = new Date(date).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const formattedValue = new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);

    const imageUrl = id ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${invoiceService.getDownloadUrl(id)}` : null;

    const handleAction = (e, callback) => {
        e.stopPropagation();
        if (callback) callback(invoice);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick && onClick(invoice);
        }
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className={styles.card}
            onClick={() => onClick && onClick(invoice)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Fatura de ${nif || 'NIF desconhecido'}, valor ${formattedValue} euros, estado ${statusMap[status]}`}
        >
            <div className={`${styles.cardGlow} ${styles['glow' + status]}`} />
            
            <div className={styles.actionsOverlay}>
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={styles.actionBtn}
                    onClick={(e) => handleAction(e, onClick)}
                    title="Visualizar Detalhes"
                    aria-label="Visualizar Detalhes"
                >
                    <Eye size={18} />
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={styles.actionBtn}
                    onClick={(e) => handleAction(e, onDownload)}
                    title="Descarregar Fatura"
                    aria-label="Descarregar Fatura"
                >
                    <Download size={18} />
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={(e) => handleAction(e, onDelete)}
                    title="Eliminar Fatura"
                    aria-label="Eliminar Fatura"
                >
                    <Trash2 size={18} />
                </motion.button>
            </div>

            <div className={styles.thumbnailArea}>
                <SmoothImage 
                    src={imageUrl} 
                    alt={description} 
                    className={styles.thumbnail} 
                    fallbackIcon={FileText}
                />
            </div>

            <div className={styles.header}>
                <span className={`${styles.statusBadge} ${styles['status' + status]}`}>
                    {statusMap[status] || status}
                </span>
            </div>

            <div className={styles.content}>
                <span className={styles.nif}>NIF: {nif || 'Não detetado'}</span>
                <span className={styles.description}>{description || 'Sem descrição'}</span>
            </div>

            <div className={styles.footer}>
                <div className={styles.date}>
                    <Calendar size={12} />
                    {formattedDate}
                </div>
                <div className={styles.valueContainer}>
                    <span className={styles.valueCurrency}>€</span>
                    <span className={styles.value}>{formattedValue}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default InvoiceCard;
