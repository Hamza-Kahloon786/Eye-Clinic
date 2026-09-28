import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Pill, ShoppingCart } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import DataTable, { EmptyState } from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import SellMedicineModal from '../components/pharmacy/SellMedicineModal';
import { useAuth } from '../auth/AuthContext';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../api/medicineApi';

const EMPTY_FORM = {
  productCode: '',
  name: '',
  genericName: '',
  packing: '',
  retailPrice: '',
  tradePrice: '',
  stockQuantity: '',
  lowStockThreshold: '',
};

const PAGE_SIZE = 10;

function formatPrice(value) {
  return value == null ? '-' : `Rs ${Number(value).toLocaleString()}`;
}

function StockBadge({ quantity, threshold }) {
  const qty = quantity ?? 0;
  const limit = threshold ?? 10;
  const style =
    qty === 0
      ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200'
      : qty <= limit
        ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
        : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200';

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>{qty}</span>;
}

export default function PharmacyPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'doctor';

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const [editingMedicine, setEditingMedicine] = useState(null); // null = closed, {} = new, {...} = editing
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [sellingMedicine, setSellingMedicine] = useState(null);

  async function loadMedicines() {
    setLoading(true);
    try {
      const data = await getMedicines();
      setMedicines(data);
    } catch (err) {
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedicines();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines;
    return medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.genericName?.toLowerCase().includes(q) ||
        m.productCode?.toLowerCase().includes(q)
    );
  }, [medicines, query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageMedicines = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openAdd() {
    setEditingMedicine({});
    setForm(EMPTY_FORM);
  }

  function openEdit(medicine) {
    setEditingMedicine(medicine);
    setForm({
      productCode: medicine.productCode || '',
      name: medicine.name,
      genericName: medicine.genericName || '',
      packing: medicine.packing || '',
      retailPrice: medicine.retailPrice ?? '',
      tradePrice: medicine.tradePrice ?? '',
      stockQuantity: medicine.stockQuantity ?? '',
      lowStockThreshold: medicine.lowStockThreshold ?? '',
    });
  }

  function closeModal() {
    setEditingMedicine(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim() };
      if (editingMedicine?._id) {
        const updated = await updateMedicine(editingMedicine._id, payload);
        setMedicines((prev) =>
          prev.map((m) => (m._id === updated._id ? updated : m)).sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success('Medicine updated');
      } else {
        const created = await createMedicine(payload);
        setMedicines((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Medicine added');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save medicine');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMedicine(deleteTarget._id);
      setMedicines((prev) => prev.filter((m) => m._id !== deleteTarget._id));
      toast.success('Medicine deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete medicine');
    } finally {
      setDeleting(false);
    }
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSold(sale, updatedMedicine) {
    setMedicines((prev) => prev.map((m) => (m._id === updatedMedicine._id ? updatedMedicine : m)));
    setSellingMedicine(null);
  }

  return (
    <Layout>
      <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600">
              <Pill className="h-4 w-4" />
            </span>
            Pharmacy
          </h1>
          {canManage && (
            <Button icon={Plus} onClick={openAdd}>
              Add Medicine
            </Button>
          )}
        </div>

        <div className="max-w-sm">
          <Input
            label="Search medicines"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, generic name, or code..."
          />
        </div>

        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState message={query ? 'No medicines match your search.' : 'No medicines added yet.'} />
        ) : (
          <>
            <DataTable>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Generic Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Packing
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Retail Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Trade Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Stock
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pageMedicines.map((m) => (
                  <tr key={m._id} className="transition-colors duration-150 hover:bg-sky-50/40">
                    <td className="px-4 py-3 text-gray-900">
                      {m.name}
                      {m.productCode && <p className="text-xs text-gray-400">{m.productCode}</p>}
                    </td>
                    <td className="max-w-[14rem] truncate px-4 py-3 text-gray-600">{m.genericName || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{m.packing || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatPrice(m.retailPrice)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatPrice(m.tradePrice)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StockBadge quantity={m.stockQuantity} threshold={m.lowStockThreshold} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          icon={ShoppingCart}
                          disabled={!m.stockQuantity}
                          onClick={() => setSellingMedicine(m)}
                        >
                          Sell
                        </Button>
                        {canManage && (
                          <>
                            <Button variant="secondary" icon={Pencil} onClick={() => openEdit(m)}>
                              Edit
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={() => setDeleteTarget(m)}>
                              Delete
                            </Button>
                          </>
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
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </div>

      <Modal
        open={!!editingMedicine}
        onClose={closeModal}
        title={editingMedicine?._id ? 'Edit Medicine' : 'Add Medicine'}
        maxWidthClassName="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Medicine Name"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="e.g. Obradex Eye Drops"
              autoFocus
            />
            <Input
              label="Product Code"
              value={form.productCode}
              onChange={(e) => updateForm('productCode', e.target.value)}
              placeholder="e.g. 3.01.002.00003"
            />
          </div>
          <Input
            label="Generic Name"
            value={form.genericName}
            onChange={(e) => updateForm('genericName', e.target.value)}
            placeholder="e.g. Tobramycin 3mg+Dexamethasone 1mg"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Packing"
              value={form.packing}
              onChange={(e) => updateForm('packing', e.target.value)}
              placeholder="e.g. 5ml"
            />
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => updateForm('stockQuantity', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Retail Price (Rs)"
              type="number"
              min="0"
              step="0.01"
              value={form.retailPrice}
              onChange={(e) => updateForm('retailPrice', e.target.value)}
            />
            <Input
              label="Trade Price (Rs)"
              type="number"
              min="0"
              step="0.01"
              value={form.tradePrice}
              onChange={(e) => updateForm('tradePrice', e.target.value)}
            />
            <Input
              label="Low Stock Alert At"
              type="number"
              min="0"
              placeholder="10"
              value={form.lowStockThreshold}
              onChange={(e) => updateForm('lowStockThreshold', e.target.value)}
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" icon={editingMedicine?._id ? Pencil : Plus} disabled={saving}>
              {saving ? 'Saving...' : editingMedicine?._id ? 'Save Changes' : 'Add Medicine'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Medicine">
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-700">
              Delete <span className="font-semibold">{deleteTarget.name}</span> from the pharmacy inventory?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" icon={Trash2} disabled={deleting} onClick={handleDelete}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <SellMedicineModal medicine={sellingMedicine} onClose={() => setSellingMedicine(null)} onSold={handleSold} />
    </Layout>
  );
}
