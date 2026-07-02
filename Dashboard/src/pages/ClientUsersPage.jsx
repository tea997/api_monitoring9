import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { clientApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '../components/ui';
import {
    Users, User, Mail, Lock, Shield, Loader2, CheckCircle2,
} from 'lucide-react';
import styles from '../styles/modules/pages/PageComponents.module.scss';

function ClientUsersPage() {
    const { user } = useAuth();
    const addToast = useToast();
    const isSuperAdmin = user?.role === 'super_admin';

    const [selectedClientId, setSelectedClientId] = useState(
        isSuperAdmin ? '' : (user?.clientId || '')
    );
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('client_viewer');

    // Super admins need to pick a client first
    const { data: clientsData, isPending: clientsLoading } = useQuery({
        queryKey: ['clients'],
        queryFn: clientApi.getClients,
        enabled: isSuperAdmin,
    });

    const createUserMutation = useMutation({
        mutationFn: ({ clientId, userData }) =>
            clientApi.createClientUser(clientId, userData),
        onSuccess: () => {
            addToast('User created successfully!', 'success');
            setUsername('');
            setEmail('');
            setPassword('');
            setRole('client_viewer');
        },
        onError: (err) => {
            addToast(err.response?.data?.message || 'Failed to create user', 'error');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedClientId) {
            addToast('Please select a client first', 'error');
            return;
        }
        createUserMutation.mutate({
            clientId: selectedClientId,
            userData: { username, email, password, role },
        });
    };

    const clients = clientsData?.data?.clients || [];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h2>Create Client User</h2>
                <p>Add users to a client organization with specific roles and permissions</p>
            </div>

            <Card className={styles.sectionCard}>
                <CardHeader>
                    <div className={styles.cardTitleRow}>
                        <Users className={styles.cardTitleIcon} aria-hidden="true" />
                        <CardTitle>New User</CardTitle>
                    </div>
                    <CardDescription>
                        Users will inherit permissions based on their assigned role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className={styles.formGroup}>
                        {isSuperAdmin && (
                            <div className={styles.formRow}>
                                <label className={styles.formLabel} htmlFor="user-client">
                                    Select Client *
                                </label>
                                <div className={styles.iconTextGroup}>
                                    <Shield />
                                    <select
                                        id="user-client"
                                        value={selectedClientId}
                                        onChange={(e) => setSelectedClientId(e.target.value)}
                                        required
                                        disabled={clientsLoading}
                                        style={selectStyle}
                                    >
                                        <option value="">
                                            {clientsLoading ? 'Loading clients...' : '— Choose a client —'}
                                        </option>
                                        {clients.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name} ({c.slug})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className={styles.formRow}>
                            <label className={styles.formLabel} htmlFor="user-username">
                                Username *
                            </label>
                            <div className={styles.iconTextGroup}>
                                <User />
                                <input
                                    id="user-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    minLength={3}
                                    placeholder="johndoe"
                                    disabled={createUserMutation.isPending}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <label className={styles.formLabel} htmlFor="user-email">
                                Email *
                            </label>
                            <div className={styles.iconTextGroup}>
                                <Mail />
                                <input
                                    id="user-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="john@acme.com"
                                    disabled={createUserMutation.isPending}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <label className={styles.formLabel} htmlFor="user-password">
                                Password *
                            </label>
                            <div className={styles.iconTextGroup}>
                                <Lock />
                                <input
                                    id="user-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="Min 6 chars, uppercase, number, special"
                                    disabled={createUserMutation.isPending}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <label className={styles.formLabel} htmlFor="user-role">
                                Role *
                            </label>
                            <div className={styles.iconTextGroup}>
                                <Shield />
                                <select
                                    id="user-role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    style={selectStyle}
                                    disabled={createUserMutation.isPending}
                                >
                                    <option value="client_viewer">Client Viewer</option>
                                    <option value="client_admin">Client Admin</option>
                                </select>
                            </div>
                        </div>

                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            background: 'hsl(var(--muted) / 0.5)',
                            fontSize: '0.8rem',
                            color: 'hsl(var(--muted-foreground))',
                        }}>
                            <strong>Permissions Preview:</strong>
                            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                                <li>View Analytics: ✅ Always</li>
                                <li>Create API Keys: {role === 'client_admin' ? '✅' : '❌'}</li>
                                <li>Manage Users: {role === 'client_admin' ? '✅' : '❌'}</li>
                                <li>Export Data: {role === 'client_admin' ? '✅' : '❌'}</li>
                            </ul>
                        </div>

                        <div className={styles.actionRow}>
                            <button
                                type="submit"
                                disabled={createUserMutation.isPending}
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
                                {createUserMutation.isPending ? (
                                    <><Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} /> Creating...</>
                                ) : (
                                    <><CheckCircle2 style={{ width: '1rem', height: '1rem' }} /> Create User</>
                                )}
                            </button>
                        </div>
                    </form>
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
};

const selectStyle = {
    ...inputStyle,
    appearance: 'auto',
    cursor: 'pointer',
};

export default ClientUsersPage;
