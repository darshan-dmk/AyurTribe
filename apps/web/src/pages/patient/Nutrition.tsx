import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NutritionDashboard from '../../components/NutritionDashboard';
import PatientNavbar from '../../components/PatientNavbar';
import api from '../../utils/api';

import { GlobalFooter } from '../../components/GlobalFooter';

const PatientNutrition: React.FC = () => {
    const navigate = useNavigate();
    const [prakritiScores, setPrakritiScores] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrakritiData = async () => {
            try {
                const response = await api.get('/questionnaire/latest');
                if (response && response.scores) {
                    let scores = response.scores;
                    if (typeof scores === 'string') {
                        try {
                            scores = JSON.parse(scores);
                        } catch (e) {
                            console.warn('Failed to parse scores', e);
                        }
                    }

                    // Normalize scores structure for NutritionDashboard
                    const normalizedScores = {
                        vata: scores.vata,
                        pitta: scores.pitta,
                        kapha: scores.kapha,
                        dominant: response.dominant || response.final_prakriti_assessment || 'vata',
                        percent: {
                            vata: Math.round((scores.vata || 0) * 100),
                            pitta: Math.round((scores.pitta || 0) * 100),
                            kapha: Math.round((scores.kapha || 0) * 100)
                        },
                        ml_prediction: response.ml_predictions ?
                            (typeof response.ml_predictions === 'string' ? JSON.parse(response.ml_predictions) : response.ml_predictions)
                            : undefined
                    };

                    setPrakritiScores(normalizedScores);
                }
            } catch (error) {
                console.error('Error fetching prakriti data for nutrition:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrakritiData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1c23] flex items-center justify-center text-[#F4F1DE]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81B29A]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1c23] flex flex-col">
            <PatientNavbar />
            <div className="pt-24 px-4 sm:px-6 lg:px-8 flex-1">
                <NutritionDashboard prakritiScores={prakritiScores} />
            </div>
            <GlobalFooter dark className="border-t border-white/5 mt-12 bg-black/20" />
        </div>
    );
};

export default PatientNutrition;
