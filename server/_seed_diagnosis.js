require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Diagnosis = require('./src/models/Diagnosis');

const DIAGNOSES = [
  {
    name: 'NPDR e CSME',
    prescription: ['Venec Eye drop', 'صبح دوپہر شام ایک قطرہ', 'Tab Leutek', 'روزانہ ایک گولی'].join('\n'),
  },
  {
    name: 'Anterior Blepharitis',
    prescription: [
      'Cetapred Eye ointment',
      'صبح شام آنکھوں میں لگائیں اور جڑوں میں لگائیں',
      'Lubricant Eye drop',
      'ہر ایک گھنٹے کے بعد ایک قطرہ',
      'Obradex Eye drop',
      'صبح دوپہر شام ایک قطرہ',
    ].join('\n'),
  },
  {
    name: 'Viral Conjunctivitis',
    prescription: [
      'Obradex eye drop',
      'ہر ایک گھنٹے بعد ایک قطرہ',
      'Venec eye drop',
      'صبح شام ایک قطرہ',
      'Lubricant Eye drop',
      'ہر ایک گھنٹے بعد ایک قطرہ',
      'ہاتھوں کو بار بار اچھی طرح دھوئیں',
    ].join('\n'),
  },
  {
    name: 'Allergic Conjunctivitis',
    prescription: [
      'Obradex eye drop',
      'ہر گھنٹے بعد ایک قطرہ',
      'Venec Eye drop',
      'صبح دوپہر شام ایک قطرہ',
      'Cetapred Eye ointment',
      'روزانہ آنکھ میں ڈالنی ہے سوتے ہوئے',
    ].join('\n'),
  },
  {
    name: 'NLD Blockage',
    prescription: [
      'Fusitek eye drop',
      'صبح دوپہر شام ایک قطرہ',
      'Lacrimal Massage',
      'مساج 30 دفع کرنا ہے',
      'مساج 9 مہینے جاری رکھنا ہے',
    ].join('\n'),
  },
  {
    name: 'Phaco Cataract Surgery',
    prescription: [
      'Eyemox Eye drop',
      'ہر گھنٹے بعد ایک قطرہ',
      'Obradex eye drop',
      'ہر گھنٹے بعد ایک قطرہ',
      'Venec Eye Drop',
      'صبح دوپہر شام ایک قطرہ',
    ].join('\n'),
  },
];

async function run() {
  await connectDB();

  for (const { name, prescription } of DIAGNOSES) {
    const existing = await Diagnosis.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      existing.defaultPrescription = prescription;
      await existing.save();
      console.log(`Updated existing diagnosis "${existing.name}" with default prescription.`);
    } else {
      const created = await Diagnosis.create({ name, defaultPrescription: prescription });
      console.log(`Created diagnosis "${created.name}" with default prescription.`);
    }
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
