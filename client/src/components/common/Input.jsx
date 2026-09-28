export default function Input({ label, className = '', ...props }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-gray-700">
      {label && <span className="font-medium text-gray-700">{label}</span>}
      <input
        className={`rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-150 placeholder:text-gray-400 hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${className}`}
        {...props}
      />
    </label>
  );
}
