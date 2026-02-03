
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import './NutritionDashboard.css';
import { ChevronRight, Search, Filter, Leaf, AlertCircle, BarChart3, X, TrendingUp, ChevronDown, Sparkles } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import DynamicText from './DynamicText';

// --- Types ---
interface FoodItem {
  id: string;
  name_en: string;
  name_sanskrit?: string;
  food_group: string;
  calories_per_100g: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  vitamins?: string[];
  minerals?: string[];
  rasa: string[];
  virya?: string;
  vipaka?: string;
  dosha_effect: string[];
  therapeutic_uses?: string[];
  recommended_portion?: string;
}

interface DietRecommendation {
  id: string;
  prakriti_type: string;
  recommendations: any;
  foods_to_favor: any;
  foods_to_avoid: any;
  meal_timing: any;
  created_at: string;
  recommendation_type: string;
}

interface PrakritiScores {
  vata: number;
  pitta: number;
  kapha: number;
  dominant: string;
  percent: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  ml_prediction?: {
    predicted: string;
    confidence: number;
    probabilities: Record<string, number>;
  };
}

// --- Animation Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const GlassCard = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    onClick={onClick}
    className={`bg-[#1e293b]/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

const NutritionDashboard: React.FC<{ prakritiScores?: PrakritiScores }> = ({ prakritiScores }) => {
  const { t } = useLanguage();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [dietRecommendations, setDietRecommendations] = useState<DietRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFoodGroup, setSelectedFoodGroup] = useState('');
  const [selectedDosha, setSelectedDosha] = useState('');
  const [selectedVitamin, setSelectedVitamin] = useState('');
  const [selectedMineral, setSelectedMineral] = useState('');
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationType, setVisualizationType] = useState('macro');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showFoodDetail, setShowFoodDetail] = useState(false);

  const [showVitaminDropdown, setShowVitaminDropdown] = useState(false);
  const [showMineralDropdown, setShowMineralDropdown] = useState(false);

  const vitaminDropdownRef = useRef<HTMLDivElement>(null);
  const mineralDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (vitaminDropdownRef.current && !vitaminDropdownRef.current.contains(event.target as Node)) {
        setShowVitaminDropdown(false);
      }
      if (mineralDropdownRef.current && !mineralDropdownRef.current.contains(event.target as Node)) {
        setShowMineralDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError('');


        // Fetch food items - select all available columns
        const { data: foods, error: foodError } = await supabase
          .from('food_items')
          .select('id, name_en, name_sanskrit, food_group, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, vitamins, minerals, rasa, virya, vipaka, dosha_effect')
          .limit(200);

        if (foodError) throw foodError;
        setFoodItems(foods || []);

        // Auto-show items if initial load is successful
        if (foods && foods.length > 0) {
          setSearched(true);
        }


        // Fetch diet recommendations
        const { data: recommendations, error: recError } = await supabase
          .from('diet_recommendations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recError) throw recError;
        setDietRecommendations(recommendations || []);

      } catch (error) {
        console.error('Error loading initial data:', error);
        setError(`Error loading data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // Run once on mount


  const getVitaminDescription = (vitamin: string) => {
    return t(`nutrition.vitamin_desc.${vitamin}`, { defaultValue: t('nutrition.vitamin_desc.default') });
  };

  const getMineralDescription = (mineral: string) => {
    return t(`nutrition.mineral_desc.${mineral}`, { defaultValue: t('nutrition.mineral_desc.default') });
  };

  const getVitaminBenefits = (vitamin: string) => {
    const data = t(`nutrition.vitamin_benefits.${vitamin}`, { returnObjects: true, defaultValue: t('nutrition.vitamin_benefits.default', { returnObjects: true }) });
    return Array.isArray(data) ? data : [data as string];
  };

  const getMineralBenefits = (mineral: string) => {
    const data = t(`nutrition.mineral_benefits.${mineral}`, { returnObjects: true, defaultValue: t('nutrition.mineral_benefits.default', { returnObjects: true }) });
    return Array.isArray(data) ? data : [data as string];
  };

  const calculateAverageNutrition = () => {
    if (foodItems.length === 0) return [];
    const total = foodItems.reduce((acc, food) => ({
      calories: acc.calories + (food.calories_per_100g || 0),
      protein: acc.protein + (food.protein_g || 0),
      carbs: acc.carbs + (food.carbs_g || 0),
      fat: acc.fat + (food.fat_g || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const count = foodItems.length;
    return [
      { name: t('nutrition.protein'), value: Math.round((total.protein / count) * 10) / 10, color: '#E07A5F' }, // Terracotta
      { name: t('nutrition.carbs'), value: Math.round((total.carbs / count) * 10) / 10, color: '#81B29A' }, // Sage
      { name: t('nutrition.fat'), value: Math.round((total.fat / count) * 10) / 10, color: '#F2CC8F' } // Gold
    ];
  };

  const getDoeshaDistribution = () => {
    const vataCount = foodItems.filter(f => f.dosha_effect.some(e => e.includes('Vata'))).length;
    const pittaCount = foodItems.filter(f => f.dosha_effect.some(e => e.includes('Pitta'))).length;
    const kaphaCount = foodItems.filter(f => f.dosha_effect.some(e => e.includes('Kapha'))).length;

    return [
      { name: t('prakriti.vata'), value: vataCount, color: '#818cf8' }, // Indigo
      { name: t('prakriti.pitta'), value: pittaCount, color: '#fb923c' }, // Orange
      { name: t('prakriti.kapha'), value: kaphaCount, color: '#34d399' } // Emerald
    ];
  };

  const getFoodGroupDistribution = () => {
    const groupCounts = foodItems.reduce((acc, food) => {
      acc[food.food_group] = (acc[food.food_group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Updated colors for dark theme
    const colors = ['#E07A5F', '#81B29A', '#F2CC8F', '#A5B4FC', '#D06A4F', '#F4F1DE', '#9CA3AF', '#34d399'];
    return Object.entries(groupCounts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  };

  const getCalorieComparison = () => {
    return foodItems.map(food => ({
      name: food.name_en.substring(0, 10),
      calories: food.calories_per_100g || 0,
      protein: food.protein_g || 0,
      carbs: food.carbs_g || 0
    }));
  };

  const getMicronutritionData = () => {
    const vitaminCounts: Record<string, number> = {};
    const mineralCounts: Record<string, number> = {};

    foodItems.forEach(food => {
      if (food.vitamins) {
        food.vitamins.forEach(vitamin => {
          if (vitamin) vitaminCounts[vitamin] = (vitaminCounts[vitamin] || 0) + 1;
        });
      }
      if (food.minerals) {
        food.minerals.forEach(mineral => {
          if (mineral) mineralCounts[mineral] = (mineralCounts[mineral] || 0) + 1;
        });
      }
    });

    const topVitamins = Object.entries(vitaminCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const topMinerals = Object.entries(mineralCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return { vitamins: topVitamins, minerals: topMinerals };
  };

  const getDoshaMicronutritionData = () => {
    const vataFoods = foodItems.filter(food => food.dosha_effect.some(effect => effect.includes('Vata')));
    const pittaFoods = foodItems.filter(food => food.dosha_effect.some(effect => effect.includes('Pitta')));
    const kaphaFoods = foodItems.filter(food => food.dosha_effect.some(effect => effect.includes('Kapha')));

    const getMicronutritionForFoods = (foods: FoodItem[]) => {
      const vitaminCounts: Record<string, number> = {};
      const mineralCounts: Record<string, number> = {};

      foods.forEach(food => {
        if (food.vitamins) {
          food.vitamins.forEach(vitamin => {
            if (vitamin) vitaminCounts[vitamin] = (vitaminCounts[vitamin] || 0) + 1;
          });
        }
        if (food.minerals) {
          food.minerals.forEach(mineral => {
            if (mineral) mineralCounts[mineral] = (mineralCounts[mineral] || 0) + 1;
          });
        }
      });

      const topVitamins = Object.entries(vitaminCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topMinerals = Object.entries(mineralCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return { vitamins: topVitamins, minerals: topMinerals };
    };

    return {
      vata: getMicronutritionForFoods(vataFoods),
      pitta: getMicronutritionForFoods(pittaFoods),
      kapha: getMicronutritionForFoods(kaphaFoods)
    };
  };

  const searchFoodItemsByDosha = async (dosha: string) => {
    if (!dosha) return;

    try {
      setLoading(true);
      setError('');

      const { data: allFoods, error: allError } = await supabase
        .from('food_items')
        .select('id, name_en, name_sanskrit, food_group, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, vitamins, minerals, rasa, virya, vipaka, dosha_effect')
        .limit(2000); // Increased limit to ensure ample results

      if (allError) throw allError;

      if (!allFoods || allFoods.length === 0) {
        setError(t('nutrition.no_foods_found_filter'));
        setFoodItems([]);
        setSearched(true);
        return;
      }

      const filtered = allFoods.filter((food: any) => {
        const effects = Array.isArray(food.dosha_effect)
          ? food.dosha_effect
          : typeof food.dosha_effect === 'string'
            ? JSON.parse(food.dosha_effect)
            : [];

        return effects.some((effect: string) =>
          effect.toLowerCase().includes(`reduces ${dosha.toLowerCase()}`) ||
          effect.toLowerCase().includes(`balances ${dosha.toLowerCase()}`)
        );
      });

      if (filtered.length === 0) {
        setError(`${t('nutrition.no_foods_found')} ${dosha}. ${t('settings.try_different_filters')}`);
      }

      setFoodItems(filtered);
      setSearched(true);

    } catch (error) {
      console.error('Error searching by dosha:', error);
      setError(`${t('nutrition.search_error')}: ${error instanceof Error ? error.message : 'Unknown error'} `);
      setFoodItems([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const getAllMicronutrients = () => {
    const allVitamins = new Set<string>();
    const allMinerals = new Set<string>();

    foodItems.forEach(food => {
      if (food.vitamins) {
        food.vitamins.forEach(vitamin => {
          if (vitamin) allVitamins.add(vitamin);
        });
      }
      if (food.minerals) {
        food.minerals.forEach(mineral => {
          if (mineral) allMinerals.add(mineral);
        });
      }
    });

    return {
      vitamins: Array.from(allVitamins).sort(),
      minerals: Array.from(allMinerals).sort()
    };
  };

  const filterFoodsByMicronutrients = (foods: FoodItem[]) => {
    if (!selectedVitamin && !selectedMineral) return foods;

    return foods.filter(food => {
      const hasVitamin = selectedVitamin ? (food.vitamins && food.vitamins.includes(selectedVitamin)) : true;
      const hasMineral = selectedMineral ? (food.minerals && food.minerals.includes(selectedMineral)) : true;
      return hasVitamin && hasMineral;
    });
  };

  useEffect(() => {
    fetchNutritionData();

    if (prakritiScores) {
      const predictedDosha = prakritiScores.ml_prediction?.predicted || prakritiScores.dominant;
      setSelectedDosha(predictedDosha);
    }
  }, [prakritiScores]);

  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: recommendations, error: recError } = await supabase
        .from('diet_recommendations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recError) throw recError;
      setDietRecommendations(recommendations || []);

    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'} `);
    } finally {
      setLoading(false);
    }
  };

  const searchFoodItems = async (overrideDosha?: string) => {
    const doshaToUse = overrideDosha || selectedDosha;

    // Allow search even if no filters are set (returns all foods)
    // if (!searchTerm && !selectedFoodGroup && !doshaToUse && !prakritiScores) {
    //   return;
    // }

    try {
      setLoading(true);
      setError('');

      let query = supabase.from('food_items').select('id, name_en, name_sanskrit, food_group, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, vitamins, minerals, rasa, virya, vipaka, dosha_effect');

      if (searchTerm) {
        query = query.or(`name_en.ilike.%${searchTerm}%,name_sanskrit.ilike.%${searchTerm}%`);
      }

      if (selectedFoodGroup) {
        query = query.eq('food_group', selectedFoodGroup);
      }

      // Increase limit to allow effective client-side filtering
      const { data, error } = await query.limit(2000);

      if (error) throw error;

      let filtered: FoodItem[] = (data as any) || [];
      if (doshaToUse && filtered.length > 0) {
        filtered = filtered.filter((food: any) => {
          const effects = Array.isArray(food.dosha_effect)
            ? food.dosha_effect
            : (typeof food.dosha_effect === 'string' && food.dosha_effect.startsWith('['))
              ? JSON.parse(food.dosha_effect)
              : typeof food.dosha_effect === 'string'
                ? food.dosha_effect.split(',').map((s: string) => s.trim())
                : [];

          return effects.some((effect: string) =>
            effect && typeof effect === 'string' && (
              effect.toLowerCase().includes(`reduces ${doshaToUse.toLowerCase()}`) ||
              effect.toLowerCase().includes(`balances ${doshaToUse.toLowerCase()}`) ||
              effect.toLowerCase().includes(doshaToUse.toLowerCase())
            )
          );
        });
      }

      filtered = filterFoodsByMicronutrients(filtered);


      if (filtered.length === 0) {
        if (searchTerm || selectedFoodGroup || doshaToUse || selectedVitamin || selectedMineral) {
          setError(t('nutrition.no_foods_found_filter'));
        }
      }

      setFoodItems(filtered);
      setSearched(true);


    } catch (error) {
      console.error('Search error:', error);
      setError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'} `);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFoodGroup('');
    setSelectedDosha('');
    setSelectedVitamin('');
    setSelectedMineral('');
    setSearched(false);
    setError('');
    setFoodItems([]);
    setShowVisualization(false);
    setShowFoodDetail(false);
    setSelectedFood(null);
    fetchNutritionData();
  };

  const getDoshaEffectBadge = (effects: string[]) => {
    return effects.map((effect, index) => {
      let className = 'dosha-badge ';

      if (effect.toLowerCase().includes('reduces')) {
        className += 'reduces';
      } else if (effect.toLowerCase().includes('aggravates')) {
        className += 'aggravates';
      } else if (effect.toLowerCase().includes('balances')) {
        className += 'balances';
      } else {
        className += 'neutral';
      }

      return (
        <span key={index} className={className}>
          {effect.replace('Reduces ', 'R: ').replace('Aggravates ', 'A: ').replace('Balances ', 'B: ')}
        </span>
      );
    });
  };

  const getRasaBadges = (rasas: string[]) => {
    const rasaIcons: Record<string, string> = {
      'Madhura': '🍯',
      'Amla': '🍋',
      'Lavana': '🧂',
      'Katu': '🌶️',
      'Tikta': '🌿',
      'Kashaya': '🍂'
    };

    return rasas.map((rasa, index) => (
      <span key={index} className={`rasa - badge rasa - ${rasa.toLowerCase()} `}>
        {rasaIcons[rasa] || '🌾'} {rasa}
      </span>
    ));
  };

  const getViryaDisplay = (virya?: string) => {
    if (!virya) return null;
    const icon = virya === 'Ushna' ? '🔥' : '❄️';
    const className = `virya-badge virya-${virya.toLowerCase()}`;
    return <span className={className}>{icon} {virya}</span>;
  };

  const getPersonalizedRecommendations = () => {
    if (!prakritiScores) return null;

    const predictedDosha = prakritiScores.ml_prediction?.predicted || prakritiScores.dominant;
    const confidence = prakritiScores.ml_prediction?.confidence || 0;

    return (
      <div className="personalized-header">
        <div className="personalized-info">

          <p>
            {t('nutrition.based_on')} <strong>{predictedDosha}</strong> {t('prakriti.constitution')}
            {confidence > 0 && ` (${t('nutrition.ai_confidence')}: ${(confidence * 100).toFixed(0)}%)`}
          </p>
        </div>
        <div className="dosha-indicator">
          <span className={`dosha - badge ${predictedDosha.toLowerCase()} `}>
            {predictedDosha} {t('prakriti.dominant')}
          </span>
        </div>
      </div>
    );
  };

  const micronutrients = calculateAverageNutrition();
  const doshaData = getDoeshaDistribution();
  const groupData = getFoodGroupDistribution();
  const calorieData = getCalorieComparison();
  const micronutritionData = getMicronutritionData();

  if (loading && !searched) {
    return (
      <div className="nutrition-page">
        <div className="loader-container">
          <div className="spinner"></div>
          <p className="loader-text">{t('nutrition.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nutrition-page min-h-screen">
      <div className="nutrition-header relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

        <motion.div
          className="header-content relative z-10"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-[var(--accent-gold)]" size={24} />
            <h1 className="header-title"><DynamicText>{t('nutrition.engine')}</DynamicText></h1>
          </div>
          <p className="header-subtitle text-lg opacity-80 max-w-2xl">
            <DynamicText>{t('nutrition.subtitle_prefix')}</DynamicText>
            <span className="text-[var(--accent-terracotta)] font-bold ml-1">
              <DynamicText>{prakritiScores?.dominant ? `${prakritiScores.dominant.charAt(0).toUpperCase() + prakritiScores.dominant.slice(1)} ` : t('common.unique')}</DynamicText> <DynamicText>{t('prakriti.constitution')}</DynamicText>
            </span>
          </p>
        </motion.div>
      </div>

      <motion.div
        className="nutrition-container relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {prakritiScores && (
          <motion.section
            variants={fadeInUp}
            className="personalized-section mb-12"
          >
            {getPersonalizedRecommendations()}
          </motion.section>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 mb-6 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200"
          >
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <div>
              <p className="font-medium text-red-400">{t('error.search_issue')}</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </motion.div>
        )}

        {dietRecommendations.length > 0 && (
          <motion.section variants={fadeInUp} className="recommendations-section">
            <div className="section-header mb-6">
              <h2 className="section-title text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Leaf size={24} className="text-[var(--accent-sage)]" />
                <span><DynamicText>{t('nutrition.diet_plan')}</DynamicText></span>
              </h2>
              <span className="section-badge"><DynamicText>{`${dietRecommendations.length} ${t('nutrition.plans_available')}`}</DynamicText></span>
            </div>

            <motion.div
              className="recommendations-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
            >
              {dietRecommendations.map((rec) => (
                <motion.div
                  key={rec.id}
                  variants={fadeInUp}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`rec - card ${expandedRec === rec.id ? 'expanded ring-2 ring-[var(--accent-sage)]' : ''} `}
                  onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                >
                  <div className="rec-header">
                    <div className="rec-title-group">
                      <h3 className="rec-title capitalize"><DynamicText>{`${rec.prakriti_type} ${t('nutrition.diet_suffix')}`}</DynamicText></h3>
                      <span className="rec-type-badge">{rec.recommendation_type}</span>
                    </div>
                    <ChevronRight
                      className={`rec - chevron transition - transform duration - 300 ${expandedRec === rec.id ? 'rotate-90' : ''} `}
                      size={24}
                    />
                  </div>

                  <AnimatePresence>
                    {expandedRec === rec.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rec-content overflow-hidden"
                      >
                        {rec.recommendations?.length > 0 && (
                          <div className="rec-section mt-4">
                            <h4 className="rec-section-title flex items-center gap-2">
                              <span>📋 <DynamicText>{t('nutrition.guidelines')}</DynamicText></span>
                            </h4>
                            <ul className="rec-list">
                              {rec.recommendations.map((guideline: string, idx: number) => (
                                <li key={idx} className="text-sm"><DynamicText>{guideline}</DynamicText></li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {rec.foods_to_favor?.length > 0 && (
                          <div className="rec-section">
                            <h4 className="rec-section-title">✅ <DynamicText>{t('nutrition.foods_favor')}</DynamicText></h4>
                            <div className="food-tags favor">
                              {rec.foods_to_favor.map((food: string, idx: number) => (
                                <span key={idx} className="food-tag"><DynamicText>{food}</DynamicText></span>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.foods_to_avoid?.length > 0 && (
                          <div className="rec-section">
                            <h4 className="rec-section-title">❌ <DynamicText>{t('nutrition.foods_avoid')}</DynamicText></h4>
                            <div className="food-tags avoid">
                              {rec.foods_to_avoid.map((food: string, idx: number) => (
                                <span key={idx} className="food-tag avoid-tag"><DynamicText>{food}</DynamicText></span>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.meal_timing && (
                          <div className="rec-section">
                            <h4 className="rec-section-title">⏰ <DynamicText>{t('nutrition.meal_timing')}</DynamicText></h4>
                            <p className="meal-timing"><DynamicText>{rec.meal_timing}</DynamicText></p>
                          </div>
                        )}

                        <small className="rec-date block mt-4 opacity-50">{t('nutrition.created_at')}: {new Date(rec.created_at).toLocaleDateString()}</small>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        <motion.section
          variants={fadeInUp}
          className="food-database-section"
        >
          <div className="section-header mb-8">
            <h2 className="section-title text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <Leaf size={28} className="text-[var(--accent-sage)]" />
              <span><DynamicText>{t('nutrition.food_database')}</DynamicText></span>
            </h2>
            <span className="section-badge bg-[var(--accent-sage)]/20 text-[var(--accent-sage)] px-3 py-1 rounded-full text-sm font-medium border border-[var(--accent-sage)]/30">
              <DynamicText>{`${foodItems.length} ${t('nutrition.foods')}`}</DynamicText>
            </span>
          </div>

          <div className="search-filters-container bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl mb-8">
            <div className="search-box relative mb-6">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-sage)]/50 transition-all"
                placeholder={t("nutrition.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchFoodItems()}
              />
            </div>

            <div className="filters-row flex flex-wrap gap-4">
              <div className="custom-dropdown-container min-w-[200px]">
                <select
                  className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-sage)]/50 appearance-none cursor-pointer"
                  value={selectedFoodGroup}
                  onChange={(e) => setSelectedFoodGroup(e.target.value)}
                >
                  <option value=""><DynamicText>{t('nutrition.all_groups')}</DynamicText></option>
                  <option value="Grain">🌾 <DynamicText>Grain</DynamicText></option>
                  <option value="Fruit">🍎 <DynamicText>Fruit</DynamicText></option>
                  <option value="Vegetable">🥬 <DynamicText>Vegetable</DynamicText></option>
                  <option value="Dairy">🥛 <DynamicText>Dairy</DynamicText></option>
                  <option value="Legume">🫘 <DynamicText>Legume</DynamicText></option>
                  <option value="Spice">🌶️ <DynamicText>Spice</DynamicText></option>
                  <option value="Meat">🍖 <DynamicText>Meat</DynamicText></option>
                  <option value="Fish">🐟 <DynamicText>Fish</DynamicText></option>
                  <option value="Nut">🥜 <DynamicText>Nut</DynamicText></option>
                  <option value="Oil">🫗 <DynamicText>Oil</DynamicText></option>
                  <option value="Sweetener">🍯 <DynamicText>Sweetener</DynamicText></option>
                </select>
              </div>

              <div className="custom-dropdown-container min-w-[200px]">
                <select
                  className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-sage)]/50 appearance-none cursor-pointer"
                  value={selectedDosha}
                  onChange={(e) => setSelectedDosha(e.target.value)}
                >
                  <option value="">{t('nutrition.all_doshas')}</option>
                  <option value="Vata">💨 Vata</option>
                  <option value="Pitta">🔥 Pitta</option>
                  <option value="Kapha">💧 Kapha</option>
                </select>
              </div>

              <div className="flex gap-3 ml-auto">
                <button
                  className="btn-search group"
                  onClick={() => searchFoodItems()}
                >
                  <Search size={18} className="group-hover:scale-110 transition-transform" />
                  <span>{t('common.search')}</span>
                </button>
                <button
                  className="btn-clear group"
                  onClick={clearFilters}
                >
                  <span>{t('filters.clear')}</span>
                  <X size={16} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                </button>
              </div>
            </div>
          </div>

          {searched && foodItems.length > 0 && (
            <motion.div
              className="visualization-button-container"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                className="btn-visualization group"
                onClick={() => setShowVisualization(!showVisualization)}
              >
                <div className="btn-vis-icon">
                  <BarChart3 size={20} />
                </div>
                <span>Nutrition Analytics</span>
                <ChevronRight size={16} className="opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </button>
            </motion.div>
          )}



          {searched && foodItems.length > 0 ? (
            <div className="food-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems.map((food) => (
                <GlassCard key={food.id} className="food-card hover:border-[var(--accent-gold)] transition-colors group cursor-pointer" onClick={() => {
                  setSelectedFood(food);
                  setShowFoodDetail(true);
                }}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{food.name_en}</h3>
                        {food.name_sanskrit && (
                          <p className="text-sm text-[var(--text-secondary)] italic">{food.name_sanskrit}</p>
                        )}
                      </div>
                      <span className="text-2xl" title={food.food_group}>
                        {food.food_group === 'Grain' && '🌾'}
                        {food.food_group === 'Fruit' && '🍎'}
                        {food.food_group === 'Vegetable' && '🥬'}
                        {food.food_group === 'Dairy' && '🥛'}
                        {food.food_group === 'Legume' && '🫘'}
                        {food.food_group === 'Spice' && '🌶️'}
                        {food.food_group === 'Meat' && '🍖'}
                        {food.food_group === 'Fish' && '🐟'}
                        {food.food_group === 'Nut' && '🥜'}
                        {food.food_group === 'Oil' && '🫗'}
                        {food.food_group === 'Sweetener' && '🍯'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4 bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                        <span className="text-[var(--text-secondary)]">{t('nutrition.calories')}</span>
                        <span className="font-mono text-[var(--accent-gold)]">{food.calories_per_100g}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">{t('nutrition.protein')}</span>
                        <span className="font-mono text-[var(--text-primary)]">{food.protein_g}g</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {food.dosha_effect?.slice(0, 3).map((effect, idx) => (
                        <span key={idx} className={`text - xs px - 2 py - 1 rounded bg - black / 20 ${effect.toLowerCase().includes('reduces') ? 'text-green-400' :
                          effect.toLowerCase().includes('aggravates') ? 'text-red-400' : 'text-blue-400'
                          } `}>
                          {effect.split(' ')[0]} {effect.split(' ').slice(1).join(' ').substring(0, 3)}
                        </span>
                      ))}
                      {food.dosha_effect?.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded bg-black/20 text-white/50">+{food.dosha_effect.length - 3}</span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center text-[var(--accent-sage)] text-sm font-medium group-hover:gap-2 transition-all">
                      <span>{t('common.view_details')}</span>
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : searched && foodItems.length === 0 ? (
            <div className="empty-state text-center py-12">
              <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                <Leaf size={40} className="text-[var(--text-secondary)]" />
              </div>
              <p className="text-xl font-medium text-[var(--text-primary)]">{t('nutrition.no_foods_found')}</p>
              <p className="text-[var(--text-secondary)] mt-2">
                {t('nutrition.no_results')}
              </p>
            </div>

          ) : !searched && foodItems.length === 0 ? (
            <div className="empty-state relative overflow-hidden text-center py-16 border border-white/10 rounded-3xl bg-[#1a1c23]/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] group">
              {/* Animated background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-gold/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

              <div className="relative z-10 inline-flex items-center justify-center p-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 mb-8 border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
                <Search size={56} className="text-[var(--accent-gold)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" />
              </div>

              <h3 className="relative z-10 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F4F1DE] via-[#E07A5F] to-[#F4F1DE] mb-4 drop-shadow-sm">
                {t('nutrition.start_search')}
              </h3>

              <p className="relative z-10 text-[var(--text-secondary)] max-w-lg mx-auto mb-10 text-lg font-light leading-relaxed tracking-wide">
                {prakritiScores
                  ? `Discover personalized foods that balance your ${prakritiScores.dominant} constitution.`
                  : t('nutrition.search_instruction')}
              </p>

              {prakritiScores && (
                <button
                  className="relative z-10 px-10 py-4 rounded-xl bg-gradient-to-r from-[#E07A5F] to-[#d06041] text-white font-bold text-lg shadow-[0_10px_30px_rgba(224,122,95,0.3)] hover:shadow-[0_15px_40px_rgba(224,122,95,0.5)] hover:scale-105 transition-all duration-300 transform active:scale-95 border border-white/10"
                  onClick={() => searchFoodItemsByDosha(prakritiScores.ml_prediction?.predicted || prakritiScores.dominant)}
                >
                  <span className="flex items-center gap-2">
                    {t('nutrition.show_foods_for')} {(prakritiScores.ml_prediction?.predicted || prakritiScores.dominant).toUpperCase()}
                    <ChevronRight size={20} />
                  </span>
                </button>
              )}
            </div>
          ) : null}
        </motion.section>



        <motion.section
          variants={fadeInUp}
          className="principles-section mt-12 mb-8"
        >
          <div className="section-header mb-6">
            <h2 className="section-title text-xl font-bold text-[var(--text-primary)]">⭐ {t('nutrition.principles')}</h2>
          </div>

          <div className="principles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🌱', title: t('nutrition.rasa'), desc: 'The six tastes influence your body and mind.' },
              { icon: '🔥', title: t('nutrition.virya'), desc: 'Heating or cooling effect on digestion.' },
              { icon: '🌀', title: t('nutrition.vipaka'), desc: 'Final effect after digestion.' },
              { icon: '⚖️', title: t('nutrition.dosha_balance'), desc: 'Foods can reduce or balance your doshas.' }
            ].map((principle, idx) => (
              <GlassCard key={idx} className="p-6 text-center hover:bg-white/[0.03] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/5 hover:border-[var(--accent-gold)]/30 group">
                <div className="text-5xl mb-4 transform transition-transform group-hover:scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{principle.icon}</div>
                <h4 className="text-lg font-bold text-[var(--accent-gold)] mb-2 group-hover:text-[#f4d06f] transition-colors">{principle.title}</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{principle.desc}</p>
              </GlassCard>
            ))}
          </div>
        </motion.section>
      </motion.div>

      {/* Visualization Modal - Moved to root for proper Z-Index */}
      {showVisualization && searched && foodItems.length > 0 && (
        <div className="visualization-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="visualization-modal" style={{
            backgroundColor: '#1e293b',
            borderRadius: '24px',
            maxWidth: '1400px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div className="visualization-modal-header" style={{
              padding: '24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <h2 className="visualization-title" style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#f3f4f6',
                  marginBottom: '4px'
                }}>📊 {t('nutrition.analytics')}</h2>
                <p className="visualization-subtitle" style={{
                  fontSize: '14px',
                  color: '#9ca3af'
                }}>{t('nutrition.viz_desc')}</p>
              </div>
              <button
                className="visualization-close-btn"
                onClick={() => setShowVisualization(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <X size={24} />
              </button>
            </div>


            <div className="visualization-modal-content" style={{
              flex: 1,
              overflow: 'auto',
              padding: '24px',
              backgroundColor: '#0f172a'
            }}>
              <div className="visualization-tabs-container" style={{
                marginBottom: '24px'
              }}>
                <div className="visualization-tabs" style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px'
                }}>
                  {[
                    { id: 'macro', label: t('nutrition.macros'), icon: '📊' },
                    { id: 'dosha', label: t('nutrition.dosha_effects'), icon: '⚖️' },
                    { id: 'group', label: t('nutrition.food_groups'), icon: '🥘' },
                    { id: 'calories', label: t('nutrition.calorie_comparison'), icon: '🔥' },
                    { id: 'micronutrients', label: t('nutrition.vitamins_minerals'), icon: 'mic' },
                    { id: 'doshaMicronutrients', label: t('nutrition.dosha_micros'), icon: 'dna' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setVisualizationType(tab.id)}
                      className={`visualization-tab ${visualizationType === tab.id ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: visualizationType === tab.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        color: visualizationType === tab.id ? '#60a5fa' : '#9ca3af',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: visualizationType === tab.id ? '600' : '500',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (visualizationType !== tab.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.color = '#d1d5db';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (visualizationType !== tab.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#9ca3af';
                        }
                      }}
                    >
                      <span className="tab-icon" style={{ fontSize: '18px' }}>{tab.icon === 'mic' ? '🔬' : tab.icon === 'dna' ? '🧬' : tab.icon}</span>
                      <span className="tab-label">{tab.label}</span>
                      {visualizationType === tab.id && (
                        <motion.div
                          className="tab-indicator"
                          layoutId="activeTab"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            backgroundColor: '#60a5fa'
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {visualizationType === 'macro' && (
                <motion.div
                  className="visualization-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="visualization-card main-chart-card">
                    <h3 className="visualization-card-title">{t('nutrition.avg_macro_dist')}</h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={micronutrients}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            animationBegin={200}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          >
                            {micronutrients.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(31, 41, 55, 0.95)',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              color: '#f3f4f6',
                              backdropFilter: 'blur(4px)',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ color: '#e5e7eb' }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span style={{ color: '#9ca3af', fontWeight: 500 }}>{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="visualization-card stats-card">
                    <h3 className="visualization-card-title">{t('nutrition.quick_stats')}</h3>
                    <div className="stats-grid">
                      {micronutrients.map((macro, idx) => (
                        <div key={idx} className="stat-item" style={{ borderColor: macro.color + '40' }}>
                          <div className="stat-label" style={{ color: macro.color }}>{macro.name}</div>
                          <div className="stat-value">{macro.value}g</div>
                          <div className="stat-bar-bg">
                            <motion.div
                              className="stat-bar"
                              initial={{ width: 0 }}
                              animate={{ width: `${(macro.value / 50) * 100}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              style={{ backgroundColor: macro.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {visualizationType === 'dosha' && (
                <motion.div
                  className="visualization-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="visualization-card">
                    <h3 className="visualization-card-title">{t('nutrition.dosha_dist_results')}</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={doshaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#9ca3af', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis
                          tick={{ fill: '#9ca3af', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(31, 41, 55, 0.95)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#f3f4f6'
                          }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          {doshaData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {visualizationType === 'group' && (
                <motion.div
                  className="visualization-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="visualization-card main-chart-card" style={{ gridColumn: '1 / -1' }}>
                    {selectedFoodGroup ? (
                      <>
                        <h3 className="visualization-card-title">
                          {t('nutrition.top_recommended')} {selectedFoodGroup}s {t('nutrition.show_foods_for')} {(selectedDosha || prakritiScores?.dominant || 'You').charAt(0).toUpperCase() + (selectedDosha || prakritiScores?.dominant || 'You').slice(1)}
                        </h3>
                        {(() => {
                          const targetDosha = selectedDosha || prakritiScores?.dominant || '';
                          const recommended = targetDosha
                            ? foodItems.filter(f => f.dosha_effect.some(e => e.toLowerCase().includes(`reduces ${targetDosha.toLowerCase()}`)))
                            : foodItems;

                          const displayItems = (recommended.length > 0 ? recommended : foodItems)
                            .slice(0, 15)
                            .map(f => ({
                              name: f.name_en.length > 20 ? f.name_en.substring(0, 20) + '...' : f.name_en,
                              full_name: f.name_en,
                              calories: f.calories_per_100g,
                              protein: f.protein_g
                            }));

                          return (
                            <ResponsiveContainer width="100%" height={500}>
                              <BarChart
                                layout="vertical"
                                data={displayItems}
                                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#374151' }} />
                                <YAxis
                                  dataKey="name"
                                  type="category"
                                  width={100}
                                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                                  axisLine={{ stroke: '#374151' }}
                                />
                                <Tooltip
                                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="custom-tooltip" style={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                          <p style={{ color: '#f3f4f6', fontWeight: 600, marginBottom: '4px' }}>{data.full_name}</p>
                                          <p style={{ color: '#E07A5F', fontSize: '12px' }}>Calories: {data.calories}</p>
                                          <p style={{ color: '#34d399', fontSize: '12px' }}>Protein: {data.protein}g</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="calories" name="Calories" fill="#E07A5F" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1500} />
                                <Bar dataKey="protein" name="Protein" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1500} animationBegin={300} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                              </BarChart>
                            </ResponsiveContainer>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        <h3 className="visualization-card-title">{t('nutrition.group_dist')}</h3>
                        <ResponsiveContainer width="100%" height={400}>
                          <PieChart>
                            <Pie
                              data={groupData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
                                const RADIAN = Math.PI / 180;
                                const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
                                const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
                                const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
                                return percent > 0.05 ? (
                                  <text x={x} y={y} fill="white" textAnchor={x > Number(cx) ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight={600}>
                                    {`${(percent * 100).toFixed(0)}%`}
                                  </text>
                                ) : null;
                              }}
                              outerRadius={150}
                              dataKey="value"
                              stroke="none"
                              animationDuration={1500}
                              animationEasing="ease-out"
                            >
                              {groupData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: '#f3f4f6'
                              }}
                              formatter={(value: number) => [`${value} ${t('common.items')}`, t('common.count')]}
                            />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {visualizationType === 'calories' && (
                <motion.div
                  className="visualization-card main-chart-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="visualization-card-title">
                    {t('nutrition.top_50_cals')}
                    {(selectedFoodGroup || selectedDosha) && <span className="text-sm font-normal text-gray-400 ml-2">(Filtered)</span>}
                  </h3>

                  {(() => {
                    // Filter and Sort Data for "Top 50"
                    let filtered = [...foodItems];

                    if (selectedFoodGroup) {
                      filtered = filtered.filter(f => f.food_group === selectedFoodGroup);
                    }

                    if (selectedDosha) {
                      filtered = filtered.filter(f => f.dosha_effect.some(e => e.toLowerCase().includes(`reduces ${selectedDosha.toLowerCase()}`)));
                    } else if (prakritiScores?.dominant) {
                      // Optional: Auto-filter by dominant dosha if no specific dosha selected? 
                      // User asked for "selected doshas", implies explicit selection, but fallback is nice.
                      // We'll stick to explicit filters to avoid confusion, or use the active list logic.
                      // Since foodItems might already be filtered by the search/filter logic of the main grid, 
                      // we'll accept foodItems as the base source to respect the user's current view context.
                    }

                    // Sort by Calories Descending
                    const sortedData = filtered
                      .sort((a, b) => b.calories_per_100g - a.calories_per_100g)
                      .slice(0, 50)
                      .map(f => ({
                        name: f.name_en,
                        shortName: f.name_en.length > 15 ? f.name_en.substring(0, 15) + '...' : f.name_en,
                        calories: f.calories_per_100g,
                        protein: f.protein_g
                      }));

                    return (
                      <ResponsiveContainer width="100%" height={500}>
                        <BarChart
                          data={sortedData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.3} />
                            </linearGradient>
                            <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.3} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis
                            dataKey="shortName"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            axisLine={{ stroke: '#374151' }}
                            interval={0}
                          />
                          <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} axisLine={{ stroke: '#374151' }} label={{ value: 'Calories', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} axisLine={{ stroke: '#374151' }} label={{ value: 'Protein (g)', angle: 90, position: 'insideRight', fill: '#9ca3af' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(31, 41, 55, 0.95)',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              color: '#f3f4f6'
                            }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '10px' }} />

                          <Bar
                            yAxisId="left"
                            dataKey="calories"
                            name="Calories (kcal)"
                            fill="url(#colorCalories)"
                            radius={[4, 4, 0, 0]}
                            animationDuration={2000}
                            animationEasing="ease-out"
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="protein"
                            name="Protein (g)"
                            fill="url(#colorProtein)"
                            radius={[4, 4, 0, 0]}
                            animationDuration={2000}
                            animationBegin={500}
                            animationEasing="ease-out"
                          />

                          <Brush
                            dataKey="name"
                            height={30}
                            stroke="#8884d8"
                            fill="rgba(31, 41, 55, 0.5)"
                            tickFormatter={() => ''}
                            startIndex={0}
                            endIndex={15}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </motion.div>
              )}

              {visualizationType === 'micronutrients' && (
                <div className="visualization-grid">
                  <div className="visualization-card">
                    <h3 className="visualization-card-title">{t('nutrition.top_vitamins')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={micronutritionData.vitamins}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} axisLine={{ stroke: '#374151' }} />
                        <YAxis tick={{ fill: '#9ca3af' }} axisLine={{ stroke: '#374151' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="count" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="visualization-card">
                    <h3 className="visualization-card-title">{t('nutrition.top_minerals')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={micronutritionData.minerals}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} axisLine={{ stroke: '#374151' }} />
                        <YAxis tick={{ fill: '#9ca3af' }} axisLine={{ stroke: '#374151' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="count" fill="#4ECDC4" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {visualizationType === 'doshaMicronutrients' && (
                <motion.div
                  className="visualization-grid grid-cols-3"
                  style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="visualization-card">
                    <h3 className="visualization-card-title">🔬 {t('nutrition.vata_vitamins')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getDoshaMicronutritionData().vata.vitamins}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} animationDuration={1000} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="visualization-card">
                    <h3 className="visualization-card-title">🔬 {t('nutrition.pitta_vitamins')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getDoshaMicronutritionData().pitta.vitamins}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="count" fill="#f87171" radius={[4, 4, 0, 0]} animationDuration={1000} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="visualization-card">
                    <h3 className="visualization-card-title">🔬 {t('nutrition.kapha_vitamins')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getDoshaMicronutritionData().kapha.vitamins}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} animationDuration={1000} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              <div className="visualization-insight">
                <p>
                  <TrendingUp size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  <strong>Insight:</strong> These visualizations update based on your search results.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Visualization Modal - Moved to root for proper Z-Index */}
      {showVisualization && searched && foodItems.length > 0 && (
        <div className="visualization-modal-overlay">
          {/* ...visualization code... */}
          {/* Note: In a real edit, the tool would preserve the content above. 
              Here I am just using the anchor to append the new code block below 
              or effectively replacing the end of the file to include the new block. 
          */}
          <div className="visualization-modal">
            {/* We don't want to re-write the huge visualization block again just to append. 
                Instead, I will target the end of the file to APPEND this new block.
             */}
          </div>
        </div>
      )}

      {/* Food Detail Modal - Advanced 3D Glassmorphism Design - Moved to Root */}
      <AnimatePresence>
        {showFoodDetail && selectedFood && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFoodDetail(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              style={{
                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1), 0 20px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
              initial={{ scale: 0.9, y: 50, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent opacity-50" />

              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#1a1a1a]/95 backdrop-blur-md border-b border-white/5">
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-gold)] to-[#fcd34d]">
                    {selectedFood.name_en}
                  </h2>
                  {selectedFood.name_sanskrit && (
                    <p className="text-lg italic text-[var(--accent-green)] opacity-80 mt-1">
                      {selectedFood.name_sanskrit}
                    </p>
                  )}
                </div>
                <button
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowFoodDetail(false)}
                >
                  <X size={28} />
                </button>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info Card */}
                <motion.div
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl bg-[var(--accent-gold)]/20 p-2 rounded-lg text-[var(--accent-gold)]">📋</span>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Basic Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Food Group</span>
                      <span className="text-white font-medium">{selectedFood.food_group}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Portion</span>
                      <span className="text-white font-medium">{selectedFood.recommended_portion || 'As needed'}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Ayurvedic Properties Card */}
                <motion.div
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl bg-[var(--accent-green)]/20 p-2 rounded-lg text-[var(--accent-green)]">🌱</span>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Ayurvedic Properties</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-500 mb-1 block">Rasa (Taste)</span>
                      <div className="flex flex-wrap gap-2">{selectedFood.rasa && getRasaBadges(selectedFood.rasa)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs uppercase tracking-wide text-gray-500 mb-1 block">Virya (Potency)</span>
                        <div>{getViryaDisplay(selectedFood.virya)}</div>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-gray-500 mb-1 block">Vipaka (Post-Digestive)</span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          {selectedFood.vipaka || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Macronutrients Card (Full Width) */}
                <motion.div
                  className="col-span-1 md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl bg-blue-500/20 p-2 rounded-lg text-blue-400">📊</span>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Macronutrients <span className="text-sm font-normal text-gray-500 ml-2">(per 100g)</span></h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Calories', value: selectedFood.calories_per_100g, unit: 'kcal', color: '#E07A5F' },
                      { label: 'Protein', value: selectedFood.protein_g, unit: 'g', color: '#81B29A' },
                      { label: 'Carbs', value: selectedFood.carbs_g, unit: 'g', color: '#F2CC8F' },
                      { label: 'Fat', value: selectedFood.fat_g, unit: 'g', color: '#F4A261' },
                      { label: 'Fiber', value: selectedFood.fiber_g, unit: 'g', color: '#3D405B' }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-black/20 border border-white/5">
                        <span className="text-2xl font-bold mb-1" style={{ color: item.color }}>{item.value || 0}</span>
                        <span className="text-xs text-gray-400">{item.unit}</span>
                        <span className="text-xs font-medium text-gray-300 mt-2">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Dosha Effects */}
                <motion.div
                  className="col-span-1 md:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl bg-purple-500/20 p-2 rounded-lg text-purple-400">⚖️</span>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Dosha Effects</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {getDoshaEffectBadge(selectedFood.dosha_effect)}
                  </div>
                </motion.div>

                {/* Vitamins & Minerals Section */}
                {((selectedFood.vitamins && selectedFood.vitamins.length > 0) || (selectedFood.minerals && selectedFood.minerals.length > 0)) && (
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedFood.vitamins && selectedFood.vitamins.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-300 flex items-center gap-2">
                          <span className="text-pink-400">🔬</span> Vitamins
                        </h4>
                        <div className="space-y-3">
                          {selectedFood.vitamins.map((vitamin, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs font-bold">{vitamin}</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-2">{getVitaminDescription(vitamin)}</p>
                              <div className="flex flex-wrap gap-1">
                                {getVitaminBenefits(vitamin).map((benefit, bIdx) => (
                                  <span key={bIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5">{benefit}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedFood.minerals && selectedFood.minerals.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-300 flex items-center gap-2">
                          <span className="text-teal-400">🧂</span> Minerals
                        </h4>
                        <div className="space-y-3">
                          {selectedFood.minerals.map((mineral, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-teal-500/30 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <span className="px-2 py-1 bg-teal-500/20 text-teal-300 rounded text-xs font-bold">{mineral}</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-2">{getMineralDescription(mineral)}</p>
                              <div className="flex flex-wrap gap-1">
                                {getMineralBenefits(mineral).map((benefit, bIdx) => (
                                  <span key={bIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5">{benefit}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Therapeutic Uses */}
                {selectedFood.therapeutic_uses && selectedFood.therapeutic_uses.length > 0 && (
                  <div className="col-span-1 md:col-span-2 p-6 rounded-2xl bg-green-900/10 border border-green-500/10">
                    <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                      <span>💊</span> Therapeutic Uses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFood.therapeutic_uses.map((use, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-300 border border-green-500/20 text-sm font-medium">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NutritionDashboard;