import { useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import DataTable, { EmptyState } from '../common/DataTable';
import Pagination from '../common/Pagination';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

const PAGE_SIZE = 10;

function formatEye(eye) {
  if (!eye) return '-';
  const parts = [eye.sph, eye.cyl, eye.axis].filter(Boolean);
  return parts.length ? parts.join(' / ') : '-';
}

export default function GlassesSuggestionsTable({
  suggestions,
  onView,
  onEdit,
  onDelete,
  showPatient = false,
  emptyMessage,
}) {
  const [page, setPage] = useState(1);

  if (suggestions.length === 0) {
    return <EmptyState message={emptyMessage || 'No glasses suggestions found.'} />;
  }

  const pageCount = Math.ceil(suggestions.length / PAGE_SIZE);
  const currentPage = Math.min(page, pageCount);
  const pageItems = suggestions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <DataTable>
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
            {showPatient && (
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Patient
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Right Eye
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Left Eye
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Lens Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cost</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {pageItems.map((s) => (
            <tr
              key={s._id}
              className="cursor-pointer transition-colors duration-150 hover:bg-sky-50/40"
              onClick={() => onView(s)}
            >
              <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                {new Date(s.createdAt).toLocaleDateString()}
              </td>
              {showPatient && (
                <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                  {s.patient?.fullName}
                  <span className="ml-1 text-xs text-gray-400">({s.patient?.mrNumber})</span>
                </td>
              )}
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatEye(s.rightEye)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatEye(s.leftEye)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">{s.lensType || '-'}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge status={s.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                {s.cost != null ? `Rs ${Number(s.cost).toLocaleString()}` : '-'}
              </td>
              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" icon={Eye} onClick={() => onView(s)}>
                    View
                  </Button>
                  {onEdit && s.status === 'suggested' && (
                    <Button variant="secondary" icon={Pencil} onClick={() => onEdit(s)}>
                      Edit
                    </Button>
                  )}
                  {onDelete && s.status === 'suggested' && (
                    <Button variant="danger" icon={Trash2} onClick={() => onDelete(s)}>
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      <Pagination
        page={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
        totalItems={suggestions.length}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
