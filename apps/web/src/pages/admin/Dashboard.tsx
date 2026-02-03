import { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import {
  Users, Calendar,
  TrendingUp, AlertCircle, Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { supabase } from "../../utils/supabase";

interface KPI {
  therapistUtilizationPct: number;
  noShowRatePct: number;
  avgSessionMinutes: number;
  upcomingCount: number;
  utilizationByTherapist: { name: string; pct: number }[];
  recentAppointments: {
    id: string;
    patientName: string;
    procedure: string;
    startTime: string;
    practitioner: string;
    status: "scheduled" | "completed" | "no-show" | "cancelled";
  }[];
}

const MOCK_DATA: KPI = {
  therapistUtilizationPct: 68,
  noShowRatePct: 7,
  avgSessionMinutes: 47,
  upcomingCount: 12,
  utilizationByTherapist: [
    { name: "Dr. Meera", pct: 82 },
    { name: "Therapist Ravi", pct: 73 },
    { name: "Therapist Sita", pct: 56 },
    { name: "Therapist Arjun", pct: 45 }
  ],
  recentAppointments: [
    {
      id: "apt_1001",
      patientName: "Asha Rao",
      procedure: "Abhyanga",
      startTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      practitioner: "Therapist Ravi",
      status: "scheduled"
    },
    {
      id: "apt_1000",
      patientName: "Ramesh K",
      procedure: "Pizhichil",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      practitioner: "Dr. Meera",
      status: "completed"
    },
    {
      id: "apt_0998",
      patientName: "Sunita P",
      procedure: "Shirodhara",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      practitioner: "Therapist Sita",
      status: "no-show"
    }
  ]
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<KPI | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<string>("All Centers");
  const [error, setError] = useState<string | null>(null);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(true);

  // Load real data from Supabase
  useEffect(() => {
    loadRealAppointments();

    // Real-time subscription for all appointments
    const appointmentChannel = supabase
      .channel('admin-appointment-feed')
      .on('postgres_changes' as any, {
        event: '*',
        table: 'appointments'
      }, (payload: any) => {
        console.log('[Admin Dashboard] Appointment update:', payload);
        loadRealAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentChannel);
    };
  }, []);

  const loadRealAppointments = async () => {
    setMetricsLoading(true);
    try {
      // 1. Fetch appointments with patient details
      const { data: aptData, error: aptError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          type,
          status,
          user:users!patient_id(first_name, last_name),
          practitioner:users!practitioner_id(first_name, last_name)
        `)
        .order('appointment_date', { ascending: false })
        .limit(10);

      if (aptError) throw aptError;

      // 2. Fetch some basic stats
      const { count: upcomingCount } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString().split('T')[0]);

      const formattedApts = (aptData || []).map((apt: any) => {
        const u: any = apt.user;
        const p: any = apt.practitioner;
        return {
          id: apt.id,
          patientName: `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || 'Unknown',
          procedure: apt.type || 'Consultation',
          startTime: `${apt.appointment_date}T${apt.appointment_time}`,
          practitioner: p
            ? `Dr. ${p.first_name || ''} ${p.last_name || ''}`.trim()
            : 'Pending',
          status: apt.status as any
        };
      });

      setMetrics({
        ...MOCK_DATA, // Use mock for other KPIs for now
        upcomingCount: upcomingCount || 0,
        recentAppointments: formattedApts
      });
    } catch (err) {
      console.error("Error loading real appointments:", err);
      setMetrics(MOCK_DATA);
    } finally {
      setMetricsLoading(false);
    }
  };

  const loadMetrics = async () => {
    // Keep this for future REST API calls if needed
    loadRealAppointments();
  };

  // Auth is handled by ProtectedRoute, so we don't need to check here
  // But we show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      {/* Header removed: handled by AdminLayout */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Controls & Title */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Dashboard Overview</h2>
            <p className="text-stone-500 mt-1">Real-time insights into clinic performance and utilization.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow cursor-pointer shadow-sm hover:border-emerald-200"
              >
                <option>All Centers</option>
                <option>Delhi - AIIA Clinic</option>
                <option>Bengaluru - Center B</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                <Filter className="w-4 h-4" />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setMetrics(null);
                loadMetrics();
              }}
              className="bg-white"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            {error}
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Therapist Utilization"
            value={`${metrics?.therapistUtilizationPct ?? 0}%`}
            trend="+2.4%"
            trendUp={true}
            icon={Users}
            color="blue"
          />
          <KPICard
            title="No-show Rate"
            value={`${metrics?.noShowRatePct ?? 0}%`}
            trend="-1.2%"
            trendUp={false} // good for this metric
            inverse={true} // Lower is better
            icon={AlertCircle}
            color="rose"
          />
          <KPICard
            title="Avg Session Time"
            value={`${metrics?.avgSessionMinutes ?? 0}m`}
            trend="+5m"
            trendUp={true}
            icon={ClockIcon}
            color="amber"
          />
          <KPICard
            title="Today's Bookings"
            value={metrics?.upcomingCount ?? 0}
            trend="On Track"
            trendUp={true}
            icon={Calendar}
            color="emerald"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Recent Appointments</h3>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold mt-1">Live Feed</p>
              </div>
              <Button variant="ghost" size="sm" className="text-stone-400 hover:text-emerald-700">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Therapy</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Practitioner</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(metrics?.recentAppointments || []).map((apt) => (
                    <tr key={apt.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-stone-900">{apt.patientName}</div>
                        <div className="text-xs text-stone-400">ID: {apt.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{apt.procedure}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{apt.practitioner}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                        {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={apt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!metrics || metrics.recentAppointments.length === 0) && (
                <div className="p-8 text-center text-stone-500 bg-stone-50/30">
                  No appointments found.
                </div>
              )}
            </div>
          </div>

          {/* Utilization Bars */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-stone-900">Therapist Workload</h3>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold mt-1">Resource Utilization</p>
            </div>

            <div className="space-y-6">
              {(metrics?.utilizationByTherapist || []).map((u, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-stone-700">{u.name}</span>
                    <span className="text-xs font-bold text-stone-900">{u.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${u.pct > 80 ? 'bg-amber-500' :
                        u.pct > 60 ? 'bg-emerald-500' :
                          'bg-blue-400'
                        }`}
                      style={{ width: `${u.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100">
              <div className="flex items-center gap-4 text-xs text-stone-500 justify-center">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Optimal</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Heavy</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div>Light</div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

// --- Subcomponents ---

function KPICard({ title, value, trend, trendUp, icon: Icon, color, inverse = false }: any) {
  const isPositive = inverse ? !trendUp : trendUp;
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
            }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-stone-900 mb-1">{value}</div>
      <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest">{title}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: "scheduled" | "completed" | "no-show" | "cancelled" }) {
  const styles = {
    scheduled: "bg-blue-50 text-blue-700 border-blue-100",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    "no-show": "bg-rose-50 text-rose-700 border-rose-100",
    cancelled: "bg-stone-100 text-stone-600 border-stone-200"
  };

  const labels = {
    scheduled: "Scheduled",
    completed: "Completed",
    "no-show": "No Show",
    cancelled: "Cancelled"
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${styles[status] || styles.scheduled}`}>
      {labels[status]}
    </span>
  );
}

// Icon wrapper for clock since it's used in mock data but was missing import in my head
const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
