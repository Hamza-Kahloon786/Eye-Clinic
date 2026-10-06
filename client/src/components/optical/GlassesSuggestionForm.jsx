import { useState } from 'react';
import toast from 'react-hot-toast';
import { Glasses } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { createSuggestion, updateSuggestion } from '../../api/glassesApi';

const EMPTY_VISION = { sph: '', cyl: '', axis: '' };

const LENS_TYPES = ['Single Vision', 'Bifocal', 'Progressive', 'Reading', 'Anti-Glare'];

function mergeEye(eye) {
  return {
    dv: { ...EMPTY_VISION, ...(eye?.dv || {}) },
    nv: { ...EMPTY_VISION, ...(eye?.nv || {}) },
  };
}

function VisionRow({ label, vision, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <Input label="SPH" value={vision.sph} onChange={(e) => onChange('sph', e.target.value)} placeholder="e.g. -1.50" />
      <Input label="CYL" value={vision.cyl} onChange={(e) => onChange('cyl', e.target.value)} placeholder="e.g. -0.75" />
      <Input label="AXIS" value={vision.axis} onChange={(e) => onChange('axis', e.target.value)} placeholder="e.g. 90" />
    </div>
  );
}

export default function GlassesSuggestionForm({ patientId, tokenId, suggestion, onSaved, onCancel }) {
  const isEditing = !!suggestion;

  const [rightEye, setRightEye] = useState(mergeEye(suggestion?.rightEye));
  const [leftEye, setLeftEye] = useState(mergeEye(suggestion?.leftEye));
  const [lensType, setLensType] = useState(suggestion?.lensType || LENS_TYPES[0]);
  const [frameNote, setFrameNote] = useState(suggestion?.frameNote || '');
  const [saving, setSaving] = useState(false);

  function updateEye(setter, rowKey, field, value) {
    setter((prev) => ({ ...prev, [rowKey]: { ...prev[rowKey], [field]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { rightEye, leftEye, lensType, frameNote };
      const saved = isEditing
        ? await updateSuggestion(suggestion._id, payload)
        : await createSuggestion({ patientId, tokenId, ...payload });
      toast.success(isEditing ? 'Glasses suggestion updated' : 'Glasses suggestion saved');
      onSaved?.(saved);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save glasses suggestion');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Right Eye</h4>
          <VisionRow label="Distance (DV)" vision={rightEye.dv} onChange={(field, value) => updateEye(setRightEye, 'dv', field, value)} />
          <VisionRow label="Near (NV)" vision={rightEye.nv} onChange={(field, value) => updateEye(setRightEye, 'nv', field, value)} />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Left Eye</h4>
          <VisionRow label="Distance (DV)" vision={leftEye.dv} onChange={(field, value) => updateEye(setLeftEye, 'dv', field, value)} />
          <VisionRow label="Near (NV)" vision={leftEye.nv} onChange={(field, value) => updateEye(setLeftEye, 'nv', field, value)} />
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-gray-700">
        <span className="font-medium text-gray-700">Lens Type</span>
        <select
          value={lensType}
          onChange={(e) => setLensType(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-all duration-150 hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        >
          {LENS_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-gray-700">
        <span className="font-medium text-gray-700">Frame Note (optional)</span>
        <textarea
          value={frameNote}
          onChange={(e) => setFrameNote(e.target.value)}
          rows={3}
          placeholder="Frame preference, additional notes for the optical desk..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-all duration-150 placeholder:text-gray-400 hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
      </label>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" icon={Glasses} disabled={saving}>
          {saving ? 'Saving...' : isEditing ? 'Update Suggestion' : 'Save Suggestion'}
        </Button>
      </div>
    </form>
  );
}
