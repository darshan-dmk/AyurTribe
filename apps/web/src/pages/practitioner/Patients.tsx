import React from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/ui/Button';
import DutyGuard from '../../components/DutyGuard';
import { useNavigate } from 'react-router-dom';

import { GlobalFooter } from '../../components/GlobalFooter';

const Patients = () => {
    const [patients, setPatients] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'patient')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPatients(data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DutyGuard>
            <div className="min-h-screen bg-stone-50 p-8 font-sans flex flex-col">
                <div className="max-w-7xl mx-auto flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <Button variant="ghost" onClick={() => navigate('/practitioner/dashboard')} className="mb-2 -ml-2 text-stone-500">
                                ← Back to Dashboard
                            </Button>
                            <h1 className="text-3xl font-serif font-bold text-stone-800">My Patients</h1>
                            <p className="text-stone-500 mt-1">View and manage detailed patient health records</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 mb-6 flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder="Search patients by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-stone-500">Loading patients...</div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-stone-400" />
                                </div>
                                <h3 className="text-lg font-medium text-stone-900 mb-1">No patients found</h3>
                                <p className="text-stone-500">Try adjusting your search.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-stone-50 border-b border-stone-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Patient</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {filteredPatients.map((patient) => (
                                            <tr key={patient.id} className="hover:bg-stone-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                                                            {patient.first_name?.[0]}{patient.last_name?.[0]}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-stone-900">{patient.first_name} {patient.last_name}</div>
                                                            <div className="text-xs text-stone-500 capitalize">{patient.gender || 'Unknown'} • {patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : '?'} yrs</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-stone-900">{patient.email}</div>
                                                    <div className="text-sm text-stone-500">{patient.phone || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.is_active
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        : 'bg-stone-100 text-stone-800 border border-stone-200'
                                                        }`}>
                                                        {patient.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-emerald-600 hover:text-emerald-900"
                                                        onClick={() => {
                                                            // For now just show toast or nothing as we don't have detail view yet in this file
                                                            console.log('View patient', patient.id);
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                <GlobalFooter className="border-t border-stone-100 bg-white -mx-8 !px-16" />
            </div>
        </DutyGuard>
    );
};

export default Patients;
