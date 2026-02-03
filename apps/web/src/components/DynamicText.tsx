import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translationService } from '../services/translationService';

interface DynamicTextProps {
    children: string;
    className?: string;
    as?: React.ElementType;
}

const DynamicText: React.FC<DynamicTextProps> = ({ children, className, as: Component = 'span' }) => {
    const { currentLanguage } = useLanguage();
    const [displayText, setDisplayText] = useState(children);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const translate = async () => {
            if (currentLanguage === 'en') {
                setDisplayText(children);
                return;
            }

            setLoading(true);
            try {
                const translated = await translationService.translateText(children, currentLanguage);
                setDisplayText(translated);
            } catch (error) {
                console.error('Translation error:', error);
                setDisplayText(children);
            } finally {
                setLoading(false);
            }
        };

        translate();
    }, [children, currentLanguage]);

    if (loading) {
        return (
            <span className={`inline-block animate-pulse bg-gray-200/20 rounded min-w-[50px] min-h-[1em] ${className}`}>
                &nbsp;
            </span>
        );
    }

    return (
        <Component className={className} id={`dynamic-text-${children.replace(/\s+/g, '-').toLowerCase()}`}>
            {displayText}
        </Component>
    );
};

export default DynamicText;
