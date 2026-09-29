import { useEffect, useState } from 'react';
import { Printer, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../common/Button';
import EyeLogo from './EyeLogo';
import DiagnosisPicker from './DiagnosisPicker';
import ClinicalRecordForm from '../records/ClinicalRecordForm';
import { getRecordByToken } from '../../api/recordApi';
import { getSuggestionByToken } from '../../api/glassesApi';
import { CLINIC_INFO, DEFAULT_VITALS } from '../../constants/clinicInfo';

const EYE_COLUMNS = ['SPH', 'CYL', 'AXIS', 'VA'];
const EYE_ROWS = ['DV', 'NV'];

function Field({ label, value, className = '' }) {
  return (
    <div className={`flex min-w-0 items-baseline gap-1 border-b border-dotted border-gray-400 pb-0.5 ${className}`}>
      <span className="shrink-0 whitespace-nowrap text-xs font-medium text-gray-600">{label}:</span>
      <span className="min-w-0 truncate text-sm text-gray-900">{value || ' '}</span>
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

function BlankLine({ label }) {
  return (
    <div className="border-b border-dotted border-gray-400 pb-0.5">
      <span className="text-xs font-medium text-gray-600">{label}</span>
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
    <div className="border-b border-dotted border-gray-400 pb-1">
      <span className="text-xs font-medium text-gray-600">Medical History:</span>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
        {MEDICAL_HISTORY_OPTIONS.map((opt) => (
          <span key={opt.key} className="inline-flex items-center gap-1 text-sm text-gray-900">
            <span className="flex h-3.5 w-3.5 items-center justify-center border border-gray-500 text-[9px] leading-none">
              {medicalHistory?.[opt.key] ? '✓' : ''}
            </span>
            {opt.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ConsultationSlip({ token, visitNumber, onClose, onDiagnosisChange }) {
  const { patient } = token;
  const now = new Date();
  const [diagnosis, setDiagnosis] = useState(token.diagnosis || '');
  const [record, setRecord] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [prefillTreatment, setPrefillTreatment] = useState(null);
  const [prefillToken, setPrefillToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getRecordByToken(token._id).then((data) => {
      if (!cancelled) setRecord(data);
    });
    getSuggestionByToken(token._id).then((data) => {
      if (!cancelled) setSuggestion(data);
    });
    return () => {
      cancelled = true;
    };
  }, [token._id]);

  function handleRecordSaved(savedRecord, eyeValues) {
    setRecord(savedRecord);
    if (eyeValues) {
      setSuggestion((prev) => ({
        ...(prev || {}),
        rightEye: eyeValues.rightEye,
        leftEye: eyeValues.leftEye,
        lensType: eyeValues.lensType,
      }));
    }
  }

  function handleDiagnosisChange(newDiagnosis) {
    setDiagnosis(newDiagnosis);
    onDiagnosisChange?.(token._id, newDiagnosis);
  }

  function handleSelectDiagnosis(diagnosisObj) {
    setPrefillTreatment(diagnosisObj?.defaultPrescription || '');
    setPrefillToken((prev) => prev + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="print-area rounded-md border border-gray-300 p-6 text-gray-900">
        {/* Letterhead */}
        <div className="flex items-center justify-between gap-4 border-b border-blue-900 pb-1">
          <p className="flex-1 pl-10 text-center text-xl font-bold text-blue-900" lang="ur" dir="rtl">
            {CLINIC_INFO.clinicNameUrdu}
          </p>

          {/* Patient unique-ID QR code, scannable to look up their record */}
          <div className="flex shrink-0 items-center gap-1.5">
            <QRCodeSVG value={patient.mrNumber} size={40} level="M" />
            <span className="text-[9px] font-semibold tracking-wide text-gray-600">{patient.mrNumber}</span>
          </div>
        </div>
        <div className="flex items-start justify-between gap-4 border-b-2 border-blue-900 py-3">
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

        {/* Patient identity -- auto-filled by the system */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Field label="Patient Name" value={patient.fullName} />
          <Field label="S/O D/O W/O" value={patient.guardianName} />
          <Field label="No of Visit" value={visitNumber} />
          <div className="grid grid-cols-2 gap-x-6">
            <Field
              label="Time"
              value={now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' })}
            />
            <Field label="Date" value={now.toLocaleDateString([], { timeZone: 'Asia/Karachi' })} />
          </div>
          <Field label="Address" value={patient.address} />
          <Field label="Contact No" value={patient.phone} />
          <div className="col-span-2 grid grid-cols-5 gap-x-4">
            <Field label="Age" value={patient.age} />
            <Field label="Gender" value={patient.gender} />
            <Field label="B.P" value={DEFAULT_VITALS.bloodPressure} />
            <Field label="Pulse" value={DEFAULT_VITALS.pulse} />
            <Field label="Temperature" value={DEFAULT_VITALS.temperature} />
          </div>
        </div>

        {/* Clinical exam -- left blank for the doctor to fill by hand */}
        <div className="mt-4 grid flex-1 grid-cols-[1fr_2fr] gap-6">
          <div className="flex flex-col gap-4 border-r border-gray-300 pr-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center border border-gray-500 text-[10px] leading-none">
                &#10003;
              </span>
              <span>Verbal Consent Taken</span>
            </div>
            <Field label="V.A (Visual Acuity)" value={record?.visualAcuity} />
            <WrappingField label="Allergies" value={record?.allergy || DEFAULT_VITALS.allergy} />
            <div className="flex flex-col gap-6 pt-2">
              <BlankLine label="Presenting Complaints" />
              <MedicalHistoryRow medicalHistory={record?.medicalHistory} />
              <WrappingField label="Findings" value={record?.finding} />
              <Field label="Optical" value={suggestion?.lensType} />
              <BlankLine label="Investigations" />
            </div>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            <Field label="Provisional/Diagnosis" value={diagnosis} />
            <div className="flex flex-1 min-h-[140px] flex-col gap-1 rounded border border-gray-300 p-2">
              <span className="text-xs font-medium text-gray-600">R&#8339;</span>
              {record?.treatment && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-900" dir="auto">
                  {record.treatment}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer row: small eye refraction grid, right-aligned */}
        <div className="mt-4 flex shrink-0 justify-end gap-6">
          <div className="flex items-end">
            <table className="table-fixed border-collapse text-center text-[11px]" style={{ width: '11rem' }}>
              <thead>
                <tr>
                  <th colSpan={4} className="border border-gray-400 bg-blue-900 p-1 text-white">
                    RIGHT EYE
                  </th>
                </tr>
                <tr>
                  {EYE_COLUMNS.map((col) => (
                    <th key={`r-${col}`} className="border border-gray-400 p-1">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EYE_ROWS.map((row) => (
                  <tr key={`r-row-${row}`}>
                    {EYE_COLUMNS.map((col) => (
                      <td key={`r-${row}-${col}`} className="h-6 border border-gray-400">
                        {row === 'DV' ? suggestion?.rightEye?.[col.toLowerCase()] || '' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="table-fixed border-collapse text-center text-[11px]" style={{ width: '2rem' }}>
              <thead>
                <tr>
                  <th className="p-1"></th>
                </tr>
                <tr>
                  <th className="p-1"></th>
                </tr>
              </thead>
              <tbody>
                {EYE_ROWS.map((row) => (
                  <tr key={`mid-row-${row}`}>
                    <td className="h-6 p-1 font-semibold">{row}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="table-fixed border-collapse text-center text-[11px]" style={{ width: '11rem' }}>
              <thead>
                <tr>
                  <th colSpan={4} className="border border-gray-400 bg-blue-900 p-1 text-white">
                    LEFT EYE
                  </th>
                </tr>
                <tr>
                  {EYE_COLUMNS.map((col) => (
                    <th key={`l-${col}`} className="border border-gray-400 p-1">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EYE_ROWS.map((row) => (
                  <tr key={`l-row-${row}`}>
                    {EYE_COLUMNS.map((col) => (
                      <td key={`l-${row}-${col}`} className="h-6 border border-gray-400">
                        {row === 'DV' ? suggestion?.leftEye?.[col.toLowerCase()] || '' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refill row + clinic contact/timings -- doctor/receptionist fill by hand */}
        <div className="mt-3 flex shrink-0 items-center justify-between gap-6 border-t border-gray-300 pt-2 text-xs">
          <p className="font-semibold text-gray-700">
            Refill&nbsp;&nbsp;
            <span className="font-normal text-gray-900">0&nbsp;&nbsp;1&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;4</span>
          </p>
          <p className="text-right text-gray-600">
            <span className="font-semibold">Next Appointment Date and Time:</span> ____________________
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs">
        <DiagnosisPicker
          tokenId={token._id}
          value={diagnosis}
          onChange={handleDiagnosisChange}
          onSelectDiagnosis={handleSelectDiagnosis}
        />
      </div>

      <ClinicalRecordForm
        patientId={patient._id}
        tokenId={token._id}
        diagnosis={diagnosis}
        initialRecord={record}
        initialSuggestion={suggestion}
        prefillTreatment={prefillTreatment}
        prefillToken={prefillToken}
        onSaved={handleRecordSaved}
      />

      <div className="flex justify-end gap-2">
        <Button variant="secondary" icon={X} onClick={onClose}>
          Close
        </Button>
        <Button icon={Printer} onClick={() => window.print()}>
          Print Slip
        </Button>
      </div>
    </div>
  );
}
