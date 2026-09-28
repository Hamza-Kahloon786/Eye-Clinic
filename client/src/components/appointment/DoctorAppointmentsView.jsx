import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import Loader from '../common/Loader';
import DataTable, { EmptyState } from '../common/DataTable';
import usePolling from '../../hooks/usePolling';
import { getAppointments } from '../../api/appointmentApi';
import { getTodayDateString } from '../../utils/dateUtils';

const POLL_INTERVAL_MS = 25000;

function timeToTodayTimestamp(hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

function buildRows(appointments, queue) {
  const linkedTokenIds = new Set(appointments.filter((a) => a.token).map((a) => a.token._id));

  const appointmentRows = appointments.map((a) => {
    if (a.status === 'checked-in' && a.token) {
      return {
        key: a._id,
        timestamp: new Date(a.token.generatedAt).getTime(),
        patient: a.patient,
        type: 'Scheduled',
        status: a.token.status,
      };
    }
    return {
      key: a._id,
      timestamp: timeToTodayTimestamp(a.scheduledTime),
      patient: a.patient,
      type: 'Scheduled',
      status: a.status,
    };
  });

  const walkInRows = queue
    .filter((t) => !linkedTokenIds.has(t._id))
    .map((t) => ({
      key: t._id,
      timestamp: new Date(t.generatedAt).getTime(),
      patient: t.patient,
      type: 'Walk-in',
      status: t.status,
    }));

  return [...appointmentRows, ...walkInRows].sort((a, b) => a.timestamp - b.timestamp);
}

export default function DoctorAppointmentsView({ queue }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    try {
      const data = await getAppointments(getTodayDateString());
      setAppointments(data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  usePolling(loadAppointments, POLL_INTERVAL_MS);

  if (loading) {
    return <Loader />;
  }

  const rows = buildRows(appointments, queue);

  if (rows.length === 0) {
    return <EmptyState message="No appointments or tokens for today yet." />;
  }

  return (
    <DataTable>
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Patient</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            Age / Gender
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
          <th className="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {rows.map((row) => (
          <tr key={row.key} className="transition-colors duration-150 hover:bg-sky-50/40">
            <td className="px-4 py-3 text-gray-600">
              {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </td>
            <td className="px-4 py-3 text-gray-900">{row.patient.fullName}</td>
            <td className="px-4 py-3 text-gray-600">
              {row.patient.age} / {row.patient.gender}
            </td>
            <td className="px-4 py-3 text-gray-600">{row.patient.phone}</td>
            <td className="px-4 py-3 text-gray-600">{row.type}</td>
            <td className="px-4 py-3">
              <StatusBadge status={row.status} />
            </td>
            <td className="px-4 py-3 text-right">
              <Button variant="secondary" icon={Eye} onClick={() => navigate(`/patients/${row.patient._id}`)}>
                View
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
