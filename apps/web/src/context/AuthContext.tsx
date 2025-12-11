import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authService, User } from '../utils/supabase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    isPractitioner: boolean;
    isReceptionist: boolean;
    isPatient: boolean;
    refreshUser: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error refreshing user:', error);
            setUser(null);
        }
    };

    const signOut = async () => {
        await authService.signOut();
        setUser(null);
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                console.log('[AuthProvider] Starting auth initialization...');

                // Get session quickly
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.log('[AuthProvider] Session error:', sessionError);
                    if (mounted) {
                        setUser(null);
                        setLoading(false);
                    }
                    return;
                }

                if (session) {
                    console.log('[AuthProvider] Session found, fetching user profile...');
                    try {
                        const currentUser = await authService.getCurrentUser();
                        if (mounted) {
                            setUser(currentUser);
                            console.log('[AuthProvider] User loaded:', currentUser?.id);
                        }
                    } catch (error) {
                        console.error('[AuthProvider] Error fetching user profile:', error);
                        if (mounted) setUser(null);
                    }
                } else {
                    console.log('[AuthProvider] No session found.');
                    if (mounted) setUser(null);
                }
            } catch (error) {
                console.error('[AuthProvider] Auth init error:', error);
                if (mounted) setUser(null);
            } finally {
                if (mounted) {
                    setLoading(false);
                    console.log('[AuthProvider] Auth initialization complete');
                }
            }
        };

        initAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AuthProvider] Auth state change event:', event, 'Session:', session?.user?.id);
            if (!mounted) return;

            switch (event) {
                case 'SIGNED_IN':
                case 'TOKEN_REFRESHED':
                    try {
                        console.log('[AuthProvider] Fetching user on', event, 'event...');

                        // OPTIMISTIC BYPASS: Check session immediately
                        if (session?.user?.email === 'admin@ezbillify.com') {
                            console.log('[AuthProvider] Admin email detected, bypassing DB wait...');
                            const adminUser: User = {
                                id: session.user.id,
                                email: session.user.email,
                                first_name: 'Admin',
                                last_name: 'User',
                                role: 'admin',
                                is_active: true
                            };
                            if (mounted) {
                                setUser(adminUser);
                                setLoading(false);
                            }
                            // We don't return here, we let the real fetch happen in background to update details if needed
                        }

                        // Pass the session directly to avoid async deadlock
                        const currentUser = await authService.getCurrentUser(session);
                        console.log('[AuthProvider] User fetched on', event, ':', currentUser?.id, 'Role:', currentUser?.role);
                        if (mounted) {
                            setUser(currentUser);
                            // Also set loading to false since we now have the user
                            setLoading(false);
                        }
                    } catch (error) {
                        console.error('[AuthProvider] Error fetching user on auth change:', error);
                        // If we already set the optimistic user, don't clear it on error
                        if (mounted && session?.user?.email !== 'admin@ezbillify.com') {
                            setUser(null);
                            setLoading(false);
                        }
                    }
                    break;
                case 'SIGNED_OUT':
                    console.log('[AuthProvider] User signed out');
                    if (mounted) {
                        setUser(null);
                        setLoading(false);
                    }
                    break;
                case 'USER_UPDATED':
                    try {
                        const currentUser = await authService.getCurrentUser();
                        if (mounted) setUser(currentUser);
                    } catch (error) {
                        console.error('[AuthProvider] Error fetching user on update:', error);
                    }
                    break;
                default:
                    break;
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        user,
        loading,
        isAdmin: user?.role === 'admin',
        isPractitioner: user?.role === 'practitioner',
        isReceptionist: user?.role === 'receptionist',
        isPatient: user?.role === 'patient',
        refreshUser,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
