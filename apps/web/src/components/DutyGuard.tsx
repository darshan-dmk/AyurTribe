import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, AlertTriangle, Clock, LogOut } from 'lucide-react';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';

interface DutyGuardProps {
    children: React.ReactNode;
    onDutyChange?: (status: boolean) => void;
}

const DutyGuard: React.FC<DutyGuardProps> = ({ children, onDutyChange }) => {
    const [isOnDuty, setIsOnDuty] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        checkDutyStatus();

        // Subscribe to user changes for real-time duty updates
        const setupSubscription = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;
            setUser(currentUser);

            const channel = supabase
                .channel(`duty-status-${currentUser.id}`)
                .on('postgres_changes' as any, {
                    event: 'UPDATE',
                    table: 'users',
                    filter: `id=eq.${currentUser.id}`
                }, (payload: any) => {
                    const newStatus = payload.new.is_on_duty;
                    setIsOnDuty(newStatus);
                    if (onDutyChange) onDutyChange(newStatus);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupSubscription();
    }, []);

    const checkDutyStatus = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;

            const { data, error } = await supabase
                .from('users')
                .select('is_on_duty')
                .eq('id', currentUser.id)
                .single();

            if (error) throw error;
            setIsOnDuty(data.is_on_duty);
            if (onDutyChange) onDutyChange(data.is_on_duty);
        } catch (error) {
            console.error('Error checking duty status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoOnDuty = async () => {
        if (!user) return;
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ is_on_duty: true })
                .eq('id', user.id);

            if (error) throw error;
            setIsOnDuty(true);
            if (onDutyChange) onDutyChange(true);
            toast.success('You are now ON DUTY. Have a productive shift!');
        } catch (error) {
            console.error('Error updating duty status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#E07A5F]/20 border-t-[#E07A5F] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* The main content */}
            <div className={!isOnDuty ? 'pointer-events-none blur-sm select-none overflow-hidden h-screen' : ''}>
                {children}
            </div>

            {/* The Overwhelming Duty Modal */}
            <AnimatePresence>
                {!isOnDuty && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
                    >
                        {/* Backdrop with sophisticated gradient */}
                        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-xl" />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden"
                        >
                            {/* Accent Header */}
                            <div className="h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 animate-gradient-x" />

                            <div className="p-8 md:p-10">
                                {/* Alarm/Alert Icon */}
                                <div className="flex justify-center mb-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                                        <div className="bg-red-500/20 p-5 rounded-full relative border border-red-500/30">
                                            <ShieldAlert className="w-12 h-12 text-red-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-black text-white tracking-tight">
                                        SHIFT DUTY <span className="text-red-500 underline decoration-2 underline-offset-8">REQUIRED</span>
                                    </h2>

                                    <div className="flex items-center justify-center gap-2 py-2 px-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-sm font-bold uppercase tracking-widest mx-auto w-fit">
                                        <AlertTriangle className="w-4 h-4" />
                                        Caution: Compliance Mandatory
                                    </div>

                                    <p className="text-gray-400 text-lg leading-relaxed">
                                        To maintain clinical integrity and ensure patient care tracking, all practitioners and staff must mark their attendance.
                                        <span className="block mt-2 font-semibold text-gray-300">
                                            Access to the clinical suite is restricted until shift commencement.
                                        </span>
                                    </p>
                                </div>

                                {/* Checklist/Rules */}
                                <div className="mt-8 space-y-3 bg-[#0f172a]/50 p-6 rounded-2xl border border-white/5">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-400 font-medium">Duty hours are logged for payroll and audit purposes.</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-400 font-medium">Automatic logout will occur after long periods of inactivity.</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-10 flex flex-col gap-4">
                                    <Button
                                        onClick={handleGoOnDuty}
                                        disabled={updating}
                                        className="w-full py-7 bg-white hover:bg-gray-100 text-[#0f172a] text-xl font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-white/10"
                                    >
                                        {updating ? 'SYNCING STATUS...' : 'GO ON DUTY NOW'}
                                    </Button>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign out and Exit
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Bottom Bar */}
                            <div className="bg-[#0f172a] py-3 px-8 text-center border-t border-white/5">
                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                                    AyurTribe Clinical Compliance System v2.0
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DutyGuard;
