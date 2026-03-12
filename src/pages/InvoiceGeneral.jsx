import styles from './InvoiceGeneral.module.css';

import { useState, useMemo, useCallback } from 'react';
import { Input } from '../components'; // already using index.js

export const InvoiceGeneral = () => {
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState([]);
    const [invoices, setInvoices] = useState([]); // Assume fetch elsewhere

    // Debounce function
    const debounce = (fn, delay = 300) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };

    // Debounced filter implementation fixed
    const filterInvoices = useCallback((value) => {
        setFiltered(
            invoices.filter(inv =>
                inv.name?.toLowerCase().includes(value.toLowerCase())
            )
        );
    }, [invoices]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        filterInvoices(e.target.value);
    };

    return (
        <div>
            <Input
                type="text"
                label="Pesquisar Fatura"
                value={search}
                onChange={handleSearch}
            />
            {/* Render filtered invoices */}
        </div>
    );
}

export default InvoiceGeneral;