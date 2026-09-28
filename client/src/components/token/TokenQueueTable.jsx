import { useNavigate } from 'react-router-dom';
import { Eye, Printer, Play, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import DataTable, { EmptyState } from '../common/DataTable';

export default function TokenQueueTable({ tokens, showActions = false, onAdvance, onPrint }) {
  const navigate = useNavigate();

  if (tokens.length === 0) {
    return <EmptyState message="No tokens generated yet today." />;
  }

  return (
    <DataTable>
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Token #</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Patient</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            Age / Gender
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
          <th className="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {tokens.map((t) => (
          <tr key={t._id} className="transition-colors duration-150 hover:bg-sky-50/40">
            <td className="px-4 py-3 text-lg font-bold text-sky-700">{t.tokenNumber}</td>
            <td className="px-4 py-3 text-gray-900">{t.patient.fullName}</td>
            <td className="px-4 py-3 text-gray-600">
              {t.patient.age} / {t.patient.gender}
            </td>
            <td className="px-4 py-3 text-gray-600">{t.patient.phone}</td>
            <td className="px-4 py-3 text-gray-600">
              {new Date(t.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={t.status} />
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="secondary" icon={Eye} onClick={() => navigate(`/patients/${t.patient._id}`)}>
                  View
                </Button>
                {onPrint && (
                  <Button variant="secondary" icon={Printer} onClick={() => onPrint(t)}>
                    Print
                  </Button>
                )}
                {showActions && t.status === 'waiting' && (
                  <Button variant="primary" icon={Play} onClick={() => onAdvance(t, 'in-progress')}>
                    Start
                  </Button>
                )}
                {showActions && t.status === 'in-progress' && (
                  <Button variant="success" icon={CheckCircle2} onClick={() => onAdvance(t, 'done')}>
                    Complete
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
