const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const clinicalRecordRoutes = require('./routes/clinicalRecordRoutes');
const statsRoutes = require('./routes/statsRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const glassesSuggestionRoutes = require('./routes/glassesSuggestionRoutes');
const saleRoutes = require('./routes/saleRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// CLIENT_URL may be a comma-separated list (e.g. the Vercel URL plus localhost).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/records', clinicalRecordRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/glasses', glassesSuggestionRoutes);
app.use('/api/sales', saleRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
