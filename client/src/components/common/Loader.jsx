export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-gray-500">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-sky-600" />
      {label}
    </div>
  );
}
