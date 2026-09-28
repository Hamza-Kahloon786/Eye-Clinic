export default function PatientDetailCard({ patient }) {
  const registrationDate = new Date(patient.registrationDate).toLocaleDateString();

  const fields = [
    ['MR Number', patient.mrNumber],
    ['Registration Date', registrationDate],
    ['Patient Name', patient.fullName],
    ["Father's/Guardian's Name", patient.guardianName || '-'],
    ['Age', patient.age],
    ['Gender', patient.gender],
    ['Phone Number', patient.phone],
    ['Address', patient.address || '-'],
  ];

  return (
    <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Patient Details</h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
