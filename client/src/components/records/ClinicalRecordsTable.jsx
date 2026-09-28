import { useState } from 'react';
import { Eye, Printer, Download, Trash2 } from 'lucide-react';
import DataTable, { EmptyState } from '../common/DataTable';
import Pagination from '../common/Pagination';
import Button from '../common/Button';

const PAGE_SIZE = 10;

export default function ClinicalRecordsTable({ records, onView, onPrint, onDownload, onDelete, emptyMessage }) {
  const [page, setPage] = useState(1);

  if (records.length === 0) {
    return <EmptyState message={emptyMessage || 'No clinical records found.'} />;
  }

  const pageCount = Math.ceil(records.length / PAGE_SIZE);
  const currentPage = Math.min(page, pageCount);
  const pageRecords = records.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <DataTable>
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Visit #
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Diagnosis
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Treatment
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {pageRecords.map((r) => (
            <tr
              key={r._id}
              className="cursor-pointer transition-colors duration-150 hover:bg-sky-50/40"
              onClick={() => onView(r)}
            >
              <td className="whitespace-nowrap px-4 py-3 text-gray-900">{r.date}</td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.time}</td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.visitNumber}</td>
              <td className="max-w-[14rem] truncate px-4 py-3 text-gray-600">{r.diagnosis || '-'}</td>
              <td className="max-w-[14rem] truncate px-4 py-3 text-gray-600">{r.treatment || '-'}</td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" icon={Eye} onClick={() => onView(r)}>
                    View
                  </Button>
                  {onPrint && (
                    <Button
                      variant="secondary"
                      icon={Printer}
                      onClick={() => onPrint(r)}
                      aria-label="Print record"
                      className="px-2.5"
                    />
                  )}
                  {onDownload && (
                    <Button
                      variant="secondary"
                      icon={Download}
                      onClick={() => onDownload(r)}
                      aria-label="Download record"
                      className="px-2.5"
                    />
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      icon={Trash2}
                      onClick={() => onDelete(r)}
                      aria-label="Delete record"
                      className="px-2.5"
                    />
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
        totalItems={records.length}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
