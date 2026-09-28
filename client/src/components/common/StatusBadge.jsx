const STYLES = {
  waiting: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  'in-progress': 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  done: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  scheduled: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200',
  'checked-in': 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  cancelled: 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200',
  suggested: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  delayed: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
};

const DOT_STYLES = {
  waiting: 'bg-amber-500',
  'in-progress': 'bg-sky-500',
  done: 'bg-emerald-500',
  scheduled: 'bg-purple-500',
  'checked-in': 'bg-sky-500',
  cancelled: 'bg-gray-400',
  suggested: 'bg-purple-500',
  completed: 'bg-emerald-500',
  delayed: 'bg-amber-500',
};

const LABELS = {
  waiting: 'Waiting',
  'in-progress': 'In Progress',
  done: 'Done',
  scheduled: 'Scheduled',
  'checked-in': 'Checked In',
  cancelled: 'Cancelled',
  suggested: 'Suggested',
  completed: 'Completed',
  delayed: 'Delayed',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status] || 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200'}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status] || 'bg-gray-400'}`} />
      {LABELS[status] || status}
    </span>
  );
}
