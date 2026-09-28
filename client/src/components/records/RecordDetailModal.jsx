import { Printer, Download } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import PatientRecordsPrintout from './PatientRecordsPrintout';

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value || '-'}</dd>
    </div>
  );
}

const MEDICAL_HISTORY_LABELS = { dm: 'DM', htn: 'HTN', ihd: 'IHD', ckd: 'CKD' };

function MedicalHistoryField({ medicalHistory }) {
  const positive = Object.entries(MEDICAL_HISTORY_LABELS).filter(([key]) => medicalHistory?.[key]);
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Medical History</dt>
      <dd className="mt-0.5 text-sm text-gray-900">
        {positive.length === 0 ? '-' : positive.map(([, label]) => label).join(', ')}
      </dd>
    </div>
  );
}

export default function RecordDetailModal({ record, onClose }) {
  return (
    <Modal open={!!record} onClose={onClose} title="Clinical Record Detail" maxWidthClassName="max-w-2xl">
      {record && (
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sky-600">Patient</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <Field label="Unique ID" value={record.patient.mrNumber} />
              <Field label="Name" value={record.patient.fullName} />
              <Field label="Parentage" value={record.patient.guardianName} />
              <Field label="Age" value={record.patient.age} />
              <Field label="Gender" value={record.patient.gender} />
              <Field label="Phone" value={record.patient.phone} />
              <Field label="Address" value={record.patient.address} />
            </dl>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sky-600">Visit</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <Field label="Date" value={record.date} />
              <Field label="Time" value={record.time} />
              <Field label="Visit #" value={record.visitNumber} />
              <Field label="Weight (kg)" value={record.weight} />
            </dl>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sky-600">Clinical Details</h3>
            <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
              <Field label="Allergy" value={record.allergy} />
              <MedicalHistoryField medicalHistory={record.medicalHistory} />
              <Field label="Diagnosis" value={record.diagnosis} />
              <Field label="Finding" value={record.finding} />
              <Field label="Treatment" value={record.treatment} />
            </dl>
          </section>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="secondary" icon={Download} onClick={() => window.print()}>
              Download
            </Button>
          </div>

          <div className="print-only">
            <PatientRecordsPrintout patient={record.patient} records={[record]} />
          </div>
        </div>
      )}
    </Modal>
  );
}
