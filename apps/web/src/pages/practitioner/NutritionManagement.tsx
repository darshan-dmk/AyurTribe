// apps/web/src/pages/practitioner/NutritionManagement.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PractitionerNutritionManager from '../../components/PractitionerNutritionManager';

import { useLanguage } from '../../context/LanguageContext';

import { GlobalFooter } from '../../components/GlobalFooter';

const NutritionManagement: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/practitioner');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('actions.back_dashboard')}
              </button>
              <h1 className="text-xl font-bold text-gray-800">{t('nutrition.management_title')}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {t('actions.back_dashboard')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('nutrition.management_header')}</h2>
          <p className="text-gray-600 mt-2">
            {t('nutrition.management_desc')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <PractitionerNutritionManager />
        </div>
      </main>
      <GlobalFooter className="border-t border-gray-200/50 bg-white" />
    </div>
  );
};

export default NutritionManagement;