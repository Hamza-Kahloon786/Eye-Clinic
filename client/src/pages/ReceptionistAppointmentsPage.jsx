import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import AppointmentsTable from '../components/appointment/AppointmentsTable';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TokenSlip from '../components/token/TokenSlip';
import { getAppointments, checkInAppointment, cancelAppointment } from '../api/appointmentApi';
import { DEFAULT_CONSULTATION_FEE } from '../constants/clinicInfo';
import { getTodayDateString } from '../utils/dateUtils';

export default function ReceptionistAppointmentsPage() {
  const [appointmentsDate, setAppointmentsDate] = useState(getTodayDateString());
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [checkInTarget, setCheckInTarget] = useState(null);
  const [checkInFee, setCheckInFee] = useState(DEFAULT_CONSULTATION_FEE);
  const [checkingIn, setCheckingIn] = useState(false);
  const [issuedToken, setIssuedToken] = useState(null);

  const loadAppointments = useCallback(async (date) => {
    setAppointmentsLoading(true);
    try {
      const data = await getAppointments(date);
      setAppointments(data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments(appointmentsDate);
  }, [appointmentsDate, loadAppointments]);

  function openCheckIn(appointment) {
    setCheckInTarget(appointment);
    setCheckInFee(DEFAULT_CONSULTATION_FEE);
  }

  async function handleCheckIn() {
    if (!checkInTarget) return;
    setCheckingIn(true);
    try {
      const updated = await checkInAppointment(checkInTarget._id, checkInFee);
      setCheckInTarget(null);
      setIssuedToken(updated.token);
      loadAppointments(appointmentsDate);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  }

  async function handleCancelAppointment(appointment) {
    if (!window.confirm(`Cancel the appointment for ${appointment.patient.fullName}?`)) return;
    try {
      await cancelAppointment(appointment._id);
      toast.success('Appointment cancelled');
      loadAppointments(appointmentsDate);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  }

  return (
    <Layout>
      <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600">
              <CalendarClock className="h-4 w-4" />
            </span>
            Appointments
          </h1>
          <Input type="date" value={appointmentsDate} onChange={(e) => setAppointmentsDate(e.target.value)} />
        </div>

        {appointmentsLoading ? (
          <Loader />
        ) : (
          <AppointmentsTable appointments={appointments} onCheckIn={openCheckIn} onCancel={handleCancelAppointment} />
        )}
      </div>

      <Modal open={!!checkInTarget} onClose={() => setCheckInTarget(null)} title="Check In">
        {checkInTarget && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-700">
              Checking in <span className="font-semibold">{checkInTarget.patient.fullName}</span> will generate
              today's token for them.
            </p>
            <Input
              label="Fee (Rs)"
              type="number"
              min="0"
              value={checkInFee}
              onChange={(e) => setCheckInFee(e.target.value)}
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCheckInTarget(null)}>
                Cancel
              </Button>
              <Button onClick={handleCheckIn} disabled={checkingIn}>
                {checkingIn ? 'Checking in...' : 'Confirm Check In'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!issuedToken} onClose={() => setIssuedToken(null)} title="Token Generated">
        {issuedToken && <TokenSlip token={issuedToken} onClose={() => setIssuedToken(null)} />}
      </Modal>
    </Layout>
  );
}
