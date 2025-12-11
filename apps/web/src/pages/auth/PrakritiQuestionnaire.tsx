// apps/web/src/pages/auth/PrakritiQuestionnaire.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { prakritiQuestions, mentalHealthQuestions, Question } from '../../utils/questions';
import { supabase } from '../../utils/supabase';
import api from '../../utils/api';
import { Leaf, Wind, Droplet, Flame, Check, ArrowRight, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

interface Answer {
  questionId: string;
  optionId: string;
  trait: 'vata' | 'pitta' | 'kapha';
  weight: number;
}

const PrakritiQuestionnaire: React.FC<{}> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const allQuestions = [...prakritiQuestions, ...mentalHealthQuestions];
  const midPoint = Math.ceil(allQuestions.length / 2);
  const page1Questions = allQuestions.slice(0, midPoint);
  const page2Questions = allQuestions.slice(midPoint);
  const currentQuestions = currentPage === 0 ? page1Questions : page2Questions;

  const progress = Math.round((answers.length / allQuestions.length) * 100);

  // Load saved progress
  useEffect(() => {
    const savedAnswers = localStorage.getItem('prakritiAnswers');
    const savedPage = localStorage.getItem('prakritiPage');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    if (savedPage) {
      setCurrentPage(parseInt(savedPage));
    }
    setLoadingQuestions(false);
  }, []);

  // Save progress when answers change
  useEffect(() => {
    localStorage.setItem('prakritiAnswers', JSON.stringify(answers));
    localStorage.setItem('prakritiPage', currentPage.toString());
  }, [answers, currentPage]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stateUserId = (location.state as any)?.userId;
        if (stateUserId) {
          setUserId(stateUserId);
          return;
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            setUserId(session.user.id);
            return;
          }
        } catch { }

        const fallbackToken =
          localStorage.getItem('authToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('accessToken') ||
          null;

        if (!fallbackToken) {
          navigate('/auth/login'); // Changed from phone to login
          return;
        }

        try {
          const verifyResp = await api.get('/auth/verify');
          if (verifyResp?.success && verifyResp.user?.id) {
            setUserId(verifyResp.user.id);
            return;
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            navigate('/auth/login');
            return;
          }
        } catch {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          navigate('/auth/login');
          return;
        }
      } catch {
        navigate('/auth/login');
      }
    };

    checkAuth();
  }, [location.state, navigate]);

  const handleAnswer = (question: Question, optionId: string) => {
    const option = question.options.find(o => o.id === optionId);
    if (!option) return;

    const newAnswer: Answer = {
      questionId: question.id,
      optionId: option.id,
      trait: option.trait,
      weight: option.weight
    };

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== question.id);
      return [...filtered, newAnswer];
    });
  };

  const isQuestionAnswered = (questionId: string) => {
    return answers.some(a => a.questionId === questionId);
  };

  const getSelectedOption = (questionId: string) => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.optionId || '';
  };

  const canProceed = () => {
    return currentQuestions.every(q => isQuestionAnswered(q.id));
  };

  const handleNext = () => {
    if (currentPage === 0 && canProceed()) {
      setCurrentPage(1);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentPage === 1) {
      setCurrentPage(0);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      setError('Please answer all questions before submitting');
      return;
    }
    if (!userId) {
      setError('User not authenticated. Please login again.');
      navigate('/auth/login');
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    setError('');

    const toastId = toast.loading('Analyzing your Prakriti...');

    try {
      if (answers.length < 5) {
        throw new Error('Please answer at least 5 questions for accurate prediction');
      }

      const response = await api.post('/questionnaire/submit', {
        userId,
        answers,
        questionnaire_type: 'prakriti'
      });

      if (!response?.questionnaire?.scores) {
        throw new Error('Invalid response from prediction service');
      }

      console.log('[Debug] Questionnaire submission response:', response);

      localStorage.removeItem('prakritiAnswers');
      localStorage.removeItem('prakritiPage');

      toast.success('Analysis complete!', { id: toastId });

      if (response.questionnaire) {
        navigate('/patient/dashboard', {
          state: { prakritiScores: response.questionnaire.scores }
        });
      } else {
        setError('Failed to process questionnaire results');
      }
    } catch (err: any) {
      console.error('Failed to submit questionnaire:', err);
      const errMsg = err.message || 'Failed to submit. Please try again.';
      setError(errMsg);
      toast.error(errMsg, { id: toastId });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };


  // Loading State
  if (!userId || loadingQuestions) {
    return (
      <div className="min-h-screen bg-[#F4F1DE] flex flex-col items-center justify-center font-serif text-[#3D405B]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Leaf className="w-16 h-16 text-[#81B29A]" />
        </motion.div>
        <h2 className="text-2xl font-medium tracking-wide">Preparing your assessment...</h2>
        <p className="mt-2 text-[#E07A5F]">Connecting to Ayurveda wisdom</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E07A5F] selection:text-white">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#81B29A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#E07A5F]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">

        {/* Header Section */}
        <header className="text-center mb-12 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm mb-4 border border-[#3D405B]/10">
              <Leaf className="w-6 h-6 text-[#3D405B]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#3D405B] mb-4 tracking-tight">
              Prakriti Assessment
            </h1>
            <p className="text-lg text-[#3D405B]/70 max-w-xl mx-auto leading-relaxed">
              Discover your unique Ayurvedic constitution (Dosha) through this mindful assessment.
              Be honest for the most accurate health insights.
            </p>
          </motion.div>
        </header>

        {/* Progress Bar */}
        <div className="mb-10 sticky top-4 z-20 bg-[#FDFBF7]/80 backdrop-blur-md py-4 px-6 rounded-2xl shadow-sm border border-[#3D405B]/5">
          <div className="flex justify-between items-center mb-2 text-sm font-medium text-[#3D405B]">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-[#3D405B]/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-[#E07A5F] rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#3D405B]/50">
            <span>Part 1: Physical Traits</span>
            <span>Part 2: Lifestyle & Mind</span>
          </div>
        </div>

        {/* Questionnaire Card */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {currentQuestions.map((question, idx) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#3D405B]/5 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F1DE] text-[#3D405B] font-serif font-medium text-sm">
                      {currentPage === 0 ? idx + 1 : midPoint + idx + 1}
                    </span>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] text-xs font-semibold tracking-wide uppercase mb-2">
                        {question.category}
                      </span>
                      <h3 className="text-xl font-medium text-[#3D405B] leading-snug">
                        {question.text}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-3 ml-0 md:ml-12">
                    {question.options.map((option) => {
                      const isSelected = getSelectedOption(question.id) === option.id;
                      return (
                        <label
                          key={option.id}
                          className={`relative flex items-center px-5 py-4 rounded-xl cursor-pointer border transition-all duration-200 group
                                                ${isSelected
                              ? 'bg-[#3D405B] border-[#3D405B] text-white shadow-lg shadow-[#3D405B]/20'
                              : 'bg-white border-[#3D405B]/10 text-[#3D405B]/80 hover:border-[#E07A5F] hover:bg-[#FFFBF9]'
                            }
                                            `}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option.id}
                            checked={isSelected}
                            onChange={() => handleAnswer(question, option.id)}
                            className="hidden"
                          />

                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors
                                                ${isSelected ? 'border-white' : 'border-[#3D405B]/30 group-hover:border-[#E07A5F]'}
                                            `}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>

                          <span className="text-base font-medium">{option.text}</span>

                          {/* Optional: Icon indicator of trait (hidden for user, but useful for debug) 
                                                <span className="ml-auto text-xs opacity-50 uppercase tracking-widest hidden md:block">{option.trait}</span>
                                            */}
                        </label>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3"
            >
              <Activity className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {/* Navigation Actions */}
          <div className="mt-12 flex items-center justify-between pb-12">
            <button
              onClick={currentPage === 0 ? () => navigate(-1) : handlePrev}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[#3D405B] font-medium hover:bg-[#3D405B]/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {currentPage === 0 ? 'Back' : 'Previous Section'}
            </button>

            {currentPage === 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || loading || isSubmitting}
                className={`
                            px-8 py-4 rounded-xl font-semibold text-white shadow-lg shadow-[#E07A5F]/20 flex items-center gap-3 transition-all
                            ${!canProceed()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#E07A5F] hover:bg-[#D06A4F] hover:scale-105 active:scale-95'
                  }
                        `}
              >
                {isSubmitting ? 'Analyzing...' : 'Complete Assessment'}
                {!isSubmitting && <Check className="w-5 h-5" />}
              </Button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`
                            px-8 py-4 rounded-xl font-semibold text-white shadow-lg flex items-center gap-3 transition-all
                            ${!canProceed()
                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                    : 'bg-[#3D405B] hover:bg-[#2A2D3E] shadow-[#3D405B]/20 hover:scale-105 active:scale-95'
                  }
                        `}
              >
                Next Section
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper button component for cleaner JSX
const Button = ({ children, className, onClick, disabled }: any) => (
  <button onClick={onClick} disabled={disabled} className={className}>
    {children}
  </button>
);

export default PrakritiQuestionnaire;