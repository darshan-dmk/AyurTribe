import React, { useEffect, useState } from 'react';
import { supabase, authService, User } from '../../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Search, CheckCircle, XCircle, User as UserIcon, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Data State
    const [practitioners, setPractitioners] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [treatments, setTreatments] = useState<any[]>([]);

    // Booking Form State
    const [bookingData, setBookingData] = useState({
        patientId: '',
        practitionerId: '',
        treatmentType: '',
        date: '',
        time: '',
        notes: ''
    });

    const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
    const [confirmedAppointments, setConfirmedAppointments] = useState<any[]>([]);
    const [historyAppointments, setHistoryAppointments] = useState<any[]>([]);

    // Tab State
    const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'history'>('confirmed');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            if (!currentUser || (currentUser.role !== 'receptionist' && currentUser.role !== 'admin')) {
                navigate('/auth/login');
                return;
            }
            setUser(currentUser);

            // Fetch Practitioners (Doctors)
            const { data: docs } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'practitioner')
                .order('is_on_duty', { ascending: false }); // On duty first
            setPractitioners(docs || []);

            // Fetch Patients
            const { data: pats } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'patient')
                .order('first_name');
            setPatients(pats || []);

            // Fetch Treatments (Types)
            const { data: treats } = await supabase
                .from('treatments')
                .select('*')
                .eq('is_active', true);
            setTreatments(treats || []);

            // Fetch Appointments
            // Fetch Appointments
            fetchPendingAppointments();
            fetchConfirmedAppointments();
            fetchHistoryAppointments();

        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingAppointments = async () => {
        const { data } = await supabase
            .from('appointments')
            .select(`
                *,
                patient:patient_id (first_name, last_name, phone)
            `)
            .in('status', ['pending', 'scheduled'])
            .order('created_at', { ascending: true });
        setPendingAppointments(data || []);
    };

    const fetchConfirmedAppointments = async () => {
        const { data } = await supabase
            .from('appointments')
            .select(`
                *,
                patient:patient_id (first_name, last_name, phone),
                practitioner:practitioner_id (first_name, last_name)
            `)
            .eq('status', 'confirmed')
            .order('appointment_date', { ascending: true })
            .order('appointment_time', { ascending: true });
        setConfirmedAppointments(data || []);
    };

    const fetchHistoryAppointments = async () => {
        const { data } = await supabase
            .from('appointments')
            .select(`
                *,
                patient:patient_id (first_name, last_name, phone),
                practitioner:practitioner_id (first_name, last_name)
            `)
            .in('status', ['completed', 'cancelled', 'no-show'])
            .order('appointment_date', { ascending: false });
        setHistoryAppointments(data || []);
    };

    const handleAssignDoctor = async (appointmentId: string, practitionerId: string) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ practitioner_id: practitionerId })
                .eq('id', appointmentId);

            if (error) throw error;
            toast.success('Doctor assigned successfully');
            fetchConfirmedAppointments();
        } catch (error) {
            console.error('Error assigning doctor:', error);
            toast.error('Failed to assign doctor');
        }
    };

    const handleApproveAppointment = async (id: string) => {
        try {
            // Check if practitioner is assigned? For now just confirm.
            // In a real flow, you might want to assign a doctor here if it's null.
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'confirmed' })
                .eq('id', id);

            if (error) throw error;
            toast.success('Appointment Approved');
            fetchPendingAppointments();
        } catch (error) {
            console.error('Error approving:', error);
            toast.error('Failed to approve');
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Appointment marked as ${newStatus}`);
            fetchConfirmedAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleRejectAppointment = async (id: string) => {
        if (!window.confirm('Are you sure you want to reject this request?')) return;
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id);

            if (error) throw error;
            toast.success('Appointment Rejected');
            fetchPendingAppointments();
        } catch (error) {
            console.error('Error rejecting:', error);
            toast.error('Failed to reject');
        }
    };

    const handleLogout = async () => {
        await authService.signOut();
        navigate('/auth/login');
    };

    const handleToggleDuty = async () => {
        if (!user) return;
        try {
            const newStatus = !user.is_on_duty;
            const { error } = await supabase
                .from('users')
                .update({ is_on_duty: newStatus })
                .eq('id', user.id);

            if (error) throw error;

            setUser({ ...user, is_on_duty: newStatus });
            toast.success(newStatus ? 'You are now On Duty' : 'You are now Off Duty');
        } catch (error) {
            console.error('Error toggling duty status:', error);
            toast.error('Failed to update duty status');
        }
    };

    const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!bookingData.patientId || !bookingData.practitionerId || !bookingData.date || !bookingData.time) {
                toast.error('Please fill in all required fields');
                return;
            }

            const { error } = await supabase
                .from('appointments')
                .insert({
                    patient_id: bookingData.patientId,
                    practitioner_id: bookingData.practitionerId,
                    appointment_date: bookingData.date,
                    appointment_time: bookingData.time,
                    type: bookingData.treatmentType || 'General Consultation', // Default fall back
                    status: 'confirmed',
                    notes: bookingData.notes
                });

            if (error) throw error;

            toast.success('Appointment booked successfully!');
            // Reset form
            setBookingData({
                patientId: '',
                practitionerId: '',
                treatmentType: '',
                date: '',
                time: '',
                notes: ''
            });

        } catch (error: any) {
            console.error('Booking error:', error);
            toast.error(error.message || 'Failed to book appointment');
        }
    };

    const getDutyStatusColor = (isOnDuty: boolean) => {
        return isOnDuty ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500';
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="text-stone-500 animate-pulse">Loading Console...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-emerald-700" />
                        </div>
                        <span className="font-serif font-bold text-xl text-stone-800">Ayur Tribe <span className="text-stone-400 font-sans text-sm font-normal ml-2">Reception</span></span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-stone-600 hidden sm:block">
                            {user?.first_name} {user?.last_name}
                        </span>
                        <button
                            onClick={handleToggleDuty}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${user?.is_on_duty
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                        >
                            {user?.is_on_duty ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    On Duty
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-stone-400" />
                                    Off Duty
                                </>
                            )}
                        </button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-stone-600 hover:text-stone-900"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Tabs Navigation */}
                <div className="flex border-b border-stone-200 mb-8">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pending'
                            ? 'border-emerald-600 text-emerald-700'
                            : 'border-transparent text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        Pending Requests ({pendingAppointments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('confirmed')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'confirmed'
                            ? 'border-emerald-600 text-emerald-700'
                            : 'border-transparent text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        Confirmed & Upcoming ({confirmedAppointments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'history'
                            ? 'border-emerald-600 text-emerald-700'
                            : 'border-transparent text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        History ({historyAppointments.length})
                    </button>
                </div>

                {/* Pending Requests Section */}
                {activeTab === 'pending' && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-stone-800 font-serif mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-600" />
                            Pending Requests
                        </h2>
                        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-100">
                                        <tr>
                                            <th className="px-6 py-3">Patient</th>
                                            <th className="px-6 py-3">Date & Time</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">Notes</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {pendingAppointments.map((appt) => (
                                            <tr key={appt.id} className="hover:bg-stone-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-stone-900">
                                                        {appt.patient?.first_name} {appt.patient?.last_name}
                                                    </div>
                                                    <div className="text-xs text-stone-500">{appt.patient?.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-stone-900">{appt.appointment_date}</div>
                                                    <div className="text-xs text-stone-500">{appt.appointment_time}</div>
                                                </td>
                                                <td className="px-6 py-4 text-stone-600">{appt.type}</td>
                                                <td className="px-6 py-4 text-stone-500 max-w-xs truncate" title={appt.notes}>
                                                    {appt.notes || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                        onClick={() => handleApproveAppointment(appt.id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleRejectAppointment(appt.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingAppointments.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-stone-400">
                                                    No pending appointment requests.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmed Appointments Section */}
                {activeTab === 'confirmed' && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-stone-800 font-serif flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                Confirmed Appointments (Today & Upcoming)
                            </h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchConfirmedAppointments}
                            >
                                Refresh
                            </Button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-100">
                                        <tr>
                                            <th className="px-6 py-3">Patient</th>
                                            <th className="px-6 py-3">Doctor</th>
                                            <th className="px-6 py-3">Date & Time</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {confirmedAppointments.map((appt) => (
                                            <tr key={appt.id} className="hover:bg-stone-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-stone-900">
                                                        {appt.patient?.first_name} {appt.patient?.last_name}
                                                    </div>
                                                    <div className="text-xs text-stone-500">{appt.patient?.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        className="text-sm border-stone-200 rounded-md py-1 pr-8 text-stone-700 focus:ring-emerald-500 focus:border-emerald-500"
                                                        value={appt.practitioner_id || ''}
                                                        onChange={(e) => handleAssignDoctor(appt.id, e.target.value)}
                                                    >
                                                        <option value="">Assign Doctor</option>
                                                        {practitioners.map(doc => (
                                                            <option key={doc.id} value={doc.id}>
                                                                Dr. {doc.first_name} {doc.last_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-stone-900">{appt.appointment_date}</div>
                                                    <div className="text-xs text-stone-500">{appt.appointment_time}</div>
                                                </td>
                                                <td className="px-6 py-4 text-stone-600">{appt.type}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-stone-600 text-white hover:bg-stone-700"
                                                        onClick={() => handleUpdateStatus(appt.id, 'completed')}
                                                    >
                                                        Complete
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                        onClick={() => handleUpdateStatus(appt.id, 'no-show')}
                                                    >
                                                        No Show
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {confirmedAppointments.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-stone-400">
                                                    No confirmed appointments found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Section */}
                {activeTab === 'history' && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-stone-800 font-serif mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-stone-400" />
                            Past Appointments
                        </h2>
                        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-100">
                                        <tr>
                                            <th className="px-6 py-3">Patient</th>
                                            <th className="px-6 py-3">Doctor</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {historyAppointments.map((appt) => (
                                            <tr key={appt.id} className="hover:bg-stone-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-stone-900">
                                                        {appt.patient?.first_name} {appt.patient?.last_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-stone-600">
                                                    {appt.practitioner ? `Dr. ${appt.practitioner.first_name} ${appt.practitioner.last_name}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-stone-600">
                                                    {appt.appointment_date}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${appt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                        appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {appt.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {historyAppointments.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-stone-400">
                                                    No history found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Doctor Availability */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-600" />
                                    Doctor Availability
                                </h3>
                                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    Live
                                </span>
                            </div>
                            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
                                {practitioners.map((doc) => (
                                    <div key={doc.id} className="p-4 hover:bg-stone-50 transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${doc.is_on_duty ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-50' : 'bg-stone-100 text-stone-500'}`}>
                                                    {doc.first_name?.[0]}{doc.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-stone-900 text-sm">Dr. {doc.first_name} {doc.last_name}</h4>
                                                    <p className="text-xs text-stone-500 capitalize">{doc.role}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getDutyStatusColor(doc.is_on_duty)}`}>
                                                {doc.is_on_duty ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {doc.is_on_duty ? 'On Duty' : 'Away'}
                                            </span>
                                        </div>
                                        {doc.is_on_duty && (
                                            <div className="mt-3 pl-13 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setBookingData({ ...bookingData, practitionerId: doc.id })}
                                                    className="text-xs bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition-colors"
                                                >
                                                    Select for Booking
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {practitioners.length === 0 && (
                                    <div className="p-8 text-center text-stone-400 text-sm">
                                        No practitioners found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <span className="block text-2xl font-bold text-blue-800 mb-1">{patients.length}</span>
                                <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Patients</span>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <span className="block text-2xl font-bold text-amber-800 mb-1">{practitioners.filter(p => p.is_on_duty).length}</span>
                                <span className="text-xs text-amber-600 font-medium uppercase tracking-wide">Doctors On Duty</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Appointment Booking */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-stone-800 font-serif">Book Appointment</h2>
                                <div className="text-sm text-stone-400">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleBookAppointment} className="space-y-6">

                                    {/* Patient Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-stone-700">Select Patient</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                            <select
                                                name="patientId"
                                                value={bookingData.patientId}
                                                onChange={handleBookingChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500 text-stone-900 bg-white"
                                                required
                                            >
                                                <option value="">Search or select a patient...</option>
                                                {patients.map(p => (
                                                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.phone || 'No phone'})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Doctor & Treatment Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-stone-700">Practitioner</label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                <select
                                                    name="practitionerId"
                                                    value={bookingData.practitionerId}
                                                    onChange={handleBookingChange}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500 text-stone-900 bg-white"
                                                    required
                                                >
                                                    <option value="">Select Doctor...</option>
                                                    {practitioners.map(doc => (
                                                        <option key={doc.id} value={doc.id}>
                                                            Dr. {doc.first_name} {doc.last_name} {doc.is_on_duty ? '(On Duty)' : '(Away)'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-stone-700">Treatment / Visit Type</label>
                                            <select
                                                name="treatmentType"
                                                value={bookingData.treatmentType}
                                                onChange={handleBookingChange}
                                                className="w-full px-4 py-2.5 rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500 text-stone-900 bg-white"
                                            >
                                                <option value="">General Consultation</option>
                                                {treatments.map(t => (
                                                    <option key={t.id} value={t.name}>{t.name} ({t.duration_minutes}m)</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Date & Time Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-stone-700">Date</label>
                                            <Input
                                                type="date"
                                                name="date"
                                                value={bookingData.date}
                                                onChange={handleBookingChange}
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                leftIcon={<Calendar className="w-4 h-4" />}
                                                className="border-stone-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-stone-700">Time</label>
                                            <Input
                                                type="time"
                                                name="time"
                                                value={bookingData.time}
                                                onChange={handleBookingChange}
                                                required
                                                leftIcon={<Clock className="w-4 h-4" />}
                                                className="border-stone-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-stone-700">Notes (Optional)</label>
                                        <textarea
                                            name="notes"
                                            value={bookingData.notes}
                                            onChange={handleBookingChange}
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500 text-stone-900 text-sm resize-none"
                                            placeholder="Patient symptoms or specific requests..."
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
                                            leftIcon={<CheckCircle className="w-4 h-4" />}
                                        >
                                            Confirm Booking
                                        </Button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReceptionistDashboard;
