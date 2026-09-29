import Button from '../common/Button';
import { CLINIC_INFO } from '../../constants/clinicInfo';

// Printed in clinic (Pakistan) local time regardless of the printing device's own
// timezone -- matches the server's Asia/Karachi-pinned date/time conventions.
function formatSlipDateTime(date) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

function Row({ label, value, className = '' }) {
  return (
    <p className={`text-sm text-gray-900 ${className}`}>
      <span className="font-bold">{label}:</span> {value}
    </p>
  );
}

export default function TokenSlip({ token, onClose }) {
  const { patient } = token;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="print-area w-full max-w-sm rounded-md border border-gray-300 p-5">
        <h3 className="text-xl font-bold text-gray-900">{CLINIC_INFO.clinicNameEnglish}</h3>
        <p className="text-sm text-gray-600">{CLINIC_INFO.address}</p>
        <hr className="my-2 border-t-2 border-gray-800" />

        <Row label="Doctor Name" value={CLINIC_INFO.doctor.nameEnglish} />
        <div className="mt-1 flex items-center justify-between">
          <Row label="Date" value={formatSlipDateTime(new Date(token.generatedAt))} />
          <Row label="Sr #" value={token.serialNumber} />
        </div>
        <Row className="mt-1" label="Patient Name" value={patient.fullName} />
        <Row className="mt-1" label="Mobile #" value={patient.phone} />
        <Row className="mt-1" label="Address" value={patient.address || 'N/A'} />
        <Row className="mt-1" label="Fees" value={Number(token.fee || 0).toLocaleString()} />
        <div className="mt-1 flex items-center justify-between">
          <Row label="Gender" value={patient.gender} />
          <Row label="Age" value={patient.age} />
        </div>

        <p className="mt-4 text-center text-6xl font-bold text-gray-900">{token.tokenNumber}</p>
        <p className="text-center text-sm text-gray-600">Token No:</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => window.print()}>Print Slip</Button>
      </div>
    </div>
  );
}
