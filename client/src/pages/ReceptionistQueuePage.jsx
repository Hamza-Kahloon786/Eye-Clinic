import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import TokenQueueTable from '../components/token/TokenQueueTable';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import usePolling from '../hooks/usePolling';
import { getTodayQueue } from '../api/tokenApi';

const POLL_INTERVAL_MS = 25000;

export default function ReceptionistQueuePage() {
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

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Layout>
      <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Today's Queue</h1>
            <p className="text-sm text-gray-500">{today}</p>
          </div>
          <Button variant="secondary" icon={RefreshCw} onClick={loadQueue}>
            Refresh
          </Button>
        </div>

        {loading ? <Loader /> : <TokenQueueTable tokens={queue} />}
      </div>
    </Layout>
  );
}
