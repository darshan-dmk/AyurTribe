import React, { useState } from 'react';
import { supabase } from '../../utils/supabase'; // Keep strictly for Auth SignUp
import api from '../../utils/api'; // Use API for profile updates if possible, or supabase fallback
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, Check, ChevronRight, ChevronLeft, Activity, Heart, Shield, Phone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import { GlobalFooter } from '../../components/GlobalFooter';

// Combined Interface
interface RegistrationData {
    // Step 1: Account
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;

    // Step 2: Personal
    dateOfBirth: string;
    gender: string;
    phone: string; // Added phone field
    address: string;
    emergencyContact: string;
    emergencyName: string;
    emergencyRelation: string;

    // Step 3: Medical
    occupation: string;
    exerciseFrequency: string;
    smokingStatus: string;
    alcoholConsumption: string;
    healthDataConsent: boolean;
    termsAccepted: boolean;
}

const Register = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Combined State
    const [formData, setFormData] = useState<RegistrationData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        address: '',
        emergencyContact: '',
        emergencyName: '',
        emergencyRelation: '',
        occupation: '',
        exerciseFrequency: '',
        smokingStatus: '',
        alcoholConsumption: '',
        healthDataConsent: false,
        termsAccepted: false
    });

    const totalPages = 3;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setError(null);
    };

    const validateStep = (step: number) => {
        setError(null);
        if (step === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
                setError("Please fill in all required fields.");
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match.");
                return false;
            }
            if (formData.password.length < 6) {
                setError("Password must be at least 6 characters.");
                return false;
            }
        }
        if (step === 2) {
            if (!formData.dateOfBirth || !formData.gender || !formData.emergencyName || !formData.emergencyContact || !formData.emergencyRelation) {
                setError("Please complete all personal and emergency details.");
                return false;
            }
        }
        if (step === 3) {
            if (!formData.healthDataConsent || !formData.termsAccepted) {
                setError("You must accept the terms and consent to health data processing.");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentPage)) {
            setCurrentPage(prev => Math.min(prev + 1, totalPages));
        }
    };

    const handleBack = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        setLoading(true);
        setError(null);

        try {
            // Set flag to prevent AuthContext from racing to fetch profile
            localStorage.setItem('registration_in_progress', 'true');

            // 1. Call Backend API to create the Full Profile + Auth User in one shot
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                // Profile Data
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                phone: formData.phone,
                address: formData.address,
                emergencyName: formData.emergencyName,
                emergencyContact: formData.emergencyContact,
                emergencyRelation: formData.emergencyRelation,
                // Medical Context
                occupation: formData.occupation,
                exerciseFrequency: formData.exerciseFrequency,
                smokingStatus: formData.smokingStatus,
                alcoholConsumption: formData.alcoholConsumption,
                consent: formData.healthDataConsent
            };

            const response = await api.register(payload);

            if (response.success) {
                // 2. Auth was handled by backend, now sign in locally to get session
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (authError) throw authError;

                // Clear registration flag
                localStorage.removeItem('registration_in_progress');

                if (authData.session) {
                    navigate('/auth/prakriti-questionnaire', { state: { userId: authData.user.id } });
                } else {
                    // This case should be rare now since backend auto-confirms
                    alert('Registration successful! Please login to continue.');
                    navigate('/auth/login');
                }
            } else {
                throw new Error(response.message || 'Profile creation failed.');
            }
        }
        catch (err: any) {
            console.error(err);
            // Better error message handling
            const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
            setError(msg);

            // Clear flag on error too, to avoid stuck state
            localStorage.removeItem('registration_in_progress');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex font-inter">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-emerald-950 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-17e6fc48cf09?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent"></div>
                <div className="relative z-10 text-white p-12 max-w-lg">
                    <div className="w-24 h-24 bg-emerald-900/40 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-lg p-2">
                        <img src="/ayurtribelogo.png" alt="Ayur Tribe" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl font-serif mb-6 leading-tight">
                        Start Your <br />
                        <span className="text-emerald-300">Ayurvedic Journey</span>
                    </h1>
                    <p className="text-emerald-100/80 text-lg leading-relaxed mb-8">
                        Join our community for personalized holistic care. Three simple steps to wellness.
                    </p>

                    {/* Stepper Visual */}
                    <div className="flex space-x-4">
                        {[1, 2, 3].map(step => (
                            <div key={step} className={`flex items-center space-x-2 ${currentPage >= step ? 'text-white' : 'text-emerald-700'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentPage >= step ? 'border-amber-400 bg-amber-400 text-emerald-950 font-bold' : 'border-emerald-700'
                                    }`}>
                                    {step}
                                </div>
                                <span className={`text-sm font-medium ${currentPage >= step ? 'text-amber-100' : 'text-emerald-700'}`}>
                                    {step === 1 ? t('Account') : step === 2 ? t('Profile') : t('Context')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto relative">
                <div className="absolute top-8 right-8 z-50">
                    <LanguageSelector />
                </div>
                <Link to="/" className="absolute top-8 left-8 text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2 group">
                    <div className="p-2 rounded-full group-hover:bg-stone-100 transition-colors">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                    </div>
                    <span className="font-medium">{t('Back to Home')}</span>
                </Link>
                <div className="w-full max-w-lg space-y-8 mt-12 lg:mt-0">
                    <div className="flex justify-between items-center">
                        <div className="text-left">
                            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                                {currentPage === 1 && t("Create Account")}
                                {currentPage === 2 && t("Personal Profile")}
                                {currentPage === 3 && t("Health Context")}
                            </h2>
                            <p className="mt-2 text-stone-600">
                                {t('Step')} {currentPage} {t('of')} {totalPages}
                            </p>
                        </div>
                        {currentPage === 1 && (
                            <Link to="/auth/login" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                                {t('Sign In instead')}
                            </Link>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start space-x-3 animate-pulse">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm font-medium text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <AnimatePresence mode="wait">
                            {currentPage === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="First Name" name="firstName" required
                                            value={formData.firstName} onChange={handleChange}
                                            placeholder="John"
                                            leftIcon={<User className="h-5 w-5 text-stone-400" />}
                                            className="border-stone-300 focus:border-emerald-500 rounded-lg"
                                        />
                                        <Input
                                            label="Last Name" name="lastName" required
                                            value={formData.lastName} onChange={handleChange}
                                            placeholder="Doe"
                                            className="border-stone-300 focus:border-emerald-500 rounded-lg"
                                        />
                                    </div>
                                    <Input
                                        label="Email" name="email" type="email" required
                                        value={formData.email} onChange={handleChange}
                                        placeholder="you@example.com"
                                        leftIcon={<Mail className="h-5 w-5 text-stone-400" />}
                                        className="border-stone-300 focus:border-emerald-500 rounded-lg"
                                    />
                                    <Input
                                        label="Password" name="password" type="password" required minLength={6}
                                        value={formData.password} onChange={handleChange}
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="h-5 w-5 text-stone-400" />}
                                        className="border-stone-300 focus:border-emerald-500 rounded-lg"
                                    />
                                    <Input
                                        label="Confirm Password" name="confirmPassword" type="password" required minLength={6}
                                        value={formData.confirmPassword} onChange={handleChange}
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="h-5 w-5 text-stone-400" />}
                                        className="border-stone-300 focus:border-emerald-500 rounded-lg"
                                    />
                                </motion.div>
                            )}

                            {currentPage === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Date of Birth</label>
                                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500">
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <Input
                                        label="Phone Number" name="phone" type="tel" required
                                        value={formData.phone} onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        leftIcon={<Phone className="h-5 w-5 text-stone-400" />}
                                        className="border-stone-300 focus:border-emerald-500 rounded-lg"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 resize-none" placeholder="123 Wellness Way" />
                                    </div>
                                    <div className="pt-2 border-t border-stone-100 mt-2">
                                        <h4 className="text-sm font-semibold text-stone-900 mb-2 flex items-center"><Heart className="w-4 h-4 mr-2 text-red-500" /> Emergency Contact</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} placeholder="Contact Name" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Emergency Phone" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                                                <select name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500">
                                                    <option value="">Relation</option>
                                                    <option value="Spouse">Spouse</option>
                                                    <option value="Parent">Parent</option>
                                                    <option value="Sibling">Sibling</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentPage === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
                                            <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Activity Level</label>
                                            <select name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                                <option value="">Select</option>
                                                <option value="sedentary">Sedentary</option>
                                                <option value="moderate">Moderate</option>
                                                <option value="active">Active</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <div className="flex items-start mb-3">
                                            <input id="healthData" name="healthDataConsent" type="checkbox" checked={formData.healthDataConsent} onChange={handleChange} className="mt-1 h-4 w-4 text-blue-600 rounded" />
                                            <label htmlFor="healthData" className="ml-3 block text-sm text-slate-700">I consent to the processing of my health data for medical purposes.</label>
                                        </div>
                                        <div className="flex items-start">
                                            <input id="terms" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleChange} className="mt-1 h-4 w-4 text-blue-600 rounded" />
                                            <label htmlFor="terms" className="ml-3 block text-sm text-slate-700">I agree to the Terms of Service and Privacy Policy.</label>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-between pt-6">
                            {currentPage > 1 ? (
                                <Button type="button" variant="outline" onClick={handleBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                                    {t('Back')}
                                </Button>
                            ) : <div></div>}

                            {currentPage < totalPages ? (
                                <Button type="button" onClick={handleNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
                                    {t('Continue')}
                                </Button>
                            ) : (
                                <Button type="submit" isLoading={loading} rightIcon={<Check className="w-4 h-4" />}>
                                    {t('Create Account')}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
                <GlobalFooter className="absolute bottom-4 z-50 text-stone-400" />
            </div>
        </div>
    );
};

export default Register;
