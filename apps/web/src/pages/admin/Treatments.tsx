import React from 'react';
import { Activity, Calendar, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

import { supabase } from '../../utils/supabase';
import AddTreatmentModal from '../../components/admin/AddTreatmentModal';

const Treatments = () => {
    const [treatments, setTreatments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

    React.useEffect(() => {
        fetchTreatments();
    }, []);

    const fetchTreatments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('treatments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                // If table doesn't exist yet, we might get an error, fail gracefully or show empty
                console.error('Error fetching treatments:', error);
            } else {
                setTreatments(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Stats
    const totalTreatments = treatments.length;
    const categories = new Set(treatments.map(t => t.category)).size;
    const avgDuration = totalTreatments > 0
        ? Math.round(treatments.reduce((acc, t) => acc + t.duration_minutes, 0) / totalTreatments)
        : 0;

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-800">Treatments & Therapies</h1>
                    <p className="text-stone-500 mt-1">Manage active treatment plans and therapy sessions</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Clock className="w-4 h-4" />}>
                    Add Therapy
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Therapies', value: totalTreatments, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Categories', value: categories, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Avg Duration', value: `${avgDuration}m`, icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-stone-500 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-2xl font-bold text-stone-800 font-serif">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                    <h3 className="font-semibold text-stone-800">Service Catalog</h3>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-stone-500">Loading catalog...</div>
                ) : treatments.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-8 h-8 text-stone-400" />
                        </div>
                        <h3 className="text-lg font-medium text-stone-900 mb-1">No treatments found</h3>
                        <p className="text-stone-500">Add your first therapy service to the catalog.</p>
                        <Button
                            className="mt-4"
                            variant="outline"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            Add Treatment
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {treatments.map((treatment) => (
                            <div key={treatment.id} className="group relative bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-all hover:border-emerald-200">
                                <div className="absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full bg-stone-100 text-stone-600 uppercase tracking-wide">
                                    {treatment.category || 'General'}
                                </div>

                                <h4 className="font-bold text-lg text-stone-800 font-serif mb-2 pr-12">{treatment.name}</h4>
                                <p className="text-stone-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{treatment.description || 'No description provided.'}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                                    <div className="flex items-center text-stone-600 text-sm">
                                        <Clock className="w-4 h-4 mr-1.5 text-emerald-500" />
                                        {treatment.duration_minutes} mins
                                    </div>
                                    <div className="font-semibold text-stone-900">
                                        {treatment.price ? `₹${treatment.price}` : 'Free'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AddTreatmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchTreatments}
            />
        </div>
    );
};

export default Treatments;
