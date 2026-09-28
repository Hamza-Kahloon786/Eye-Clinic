import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, ClipboardList } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { createRecord } from '../../api/recordApi';

const EMPTY_MEDICAL_HISTORY = { dm: false, htn: false, ihd: false, ckd: false };

const MEDICAL_HISTORY_OPTIONS = [
  { key: 'dm', label: 'DM (Diabetes Mellitus)' },
  { key: 'htn', label: 'HTN (Hypertension)' },
  { key: 'ihd', label: 'IHD (Ischemic Heart Disease)' },
  { key: 'ckd', label: 'CKD (Chronic Kidney Disease)' },
];

const EMPTY_FORM = {
  weight: '',
  allergy: '',
  medicalHistory: EMPTY_MEDICAL_HISTORY,
  finding: '',
  treatment: '',
};

function formFromRecord(record) {
  if (!record) return EMPTY_FORM;
  return {
    weight: record.weight ?? '',
    allergy: record.allergy || '',
    medicalHistory: { ...EMPTY_MEDICAL_HISTORY, ...(record.medicalHistory || {}) },
    finding: record.finding || '',
    treatment: record.treatment || '',
  };
}

export default function ClinicalRecordForm({
  patientId,
  tokenId,
  diagnosis,
  initialRecord,
  prefillTreatment,
  prefillToken,
  onSaved,
}) {
  const [form, setForm] = useState(() => formFromRecord(initialRecord));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(formFromRecord(initialRecord));
  }, [initialRecord]);

  useEffect(() => {
    if (prefillTreatment == null) return;
    setForm((prev) => ({ ...prev, treatment: prefillTreatment }));
    // Re-fires on every diagnosis pick (prefillToken changes each time), intentionally
    // overwriting whatever was in the box -- that's the expected "pick diagnosis, see its Rx" flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillToken]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleMedicalHistory(key) {
    setForm((prev) => ({
      ...prev,
      medicalHistory: { ...prev.medicalHistory, [key]: !prev.medicalHistory[key] },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const record = await createRecord({
        patientId,
        tokenId,
        diagnosis,
        weight: form.weight ? Number(form.weight) : undefined,
        allergy: form.allergy,
        medicalHistory: form.medicalHistory,
        finding: form.finding,
        treatment: form.treatment,
      });
      toast.success('Clinical record saved');
      setForm(formFromRecord(record));
      onSaved?.(record);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-gray-200/70 bg-gray-50/50 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <ClipboardList className="h-4 w-4 text-sky-600" />
        Clinical Record
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Weight (kg)"
          type="number"
          min="0"
          value={form.weight}
          onChange={(e) => update('weight', e.target.value)}
        />
        <Input label="Allergy" value={form.allergy} onChange={(e) => update('allergy', e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700">Medical History</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {MEDICAL_HISTORY_OPTIONS.map((opt) => (
            <label key={opt.key} className="flex items-center gap-1.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.medicalHistory[opt.key]}
                onChange={() => toggleMedicalHistory(opt.key)}
                className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-2 focus:ring-sky-500/30"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <Input label="Finding" value={form.finding} onChange={(e) => update('finding', e.target.value)} />
      <label className="flex flex-col gap-1.5 text-sm text-gray-700">
        <span className="font-medium text-gray-700">Treatment / Prescription</span>
        <textarea
          value={form.treatment}
          onChange={(e) => update('treatment', e.target.value)}
          rows={4}
          dir="auto"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-all duration-150 placeholder:text-gray-400 hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
      </label>
      <div className="flex justify-end">
        <Button type="submit" icon={Save} disabled={saving}>
          {saving ? 'Saving...' : initialRecord ? 'Update Record' : 'Save Record'}
        </Button>
      </div>
    </form>
  );
}
