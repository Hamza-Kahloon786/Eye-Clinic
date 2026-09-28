import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const EMPTY_FORM = {
  fullName: '',
  guardianName: '',
  age: '',
  gender: 'Male',
  phone: '',
  address: '',
};

export default function PatientForm({ onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, age: Number(form.age) });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input label="Patient Name" name="fullName" value={form.fullName} onChange={handleChange} required />
      <Input
        label="Father's/Guardian's Name"
        name="guardianName"
        value={form.guardianName}
        onChange={handleChange}
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Age" name="age" type="number" min="0" value={form.age} onChange={handleChange} required />
        </div>
        <label className="flex flex-1 flex-col gap-1 text-sm text-gray-700">
          <span className="font-medium">Gender</span>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>
      <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required />
      <Input label="Address" name="address" value={form.address} onChange={handleChange} />

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Register Patient'}
        </Button>
      </div>
    </form>
  );
}
