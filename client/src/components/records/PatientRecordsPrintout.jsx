import EyeLogo from '../consultation/EyeLogo';
import { CLINIC_INFO, DEFAULT_VITALS } from '../../constants/clinicInfo';

function Field({ label, value }) {
  return (
    <div className="flex min-w-0 items-baseline gap-1 border-b border-dotted border-gray-400 pb-0.5">
      <span className="shrink-0 whitespace-nowrap text-xs font-medium text-gray-600">{label}:</span>
      <span className="min-w-0 truncate text-sm text-gray-900">{value || ' '}</span>
    </div>
  );
}

function WrappingField({ label, value }) {
  return (
    <div className="border-b border-dotted border-gray-400 pb-0.5">
      <span className="text-xs font-medium text-gray-600">{label}: </span>
      <span className="break-words text-sm text-gray-900">{value || ' '}</span>
    </div>
  );
}

const MEDICAL_HISTORY_OPTIONS = [
  { key: 'dm', label: 'DM' },
  { key: 'htn', label: 'HTN' },
  { key: 'ihd', label: 'IHD' },
  { key: 'ckd', label: 'CKD' },
];

function MedicalHistoryRow({ medicalHistory }) {
  return (
    <div className="border-b border-dotted border-gray-400 pb-0.5">
      <span className="text-xs font-medium text-gray-600">Medical History: </span>
      <span className="inline-flex flex-wrap gap-x-3 text-sm text-gray-900">
        {MEDICAL_HISTORY_OPTIONS.map((opt) => (
          <span key={opt.key} className="inline-flex items-center gap-1">
            <span className="flex h-3.5 w-3.5 items-center justify-center border border-gray-500 text-[9px] leading-none">
              {medicalHistory?.[opt.key] ? '✓' : ''}
            </span>
            {opt.label}
          </span>
        ))}
      </span>
    </div>
  );
}

export default function PatientRecordsPrintout({ patient, records }) {
  return (
    <div className="print-area rounded-md border border-gray-300 p-6 text-gray-900">
      {/* Letterhead */}
      <div className="flex items-start justify-between gap-4 border-b-2 border-blue-900 pb-3">
        <div className="flex-1 text-xs leading-tight text-gray-800">
          <p className="text-sm font-bold">{CLINIC_INFO.doctor.nameEnglish}</p>
          {CLINIC_INFO.doctor.credentialsEnglish.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="flex flex-shrink-0 flex-col items-center px-2">
          <EyeLogo />
          <p className="mt-1 text-sm font-semibold text-blue-900" lang="ur" dir="rtl">
            {CLINIC_INFO.motto}
          </p>
        </div>

        <div className="flex-1 text-right text-xs leading-tight text-gray-800" lang="ur" dir="rtl">
          <p className="text-sm font-bold">{CLINIC_INFO.doctor.nameUrdu}</p>
          {CLINIC_INFO.doctor.credentialsUrdu.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <p className="mt-1 text-center text-lg font-bold text-blue-900" lang="ur" dir="rtl">
        {CLINIC_INFO.clinicNameUrdu}
      </p>

      {/* Patient identity */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <Field label="Patient Name" value={patient.fullName} />
        <Field label="S/O D/O W/O" value={patient.guardianName} />
        <Field label="MR Number" value={patient.mrNumber} />
        <Field label="Contact No" value={patient.phone} />
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Age" value={patient.age} />
          <Field label="Gender" value={patient.gender} />
        </div>
        <Field label="Address" value={patient.address} />
      </div>

      <h2 className="mt-5 mb-2 text-sm font-bold text-blue-900">
        Clinical Record{records.length > 1 ? 's' : ''}
      </h2>

      {records.map((r) => (
        <div key={r._id} className="mb-4 break-inside-avoid rounded border border-gray-300 p-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-4">
            <Field label="Date" value={r.date} />
            <Field label="Time" value={r.time} />
            <Field label="Visit #" value={r.visitNumber} />
            <Field label="Weight (kg)" value={r.weight} />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-y-1.5 text-sm sm:grid-cols-2 sm:gap-x-6">
            <WrappingField label="Allergy" value={r.allergy || DEFAULT_VITALS.allergy} />
            <Field label="Diagnosis" value={r.diagnosis} />
            <div className="sm:col-span-2">
              <MedicalHistoryRow medicalHistory={r.medicalHistory} />
            </div>
            <WrappingField label="Finding" value={r.finding} />
          </div>
          {r.treatment && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-600">Treatment / Prescription:</p>
              <p className="whitespace-pre-line rounded border border-gray-200 bg-gray-50 p-2 text-sm leading-relaxed text-gray-900" dir="auto">
                {r.treatment}
              </p>
            </div>
          )}
        </div>
      ))}

      <p className="mt-3 text-xs italic text-gray-500">{CLINIC_INFO.footerNote}</p>
    </div>
  );
}
