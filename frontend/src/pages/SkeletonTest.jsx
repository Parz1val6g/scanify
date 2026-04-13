import { InvoicesSkeleton, SkeletonBlock } from '../components/Skeleton';

export function SkeletonTest() {
    return (
        <div style={{ padding: 'var(--space-xl)', background: 'var(--bg-body)', minHeight: '100vh' }}>
            <InvoicesSkeleton />
            <div style={{ marginTop: 'var(--space-xl)' }}>
                <SkeletonBlock className="title" />
                <SkeletonBlock className="textLine" />
                <SkeletonBlock className="tableRow" />
            </div>
        </div>
    );
}

export default SkeletonTest;
