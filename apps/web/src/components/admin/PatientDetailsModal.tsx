import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, User, Phone, Mail, MapPin, Calendar, Activity, Heart, Shield } from 'lucide-react';
import { Button } from '../ui/Button';

interface PatientDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: any; // Using any for now to match rapid dev, ideally strictly typed
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
    isOpen,
    onClose,
    patient
}) => {
    const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'emergency'>('personal');

    if (!patient) return null;

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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all border border-stone-100">
                                {/* Header */}
                                <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg border border-emerald-200">
                                            {patient.first_name?.[0]}{patient.last_name?.[0]}
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-bold text-stone-900 font-serif">
                                                {patient.first_name} {patient.last_name}
                                            </Dialog.Title>
                                            <p className="text-sm text-stone-500 flex items-center gap-2">
                                                <span className={`inline-block w-2 h-2 rounded-full ${patient.is_active ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                                                {patient.is_active ? 'Active Patient' : 'Inactive'}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-full hover:bg-stone-200/50">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="border-b border-stone-100 px-6 flex gap-6">
                                    <button
                                        onClick={() => setActiveTab('personal')}
                                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                                    >
                                        Personal Info
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('emergency')}
                                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'emergency' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                                    >
                                        Emergency Contact
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('medical')}
                                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'medical' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                                    >
                                        Health Context
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 min-h-[300px]">
                                    {activeTab === 'personal' && (
                                        <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Email</label>
                                                <div className="flex items-center gap-2 text-stone-700">
                                                    <Mail className="w-4 h-4 text-emerald-500/70" />
                                                    {patient.email}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Phone</label>
                                                <div className="flex items-center gap-2 text-stone-700">
                                                    <Phone className="w-4 h-4 text-emerald-500/70" />
                                                    {patient.phone || 'Not provided'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Date of Birth</label>
                                                <div className="flex items-center gap-2 text-stone-700">
                                                    <Calendar className="w-4 h-4 text-emerald-500/70" />
                                                    {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Not provided'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Gender</label>
                                                <div className="flex items-center gap-2 text-stone-700 capitalize">
                                                    <User className="w-4 h-4 text-emerald-500/70" />
                                                    {patient.gender || 'Not specified'}
                                                </div>
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Address</label>
                                                <div className="flex items-start gap-2 text-stone-700">
                                                    <MapPin className="w-4 h-4 text-emerald-500/70 mt-0.5" />
                                                    {patient.address || 'No address on file'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'emergency' && (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                                                <Shield className="w-5 h-5 text-red-500 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-red-900 text-sm">Primary Emergency Contact</h4>
                                                    <p className="text-red-700/80 text-sm mt-1">In case of medical emergency, contact this person immediately.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Contact Name</label>
                                                    <div className="text-stone-700 font-medium">{patient.emergency_name || 'Not provided'}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Relationship</label>
                                                    <div className="text-stone-700 font-medium">{patient.emergency_relation || 'Not specified'}</div>
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Emergency Phone</label>
                                                    <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
                                                        <Phone className="w-5 h-5 text-red-500" />
                                                        {patient.emergency_contact || 'Not provided'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'medical' && (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Occupation</label>
                                                    <div className="text-stone-700">{patient.occupation || 'Not provided'}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Activity Level</label>
                                                    <div className="text-stone-700 capitalize flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-emerald-500" />
                                                        {patient.exercise_frequency || 'Not specified'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-stone-100 pt-4">
                                                <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                                                    <Heart className="w-4 h-4 text-red-500" /> Habits
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                                                        <span className="text-xs text-stone-500 block mb-1">Smoking</span>
                                                        <span className="font-medium text-stone-800 capitalize">{patient.smoking_status || 'Unknown'}</span>
                                                    </div>
                                                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                                                        <span className="text-xs text-stone-500 block mb-1">Alcohol</span>
                                                        <span className="font-medium text-stone-800 capitalize">{patient.alcohol_consumption || 'Unknown'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex justify-end">
                                    <Button variant="outline" onClick={onClose}>Close</Button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default PatientDetailsModal;
