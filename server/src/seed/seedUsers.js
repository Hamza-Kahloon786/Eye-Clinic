require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedUser({ username, password, role, fullName }) {
  const existing = await User.findOne({ username });
  if (existing) {
    console.log(`User already exists, skipping: ${username}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, passwordHash, role, fullName });
  console.log(`Created ${role} user: ${username}`);
}

async function run() {
  await connectDB();

  await seedUser({
    username: (process.env.SEED_RECEPTIONIST_USERNAME || 'receptionist').toLowerCase(),
    password: process.env.SEED_RECEPTIONIST_PASSWORD || 'Reception@123',
    role: 'receptionist',
    fullName: 'Front Desk',
  });

  await seedUser({
    username: (process.env.SEED_DOCTOR_USERNAME || 'doctor').toLowerCase(),
    password: process.env.SEED_DOCTOR_PASSWORD || 'Doctor@123',
    role: 'doctor',
    fullName: 'Dr. Usman',
  });

  await seedUser({
    username: (process.env.SEED_OPTICAL_USERNAME || 'optical').toLowerCase(),
    password: process.env.SEED_OPTICAL_PASSWORD || 'Optical@123',
    role: 'optical',
    fullName: 'Optical Desk',
  });

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
