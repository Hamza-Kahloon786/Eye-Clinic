import { UserPlus } from 'lucide-react';
import Button from '../common/Button';
import DataTable, { EmptyState } from '../common/DataTable';

export default function PatientSearchResults({ patients, onSelect }) {
  if (patients.length === 0) {
    return <EmptyState message="No matching patients found." />;
  }

  return (
    <DataTable>
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            MR Number
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            Age / Gender
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
          <th className="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {patients.map((p) => (
          <tr key={p._id} className="transition-colors duration-150 hover:bg-sky-50/40">
            <td className="px-4 py-3 font-mono text-xs text-gray-700">{p.mrNumber}</td>
            <td className="px-4 py-3 text-gray-900">{p.fullName}</td>
            <td className="px-4 py-3 text-gray-600">
              {p.age} / {p.gender}
            </td>
            <td className="px-4 py-3 text-gray-600">{p.phone}</td>
            <td className="px-4 py-3 text-right">
              <Button variant="secondary" icon={UserPlus} onClick={() => onSelect(p)}>
                Select
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
