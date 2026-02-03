import React, { useState } from 'react';
import { supabase, authService } from '../../utils/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import { GlobalFooter } from '../../components/GlobalFooter';

const Login = () => {
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const { user: contextUser } = useAuth(); // Use global auth state
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isMagicLink, setIsMagicLink] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [justLoggedIn, setJustLoggedIn] = useState(false);

    // Helper to handle redirection
    const redirectUser = (user: any) => {
        const role = user.role;
        const email = user.email;
        const from = (routerLocation.state as any)?.from?.pathname;

        // If there's a redirected path and it matches the user's allowed area (basic check), go there
        // For simplicity, if 'from' exists, try to go there first. ProtectedRoute will bounce back if invalid.
        if (from && from !== '/auth/login') {
            console.log('[Login] Redirecting to original destination:', from);
            navigate(from, { replace: true });
            return;
        }

        // EMERGENCY OVERRIDE: Always send specific admin email to dashboard
        if (email === 'admin@ezbillify.com') {
            console.log('[Login] Admin override triggered for', email);
            navigate('/admin/dashboard', { replace: true });
            return;
        }

        switch (role) {
            case 'admin':
                navigate('/admin/dashboard', { replace: true });
                break;
            case 'practitioner':
                navigate('/practitioner/dashboard', { replace: true });
                break;
            case 'receptionist':
                navigate('/receptionist/dashboard', { replace: true });
                break;
            case 'patient':
                // Check onboarding status
                if (user.onboarding?.questionnaire_completed && user.onboarding?.personal_details_completed) {
                    navigate('/patient/dashboard', { replace: true });
                } else if (!user.onboarding?.questionnaire_completed) {
                    // Send to questionnaire if they have an account but no dosha
                    navigate('/auth/prakriti-questionnaire', { replace: true });
                } else {
                    // Default fallback to dashboard, avoid sending existing users to register
                    navigate('/patient/dashboard', { replace: true });
                }
                break;
            default:
                console.error('Unknown role:', role);
                navigate('/', { replace: true });
        }
    };

    // Check if already logged in via Context or if we just logged in
    React.useEffect(() => {
        if (contextUser) {
            console.log('[Login] User from context:', contextUser.id, 'Role:', contextUser.role);
            redirectUser(contextUser);
        }
    }, [contextUser, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let error;

            if (isMagicLink) {
                if (otpSent) {
                    // Verify OTP
                    const { error: verifyError } = await supabase.auth.verifyOtp({
                        email,
                        token: otp,
                        type: 'email',
                    });

                    if (verifyError) throw verifyError;
                } else {
                    // Send OTP
                    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
                        email,
                        options: {
                            emailRedirectTo: window.location.origin,
                        },
                    });
                    error = magicLinkError;
                    if (!error) {
                        setOtpSent(true);
                        alert('Magic Code sent! Please check your email.');
                        setLoading(false);
                        return; // Stop here, wait for user to enter OTP
                    }
                }
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                error = signInError;
            }

            if (error) throw error;

            // Auth succeeded. Manually fetch user to ensure we don't depend solely on the event listener race
            console.log('[Login] Auth successful, fetching profile manually...');

            // Short delay to allow triggers to run if this was a first-time creation (though unlikely for login)
            await new Promise(resolve => setTimeout(resolve, 500));

            const userProfile = await authService.getCurrentUser();

            if (userProfile) {
                console.log('[Login] Profile found:', userProfile.role);
                redirectUser(userProfile);
            } else {
                console.warn('[Login] Auth successful but no profile found.');
                // Attempt to force a reload or check basic session
                const session = await authService.getCurrentSession();
                if (session) {
                    // Fallback to minimal dashboard or show error
                    alert('Login successful but profile is incomplete. Please contact support.');
                }
            }

        } catch (error: any) {
            console.error('[Login] Login error:', error);
            alert(error.message || 'An error occurred during login');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-emerald-950 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-17e6fc48cf09?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent"></div>
                <div className="relative z-10 text-white p-12 max-w-lg">
                    <div className="w-24 h-24 bg-emerald-900/40 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-lg p-2">
                        <img src="/ayurtribelogo.png" alt="Ayur Tribe" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl font-serif mb-6 leading-tight">
                        {t('Welcome to')} <br />
                        <span className="text-emerald-300">Ayur Tribe</span>
                    </h1>
                    <p className="text-emerald-100/80 text-lg leading-relaxed mb-8">
                        {t('The intelligent operating system for modern Ayurveda.')}
                        {t('Manage patients, therapies, and clinics with the precision of nature.')}
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="text-2xl font-bold mb-1 text-amber-100">15k+</div>
                            <div className="text-sm text-emerald-200">{t('Lives Touched')}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="text-2xl font-bold mb-1 text-amber-100">98%</div>
                            <div className="text-sm text-emerald-200">{t('Recovery Rate')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
                <div className="absolute top-8 right-8 z-50">
                    <LanguageSelector />
                </div>
                <Link to="/" className="absolute top-8 left-8 text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2 group">
                    <div className="p-2 rounded-full group-hover:bg-stone-100 transition-colors">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                    </div>
                    <span className="font-medium">{t('Back to Home')}</span>
                </Link>
                <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-stone-900 tracking-tight">
                            {otpSent ? t('Enter Login Code') : t('Sign in to your account')}
                        </h2>
                        <p className="mt-2 text-stone-600">
                            {t('New here?')}{' '}
                            <Link to="/auth/register" className="font-medium text-amber-600 hover:text-amber-700 transition-colors">
                                {t('Create an account')}
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="mt-8 space-y-6">
                        <div className="space-y-5">
                            {!otpSent && (
                                <Input
                                    label="Email address"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    leftIcon={<Mail className="h-5 w-5" />}
                                />
                            )}

                            {otpSent && (
                                <Input
                                    label="One-Time Password"
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    leftIcon={<Lock className="h-5 w-5" />}
                                    className="tracking-widest"
                                />
                            )}

                            {!isMagicLink && !otpSent && (
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-medium text-stone-700">Password</label>
                                        <a href="#" className="text-sm font-medium text-amber-600 hover:text-amber-700">
                                            Forgot password?
                                        </a>
                                    </div>
                                    <Input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="h-5 w-5" />}
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={loading}
                            rightIcon={!loading && <ArrowRight className="w-4 h-4 text-amber-300" />}
                        >
                            {otpSent ? t('Verify Login Code') : (isMagicLink ? t('Send Login Code') : t('Sign In'))}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-stone-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-stone-500">{t('Or continue with')}</span>
                            </div>
                        </div>

                        {!otpSent ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsMagicLink(!isMagicLink)}
                            >
                                {isMagicLink ? t('Use Password') : t('Login using OTP')}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-stone-500"
                                onClick={() => setOtpSent(false)}
                            >
                                {t('Back to Login Methods')}
                            </Button>
                        )}
                    </form>
                </div>
                <GlobalFooter className="absolute bottom-4 z-50 text-stone-400" />
            </div>
        </div>
    );
};

export default Login;
