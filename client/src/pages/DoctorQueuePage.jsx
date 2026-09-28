import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import TokenQueueTable from '../components/token/TokenQueueTable';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConsultationSlip from '../components/consultation/ConsultationSlip';
import usePolling from '../hooks/usePolling';
import { getTodayQueue, updateTokenStatus } from '../api/tokenApi';
import { getPatientTokens } from '../api/patientApi';

const POLL_INTERVAL_MS = 25000;

export default function DoctorQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consultationSlip, setConsultationSlip] = useState(null);

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

  async function handleAdvance(token, status) {
    try {
      const updated = await updateTokenStatus(token._id, status);
      setQueue((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));

      if (status === 'in-progress') {
        openConsultationSlip(updated);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  }

  async function openConsultationSlip(token) {
    let visitNumber = '';
    try {
      const history = await getPatientTokens(token.patient._id);
      visitNumber = history.length;
    } catch (err) {
      // Non-critical -- the slip still opens without a visit count.
    }
    setConsultationSlip({ token, visitNumber });
  }

  function handleDiagnosisChange(tokenId, diagnosis) {
    setQueue((prev) => prev.map((t) => (t._id === tokenId ? { ...t, diagnosis } : t)));
  }

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

        {loading ? (
          <Loader />
        ) : (
          <TokenQueueTable tokens={queue} showActions onAdvance={handleAdvance} onPrint={openConsultationSlip} />
        )}
      </div>

      <Modal
        open={!!consultationSlip}
        onClose={() => setConsultationSlip(null)}
        title="Consultation Slip"
        maxWidthClassName="max-w-3xl"
      >
        {consultationSlip && (
          <ConsultationSlip
            token={consultationSlip.token}
            visitNumber={consultationSlip.visitNumber}
            onClose={() => setConsultationSlip(null)}
            onDiagnosisChange={handleDiagnosisChange}
          />
        )}
      </Modal>
    </Layout>
  );
}
