import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Calendar, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const AppointmentBooking = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [treatments, setTreatments] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        reason: '',
        treatmentType: ''
    });

    useEffect(() => {
        fetchTreatments();
    }, []);

    const fetchTreatments = async () => {
        const { data } = await supabase
            .from('treatments')
            .select('name')
            .eq('is_active', true);
        if (data) setTreatments(data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                    type: formData.treatmentType || 'General Consultation',
                    status: 'pending', // Pending approval
                    notes: formData.reason
                });

            if (error) throw error;

            toast.success(
                <div>
                    <b>Request Sent!</b>
                    <div className="text-sm opacity-90 mt-1">
                        Reception will review your request shortly.
                    </div>
                </div>
            );

            // Navigate back to dashboard after a delay
            setTimeout(() => navigate('/patient/dashboard'), 2000);

        } catch (error: any) {
            console.error('Booking error:', error);
            toast.error(error.message || 'Failed to submit request');
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-[#1a1c23] text-[#F4F1DE]">
            {/* Header */}
            <header className="bg-[#252836] border-b border-white/10 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
                    <button
                        onClick={() => navigate('/patient/dashboard')}
                        className="mr-4 p-2 hover:bg-white/5 rounded-full transition-colors text-[#9CA3AF] hover:text-[#F4F1DE]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-[#E07A5F]">Book New Appointment</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-[#252836] rounded-xl border border-white/10 p-6 md:p-8 shadow-xl">
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-[#E07A5F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-[#E07A5F]" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Request a Visit</h2>
                        <p className="text-[#9CA3AF]">
                            Choose your preferred time. Our reception team will confirm your slot.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Treatment Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#F4F1DE]">Type of Visit (Optional)</label>
                            <select
                                name="treatmentType"
                                value={formData.treatmentType}
                                onChange={handleChange}
                                className="w-full bg-[#1a1c23] border border-white/10 rounded-lg px-4 py-3 text-[#F4F1DE] focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] outline-none transition-colors appearance-none"
                            >
                                <option value="">General Consultation</option>
                                {treatments.map((t, idx) => (
                                    <option key={idx} value={t.name} className="bg-[#1a1c23] text-[#F4F1DE]">{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#F4F1DE]">Preferred Date</label>
                                <Input
                                    type="date"
                                    name="date"
                                    required
                                    min={today}
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="!bg-[#1a1c23] focus:!bg-[#1a1c23] border border-white/10 text-[#F4F1DE] focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] placeholder-gray-500 w-full"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>

                            {/* Time */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#F4F1DE]">Preferred Time</label>
                                <Input
                                    type="time"
                                    name="time"
                                    required
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="!bg-[#1a1c23] focus:!bg-[#1a1c23] border border-white/10 text-[#F4F1DE] focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] placeholder-gray-500 w-full"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#F4F1DE]">Reason for Visit</label>
                            <textarea
                                name="reason"
                                required
                                rows={4}
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Briefly describe your symptoms or reason for consultation..."
                                className="w-full bg-[#1a1c23] border border-white/10 rounded-lg px-4 py-3 text-[#F4F1DE] focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] placeholder-gray-500 outline-none transition-colors resize-none"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#E07A5F] hover:bg-[#D06A4F] text-white py-4 text-lg font-medium shadow-lg shadow-[#E07A5F]/20"
                            >
                                {loading ? 'Sending Request...' : 'Submit Request'}
                            </Button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
};

export default AppointmentBooking;
