import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { authService } from '../../utils/supabase';
import { Menu } from 'lucide-react';

export const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        await authService.signOut();
        navigate('/auth/login');
    };

    return (
        <div className="flex h-screen bg-stone-50 overflow-hidden font-sans">
            {/* Sidebar (Desktop) */}
            <Sidebar onLogout={handleLogout} className="hidden lg:flex flex-col" />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">

                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-stone-900 text-white flex items-center justify-between px-4 shrink-0">
                    <div className="font-bold text-lg">Ayur Tribe Admin</div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                        <Menu />
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute inset-0 z-50 bg-stone-900/95 p-4 flex flex-col">
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2">Close</button>
                        </div>
                        <Sidebar onLogout={handleLogout} className="flex flex-col h-full w-full bg-transparent border-none" />
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-stone-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
