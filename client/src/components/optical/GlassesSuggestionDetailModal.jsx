import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Play, CheckCircle2, XCircle, Clock3 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import StatusBadge from '../common/StatusBadge';
import { updateSuggestionStatus } from '../../api/glassesApi';

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value || '-'}</dd>
    </div>
  );
}

function formatVision(vision) {
  if (!vision) return '';
  return [vision.sph, vision.cyl, vision.axis].filter(Boolean).join(' / ');
}

function EyeField({ label, eye }) {
  const dv = formatVision(eye?.dv);
  const nv = formatVision(eye?.nv);
  if (!dv && !nv) {
    return <Field label={label} value="" />;
  }
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label} (SPH / CYL / AXIS)</dt>
      <dd className="mt-0.5 text-sm text-gray-900">
        {dv && <div>DV: {dv}</div>}
        {nv && <div>NV: {nv}</div>}
      </dd>
    </div>
  );
}

export default function GlassesSuggestionDetailModal({ suggestion, editable = false, onClose, onUpdated }) {
  const [askingCost, setAskingCost] = useState(false);
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAskingCost(false);
    setCost('');
  }, [suggestion]);

  if (!suggestion) return null;

  const { patient, rightEye, leftEye } = suggestion;

  async function changeStatus(status, extra = {}) {
    setSaving(true);
    try {
      const updated = await updateSuggestionStatus(suggestion._id, { status, ...extra });
      toast.success('Status updated');
      onUpdated?.(updated);
      setAskingCost(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  function handleCompleteSubmit(e) {
    e.preventDefault();
    if (cost === '' || Number(cost) < 0) {
      toast.error('Enter a valid cost');
      return;
    }
    changeStatus('completed', { cost: Number(cost) });
  }

  return (
    <Modal open={!!suggestion} onClose={onClose} title="Glasses Suggestion" maxWidthClassName="max-w-xl">
      <div className="flex flex-col gap-6">
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sky-600">Patient</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Field label="Unique ID" value={patient?.mrNumber} />
            <Field label="Name" value={patient?.fullName} />
            <Field label="Age / Gender" value={patient ? `${patient.age} / ${patient.gender}` : ''} />
            <Field label="Phone" value={patient?.phone} />
          </dl>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sky-600">Prescription</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <EyeField label="Right Eye" eye={rightEye} />
            <EyeField label="Left Eye" eye={leftEye} />
            <Field label="Lens Type" value={suggestion.lensType} />
            <Field label="Suggested By" value={suggestion.suggestedBy?.fullName} />
            <div className="col-span-2">
              <Field label="Frame Note" value={suggestion.frameNote} />
            </div>
          </dl>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sky-600">Status</h3>
          <div className="flex items-center justify-between gap-3">
            <StatusBadge status={suggestion.status} />
            {suggestion.status === 'completed' && suggestion.cost != null && (
              <span className="text-sm font-semibold text-emerald-700">
                Rs {Number(suggestion.cost).toLocaleString()}
              </span>
            )}
          </div>

          {editable && !['completed', 'cancelled'].includes(suggestion.status) && (
            <div className="mt-4">
              {askingCost ? (
                <form onSubmit={handleCompleteSubmit} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      label="Final Cost (Rs)"
                      type="number"
                      min="0"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button type="submit" variant="success" disabled={saving}>
                    Confirm
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setAskingCost(false)}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {suggestion.status === 'suggested' && (
                    <Button variant="secondary" icon={Play} disabled={saving} onClick={() => changeStatus('in-progress')}>
                      Start
                    </Button>
                  )}
                  <Button variant="success" icon={CheckCircle2} disabled={saving} onClick={() => setAskingCost(true)}>
                    Complete
                  </Button>
                  <Button
                    variant="secondary"
                    icon={Clock3}
                    disabled={saving}
                    onClick={() => changeStatus('delayed')}
                  >
                    Delay
                  </Button>
                  <Button variant="danger" icon={XCircle} disabled={saving} onClick={() => changeStatus('cancelled')}>
                    Cancel Order
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
