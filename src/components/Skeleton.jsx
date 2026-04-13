import styles from './Skeleton.module.css';
import { useEffect } from 'react';

export function SkeletonBlock({ className = '', style = {} }) {
    return (
        <div
            className={[styles.skeleton, className ? styles[className] : ''].join(' ').trim()}
            style={style}
        />
    );
}

const columns = [
    { key: 'colId', width: 80 },
    { key: 'colName', flex: 1 },
    { key: 'colDate', width: 120 },
    { key: 'colValue', width: 120 },
    { key: 'colActions', width: 80 },
];

function SkeletonRow({ height = 'var(--space-xl)', style = {} }) {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'nowrap',
                overflow: 'hidden',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-md)',
                ...style,
            }}
        >
            {columns.map(col => (
                <SkeletonBlock
                    key={col.key}
                    className={col.key}
                    style={{
                        height,
                        borderRadius: 6,
                        width: col.width,
                        flex: col.flex || undefined,
                    }}
                />
            ))}
        </div>
    );
}

export function InvoicesSkeleton({ rowsCount = 12 }) {
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = original;
        };
    }, []);
    return (
        <div
            style={{
                padding: 'var(--space-lg)',
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                <SkeletonBlock className="title" style={{ width: '30%' }} />
                <SkeletonBlock style={{ width: 120, height: 40, borderRadius: 8 }} />
            </div>
            {/* Table Header */}
            <SkeletonRow height={24} style={{ marginBottom: 'var(--space-md)' }} />
            {/* Table Rows */}
            {Array.from({ length: rowsCount }).map((_, idx) => (
                <SkeletonRow key={idx} />
            ))}
        </div>
    );
}

export function DashboardSkeleton() {
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = original;
        };
    }, []);
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-lg)',
            }}
        >
            <div style={{ display: 'flex', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                <SkeletonBlock className="statCard" style={{ height: 80, width: 180 }} />
                <SkeletonBlock className="statCard" style={{ height: 80, width: 180 }} />
            </div>
        </div>
    );
}
