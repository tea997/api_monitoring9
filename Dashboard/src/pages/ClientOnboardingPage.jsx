import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../api/api';
import { useToast } from '../contexts/ToastContext';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '../components/ui';
import {
    Building2, Plus, Globe, Mail, FileText, Loader2, CheckCircle2,
} from 'lucide-react';
import styles from '../styles/modules/pages/PageComponents.module.scss';

function ClientOnboardingPage() {
    const addToast = useToast();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [website, setWebsite] = useState('');
    const [showForm, setShowForm] = useState(false);

    const { data: clientsData, isPending } = useQuery({
        queryKey: ['clients'],
        queryFn: clientApi.getClients,
    });

    const createMutation = useMutation({
        mutationFn: (data) => clientApi.createClient(data),
        onSuccess: () => {
            addToast('Client created successfully!', 'success');
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setName('');
            setEmail('');
            setDescription('');
            setWebsite('');
            setShowForm(false);
        },
        onError: (err) => {
            addToast(err.response?.data?.message || 'Failed to create client', 'error');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate({ name, email, description, website });
    };

    const clients = clientsData?.data?.clients || [];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.headerWithActions}>
                    <div>
                        <h2>Client Management</h2>
                        <p>Onboard and manage your clients</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.625rem 1.25rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: 'linear-gradient(135deg, hsl(265, 82%, 50%), hsl(245, 80%, 55%))',
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px hsla(265, 82%, 50%, 0.3)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <Plus style={{ width: '1rem', height: '1rem' }} />
                        {showForm ? 'Cancel' : 'New Client'}
                    </button>
                </div>
            </div>

            {showForm && (
                <Card className={styles.sectionCard}>
                    <CardHeader>
                        <div className={styles.cardTitleRow}>
                            <Building2 className={styles.cardTitleIcon} aria-hidden="true" />
                            <CardTitle>Create New Client</CardTitle>
                        </div>
                        <CardDescription>Fill in the details to onboard a new client</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className={styles.formGroup}>
                            <div className={styles.formRow}>
                                <label className={styles.formLabel} htmlFor="client-name">Client Name *</label>
                                <div className={styles.iconTextGroup}>
                                    <Building2 />
                                    <input
                                        id="client-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Acme Corporation"
                                        disabled={createMutation.isPending}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.formLabel} htmlFor="client-email">Email *</label>
                                <div className={styles.iconTextGroup}>
                                    <Mail />
                                    <input
                                        id="client-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="contact@acme.com"
                                        disabled={createMutation.isPending}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.formLabel} htmlFor="client-description">Description</label>
                                <div className={styles.iconTextGroup}>
                                    <FileText />
                                    <input
                                        id="client-description"
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description of the client"
                                        disabled={createMutation.isPending}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.formLabel} htmlFor="client-website">Website</label>
                                <div className={styles.iconTextGroup}>
                                    <Globe />
                                    <input
                                        id="client-website"
                                        type="url"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://acme.com"
                                        disabled={createMutation.isPending}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div className={styles.actionRow}>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.625rem 1.5rem',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, hsl(265, 82%, 50%), hsl(245, 80%, 55%))',
                                        color: 'white',
                                        fontWeight: '500',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px hsla(265, 82%, 50%, 0.3)',
                                    }}
                                >
                                    {createMutation.isPending ? (
                                        <><Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} /> Creating...</>
                                    ) : (
                                        <><CheckCircle2 style={{ width: '1rem', height: '1rem' }} /> Create Client</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className={styles.sectionCard}>
                <CardHeader>
                    <div className={styles.cardTitleRow}>
                        <Building2 className={styles.cardTitleIcon} aria-hidden="true" />
                        <CardTitle>Onboarded Clients</CardTitle>
                    </div>
                    <CardDescription>
                        {isPending ? 'Loading...' : `${clients.length} client(s) registered`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isPending ? (
                        <div className={styles.emptyState}>
                            <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
                            <p>Loading clients...</p>
                        </div>
                    ) : clients.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Building2 />
                            <p>No clients onboarded yet. Create your first client above.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Name</th>
                                        <th style={thStyle}>Slug</th>
                                        <th style={thStyle}>Email</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr key={client._id} style={trStyle}>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 500 }}>{client.name}</div>
                                                {client.description && (
                                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                                        {client.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={tdStyle}>
                                                <code style={{ fontSize: '0.8rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: 'hsl(var(--muted))' }}>
                                                    {client.slug}
                                                </code>
                                            </td>
                                            <td style={tdStyle}>{client.email}</td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    padding: '0.25rem 0.625rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    background: client.isActive !== false ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                                    color: client.isActive !== false ? '#4ade80' : '#f87171',
                                                }}>
                                                    {client.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                {new Date(client.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

const inputStyle = {
    flex: 1,
    padding: '0.625rem 0.75rem',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.375rem',
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
};

const thStyle = {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid hsl(var(--border))',
    color: 'hsl(var(--muted-foreground))',
    fontWeight: 500,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const tdStyle = {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid hsl(var(--border) / 0.5)',
};

const trStyle = {
    transition: 'background 0.15s ease',
};

export default ClientOnboardingPage;
