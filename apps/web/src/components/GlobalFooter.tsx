import React from 'react';
import { Heart } from 'lucide-react';

interface GlobalFooterProps {
    className?: string;
    dark?: boolean;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({ className = "", dark = false }) => {
    return (
        <footer className={`py-6 px-6 text-center mt-auto ${className}`}>
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
                <div className={`text-sm font-medium tracking-tight ${dark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Powered by <a
                        href="https://www.ezbillify.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-400 transition-colors font-bold decoration-emerald-500/30 underline-offset-4 hover:underline"
                    >
                        EZBillify technologies
                    </a>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] ${dark ? 'text-stone-500' : 'text-stone-400'}`}>
                    <span>Proudly Crafted in India</span>
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
                </div>
            </div>
        </footer>
    );
};
