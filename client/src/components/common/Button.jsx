const VARIANTS = {
  primary: 'bg-sky-600 text-white shadow-sm hover:bg-sky-700 hover:shadow-md disabled:bg-sky-300 disabled:shadow-none',
  secondary:
    'bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 hover:border-gray-400 disabled:text-gray-400 disabled:border-gray-200',
  success:
    'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md disabled:bg-emerald-300 disabled:shadow-none',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md disabled:bg-red-300 disabled:shadow-none',
};

export default function Button({ variant = 'primary', icon: Icon, className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
