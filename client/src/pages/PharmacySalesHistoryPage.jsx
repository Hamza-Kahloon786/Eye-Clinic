import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, RotateCcw, History as HistoryIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import DataTable, { EmptyState } from '../components/common/DataTable';
import { getSales } from '../api/saleApi';

function formatMoney(value) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export default function PharmacySalesHistoryPage() {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await getSales(params);
      setSales(data);
    } catch (err) {
      toast.error('Failed to load sales history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({});
  }, [load]);

  function handleSearch(e) {
    e.preventDefault();
    load({ query, date });
  }

  function handleReset() {
    setQuery('');
    setDate('');
    load({});
  }

  const totalAmount = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  return (
    <Layout>
      <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600">
              <HistoryIcon className="h-4 w-4" />
            </span>
            Pharmacy Sales History
          </h1>
          {!loading && sales.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              Total: {formatMoney(totalAmount)}
            </span>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <Input
              label="Search patient (name, phone, or MR number)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Ali Raza, 03001234567, MR-000001"
            />
          </div>
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button type="submit" icon={Search}>
            Search
          </Button>
          <Button type="button" variant="secondary" icon={RotateCcw} onClick={handleReset}>
            Reset
          </Button>
        </form>

        {loading ? (
          <Loader />
        ) : sales.length === 0 ? (
          <EmptyState message="No sales recorded yet." />
        ) : (
          <div className="mt-4">
            <DataTable>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Invoice #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Medicine
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Sold By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {sales.map((s) => (
                  <tr key={s._id} className="transition-colors duration-150 hover:bg-sky-50/40">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-700">
                      {s.invoiceNumber || '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {new Date(s.createdAt).toLocaleString([], { timeZone: 'Asia/Karachi' })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900">{s.medicineName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                      {s.patient?.fullName}
                      <span className="ml-1 text-xs text-gray-400">({s.patient?.mrNumber})</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{s.quantity}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatMoney(s.unitPrice)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">
                      {formatMoney(s.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{s.soldBy?.fullName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>
        )}
      </div>
    </Layout>
  );
}
