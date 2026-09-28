import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { getTodayDateString } from '../../utils/dateUtils';

export default function AppointmentBookingForm({ onSubmit, onCancel, submitting }) {
  const [scheduledDate, setScheduledDate] = useState(getTodayDateString());
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ scheduledDate, scheduledTime, notes });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        label="Date"
        type="date"
        value={scheduledDate}
        onChange={(e) => setScheduledDate(e.target.value)}
        required
      />
      <Input
        label="Time"
        type="time"
        value={scheduledTime}
        onChange={(e) => setScheduledTime(e.target.value)}
        required
      />
      <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Booking...' : 'Book Appointment'}
        </Button>
      </div>
    </form>
  );
}
