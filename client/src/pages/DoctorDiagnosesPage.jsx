import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Stethoscope, FileText } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import DataTable, { EmptyState } from '../components/common/DataTable';
import { getDiagnoses, createDiagnosis, updateDiagnosis, deleteDiagnosis } from '../api/diagnosisApi';

const EMPTY_FORM = { name: '', defaultPrescription: '' };

export default function DoctorDiagnosesPage() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [editingDiagnosis, setEditingDiagnosis] = useState(null); // null = closed, {} = new, {...} = editing
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadDiagnoses() {
    setLoading(true);
    try {
      const data = await getDiagnoses();
      setDiagnoses(data);
    } catch (err) {
      toast.error('Failed to load diagnoses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDiagnoses();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return diagnoses;
    return diagnoses.filter((d) => d.name.toLowerCase().includes(q));
  }, [diagnoses, query]);

  function openAdd() {
    setEditingDiagnosis({});
    setForm(EMPTY_FORM);
  }

  function openEdit(diagnosis) {
    setEditingDiagnosis(diagnosis);
    setForm({ name: diagnosis.name, defaultPrescription: diagnosis.defaultPrescription || '' });
  }

  function closeModal() {
    setEditingDiagnosis(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingDiagnosis?._id) {
        const updated = await updateDiagnosis(editingDiagnosis._id, form.name.trim(), form.defaultPrescription);
        setDiagnoses((prev) =>
          prev.map((d) => (d._id === updated._id ? updated : d)).sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success('Diagnosis updated');
      } else {
        const created = await createDiagnosis(form.name.trim(), form.defaultPrescription);
        setDiagnoses((prev) =>
          prev.some((d) => d._id === created._id)
            ? prev
            : [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success('Diagnosis added');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save diagnosis');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDiagnosis(deleteTarget._id);
      setDiagnoses((prev) => prev.filter((d) => d._id !== deleteTarget._id));
      toast.success('Diagnosis deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete diagnosis');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Layout>
      <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600">
              <Stethoscope className="h-4 w-4" />
            </span>
            Diagnoses
          </h1>
          <Button icon={Plus} onClick={openAdd}>
            Add Diagnosis
          </Button>
        </div>

        <div className="max-w-sm">
          <Input
            label="Search diagnoses"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Start typing to filter..."
          />
        </div>

        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState message={query ? 'No diagnoses match your search.' : 'No diagnoses added yet.'} />
        ) : (
          <DataTable>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Default Prescription
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((d) => (
                <tr key={d._id} className="transition-colors duration-150 hover:bg-sky-50/40">
                  <td className="px-4 py-3 text-gray-900">{d.name}</td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">
                    {d.defaultPrescription ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="truncate">{d.defaultPrescription.split('\n')[0]}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" icon={Pencil} onClick={() => openEdit(d)}>
                        Edit
                      </Button>
                      <Button variant="danger" icon={Trash2} onClick={() => setDeleteTarget(d)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>

      <Modal
        open={!!editingDiagnosis}
        onClose={closeModal}
        title={editingDiagnosis?._id ? 'Edit Diagnosis' : 'Add Diagnosis'}
        maxWidthClassName="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Diagnosis Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. VKC"
            autoFocus
          />
          <label className="flex flex-col gap-1.5 text-sm text-gray-700">
            <span className="font-medium text-gray-700">Default Prescription (optional)</span>
            <textarea
              value={form.defaultPrescription}
              onChange={(e) => setForm((prev) => ({ ...prev, defaultPrescription: e.target.value }))}
              placeholder={'e.g.\nObradex eye ointment\nصرف رات کو 14 دن تک استعمال کریں\nOlopat eye drop\nصبح دوپہر شام ایک قطرہ'}
              rows={6}
              dir="auto"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-all duration-150 placeholder:text-gray-400 hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
            <span className="text-xs text-gray-500">
              Auto-fills the treatment/prescription field when this diagnosis is selected during a consultation.
            </span>
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" icon={editingDiagnosis?._id ? Pencil : Plus} disabled={saving}>
              {saving ? 'Saving...' : editingDiagnosis?._id ? 'Save Changes' : 'Add Diagnosis'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Diagnosis">
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-700">
              Delete <span className="font-semibold">{deleteTarget.name}</span> from the diagnosis list? Existing
              patient records that used this diagnosis will not be affected.
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
    </Layout>
  );
}
