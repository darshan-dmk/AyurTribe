// apps/web/src/pages/auth/PatientRegister.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

interface RegistrationData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  emergencyContact: string;
  emergencyName: string;
  emergencyRelation: string;
  address: string;

  // Enhanced health information
  chronicConditions: string[];
  currentMedications: string[];
  allergies: string[];
  previousSurgeries: string[];
  familyHistory: string[];

  // Lifestyle information
  occupation: string;
  exerciseFrequency: string;
  sleepPattern: string;
  dietaryPreferences: string[];
  smokingStatus: string;
  alcoholConsumption: string;
  stressLevel: number;

  // Ayurvedic specific
  previousAyurvedicTreatment: boolean;
  specificConcerns: string[];
  treatmentGoals: string[];

  // Consent
  consent: boolean;
  healthDataConsent: boolean;
  treatmentConsent: boolean;
  communicationConsent: boolean;
  termsAccepted: boolean;
}

const PatientRegister: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    emergencyContact: '',
    emergencyName: '',
    emergencyRelation: '',
    address: '',
    chronicConditions: [],
    currentMedications: [],
    allergies: [],
    previousSurgeries: [],
    familyHistory: [],
    occupation: '',
    exerciseFrequency: '',
    sleepPattern: '',
    dietaryPreferences: [],
    smokingStatus: '',
    alcoholConsumption: '',
    stressLevel: 5,
    previousAyurvedicTreatment: false,
    specificConcerns: [],
    treatmentGoals: [],
    consent: false,
    healthDataConsent: false,
    treatmentConsent: false,
    communicationConsent: false,
    termsAccepted: false
  });

  // Read pending identifier set by OTP flow (if any)
  const pendingIdentifierType =
    (sessionStorage.getItem('pendingIdentifierType') as 'phone' | 'email' | null) ?? null;
  const pendingIdentifierValue = sessionStorage.getItem('pendingIdentifierValue') ?? '';

  const totalPages = 2;

  // On mount, check if user is already authenticated and their onboarding status
  useEffect(() => {
    const checkAuthAndData = async () => {
      try {
        console.log('Checking authentication...');

        // Check for stored JWT token instead of Supabase session
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('Found stored auth:', parsedUser.id);

            // Verify token is still valid by making an API call
            const response = await api.get('/auth/profile', {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.success && response.user) {
              const user = response.user;

              // Ensure phone & userId are available
              if (!user.phone || !user.id) {
                console.error('[PatientRegister] Missing phone or userId');
                navigate('/auth/phone');
                return;
              }

              // Check onboarding status
              if (user.onboarding?.questionnaire_completed) {
                navigate('/patient/dashboard');
                return;
              }

              if (user.onboarding?.personal_details_completed) {
                navigate('/auth/prakriti-questionnaire');
                return;
              }
            }
          } catch (tokenError) {
            console.log('Token validation failed, clearing stored auth');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          console.log('No stored authentication found');
        }

        setCheckingAuth(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setCheckingAuth(false);
      }
    };

    checkAuthAndData();
  }, [navigate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      // Sync consent with healthDataConsent for backward compatibility
      if (name === 'healthDataConsent') {
        setFormData(prev => ({
          ...prev,
          consent: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateCurrentPage = (): boolean => {
    switch (currentPage) {
      case 1:
        if (!formData.firstName.trim() || !formData.lastName.trim() ||
          !formData.dateOfBirth || !formData.gender || !formData.email.trim()) {
          setError('Please fill in all required fields');
          return false;
        }
        if (!formData.emergencyName.trim() || !formData.emergencyContact.trim() || !formData.emergencyRelation) {
          setError('Please provide emergency contact information');
          return false;
        }
        break;
      case 2:
        if (!formData.healthDataConsent || !formData.termsAccepted) {
          setError('Please accept the required terms and conditions');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateCurrentPage()) {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentPage()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get pending identifier from sessionStorage (set during OTP flow)
      const pendingIdentifierType = sessionStorage.getItem('pendingIdentifierType') as 'phone' | 'email' | null;
      const pendingIdentifierValue = sessionStorage.getItem('pendingIdentifierValue') || '';

      // Prepare complete payload for backend
      const registrationPayload: any = {
        // Personal details
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address.trim(),

        // Emergency contact
        emergencyContact: formData.emergencyContact.trim(),
        emergencyName: formData.emergencyName.trim(),
        emergencyRelation: formData.emergencyRelation,

        // Enhanced health data
        occupation: formData.occupation,
        chronicConditions: formData.chronicConditions,
        currentMedications: formData.currentMedications,
        allergies: formData.allergies,
        previousSurgeries: formData.previousSurgeries,
        familyHistory: formData.familyHistory,
        exerciseFrequency: formData.exerciseFrequency,
        sleepPattern: formData.sleepPattern,
        smokingStatus: formData.smokingStatus,
        alcoholConsumption: formData.alcoholConsumption,
        stressLevel: formData.stressLevel,
        previousAyurvedicTreatment: formData.previousAyurvedicTreatment,
        specificConcerns: formData.specificConcerns,
        treatmentGoals: formData.treatmentGoals,
        dietaryPreferences: formData.dietaryPreferences,

        // Consent - REQUIRED
        consent: formData.healthDataConsent || formData.consent,
      };

      // Add identifier from OTP flow
      if (pendingIdentifierType === 'phone' && pendingIdentifierValue) {
        registrationPayload.phone = pendingIdentifierValue;
      } else if (pendingIdentifierType === 'email' && pendingIdentifierValue) {
        registrationPayload.email = pendingIdentifierValue;
      } else if (formData.email.trim()) {
        // Fallback to form email if no pending identifier
        registrationPayload.email = formData.email.trim();
      }

      console.log('Submitting registration with payload:', registrationPayload);

      // Call your API to register user
      const response = await api.register(registrationPayload);
      console.log('Registration response:', response);

      if (response.success && response.token && response.user) {
        const token = response.token;
        const user = response.user;

        // Store authentication token only
        localStorage.setItem('token', token);

        // Clear any old localStorage data
        localStorage.removeItem('registrationData');
        localStorage.removeItem('prakritiResults');
        localStorage.removeItem('user'); // Remove this completely

        console.log('Registration successful, user data saved to database');
        navigate('/auth/prakriti-questionnaire', { state: { userId: user.id } });
      } else {
        throw new Error('Registration response missing required fields');
      }

    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-slate-600 font-medium">Checking your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-100 relative overflow-hidden">

          {/* Header */}
          <div className="mb-8 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4 ring-8 ring-blue-50/50">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Review Your Profile
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Please complete your registration to access your personalized health dashboard.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-10 max-w-lg mx-auto">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t-2 border-slate-100" />
              </div>
              <div className="relative flex justify-between">
                {[1, 2].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ring-4 ring-white transition-colors duration-300 ${currentPage >= step
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                        }`}
                    >
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-slate-500 px-2 lg:px-0">
              <span className={currentPage >= 1 ? 'text-blue-600' : ''}>Personal Info</span>
              <span className={currentPage >= 2 ? 'text-blue-600' : ''}>Medical Context</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <AnimatePresence mode="wait">
              {currentPage === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold leading-6 text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                          placeholder="e.g. John"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                          placeholder="e.g. Doe"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          className="appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gender <span className="text-red-500">*</span></label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className="appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                        />
                        {pendingIdentifierValue && pendingIdentifierType === 'email' && (
                          <div className="mt-1.5 flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Verified via OTP
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={3}
                          className="appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white resize-none"
                          placeholder="Apartment, Studio, or Floor"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold leading-6 text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                      <span className="w-1 h-6 bg-red-400 rounded-full"></span>
                      Emergency Contact
                      <span className="text-xs font-normal text-slate-400 ml-2">(In case of emergency)</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="emergencyName"
                          value={formData.emergencyName}
                          onChange={handleChange}
                          required
                          className="appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                          placeholder="Contact Person"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          required
                          className="appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Relationship <span className="text-red-500">*</span></label>
                        <select
                          name="emergencyRelation"
                          value={formData.emergencyRelation}
                          onChange={handleChange}
                          required
                          className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                        >
                          <option value="">Select Relation</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Child">Child</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentPage === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold leading-6 text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                    <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                    Lifestyle & Medical Context
                  </h3>

                  <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                        placeholder="Current Profession"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Exercise Frequency</label>
                      <select
                        name="exerciseFrequency"
                        value={formData.exerciseFrequency}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                      >
                        <option value="">Select Frequency</option>
                        <option value="sedentary">Sedentary (Little to no exercise)</option>
                        <option value="light">Light (1-2 days/week)</option>
                        <option value="moderate">Moderate (3-4 days/week)</option>
                        <option value="active">Active (5+ days/week)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Smoking Status</label>
                      <select
                        name="smokingStatus"
                        value={formData.smokingStatus}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                      >
                        <option value="">Select Status</option>
                        <option value="never">Never Smoked</option>
                        <option value="former">Former Smoker</option>
                        <option value="current">Current Smoker</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Alcohol Consumption</label>
                      <select
                        name="alcoholConsumption"
                        value={formData.alcoholConsumption}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-50/50 transition-all hover:bg-white focus:bg-white"
                      >
                        <option value="">Select Status</option>
                        <option value="none">None</option>
                        <option value="occasional">Occasional</option>
                        <option value="regular">Regular</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mt-8">
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Consent & Declarations</h4>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="consent1"
                            name="healthDataConsent"
                            type="checkbox"
                            checked={formData.healthDataConsent}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded cursor-pointer"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="consent1" className="font-medium text-slate-700 cursor-pointer">HIPAA & Health Data Consent</label>
                          <p className="text-slate-500 mt-0.5">I explicitly consent to the processing and storage of my health data for the purpose of receiving medical services.</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="consent2"
                            name="termsAccepted"
                            type="checkbox"
                            checked={formData.termsAccepted}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded cursor-pointer"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="consent2" className="font-medium text-slate-700 cursor-pointer">Terms & Conditions</label>
                          <p className="text-slate-500 mt-0.5">I have read and agree to the Terms of Service and Privacy Policy.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 p-4 border border-red-100"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Action Required</h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-100">
              {currentPage > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="bg-white py-2.5 px-6 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div /> // Spacer
              )}

              {currentPage < totalPages ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-blue-200"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-blue-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Complete Registration'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientRegister;
