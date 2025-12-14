import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

interface PatientNavbarProps {
    onProfileClick?: () => void;
}

const PatientNavbar: React.FC<PatientNavbarProps> = ({ onProfileClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t } = useLanguage();

    const currentView = searchParams.get('view') || 'dashboard';

    const isActive = (viewName: string) => {
        if (location.pathname !== '/patient/dashboard') return false;
        return currentView === viewName;
    };

    const isDashboardActive = location.pathname.includes('/patient/dashboard') && currentView === 'dashboard' || location.pathname.includes('/nutrition');

    const handleNavigate = (view: string) => {
        navigate(`/patient/dashboard?view=${view}`);
        setMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/auth/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Use t() function to translate labels dynamically
    // Note: The mapping key is the English text which triggers the dictionary/API lookup
    const navLinks = [
        { name: t('Dashboard'), view: 'dashboard', action: () => handleNavigate('dashboard') },
        { name: t('Health Profile'), view: 'health', action: () => handleNavigate('health') },
        { name: t('Visualization'), view: 'visualization', action: () => handleNavigate('visualization') },
        { name: t('My Bookings'), view: 'appointments', action: () => handleNavigate('appointments') }
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-[#1a1c23]/95 backdrop-blur-md border-b border-white/10 z-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
                    <div className="w-10 h-10 rounded-lg bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center">
                        <span className="text-[#81B29A] font-bold text-xl">A</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-[#F4F1DE] leading-tight">Ayur Tribe</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t('Personalized Care')}</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                    {navLinks.map(link => (
                        <button
                            key={link.view} // Changed key to view as name changes with language
                            onClick={link.action}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${(link.view === 'dashboard' && isDashboardActive) || isActive(link.view)
                                ? 'bg-[#E07A5F]/10 text-[#E07A5F]'
                                : 'text-white/80 hover:text-white'
                                }`}
                        >
                            {link.name}
                        </button>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <LanguageSelector />

                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('Search records, tips...')}
                            className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-gray-200 focus:outline-none focus:border-[#81B29A] focus:bg-white/10 w-48 transition-all"
                        />
                    </div>

                    <button
                        onClick={() => onProfileClick ? onProfileClick() : handleNavigate('health')}
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#2c1810] font-bold shadow-[0_6px_18px_rgba(184,134,11,0.18)]"
                            style={{ background: 'linear-gradient(135deg, #F2CC8F, #E07A5F)' }}>
                            {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                        </div>
                    </button>

                    <button
                        className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                        onClick={handleLogout}
                    >
                        {t('Logout')}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-3">
                    <LanguageSelector />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-md text-white hover:bg-white/10"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="md:hidden fixed top-16 left-0 right-0 border-t border-white/10 bg-[#161b16]/95 backdrop-blur-md p-4 shadow-xl"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="flex flex-col space-y-3">
                            {navLinks.map(link => (
                                <button
                                    key={link.view}
                                    onClick={link.action}
                                    className={`px-3 py-2 rounded-md text-sm font-medium text-left ${(link.view === 'dashboard' && isDashboardActive) || isActive(link.view)
                                        ? 'bg-[#E07A5F]/10 text-[#E07A5F]'
                                        : 'text-white/80 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </button>
                            ))}
                            <hr className="border-white/10 my-2" />
                            <div className="px-3">
                                {/* Mobile Language Selector already in header, but user might expect language changes here too */}
                            </div>
                            <button
                                className="px-3 py-2 rounded-md text-sm font-medium text-left text-white/80 hover:text-white"
                                onClick={handleLogout}
                            >
                                {t('Logout')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default PatientNavbar;
