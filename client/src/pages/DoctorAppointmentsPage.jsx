import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import DoctorAppointmentsView from '../components/appointment/DoctorAppointmentsView';
import usePolling from '../hooks/usePolling';
import { getTodayQueue } from '../api/tokenApi';

const POLL_INTERVAL_MS = 25000;

export default function DoctorAppointmentsPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    try {
      const data = await getTodayQueue();
      setQueue(data);
    } catch (err) {
      toast.error('Failed to load today\'s queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  usePolling(loadQueue, POLL_INTERVAL_MS);

  return (
    <Layout>
      <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <h1 className="mb-4 text-lg font-semibold text-gray-900">Appointments</h1>
        {loading ? <Loader /> : <DoctorAppointmentsView queue={queue} />}
      </div>
    </Layout>
  );
}
