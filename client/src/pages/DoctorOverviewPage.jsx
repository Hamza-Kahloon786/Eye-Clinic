import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Stethoscope,
  CalendarClock,
  Wallet,
  TrendingDown,
  AlertTriangle,
  Users,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import { getDashboardStats } from '../api/statsApi';

const QUEUE_COLORS = { waiting: '#f59e0b', 'in-progress': '#0ea5e9', done: '#10b981' };
const APPOINTMENT_COLORS = { scheduled: '#0ea5e9', 'checked-in': '#10b981', cancelled: '#ef4444' };

const TILE_COLORS = {
  sky: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
};

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200/70 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${TILE_COLORS[color]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, actions, children }) {
  return (
    <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        </div>
        {actions}
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

function RangeToggle({ value, onChange, options }) {
  return (
    <div className="flex rounded-md border border-gray-200 p-0.5 text-xs">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded px-2 py-1 font-medium transition-colors duration-150 ${
            value === opt.value ? 'bg-sky-600 text-white' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function formatShortDate(dateStr) {
  const [, month, day] = dateStr.split('-');
  return `${month}/${day}`;
}

const QUEUE_RANGE_OPTIONS = [
  { value: 1, label: 'Today' },
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' },
];

function lastNDates(n) {
  const dates = [];
  for (let i = 0; i < n; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  }
  return new Set(dates);
}

export default function DoctorOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queueRangeDays, setQueueRangeDays] = useState(1);

  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        setStats(data);
        if (data.lowStockMedicines?.length > 0) {
          toast.error(
            `${data.lowStockMedicines.length} medicine${data.lowStockMedicines.length === 1 ? '' : 's'} low on stock`
          );
        }
      })
      .catch(() => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  const queueStatusForRange = useMemo(() => {
    const totals = { waiting: 0, 'in-progress': 0, done: 0 };
    if (!stats?.queueStatusByDay) return totals;

    const allowedDates = lastNDates(queueRangeDays);
    stats.queueStatusByDay.forEach(({ date, status, count }) => {
      if (allowedDates.has(date)) {
        totals[status] = (totals[status] || 0) + count;
      }
    });
    return totals;
  }, [stats, queueRangeDays]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <p className="text-sm text-gray-500">Unable to load dashboard.</p>
      </Layout>
    );
  }

  const patientsPerDay = stats.patientsPerDay.map((d) => ({ ...d, label: formatShortDate(d.date) }));

  const queueStatusChartData = Object.entries(queueStatusForRange).map(([status, count]) => ({
    status,
    count,
  }));
  const queueRangeLabel = QUEUE_RANGE_OPTIONS.find((opt) => opt.value === queueRangeDays)?.label || 'Today';

  const topDiagnoses = stats.topDiagnoses;

  const appointmentsSummary = Object.entries(stats.appointmentsSummary).map(([status, count]) => ({
    status,
    count,
  }));

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Doctor Dashboard</h1>
        <p className="text-sm text-gray-500">{today}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={Users}
          label="Patients Today"
          value={Object.values(stats.queueStatusToday || {}).reduce((sum, n) => sum + n, 0)}
          color="purple"
        />
        <StatTile
          icon={Wallet}
          label="Pharmacy Revenue Today"
          value={`Rs ${Number(stats.pharmacyRevenueToday || 0).toLocaleString()}`}
          color="emerald"
        />
        <StatTile
          icon={TrendingDown}
          label="Total Pharmacy Revenue"
          value={`Rs ${Number(stats.pharmacyRevenueTotal || 0).toLocaleString()}`}
          color="sky"
        />
        <StatTile
          icon={AlertTriangle}
          label="Low Stock Medicines"
          value={stats.lowStockMedicines?.length || 0}
          color={stats.lowStockMedicines?.length > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {stats.lowStockMedicines?.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            Low Stock Alerts
          </h2>
          <ul className="flex flex-col gap-2">
            {stats.lowStockMedicines.map((m) => (
              <li
                key={m._id}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
              >
                <span className="font-medium text-gray-900">{m.name}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    m.stockQuantity === 0
                      ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200'
                      : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                  }`}
                >
                  {m.stockQuantity} left (alert at {m.lowStockThreshold})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Patients Seen (Last 14 Days)" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={patientsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Patients" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={`Queue Status (${queueRangeLabel})`}
          icon={PieChartIcon}
          actions={<RangeToggle value={queueRangeDays} onChange={setQueueRangeDays} options={QUEUE_RANGE_OPTIONS} />}
        >
          {queueStatusChartData.every((d) => d.count === 0) ? (
            <p className="flex h-full items-center justify-center text-sm text-gray-500">
              No tokens generated in this period.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={queueStatusChartData} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80}>
                  {queueStatusChartData.map((entry) => (
                    <Cell key={entry.status} fill={QUEUE_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top Diagnoses" icon={Stethoscope}>
          {topDiagnoses.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-gray-500">
              No diagnoses recorded yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDiagnoses} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="diagnosis" tick={{ fontSize: 12 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" name="Cases" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Appointments (Last 14 Days)" icon={CalendarClock}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={appointmentsSummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Appointments" radius={[4, 4, 0, 0]}>
                {appointmentsSummary.map((entry) => (
                  <Cell key={entry.status} fill={APPOINTMENT_COLORS[entry.status] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </Layout>
  );
}
