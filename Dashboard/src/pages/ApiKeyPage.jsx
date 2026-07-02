import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '../components/ui';
import {
    KeyRound, Plus, Copy, Check, Shield, Loader2, AlertTriangle,
    Eye, EyeOff, X, CheckCircle2,
} from 'lucide-react';
import styles from '../styles/modules/pages/PageComponents.module.scss';

function ApiKeyPage() {
    const { user } = useAuth();
    const addToast = useToast();
    const queryClient = useQueryClient();
    const isSuperAdmin = user?.role === 'super_admin';

    const [selectedClientId, setSelectedClientId] = useState(
        isSuperAdmin ? '' : (user?.clientId || '')
    );
    const [keyName, setKeyName] = useState('');
    const [keyDescription, setKeyDescription] = useState('');
    const [environment, setEnvironment] = useState('production');
    const [showForm, setShowForm] = useState(false);

    // One-time key display modal
    const [createdKey, setCreatedKey] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showKey, setShowKey] = useState(false);

    // Fetch clients list for super admin dropdown
    const { data: clientsData, isPending: clientsLoading } = useQuery({
        queryKey: ['clients'],
        queryFn: clientApi.getClients,
        enabled: isSuperAdmin,
    });

    // Fetch keys for the selected client
    const { data: keysData, isPending: keysLoading } = useQuery({
        queryKey: ['apiKeys', selectedClientId],
        queryFn: () => clientApi.getClientApiKeys(selectedClientId),
        enabled: !!selectedClientId,
    });

    const createKeyMutation = useMutation({
        mutationFn: ({ clientId, keyData }) =>
            clientApi.createApiKey(clientId, keyData),
        onSuccess: (data) => {
            setCreatedKey(data.data);
            queryClient.invalidateQueries({ queryKey: ['apiKeys', selectedClientId] });
            setKeyName('');
            setKeyDescription('');
            setEnvironment('production');
            setShowForm(false);
        },
        onError: (err) => {
            addToast(err.response?.data?.message || 'Failed to create API key', 'error');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedClientId) {
            addToast('Please select a client first', 'error');
            return;
        }
        createKeyMutation.mutate({
            clientId: selectedClientId,
            keyData: { name: keyName, description: keyDescription, environment },
        });
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            addToast('API key copied to clipboard!', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            addToast('Failed to copy', 'error');
        }
    };

    const closeModal = () => {
        setCreatedKey(null);
        setCopied(false);
        setShowKey(false);
    };

    const clients = clientsData?.data?.clients || [];
    const apiKeys = keysData?.data || [];

    return (
        <div className={styles.pageContainer}>
            {/* One-time key display modal */}
            {createdKey && (
                <div style={modalOverlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                                🔑 API Key Created
                            </h3>
                            <button onClick={closeModal} style={closeButtonStyle}>
                                <X style={{ width: '1.25rem', height: '1.25rem' }} />
                            </button>
                        </div>

                        <div style={warningBoxStyle}>
                            <AlertTriangle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                            <span>
                                <strong>Important:</strong> Please copy this key now. You will not be able to see it again for security reasons!
                            </span>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.375rem' }}>
                                Key Name: <strong>{createdKey.name}</strong>
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.75rem' }}>
                                Environment: <strong>{createdKey.environment}</strong>
                            </p>
                        </div>

                        <div style={keyDisplayStyle}>
                            <code style={{ flex: 1, wordBreak: 'break-all', fontSize: '0.85rem' }}>
                                {showKey ? createdKey.keyValue : '••••••••••••••••••••••••••••••••'}
                            </code>
                            <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                                <button onClick={() => setShowKey(!showKey)} style={iconButtonStyle} title={showKey ? 'Hide' : 'Show'}>
                                    {showKey ? <EyeOff style={iconSmStyle} /> : <Eye style={iconSmStyle} />}
                                </button>
                                <button onClick={() => handleCopy(createdKey.keyValue)} style={iconButtonStyle} title="Copy">
                                    {copied ? <Check style={{ ...iconSmStyle, color: '#4ade80' }} /> : <Copy style={iconSmStyle} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={closeModal}
                            style={{
                                width: '100%',
                                marginTop: '1rem',
                                padding: '0.625rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, hsl(265, 82%, 50%), hsl(245, 80%, 55%))',
                                color: 'white',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            I've Saved My Key
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.pageHeader}>
                <div className={styles.headerWithActions}>
                    <div>
                        <h2>API Keys</h2>
                        <p>Create and manage API keys for your clients</p>
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
                        }}
                    >
                        <Plus style={{ width: '1rem', height: '1rem' }} />
                        {showForm ? 'Cancel' : 'Generate Key'}
                    </button>
                </div>
            </div>

            {/* Client selector for super admin */}
            {isSuperAdmin && (
                <Card className={styles.sectionCard}>
                    <CardContent style={{ paddingTop: '1rem' }}>
                        <div className={styles.formRow}>
                            <label className={styles.formLabel} htmlFor="apikey-client">
                                Select Client
                            </label>
                            <div className={styles.iconTextGroup}>
                                <Shield />
                                <select
                                    id="apikey-client"
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                    disabled={clientsLoading}
                                    style={selectStyle}
                                >
                                    <option value="">
                                        {clientsLoading ? 'Loading...' : '— Choose a client —'}
                                    </option>
                                    {clients.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name} ({c.slug})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Create form */}
            {showForm && (
                <Card className={styles.sectionCard}>
                    <CardHeader>
                        <div className={styles.cardTitleRow}>
                            <KeyRound className={styles.cardTitleIcon} aria-hidden="true" />
                            <CardTitle>Generate New API Key</CardTitle>
                        </div>
                        <CardDescription>This key will be shown only once after creation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className={styles.formGroup}>
                            <div className={styles.formRow}>
                                <label className={styles.formLabel} htmlFor="key-name">Key Name *</label>
                                <input
                                    id="key-name"
                                    type="text"
                                    value={keyName}
                                    onChange={(e) => setKeyName(e.target.value)}
                                    required
                                    placeholder="e.g. Production Key"
                                    disabled={createKeyMutation.isPending}
                                    style={inputStyle}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.formLabel} htmlFor="key-desc">Description</label>
                                <input
                                    id="key-desc"
                                    type="text"
                                    value={keyDescription}
                                    onChange={(e) => setKeyDescription(e.target.value)}
                                    placeholder="What this key is used for"
                                    disabled={createKeyMutation.isPending}
                                    style={inputStyle}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.formLabel} htmlFor="key-env">Environment</label>
                                <select
                                    id="key-env"
                                    value={environment}
                                    onChange={(e) => setEnvironment(e.target.value)}
                                    style={selectStyle}
                                    disabled={createKeyMutation.isPending}
                                >
                                    <option value="production">Production</option>
                                    <option value="staging">Staging</option>
                                    <option value="development">Development</option>
                                </select>
                            </div>
                            <div className={styles.actionRow}>
                                <button
                                    type="submit"
                                    disabled={createKeyMutation.isPending || !selectedClientId}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.625rem 1.5rem',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, hsl(265, 82%, 50%), hsl(245, 80%, 55%))',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px hsla(265, 82%, 50%, 0.3)',
                                        opacity: (!selectedClientId) ? 0.5 : 1,
                                    }}
                                >
                                    {createKeyMutation.isPending ? (
                                        <><Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} /> Generating...</>
                                    ) : (
                                        <><CheckCircle2 style={{ width: '1rem', height: '1rem' }} /> Generate Key</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Existing keys list */}
            <Card className={styles.sectionCard}>
                <CardHeader>
                    <div className={styles.cardTitleRow}>
                        <KeyRound className={styles.cardTitleIcon} aria-hidden="true" />
                        <CardTitle>Existing API Keys</CardTitle>
                    </div>
                    <CardDescription>
                        {!selectedClientId
                            ? 'Select a client to view its API keys'
                            : keysLoading
                                ? 'Loading...'
                                : `${apiKeys.length} key(s) found`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!selectedClientId ? (
                        <div className={styles.emptyState}>
                            <Shield />
                            <p>Please select a client above to see its API keys</p>
                        </div>
                    ) : keysLoading ? (
                        <div className={styles.emptyState}>
                            <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
                            <p>Loading keys...</p>
                        </div>
                    ) : apiKeys.length === 0 ? (
                        <div className={styles.emptyState}>
                            <KeyRound />
                            <p>No API keys yet. Generate your first key above.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {apiKeys.map((key) => (
                                <div key={key._id || key.keyId} style={keyCardStyle}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: 600 }}>{key.name}</span>
                                            <span style={envBadgeStyle(key.environment)}>
                                                {key.environment}
                                            </span>
                                        </div>
                                        {key.description && (
                                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', margin: '0.25rem 0' }}>
                                                {key.description}
                                            </p>
                                        )}
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                            ID: <code style={{ fontSize: '0.7rem' }}>{key.keyId}</code>
                                            {key.createdAt && ` · Created ${new Date(key.createdAt).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{
                                            padding: '0.25rem 0.625rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.7rem',
                                            fontWeight: 500,
                                            background: key.isActive !== false ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                            color: key.isActive !== false ? '#4ade80' : '#f87171',
                                        }}>
                                            {key.isActive !== false ? 'Active' : 'Revoked'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* --- Styles --- */
const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.375rem',
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    fontSize: '0.875rem',
    outline: 'none',
};

const selectStyle = {
    ...inputStyle,
    flex: 1,
    appearance: 'auto',
    cursor: 'pointer',
};

const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    animation: 'fade-in 0.2s ease-out',
};

const modalStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    maxWidth: '32rem',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
};

const warningBoxStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    background: 'rgba(234,179,8,0.1)',
    border: '1px solid rgba(234,179,8,0.3)',
    color: '#facc15',
    fontSize: '0.8rem',
    marginBottom: '1rem',
};

const keyDisplayStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    background: 'hsl(var(--muted))',
    border: '1px solid hsl(var(--border))',
};

const iconButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    color: 'hsl(var(--muted-foreground))',
    borderRadius: '0.25rem',
    transition: 'color 0.15s ease',
};

const iconSmStyle = { width: '1rem', height: '1rem' };

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'hsl(var(--muted-foreground))',
    padding: '0.25rem',
};

const keyCardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid hsl(var(--border) / 0.5)',
    background: 'hsl(var(--background) / 0.5)',
    transition: 'all 0.15s ease',
};

const envBadgeStyle = (env) => ({
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.65rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: env === 'production'
        ? 'rgba(59,130,246,0.15)'
        : env === 'staging'
            ? 'rgba(234,179,8,0.15)'
            : 'rgba(34,197,94,0.15)',
    color: env === 'production'
        ? '#60a5fa'
        : env === 'staging'
            ? '#facc15'
            : '#4ade80',
});

export default ApiKeyPage;
