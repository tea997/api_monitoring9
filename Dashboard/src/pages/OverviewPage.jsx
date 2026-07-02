import { useMemo, useState } from 'react';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import StatsGrid from '../components/StatsGrid';
import TopEndpoints from '../components/TopEndpoints';
import { ApiHitsChart, StatusDistributionChart } from '../components/charts';
import { PageStatus } from '../components/ui';
import styles from '../styles/modules/pages/PageComponents.module.scss';

const TIME_RANGES = [
    { label: 'Daily', value: 'daily', ms: 24 * 60 * 60 * 1000 },
    { label: 'Weekly', value: 'weekly', ms: 7 * 24 * 60 * 60 * 1000 },
    { label: 'Monthly', value: 'monthly', ms: 30 * 24 * 60 * 60 * 1000 },
    { label: 'All Time', value: 'all', ms: null },
];

export function OverviewPage() {
    const [activeRange, setActiveRange] = useState('daily');
    const { data, isPending, error, refetch } = useDashboardQuery();

    const stats = data?.data?.stats ?? null;
    const topEndpoints = data?.data?.topEndpoints ?? [];

    const statusData = useMemo(() => {
        if (!stats) return null;
        return {
            labels: ['Success (2xx)', 'Errors (4xx/5xx)'],
            values: [stats.successHits, stats.errorHits],
        };
    }, [stats]);

    if (isPending || error || !data) {
        return (
            <PageStatus
                isLoading={isPending || !data}
                error={error}
                onRetry={refetch}
                loadingText="Loading dashboard..."
                errorText="Failed to load dashboard data"
            />
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.headerWithActions}>
                    <div>
                        <h2>Overview</h2>
                        <p>Welcome to your API monitoring dashboard</p>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '0.25rem',
                        background: 'hsl(var(--muted) / 0.5)',
                        borderRadius: '0.5rem',
                        padding: '0.25rem',
                    }}>
                        {TIME_RANGES.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setActiveRange(range.value)}
                                style={{
                                    padding: '0.375rem 0.875rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    background: activeRange === range.value
                                        ? 'linear-gradient(135deg, hsl(265, 82%, 50%), hsl(245, 80%, 55%))'
                                        : 'transparent',
                                    color: activeRange === range.value
                                        ? 'white'
                                        : 'hsl(var(--muted-foreground))',
                                    boxShadow: activeRange === range.value
                                        ? '0 2px 8px hsla(265, 82%, 50%, 0.3)'
                                        : 'none',
                                }}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <StatsGrid stats={stats} />

            <div className={styles.gridTwoCols}>
                <ApiHitsChart stats={stats} />
                <StatusDistributionChart data={statusData} />
            </div>

            <TopEndpoints endpoints={topEndpoints} />
        </div>
    );
}
