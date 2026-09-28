export default function DataTable({ children, maxHeightClassName = '' }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
      <div className={`thin-scrollbar overflow-x-auto ${maxHeightClassName ? `${maxHeightClassName} overflow-y-auto` : ''}`}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">{children}</table>
      </div>
    </div>
  );
}

export function EmptyState({ message }) {
  return <p className="mt-4 rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">{message}</p>;
}
