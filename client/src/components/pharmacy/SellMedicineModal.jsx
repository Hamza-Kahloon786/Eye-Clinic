import { useState } from 'react';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import PatientSearchForm from '../patient/PatientSearchForm';
import PatientSearchResults from '../patient/PatientSearchResults';
import Loader from '../common/Loader';
import { searchPatients } from '../../api/patientApi';
import { createSale } from '../../api/saleApi';

export default function SellMedicineModal({ medicine, onClose, onSold }) {
  const [quantity, setQuantity] = useState('1');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const open = !!medicine;
  const qty = Number(quantity) || 0;
  const unitPrice = medicine?.retailPrice || 0;
  const total = qty * unitPrice;

  async function handleSearch(query) {
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

  function reset() {
    setQuantity('1');
    setSelectedPatient(null);
    setResults(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!selectedPatient) {
      toast.error('Select a patient');
      return;
    }
    if (qty <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    if (qty > (medicine.stockQuantity || 0)) {
      toast.error('Not enough stock for this quantity');
      return;
    }

    setSaving(true);
    try {
      const { sale, medicine: updatedMedicine } = await createSale({
        medicineId: medicine._id,
        patientId: selectedPatient._id,
        quantity: qty,
      });
      toast.success(`Sold ${qty} x ${medicine.name} to ${selectedPatient.fullName}`);
      onSold?.(sale, updatedMedicine);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Sell Medicine" maxWidthClassName="max-w-2xl">
      {medicine && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50/70 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{medicine.name}</p>
            <p className="mt-1 text-xs text-gray-500">
              In stock: <span className="font-medium text-gray-700">{medicine.stockQuantity ?? 0}</span> &middot;
              Retail price:{' '}
              <span className="font-medium text-gray-700">
                {medicine.retailPrice != null ? `Rs ${Number(medicine.retailPrice).toLocaleString()}` : '-'}
              </span>
            </p>
          </div>

          <div className="w-32">
            <Input
              label="Quantity"
              type="number"
              min="1"
              max={medicine.stockQuantity ?? undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

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
                  onClick={() => setSelectedPatient(null)}
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <PatientSearchForm onSearch={handleSearch} />
                {searching && <Loader label="Searching..." />}
                {!searching && results && (
                  <div className="mt-3">
                    <PatientSearchResults patients={results} onSelect={setSelectedPatient} />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Total Amount</span>
            <span className="text-lg font-bold text-gray-900">Rs {total.toLocaleString()}</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              icon={ShoppingCart}
              disabled={saving || !selectedPatient}
              onClick={handleSubmit}
            >
              {saving ? 'Recording...' : 'Confirm Sale'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
