import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Glasses } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PatientSearchForm from '../components/patient/PatientSearchForm';
import PatientSearchResults from '../components/patient/PatientSearchResults';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import GlassesSuggestionsTable from '../components/optical/GlassesSuggestionsTable';
import GlassesSuggestionForm from '../components/optical/GlassesSuggestionForm';
import GlassesSuggestionDetailModal from '../components/optical/GlassesSuggestionDetailModal';
import { searchPatients } from '../api/patientApi';
import { getPatientSuggestions, deleteSuggestion } from '../api/glassesApi';

export default function DoctorOpticalPage() {
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState(null);
  const [viewingSuggestion, setViewingSuggestion] = useState(null);

  async function handleSearch(query) {
    setSearching(true);
    try {
      const data = await searchPatients(query);
      setResults(data);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  }

  async function openPatient(patient) {
    setSelectedPatient(patient);
    setResults(null);
    setSuggestionsLoading(true);
    try {
      const data = await getPatientSuggestions(patient._id);
      setSuggestions(data);
    } catch (err) {
      toast.error('Failed to load glasses suggestions');
    } finally {
      setSuggestionsLoading(false);
    }
  }

  function backToPatients() {
    setSelectedPatient(null);
    setSuggestions([]);
  }

  function handleSaved(suggestion) {
    setSuggestions((prev) => {
      const exists = prev.some((s) => s._id === suggestion._id);
      return exists ? prev.map((s) => (s._id === suggestion._id ? suggestion : s)) : [suggestion, ...prev];
    });
    setShowSuggestModal(false);
    setEditingSuggestion(null);
  }

  function openCreateModal() {
    setEditingSuggestion(null);
    setShowSuggestModal(true);
  }

  function openEditModal(suggestion) {
    setEditingSuggestion(suggestion);
    setShowSuggestModal(true);
  }

  function closeSuggestModal() {
    setShowSuggestModal(false);
    setEditingSuggestion(null);
  }

  async function handleDelete(suggestion) {
    if (!window.confirm(`Delete this glasses suggestion for ${selectedPatient.fullName}?`)) return;
    try {
      await deleteSuggestion(suggestion._id);
      setSuggestions((prev) => prev.filter((s) => s._id !== suggestion._id));
      toast.success('Glasses suggestion deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete glasses suggestion');
    }
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
              <Button icon={Glasses} onClick={openCreateModal}>
                Suggest Glasses
              </Button>
            </div>

            {suggestionsLoading ? (
              <Loader />
            ) : (
              <GlassesSuggestionsTable
                suggestions={suggestions}
                onView={setViewingSuggestion}
                onEdit={openEditModal}
                onDelete={handleDelete}
                emptyMessage="No glasses suggestions yet for this patient."
              />
            )}
          </>
        ) : (
          <>
            <h1 className="mb-4 text-lg font-semibold text-gray-900">Optical</h1>
            <PatientSearchForm onSearch={handleSearch} />

            {searching && <Loader label="Searching..." />}
            {!searching && results && <PatientSearchResults patients={results} onSelect={openPatient} />}
          </>
        )}
      </div>

      <Modal
        open={showSuggestModal}
        onClose={closeSuggestModal}
        title={editingSuggestion ? 'Edit Glasses Suggestion' : 'Suggest Glasses'}
      >
        {selectedPatient && (
          <GlassesSuggestionForm
            patientId={selectedPatient._id}
            suggestion={editingSuggestion}
            onSaved={handleSaved}
            onCancel={closeSuggestModal}
          />
        )}
      </Modal>

      <GlassesSuggestionDetailModal
        suggestion={viewingSuggestion}
        editable={false}
        onClose={() => setViewingSuggestion(null)}
      />
    </Layout>
  );
}
