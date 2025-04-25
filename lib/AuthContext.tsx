'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import {
    login as authLogin,
    logout as authLogout,
    getCurrentUser,
    refreshToken as authRefreshToken,
    verifyToken as authVerifyToken,
    User,
    LoginData,
} from './auth';
import { toast } from 'sonner';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null; // User object now contains organization info
    loading: boolean;
    login: (credentials: LoginData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUserToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null); // State holds the full User object
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const initAuth = useCallback(async () => {
        setLoading(true);
        const tokens = sessionStorage.getItem('auth_tokens');
        if (tokens) {
            try {
                const isValid = await authVerifyToken();
                if (isValid) {
                    const currentUser = await getCurrentUser(); // Fetches user with org info
                    if (currentUser) {
                        setUser(currentUser); // Store user with org info
                        setIsAuthenticated(true);
                    } else {
                        throw new Error('Failed to fetch user data.');
                    }
                } else {
                    throw new Error('Token verification failed.');
                }
            } catch (error) {
                console.log('Initial auth failed, attempting refresh:', error);
                try {
                    const refreshed = await authRefreshToken();
                    if (refreshed) {
                        const currentUser = await getCurrentUser(); // Fetches user with org info
                        if (currentUser) {
                            setUser(currentUser); // Store user with org info
                            setIsAuthenticated(true);
                            console.log(
                                'Token refresh successful during init.'
                            );
                        } else {
                            throw new Error(
                                'Fetched user data after refresh failed.'
                            );
                        }
                    } else {
                        sessionStorage.removeItem('auth_tokens');
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                } catch (refreshError) {
                    console.error(
                        'Token refresh failed during init:',
                        refreshError
                    );
                    sessionStorage.removeItem('auth_tokens');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const login = async (credentials: LoginData) => {
        try {
            const response = await authLogin(credentials);
            const { access, refresh, user: loggedInUser } = response;

            sessionStorage.setItem(
                'auth_tokens',
                JSON.stringify({
                    access,
                })
            );
            localStorage.setItem(
                'refresh_token',
                JSON.stringify({
                    refresh,
                })
            );

            setUser(loggedInUser);
            setIsAuthenticated(true);

            router.push('/');
            toast.success('Logged in successfully');
        } catch (error: any) {
            console.error('Login error in context:', error);
            throw error;
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authLogout();
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            sessionStorage.removeItem('auth_tokens');
            localStorage.removeItem('refresh_token');
            setIsAuthenticated(false);
            setUser(null);
            router.push('/login');
            toast.info('Logged out successfully');
        }
    };

    const refreshUserToken = useCallback(async (): Promise<boolean> => {
        try {
            const refreshed = await authRefreshToken();
            if (refreshed) {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    setIsAuthenticated(true);
                    return true;
                } else {
                    await logout();
                    return false;
                }
            }
            return false;
        } catch (error) {
            console.error('Error refreshing token in context:', error);
            await logout();
            return false;
        }
    }, [logout]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                loading,
                login,
                logout,
                refreshUserToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
