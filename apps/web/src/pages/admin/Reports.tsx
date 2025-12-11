import React from 'react';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const Reports = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-800">Analytics & Reports</h1>
                    <p className="text-stone-500 mt-1">Insights into clinic performance</p>
                </div>
                <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export Data</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-stone-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            Patient Growth
                        </h3>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12% this month</span>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-stone-50 rounded-lg border border-stone-100 border-dashed">
                        <p className="text-stone-400 text-sm">Chart Visualization Placeholder</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-stone-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-amber-600" />
                            Revenue Statistics
                        </h3>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-stone-50 rounded-lg border border-stone-100 border-dashed">
                        <p className="text-stone-400 text-sm">Chart Visualization Placeholder</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
