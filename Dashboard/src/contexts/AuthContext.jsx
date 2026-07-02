import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps children with the authenticated user context.
 * @param {Object} props
 * @param {Object} props.user - The authenticated user profile object
 * @param {Function} props.onLogout - Logout handler
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ user, onLogout, children }) {
    return (
        <AuthContext.Provider value={{ user, onLogout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access the current authenticated user and logout function.
 * @returns {{ user: Object|null, onLogout: Function }}
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
