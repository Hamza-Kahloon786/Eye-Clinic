import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, RotateCcw, ArrowLeft, Printer, Download } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import PatientRecordsSummaryTable from '../components/records/PatientRecordsSummaryTable';
import ClinicalRecordsTable from '../components/records/ClinicalRecordsTable';
import RecordDetailModal from '../components/records/RecordDetailModal';
import PatientRecordsPrintout from '../components/records/PatientRecordsPrintout';
import { getPatientsWithRecords, getPatientRecords } from '../api/recordApi';

export default function DoctorRecordsPage() {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [patientRecordsLoading, setPatientRecordsLoading] = useState(false);
  const [recordDateFilter, setRecordDateFilter] = useState('');

  const [viewingRecord, setViewingRecord] = useState(null);
  const [printingRecord, setPrintingRecord] = useState(null);

  const loadGroups = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await getPatientsWithRecords(params);
      setGroups(data);
    } catch (err) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups({});
  }, [loadGroups]);

  function handleSearch(e) {
    e.preventDefault();
    loadGroups({ query, date });
  }

  function handleReset() {
    setQuery('');
    setDate('');
    loadGroups({});
  }

  async function openPatient(patient) {
    setSelectedPatient(patient);
    setPatientRecordsLoading(true);
    try {
      const data = await getPatientRecords(patient._id);
      setPatientRecords(data);
    } catch (err) {
      toast.error('Failed to load patient records');
    } finally {
      setPatientRecordsLoading(false);
    }
  }

  function backToPatients() {
    setSelectedPatient(null);
    setPatientRecords([]);
    setRecordDateFilter('');
  }

  const filteredPatientRecords = useMemo(() => {
    if (!recordDateFilter) return patientRecords;
    return patientRecords.filter((r) => r.date === recordDateFilter);
  }, [patientRecords, recordDateFilter]);

  function printRecord(record) {
    setPrintingRecord(record);
    // Wait for the hidden printout to render with this record before opening the print dialog.
    requestAnimationFrame(() => window.print());
  }

  function printAllRecords() {
    setPrintingRecord(null);
    requestAnimationFrame(() => window.print());
  }

  return (
    <Layout>
      <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        {selectedPatient ? (
          <>
            <button
              onClick={backToPatients}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition-colors duration-150 hover:text-sky-700 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to patients
            </button>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{selectedPatient.fullName}</h1>
                <p className="text-sm text-gray-500">
                  {selectedPatient.mrNumber} &middot; {selectedPatient.age} / {selectedPatient.gender} &middot;{' '}
                  {selectedPatient.phone}
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <Input
                  label="Filter by date"
                  type="date"
                  value={recordDateFilter}
                  onChange={(e) => setRecordDateFilter(e.target.value)}
                />
                {filteredPatientRecords.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="secondary" icon={Printer} onClick={printAllRecords}>
                      Print All
                    </Button>
                    <Button variant="secondary" icon={Download} onClick={printAllRecords}>
                      Download All
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {patientRecordsLoading ? (
              <Loader />
            ) : (
              <>
                <ClinicalRecordsTable
                  records={filteredPatientRecords}
                  onView={setViewingRecord}
                  onPrint={printRecord}
                  onDownload={printRecord}
                  emptyMessage={
                    recordDateFilter ? 'No records found for this date.' : 'No clinical records found.'
                  }
                />
                <div className="print-only">
                  <PatientRecordsPrintout
                    patient={selectedPatient}
                    records={printingRecord ? [printingRecord] : filteredPatientRecords}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <h1 className="mb-4 text-lg font-semibold text-gray-900">Clinical Records</h1>

            <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
              <div className="min-w-[16rem] flex-1">
                <Input
                  label="Search patient (name, phone, or MR number)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Ali Raza, 03001234567, MR-000001"
                />
              </div>
              <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Button type="submit" icon={Search}>
                Search
              </Button>
              <Button type="button" variant="secondary" icon={RotateCcw} onClick={handleReset}>
                Reset
              </Button>
            </form>

            {loading ? <Loader /> : <PatientRecordsSummaryTable groups={groups} onSelectPatient={openPatient} />}
          </>
        )}
      </div>

      <RecordDetailModal record={viewingRecord} onClose={() => setViewingRecord(null)} />
    </Layout>
  );
}
