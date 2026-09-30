// Letterhead content for printable slips, transcribed from the clinic's paper
// prescription pad. The Urdu lines and registration numbers were read off a
// photo -- double check them against the real pad before relying on printouts,
// since this appears on an official medical document (PMDC/PHC numbers).
export const CLINIC_INFO = {
  clinicNameEnglish: 'Usman Laser Eye Clinic',
  clinicNameUrdu: 'عثمان لیزر آئی کلینک',
  address: 'Haidry chok, Near RHC Narang Mandi',
  muridkeAddress: 'Zafar Plaza, Muridke',
  motto: 'هوالشافی',
  doctor: {
    nameEnglish: 'Dr. Usman Rasheed Bhatti',
    nameUrdu: 'ڈاکٹر عثمان رشید بھٹی',
    credentialsEnglish: [
      'PHC REG. NO.R&L 2026/95529 (Muridke)',
      'M.B.B.S (Pb). F.C.P.S',
      'Member European Society of Cataract',
      '& Refractive Surgeons',
      'Member Ophthalmic Society of Pak.',
      'Consultant Eye Surgeon M Islam Teaching',
      'Hospital & Medical College Gujranwala',
    ],
    credentialsUrdu: [
      'PHC REG. NO.R&L 2026/72404 (Narang)',
      'ایم۔بی۔بی۔ایس (پنجاب)، ایف۔سی۔پی۔ایس',
      'ممبر یورپین سوسائٹی آف کیٹاریکٹ اینڈ ریفریکٹیو سرجنز',
      'ممبر آنکھوں کی سوسائٹی آف پاکستان',
      'کنسلٹنٹ آئی سرجن، ایم اسلام ٹیچنگ ہسپتال اینڈ میڈیکل کالج گوجرانوالہ',
      'PMDC REG.NO.96989-P',
    ],
  },
  footerNote: 'NOT VALID FOR COURT',
};

export const DEFAULT_CONSULTATION_FEE = 1000;

// Routine vitals defaults for the printed consultation slip -- these are the
// clinic's standard baseline readings, shown unless the doctor overrides them
// for a specific patient.
export const DEFAULT_VITALS = {
  bloodPressure: '120/70 mmHg',
  pulse: '74 bpm',
  temperature: '98F',
  allergy: 'Nil',
};
