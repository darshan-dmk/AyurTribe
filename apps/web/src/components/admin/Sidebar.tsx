import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserPlus, Settings,
    LogOut, FileText, Activity, ChevronRight
} from 'lucide-react';
import ConfirmationModal from '../ui/ConfirmationModal';

interface SidebarProps {
    onLogout: () => void;
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, className = "" }) => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
        { icon: UserPlus, label: 'Staff Management', to: '/admin/staff' },
        { icon: Users, label: 'Patients', to: '/admin/patients' },
        { icon: Activity, label: 'Treatments', to: '/admin/treatments' },
        { icon: FileText, label: 'Reports', to: '/admin/reports' },
    ];

    return (
        <>
            <aside className={`w-72 bg-[#0c0c0c] text-stone-300 border-r border-white/5 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${className}`}>
                {/* Brand Header */}
                <div className="h-24 flex items-center px-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm relative overflow-hidden">
                    {/* Decorative Shine */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50"></div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-emerald-900/40 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500 p-2 backdrop-blur-md border border-white/10">
                            <img src="/ayurtribelogo.png" alt="Ayur Tribe" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-stone-100 font-serif font-bold text-lg tracking-wide leading-none mb-1">
                                Ayur Tribe
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-medium">Admin Panel</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-4 flex items-center gap-3">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        <span className="text-[10px] uppercase tracking-widest text-stone-600 font-bold">Menu</span>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>

                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `
                                group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300
                                ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                                    : 'text-stone-400 hover:text-stone-100 hover:bg-white/[0.02]'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active Indicator Line */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                                    )}

                                    <item.icon
                                        className={`w-5 h-5 transition-all duration-300 ${isActive
                                            ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                                            : 'text-stone-500 group-hover:text-stone-300 group-hover:scale-110'
                                            }`}
                                    />
                                    <span className="tracking-wide">{item.label}</span>

                                    {/* Arrow for active/hover */}
                                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform duration-300 ${isActive ? 'opacity-100 translate-x-0 text-emerald-500/50' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`} />
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-white/5 bg-[#080808]">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-stone-900/50 border border-white/5 hover:border-red-900/30 hover:bg-red-950/10 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-stone-800 text-stone-400 group-hover:text-red-400 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-medium text-stone-300 group-hover:text-red-400 transition-colors">Sign Out</p>
                                <p className="text-[10px] text-stone-600">Secure Logout</p>
                            </div>
                        </div>
                    </button>
                </div>
            </aside>

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={onLogout}
                title="Sign Out"
                message="Are you sure you want to end your session securely?"
                confirmLabel="Log Out"
                variant="danger"
            />
        </>
    );
};
