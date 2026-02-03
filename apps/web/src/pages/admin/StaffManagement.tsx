import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserPlus, Save, CheckCircle, Mail, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService, supabase } from '../../utils/supabase';

const StaffManagement = () => {
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'receptionist' as 'receptionist' | 'practitioner'
    });

    React.useEffect(() => {
        fetchStaff();

        // Realtime subscription for staff duty status
        const staffChannel = supabase
            .channel('admin-staff-status')
            .on('postgres_changes' as any, {
                event: 'UPDATE',
                table: 'users'
            }, (payload: any) => {
                // If the updated user is in our list, update them
                setStaffList(prev => prev.map(staff =>
                    staff.id === payload.new.id ? { ...staff, ...payload.new } : staff
                ));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(staffChannel);
        };
    }, []);

    const fetchStaff = async () => {
        try {
            setFetching(true);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .in('role', ['practitioner', 'receptionist', 'admin'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStaffList(data || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error('Failed to load staff list');
        } finally {
            setFetching(false);
        }
    };

    const handleToggleDuty = async (userId: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setStaffList(prev => prev.map(staff =>
                staff.id === userId ? { ...staff, is_on_duty: !currentStatus } : staff
            ));

            const { error } = await supabase
                .from('users')
                .update({ is_on_duty: !currentStatus })
                .eq('id', userId);

            if (error) throw error;
            toast.success(`Status updated to ${!currentStatus ? 'On Duty' : 'Off Duty'}`);
        } catch (error) {
            console.error('Error toggling duty:', error);
            toast.error('Failed to update status');
            // Revert on error
            setStaffList(prev => prev.map(staff =>
                staff.id === userId ? { ...staff, is_on_duty: currentStatus } : staff
            ));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            const token = (await authService.getCurrentSession())?.access_token;
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/admin/create-staff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create staff member');
            }

            toast.success(
                <div>
                    <b>Staff Created Successfully!</b>
                    <div className="text-xs opacity-90 mt-1">Credentials sent to {formData.email}</div>
                </div>
            );

            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'receptionist'
            });

            // Refresh list
            fetchStaff();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create staff member.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-800">Staff Management</h1>
                    <p className="text-stone-500 mt-1">Manage clinic staff access and duty status</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Staff List Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-stone-800">Staff Directory</h3>
                            <span className="text-xs font-medium px-2 py-1 bg-white border border-stone-200 rounded-full text-stone-500">
                                {staffList.length} Members
                            </span>
                        </div>

                        {fetching ? (
                            <div className="p-12 text-center text-stone-500">Loading staff...</div>
                        ) : staffList.length === 0 ? (
                            <div className="p-12 text-center text-stone-500">
                                No staff members found. Add one on the right.
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-100">
                                {staffList.map((staff) => (
                                    <div key={staff.id} className="p-4 hover:bg-stone-50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold border border-stone-200">
                                                {staff.first_name?.[0]}{staff.last_name?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-stone-900">{staff.first_name} {staff.last_name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-stone-500">
                                                    <span className="capitalize bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">{staff.role}</span>
                                                    <span>•</span>
                                                    <span>{staff.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-xs font-medium uppercase tracking-wider mb-1 ${staff.is_on_duty ? 'text-emerald-600' : 'text-stone-400'}`}>
                                                    {staff.is_on_duty ? 'On Duty' : 'Off Duty'}
                                                </span>
                                                <button
                                                    onClick={() => handleToggleDuty(staff.id, staff.is_on_duty)}
                                                    className={`
                                                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                                                        ${staff.is_on_duty ? 'bg-emerald-500' : 'bg-stone-200'}
                                                    `}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className={`
                                                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                                            ${staff.is_on_duty ? 'translate-x-5' : 'translate-x-0'}
                                                        `}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Staff Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                            <h2 className="font-bold text-stone-800 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-emerald-600" />
                                Add Staff Member
                            </h2>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Priya"
                                    />
                                    <Input
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Sharma"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Role</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`
                                            cursor-pointer flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all
                                            ${formData.role === 'receptionist'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                                : 'border-stone-100 hover:border-stone-200 text-stone-500'
                                            }
                                        `}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="receptionist"
                                                checked={formData.role === 'receptionist'}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <User className="w-5 h-5" />
                                            <span className="text-xs font-medium">Receptionist</span>
                                        </label>

                                        <label className={`
                                            cursor-pointer flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all
                                            ${formData.role === 'practitioner'
                                                ? 'border-amber-500 bg-amber-50 text-amber-800'
                                                : 'border-stone-100 hover:border-stone-200 text-stone-500'
                                            }
                                        `}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="practitioner"
                                                checked={formData.role === 'practitioner'}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <Shield className="w-5 h-5" />
                                            <span className="text-xs font-medium">Practitioner</span>
                                        </label>
                                    </div>
                                </div>

                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="staff@ayurtribe.com"
                                    leftIcon={<Mail className="w-4 h-4" />}
                                />

                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                />

                                <Button
                                    type="submit"
                                    className="w-full mt-2"
                                    isLoading={loading}
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    Create Account
                                </Button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-900 text-xs">
                        <h4 className="font-bold flex items-center gap-2 mb-1">
                            <Shield className="w-3 h-3" />
                            Security Note
                        </h4>
                        Staff members will receive an email verification link. They must verify their email before accessing the system.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;
