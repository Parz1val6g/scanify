import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { Input } from '../../components';
import { invoiceService } from '../../services';
import styles from './InvoiceUploadModal.module.css';

const InvoiceUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nif: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });
    
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('nif', formData.nif);
            uploadData.append('value', formData.value);
            uploadData.append('date', formData.date);
            uploadData.append('description', formData.description);

            await invoiceService.upload(uploadData);
            
            if (onUploadSuccess) onUploadSuccess();
            onClose();
            // Reset state
            setFile(null);
            setPreview(null);
            setFormData({
                nif: '',
                value: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
        } catch (error) {
            console.error("Erro no upload:", error);
            alert("Erro ao carregar fatura. Por favor, tente novamente.");
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
                    onClick={!loading ? onClose : undefined}
                >
                    <motion.div 
                        className={styles.modal}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.header}>
                            <h2>Nova Fatura</h2>
                            <button className={styles.closeBtn} onClick={onClose} disabled={loading}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.content}>
                                <div 
                                    className={styles.uploadZone}
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <input 
                                        type="file" 
                                        hidden 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange}
                                        accept="image/*,application/pdf"
                                    />
                                    {preview ? (
                                        <img src={preview} alt="Preview" className={styles.preview} />
                                    ) : (
                                        <>
                                            <Upload size={32} />
                                            <span>Clique para carregar imagem ou PDF</span>
                                            <small>Formatos aceites: JPG, PNG, PDF</small>
                                        </>
                                    )}
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.fullWidth}>
                                        <Input 
                                            label="Descrição da Despesa"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Almoço de Negócios"
                                            required
                                        />
                                    </div>
                                    <Input 
                                        label="NIF Emissor"
                                        name="nif"
                                        value={formData.nif}
                                        onChange={handleInputChange}
                                        placeholder="500000000"
                                        required
                                    />
                                    <Input 
                                        label="Valor Total (€)"
                                        name="value"
                                        type="number"
                                        step="0.01"
                                        value={formData.value}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        required
                                    />
                                    <div className={styles.fullWidth}>
                                        <Input 
                                            label="Data de Emissão"
                                            name="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.footer}>
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.submitBtn}
                                    disabled={loading || !file}
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw size={18} className={styles.spinner} />
                                            A Processar...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Submeter Fatura
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InvoiceUploadModal;
