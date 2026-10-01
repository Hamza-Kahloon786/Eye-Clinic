import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';
import PatientSearchForm from '../patient/PatientSearchForm';
import PatientSearchResults from '../patient/PatientSearchResults';
import { searchPatients } from '../../api/patientApi';
import { createSale } from '../../api/saleApi';

export default function SellModal({ open, medicines, onClose, onSold }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const [medicineQuery, setMedicineQuery] = useState('');
  const [cart, setCart] = useState([]); // [{ medicine, quantity }]

  const [saving, setSaving] = useState(false);

  const matchingMedicines = useMemo(() => {
    const q = medicineQuery.trim().toLowerCase();
    if (!q) return [];
    return medicines
      .filter(
        (m) =>
          !cart.some((c) => c.medicine._id === m._id) &&
          (m.name.toLowerCase().includes(q) || m.genericName?.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [medicines, medicineQuery, cart]);

  const grandTotal = cart.reduce((sum, c) => sum + (c.medicine.retailPrice || 0) * c.quantity, 0);

  function reset() {
    setSelectedPatient(null);
    setResults(null);
    setMedicineQuery('');
    setCart([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handlePatientSearch(query) {
    setSearching(true);
    try {
      const data = await searchPatients(query);
      setResults(data);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  }

  function addToCart(medicine) {
    if (!medicine.stockQuantity) {
      toast.error(`${medicine.name} is out of stock`);
      return;
    }
    setCart((prev) => [...prev, { medicine, quantity: 1 }]);
    setMedicineQuery('');
  }

  function updateQuantity(medicineId, quantity) {
    setCart((prev) =>
      prev.map((c) => (c.medicine._id === medicineId ? { ...c, quantity: Math.max(1, quantity) } : c))
    );
  }

  function removeFromCart(medicineId) {
    setCart((prev) => prev.filter((c) => c.medicine._id !== medicineId));
  }

  async function handleConfirm() {
    if (!selectedPatient) {
      toast.error('Select a patient');
      return;
    }
    if (cart.length === 0) {
      toast.error('Add at least one medicine to the cart');
      return;
    }
    const overStock = cart.find((c) => c.quantity > (c.medicine.stockQuantity || 0));
    if (overStock) {
      toast.error(`Not enough stock for ${overStock.medicine.name}`);
      return;
    }

    setSaving(true);
    try {
      const { sale, medicines: updatedMedicines } = await createSale({
        patientId: selectedPatient._id,
        items: cart.map((c) => ({ medicineId: c.medicine._id, quantity: c.quantity })),
      });
      toast.success(`Sold ${cart.length} item${cart.length === 1 ? '' : 's'} to ${selectedPatient.fullName}`);
      onSold?.(sale, updatedMedicines);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Sell Medicine" maxWidthClassName="max-w-2xl">
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Patient</p>
          {selectedPatient ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50/70 px-4 py-3">
              <div className="text-sm text-gray-800">
                <span className="font-semibold">{selectedPatient.fullName}</span>{' '}
                <span className="text-gray-500">({selectedPatient.mrNumber})</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  setCart([]);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change
              </button>
            </div>
          ) : (
            <>
              <PatientSearchForm onSearch={handlePatientSearch} />
              {searching && <Loader label="Searching..." />}
              {!searching && results && (
                <div className="mt-3">
                  <PatientSearchResults patients={results} onSelect={setSelectedPatient} />
                </div>
              )}
            </>
          )}
        </div>

        {selectedPatient && (
          <>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Add Medicine</p>
              <Input
                value={medicineQuery}
                onChange={(e) => setMedicineQuery(e.target.value)}
                placeholder="Search medicine by name..."
              />
              {matchingMedicines.length > 0 && (
                <div className="mt-2 flex flex-col gap-1 rounded-lg border border-gray-200 p-1.5">
                  {matchingMedicines.map((m) => (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => addToCart(m)}
                      className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150 hover:bg-sky-50"
                    >
                      <span className="text-gray-900">{m.name}</span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-gray-500">
                        Rs {Number(m.retailPrice || 0).toLocaleString()} &middot; {m.stockQuantity ?? 0} in stock
                        <Plus className="h-3.5 w-3.5 text-sky-600" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Cart</p>
              {cart.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
                  No medicines added yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {cart.map((c) => (
                    <div
                      key={c.medicine._id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{c.medicine.name}</p>
                        <p className="text-xs text-gray-500">
                          Rs {Number(c.medicine.retailPrice || 0).toLocaleString()} each &middot;{' '}
                          {c.medicine.stockQuantity ?? 0} in stock
                        </p>
                      </div>
                      <div className="w-20 shrink-0">
                        <input
                          type="number"
                          min="1"
                          max={c.medicine.stockQuantity ?? undefined}
                          value={c.quantity}
                          onChange={(e) => updateQuantity(c.medicine._id, Number(e.target.value) || 1)}
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                        />
                      </div>
                      <div className="w-20 shrink-0 text-right text-sm font-semibold text-gray-900">
                        Rs {((c.medicine.retailPrice || 0) * c.quantity).toLocaleString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(c.medicine._id)}
                        className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove from cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <span className="text-sm font-medium text-gray-700">Grand Total</span>
              <span className="text-lg font-bold text-gray-900">Rs {grandTotal.toLocaleString()}</span>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="success"
            icon={ShoppingCart}
            disabled={saving || !selectedPatient || cart.length === 0}
            onClick={handleConfirm}
          >
            {saving ? 'Recording...' : 'Confirm Sale'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
