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
  const items = (sale.items || []).map((item) => ({
    name: item.medicineName,
    rate: item.unitPrice,
    qty: item.quantity,
    discPercent: 0,
    total: item.totalAmount,
  }));
  const subtotal = sale.grandTotal ?? items.reduce((sum, item) => sum + item.total, 0);
  const discTotal = 0;
  const previousBalance = 0;
  const netTotal = subtotal - discTotal + previousBalance;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="print-area w-full max-w-sm rounded-md border border-gray-300 p-5 text-gray-900">
        <div className="flex flex-col items-center text-center">
          <EyeLogo className="h-9 w-12" />
          <h3 className="mt-1 text-lg font-bold underline decoration-2 underline-offset-2">
            {CLINIC_INFO.clinicNameEnglish}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-700">{CLINIC_INFO.address}</p>
          {CLINIC_INFO.muridkeAddress && (
            <p className="text-xs leading-relaxed text-gray-700">{CLINIC_INFO.muridkeAddress}</p>
          )}
          {CLINIC_INFO.phone && <p className="text-xs text-gray-700">Phone: {CLINIC_INFO.phone}</p>}
          {CLINIC_INFO.licenseNo && (
            <p className="mt-1 text-xs text-gray-700">
              <span className="font-semibold">License No</span>: {CLINIC_INFO.licenseNo}
            </p>
          )}
        </div>

        <hr className="my-2.5 border-t-2 border-gray-800" />

        <div className="flex items-start justify-between text-xs text-gray-700">
          <span>
            <span className="font-semibold underline">Inv#</span>:{sale.invoiceNumber || '-'}
          </span>
          <span>
            <span className="font-semibold">Date:</span> {date}
          </span>
        </div>
        <div className="mt-0.5 flex items-start justify-between gap-3 text-xs text-gray-700">
          <span className="min-w-0">
            <span className="font-semibold underline">M/S</span>: {patient?.fullName || '-'}
            {patient?.mrNumber && <span className="text-gray-500"> ({patient.mrNumber})</span>}
          </span>
          <span className="shrink-0">
            <span className="font-semibold">Time:</span> {time}
          </span>
        </div>

        <table className="mt-3 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-t border-gray-400">
              <th className="py-1.5 text-left font-semibold">Item Name</th>
              <th className="py-1.5 text-right font-semibold">Rate</th>
              <th className="py-1.5 text-right font-semibold">QTY</th>
              <th className="py-1.5 text-right font-semibold">Disc%</th>
              <th className="py-1.5 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 pr-1">{item.name}</td>
                <td className="py-1.5 text-right">{formatMoney(item.rate)}</td>
                <td className="py-1.5 text-right">{item.qty}</td>
                <td className="py-1.5 text-right">{formatMoney(item.discPercent)}</td>
                <td className="py-1.5 text-right">{formatMoney(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 flex items-start justify-between gap-4 border-t-2 border-gray-800 pt-2 text-xs text-gray-700">
          <div>
            <p>
              <span className="font-semibold">Total Item:</span> {items.length}
            </p>
            <p className="mt-3 max-w-[9rem] italic text-gray-500">No return is accepted without bill</p>
          </div>
          <div className="min-w-[8.5rem] text-right">
            <p>
              <span className="font-semibold">Total:</span> {formatMoney(subtotal)}
            </p>
            <p>
              <span className="font-semibold">Disc:</span> {formatMoney(discTotal)}
            </p>
            <p>
              <span className="font-semibold">Previous:</span> {formatMoney(previousBalance)}
            </p>
            <div className="mt-1.5 border-t border-gray-400 pt-1.5">
              <p className="font-bold">
                <span className="underline">Net Total</span>: {formatMoney(netTotal)}
              </p>
            </div>
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
