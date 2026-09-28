import { FolderOpen } from 'lucide-react';
import DataTable, { EmptyState } from '../common/DataTable';
import Button from '../common/Button';

export default function PatientRecordsSummaryTable({ groups, onSelectPatient }) {
  if (groups.length === 0) {
    return <EmptyState message="No clinical records found." />;
  }

  return (
    <DataTable>
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            Unique ID
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            Age / Gender
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            Records
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            Last Visit
          </th>
          <th className="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {groups.map((g) => (
          <tr
            key={g.patient._id}
            className="cursor-pointer transition-colors duration-150 hover:bg-sky-50/40"
            onClick={() => onSelectPatient(g.patient)}
          >
            <td className="whitespace-nowrap px-4 py-3 font-semibold text-sky-700">{g.patient.mrNumber}</td>
            <td className="whitespace-nowrap px-4 py-3 text-gray-900">{g.patient.fullName}</td>
            <td className="whitespace-nowrap px-4 py-3 text-gray-600">
              {g.patient.age} / {g.patient.gender}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{g.patient.phone}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
                {g.recordCount} {g.recordCount === 1 ? 'record' : 'records'}
              </span>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{g.lastVisitDate}</td>
            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" icon={FolderOpen} onClick={() => onSelectPatient(g.patient)}>
                Open
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
