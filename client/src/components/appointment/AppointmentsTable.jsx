import { CheckCircle2, XCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import DataTable, { EmptyState } from '../common/DataTable';

export default function AppointmentsTable({ appointments, onCheckIn, onCancel }) {
  if (appointments.length === 0) {
    return <EmptyState message="No appointments for this date." />;
  }

  return (
    <DataTable>
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Patient</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
          <th className="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {appointments.map((a) => (
          <tr key={a._id} className="transition-colors duration-150 hover:bg-sky-50/40">
            <td className="px-4 py-3 font-semibold text-sky-700">{a.scheduledTime}</td>
            <td className="px-4 py-3 text-gray-900">{a.patient.fullName}</td>
            <td className="px-4 py-3 text-gray-600">{a.patient.phone}</td>
            <td className="px-4 py-3 text-gray-600">{a.notes || '-'}</td>
            <td className="px-4 py-3">
              <StatusBadge status={a.status} />
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap justify-end gap-2">
                {a.status === 'scheduled' && (
                  <>
                    <Button variant="primary" icon={CheckCircle2} onClick={() => onCheckIn(a)}>
                      Check In
                    </Button>
                    <Button variant="danger" icon={XCircle} onClick={() => onCancel(a)}>
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
