import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/translationService';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage, isTranslating } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = SUPPORTED_LANGUAGES.find((l: { code: string; name: string }) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm font-medium text-white/90"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{selectedLang.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="max-h-80 overflow-y-auto py-2">
              {SUPPORTED_LANGUAGES.map((lang: { code: string; name: string }) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-white/5 transition-colors ${currentLanguage === lang.code ? 'bg-white/10 text-emerald-400' : 'text-white/80'
                    }`}
                >
                  <span>{lang.name}</span>
                  {currentLanguage === lang.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <div className="border-t border-white/5 px-3 py-2">
              <p className="text-[10px] text-white/40 text-center">
                Powered by LibreTranslate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};