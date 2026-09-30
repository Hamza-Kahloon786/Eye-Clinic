import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarPlus,
  TicketPlus,
  UserPlus,
  Hourglass,
  ListOrdered,
  CheckCircle2,
  CalendarClock,
  Wallet,
  TrendingDown,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import PatientSearchForm from '../components/patient/PatientSearchForm';
import PatientSearchResults from '../components/patient/PatientSearchResults';
import PatientForm from '../components/patient/PatientForm';
import TokenSlip from '../components/token/TokenSlip';
import AppointmentBookingForm from '../components/appointment/AppointmentBookingForm';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { searchPatients, createPatient } from '../api/patientApi';
import { createToken, getTodayQueue } from '../api/tokenApi';
import { createAppointment, getAppointments } from '../api/appointmentApi';
import { getDashboardStats } from '../api/statsApi';
import { DEFAULT_CONSULTATION_FEE } from '../constants/clinicInfo';
import { getTodayDateString } from '../utils/dateUtils';

const TILE_COLORS = {
  sky: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
};

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200/70 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${TILE_COLORS[color]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function ReceptionistDashboardPage() {
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [fee, setFee] = useState(DEFAULT_CONSULTATION_FEE);
  const [issuedToken, setIssuedToken] = useState(null);
  const [queue, setQueue] = useState([]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [pharmacyStats, setPharmacyStats] = useState({ pharmacyRevenueToday: 0, pharmacyRevenueTotal: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [queueData, appointmentsData, dashboardData] = await Promise.all([
        getTodayQueue(),
        getAppointments(getTodayDateString()),
        getDashboardStats(),
      ]);
      setQueue(queueData);
      setAppointmentsToday(appointmentsData);
      setPharmacyStats(dashboardData);
    } catch (err) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  async function handleSearch(query) {
    setSearching(true);
    setSelectedPatient(null);
    try {
      const data = await searchPatients(query);
      setResults(data);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  }

  async function handleRegister(payload) {
    setRegistering(true);
    try {
      const patient = await createPatient(payload);
      toast.success(`Patient registered: ${patient.mrNumber}`);
      setShowRegisterModal(false);
      setSelectedPatient(patient);
      setResults(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setRegistering(false);
    }
  }

  async function handleGenerateToken(force = false) {
    if (!selectedPatient) return;
    try {
      const token = await createToken(selectedPatient._id, fee, force);
      setIssuedToken(token);
      setSelectedPatient(null);
      setResults(null);
      setFee(DEFAULT_CONSULTATION_FEE);
      loadStats();
    } catch (err) {
      if (err.response?.status === 409) {
        const existing = err.response.data?.existingTokens || [];
        const summary = existing
          .map((t) => `Token #${t.tokenNumber} (${t.status})`)
          .join(', ');
        const confirmed = window.confirm(
          `${selectedPatient.fullName} already has a token today: ${summary || 'an existing token'}.\n\nGenerate another token anyway?`
        );
        if (confirmed) {
          handleGenerateToken(true);
        }
        return;
      }
      toast.error(err.response?.data?.message || 'Failed to generate token');
    }
  }

  async function handleBookAppointment(payload) {
    if (!selectedPatient) return;
    setBooking(true);
    try {
      await createAppointment({ patientId: selectedPatient._id, ...payload });
      toast.success(`Appointment booked for ${selectedPatient.fullName}`);
      setShowBookingModal(false);
      setSelectedPatient(null);
      setResults(null);
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  }

  const stats = useMemo(
    () => ({
      waiting: queue.filter((t) => t.status === 'waiting').length,
      inProgress: queue.filter((t) => t.status === 'in-progress').length,
      done: queue.filter((t) => t.status === 'done').length,
      appointmentsToday: appointmentsToday.length,
    }),
    [queue, appointmentsToday]
  );

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Reception Desk</h1>
        <p className="text-sm text-gray-500">{today}</p>
      </div>

      {statsLoading ? (
        <Loader />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile icon={Hourglass} label="Waiting" value={stats.waiting} color="amber" />
            <StatTile icon={ListOrdered} label="In Progress" value={stats.inProgress} color="sky" />
            <StatTile icon={CheckCircle2} label="Completed Today" value={stats.done} color="emerald" />
            <StatTile icon={CalendarClock} label="Appointments Today" value={stats.appointmentsToday} color="purple" />
          </div>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <StatTile
              icon={Wallet}
              label="Pharmacy Revenue Today"
              value={`Rs ${Number(pharmacyStats.pharmacyRevenueToday || 0).toLocaleString()}`}
              color="emerald"
            />
            <StatTile
              icon={TrendingDown}
              label="Total Pharmacy Revenue"
              value={`Rs ${Number(pharmacyStats.pharmacyRevenueTotal || 0).toLocaleString()}`}
              color="sky"
            />
          </div>
        </>
      )}

      <section className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600">
            <UserPlus className="h-4 w-4" />
          </span>
          Patient Registration
        </h2>
        <PatientSearchForm onSearch={handleSearch} onRegisterNew={() => setShowRegisterModal(true)} />

        {searching && <Loader label="Searching..." />}

        {!searching && results && <PatientSearchResults patients={results} onSelect={setSelectedPatient} />}

        {selectedPatient && (
          <div className="animate-fade-in mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3">
            <div className="text-sm text-gray-800">
              Selected: <span className="font-semibold">{selectedPatient.fullName}</span>{' '}
              <span className="text-gray-500">({selectedPatient.mrNumber})</span>
            </div>
            <div className="flex items-end gap-3">
              <div className="w-28">
                <Input
                  label="Fee (Rs)"
                  type="number"
                  min="0"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                />
              </div>
              <Button variant="secondary" icon={CalendarPlus} onClick={() => setShowBookingModal(true)}>
                Book Appointment
              </Button>
              <Button icon={TicketPlus} onClick={() => handleGenerateToken()}>
                Generate Token
              </Button>
            </div>
          </div>
        )}
      </section>

      <Modal open={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register New Patient">
        <PatientForm
          onSubmit={handleRegister}
          onCancel={() => setShowRegisterModal(false)}
          submitting={registering}
        />
      </Modal>

      <Modal open={showBookingModal} onClose={() => setShowBookingModal(false)} title="Book Appointment">
        <AppointmentBookingForm
          onSubmit={handleBookAppointment}
          onCancel={() => setShowBookingModal(false)}
          submitting={booking}
        />
      </Modal>

      <Modal open={!!issuedToken} onClose={() => setIssuedToken(null)} title="Token Generated">
        {issuedToken && <TokenSlip token={issuedToken} onClose={() => setIssuedToken(null)} />}
      </Modal>
    </Layout>
  );
}
