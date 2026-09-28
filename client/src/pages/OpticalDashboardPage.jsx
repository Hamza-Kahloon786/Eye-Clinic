import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Glasses, Play, CheckCircle2, XCircle, Clock3, Wallet } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import { getOpticalStats } from '../api/glassesApi';

const TILE_COLORS = {
  sky: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
  gray: 'bg-gray-100 text-gray-600',
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

export default function OpticalDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOpticalStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const counts = stats?.statusCounts || {};

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Optical Desk</h1>
        <p className="text-sm text-gray-500">{today}</p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatTile
              icon={Wallet}
              label="Total Revenue (Completed)"
              value={`Rs ${Number(stats?.totalRevenue || 0).toLocaleString()}`}
              color="emerald"
            />
            <StatTile icon={Glasses} label="Suggested" value={counts.suggested || 0} color="purple" />
            <StatTile icon={Play} label="In Progress" value={counts['in-progress'] || 0} color="sky" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatTile icon={CheckCircle2} label="Completed" value={counts.completed || 0} color="emerald" />
            <StatTile icon={Clock3} label="Delayed" value={counts.delayed || 0} color="amber" />
            <StatTile icon={XCircle} label="Cancelled" value={counts.cancelled || 0} color="gray" />
          </div>
        </>
      )}
    </Layout>
  );
}
