import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListOrdered,
  CalendarClock,
  ClipboardList,
  Stethoscope,
  Pill,
  Glasses,
  Users,
  History,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import EyeLogo from '../consultation/EyeLogo';

const NAV_ITEMS_BY_ROLE = {
  doctor: [
    { to: '/doctor', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/doctor/queue', label: 'Queue', icon: ListOrdered },
    { to: '/doctor/appointments', label: 'Appointments', icon: CalendarClock },
    { to: '/doctor/records', label: 'Records', icon: ClipboardList },
    { to: '/doctor/diagnoses', label: 'Diagnoses', icon: Stethoscope },
    { to: '/doctor/optical', label: 'Optical', icon: Glasses },
    { to: '/doctor/pharmacy', label: 'Pharmacy', icon: Pill },
    { to: '/doctor/history', label: 'History', icon: History },
  ],
  receptionist: [
    { to: '/receptionist', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/receptionist/queue', label: 'Queue', icon: ListOrdered },
    { to: '/receptionist/appointments', label: 'Appointments', icon: CalendarClock },
    { to: '/receptionist/pharmacy', label: 'Pharmacy', icon: Pill },
  ],
  optical: [
    { to: '/optical', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/optical/patients', label: 'Patients', icon: Users },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = NAV_ITEMS_BY_ROLE[user?.role] || [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm animate-fade-in lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col border-r border-gray-200/70 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-1.5 border-b border-gray-100 px-3 py-3.5">
          <div className="flex items-center gap-1.5">
            <EyeLogo className="h-6 w-8" />
            <div className="leading-tight">
              <p className="text-xs font-bold text-gray-900">Usman Laser</p>
              <p className="text-[11px] text-gray-500">Eye Clinic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="thin-scrollbar flex-1 overflow-y-auto px-2 py-4">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Menu</p>
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150 ${
                        isActive
                          ? 'bg-sky-50 text-sky-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sky-600 transition-opacity duration-150 ${
                            isActive ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 transition-colors duration-150 ${
                            isActive ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'
                          }`}
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-gray-100 px-3 py-3">
          <p className="text-[10px] leading-tight text-gray-400">&copy; {new Date().getFullYear()} Usman Laser Eye Clinic</p>
        </div>
      </aside>
    </>
  );
}
