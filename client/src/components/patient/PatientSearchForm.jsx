import { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

export default function PatientSearchForm({ onSearch, onRegisterNew }) {
  const [query, setQuery] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(query);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <Input
          label="Search patient (name, phone, or MR number)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Ali Raza, 03001234567, MR-000001"
        />
      </div>
      <Button type="submit" icon={Search}>
        Search
      </Button>
      {onRegisterNew && (
        <Button type="button" variant="secondary" icon={UserPlus} onClick={onRegisterNew}>
          Register New Patient
        </Button>
      )}
    </form>
  );
}
