// Reading file to check theme logic first - this is a placeholder for the tool call
// I will read Dashboard.tsx lines 50-150.
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import { profileService } from '../../services/profileService';
import ProfileManager from '../../components/ProfileManager';
import AppointmentBooking from '../../components/AppointmentBooking';
import ChatWidget from '../../components/ChatWidget';
import PrakritiSummaryCard from '../../components/PrakritiSummaryCard';
import api from '../../utils/api';
import PrakritiVisualizationEnhanced from '../../components/PrakritiVisualizationEnhanced';
import NutritionDashboard from '../../components/NutritionDashboard';
import PatientNavbar from '../../components/PatientNavbar';
import { useLanguage } from '../../context/LanguageContext';
import DynamicText from '../../components/DynamicText';
import { GlobalFooter } from '../../components/GlobalFooter';

/* ---------- types ---------- */
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

interface User {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  role?: string;
}

interface MentalHealthScore {
  level: 'green' | 'yellow' | 'red';
  score: number;
}

interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
}

interface HealthMetric {
  label: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warning' | 'critical';
  icon: string;
}

interface AppUser {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  role?: string;
}

/* ---------- component ---------- */
const PatientDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [prakritiScores, setPrakritiScores] = useState<PrakritiScores | null>(null);
  const [mentalHealth, setMentalHealth] = useState<MentalHealthScore | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(searchParams.get('view') || 'dashboard');

  useEffect(() => {
    const view = searchParams.get('view');
    if (view) {
      setActiveView(view);
    }
  }, [searchParams]);

  // Theme is always 'dark' (Ayurvedic Portal)
  const theme = 'dark'; const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Modal states
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);

  // Focus visualization
  const [focusVisualization, setFocusVisualization] = useState(false);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const fetchInProgress = useRef(false);
  const initialLoadDone = useRef(false);

  console.log('[Debug] Rendering Dashboard, prakritiScores:', prakritiScores);



  // Fetch prakriti scores and user data
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    let subscription: any = null;

    const fetchPrakritiData = async (isInitial = false) => {
      if (fetchInProgress.current) {
        console.log('[Dashboard] Fetch already in progress, skipping...');
        return;
      }

      try {
        fetchInProgress.current = true;
        if (isInitial) setLoading(true);
        console.log('[Dashboard] Fetching questionnaire data...');

        const response = await api.get('/questionnaire/latest');
        console.log('[Dashboard] Data fetched successfully:', !!response);

        if (response) {
          const { scores, mentalHealth: mental, dominant } = response;

          // Only set scores if they're available and have the required structure
          if (scores && (scores.vata != null || scores.percent != null)) {
            // Parse scores if they're a string
            let parsedScores = scores;
            if (typeof scores === 'string') {
              try {
                parsedScores = JSON.parse(scores);
              } catch (e) {
                console.warn('[Dashboard] Failed to parse scores string:', e);
                parsedScores = scores;
              }
            }

            const normalizedScores = {
              vata: parsedScores.vata || 0,
              pitta: parsedScores.pitta || 0,
              kapha: parsedScores.kapha || 0,
              dominant: dominant || parsedScores.dominant || 'vata',
              percent: parsedScores.percent || calculateDefaultPercents(parsedScores),
              ml_prediction: parsedScores.ml_prediction
            };
            setPrakritiScores(normalizedScores);

            // Clear polling interval once we have valid data
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          } else {
            console.warn('[Dashboard] Invalid scores structure:', scores);
            // Don't set null here if we already have scores, to avoid flickering
            if (!prakritiScores) setPrakritiScores(null);
          }

          if (mental) {
            // Parse mental health if it's a string
            let parsedMental = mental;
            if (typeof mental === 'string') {
              try {
                parsedMental = JSON.parse(mental);
              } catch (e) {
                console.warn('[Dashboard] Failed to parse mental health string:', e);
                parsedMental = mental;
              }
            }

            setMentalHealth({
              score: typeof parsedMental === 'object' ? (parsedMental.score || 0) : parsedMental,
              level: typeof parsedMental === 'object' ? (parsedMental.level || 'green') : (parsedMental > 75 ? 'green' : parsedMental > 50 ? 'yellow' : 'red')
            });
          }
        }
      } catch (err) {
        console.error('[Dashboard] Failed to fetch prakriti data:', err);
        // Only show error on initial load to avoid interrupting user during background polls
        if (isInitial) setError('Failed to load health data');
      } finally {
        fetchInProgress.current = false;
        if (isInitial) setLoading(false);
      }
    };

    // Set up real-time subscription to questionnaire changes
    const setupRealTimeSubscription = () => {
      if (user?.id) {
        console.log('[Dashboard] Setting up real-time subscription for user:', user.id);
        subscription = supabase
          .channel('questionnaire-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'questionnaire_answers',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('[Dashboard] Real-time data update detected:', payload);
              // Fetch updated data when changes occur
              fetchPrakritiData();
            }
          )
          .subscribe();
      }
    };

    // Initial fetch if user exists
    if (user?.id) {
      fetchPrakritiData(true);
      setupRealTimeSubscription();
    }

    // Set up polling as fallback (every 15 seconds for 1 minute max)
    let pollCount = 0;
    pollInterval = setInterval(() => {
      pollCount++;
      if (pollCount < 4) { // Stop polling after 1 minute (4 * 15s)
        fetchPrakritiData(false); // Background poll
      } else if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }, 15000);

    // Clean up interval and subscription on component unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user?.id]);

  /* ---------- theme CSS injection ---------- */
  useEffect(() => {
    const css = `
      :root{
        /* Ayurvedic Portal Palette - DARK MODE */
        --bg-dark-1: #1a1c23;    /* Deep Charcoal/Navy */
        --bg-dark-2: #252836;    /* Lighter Charcoal */
        --bg-dark-3: #393E54;
        
        --accent-sage: #81B29A;
        --accent-terracotta: #E07A5F;
        --accent-sand: #F4F1DE;
        --accent-charcoal: #E5E7EB; /* Re-mapped for dark mode text */
        --accent-gold-1: #E07A5F;
        --accent-gold-2: #D06A4F;
        --accent-gold-3: #F2CC8F;
        
        --muted-brown: #9CA3AF;
        
        /* Card & UI Colors */
        --card-bg: rgba(37, 40, 54, 0.95);
        --card-border: rgba(255, 255, 255, 0.08);
        
        --text-dark: #F4F1DE; /* Sand/Light text for dark mode */
        --muted-text: #9CA3AF;
        
        --glass-yellow: rgba(244, 241, 222, 0.05);
        --scroll-track: rgba(255, 255, 255, 0.05);
        
        /* Theme Specifics */
        --light-bg: #1a1c23;      
        --light-surface: #252836;
        --light-muted: #6B7280;
      }

      /* Keyframes */
      @keyframes rotateMandala { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes floatHerb {
        0%,100% { transform: translate(0,0) rotate(0deg) scale(1); opacity: .14; }
        25% { transform: translate(30px,-40px) rotate(90deg) scale(1.06); opacity: .18; }
        50% { transform: translate(-20px,-60px) rotate(180deg) scale(.95); opacity: .12; }
        75% { transform: translate(-40px,-20px) rotate(270deg) scale(1.03); opacity: .16; }
      }
      @keyframes ayurvedicBreathe {
        0%,100% { transform: scale(0.9); opacity: 0.2; filter: blur(2px); }
        50% { transform: scale(1.06); opacity: 0.5; filter: blur(0px); }
      }
      @keyframes pulseExpand {
        0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0.8; }
        100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0; }
      }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0);} }
      @keyframes goldenPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(218,165,32,0.32); } 50% { box-shadow: 0 0 0 10px rgba(218,165,32,0); } }

      .mandala-rotate { animation: rotateMandala 60s linear infinite; pointer-events: none; }
      .herb-float-1 { animation: floatHerb 28s infinite ease-in-out; pointer-events: none; }
      .herb-float-2 { animation: floatHerb 30s infinite ease-in-out; animation-delay: -6s; pointer-events: none; }
      .breathe-1 { animation: ayurvedicBreathe 6s ease-in-out infinite; pointer-events: none; }
      .pulse-ring { animation: pulseExpand 4s ease-out infinite; pointer-events: none; }
      .fade-in { animation: fadeIn 0.45s ease-out forwards; }
      .golden-pulse { animation: goldenPulse 2s ease-in-out infinite; }

      .custom-radio { width:20px; height:20px; border-radius:50%; border:2px solid var(--accent-gold-2); background: rgba(37,40,54,0.6); position:relative; transition:all .3s; flex-shrink:0; }
      .custom-radio.checked { background: linear-gradient(135deg, var(--accent-gold-1), var(--accent-gold-2)); box-shadow: 0 0 0 3px rgba(224,122,95,0.3); }
      .custom-radio.checked::after { content:""; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:8px; height:8px; background:#fff; border-radius:50%; }

      .ayurveda-card {
        background: linear-gradient(135deg, var(--bg-dark-2) 0%, var(--bg-dark-1) 100%);
        box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 10px 25px rgba(0,0,0,0.2);
        border: 1px solid var(--card-border);
        border-radius: 1rem;
        transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
      }
      .ayurveda-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 28px 60px rgba(0,0,0,0.4), 0 18px 40px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.15); }
      .ayurveda-card:focus { outline: none; box-shadow: 0 0 0 4px rgba(224,122,95,0.25); }
      .ayurveda-card.selected { border-color: var(--accent-gold-1); box-shadow: 0 0 0 2px rgba(224,122,95,0.15); }
      .card-title { color: var(--text-dark); }
      .card-sub { color: var(--muted-text); }

      .ayurveda-page {
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        padding-top: 0;
        padding-bottom: 3rem;
        background:
          radial-gradient(circle at top right, rgba(129, 178, 154, 0.08), transparent 35%),
          radial-gradient(circle at bottom left, rgba(224, 122, 95, 0.08), transparent 35%),
          linear-gradient(180deg, var(--bg-dark-1) 0%, #121418 100%);
        color: var(--text-dark);
      }
      /* Override specificity for internal cards if needed */
      .ayurveda-page .ayurveda-card {
        background: linear-gradient(135deg, var(--bg-dark-2) 0%, var(--bg-dark-1) 100%);
        box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        border: 1px solid var(--card-border);
      }
      .ayurveda-page .card-sub { color: var(--muted-text); }

      .ayurveda-page .mandala-rotate { opacity: 0.04; filter: invert(1); }

      .custom-scrollbar::-webkit-scrollbar { width:8px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: var(--scroll-track); border-radius:4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(135deg, var(--accent-gold-1), var(--accent-gold-2)); border-radius:4px; }

      @media (prefers-reduced-motion: reduce) {
        .mandala-rotate, .herb-float-1, .herb-float-2, .breathe-1, .pulse-ring, .golden-pulse { animation: none !important; }
        .ayurveda-card:hover { transform: none; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      }

      .header-brand { display:flex; align-items:center; gap:0.75rem; }

      .search-input { background: rgba(255,255,255,0.06); padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); color: white; width: 220px; transition: all 0.18s ease; }
      .search-input:focus { outline:none; box-shadow: 0 4px 18px rgba(0,0,0,0.2); transform: translateY(-1px); background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.2); }
      .search-input::placeholder { color: rgba(255,255,255,0.4); }
    `;
    const el = document.createElement('style');
    el.id = 'ayurveda-theme-inline';
    el.innerHTML = css;
    document.head.appendChild(el);
    return () => {
      const e = document.getElementById('ayurveda-theme-inline');
      if (e) e.remove();
    };
  }, []);


  // Add this useEffect for debugging
  useEffect(() => {
    console.log('[Debug] prakritiScores updated:', prakritiScores);
    if (prakritiScores) {
      console.log('[Debug] ML Prediction:', prakritiScores.ml_prediction);
      console.log('[Debug] Percentages:', prakritiScores.percent);
    }
  }, [prakritiScores]);

  /* ---------- Load data from Supabase ONLY ---------- */
  /* ---------- Auth startup + subscribe to Supabase auth changes ---------- */
  // Replace the useEffect and loadDashboardData in Dashboard.tsx

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        console.log('[Dashboard:init] Starting authentication check...');

        // Method 1: Try Supabase session first
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session?.user?.id && !error) {
          console.log('[Dashboard:init] Valid Supabase session found:', session.user.id);
          if (mounted) {
            await loadDashboardData(session.user.id);
          }
          return;
        }

        // Method 2: Check localStorage for user data (fallback)
        const storedUserJson = localStorage.getItem('user');
        if (storedUserJson) {
          try {
            const parsed = JSON.parse(storedUserJson);
            if (parsed?.id) {
              console.log('[Dashboard:init] Found user in localStorage:', parsed.id);
              if (mounted) {
                await loadDashboardData(parsed.id);
              }
              return;
            }
          } catch (e) {
            console.warn('[Dashboard:init] Failed to parse localStorage user:', e);
          }
        }

        // Method 3: Check location state (from questionnaire completion)
        if (location.state?.prakritiScores) {
          // Direct prakritiScores from questionnaire
          setPrakritiScores(location.state.prakritiScores);
          console.log('[Dashboard] Loaded prakritiScores from location state:', location.state.prakritiScores);
        } else if (location.state?.fromQuestionnaire && location.state?.prakritiResults) {
          // Legacy format support
          const results = location.state.prakritiResults;
          setPrakritiScores({
            vata: results.scores.vata,
            pitta: results.scores.pitta,
            kapha: results.scores.kapha,
            dominant: results.dominant,
            percent: results.percent
          });
          if (results.mentalHealth) {
            setMentalHealth({
              level: results.mentalHealth.level,
              score: results.mentalHealth.score
            });
          }
          setLoading(false);
          return;
        }

        // No valid authentication found
        console.warn('[Dashboard:init] No authentication found - redirecting to login');
        navigate('/auth/phone');

      } catch (err) {
        console.error('[Dashboard:init] Initialization failed:', err);
        if (mounted) {
          navigate('/auth/phone');
        }
      }
    };

    // Listen for auth state changes (only for Supabase sessions)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Dashboard] Auth state changed:', event);

      if (event === 'SIGNED_IN' && session?.user?.id && mounted) {
        await loadDashboardData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPrakritiScores(null);
        // Clear localStorage as well
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/auth/phone');
      }
    });

    init();

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, navigate]);

  // Replace the loadDashboardData function in your Dashboard.tsx (around line 300-450)

  const loadDashboardData = async (userId: string) => {
    try {
      // Only show full loading spinner on initial load
      if (!initialLoadDone.current) {
        setLoading(true);
      }
      setError('');
      console.log('[Dashboard] Loading data for authenticated user (Initial:', !initialLoadDone.current, '):', userId);

      // Step 1: Get user profile using the profileService for consistent data handling
      let userData = null;
      let useLocalStorageFallback = false;

      try {
        // Use the profileService to get user data with proper JSONB parsing
        const completeProfile = await profileService.getCompleteProfile(userId);
        console.log('[Dashboard] Complete profile from profileService:', completeProfile);

        if (completeProfile?.profile) {
          userData = completeProfile.profile;
          console.log('[Dashboard] User found in database:', userData.first_name, userData.last_name);
        } else {
          console.warn('[Dashboard] No user found in database, trying localStorage fallback');
          useLocalStorageFallback = true;
        }
      } catch (dbError) {
        console.warn('[Dashboard] Database connection error, using localStorage fallback:', dbError);
        useLocalStorageFallback = true;
      }

      // Handle user data (from database or localStorage)
      let formattedUser: AppUser;

      if (userData && !useLocalStorageFallback) {
        // User data already parsed by profileService
        console.log('[Dashboard] Using profileService parsed user data:', userData);

        // Use database data
        formattedUser = {
          id: userData.id,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || '',
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          email: userData.email,
          role: userData.role
        };
      } else {
        // Fallback to localStorage
        const storedUserJson = localStorage.getItem('user');
        if (storedUserJson) {
          try {
            const parsed = JSON.parse(storedUserJson);
            formattedUser = {
              id: parsed.id,
              name: `${parsed.first_name || ''} ${parsed.last_name || ''}`.trim() || parsed.name || '',
              first_name: parsed.first_name,
              last_name: parsed.last_name,
              phone: parsed.phone,
              email: parsed.email,
              role: parsed.role || 'patient'
            };
            console.log('[Dashboard] Using localStorage user data:', formattedUser.name);
          } catch (parseError) {
            throw new Error('Failed to parse localStorage user data');
          }
        } else {
          throw new Error('No user data available in database or localStorage');
        }
      }

      console.log('[Dashboard] Formatted user data:', formattedUser);
      setUser(formattedUser);

      // Step 2: Get questionnaire data from Supabase (with error handling)
      try {
        const { data: questionnaireData, error: questionnaireError } = await supabase
          .from('questionnaire_answers')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (questionnaireError) {
          console.warn('[Dashboard] Questionnaire query error (non-fatal):', questionnaireError);
        }

        if (questionnaireData && questionnaireData.length > 0) {
          const latest = questionnaireData[0];
          console.log('[Dashboard] Questionnaire data found for user');

          // Parse scores with proper type safety
          let scoresData: any = {};
          try {
            scoresData = typeof latest.scores === 'string'
              ? JSON.parse(latest.scores)
              : (latest.scores || {});

            if (!scoresData || typeof scoresData !== 'object') {
              scoresData = {};
            }
          } catch (e) {
            console.warn('[Dashboard] Error parsing scores:', e);
            scoresData = {};
          }

          // Parse mental health
          let mentalHealthData = null;
          try {
            mentalHealthData = typeof latest.mental_health_score === 'string'
              ? JSON.parse(latest.mental_health_score)
              : latest.mental_health_score;
          } catch (e) {
            console.warn('[Dashboard] Error parsing mental health score:', e);
          }

          // Create scores object with safe property access
          const rawVata = scoresData && typeof scoresData === 'object' ? scoresData.vata : undefined;
          const rawPitta = scoresData && typeof scoresData === 'object' ? scoresData.pitta : undefined;
          const rawKapha = scoresData && typeof scoresData === 'object' ? scoresData.kapha : undefined;
          const rawDominant = scoresData && typeof scoresData === 'object' ? scoresData.dominant : undefined;
          const rawPercent = scoresData && typeof scoresData === 'object' ? scoresData.percent : undefined;

          const scores: PrakritiScores = {
            vata: Number(rawVata || 0),
            pitta: Number(rawPitta || 0),
            kapha: Number(rawKapha || 0),
            dominant: rawDominant || latest.final_prakriti_assessment || latest.dominant || 'vata',
            percent: rawPercent || calculateDefaultPercents(scoresData)
          };

          // Add ML prediction if available
          if (latest.ml_predictions) {
            try {
              const mlPrediction = typeof latest.ml_predictions === 'string'
                ? JSON.parse(latest.ml_predictions)
                : latest.ml_predictions;

              if (mlPrediction && typeof mlPrediction === 'object') {
                scores.ml_prediction = {
                  predicted: mlPrediction.predicted || scores.dominant,
                  confidence: Number(mlPrediction.confidence || latest.confidence_score || 0),
                  probabilities: mlPrediction.probabilities || {}
                };
              }
            } catch (e) {
              console.warn('[Dashboard] Error parsing ML predictions:', e);
            }
          }

          setPrakritiScores(scores);
          console.log('[Dashboard] Prakriti scores set:', scores);
          console.log('[Debug] Prakriti Scores:', scores);

          // Set mental health
          if (mentalHealthData && typeof mentalHealthData === 'object') {
            setMentalHealth({
              level: mentalHealthData.level || 'green',
              score: Number(mentalHealthData.score || 50)
            });
          }
        } else {
          console.log('[Dashboard] No questionnaire data found for user - new user');
          setPrakritiScores(null);
          setMentalHealth(null);
        }
      } catch (questionnaireError) {
        console.warn('[Dashboard] Error loading questionnaire (non-fatal):', questionnaireError);
        // Continue without questionnaire data
        setPrakritiScores(null);
        setMentalHealth(null);
      }

      // Load real data
      await Promise.all([
        loadAppointments(userId),
        loadRealHealthMetrics(userId)
      ]);

      // Set up real-time subscription for appointments
      const appointmentChannel = supabase
        .channel(`appointments-${userId}`)
        .on('postgres_changes' as any, {
          event: '*',
          table: 'appointments',
          filter: `patient_id=eq.${userId}`
        }, (payload: any) => {
          console.log('[Dashboard] Appointment change received:', payload);
          loadAppointments(userId);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(appointmentChannel);
      };

    } catch (err: any) {
      console.error('[Dashboard] Error loading dashboard data:', err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  };

  const loadAppointments = async (userId: string) => {
    try {
      const { data: appointmentData, error } = await supabase
        .from('appointments')
        .select(`
        id,
        appointment_date,
        appointment_time,
        type,
        status,
        practitioner:users!practitioner_id(first_name, last_name)
      `)
        .eq('patient_id', userId)
        .order('appointment_date', { ascending: true })
        .limit(5);

      if (error) throw error;

      if (appointmentData && appointmentData.length > 0) {
        const formattedAppointments: Appointment[] = appointmentData.map((apt: any) => ({
          id: apt.id,
          doctorName: apt.practitioner
            ? `Dr. ${apt.practitioner.first_name || ''} ${apt.practitioner.last_name || ''}`.trim()
            : 'Pending Assignment',
          date: apt.appointment_date,
          time: apt.appointment_time,
          type: apt.type || 'Consultation',
          status: apt.status as any
        }));
        setAppointments(formattedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.warn('[Dashboard] Failed to load appointments:', error);
      // Keep empty array or set error state if critical
    }
  };

  const loadRealHealthMetrics = async (userId: string) => {
    try {
      const { data: metricsData, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (metricsData && metricsData.length > 0) {
        const latest = metricsData[0];
        // Map database columns to UI metrics
        // Note: This relies on specific columns existing - verifying schema first is key
        const metrics: HealthMetric[] = [];

        if (latest.blood_pressure_systolic && latest.blood_pressure_diastolic) {
          metrics.push({
            label: 'Blood Pressure',
            value: `${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`,
            unit: 'mmHg',
            status: 'good', // Logic to determine status could be added
            icon: 'â¤ï¸'
          });
        }

        if (latest.weight) {
          metrics.push({
            label: 'Weight',
            value: latest.weight,
            unit: 'kg',
            status: 'good',
            icon: 'âš–ï¸'
          });
        }

        // Add others as available in schema
        setHealthMetrics(metrics);
      }
    } catch (error) {
      console.warn('[Dashboard] Failed to load health metrics:', error);
    }
  };

  // Helper function to calculate percentages with proper type safety
  const calculateDefaultPercents = (scoresData: any): { vata: number; pitta: number; kapha: number } => {
    // Ensure scoresData is an object and has the expected properties
    if (!scoresData || typeof scoresData !== 'object') {
      return { vata: 33, pitta: 33, kapha: 34 };
    }

    // Safe property access with fallbacks
    const vataValue = scoresData.hasOwnProperty('vata') ? scoresData.vata : 0;
    const pittaValue = scoresData.hasOwnProperty('pitta') ? scoresData.pitta : 0;
    const kaphaValue = scoresData.hasOwnProperty('kapha') ? scoresData.kapha : 0;

    const vata = Number(vataValue) || 0;
    const pitta = Number(pittaValue) || 0;
    const kapha = Number(kaphaValue) || 0;
    const total = vata + pitta + kapha;

    if (total === 0) {
      return { vata: 33, pitta: 33, kapha: 34 };
    }

    return {
      vata: Math.round((vata / total) * 100),
      pitta: Math.round((pitta / total) * 100),
      kapha: Math.round((kapha / total) * 100)
    };
  };


  const handleTakeQuestionnaire = () => {
    navigate('/auth/prakriti-questionnaire', {
      state: { userId: user?.id }
    });
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed', error);
      toast.error('Failed to logout');
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'vata': return 'bg-blue-900/200';
      case 'pitta': return 'bg-red-500';
      case 'kapha': return 'bg-green-900/20';
      default: return 'bg-gray-8000';
    }
  };

  const getDescription = (type: string) => {
    switch (type) {
      case 'vata': return 'Air & Space - Creative, Quick, Light';
      case 'pitta': return 'Fire & Water - Focused, Intense, Warm';
      case 'kapha': return 'Earth & Water - Steady, Calm, Strong';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-900/20 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-900/20 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  /* ---------- ENHANCED animated Prakriti Donut + mini-bar graph ---------- */
  const circumference = 2 * Math.PI * 30; // r=30

  const EnhancedPrakritiVisualization: React.FC<{ scores: PrakritiScores, focus?: boolean }> = ({ scores, focus }) => {
    // compute stroke lengths
    const vLen = (scores.percent.vata / 100) * circumference;
    const pLen = (scores.percent.pitta / 100) * circumference;
    const kLen = (scores.percent.kapha / 100) * circumference;

    // offsets for stacking
    const vOffset = 0;
    const pOffset = -vLen;
    const kOffset = -(vLen + pLen);

    // small array for bars
    const bars = [
      { key: 'vata', label: 'Vata', pct: scores.percent.vata, color: '#3b82f6' },
      { key: 'pitta', label: 'Pitta', pct: scores.percent.pitta, color: '#ef4444' },
      { key: 'kapha', label: 'Kapha', pct: scores.percent.kapha, color: '#22c55e' },
    ];

    return (
      <div ref={chartRef} className="bg-gray-800 rounded-xl p-6 ayurveda-card custom-scrollbar" style={{ overflow: 'visible' }}>
        <h4 className="text-lg font-semibold text-[var(--text-dark)] mb-6 text-center">Prakriti Distribution</h4>

        <div className="h-80 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Animated donut */}
          <div style={{ width: 260, height: 260, position: 'relative' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow: 'visible' }}>
              {/* subtle background ring */}
              <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(34,11,4,0.06)" strokeWidth="12" />

              {/* Vata */}
              <motion.circle
                cx="50" cy="50" r="30" fill="none" stroke="#3b82f6" strokeWidth="10"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 }}
                animate={{ strokeDasharray: `${vLen} ${circumference}`, strokeDashoffset: vOffset }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />

              {/* Pitta */}
              <motion.circle
                cx="50" cy="50" r="30" fill="none" stroke="#ef4444" strokeWidth="10"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 }}
                animate={{ strokeDasharray: `${pLen} ${circumference}`, strokeDashoffset: pOffset }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.12 }}
              />

              {/* Kapha */}
              <motion.circle
                cx="50" cy="50" r="30" fill="none" stroke="#22c55e" strokeWidth="10"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 }}
                animate={{ strokeDasharray: `${kLen} ${circumference}`, strokeDashoffset: kOffset }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.24 }}
              />

              {/* rotating sheen */}
              <defs>
                <linearGradient id="sheen" x1="0" x2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="50" cy="50" r="33" fill="none" stroke="url(#sheen)" strokeWidth="2"
                strokeDasharray="4 6"
                initial={{ rotate: 0, opacity: 0.6 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                style={{ transformOrigin: '50% 50%' }}
              />
            </svg>

            {/* center info with pulsing ring */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pointerEvents: 'none' }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0.85 }}
                animate={{ scale: focus ? [1, 1.1, 1] : [1, 1.02, 1], opacity: [1, 0.9, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(78,139,58,0.12)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,245,240,0.95))'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#2c1810', textTransform: 'capitalize' }}>{scores.dominant}</div>
                  <div style={{ fontSize: 12, color: '#6b4423' }}>{t('prakriti.dominant')}</div>
                </div>
              </motion.div>

              {/* pulsing halo */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0.25 }}
                animate={{ scale: [0.9, 1.4], opacity: [0.25, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  border: `1px solid rgba(78,139,58,0.06)`,
                  top: 'calc(50% - 80px)',
                  left: 'calc(50% - 80px)',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>

          {/* Mini bar visualization */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-[var(--text-dark)]">{t('profile.dosha_strengths')}</div>
                <div className="text-xs text-gray-400">{t('profile.interactive')}</div>
              </div>
            </div>

            <div className="space-y-3">
              {bars.map((b, i) => (
                <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 76, fontSize: 13, fontWeight: 700, color: '#333' }}>{b.label}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: '#f1f3f5', height: 14, borderRadius: 8, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ duration: 0.9, delay: 0.08 * i, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 8, background: `linear-gradient(90deg, ${b.color}, ${b.color}bb)` }}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{b.pct}%</div>
                  </div>
                </div>
              ))}
            </div>

            {/* small tips with micro-animations */}
            <div className="mt-6 p-3 rounded-lg" style={{ background: 'rgba(78,139,58,0.04)' }}>
              <div className="text-sm font-medium" style={{ color: '#2c1810' }}>{t('profile.tip')}</div>
              <div className="text-xs" style={{ color: '#5a4a2f' }}>
                {t('profile.tip_desc')}
              </div>
            </div>
          </div>
        </div>

        {/* legend */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">{scores.percent.vata}%</div>
            <div className="text-sm text-blue-800 font-medium">Vata</div>
            <div className="text-xs text-gray-400 mt-1">Air & Space</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg font-bold text-red-600">{scores.percent.pitta}%</div>
            <div className="text-sm text-red-300 font-medium">Pitta</div>
            <div className="text-xs text-gray-400 mt-1">Fire & Water</div>
          </div>
          <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">{scores.percent.kapha}%</div>
            <div className="text-sm text-green-300 font-medium">Kapha</div>
            <div className="text-xs text-gray-400 mt-1">Earth & Water</div>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- helper - toggle theme, keyboard selection ---------- */
  const onCardKey = (e: React.KeyboardEvent<HTMLDivElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedCard(prev => prev === id ? null : id);
    }
  };

  /* ---------- focus visualization effect: scroll into view & trigger pulsing ---------- */
  useEffect(() => {
    if (activeView === 'health' && focusVisualization && chartRef.current) {
      // scroll chart into view smoothly
      chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // after a short delay remove focus flag so animation doesn't loop forever
      const t = setTimeout(() => setFocusVisualization(false), 1400);
      return () => clearTimeout(t);
    }
  }, [activeView, focusVisualization]);

  /* ---------- loading / error / no-user states ---------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ayurveda-page" data-theme={theme}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4" />
          <p className="text-[#E07A5F]">Loading your dashboard...</p>
          <p className="text-[#6B7280]">Analyzing your Prakriti results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center ayurveda-page" data-theme={theme}>
        <div className="text-center max-w-md mx-auto p-6 ayurveda-card">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Error Loading Dashboard</h3>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg transition-colors mr-3"
            style={{ background: 'linear-gradient(135deg, var(--accent-gold-1), var(--accent-gold-2))', color: '#2c1810' }}
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/auth/phone')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ background: 'rgba(255,248,220,0.85)', border: '1px solid var(--card-border)', color: '#6b4423' }}
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center ayurveda-page" data-theme={theme}>
        <div className="text-center ayurveda-card p-8">
          <p className="text-[#E07A5F]">No user data found. Redirecting to login...</p>
          <button
            onClick={() => navigate('/auth/phone')}
            className="mt-4 px-4 py-2 rounded-lg transition-colors"
            style={{ background: 'linear-gradient(135deg, var(--accent-gold-1), var(--accent-gold-2))', color: '#2c1810' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  /* ---------- small helper used previously ---------- */
  const renderPrakritiChart = () => {
    if (!prakritiScores) return null;
    return <EnhancedPrakritiVisualization scores={prakritiScores} focus={focusVisualization} />;
  };

  /* ---------- main render ---------- */
  return (
    <div className="ayurveda-page" data-theme={theme}>
      {/* Mandala overlay */}
      <div className="fixed inset-0 opacity-6 pointer-events-none mandala-rotate" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, transparent 30%, rgba(255,183,77,0.08) 30.5%, transparent 31%),
          radial-gradient(circle at 80% 80%, transparent 30%, rgba(255,183,77,0.08) 30.5%, transparent 31%),
          radial-gradient(circle at 50% 50%, transparent 40%, rgba(255,183,77,0.08) 40.5%, transparent 41%)
        `
      }} />

      {/* Floating herbs */}
      <div className="fixed w-10 h-10 top-[8%] left-[8%] rounded-full herb-float-1" style={{ background: 'radial-gradient(circle, #8b6914 0%, transparent 70%)', opacity: 0.12 }} />
      <div className="fixed w-14 h-14 top-[72%] right-[12%] rounded-full herb-float-2" style={{ background: 'radial-gradient(circle, #cd853f 0%, transparent 70%)', opacity: 0.12 }} />

      {/* Breathing light */}
      <div className="fixed w-96 h-96 md:w-[600px] md:h-[600px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="absolute inset-0 rounded-full breathe-1" style={{ background: 'radial-gradient(circle, rgba(255,183,77,0.32), rgba(218,165,32,0.06) 40%, transparent 70%)' }} />
      </div>

      {/* Pulse rings (kept visual but subtle) */}
      <div className="fixed w-[800px] h-[800px] top-1/2 left-1/2 border border-yellow-400/10 rounded-full pulse-ring" />
      <div className="fixed w-[900px] h-[900px] top-1/2 left-1/2 border border-yellow-400/8 rounded-full pulse-ring" />

      {/* Header */}
      {/* Navigation Bar */}
      <PatientNavbar onProfileClick={() => setShowProfileManager(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-8 fade-in">
            {/* Welcome Section */}
            <div className="mb-8 relative overflow-hidden p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              {/* Decorative background element */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent-sage/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-accent-gold-1/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-accent-sage/10 text-accent-sage text-xs font-bold tracking-wider uppercase mb-3">
                    <DynamicText>Patient Dashboard</DynamicText>
                  </span>
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight" style={{ color: 'var(--text-light)' }}>
                    <DynamicText>
                      {t(`dashboard.welcome_back`, {
                        greeting: (() => {
                          const hr = new Date().getHours();
                          if (hr >= 5 && hr < 12) return t('dashboard.greetings.morning');
                          if (hr >= 12 && hr < 17) return t('dashboard.greetings.afternoon');
                          if (hr >= 17 && hr < 21) return t('dashboard.greetings.evening');
                          return t('dashboard.greetings.night');
                        })(),
                        name: user?.first_name || user?.name || 'User'
                      }).replace('{{greeting}}', (() => {
                        const hr = new Date().getHours();
                        if (hr >= 5 && hr < 12) return t('dashboard.greetings.morning');
                        if (hr >= 12 && hr < 17) return t('dashboard.greetings.afternoon');
                        if (hr >= 17 && hr < 21) return t('dashboard.greetings.evening');
                        return t('dashboard.greetings.night');
                      })()).replace('{{name}}', user?.first_name || user?.name || 'User')}
                    </DynamicText>
                  </h2>
                  <p className="text-xl text-[var(--text-dark)] opacity-70 mb-6 font-medium">
                    <DynamicText>Your personalized Ayurvedic wellness portal.</DynamicText>
                  </p>
                </motion.div>

                {/* AI Analytics One-Liner - Enhanced 3D Interaction */}
                {(() => {
                  const dominant = prakritiScores?.dominant?.toLowerCase() || 'unknown';
                  const stylesMap: Record<string, any> = {
                    vata: {
                      gradient: 'from-[#60a5fa]/20 via-[#3b82f6]/10 to-transparent',
                      accent: '#60a5fa',
                      border: 'border-[#60a5fa]',
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 20l-1-1m2 1l1-1m-5-4l-2-2m2 2l2-2m3-4l7-7M2 9l3 3m0 0l3-3m-3 3v8" />
                        </svg>
                      )
                    },
                    pitta: {
                      gradient: 'from-[#fb923c]/20 via-[#ef4444]/10 to-transparent',
                      accent: '#fb923c',
                      border: 'border-[#fb923c]',
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                      )
                    },
                    kapha: {
                      gradient: 'from-[#34d399]/20 via-[#059669]/10 to-transparent',
                      accent: '#34d399',
                      border: 'border-[#34d399]',
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" />
                        </svg>
                      )
                    },
                    unknown: {
                      gradient: 'from-accent-gold-1/20 via-transparent to-transparent',
                      accent: 'var(--accent-gold-1)',
                      border: 'border-accent-gold-1',
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )
                    }
                  };

                  const activeStyle = (stylesMap as any)[dominant] || stylesMap.unknown;

                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{
                        scale: 1.02,
                        rotateX: -2,
                        rotateY: 2,
                        boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${activeStyle.accent}20`
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      style={{ perspective: "1000px" }}
                      className={`group relative flex items-start md:items-center gap-5 p-6 rounded-2xl bg-gradient-to-br ${activeStyle.gradient} border border-white/10 border-l-4 ${activeStyle.border} backdrop-blur-md cursor-pointer overflow-hidden transition-all duration-500`}
                    >
                      {/* Shine effect animation */}
                      <div className="absolute top-0 -left-[100%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] group-hover:left-[100%] transition-all duration-1000 ease-in-out" />

                      <div className={`p-3 rounded-xl shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`} style={{ backgroundColor: `${activeStyle.accent}20`, color: activeStyle.accent }}>
                        {activeStyle.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-3" style={{ color: activeStyle.accent }}>
                            <DynamicText>AI Health Insight</DynamicText>
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeStyle.accent }}></span>
                              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: activeStyle.accent }}></span>
                            </span>
                          </h4>
                          {dominant !== 'unknown' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/10 uppercase tracking-tighter opacity-50">
                              <DynamicText>{`${dominant} Nature`}</DynamicText>
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-semibold leading-relaxed" style={{ color: 'var(--text-light)' }}>
                          <DynamicText>
                            {(() => {
                              switch (dominant) {
                                case 'vata': return "Your airy Vata nature is high today. Focus on grounding, warm foods to stay balanced.";
                                case 'pitta': return "Your inner fire is peaking. Prioritize cooling foods and calm environments to avoid acidity.";
                                case 'kapha': return "Your earthy Kapha might feel heavy. Stay active and choose light, spicy foods for energy.";
                                default: return "Complete your assessment for personalized Ayurvedic body insights.";
                              }
                            })()}
                          </DynamicText>
                        </p>
                      </div>

                      {/* 3D Depth Elements */}
                      <div className="absolute -bottom-2 -right-2 w-24 h-24 blur-3xl rounded-full opacity-20 pointer-events-none transition-all duration-500 group-hover:opacity-40" style={{ backgroundColor: activeStyle.accent }} />
                    </motion.div>
                  );
                })()}
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Prakriti Type Card */}
              <div
                tabIndex={0}
                role="button"
                onClick={() => setSelectedCard(prev => prev === 'dominant' ? null : 'dominant')}
                onKeyDown={(e) => onCardKey(e, 'dominant')}
                className={`bg-white rounded-xl p-6 border-t-4 border-indigo-500 transform transition-transform ayurveda-card ${selectedCard === 'dominant' ? 'selected golden-pulse' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium card-title"><DynamicText>Dominant Nature</DynamicText></h3>
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-[var(--text-dark)] capitalize mb-1">
                  <DynamicText>{prakritiScores?.dominant || 'Not Assessed'}</DynamicText>
                </p>
                {
                  prakritiScores?.ml_prediction && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-900/20 rounded-full mr-2"></div>
                      <span className="text-xs text-green-600 font-medium">
                        <DynamicText>{`AI Confidence: ${Math.round((prakritiScores.ml_prediction.confidence ?? 0) * 100)}%`}</DynamicText>
                      </span>
                    </div>
                  )}
                <p className="text-xs card-sub mt-1"><DynamicText>Primary nature based on your responses</DynamicText></p>
              </div>

              {/* Mental Health Card */}
              <div
                tabIndex={0}
                role="button"
                onClick={() => setSelectedCard(prev => prev === 'mental' ? null : 'mental')}
                onKeyDown={(e) => onCardKey(e, 'mental')}
                className={`bg-white rounded-xl p-6 border-t-4 border-green-500 ayurveda-card ${selectedCard === 'mental' ? 'selected golden-pulse' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium card-title"><DynamicText>Mental Wellness</DynamicText></h3>
                  <div className={`w-4 h-4 rounded-full ${mentalHealth?.level === 'green' ? 'bg-green-900/20' :
                    mentalHealth?.level === 'yellow' ? 'bg-yellow-900/200' : 'bg-red-500'
                    }`}></div>
                </div>
                <p className="text-2xl font-bold text-[var(--text-dark)]">
                  <DynamicText>{`${mentalHealth?.score || 'N/A'}${mentalHealth?.score ? '/100' : ''}`}</DynamicText>
                </p>
                <p className="text-xs card-sub mt-1"><DynamicText>Current wellness assessment</DynamicText></p>
              </div>

              {/* Visualize Results Card - NEW: clickable to open health view & focus visualization */}
              <div
                tabIndex={0}
                role="button"
                onClick={() => { setActiveView('visualization'); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveView('visualization'); } }}
                className={`bg-white rounded-xl p-6 border-t-4 border-teal-500 ayurveda-card ${selectedCard === 'visualize' ? 'selected golden-pulse' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium card-title"><DynamicText>Personalized Charts</DynamicText></h3>
                  <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-[var(--text-dark)] mb-1"><DynamicText>Open interactive charts</DynamicText></p>
                <p className="text-xs card-sub mt-1"><DynamicText>Click to view interactive Prakriti visualizations</DynamicText></p>
              </div>

              {/* Profile Completeness */}
              <div
                tabIndex={0}
                role="button"
                onClick={() => setSelectedCard(prev => prev === 'profile' ? null : 'profile')}
                onKeyDown={(e) => onCardKey(e, 'profile')}
                className={`bg-white rounded-xl p-6 border-t-4 border-orange-500 ayurveda-card ${selectedCard === 'profile' ? 'selected golden-pulse' : ''}`}

              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium card-title"><DynamicText>Profile Complete</DynamicText></h3>
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-[var(--text-dark)]">
                  <DynamicText>{prakritiScores ? '100%' : '60%'}</DynamicText>
                </p>
                <p className="text-xs card-sub mt-1">
                  <DynamicText>{prakritiScores ? 'Complete' : 'Pending Tasks'}</DynamicText>
                </p>
              </div>

            </div>

            {/* Health Metrics */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--accent-sage)' }}><DynamicText>{t('dashboard.health_metrics')}</DynamicText></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {healthMetrics.map((metric, index) => (
                  <div
                    key={index}
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelectedCard(prev => prev === metric.label ? null : metric.label)}
                    onKeyDown={(e) => onCardKey(e, metric.label)}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(metric.status)} ayurveda-card ${selectedCard === metric.label ? 'selected' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{metric.icon}</span>
                      <div className={`w-3 h-3 rounded-full ${metric.status === 'good' ? 'bg-green-900/20' :
                        metric.status === 'warning' ? 'bg-yellow-900/200' : 'bg-red-500'
                        }`}></div>
                    </div>
                    <h4 className="font-medium text-[var(--text-dark)]"><DynamicText>{metric.label}</DynamicText></h4>
                    <p className="text-xl font-bold text-[var(--text-dark)]">
                      {metric.value} {metric.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <button
                onClick={handleTakeQuestionnaire}
                className="bg-white rounded-xl p-6 hover:shadow-xl transition-all text-left group ayurveda-card"
                aria-label="Take Prakriti Assessment"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-indigo-900/20 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-[var(--text-dark)] mb-2"><DynamicText>{t('common.prakriti_assessment')}</DynamicText></h4>
                <p className="text-sm text-gray-400 mb-4">
                  <DynamicText>{prakritiScores ? t('dashboard.retake_assessment') : t('dashboard.take_assessment_desc')}</DynamicText>
                </p>
                <div className="text-amber-700 font-medium text-sm group-hover:text-amber-800">
                  <DynamicText>{prakritiScores ? t('common.retake') : t('common.start')}</DynamicText>
                </div>
              </button>

              <button
                onClick={() => navigate('/patient/appointments/new')}
                className="bg-white rounded-xl p-6 hover:shadow-xl transition-all text-left group ayurveda-card"
                aria-label="Book Appointment"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-900/40 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-[var(--text-dark)] mb-2"><DynamicText>{t('dashboard.book_appointment')}</DynamicText></h4>
                <p className="text-sm text-gray-400 mb-4"><DynamicText>{t('dashboard.book_appointment_desc')}</DynamicText></p>
                <div className="text-green-600 font-medium text-sm group-hover:text-green-700">
                  <DynamicText>{t('common.book_now')}</DynamicText>
                </div>
              </button>

              <button
                onClick={() => setShowProfileManager(true)}
                className="bg-white rounded-xl p-6 hover:shadow-xl transition-all text-left group ayurveda-card"
                aria-label="Manage Profile"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-[var(--text-dark)] mb-2"><DynamicText>{t('profile.health_profile')}</DynamicText></h4>
                <p className="text-sm text-gray-400 mb-4"><DynamicText>{t('profile.health_profile_desc')}</DynamicText></p>
                <div className="text-blue-600 font-medium text-sm group-hover:text-blue-700">
                  <DynamicText>{t('common.view_profile')}</DynamicText>
                </div>
              </button>

              <button
                className="bg-white rounded-xl p-6 hover:shadow-xl transition-all text-left group ayurveda-card"
                disabled={!prakritiScores}
                onClick={() => navigate('/patient/nutrition')}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-[var(--text-dark)] mb-2"><DynamicText>{t('dashboard.personalized_diet')}</DynamicText></h4>
                <p className="text-sm text-gray-400 mb-4">
                  <DynamicText>{`${t('dashboard.diet_plan_desc')} ${prakritiScores?.dominant || t('prakriti.constitution')}`}</DynamicText>
                </p>
                <div className={`font-medium text-sm ${prakritiScores ? 'text-orange-600 group-hover:text-orange-700' : 'text-gray-400'}`}>
                  <DynamicText>{prakritiScores ? t('common.view_details') : t('common.pending')}</DynamicText>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Health Profile View - ENHANCED */}
        {activeView === 'health' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-sage)' }}><DynamicText>{t('profile.health_profile_title')}</DynamicText></h2>
              <p className="text-[var(--text-dark)]"><DynamicText>{t('profile.health_profile_desc')}</DynamicText></p>
            </div>

            {prakritiScores ? (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--accent-sage)' }}><DynamicText>{t('profile.comprehensive_analysis')}</DynamicText></h3>
                  {prakritiScores.ml_prediction && (
                    <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200">
                      <div className="w-3 h-3 bg-blue-900/200 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-800">
                        <DynamicText>{t('profile.powered_by')}</DynamicText>
                      </span>
                    </div>
                  )}
                </div>
                {/* USE THE ENHANCED PRAKRITI SUMMARY CARD */}
                <PrakritiSummaryCard scores={prakritiScores} />

                {/* ADDITIONAL ORIGINAL VISUALIZATION FOR COMPARISON */}
                <div className="mt-8 ayurveda-card overflow-hidden">
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-6 text-center text-[var(--text-dark)]"><DynamicText>{t('profile.interactive_viz_title')}</DynamicText></h4>
                    {prakritiScores.ml_prediction && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-900/200 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-[var(--text-dark)]">
                              <DynamicText>{t('dashboard.ai_confidence')}</DynamicText>
                            </span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {Math.round(prakritiScores.ml_prediction.confidence * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            className="bg-blue-900/200 h-2 rounded-full transition-all duration-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${prakritiScores.ml_prediction.confidence * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Enhanced animated visual */}
                      {renderPrakritiChart()}

                      <div className="space-y-6">
                        {['vata', 'pitta', 'kapha'].map((dosha) => (
                          <div key={dosha}>
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <span className="font-semibold text-[var(--text-dark)] text-lg capitalize"><DynamicText>{dosha}</DynamicText></span>
                                <span className="text-sm text-gray-400 ml-2 block"><DynamicText>{getDescription(dosha)}</DynamicText></span>
                              </div>
                              <span className={`text-2xl font-bold ${dosha === 'vata' ? 'text-blue-600' :
                                dosha === 'pitta' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {prakritiScores.percent[dosha as keyof typeof prakritiScores.percent]}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner">
                              <motion.div
                                className={`h-4 rounded-full transition-all duration-1000 shadow-sm ${dosha === 'vata' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                  dosha === 'pitta' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                    'bg-gradient-to-r from-green-400 to-green-600'
                                  }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${prakritiScores.percent[dosha as keyof typeof prakritiScores.percent]}%` }}
                                transition={{ duration: 1.5, delay: 0.3 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 ayurveda-card">
                        <div className="text-center">
                          <h4 className="text-sm font-medium text-gray-400 mb-2"><DynamicText>{t('profile.your_dominant_prakriti')}</DynamicText></h4>
                          <p className="text-3xl font-bold text-[var(--text-dark)] capitalize mb-2">
                            <DynamicText>{`${prakritiScores.dominant} Prakriti`}</DynamicText>
                          </p>
                          <p className="text-sm text-gray-400"><DynamicText>{getDescription(prakritiScores.dominant)}</DynamicText></p>
                          <div className="mt-4 flex justify-center">
                            <motion.div
                              className={`w-16 h-16 ${getColorClass(prakritiScores.dominant)} rounded-full flex items-center justify-center shadow-lg`}
                              whileHover={{ scale: 1.1 }}
                              animate={{
                                boxShadow: [
                                  '0 10px 20px rgba(0,0,0,0.1)',
                                  '0 20px 40px rgba(0,0,0,0.2)',
                                  '0 10px 20px rgba(0,0,0,0.1)'
                                ]
                              }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <span className="text-white font-bold text-lg capitalize">
                                {prakritiScores.dominant[0].toUpperCase()}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NEW: Enhanced Visualization Component */}
                  <div className="mt-8 ayurveda-card overflow-hidden">
                    <div className="p-6">
                      <h4 className="text-xl font-bold mb-6 text-center text-[var(--text-dark)]"><DynamicText>{t('profile.enhanced_visualization')}</DynamicText></h4>
                      <PrakritiVisualizationEnhanced scores={prakritiScores} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <div className="ayurveda-card p-8 text-center">
                  <div className="w-16 h-16 bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--text-dark)] mb-2"><DynamicText>{t('profile.complete_assessment_title')}</DynamicText></h3>
                  <p className="text-gray-400 mb-6">
                    <DynamicText>{t('profile.complete_assessment_desc')}</DynamicText>
                  </p>
                  <button
                    onClick={handleTakeQuestionnaire}
                    className="px-6 py-3 rounded-lg transition-colors"
                    style={{ background: 'linear-gradient(135deg, var(--accent-gold-1), var(--accent-gold-2))', color: '#2c1810' }}
                  >
                    <DynamicText>{t('profile.take_assessment_now')}</DynamicText>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="ayurveda-card p-6">
                <h4 className="text-lg font-semibold text-[var(--text-dark)] mb-4"><DynamicText>{t('profile.health_recommendations')}</DynamicText></h4>
                {prakritiScores ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-900/20 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2"><DynamicText>{t('profile.diet_guidelines')}</DynamicText></h5>
                      <p className="text-sm text-blue-700">
                        <DynamicText>
                          {prakritiScores.dominant === 'vata' ? t('profile.vata_diet') :
                            prakritiScores.dominant === 'pitta' ? t('profile.pitta_diet') :
                              t('profile.kapha_diet')}
                        </DynamicText>
                      </p>
                    </div>
                    <div className="p-4 bg-green-900/20 rounded-lg">
                      <h5 className="font-medium text-green-300 mb-2"><DynamicText>{t('profile.lifestyle_tips')}</DynamicText></h5>
                      <p className="text-sm text-green-700">
                        <DynamicText>
                          {prakritiScores.dominant === 'vata' ? t('profile.vata_lifestyle') :
                            prakritiScores.dominant === 'pitta' ? t('profile.pitta_lifestyle') :
                              t('profile.kapha_lifestyle')}
                        </DynamicText>
                      </p>
                    </div>
                    {prakritiScores.ml_prediction && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-800 mb-2"><DynamicText>{t('profile.ai_insights')}</DynamicText></h5>
                        <p className="text-sm text-purple-700">
                          <DynamicText>{t('profile.ai_insight_desc', { confidence: Math.round(prakritiScores.ml_prediction.confidence * 100) })}</DynamicText>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    <DynamicText>{t('profile.assessment_pending')}</DynamicText>
                  </p>
                )}
              </div>

              <div className="ayurveda-card p-6">
                <h4 className="text-lg font-semibold text-[var(--text-dark)] mb-4"><DynamicText>{t('profile.mental_wellness_title')}</DynamicText></h4>
                {mentalHealth ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <span className="font-medium text-[var(--text-dark)]"><DynamicText>{t('profile.current_score')}</DynamicText></span>
                      <span className={`text-2xl font-bold ${mentalHealth.level === 'green' ? 'text-green-600' :
                        mentalHealth.level === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                        }`}>{mentalHealth.score}/100</span>
                    </div>
                    <div className="p-4 bg-green-900/20 rounded-lg">
                      <h5 className="font-medium text-green-300 mb-2"><DynamicText>{t('profile.wellness_tips')}</DynamicText></h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li><DynamicText>{t('profile.wellness_tip_1')}</DynamicText></li>
                        <li><DynamicText>{t('profile.wellness_tip_2')}</DynamicText></li>
                        <li><DynamicText>{t('profile.wellness_tip_3')}</DynamicText></li>
                        <li><DynamicText>{t('profile.wellness_tip_4')}</DynamicText></li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    <DynamicText>{t('profile.mental_assessment_unavailable')}</DynamicText>
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Visualization View */}
        {activeView === 'visualization' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-sage)' }}><DynamicText>Prakriti Visualization</DynamicText></h2>
              <p className="text-[var(--text-dark)]"><DynamicText>Interactive charts and graphs showing your Prakriti analysis</DynamicText></p>
            </div>

            {prakritiScores ? (
              <div className="mb-8">
                <PrakritiVisualizationEnhanced scores={prakritiScores} />
              </div>
            ) : (
              <div className="mb-8">
                <div className="ayurveda-card p-8 text-center">
                  <div className="w-16 h-16 bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--text-dark)] mb-2"><DynamicText>Complete Your Prakriti Assessment</DynamicText></h3>
                  <p className="text-gray-400 mb-6">
                    <DynamicText>Discover your unique Ayurvedic constitution and visualize your results with interactive charts.</DynamicText>
                  </p>
                  <button
                    onClick={handleTakeQuestionnaire}
                    className="px-6 py-3 rounded-lg transition-colors"
                    style={{ background: 'linear-gradient(135deg, var(--accent-gold-1), var(--accent-gold-2))', color: '#2c1810' }}
                  >
                    <DynamicText>Take Assessment Now</DynamicText>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Appointments View */}
        {activeView === 'appointments' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-sage)' }}><DynamicText>{t('profile.appointments_title')}</DynamicText></h2>
                <p className="text-[var(--text-dark)]"><DynamicText>{t('profile.appointments_desc')}</DynamicText></p>
              </div>
              <button
                onClick={() => navigate('/patient/appointments/new')}
                className="px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                style={{ background: 'linear-gradient(135deg, var(--accent-gold-1), var(--accent-gold-2))', color: '#2c1810' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span><DynamicText>{t('profile.book_new_appointment')}</DynamicText></span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="ayurveda-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-dark)] mb-4"><DynamicText>{t('profile.upcoming_appointments')}</DynamicText></h3>
                <div className="space-y-4">
                  {appointments.filter(apt => ['pending', 'scheduled', 'confirmed'].includes(apt.status)).length > 0 ? (
                    appointments.filter(apt => ['pending', 'scheduled', 'confirmed'].includes(apt.status)).map((appointment) => (
                      <div key={appointment.id} className="p-4 border border-green-200 bg-green-900/20 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-[var(--text-dark)]">{appointment.doctorName}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${appointment.status === 'confirmed' ? 'bg-green-900/40 text-green-300' :
                            appointment.status === 'pending' ? 'bg-yellow-900/40 text-yellow-300' :
                              'bg-blue-900/40 text-blue-300'
                            }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">{appointment.type}</p>
                        <p className="text-sm font-medium text-[var(--text-dark)]">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p><DynamicText>{t('profile.no_upcoming_appointments')}</DynamicText></p>
                    </div>
                  )}
                </div>
              </div>

              <div className="ayurveda-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-dark)] mb-4"><DynamicText>{t('profile.appointment_history')}</DynamicText></h3>
                <div className="space-y-4">
                  {appointments.filter(apt => ['completed', 'cancelled', 'no-show'].includes(apt.status)).length > 0 ? (
                    appointments.filter(apt => ['completed', 'cancelled', 'no-show'].includes(apt.status)).map((appointment) => (
                      <div key={appointment.id} className="p-4 border border-gray-700 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-[var(--text-dark)]">{appointment.doctorName}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${appointment.status === 'completed' ? 'bg-green-900/40 text-green-300' :
                            appointment.status === 'cancelled' ? 'bg-red-900/40 text-red-300' :
                              'bg-gray-700 text-[var(--text-dark)]'
                            }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">{appointment.type}</p>
                        <p className="text-sm font-medium text-[var(--text-dark)]">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <p><DynamicText>{t('profile.no_appointment_history')}</DynamicText></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <GlobalFooter dark className="border-t border-white/5 bg-[#141613]" />

      {/* Modals & Overlays */}
      <ProfileManager
        isOpen={showProfileManager}
        onClose={() => setShowProfileManager(false)}
      />

      <AppointmentBooking
        isOpen={showAppointmentBooking}
        onClose={() => setShowAppointmentBooking(false)}
      />

      < ChatWidget />
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              className="bg-[#141613] rounded-xl border border-[#2c332b] shadow-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#2c332b] rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">👋</span>
                </div>
                <h3 className="text-xl font-bold text-[#e1dccc] mb-2"><DynamicText>Leaving so soon?</DynamicText></h3>
                <p className="text-[#8c9489] mb-6">
                  <DynamicText>Are you sure you want to log out of your Ayurvedic journey?</DynamicText>
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-2 border border-[#3d453b] text-[#8c9489] rounded-lg hover:bg-[#2c332b] hover:text-[#e1dccc] transition-colors font-medium"
                  >
                    <DynamicText>Cancel</DynamicText>
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-4 py-2 bg-[#1a4731] text-[#e1dccc] rounded-lg hover:bg-[#2c5e41] transition-colors font-medium border border-[#2c5e41]"
                  >
                    <DynamicText>Logout</DynamicText>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDashboard;
