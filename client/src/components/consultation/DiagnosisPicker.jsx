import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Check } from 'lucide-react';
import { getDiagnoses, createDiagnosis } from '../../api/diagnosisApi';
import { updateTokenDiagnosis } from '../../api/tokenApi';

export default function DiagnosisPicker({ tokenId, value, onChange, onSelectDiagnosis }) {
  const [diagnoses, setDiagnoses] = useState([]);
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    getDiagnoses()
      .then(setDiagnoses)
      .catch(() => toast.error('Failed to load diagnosis list'));
  }, []);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery(value || '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return diagnoses;
    return diagnoses.filter((d) => d.name.toLowerCase().includes(q));
  }, [diagnoses, query]);

  const exactMatch = useMemo(
    () => diagnoses.some((d) => d.name.toLowerCase() === query.trim().toLowerCase()),
    [diagnoses, query]
  );
  const showAddOption = query.trim() && !exactMatch;

  const totalOptions = suggestions.length + (showAddOption ? 1 : 0);

  async function save(diagnosis) {
    setSaving(true);
    try {
      const updated = await updateTokenDiagnosis(tokenId, diagnosis);
      onChange(updated.diagnosis);
      setQuery(updated.diagnosis || '');
      toast.success('Diagnosis saved');
    } catch (err) {
      toast.error('Failed to save diagnosis');
    } finally {
      setSaving(false);
      setOpen(false);
    }
  }

  async function handleSelect(diagnosis) {
    await save(diagnosis.name);
    onSelectDiagnosis?.(diagnosis);
  }

  async function handleAddNew() {
    const name = query.trim();
    if (!name) return;
    setSaving(true);
    try {
      const diagnosis = await createDiagnosis(name);
      setDiagnoses((prev) =>
        prev.some((d) => d._id === diagnosis._id)
          ? prev
          : [...prev, diagnosis].sort((a, b) => a.name.localeCompare(b.name))
      );
      await save(diagnosis.name);
    } catch (err) {
      toast.error('Failed to add diagnosis');
      setSaving(false);
    }
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, totalOptions - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      } else if (showAddOption) {
        handleAddNew();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery(value || '');
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1 text-sm text-gray-700">
      <span className="font-medium">Diagnosis</span>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          placeholder="Search or add a diagnosis..."
          className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm transition-all duration-150 placeholder:text-gray-400 hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
      </div>

      {open && (
        <div className="thin-scrollbar animate-fade-in absolute top-full z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {suggestions.length === 0 && !showAddOption && (
            <p className="px-3 py-2 text-sm text-gray-500">No diagnoses found.</p>
          )}
          {suggestions.map((d, idx) => (
            <button
              key={d._id}
              type="button"
              onMouseEnter={() => setHighlightedIndex(idx)}
              onClick={() => handleSelect(d)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors duration-100 ${
                idx === highlightedIndex ? 'bg-sky-50 text-sky-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {d.name}
              {value === d.name && <Check className="h-4 w-4 text-sky-600" />}
            </button>
          ))}
          {showAddOption && (
            <button
              type="button"
              onMouseEnter={() => setHighlightedIndex(suggestions.length)}
              onClick={handleAddNew}
              className={`flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm font-medium transition-colors duration-100 ${
                highlightedIndex === suggestions.length ? 'bg-sky-50 text-sky-700' : 'text-sky-600 hover:bg-gray-50'
              }`}
            >
              <Plus className="h-4 w-4" />
              Add "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
