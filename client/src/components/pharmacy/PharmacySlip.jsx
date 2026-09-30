import { Printer, X } from 'lucide-react';
import Button from '../common/Button';
import EyeLogo from '../consultation/EyeLogo';
import { CLINIC_INFO } from '../../constants/clinicInfo';

// Printed in clinic (Pakistan) local time regardless of the printing device's own
// timezone -- matches the server's Asia/Karachi-pinned date/time conventions.
function formatSlipDateTime(date) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const parts = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }
  return { date: `${parts.day}/${parts.month}/${parts.year}`, time: `${parts.hour}:${parts.minute} ${parts.dayPeriod}` };
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PharmacySlip({ sale, onClose }) {
  if (!sale) return null;

  const { date, time } = formatSlipDateTime(new Date(sale.createdAt || Date.now()));
  const patient = sale.patient;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="print-area w-full max-w-sm rounded-md border border-gray-300 p-5 text-gray-900">
        <div className="flex flex-col items-center text-center">
          <EyeLogo className="h-9 w-12" />
          <h3 className="mt-1 text-lg font-bold">{CLINIC_INFO.clinicNameEnglish}</h3>
          <p className="text-xs text-gray-600">{CLINIC_INFO.address}</p>
        </div>

        <hr className="my-2.5 border-t-2 border-gray-800" />

        <div className="flex items-center justify-between text-xs text-gray-700">
          <span>
            <span className="font-semibold">Invoice#:</span> {sale.invoiceNumber || '-'}
          </span>
          <span>
            <span className="font-semibold">Date:</span> {date}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between text-xs text-gray-700">
          <span>
            <span className="font-semibold">Patient:</span> {patient?.fullName || '-'}
          </span>
          <span>
            <span className="font-semibold">Time:</span> {time}
          </span>
        </div>
        {patient?.mrNumber && (
          <p className="mt-0.5 text-xs text-gray-700">
            <span className="font-semibold">MR#:</span> {patient.mrNumber}
          </p>
        )}

        <table className="mt-3 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-t border-gray-400">
              <th className="py-1.5 text-left font-semibold">Item Name</th>
              <th className="py-1.5 text-right font-semibold">Rate</th>
              <th className="py-1.5 text-right font-semibold">Qty</th>
              <th className="py-1.5 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-1">{sale.medicineName}</td>
              <td className="py-1.5 text-right">{formatMoney(sale.unitPrice)}</td>
              <td className="py-1.5 text-right">{sale.quantity}</td>
              <td className="py-1.5 text-right">{formatMoney(sale.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-2 border-t-2 border-gray-800 pt-2 text-xs text-gray-700">
          <div className="flex items-center justify-between">
            <span>Total Item: 1</span>
            <span className="font-semibold">Total: Rs {formatMoney(sale.totalAmount)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-400 pt-2">
            <span className="text-[11px] italic text-gray-500">No return accepted without bill</span>
            <span className="text-sm font-bold">Net Total: Rs {formatMoney(sale.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" icon={X} onClick={onClose}>
          Close
        </Button>
        <Button icon={Printer} onClick={() => window.print()}>
          Print Receipt
        </Button>
      </div>
    </div>
  );
}
