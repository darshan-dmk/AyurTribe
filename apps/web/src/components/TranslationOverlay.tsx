import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export const TranslationOverlay: React.FC = () => {
    const { isTranslating, currentLanguage } = useLanguage();

    return (
        <AnimatePresence>
            {isTranslating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0d0f14]/80 backdrop-blur-xl"
                >
                    <div className="text-center space-y-8 p-8 max-w-md w-full">
                        {/* Pulsing Globe */}
                        <div className="relative mx-auto w-24 h-24">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-accent-sage rounded-full blur-2xl"
                            />
                            <div className="relative flex items-center justify-center w-full h-full bg-[#1a1c23] border border-white/10 rounded-full shadow-2xl">
                                <Globe className="w-10 h-10 text-accent-sage animate-spin-slow" />
                            </div>
                        </div>

                        {/* AI Message */}
                        <div className="space-y-4">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-3xl font-bold text-white tracking-tight"
                            >
                                Tailoring Your Experience
                            </motion.h2>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-lg text-white/60 font-medium"
                            >
                                Our AI is translating AyurTribe into <span className="text-accent-sage">your preferred language</span> using real-time medical intelligence.
                            </motion.p>
                        </div>

                        {/* Loading Bar */}
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="w-1/2 h-full bg-gradient-to-r from-transparent via-accent-sage to-transparent"
                            />
                        </div>

                        <p className="text-xs uppercase tracking-[0.3em] text-white/30 font-bold">
                            Powered by Gemini 2.0 Flash
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
