import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Sparkles, Clock3 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Input from '../components/common/Input';
import EyeLogo from '../components/consultation/EyeLogo';

const HOME_BY_ROLE = {
  receptionist: '/receptionist',
  doctor: '/doctor',
  optical: '/optical',
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(username, password);
      navigate(HOME_BY_ROLE[user.role] || '/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen font-home">
      {/* ================= BRAND PANEL ================= */}
      <div
        className="relative hidden w-[46%] flex-col justify-between overflow-hidden px-12 py-10 text-white lg:flex"
        style={{
          background:
            'radial-gradient(700px 340px at 12% 0%, rgba(56,189,248,0.35), transparent 65%), radial-gradient(520px 300px at 95% 100%, rgba(245,158,11,0.22), transparent 65%), linear-gradient(160deg, #0c4a6e 0%, #082f49 70%, #041526 100%)',
        }}
      >
        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <EyeLogo className="h-8 w-11" />
          <span className="font-display text-[1.05rem] font-semibold leading-tight">
            Usman Laser
            <span className="block font-home text-[0.62rem] font-medium uppercase tracking-wider text-sky-200/70">
              Eye Clinic &amp; Optical
            </span>
          </span>
        </Link>

        <div className="relative z-10">
          <h1 className="max-w-md font-display text-[2.1rem] font-semibold leading-tight text-balance">
            Staff access for the clinic that never rushes an exam.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-sky-100/70">
            Sign in to manage the queue, consultations, pharmacy and optical dispensary from one dashboard.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            {[
              { icon: ShieldCheck, text: 'Role-based access for every desk' },
              { icon: Clock3, text: 'Live queue & appointment tracking' },
              { icon: Sparkles, text: 'One system for clinic and optical' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm text-sky-50/85">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <f.icon className="h-4 w-4" />
                </span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-sky-100/40">
          &copy; {new Date().getFullYear()} Usman Laser Eye Clinic. Internal staff portal.
        </p>
      </div>

      {/* ================= FORM PANEL ================= */}
      <div className="flex flex-1 flex-col justify-between bg-slate-50 px-6 py-8 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between lg:justify-end">
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <EyeLogo className="h-7 w-10" />
            <span className="font-display text-sm font-semibold text-sky-950">Usman Laser Eye Clinic</span>
          </Link>
          <Link
            to="/"
            className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors duration-150 hover:text-sky-700 lg:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-sky-950 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Staff Portal
          </span>

          <h2 className="mt-5 font-display text-[1.9rem] font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in with your clinic credentials to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
              placeholder="e.g. receptionist"
              className="py-2.5"
            />

            <label className="flex flex-col gap-1.5 text-sm text-gray-700">
              <span className="font-medium text-gray-700">Password</span>
              <span className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm transition-all duration-150 placeholder:text-gray-400 hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 flex h-6 w-6 items-center justify-center rounded text-gray-400 transition-colors duration-150 hover:text-sky-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(14,165,233,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-[0_14px_28px_rgba(14,165,233,0.36)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-sky-300 disabled:shadow-none"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Accounts are provisioned by the clinic administrator. Contact the front desk if you need access.
          </p>
        </div>

        <div className="hidden lg:block" />
      </div>
    </div>
  );
}
