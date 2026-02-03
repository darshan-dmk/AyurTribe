import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowLeft, Save, Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlobalFooter } from '../../components/GlobalFooter';

const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' }
];

const LanguageSettings: React.FC = () => {
    const navigate = useNavigate();
    const { currentLanguage, changeLanguage, t } = useLanguage();
    const [selectedLang, setSelectedLang] = useState(currentLanguage);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await changeLanguage(selectedLang);
        // Simulate a small delay for better UX
        setTimeout(() => {
            setIsSaving(false);
            navigate(-1); // Go back
        }, 500);
    };

    return (
        <div className="min-h-screen bg-[#1a1c23] text-[#F4F1DE] p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#F4F1DE]/60 hover:text-[#F4F1DE] mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>{t('actions.back')}</span>
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#2C3333] border border-white/10 rounded-2xl p-8 shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full bg-[#E07A5F]/20 flex items-center justify-center text-[#E07A5F]">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{t('settings.select_language')}</h1>
                            <p className="text-[#F4F1DE]/60 text-sm">{t('settings.language_desc')}</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-8">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setSelectedLang(lang.code)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${selectedLang === lang.code
                                    ? 'bg-[#E07A5F]/20 border-[#E07A5F] text-[#E07A5F]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-[#F4F1DE]/80'
                                    }`}
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-medium text-lg">{lang.nativeName}</span>
                                    <span className="text-xs opacity-60">{lang.name}</span>
                                </div>
                                {selectedLang === lang.code && (
                                    <div className="w-6 h-6 rounded-full bg-[#E07A5F] flex items-center justify-center text-white">
                                        <Check size={14} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-[#E07A5F] hover:bg-[#d0694e] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#E07A5F]/20 transition-all flex items-center justify-center gap-2"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <>
                                <Save size={20} />
                                {t('settings.save_language')}
                            </>
                        )}
                    </button>

                </motion.div>
            </div>
            <GlobalFooter dark className="bg-[#1a1c23]/50 mt-12" />
        </div>
    );
};

export default LanguageSettings;
