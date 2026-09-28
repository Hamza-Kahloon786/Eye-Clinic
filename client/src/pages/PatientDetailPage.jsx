import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PatientDetailCard from '../components/patient/PatientDetailCard';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import DataTable, { EmptyState } from '../components/common/DataTable';
import ClinicalRecordsTable from '../components/records/ClinicalRecordsTable';
import RecordDetailModal from '../components/records/RecordDetailModal';
import { getPatient, getPatientTokens } from '../api/patientApi';
import { getPatientRecords } from '../api/recordApi';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingRecord, setViewingRecord] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [patientData, tokenData, recordData] = await Promise.all([
          getPatient(id),
          getPatientTokens(id),
          getPatientRecords(id),
        ]);
        if (!cancelled) {
          setPatient(patientData);
          setTokens(tokenData);
          setRecords(recordData);
        }
      } catch (err) {
        if (!cancelled) toast.error('Failed to load patient');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <p className="text-sm text-gray-500">Patient not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition-colors duration-150 hover:text-sky-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="flex flex-col gap-6">
        <PatientDetailCard patient={patient} />

        <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Visit History</h2>
          {tokens.length === 0 ? (
            <EmptyState message="No visits recorded yet." />
          ) : (
            <DataTable>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Token #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {tokens.map((t) => (
                  <tr key={t._id} className="transition-colors duration-150 hover:bg-sky-50/40">
                    <td className="px-4 py-3 text-gray-900">{t.date}</td>
                    <td className="px-4 py-3 font-semibold text-sky-700">{t.tokenNumber}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </div>

        <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Clinical Records</h2>
          <ClinicalRecordsTable records={records} onView={setViewingRecord} />
        </div>
      </div>

      <RecordDetailModal record={viewingRecord} onClose={() => setViewingRecord(null)} />
    </Layout>
  );
}
