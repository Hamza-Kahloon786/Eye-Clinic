import { useState } from 'react';
import toast from 'react-hot-toast';
import { Glasses } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { createSuggestion, updateSuggestion } from '../../api/glassesApi';

const EMPTY_EYE = { sph: '', cyl: '', axis: '' };

const LENS_TYPES = ['Single Vision', 'Bifocal', 'Progressive', 'Reading', 'Anti-Glare'];

export default function GlassesSuggestionForm({ patientId, tokenId, suggestion, onSaved, onCancel }) {
  const isEditing = !!suggestion;

  const [rightEye, setRightEye] = useState(suggestion?.rightEye || EMPTY_EYE);
  const [leftEye, setLeftEye] = useState(suggestion?.leftEye || EMPTY_EYE);
  const [lensType, setLensType] = useState(suggestion?.lensType || LENS_TYPES[0]);
  const [frameNote, setFrameNote] = useState(suggestion?.frameNote || '');
  const [saving, setSaving] = useState(false);

  function updateEye(setter, field, value) {
    setter((prev) => ({ ...prev, [field]: value }));
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
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Right Eye</h4>
          <Input
            label="SPH"
            value={rightEye.sph}
            onChange={(e) => updateEye(setRightEye, 'sph', e.target.value)}
            placeholder="e.g. -1.50"
          />
          <Input
            label="CYL"
            value={rightEye.cyl}
            onChange={(e) => updateEye(setRightEye, 'cyl', e.target.value)}
            placeholder="e.g. -0.75"
          />
          <Input
            label="AXIS"
            value={rightEye.axis}
            onChange={(e) => updateEye(setRightEye, 'axis', e.target.value)}
            placeholder="e.g. 90"
          />
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Left Eye</h4>
          <Input
            label="SPH"
            value={leftEye.sph}
            onChange={(e) => updateEye(setLeftEye, 'sph', e.target.value)}
            placeholder="e.g. -1.25"
          />
          <Input
            label="CYL"
            value={leftEye.cyl}
            onChange={(e) => updateEye(setLeftEye, 'cyl', e.target.value)}
            placeholder="e.g. -0.50"
          />
          <Input
            label="AXIS"
            value={leftEye.axis}
            onChange={(e) => updateEye(setLeftEye, 'axis', e.target.value)}
            placeholder="e.g. 85"
          />
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
