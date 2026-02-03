import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/translationService';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === currentLanguage) {
      setIsOpen(false);
      return;
    }
    await changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 text-sm font-medium ${isOpen
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm'
            : 'bg-white/50 backdrop-blur-sm border-stone-200 text-stone-700 hover:bg-white hover:border-emerald-200 shadow-sm'
          }`}
      >
        <Globe className={`w-4 h-4 ${isOpen ? 'text-emerald-600' : 'text-stone-400'}`} />
        <span className="max-w-[80px] truncate">{selectedLang.name.split(' ')[0]}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-3 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Language Settings
              </div>
            </div>

            <div className="p-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isActive = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'hover:bg-stone-50 text-stone-600 hover:text-stone-900'
                      }`}
                  >
                    <div className="flex flex-col items-start translate-x-0 group-hover:translate-x-1 transition-transform">
                      <span className={`text-sm font-semibold ${isActive ? 'text-emerald-700' : 'text-stone-700'}`}>
                        {lang.name}
                      </span>
                      <span className="text-[10px] opacity-60 uppercase tracking-tight">
                        {lang.code === 'en' ? 'Default Content' : 'AI Mode Activated'}
                      </span>
                    </div>
                    {isActive ? (
                      <div className="bg-emerald-100 p-1 rounded-full">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-stone-300" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-stone-100 bg-emerald-900 text-[10px] text-emerald-100/60 text-center font-medium">
              Powered by AyurTribe Intelligence
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};