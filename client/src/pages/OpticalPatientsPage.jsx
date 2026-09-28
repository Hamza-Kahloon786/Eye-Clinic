import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, RotateCcw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import GlassesSuggestionsTable from '../components/optical/GlassesSuggestionsTable';
import GlassesSuggestionDetailModal from '../components/optical/GlassesSuggestionDetailModal';
import { getAllSuggestions } from '../api/glassesApi';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'suggested', label: 'Suggested' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OpticalPatientsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingSuggestion, setViewingSuggestion] = useState(null);

  const load = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await getAllSuggestions(params);
      setSuggestions(data);
    } catch (err) {
      toast.error('Failed to load glasses suggestions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({});
  }, [load]);

  function handleSearch(e) {
    e.preventDefault();
    load({ query, status });
  }

  function handleReset() {
    setQuery('');
    setStatus('');
    load({});
  }

  function handleUpdated(updated) {
    setSuggestions((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
    setViewingSuggestion(updated);
  }

  return (
    <Layout>
      <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <h1 className="mb-4 text-lg font-semibold text-gray-900">Glasses Suggestions</h1>

        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <Input
              label="Search patient (name, phone, or MR number)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Ali Raza, 03001234567, MR-000001"
            />
          </div>
          <label className="flex flex-col gap-1.5 text-sm text-gray-700">
            <span className="font-medium text-gray-700">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-all duration-150 hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" icon={Search}>
            Search
          </Button>
          <Button type="button" variant="secondary" icon={RotateCcw} onClick={handleReset}>
            Reset
          </Button>
        </form>

        {loading ? (
          <Loader />
        ) : (
          <div className="mt-4">
            <GlassesSuggestionsTable suggestions={suggestions} onView={setViewingSuggestion} showPatient />
          </div>
        )}
      </div>

      <GlassesSuggestionDetailModal
        suggestion={viewingSuggestion}
        editable
        onClose={() => setViewingSuggestion(null)}
        onUpdated={handleUpdated}
      />
    </Layout>
  );
}
