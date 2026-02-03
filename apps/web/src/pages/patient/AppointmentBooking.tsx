import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import {
    Calendar,
    Clock,
    ArrowLeft,
    CheckCircle,
    IndianRupee,
    Filter,
    Sparkles,
    AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import PatientNavbar from '../../components/PatientNavbar';
import { GlobalFooter } from '../../components/GlobalFooter';

const AppointmentBooking = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [treatments, setTreatments] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        reason: '',
        treatmentId: '',
        treatmentName: ''
    });

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchTreatments();
        const treatmentsSubscription = supabase
            .channel('public:treatments')
            .on('postgres_changes' as any, { event: '*', table: 'treatments' }, () => {
                fetchTreatments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(treatmentsSubscription);
        };
    }, []);

    const fetchTreatments = async () => {
        try {
            setFetching(true);
            const { data, error } = await supabase
                .from('treatments')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setTreatments(data || []);
        } catch (error) {
            console.error('Error fetching treatments:', error);
            toast.error('Failed to load therapy types');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectTreatment = (treatment: any) => {
        setFormData(prev => ({
            ...prev,
            treatmentId: treatment.id,
            treatmentName: treatment.name
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.treatmentName) {
            toast.error('Please select a treatment type');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('appointments')
                .insert({
                    patient_id: user.id,
                    appointment_date: formData.date,
                    appointment_time: formData.time,
                    type: formData.treatmentName,
                    status: 'scheduled',
                    notes: formData.reason
                });

            if (error) throw error;
            toast.success('Appointment booked successfully!');
            navigate('/patient/dashboard');
        } catch (error: any) {
            console.error('Booking error:', error);
            toast.error(error.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...Array.from(new Set(treatments.map(t => t.category || 'General')))];
    const filteredTreatments = selectedCategory === 'All'
        ? treatments
        : treatments.filter(t => (t.category || 'General') === selectedCategory);

    return (
        <div className="ayurveda-page min-h-screen text-gray-100 font-sans relative bg-[#0f1115]" data-theme="dark">
            {/* ---------------- BACKGROUND EFFECTS (MATCHING DASHBOARD) ---------------- */}
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
            <div className="fixed w-96 h-96 md:w-[600px] md:h-[600px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                <div className="absolute inset-0 rounded-full breathe-1" style={{ background: 'radial-gradient(circle, rgba(255,183,77,0.32), rgba(218,165,32,0.06) 40%, transparent 70%)' }} />
            </div>

            {/* Pulse rings */}
            <div className="fixed w-[800px] h-[800px] top-1/2 left-1/2 border border-yellow-400/10 rounded-full pulse-ring pointer-events-none z-0" />
            <div className="fixed w-[900px] h-[900px] top-1/2 left-1/2 border border-yellow-400/8 rounded-full pulse-ring pointer-events-none z-0" />
            {/* ---------------- END BACKGROUND EFFECTS ---------------- */}

            <div className="relative z-10">
                <PatientNavbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <Button variant="ghost" onClick={() => navigate('/patient/dashboard')} className="mb-4 text-gray-400 hover:text-white hover:bg-white/5 -ml-2">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                        </Button>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight">
                                    Book Your <span className="text-[#E07A5F]" style={{ color: 'var(--accent-gold-1, #E07A5F)' }}>Healing Session</span>
                                </h1>
                                <p className="text-gray-400 text-lg">Select a specialized Ayurvedic treatment tailored to your needs.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Treatments */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Categories */}
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                            ? 'bg-[#E07A5F] text-white shadow-lg shadow-orange-900/20 transform scale-105'
                                            : 'bg-[#15171e]/80 backdrop-blur-sm border border-white/5 text-gray-400 hover:bg-[#334155] hover:text-white'
                                            }`}
                                        style={selectedCategory === cat ? { background: 'linear-gradient(135deg, var(--accent-gold-1, #E07A5F), var(--accent-gold-2, #D0694E))' } : {}}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Treatment Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {fetching ? (
                                    <div className="col-span-2 py-20 text-center">
                                        <div className="animate-spin w-8 h-8 border-2 border-[#E07A5F] border-t-transparent rounded-full mx-auto mb-4" />
                                        <p className="text-gray-400">Loading therapies...</p>
                                    </div>
                                ) : filteredTreatments.length === 0 ? (
                                    <div className="col-span-2 py-20 text-center bg-[#15171e]/50 backdrop-blur-md rounded-2xl border border-white/5">
                                        <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">No therapies found in this category.</p>
                                    </div>
                                ) : (
                                    filteredTreatments.map((t) => (
                                        <motion.div
                                            key={t.id}
                                            whileHover={{ y: -4, boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)' }}
                                            onClick={() => handleSelectTreatment(t)}
                                            className={`cursor-pointer p-6 rounded-2xl bg-[#15171e]/70 backdrop-blur-md border border-white/5 transition-all ayurveda-card ${formData.treatmentId === t.id
                                                ? 'border-[#E07A5F] shadow-lg shadow-orange-900/20 bg-[#252f44]/90'
                                                : 'hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-black tracking-widest text-[#E07A5F] bg-[#E07A5F]/10 px-2 py-1 rounded-md uppercase">
                                                    {t.category || 'Therapy'}
                                                </span>
                                                {formData.treatmentId === t.id && (
                                                    <CheckCircle className="w-6 h-6 text-[#E07A5F]" />
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">{t.name}</h3>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{t.description}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-center text-sm font-medium text-gray-500">
                                                    <Clock className="w-4 h-4 mr-1.5" />
                                                    {t.duration_minutes} mins
                                                </div>
                                                <div className="text-lg font-bold text-[#E07A5F] flex items-center">
                                                    <IndianRupee size={16} />{t.price}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Column: Booking Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#15171e]/80 backdrop-blur-md rounded-2xl shadow-xl shadow-black/20 border border-white/5 p-6 sticky top-24 ayurveda-card">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                                    <Calendar className="w-5 h-5 mr-3 text-[#E07A5F]" />
                                    Your Appointment
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Selected Therapy</label>
                                        <div className={`p-4 rounded-xl border ${formData.treatmentName ? 'bg-[#E07A5F]/10 border-[#E07A5F]/30' : 'bg-black/20 border-white/5 border-dashed text-center'}`}>
                                            {formData.treatmentName ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-[#1e293b] rounded-lg shadow-sm border border-white/5">
                                                        <Sparkles className="w-5 h-5 text-[#E07A5F]" />
                                                    </div>
                                                    <div className="font-bold text-white">{formData.treatmentName}</div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">Select a therapy from the list</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Preferred Date</label>
                                        <Input
                                            type="date"
                                            name="date"
                                            required
                                            min={today}
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="bg-black/20 border-white/10 focus:border-[#E07A5F] focus:ring-[#E07A5F]/20 rounded-xl py-3 text-white placeholder-gray-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Preferred Time</label>
                                        <Input
                                            type="time"
                                            name="time"
                                            required
                                            value={formData.time}
                                            onChange={handleChange}
                                            className="bg-black/20 border-white/10 focus:border-[#E07A5F] focus:ring-[#E07A5F]/20 rounded-xl py-3 text-white placeholder-gray-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Notes / Symptoms</label>
                                        <textarea
                                            name="reason"
                                            rows={3}
                                            value={formData.reason}
                                            onChange={handleChange}
                                            placeholder="Briefly describe your current condition..."
                                            className="w-full bg-black/20 border-white/10 border rounded-xl p-3 text-sm focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F]/20 focus:outline-none transition-all text-white placeholder-gray-600"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading || !formData.treatmentId || !formData.date || !formData.time}
                                        className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[#E07A5F] to-orange-600 hover:from-orange-500 hover:to-orange-700 shadow-lg shadow-orange-900/40 rounded-xl text-white border-0"
                                        style={{ background: 'linear-gradient(135deg, var(--accent-gold-1, #E07A5F), var(--accent-gold-2, #D0694E))' }}
                                    >
                                        {loading ? 'Confirming...' : 'Confirm Booking'}
                                    </Button>

                                    <div className="flex items-start gap-3 text-xs text-gray-500 bg-black/20 p-3 rounded-lg border border-white/5">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#E07A5F]" />
                                        Your appointment is subject to practitioner confirmation. You will be notified once approved.
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <GlobalFooter dark className="bg-[#0f1115]/50 border-t border-white/5" />
            </div>
        </div>
    );
};

export default AppointmentBooking;
