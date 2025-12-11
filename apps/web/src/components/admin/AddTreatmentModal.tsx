import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Sparkles, Clock, Tag, IndianRupee } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../utils/supabase';

interface AddTreatmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddTreatmentModal: React.FC<AddTreatmentModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        duration_minutes: 60,
        price: '',
        description: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('treatments')
                .insert([{
                    name: formData.name,
                    category: formData.category,
                    duration_minutes: parseInt(formData.duration_minutes.toString()),
                    price: formData.price ? parseFloat(formData.price) : null,
                    description: formData.description
                }]);

            if (error) throw error;

            onSuccess();
            onClose();
            // Reset form
            setFormData({
                name: '',
                category: '',
                duration_minutes: 60,
                price: '',
                description: ''
            });

        } catch (error) {
            console.error('Error adding treatment:', error);
            alert('Failed to add treatment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all border border-stone-100">
                                <form onSubmit={handleSubmit}>
                                    {/* Header */}
                                    <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <Dialog.Title as="h3" className="text-lg font-bold text-stone-900 font-serif">
                                                Add New Treatment
                                            </Dialog.Title>
                                        </div>
                                        <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-full hover:bg-stone-200/50">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 space-y-4">
                                        <Input
                                            label="Treatment Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="ex: Abhyanga Massage"
                                            className="border-stone-200 focus:border-emerald-500 rounded-lg"
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
                                                <div className="relative">
                                                    <Tag className="absolute left-3 top-3 w-4 h-4 text-stone-400 pointer-events-none" />
                                                    <select
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full pl-9 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                                    >
                                                        <option value="">Select Category</option>
                                                        <option value="Rejuvenation">Rejuvenation</option>
                                                        <option value="Detoxification">Detoxification</option>
                                                        <option value="Therapeutic">Therapeutic</option>
                                                        <option value="Beauty Care">Beauty Care</option>
                                                        <option value="Consultation">Consultation</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <Input
                                                label="Duration (mins)"
                                                type="number"
                                                name="duration_minutes"
                                                value={formData.duration_minutes}
                                                onChange={handleChange}
                                                required
                                                min={1}
                                                leftIcon={<Clock className="w-4 h-4" />}
                                                className="border-stone-200 focus:border-emerald-500 rounded-lg"
                                            />
                                        </div>

                                        <Input
                                            label="Price (Optional)"
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            step="0.01"
                                            placeholder="0.00"
                                            leftIcon={<IndianRupee className="w-4 h-4" />}
                                            className="border-stone-200 focus:border-emerald-500 rounded-lg"
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm resize-none"
                                                placeholder="Brief description of the therapy..."
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
                                        <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                                        <Button type="submit" isLoading={loading} rightIcon={<Plus className="w-4 h-4" />}>
                                            Add Treatment
                                        </Button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddTreatmentModal;
