import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-gray-100 text-gray-600">
      <p className="text-2xl font-semibold">404</p>
      <p>Page not found.</p>
      <Link to="/" className="text-sky-600 hover:underline">
        Go home
      </Link>
    </div>
  );
}
