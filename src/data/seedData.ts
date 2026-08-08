import { Subject, Paper, Section, Question, DailyMission } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-fekah',
    name: 'FEKAH',
    icon: 'BookOpen',
    description: 'Hukum-hakam ibadat, muamalat, wuduk, solat, puasa & kesucian dalam Islam',
    status: 'active',
    color: 'from-mist-400 to-mist-500',
  },
  {
    id: 'sub-akhlak',
    name: 'AKHLAK',
    icon: 'Heart',
    description: 'Adab kepada Allah, ibu bapa, guru, rakan & sifat-sifat mahmudah',
    status: 'active',
    color: 'from-clay-400 to-clay-500',
  },
  {
    id: 'sub-akidah',
    name: 'AQIDAH',
    icon: 'ShieldCheck',
    description: 'Rukun Iman, sifat 20 Allah, tauhid & asas keimanan SPPI 2024',
    status: 'active',
    color: 'from-sage-400 to-sage-500',
  },
  {
    id: 'sub-sirah',
    name: 'SIRAH',
    icon: 'Compass',
    description: 'Sejarah perjuangan Rasulullah SAW & Khulafa Ar-Rasyidin SPPI 2024',
    status: 'active',
    color: 'from-honey-400 to-honey-500',
  },
];
export const INITIAL_PAPERS: Paper[] = [
  {
    id: 'paper-fekah-2016',
    subject_id: 'sub-fekah',
    year: 2016,
    title: 'Kertas Soalan Fekah SPPI 2016',
    status: 'active',
  },
  {
    id: 'paper-fekah-2017',
    subject_id: 'sub-fekah',
    year: 2017,
    title: 'Kertas Soalan Fekah SPPI 2017',
    status: 'active',
  },
  {
    id: 'paper-fekah-2018',
    subject_id: 'sub-fekah',
    year: 2018,
    title: 'Kertas Soalan Fekah SPPI 2018',
    status: 'active',
  },
  {
    id: 'paper-fekah-2024',
    subject_id: 'sub-fekah',
    year: 2024,
    title: 'Kertas Soalan Fekah SPPI 2024',
    status: 'active',
  },
  {
    id: 'paper-akhlak-2021',
    subject_id: 'sub-akhlak',
    year: 'Trial 2021',
    title: 'Kertas Percubaan Akhlak SMKA / SPPI 2021',
    status: 'active',
  },
  {
    id: 'paper-akhlak-2025',
    subject_id: 'sub-akhlak',
    year: 2025,
    title: 'Kertas Soalan Akhlak SPPI 2025',
    status: 'active',
  },
  {
    id: 'paper-akidah-2024',
    subject_id: 'sub-akidah',
    year: 2024,
    title: 'Kertas Soalan Akidah SPPI 2024',
    status: 'active',
  },
  {
    id: 'paper-sirah-2024',
    subject_id: 'sub-sirah',
    year: 2024,
    title: 'Kertas Soalan Sirah Nabawiyah SPPI 2024',
    status: 'active',
  },
];

export const INITIAL_SECTIONS: Section[] = [
  // Fekah 2016
  { id: 'sec-fekah-2016-A', paper_id: 'paper-fekah-2016', name: 'A', title: 'Bahagian A: Soalan Objektif (Asas Ibadah & Taharah)', order: 1 },
  { id: 'sec-fekah-2016-B', paper_id: 'paper-fekah-2016', name: 'B', title: 'Bahagian B: Aplikasi Hukum Solat & Syarat Sah', order: 2 },
  { id: 'sec-fekah-2016-C', paper_id: 'paper-fekah-2016', name: 'C', title: 'Bahagian C: Hikmah & Dalaman Fiqh', order: 3 },

  // Fekah 2017
  { id: 'sec-fekah-2017-A', paper_id: 'paper-fekah-2017', name: 'A', title: 'Bahagian A: Soalan Objektif (Wuduk & Air)', order: 1 },
  { id: 'sec-fekah-2017-B', paper_id: 'paper-fekah-2017', name: 'B', title: 'Bahagian B: Solat Jamak & Qasar Musafir', order: 2 },

  // Fekah 2018
  { id: 'sec-fekah-2018-A', paper_id: 'paper-fekah-2018', name: 'A', title: 'Bahagian A: Soalan Objektif (Najis & Azan)', order: 1 },
  { id: 'sec-fekah-2018-B', paper_id: 'paper-fekah-2018', name: 'B', title: 'Bahagian B: Puasa & Sujud Sahwi', order: 2 },

  // Fekah 2024
  { id: 'sec-fekah-2024-A', paper_id: 'paper-fekah-2024', name: 'A', title: 'Bahagian A: Soalan Objektif (10 Soalan)', order: 1 },
  { id: 'sec-fekah-2024-B1', paper_id: 'paper-fekah-2024', name: 'B (Set 1)', title: 'Bahagian B (Set 1): Soalan Betul / Salah (5 Soalan)', order: 2 },
  { id: 'sec-fekah-2024-B2', paper_id: 'paper-fekah-2024', name: 'B (Set 2)', title: 'Bahagian B (Set 2): Soalan Betul / Salah (5 Soalan)', order: 3 },
  { id: 'sec-fekah-2024-C1', paper_id: 'paper-fekah-2024', name: 'C (Set 1)', title: 'Bahagian C (Set 1): Soalan Subjektif Pilihan Berstruktur (5 Soalan)', order: 4 },
  { id: 'sec-fekah-2024-C2', paper_id: 'paper-fekah-2024', name: 'C (Set 2)', title: 'Bahagian C (Set 2): Soalan Subjektif Pilihan Berstruktur (5 Soalan)', order: 5 },

  // Akhlak Trial 2021
  { id: 'sec-akhlak-2021-A', paper_id: 'paper-akhlak-2021', name: 'A', title: 'Bahagian A: Soalan Objektif (Adab & Sifat Mahmudah)', order: 1 },
  { id: 'sec-akhlak-2021-B', paper_id: 'paper-akhlak-2021', name: 'B', title: 'Bahagian B: Adab Terhadap Ibu Bapa & Guru', order: 2 },

  // Akhlak 2025
  { id: 'sec-akhlak-2025-A', paper_id: 'paper-akhlak-2025', name: 'A', title: 'Bahagian A: Soalan Objektif (10 Soalan)', order: 1 },
  { id: 'sec-akhlak-2025-B1', paper_id: 'paper-akhlak-2025', name: 'B (Set 1)', title: 'Bahagian B (Set 1): Soalan Betul / Salah (5 Soalan)', order: 2 },
  { id: 'sec-akhlak-2025-B2', paper_id: 'paper-akhlak-2025', name: 'B (Set 2)', title: 'Bahagian B (Set 2): Soalan Betul / Salah (5 Soalan)', order: 3 },
  { id: 'sec-akhlak-2025-C1', paper_id: 'paper-akhlak-2025', name: 'C (Set 1)', title: 'Bahagian C (Set 1): Soalan Subjektif Pilihan Berstruktur (5 Soalan)', order: 4 },
  { id: 'sec-akhlak-2025-C2', paper_id: 'paper-akhlak-2025', name: 'C (Set 2)', title: 'Bahagian C (Set 2): Soalan Subjektif Pilihan Berstruktur (5 Soalan)', order: 5 },

  // Akidah 2024
  { id: 'sec-akidah-2024-A', paper_id: 'paper-akidah-2024', name: 'A', title: 'Bahagian A: Soalan Objektif (10 Soalan)', order: 1 },
  { id: 'sec-akidah-2024-B1', paper_id: 'paper-akidah-2024', name: 'B (Set 1)', title: 'Bahagian B (Set 1): Soalan Betul / Salah (5 Soalan)', order: 2 },
  { id: 'sec-akidah-2024-B2', paper_id: 'paper-akidah-2024', name: 'B (Set 2)', title: 'Bahagian B (Set 2): Soalan Betul / Salah (5 Soalan)', order: 3 },
  { id: 'sec-akidah-2024-C1', paper_id: 'paper-akidah-2024', name: 'C (Set 1)', title: 'Bahagian C (Set 1): Soalan Subjektif Pilihan Berstruktur (5 Soalan)', order: 4 },
  { id: 'sec-akidah-2024-C2', paper_id: 'paper-akidah-2024', name: 'C (Set 2)', title: 'Bahagian C (Set 2): Soalan Subjektif Pilihan Berstruktur (5 Soalan)', order: 5 },

  // Sirah 2024
  { id: 'sec-sirah-2024-A', paper_id: 'paper-sirah-2024', name: 'A', title: 'Bahagian A: Soalan Objektif Sirah (10 Soalan)', order: 1 },
  { id: 'sec-sirah-2024-B1', paper_id: 'paper-sirah-2024', name: 'B (Set 1)', title: 'Bahagian B (Set 1): Soalan Betul / Salah Sirah (5 Soalan)', order: 2 },
  { id: 'sec-sirah-2024-B2', paper_id: 'paper-sirah-2024', name: 'B (Set 2)', title: 'Bahagian B (Set 2): Soalan Betul / Salah Sirah (5 Soalan)', order: 3 },
  { id: 'sec-sirah-2024-C1', paper_id: 'paper-sirah-2024', name: 'C (Set 1)', title: 'Bahagian C (Set 1): Subjektif Sirah Nabawiyah (5 Soalan)', order: 4 },
  { id: 'sec-sirah-2024-C2', paper_id: 'paper-sirah-2024', name: 'C (Set 2)', title: 'Bahagian C (Set 2): Subjektif Perjuangan Rasulullah & Sahabat (5 Soalan)', order: 5 },
];

export const INITIAL_QUESTIONS: Question[] = [
  // --- Fekah 2016 Bahagian A ---
  {
    id: 'q-f16a-1',
    section_id: 'sec-fekah-2016-A',
    question_text: 'Apakah hukum bersuci (Thaharah) daripada najis dan hadas sebelum mendirikan solat?',
    explanation: 'Bersuci daripada najis dan hadas adalah Rukun/Syarat Sah solat. Tanpa bersuci, solat tidak sah mengikut syarak.',
    order: 1,
    choices: [
      { id: 'c-f16a-1-1', question_id: 'q-f16a-1', option_text: 'Wajib / Fardu Ain', is_correct: true },
      { id: 'c-f16a-1-2', question_id: 'q-f16a-1', option_text: 'Sunat Muakkad', is_correct: false },
      { id: 'c-f16a-1-3', question_id: 'q-f16a-1', option_text: 'Harus', is_correct: false },
      { id: 'c-f16a-1-4', question_id: 'q-f16a-1', option_text: 'Fardu Kifayah', is_correct: false },
    ],
  },
  {
    id: 'q-f16a-2',
    section_id: 'sec-fekah-2016-A',
    question_text: 'Air Mutlaq ialah air yang suci dan boleh menyucikan yang lain. Manakah antara berikut contoh Air Mutlaq?',
    explanation: 'Air hujan, air sungai, air laut, air embun, air salji dan air mata air adalah contoh Air Mutlaq yang suci lagi menyucikan.',
    order: 2,
    choices: [
      { id: 'c-f16a-2-1', question_id: 'q-f16a-2', option_text: 'Air Hujan & Air Sungai', is_correct: true },
      { id: 'c-f16a-2-2', question_id: 'q-f16a-2', option_text: 'Air Teh & Air Kopi', is_correct: false },
      { id: 'c-f16a-2-3', question_id: 'q-f16a-2', option_text: 'Air Mustakmal yang bertukar rasa', is_correct: false },
      { id: 'c-f16a-2-4', question_id: 'q-f16a-2', option_text: 'Air yang terkena najis walaupun tidak berubah', is_correct: false },
    ],
  },
  {
    id: 'q-f16a-3',
    section_id: 'sec-fekah-2016-A',
    question_text: 'Jarak minima perjalanan yang membolehkan seorang musafir mengasarkan dan menjamakkan solat ialah:',
    explanation: 'Syarat sah solat Jamak dan Qasar bagi musafir ialah jarak perjalanan melebihi 2 marhalah (kira-kira 81 km hingga 89 km).',
    order: 3,
    choices: [
      { id: 'c-f16a-3-1', question_id: 'q-f16a-3', option_text: '2 Marhalah (kira-kira 81km - 89km)', is_correct: true },
      { id: 'c-f16a-3-2', question_id: 'q-f16a-3', option_text: '1 Marhalah (kira-kira 40km)', is_correct: false },
      { id: 'c-f16a-3-3', question_id: 'q-f16a-3', option_text: '50 Kilometer', is_correct: false },
      { id: 'c-f16a-3-4', question_id: 'q-f16a-3', option_text: '3 Marhalah (kira-kira 150km)', is_correct: false },
    ],
  },
  {
    id: 'q-f16a-4',
    section_id: 'sec-fekah-2016-A',
    question_text: 'Apakah jenis najis bagi tahi atau kencing anjing dan babi serta keturunan daripada kedua-duanya?',
    explanation: 'Najis Mughallazah (Najis Berat) ialah anjing dan babi. Cara menyucikannya ialah basuh 7 kali, salah satu daripadanya dengan tanah suci.',
    order: 4,
    choices: [
      { id: 'c-f16a-4-1', question_id: 'q-f16a-4', option_text: 'Najis Mughallazah (Berat)', is_correct: true },
      { id: 'c-f16a-4-2', question_id: 'q-f16a-4', option_text: 'Najis Mukhaffafah (Ringan)', is_correct: false },
      { id: 'c-f16a-4-3', question_id: 'q-f16a-4', option_text: 'Najis Mutawassitah (Sederhana)', is_correct: false },
      { id: 'c-f16a-4-4', question_id: 'q-f16a-4', option_text: 'Najis Ma\'fu (Dimaafkan)', is_correct: false },
    ],
  },
  {
    id: 'q-f16a-5',
    section_id: 'sec-fekah-2016-A',
    question_text: 'Manakah antara berikut MERUPAKAN Rukun Wuduk yang wajib dilaksanakan?',
    explanation: 'Rukun Wuduk ada 6: Niat, membasuh muka, membasuh dua tangan hingga siku, menyapu sebahagian kepala, membasuh dua kaki hingga buku lali, dan Tertib.',
    order: 5,
    choices: [
      { id: 'c-f16a-5-1', question_id: 'q-f16a-5', option_text: 'Membasuh Muka & Niat', is_correct: true },
      { id: 'c-f16a-5-2', question_id: 'q-f16a-5', option_text: 'Berkumur-kumur (Sunat)', is_correct: false },
      { id: 'c-f16a-5-3', question_id: 'q-f16a-5', option_text: 'Memasukkan air ke hidung (Sunat)', is_correct: false },
      { id: 'c-f16a-5-4', question_id: 'q-f16a-5', option_text: 'Menyapu kedua-dua telinga (Sunat)', is_correct: false },
    ],
  },

  // --- Fekah 2016 Bahagian B ---
  {
    id: 'q-f16b-1',
    section_id: 'sec-fekah-2016-B',
    question_text: 'Ahmad lupa membaca Doa Qunut ketika solat Subuh. Sebelum memberi salam, apakah yang sunat dilakukan oleh Ahmad?',
    explanation: 'Sujud Sahwi sunat dilakukan 2 kali sujud sebelum salam apabila tertinggal sunat Ab\'ad seperti Doa Qunut atau Tahiyyat Awal.',
    order: 1,
    choices: [
      { id: 'c-f16b-1-1', question_id: 'q-f16b-1', option_text: 'Sujud Sahwi 2 kali sebelum salam', is_correct: true },
      { id: 'c-f16b-1-2', question_id: 'q-f16b-1', option_text: 'Mengulang semula solat Subuh', is_correct: false },
      { id: 'c-f16b-1-3', question_id: 'q-f16b-1', option_text: 'Sujud Tilawah selepas salam', is_correct: false },
      { id: 'c-f16b-1-4', question_id: 'q-f16b-1', option_text: 'Tidak perlu buat apa-apa dan solat batal', is_correct: false },
    ],
  },
  {
    id: 'q-f16b-2',
    section_id: 'sec-fekah-2016-B',
    question_text: 'Hasan bertolak dari Kuala Lumpur ke Kota Bharu pada jam 2 petang. Beliau menggabungkan solat Zohor dan Asar dalam waktu Asar. Ini dipanggil:',
    explanation: 'Solat Jamak Takhir ialah menghimpunkan dua solat fardu (Zohor & Asar / Maghrib & Isyak) dan mendirikannya dalam waktu solat yang kedua.',
    order: 2,
    choices: [
      { id: 'c-f16b-2-1', question_id: 'q-f16b-2', option_text: 'Solat Jamak Takhir', is_correct: true },
      { id: 'c-f16b-2-2', question_id: 'q-f16b-2', option_text: 'Solat Jamak Taqdim', is_correct: false },
      { id: 'c-f16b-2-3', question_id: 'q-f16b-2', option_text: 'Solat Qadha', is_correct: false },
      { id: 'c-f16b-2-4', question_id: 'q-f16b-2', option_text: 'Solat Hajat', is_correct: false },
    ],
  },

  // --- Fekah 2017 Bahagian A ---
  {
    id: 'q-f17a-1',
    section_id: 'sec-fekah-2017-A',
    question_text: 'Apakah maksud Air Mustakmal mengikut mazhab Syafi\'i?',
    explanation: 'Air Mustakmal ialah air kurang 2 kolah yang telah digunakan untuk membasuh/menyapu fardu wuduk atau mandi wajib.',
    order: 1,
    choices: [
      { id: 'c-f17a-1-1', question_id: 'q-f17a-1', option_text: 'Air suci tetapi tidak boleh menyucikan yang lain', is_correct: true },
      { id: 'c-f17a-1-2', question_id: 'q-f17a-1', option_text: 'Air yang bernajis dan berniat jahat', is_correct: false },
      { id: 'c-f17a-1-3', question_id: 'q-f17a-1', option_text: 'Air yang dipanaskan di bawah sinar matahari', is_correct: false },
      { id: 'c-f17a-1-4', question_id: 'q-f17a-1', option_text: 'Air mutlaq yang lebih daripada dua kolah', is_correct: false },
    ],
  },
  {
    id: 'q-f17a-2',
    section_id: 'sec-fekah-2017-A',
    question_text: 'Berapakah nisbah isi padu air yang menyamai Dua Kolah mengikut sukatan moden?',
    explanation: 'Dua Kolah dianggarkan sekitar 216 liter (atau bekas berbentuk kubus berukuran 1.25 hasta panjang, lebar dan dalam).',
    order: 2,
    choices: [
      { id: 'c-f17a-2-1', question_id: 'q-f17a-2', option_text: 'Kira-kira 216 Liter', is_correct: true },
      { id: 'c-f17a-2-2', question_id: 'q-f17a-2', option_text: 'Kira-kira 100 Liter', is_correct: false },
      { id: 'c-f17a-2-3', question_id: 'q-f17a-2', option_text: '500 Liter', is_correct: false },
      { id: 'c-f17a-2-4', question_id: 'q-f17a-2', option_text: '50 Liter', is_correct: false },
    ],
  },

  // --- Fekah 2018 Bahagian A ---
  {
    id: 'q-f18a-1',
    section_id: 'sec-fekah-2018-A',
    question_text: 'Manakah antara berikut merupakan syarat wajib Puasa Ramadhan?',
    explanation: 'Syarat wajib puasa: Islam, Baligh, Berakal, dan Mampu (Sihat/Tidak keuzuran syar\'i).',
    order: 1,
    choices: [
      { id: 'c-f18a-1-1', question_id: 'q-f18a-1', option_text: 'Islam, Baligh & Berakal', is_correct: true },
      { id: 'c-f18a-1-2', question_id: 'q-f18a-1', option_text: 'Berharta & Kaya', is_correct: false },
      { id: 'c-f18a-1-3', question_id: 'q-f18a-1', option_text: 'Memiliki kenderaan sendiri', is_correct: false },
      { id: 'c-f18a-1-4', question_id: 'q-f18a-1', option_text: 'Berumur 18 tahun ke atas sahaja', is_correct: false },
    ],
  },

  // --- Akhlak Trial 2021 Bahagian A ---
  {
    id: 'q-ak21a-1',
    section_id: 'sec-akhlak-2021-A',
    question_text: 'Berikut adalah adab-adab menuntut ilmu KECUALI:',
    explanation: 'Bersikap sombong dengan ilmu bertentangan dengan adab menuntut ilmu. Penuntut ilmu hendaklah tawaduk dan merendah diri.',
    order: 1,
    choices: [
      { id: 'c-ak21a-1-1', question_id: 'q-ak21a-1', option_text: 'Bersikap sombong dan menunjuk-nunjuk kehebohan ilmu', is_correct: true },
      { id: 'c-ak21a-1-2', question_id: 'q-ak21a-1', option_text: 'Mendoakan kesejahteraan dan menghormati guru', is_correct: false },
      { id: 'c-ak21a-1-3', question_id: 'q-ak21a-1', option_text: 'Ikhlas kerana Allah SWT', is_correct: false },
      { id: 'c-ak21a-1-4', question_id: 'q-ak21a-1', option_text: 'Beramal dengan ilmu yang dipelajari', is_correct: false },
    ],
  },
  {
    id: 'q-ak21a-2',
    section_id: 'sec-akhlak-2021-A',
    question_text: 'Apakah kebaikan berbakti dan beradab sopan kepada ibu bapa (Birrul Walidain)?',
    explanation: 'Berbakti kepada ibu bapa mendapat keredaan Allah SWT ("Rida Allah fi rida al-walidain") dan memurahkan rezeki serta memanjangkan umur.',
    order: 2,
    choices: [
      { id: 'c-ak21a-2-1', question_id: 'q-ak21a-2', option_text: 'Mendapat keredaan Allah & keberkatan hidup', is_correct: true },
      { id: 'c-ak21a-2-2', question_id: 'q-ak21a-2', option_text: 'Mendapat pujian orang ramai di media sosial sahaja', is_correct: false },
      { id: 'c-ak21a-2-3', question_id: 'q-ak21a-2', option_text: 'Mengelakkan daripada diberi tugasan rumah', is_correct: false },
      { id: 'c-ak21a-2-4', question_id: 'q-ak21a-2', option_text: 'Mendapat wang saku yang paling banyak', is_correct: false },
    ],
  },
  {
    id: 'q-ak21a-3',
    section_id: 'sec-akhlak-2021-A',
    question_text: 'Rasulullah SAW bersabda bahawa sifat yang paling dicintai Allah ialah orang yang kuat menahan marahnya. Sifat menahan marah ini dipanggil:',
    explanation: 'Al-Hilm (الحلم) ialah sifat santun, tenang, dan mampu mengawal emosi serta kemarahan.',
    order: 3,
    choices: [
      { id: 'c-ak21a-3-1', question_id: 'q-ak21a-3', option_text: 'Al-Hilm (Menahan Marah & Santun)', is_correct: true },
      { id: 'c-ak21a-3-2', question_id: 'q-ak21a-3', option_text: 'An-Namimah (Adu Domba)', is_correct: false },
      { id: 'c-ak21a-3-3', question_id: 'q-ak21a-3', option_text: 'Al-Ghibah (Mengumpat)', is_correct: false },
      { id: 'c-ak21a-3-4', question_id: 'q-ak21a-3', option_text: 'Al-Hasad (Dengki)', is_correct: false },
    ],
  },

  // --- Akidah 2024 Bahagian A: Soalan Objektif (10 Soalan) ---
  {
    id: 'q-akd24a-1',
    section_id: 'sec-akidah-2024-A',
    question_text: 'Apakah pengertian Akidah dari segi bahasa dan istilah Syarak?',
    explanation: 'Akidah berasal daripada ikatan atau simpulan yang mantap; dari segi syarak ialah iktikad dan kepercayaan yang teguh dalam hati terhadap Allah SWT serta rukun-rukun iman.',
    order: 1,
    choices: [
      { id: 'c-akd24a-1-1', question_id: 'q-akd24a-1', option_text: 'Simpulan/ikatan; Kepercayaan kukuh tanpa ragu terhadap Allah & Rukun Iman', is_correct: true },
      { id: 'c-akd24a-1-2', question_id: 'q-akd24a-1', option_text: 'Perbuatan amalan fizikal seperti solat dan zakat sahaja', is_correct: false },
      { id: 'c-akd24a-1-3', question_id: 'q-akd24a-1', option_text: 'Susunan hukum fiqh muamalat dan jenayah', is_correct: false },
      { id: 'c-akd24a-1-4', question_id: 'q-akd24a-1', option_text: 'Hiasan adab dan kesopanan dalam pergaulan harian', is_correct: false },
    ],
  },
  {
    id: 'q-akd24a-2',
    section_id: 'sec-akidah-2024-A',
    question_text: 'Antara berikut, yang manakah merupakan Rukun Iman yang KETIGA mengikut syarak?',
    explanation: 'Rukun Iman ada 6: 1. Allah, 2. Malaikat, 3. Kitab-kitab, 4. Rasul-rasul, 5. Hari Kiamat, 6. Qada\' & Qadar.',
    order: 2,
    choices: [
      { id: 'c-akd24a-2-1', question_id: 'q-akd24a-2', option_text: 'Beriman kepada Kitab-kitab Allah', is_correct: true },
      { id: 'c-akd24a-2-2', question_id: 'q-akd24a-2', option_text: 'Beriman kepada Malaikat', is_correct: false },
      { id: 'c-akd24a-2-3', question_id: 'q-akd24a-2', option_text: 'Beriman kepada Hari Kiamat', is_correct: false },
      { id: 'c-akd24a-2-4', question_id: 'q-akd24a-2', option_text: 'Beriman kepada Qada\' & Qadar', is_correct: false },
    ],
  },
  {
    id: 'q-akd24a-3',
    section_id: 'sec-akidah-2024-A',
    question_text: 'Sifat "Wujud" (Ada) bagi Allah SWT tergolong dalam kategori sifat:',
    explanation: 'Sifat Wujud tergolong dalam Sifat Nafsiyyah iaitu sifat yang membuktikan kewujudan Zat Allah SWT semata-mata.',
    order: 3,
    choices: [
      { id: 'c-akd24a-3-1', question_id: 'q-akd24a-3', option_text: 'Sifat Nafsiyyah', is_correct: true },
      { id: 'c-akd24a-3-2', question_id: 'q-akd24a-3', option_text: 'Sifat Salbiyyah', is_correct: false },
      { id: 'c-akd24a-3-3', question_id: 'q-akd24a-3', option_text: 'Sifat Ma\'ani', is_correct: false },
      { id: 'c-akd24a-3-4', question_id: 'q-akd24a-3', option_text: 'Sifat Ma\'nawiyyah', is_correct: false },
    ],
  },
  {
    id: 'q-akd24a-4',
    section_id: 'sec-akidah-2024-A',
    question_text: 'Apakah hukum perbuatan menyekutukan Allah SWT dengan sesuatu yang lain (Syirik)?',
    explanation: 'Syirik ialah dosa paling besar dalam Islam yang merosakkan dan membatalkan akidah seseorang jika tidak bertaubat.',
    order: 4,
    choices: [
      { id: 'c-akd24a-4-1', question_id: 'q-akd24a-4', option_text: 'Dosa paling besar yang merosakkan & membatalkan akidah Islam', is_correct: true },
      { id: 'c-akd24a-4-2', question_id: 'q-akd24a-4', option_text: 'Harus dilakukan jika berada dalam keadaan terdesak', is_correct: false },
      { id: 'c-akd24a-4-3', question_id: 'q-akd24a-4', option_text: 'Makruh yang tidak menjejaskan status keimanan', is_correct: false },
      { id: 'c-akd24a-4-4', question_id: 'q-akd24a-4', option_text: 'Dosa kecil yang diampunkan secara automatik', is_correct: false },
    ],
  },
  {
    id: 'q-akd24a-5',
    section_id: 'sec-akidah-2024-A',
    question_text: 'Malaikat Munkar dan Nakir ditugaskan oleh Allah SWT untuk:',
    explanation: 'Malaikat Munkar dan Nakir bertugas menyoal setiap hamba di dalam alam Barzakh (kubur).',
    order: 5,
    choices: [
      { id: 'c-akd24a-5-1', question_id: 'q-akd24a-5', option_text: 'Menyoal hamba di dalam alam Barzakh (kubur)', is_correct: true },
      { id: 'c-akd24a-5-2', question_id: 'q-akd24a-5', option_text: 'Mencatat amalan kebaikan manusia', is_correct: false },
      { id: 'c-akd24a-5-3', question_id: 'q-akd24a-5', option_text: 'Meniup sangkakala tanda bermulanya Hari Kiamat', is_correct: false },
      { id: 'c-akd24a-5-4', question_id: 'q-akd24a-5', option_text: 'Menyampaikan wahyu kepada para Nabi dan Rasul', is_correct: false },
    ],
  },
  {
    id: 'q-akd24a-6',
    section_id: 'sec-akidah-2024-A',
    question_text: 'Apakah maksud sifat Wajib bagi Allah SWT "Qidam"?',
    explanation: 'Qidam bermaksud Allah SWT Maha Sedia Ada tanpa ada permulaan bagi kewujudan-Nya.',
    order: 6,
    choices: [
      { id: 'c-akd24a-6-1', question_id: 'q-akd24a-6', option_text: 'Allah Maha Sedia Ada tanpa permulaan', is_correct: true },
      { id: 'c-akd24a-6-2', question_id: 'q-akd24a-6', option_text: 'Allah Maha Kekal abadi tanpa kebinasaan', is_correct: false },
      { id: 'c-akd24a-6-3', question_id: 'q-akd24a-6', option_text: 'Allah Maha Kuasa atas setiap sesuatu', is_correct: false },
      { id: 'c-akd24a-6-4', question_id: 'q-akd24a-6', option_text: 'Allah Maha Mendengar setiap bisikan makhluk', is_correct: false },
    ],
  },
  {
    id: 'q-akd24a-7',
    section_id: 'sec-akidah-2024-A',
    question_text: 'Kitab suci Injil diturunkan oleh Allah SWT kepada Nabi:',
    explanation: 'Kitab Injil diturunkan kepada Nabi Isa AS; Taurat kepada Nabi Musa AS; Zabur kepada Nabi Daud AS; Al-Quran kepada Nabi Muhammad SAW.',
    order: 7,
    choices: [
      { id: 'c-akd24a-7-1', question_id: 'q-akd24a-7', option_text: 'Nabi Isa AS', is_correct: true },
      { id: 'c-akd24a-7-2', question_id: 'q-akd24a-7', option_text: 'Nabi Musa AS', is_correct: false },
      { id: 'c-akd24a-7-3', question_id: 'q-akd24a-7', option_text: 'Nabi Daud AS', is_correct: false },
      { id: 'c-akd24a-7-4', question_id: 'q-akd24a-7', option_text: 'Nabi Ibrahim AS', is_correct: false },
    ],
  },
  {
    id: 'q-akd24a-8',
    section_id: 'sec-akidah-2024-A',
    question_text: 'Nama Allah SWT "Al-Khaliq" dalam Asmaul Husna membawa maksud Allah Maha:',
    explanation: 'Al-Khaliq bermaksud Allah SWT Maha Pencipta sekalian makhluk dan alam semesta daripada tiada kepada ada.',
    order: 8,
    choices: [
      { id: 'c-akd24a-8-1', question_id: 'q-akd24a-8', option_text: 'Maha Pencipta sekalian alam', is_correct: true },
      { id: 'c-akd24a-8-2', question_id: 'q-akd24a-8', option_text: 'Maha Pengampun segala dosa', is_correct: false },
      { id: 'c-akd24a-8-3', question_id: 'q-akd24a-8', option_text: 'Maha Bijaksana dalam mentadbir', is_correct: false },
      { id: 'c-akd24a-8-4', question_id: 'q-akd24a-8', option_text: 'Maha Memberi Rezeki', is_correct: false },
    ],
  },
  {
    id: 'q-akd24a-9',
    section_id: 'sec-akidah-2024-A',
    question_text: 'Apakah kesan utama beriman kepada Hari Akhirat terhadap sahsiah seorang murid?',
    explanation: 'Meyakini Hari Akhirat mendorong seseorang sentiasa berhati-hati, mendirikan solat, beramal soleh dan menjauhi kejahatan.',
    order: 9,
    choices: [
      { id: 'c-akd24a-9-1', question_id: 'q-akd24a-9', option_text: 'Mendorong murid sentiasa beramal soleh & menjauhi maksiat', is_correct: true },
      { id: 'c-akd24a-9-2', question_id: 'q-akd24a-9', option_text: 'Menjadikan murid mengabaikan pelajaran dan urusan dunia', is_correct: false },
      { id: 'c-akd24a-9-3', question_id: 'q-akd24a-9', option_text: 'Mendorong murid bersikap mementingkan diri sendiri', is_correct: false },
      { id: 'c-akd24a-9-4', question_id: 'q-akd24a-9', option_text: 'Menyebabkan murid gembira melakukan kejahatan', is_correct: false },
    ],
  },
  {
    id: 'q-akd24a-10',
    section_id: 'sec-akidah-2024-A',
    question_text: 'Sabda Nabi SAW mengenai Ihsan bermaksud menyembah Allah SWT seolah-olah kamu melihat-Nya, dan jika kamu tidak melihat-Nya, maka:',
    explanation: 'Rasulullah SAW bersabda: "Ihsan itu ialah kamu menyembah Allah seolah-olah kamu melihat-Nya, dan jika kamu tidak melihat-Nya sesungguhnya Allah melihat kamu."',
    order: 10,
    choices: [
      { id: 'c-akd24a-10-1', question_id: 'q-akd24a-10', option_text: 'Sesungguhnya Allah SWT sentiasa melihat kamu', is_correct: true },
      { id: 'c-akd24a-10-2', question_id: 'q-akd24a-10', option_text: 'Cukuplah sekadar berniat di dalam hati', is_correct: false },
      { id: 'c-akd24a-10-3', question_id: 'q-akd24a-10', option_text: 'Malaikat akan menggantikan ibadat kamu', is_correct: false },
      { id: 'c-akd24a-10-4', question_id: 'q-akd24a-10', option_text: 'Kamu tidak dituntut khusyuk dalam solat', is_correct: false },
    ],
  },

  // --- Akidah 2024 Bahagian B (Set 1): Soalan Betul / Salah (5 Soalan) ---
  {
    id: 'q-akd24b1-1',
    section_id: 'sec-akidah-2024-B1',
    question_text: 'Tauhid Rububiyyah bermaksud meyakini bahawa Allah SWT sahaja yang berhak disembah dan diabdikan diri.',
    explanation: 'SALAH. Meyakini Allah berhak disembah ialah Tauhid Uluhiyyah. Tauhid Rububiyyah bermaksud meyakini Allah ialah Pencipta, Pemilik dan Pentadbir alam.',
    order: 1,
    choices: [
      { id: 'c-akd24b1-1-1', question_id: 'q-akd24b1-1', option_text: 'BETUL', is_correct: false },
      { id: 'c-akd24b1-1-2', question_id: 'q-akd24b1-1', option_text: 'SALAH', is_correct: true },
    ],
  },
  {
    id: 'q-akd24b1-2',
    section_id: 'sec-akidah-2024-B1',
    question_text: 'Sifat "Baqa\'" bagi Allah SWT bermaksud Allah Maha Kekal dan tidak akan binasa selama-lamanya.',
    explanation: 'BETUL. Sifat Baqa\' ialah sifat Salbiyyah yang menafikan kebinasaan dan kesudahan bagi Zat Allah SWT.',
    order: 2,
    choices: [
      { id: 'c-akd24b1-2-1', question_id: 'q-akd24b1-2', option_text: 'BETUL', is_correct: true },
      { id: 'c-akd24b1-2-2', question_id: 'q-akd24b1-2', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-akd24b1-3',
    section_id: 'sec-akidah-2024-B1',
    question_text: 'Beriman kepada Qada\' dan Qadar mengajar umat Islam berserah diri (tawakal) tanpa perlu berusaha atau berikhtiar.',
    explanation: 'SALAH. Umat Islam wajib berikhtiar dan berusaha bersungguh-sungguh terlebih dahulu sebelum bertawakal.',
    order: 3,
    choices: [
      { id: 'c-akd24b1-3-1', question_id: 'q-akd24b1-3', option_text: 'BETUL', is_correct: false },
      { id: 'c-akd24b1-3-2', question_id: 'q-akd24b1-3', option_text: 'SALAH', is_correct: true },
    ],
  },
  {
    id: 'q-akd24b1-4',
    section_id: 'sec-akidah-2024-B1',
    question_text: 'Murtad bermaksud keluar daripada agama Islam sama ada melalui iktikad, perkataan, atau perbuatan.',
    explanation: 'BETUL. Perbuatan murtad secara automatik membatalkan keislaman dan ikatan akidah seseorang.',
    order: 4,
    choices: [
      { id: 'c-akd24b1-4-1', question_id: 'q-akd24b1-4', option_text: 'BETUL', is_correct: true },
      { id: 'c-akd24b1-4-2', question_id: 'q-akd24b1-4', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-akd24b1-5',
    section_id: 'sec-akidah-2024-B1',
    question_text: 'Malaikat Raqib dan Atid ditugaskan oleh Allah SWT untuk menurunkan hujan dan mengagihkan rezeki.',
    explanation: 'SALAH. Raqib dan Atid bertugas mencatat amalan baik dan buruk manusia; Mikail yang menurunkan hujan dan rezeki.',
    order: 5,
    choices: [
      { id: 'c-akd24b1-5-1', question_id: 'q-akd24b1-5', option_text: 'BETUL', is_correct: false },
      { id: 'c-akd24b1-5-2', question_id: 'q-akd24b1-5', option_text: 'SALAH', is_correct: true },
    ],
  },

  // --- Akidah 2024 Bahagian B (Set 2): Soalan Betul / Salah (5 Soalan) ---
  {
    id: 'q-akd24b2-1',
    section_id: 'sec-akidah-2024-B2',
    question_text: 'Sifat "Wahdaniyyah" menafikan adanya sekutu bagi Allah SWT pada Zat, Sifat, dan Perbuatan-Nya.',
    explanation: 'BETUL. Wahdaniyyah bermaksud Allah Maha Esa dan tiada bilangan atau sekutu bagi-Nya.',
    order: 1,
    choices: [
      { id: 'c-akd24b2-1-1', question_id: 'q-akd24b2-1', option_text: 'BETUL', is_correct: true },
      { id: 'c-akd24b2-1-2', question_id: 'q-akd24b2-1', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-akd24b2-2',
    section_id: 'sec-akidah-2024-B2',
    question_text: 'Amalan Sihir dan Kahanah (meminta pertolongan jin) diharuskan jika bertujuan untuk perubatan.',
    explanation: 'SALAH. Sihir dan meminta pertolongan jin adalah haram serta termasuk dosa besar yang merosakkan akidah Islam.',
    order: 2,
    choices: [
      { id: 'c-akd24b2-2-1', question_id: 'q-akd24b2-2', option_text: 'BETUL', is_correct: false },
      { id: 'c-akd24b2-2-2', question_id: 'q-akd24b2-2', option_text: 'SALAH', is_correct: true },
    ],
  },
  {
    id: 'q-akd24b2-3',
    section_id: 'sec-akidah-2024-B2',
    question_text: 'Nabi Muhammad SAW ialah "Khatamun Nabiyyin" iaitu penutup sekalian Nabi dan Rasul.',
    explanation: 'BETUL. Tiada lagi nabi atau rasul selepas kewafatan Baginda Nabi Muhammad SAW hingga hari kiamat.',
    order: 3,
    choices: [
      { id: 'c-akd24b2-3-1', question_id: 'q-akd24b2-3', option_text: 'BETUL', is_correct: true },
      { id: 'c-akd24b2-3-2', question_id: 'q-akd24b2-3', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-akd24b2-4',
    section_id: 'sec-akidah-2024-B2',
    question_text: 'Amalan kebajikan dan kejahatan manusia akan ditimbang di atas neraca "Al-Mizan" pada Hari Kiamat.',
    explanation: 'BETUL. Al-Mizan ialah timbangan keadilan Allah SWT di Mahsyar untuk menentukan kadar pahala dan dosa.',
    order: 4,
    choices: [
      { id: 'c-akd24b2-4-1', question_id: 'q-akd24b2-4', option_text: 'BETUL', is_correct: true },
      { id: 'c-akd24b2-4-2', question_id: 'q-akd24b2-4', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-akd24b2-5',
    section_id: 'sec-akidah-2024-B2',
    question_text: 'Perbuatan Riya\' (menunjuk-nunjuk amalan) tergolong dalam Syirik Asghar (Syirik Kecil) yang mengeluarkan seseorang daripada agama Islam secara mutlak.',
    explanation: 'SALAH. Syirik Asghar (seperti riya\') merosakkan pahala amalan tetapi tidak mengeluarkan seseorang daripada agama Islam secara mutlak seperti Syirik Akbar.',
    order: 5,
    choices: [
      { id: 'c-akd24b2-5-1', question_id: 'q-akd24b2-5', option_text: 'BETUL', is_correct: false },
      { id: 'c-akd24b2-5-2', question_id: 'q-akd24b2-5', option_text: 'SALAH', is_correct: true },
    ],
  },

  // --- Akidah 2024 Bahagian C (Set 1): Soalan Subjektif Pilihan Berstruktur (5 Soalan) ---
  {
    id: 'q-akd24c1-1',
    section_id: 'sec-akidah-2024-C1',
    question_text: 'Ahmad melihat rakannya memakai tangkal di pinggang dengan kepercayaan tangkal itu boleh mengelakkan kecederaan ketika bersukan. Apakah tindakan terbaik berdasarkan pemeliharaan Akidah?',
    explanation: 'Mempercayai azimat atau tangkal mempunyai kuasa memberi mudarat/manfaat ialah syirik. Nasihatilah rakan secara hikmah supaya meyakini perlindungan Allah SWT semata-mata.',
    order: 1,
    choices: [
      { id: 'c-akd24c1-1-1', question_id: 'q-akd24c1-1', option_text: 'Menasihati rakan supaya menanggalkan tangkal kerana mempercayai azimat ialah perbuatan syirik yang merosakkan akidah', is_correct: true },
      { id: 'c-akd24c1-1-2', question_id: 'q-akd24c1-1', option_text: 'Membiarkan rakan memakai tangkal kerana itu hak peribadinya', is_correct: false },
      { id: 'c-akd24c1-1-3', question_id: 'q-akd24c1-1', option_text: 'Meminta rakan menyapu minyak wangi pada tangkal supaya lebih berkesan', is_correct: false },
      { id: 'c-akd24c1-1-4', question_id: 'q-akd24c1-1', option_text: 'Membeli tangkal yang sama untuk kegunaan sendiri ketika bersukan', is_correct: false },
    ],
  },
  {
    id: 'q-akd24c1-2',
    section_id: 'sec-akidah-2024-C1',
    question_text: 'Terangkan perbezaan utama antara Sifat Salbiyyah dan Sifat Ma\'ani bagi Allah SWT.',
    explanation: 'Sifat Salbiyyah menafikan sifat yang tidak layak bagi Allah (contoh: Qidam, Baqa\'); manakala Sifat Ma\'ani ialah sifat wujudiyyah yang tetap pada Zat Allah (contoh: Qudrat, Iradat, Ilmu).',
    order: 2,
    choices: [
      { id: 'c-akd24c1-2-1', question_id: 'q-akd24c1-2', option_text: 'Salbiyyah menafikan sifat tidak layak bagi Allah; Ma\'ani ialah sifat wujudiyyah yang tetap pada Zat Allah', is_correct: true },
      { id: 'c-akd24c1-2-2', question_id: 'q-akd24c1-2', option_text: 'Salbiyyah dimiliki oleh manusia; Ma\'ani dimiliki oleh para malaikat', is_correct: false },
      { id: 'c-akd24c1-2-3', question_id: 'q-akd24c1-2', option_text: 'Salbiyyah bermaksud Allah lemah; Ma\'ani bermaksud Allah Maha Kaya', is_correct: false },
      { id: 'c-akd24c1-2-4', question_id: 'q-akd24c1-2', option_text: 'Salbiyyah ialah sifat Harus; Ma\'ani ialah sifat Mustahil bagi Allah', is_correct: false },
    ],
  },
  {
    id: 'q-akd24c1-3',
    section_id: 'sec-akidah-2024-C1',
    question_text: 'Nyatakan kesan buruk perbuatan Nifaq (Pura-pura beriman tetapi menyembunyikan kekufuran) terhadap keharmonian masyarakat Islam.',
    explanation: 'Nifaq merosakkan ukhuwah, menimbulkan syak wasangka dan meruntuhkan benteng pertahanan umat Islam dari dalam.',
    order: 3,
    choices: [
      { id: 'c-akd24c1-3-1', question_id: 'q-akd24c1-3', option_text: 'Merosakkan perpaduan, menimbulkan syak wasangka & meruntuhkan pertahanan umat dari dalam', is_correct: true },
      { id: 'c-akd24c1-3-2', question_id: 'q-akd24c1-3', option_text: 'Menguatkan ekonomi masyarakat dan menambah bilangan masjid', is_correct: false },
      { id: 'c-akd24c1-3-3', question_id: 'q-akd24c1-3', option_text: 'Menjadikan persekitaran sekolah lebih ceria dan harmonis', is_correct: false },
      { id: 'c-akd24c1-3-4', question_id: 'q-akd24c1-3', option_text: 'Mempercepatkan penurunan rezeki dan keberkatan hidup masyarakat', is_correct: false },
    ],
  },
  {
    id: 'q-akd24c1-4',
    section_id: 'sec-akidah-2024-C1',
    question_text: 'Susun mengikut urutan kronologi yang betul peristiwa alam akhirat selepas berlakunya tiupan sangkakala Kiamat.',
    explanation: 'Urutan kronologi peristiwa akhirat: Kebangkitan (Al-Ba\'ath) → Perhimpunan (Al-Mahsyar) → Hisab & Mizan → Titian Sirat → Syurga atau Neraka.',
    order: 4,
    choices: [
      { id: 'c-akd24c1-4-1', question_id: 'q-akd24c1-4', option_text: 'Kebangkitan (Al-Ba\'ath) → Perhimpunan (Al-Mahsyar) → Hisab & Mizan → Titian Sirat → Syurga/Neraka', is_correct: true },
      { id: 'c-akd24c1-4-2', question_id: 'q-akd24c1-4', option_text: 'Syurga/Neraka → Hisab → Perhimpunan Mahsyar → Kebangkitan', is_correct: false },
      { id: 'c-akd24c1-4-3', question_id: 'q-akd24c1-4', option_text: 'Titian Sirat → Alam Barzakh → Kebangkitan → Hisab', is_correct: false },
      { id: 'c-akd24c1-4-4', question_id: 'q-akd24c1-4', option_text: 'Hisab & Mizan → Kebangkitan → Syurga → Alam Barzakh', is_correct: false },
    ],
  },
  {
    id: 'q-akd24c1-5',
    section_id: 'sec-akidah-2024-C1',
    question_text: 'Bagaimanakah cara seorang murid sekolah dapat memelihara dan memantapkan akidah Islamiah dalam kehidupan seharian?',
    explanation: 'Memelihara akidah dilakukan dengan mendalami ilmu tauhid, istiqamah beramal soleh, mendampingi ulama dan menjauhi syirik/khurafat.',
    order: 5,
    choices: [
      { id: 'c-akd24c1-5-1', question_id: 'q-akd24c1-5', option_text: 'Mendalami ilmu tauhid, istiqamah beramal soleh & jauhi perkara khurafat', is_correct: true },
      { id: 'c-akd24c1-5-2', question_id: 'q-akd24c1-5', option_text: 'Membaca komik fiksyen dan mempercayai ramalan zodiak', is_correct: false },
      { id: 'c-akd24c1-5-3', question_id: 'q-akd24c1-5', option_text: 'Meninggalkan solat fardu apabila sibuk dengan aktiviti kokurikulum', is_correct: false },
      { id: 'c-akd24c1-5-4', question_id: 'q-akd24c1-5', option_text: 'Mengikut aliran pemikiran bebas yang meragui hukum Al-Quran', is_correct: false },
    ],
  },

  // --- Akidah 2024 Bahagian C (Set 2): Soalan Subjektif Pilihan Berstruktur (5 Soalan) ---
  {
    id: 'q-akd24c2-1',
    section_id: 'sec-akidah-2024-C2',
    question_text: 'Mengapakah akidah Islam menolak fahaman yang menyatakan alam semesta ini wujud secara kebetulan tanpa pencipta?',
    explanation: 'Keteraturan, keindahan dan susunan alam yang kompleks membuktikan secara akal dan naqli kewujudan Allah SWT Yang Maha Kuasa (Qudrat) & Maha Berkehendak (Iradat).',
    order: 1,
    choices: [
      { id: 'c-akd24c2-1-1', question_id: 'q-akd24c2-1', option_text: 'Keteraturan alam membuktikan kewujudan Allah Yang Maha Kuasa (Qudrat) & Maha Berkehendak (Iradat)', is_correct: true },
      { id: 'c-akd24c2-1-2', question_id: 'q-akd24c2-1', option_text: 'Kerana alam ini dicipta oleh saintis pada zaman kuno', is_correct: false },
      { id: 'c-akd24c2-1-3', question_id: 'q-akd24c2-1', option_text: 'Kerana manusia boleh mencipta matahari dan bulan mengikut kehendak sendiri', is_correct: false },
      { id: 'c-akd24c2-1-4', question_id: 'q-akd24c2-1', option_text: 'Kerana alam ini tidak mempunyai sebarang undang-undang fizik', is_correct: false },
    ],
  },
  {
    id: 'q-akd24c2-2',
    section_id: 'sec-akidah-2024-C2',
    question_text: 'Antara perbuatan berikut, manakah perbuatan yang boleh menyebabkan seseorang terbatal akidah melalui aspek PERKATAAN?',
    explanation: 'Mempersendakan, menghina atau menafikan hukum hakam syarak melalui lisan atau tulisan menyebabkan terbatalnya akidah Islam.',
    order: 2,
    choices: [
      { id: 'c-akd24c2-2-1', question_id: 'q-akd24c2-2', option_text: 'Menghina atau mempersendakan hukum syarak seperti ibadat solat atau kewajipan menutup aurat', is_correct: true },
      { id: 'c-akd24c2-2-2', question_id: 'q-akd24c2-2', option_text: 'Bercakap dengan nada suara yang agak kuat ketika berbincang', is_correct: false },
      { id: 'c-akd24c2-2-3', question_id: 'q-akd24c2-2', option_text: 'Membaca terjemahan Al-Quran tanpa mengambil wuduk', is_correct: false },
      { id: 'c-akd24c2-2-4', question_id: 'q-akd24c2-2', option_text: 'Lupa mengucapkan salam semasa memasuki bilik darjah', is_correct: false },
    ],
  },
  {
    id: 'q-akd24c2-3',
    section_id: 'sec-akidah-2024-C2',
    question_text: 'Apakah hikmah utama seseorang sentiasa meyakini keberadaan Malaikat Raqib dan Atid di sisi kanan dan kirinya?',
    explanation: 'Sentiasa menyedari Malaikat Raqib dan Atid mencatat amalan menjadikan seseorang sentiasa melazimkan kebaikan dan takut melakukan dosa.',
    order: 3,
    choices: [
      { id: 'c-akd24c2-3-1', question_id: 'q-akd24c2-3', option_text: 'Mendorong seseorang sentiasa waspada dan berhati-hati dalam setiap tutur kata & perbuatan', is_correct: true },
      { id: 'c-akd24c2-3-2', question_id: 'q-akd24c2-3', option_text: 'Menyebabkan seseorang berasa takut untuk berjalan di kawasan gelap', is_correct: false },
      { id: 'c-akd24c2-3-3', question_id: 'q-akd24c2-3', option_text: 'Menjadikan seseorang suka menunjuk-nunjuk amalan baik kepada rakan', is_correct: false },
      { id: 'c-akd24c2-3-4', question_id: 'q-akd24c2-3', option_text: 'Menghalang seseorang daripada tidur pada waktu malam', is_correct: false },
    ],
  },
  {
    id: 'q-akd24c2-4',
    section_id: 'sec-akidah-2024-C2',
    question_text: 'Manakah antara berikut merupakan ciri-ciri utama Ajaran Sesat yang wajib dihindari oleh setiap Muslim?',
    explanation: 'Ciri ajaran sesat termasuk menafsir Al-Quran ikut hawa nafsu, mengagungkan pemimpin hingga menganggapnya ma\'sum/wali, dan menolak rukun Islam.',
    order: 4,
    choices: [
      { id: 'c-akd24c2-4-1', question_id: 'q-akd24c2-4', option_text: 'Memahami Al-Quran mengikut hawa nafsu, mendakwa gurunya suci & meremehkan rukun Islam', is_correct: true },
      { id: 'c-akd24c2-4-2', question_id: 'q-akd24c2-4', option_text: 'Mengadakan majlis bacaan Yasin dan tahlil di surau sekolah', is_correct: false },
      { id: 'c-akd24c2-4-3', question_id: 'q-akd24c2-4', option_text: 'Belajar tajwid Al-Quran bersama guru agama yang bertauliah', is_correct: false },
      { id: 'c-akd24c2-4-4', question_id: 'q-akd24c2-4', option_text: 'Menunaikan solat berjamak ketika dalam perjalanan musafir jauh', is_correct: false },
    ],
  },
  {
    id: 'q-akd24c2-5',
    section_id: 'sec-akidah-2024-C2',
    question_text: 'Seorang murid telah belajar bersungguh-sungguh untuk peperiksaan SPPI tetapi mendapat keputusan yang kurang memuaskan. Apakah sikap beriman kepada Qada\' & Qadar yang sepatutnya ditunjukkan?',
    explanation: 'Orang beriman akan reda dengan ketentuan Allah, muhasabah diri, berdoa dan terus berusaha tanpa berputus asa atau menyalahkan takdir.',
    order: 5,
    choices: [
      { id: 'c-akd24c2-5-1', question_id: 'q-akd24c2-5', option_text: 'Reda dengan ketentuan Allah, muhasabah diri, berdoa & berusaha lebih gigih tanpa putus asa', is_correct: true },
      { id: 'c-akd24c2-5-2', question_id: 'q-akd24c2-5', option_text: 'Menyalahkan takdir Allah dan berhenti belajar selama-lamanya', is_correct: false },
      { id: 'c-akd24c2-5-3', question_id: 'q-akd24c2-5', option_text: 'Marah kepada guru dan menuduh pemeriksa kertas tidak adil', is_correct: false },
      { id: 'c-akd24c2-5-4', question_id: 'q-akd24c2-5', option_text: 'Berhenti menunaikan solat kerana berasa doanya tidak dimakbulkan', is_correct: false },
    ],
  },

  // --- Akhlak 2025 Bahagian A: Soalan Objektif (10 Soalan) ---
  {
    id: 'q-akh25a-1',
    section_id: 'sec-akhlak-2025-A',
    question_text: 'Apakah maksud Akhlak Islamiah dari sudut bahasa dan istilah?',
    explanation: 'Akhlak dari sudut bahasa bermaksud budi pekerti atau tabiat. Dari istilah ialah budi pekerti mulia yang bersumberkan wahyu Al-Quran dan As-Sunnah.',
    order: 1,
    choices: [
      { id: 'c-akh25a-1-1', question_id: 'q-akh25a-1', option_text: 'Budi pekerti & tabiat; Perilaku mulia yang bersumberkan Al-Quran & As-Sunnah', is_correct: true },
      { id: 'c-akh25a-1-2', question_id: 'q-akh25a-1', option_text: 'Hiasan pakaian dan perhiasan diri sewaktu beribadat', is_correct: false },
      { id: 'c-akh25a-1-3', question_id: 'q-akh25a-1', option_text: 'Peraturan undang-undang sivil dalam sesebuah negara', is_correct: false },
      { id: 'c-akh25a-1-4', question_id: 'q-akh25a-1', option_text: 'Tradisi kebudayaan masyarakat Melayu purba', is_correct: false },
    ],
  },
  {
    id: 'q-akh25a-2',
    section_id: 'sec-akhlak-2025-A',
    question_text: 'Manakah antara berikut BUKAN merupakan contoh adab terhadap ibu bapa yang dituntut dalam Islam?',
    explanation: 'Meninggikan suara atau membentak ibu bapa adalah perbuatan penderhakaan (Uquq al-Walidain) yang dilarang keras dalam Islam.',
    order: 2,
    choices: [
      { id: 'c-akh25a-2-1', question_id: 'q-akh25a-2', option_text: 'Meninggikan suara atau membantah kata-kata mereka dengan kasar', is_correct: true },
      { id: 'c-akh25a-2-2', question_id: 'q-akh25a-2', option_text: 'Mendoakan kesejahteraan dan keampunan dosa mereka setiap masa', is_correct: false },
      { id: 'c-akh25a-2-3', question_id: 'q-akh25a-2', option_text: 'Berbudi bahasa dan menggunakan percakapan yang lembut serta bersopan', is_correct: false },
      { id: 'c-akh25a-2-4', question_id: 'q-akh25a-2', option_text: 'Membantu meringankan beban kerja rumah mereka dengan ikhlas', is_correct: false },
    ],
  },
  {
    id: 'q-akh25a-3',
    section_id: 'sec-akhlak-2025-A',
    question_text: 'Sifat Mahmudah "Tawaduk" membawa maksud:',
    explanation: 'Tawaduk ialah sifat rendah hati serta menghormati orang lain tanpa berasa diri lebih mulia atau takabur.',
    order: 3,
    choices: [
      { id: 'c-akh25a-3-1', question_id: 'q-akh25a-3', option_text: 'Rendah hati dan tidak sombong dengan kelebihan yang dimiliki', is_correct: true },
      { id: 'c-akh25a-3-2', question_id: 'q-akh25a-3', option_text: 'Pasrah tanpa berusaha untuk mencapai cita-cita', is_correct: false },
      { id: 'c-akh25a-3-3', question_id: 'q-akh25a-3', option_text: 'Menunjuk-nunjuk amalan kebaikan kepada orang ramai', is_correct: false },
      { id: 'c-akh25a-3-4', question_id: 'q-akh25a-3', option_text: 'Kedekut dan enggan membelanjakan harta pada jalan Allah', is_correct: false },
    ],
  },
  {
    id: 'q-akh25a-4',
    section_id: 'sec-akhlak-2025-A',
    question_text: 'Apakah hukum mematuhi dan menghormati guru yang mengajar ilmu yang bermanfaat?',
    explanation: 'Menghormati guru adalah wajib kerana guru membimbing murid ke jalan kebenaran dan merupakan pewaris para Nabi dalam menyampaikan ilmu.',
    order: 4,
    choices: [
      { id: 'c-akh25a-4-1', question_id: 'q-akh25a-4', option_text: 'Wajib / Dituntut syarak kerana guru ialah pewaris Nabi', is_correct: true },
      { id: 'c-akh25a-4-2', question_id: 'q-akh25a-4', option_text: 'Harus sekiranya guru tersebut merupakan ahli keluarga sendiri', is_correct: false },
      { id: 'c-akh25a-4-3', question_id: 'q-akh25a-4', option_text: 'Sunat Muakkad ketika berada di dalam kelas sahaja', is_correct: false },
      { id: 'c-akh25a-4-4', question_id: 'q-akh25a-4', option_text: 'Makruh jika dilakukan berlebihan', is_correct: false },
    ],
  },
  {
    id: 'q-akh25a-5',
    section_id: 'sec-akhlak-2025-A',
    question_text: 'Sebelum memasuki masjid, seorang Muslim disunatkan mendahulukan kaki:',
    explanation: 'Sunat mendahulukan kaki kanan sewaktu memasuki tempat yang mulia seperti masjid dan melangkah keluar dengan kaki kiri.',
    order: 5,
    choices: [
      { id: 'c-akh25a-5-1', question_id: 'q-akh25a-5', option_text: 'Kanan disertai doa masuk masjid', is_correct: true },
      { id: 'c-akh25a-5-2', question_id: 'q-akh25a-5', option_text: 'Kiri disertai doa keluar masjid', is_correct: false },
      { id: 'c-akh25a-5-3', question_id: 'q-akh25a-5', option_text: 'Kedua-dua kaki secara serentak', is_correct: false },
      { id: 'c-akh25a-5-4', question_id: 'q-akh25a-5', option_text: 'Kiri tanpa perlu membaca sebarang doa', is_correct: false },
    ],
  },
  {
    id: 'q-akh25a-6',
    section_id: 'sec-akhlak-2025-A',
    question_text: 'Apakah kesan utama amalan sifat "Ikhlas" dalam melakukan ibadah dan pekerjaan harian?',
    explanation: 'Ikhlas (melakukan amalan semata-mata kerana Allah) ialah syarat utama penerimaan amalan di sisi Allah SWT.',
    order: 6,
    choices: [
      { id: 'c-akh25a-6-1', question_id: 'q-akh25a-6', option_text: 'Amalan diterima oleh Allah SWT & mendapat ganjaran pahala bersih', is_correct: true },
      { id: 'c-akh25a-6-2', question_id: 'q-akh25a-6', option_text: 'Menerima pujian dan sanjungan tinggi daripada masyarakat', is_correct: false },
      { id: 'c-akh25a-6-3', question_id: 'q-akh25a-6', option_text: 'Mendapat ganjaran wang tunai serta jawatan yang tinggi', is_correct: false },
      { id: 'c-akh25a-6-4', question_id: 'q-akh25a-6', option_text: 'Terpelihara daripada ditimpa sebarang musibah di dunia', is_correct: false },
    ],
  },
  {
    id: 'q-akh25a-7',
    section_id: 'sec-akhlak-2025-A',
    question_text: 'Manakah antara berikut merupakan adab menjaga alam sekitar dan tumbuhan mengikut syariat Islam?',
    explanation: 'Islam melarang kerosakan di muka bumi. Alam sekitar ialah amanah Allah yang wajib dipelihara dan tidak dirosakkan.',
    order: 7,
    choices: [
      { id: 'c-akh25a-7-1', question_id: 'q-akh25a-7', option_text: 'Mengelakkan pembakaran terbuka & tidak merosakkan pokok tanpa sebab', is_correct: true },
      { id: 'c-akh25a-7-2', question_id: 'q-akh25a-7', option_text: 'Membuang sisa toksik ke dalam sungai pada waktu malam', is_correct: false },
      { id: 'c-akh25a-7-3', question_id: 'q-akh25a-7', option_text: 'Menebang semua pokok di hutan untuk pembangunan tanpa kawalan', is_correct: false },
      { id: 'c-akh25a-7-4', question_id: 'q-akh25a-7', option_text: 'Membiarkan sampah sarap bertaburan di tempat awam', is_correct: false },
    ],
  },
  {
    id: 'q-akh25a-8',
    section_id: 'sec-akhlak-2025-A',
    question_text: 'Sabda Nabi SAW bermaksud "Seseorang itu mengikut agama sahabat baiknya, maka hendaklah dia memperhatikan..."',
    explanation: 'Rasulullah SAW menekankan kepentingan memilih rakan yang berakhlak mulia kerana rakan memberi pengaruh besar terhadap pegangan agama dan akhlak.',
    order: 8,
    choices: [
      { id: 'c-akh25a-8-1', question_id: 'q-akh25a-8', option_text: 'Siapa yang menjadi rakan karibnya', is_correct: true },
      { id: 'c-akh25a-8-2', question_id: 'q-akh25a-8', option_text: 'Berapa banyak harta yang dimiliki rakannya', is_correct: false },
      { id: 'c-akh25a-8-3', question_id: 'q-akh25a-8', option_text: 'Keturunan dan pangkat keluarga rakannya', is_correct: false },
      { id: 'c-akh25a-8-4', question_id: 'q-akh25a-8', option_text: 'Rupa paras dan fesyen pakaian rakannya', is_correct: false },
    ],
  },
  {
    id: 'q-akh25a-9',
    section_id: 'sec-akhlak-2025-A',
    question_text: 'Apakah hukum menyebarkan berita palsu atau fitnah di media sosial?',
    explanation: 'Menyebarkan berita tanpa usul periksa atau fitnah adalah haram dan dosa besar yang memecahbelahkan ukhuwah Islamiah.',
    order: 9,
    choices: [
      { id: 'c-akh25a-9-1', question_id: 'q-akh25a-9', option_text: 'Haram & tergolong dalam dosa besar (Fitnah)', is_correct: true },
      { id: 'c-akh25a-9-2', question_id: 'q-akh25a-9', option_text: 'Harus sekiranya bertujuan untuk mendapatkan perhatian', is_correct: false },
      { id: 'c-akh25a-9-3', question_id: 'q-akh25a-9', option_text: 'Sunat jika berita tersebut kelihatan menarik', is_correct: false },
      { id: 'c-akh25a-9-4', question_id: 'q-akh25a-9', option_text: 'Makruh tetapi tidak mendapat dosa', is_correct: false },
    ],
  },
  {
    id: 'q-akh25a-10',
    section_id: 'sec-akhlak-2025-A',
    question_text: 'Sifat Mazmumah "Hasad" bermaksud:',
    explanation: 'Hasad ialah sifat dengki hati yang membenci nikmat orang lain dan bercita-cita agar nikmat tersebut lenyap daripada orang itu.',
    order: 10,
    choices: [
      { id: 'c-akh25a-10-1', question_id: 'q-akh25a-10', option_text: 'Dengki & berharap nikmat orang lain hilang atau berpindah kepadanya', is_correct: true },
      { id: 'c-akh25a-10-2', question_id: 'q-akh25a-10', option_text: 'Perasaan ujub dan bangga diri dengan amalan sendiri', is_correct: false },
      { id: 'c-akh25a-10-3', question_id: 'q-akh25a-10', option_text: 'Mungkir janji dan berdusta sewaktu bercakap', is_correct: false },
      { id: 'c-akh25a-10-4', question_id: 'q-akh25a-10', option_text: 'Boros dan membazirkan harta pada perkara maksiat', is_correct: false },
    ],
  },

  // --- Akhlak 2025 Bahagian B (Set 1): Soalan Betul / Salah (5 Soalan) ---
  {
    id: 'q-akh25b1-1',
    section_id: 'sec-akhlak-2025-B1',
    question_text: 'Adab menuntut ilmu menuntut murid sentiasa menghormati guru, memberikan tumpuan ketika belajar dan memohon doa keberkatan.',
    explanation: 'BETUL. Beradab dengan guru dan bersungguh-sungguh ialah punca keberkatan ilmu.',
    order: 1,
    choices: [
      { id: 'c-akh25b1-1-1', question_id: 'q-akh25b1-1', option_text: 'BETUL', is_correct: true },
      { id: 'c-akh25b1-1-2', question_id: 'q-akh25b1-1', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-akh25b1-2',
    section_id: 'sec-akhlak-2025-B1',
    question_text: 'Sifat "Siddiq" bermaksud sentiasa bercakap benar dan tidak berbohong dalam apa jua situasi.',
    explanation: 'BETUL. Siddiq (benar) ialah sifat terpuji yang wajib bagi Rasul dan tuntutan kepada semua Muslim.',
    order: 2,
    choices: [
      { id: 'c-akh25b1-2-1', question_id: 'q-akh25b1-2', option_text: 'BETUL', is_correct: true },
      { id: 'c-akh25b1-2-2', question_id: 'q-akh25b1-2', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-akh25b1-3',
    section_id: 'sec-akhlak-2025-B1',
    question_text: 'Diharuskan menganiaya dan menyeksa haiwan seperti kucing sekiranya haiwan tersebut mengotorkan persekitaran rumah.',
    explanation: 'SALAH. Islam melarang keras penyiksaan terhadap haiwan. Menyayangi haiwan mendapat ganjaran pahala.',
    order: 3,
    choices: [
      { id: 'c-akh25b1-3-1', question_id: 'q-akh25b1-3', option_text: 'BETUL', is_correct: false },
      { id: 'c-akh25b1-3-2', question_id: 'q-akh25b1-3', option_text: 'SALAH', is_correct: true },
    ],
  },
  {
    id: 'q-akh25b1-4',
    section_id: 'sec-akhlak-2025-B1',
    question_text: 'Seseorang disunatkan menunaikan solat sunat Tahiyyatul Masjid sebanyak dua rakaat sebaik sahaja memasuki masjid sebelum duduk.',
    explanation: 'BETUL. Solat Tahiyyatul Masjid ialah solat sunat menghormati masjid sebanyak dua rakaat sebelum duduk.',
    order: 4,
    choices: [
      { id: 'c-akh25b1-4-1', question_id: 'q-akh25b1-4', option_text: 'BETUL', is_correct: true },
      { id: 'c-akh25b1-4-2', question_id: 'q-akh25b1-4', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-akh25b1-5',
    section_id: 'sec-akhlak-2025-B1',
    question_text: 'Sifat Mazmumah "Riya\'" ialah melakukan amalan kebaikan secara tersembunyi supaya hanya diketahui oleh Allah SWT sahaja.',
    explanation: 'SALAH. Melakukan amalan tersembunyi kerana Allah ialah Ikhlas. Riya\' ialah melakukan amalan kerana mahukan pujian manusia.',
    order: 5,
    choices: [
      { id: 'c-akh25b1-5-1', question_id: 'q-akh25b1-5', option_text: 'BETUL', is_correct: false },
      { id: 'c-akh25b1-5-2', question_id: 'q-akh25b1-5', option_text: 'SALAH', is_correct: true },
    ],
  },

  // --- Akhlak 2025 Bahagian B (Set 2): Soalan Betul / Salah (5 Soalan) ---
  {
    id: 'q-akh25b2-1',
    section_id: 'sec-akhlak-2025-B2',
    question_text: 'Sifat "Pemaaf" (Al-Afwu) dapat membersihkan jiwa daripada dendam dan menguatkan silaturahim sesama Muslim.',
    explanation: 'BETUL. Sifat pemaaf ialah akhlak mulia Nabi SAW yang melapangkan dada dan menyatukan hati masyarakat.',
    order: 1,
    choices: [
      { id: 'c-akh25b2-1-1', question_id: 'q-akh25b2-1', option_text: 'BETUL', is_correct: true },
      { id: 'c-akh25b2-1-2', question_id: 'q-akh25b2-1', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-akh25b2-2',
    section_id: 'sec-akhlak-2025-B2',
    question_text: 'Harus hukumnya seorang murid mempersendakan nama ibu bapa rakannya di sekolah sekiranya sekadar bertujuan untuk bergurau.',
    explanation: 'SALAH. Mencela atau mengejek ibu bapa orang lain adalah haram dan termasuk dalam dosa penderhakaan mengikut hadis Nabi SAW.',
    order: 2,
    choices: [
      { id: 'c-akh25b2-2-1', question_id: 'q-akh25b2-2', option_text: 'BETUL', is_correct: false },
      { id: 'c-akh25b2-2-2', question_id: 'q-akh25b2-2', option_text: 'SALAH', is_correct: true },
    ],
  },
  {
    id: 'q-akh25b2-3',
    section_id: 'sec-akhlak-2025-B2',
    question_text: 'Bermusafir ke tempat berasingan tanpa niat kebaikan adalah lebih afdal daripada beriktikaf di dalam masjid pada bulan Ramadan.',
    explanation: 'SALAH. Beriktikaf di masjid terutamanya pada 10 malam terakhir Ramadan adalah amalan sunat muakkad yang amat dituntut.',
    order: 3,
    choices: [
      { id: 'c-akh25b2-3-1', question_id: 'q-akh25b2-3', option_text: 'BETUL', is_correct: false },
      { id: 'c-akh25b2-3-2', question_id: 'q-akh25b2-3', option_text: 'SALAH', is_correct: true },
    ],
  },
  {
    id: 'q-akh25b2-4',
    section_id: 'sec-akhlak-2025-B2',
    question_text: 'Amanah dalam memegang tugas atau jawatan murid di sekolah (seperti Pengawas) wajib ditunaikan dengan jujur dan bertanggungjawab.',
    explanation: 'BETUL. Amanah ialah rukun kepimpinan Islam. Menyiapkan tugasan dengan jujur mendapat keredaan Allah.',
    order: 4,
    choices: [
      { id: 'c-akh25b2-4-1', question_id: 'q-akh25b2-4', option_text: 'BETUL', is_correct: true },
      { id: 'c-akh25b2-4-2', question_id: 'q-akh25b2-4', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-akh25b2-5',
    section_id: 'sec-akhlak-2025-B2',
    question_text: 'Perbuatan "Namimah" (Adu domba) ialah menyebarkan kata-kata untuk merosakkan hubungan mesra antara dua pihak.',
    explanation: 'BETUL. Namimah (adu domba) ialah sifat mazmumah yang diancam azab kubur dan neraka oleh Rasulullah SAW.',
    order: 5,
    choices: [
      { id: 'c-akh25b2-5-1', question_id: 'q-akh25b2-5', option_text: 'BETUL', is_correct: true },
      { id: 'c-akh25b2-5-2', question_id: 'q-akh25b2-5', option_text: 'SALAH', is_correct: false },
    ],
  },

  // --- Akhlak 2025 Bahagian C (Set 1): Soalan Subjektif Pilihan Berstruktur (5 Soalan) ---
  {
    id: 'q-akh25c1-1',
    section_id: 'sec-akhlak-2025-C1',
    question_text: 'Amir ternampak beberapa orang murid membuang sisa makanan dan plastik di taman rekreasi sekolah. Apakah tindakan beradab yang wajar dilakukan oleh Amir?',
    explanation: 'Mengamalkan adab amar ma\'ruf nahi munkar secara hikmah dan menjaga kebersihan persekitaran ialah tanggungjawab setiap Muslim.',
    order: 1,
    choices: [
      { id: 'c-akh25c1-1-1', question_id: 'q-akh25c1-1', option_text: 'Menegur murid tersebut secara berhikmah & bersama-sama mengutip sampah untuk dibuang ke dalam tong sampah', is_correct: true },
      { id: 'c-akh25c1-1-2', question_id: 'q-akh25c1-1', option_text: 'Membiarkan sampah tersebut kerana bukan dia yang membuangnya', is_correct: false },
      { id: 'c-akh25c1-1-3', question_id: 'q-akh25c1-1', option_text: 'Memaki hamun murid tersebut di hadapan khalayak ramai', is_correct: false },
      { id: 'c-akh25c1-1-4', question_id: 'q-akh25c1-1', option_text: 'Menambah lagi sampah sarap di kawasan tersebut', is_correct: false },
    ],
  },
  {
    id: 'q-akh25c1-2',
    section_id: 'sec-akhlak-2025-C1',
    question_text: 'Apakah perbezaan utama antara Sifat Mahmudah dan Sifat Mazmumah dalam pembentukan sahsiah murid?',
    explanation: 'Sifat Mahmudah (seperti ikhlas, jujur, sabar) dipuji syarak; manakala Mazmumah (seperti sombong, dengki, riya\') dicela syarak.',
    order: 2,
    choices: [
      { id: 'c-akh25c1-2-1', question_id: 'q-akh25c1-2', option_text: 'Mahmudah ialah sifat terpuji yang mendatangkan pahala; Mazmumah ialah sifat keji yang membawa dosa', is_correct: true },
      { id: 'c-akh25c1-2-2', question_id: 'q-akh25c1-2', option_text: 'Mahmudah ialah amalan fizikal; Mazmumah ialah amalan rohani sahaja', is_correct: false },
      { id: 'c-akh25c1-2-3', question_id: 'q-akh25c1-2', option_text: 'Mahmudah dipelajari di universiti; Mazmumah dipelajari di sekolah rendah', is_correct: false },
      { id: 'c-akh25c1-2-4', question_id: 'q-akh25c1-2', option_text: 'Mahmudah khusus untuk orang dewasa; Mazmumah khusus untuk kanak-kanak', is_correct: false },
    ],
  },
  {
    id: 'q-akh25c1-3',
    section_id: 'sec-akhlak-2025-C1',
    question_text: 'Nyatakan cara yang betul menurut adab Islam ketika menegur kesilapan rakan sebaya.',
    explanation: 'Adab nasihat dalam Islam menuntut keikhlasan dan menjaga aib rakan (Nasihat secara bersendirian), bukan memalu atau mengaibkannya.',
    order: 3,
    choices: [
      { id: 'c-akh25c1-3-1', question_id: 'q-akh25c1-3', option_text: 'Menegur secara bersendirian (peribadi), menggunakan bahasa yang lembut dan penuh kasih sayang', is_correct: true },
      { id: 'c-akh25c1-3-2', question_id: 'q-akh25c1-3', option_text: 'Menyebarkan kesilapan rakan di dalam kumpulan WhatsApp sekolah', is_correct: false },
      { id: 'c-akh25c1-3-3', question_id: 'q-akh25c1-3', option_text: 'Meniup perbalahan supaya rakan berasa malu di hadapan rakan-rakan lain', is_correct: false },
      { id: 'c-akh25c1-3-4', question_id: 'q-akh25c1-3', option_text: 'Memulaukan rakan tersebut tanpa memberitahu punca sebenar', is_correct: false },
    ],
  },
  {
    id: 'q-akh25c1-4',
    section_id: 'sec-akhlak-2025-C1',
    question_text: 'Bagaimanakah sifat "Syukur" dapat dizahirkan oleh seorang murid yang mendapat keputusan cemerlang dalam peperiksaan SPPI?',
    explanation: 'Syukur dizahirkan dengan lidah (Tahmid), hati (Pengakuan nikmat Allah) dan anggota badan (Sujud & amalan soleh).',
    order: 4,
    choices: [
      { id: 'c-akh25c1-4-1', question_id: 'q-akh25c1-4', option_text: 'Mengucapkan Sujud Syukur, memuji Allah, berterima kasih kepada ibu bapa/guru & tidak sombong', is_correct: true },
      { id: 'c-akh25c1-4-2', question_id: 'q-akh25c1-4', option_text: 'Mengadakan parti liar dan bersikap sombong mendabik dada', is_correct: false },
      { id: 'c-akh25c1-4-3', question_id: 'q-akh25c1-4', option_text: 'Memerlekehkan rakan yang mendapat keputusan kurang memuaskan', is_correct: false },
      { id: 'c-akh25c1-4-4', question_id: 'q-akh25c1-4', option_text: 'Menyimpan kejayaan tersebut tanpa perlu berterima kasih kepada sesiapa', is_correct: false },
    ],
  },
  {
    id: 'q-akh25c1-5',
    section_id: 'sec-akhlak-2025-C1',
    question_text: 'Apakah hikmah mengamalkan adab berjual beli dan muamalat yang jujur di kantin sekolah atau perniagaan?',
    explanation: 'Kejujuran dalam jual beli membawa keberkatan rezeki dan dipuji oleh Rasulullah SAW.',
    order: 5,
    choices: [
      { id: 'c-akh25c1-5-1', question_id: 'q-akh25c1-5', option_text: 'Rezeki menjadi berkat, mengelakkan penipuan & membina kepercayaan sesama manusia', is_correct: true },
      { id: 'c-akh25c1-5-2', question_id: 'q-akh25c1-5', option_text: 'Memastikan penjual mendapat keuntungan berganda secara cepat', is_correct: false },
      { id: 'c-akh25c1-5-3', question_id: 'q-akh25c1-5', option_text: 'Menyebabkan pembeli berasa takut untuk berurusan lagi', is_correct: false },
      { id: 'c-akh25c1-5-4', question_id: 'q-akh25c1-5', option_text: 'Menghapuskan persaingan perniagaan di sekolah', is_correct: false },
    ],
  },

  // --- Akhlak 2025 Bahagian C (Set 2): Soalan Subjektif Pilihan Berstruktur (5 Soalan) ---
  {
    id: 'q-akh25c2-1',
    section_id: 'sec-akhlak-2025-C2',
    question_text: 'Seorang pelajar sering digoda untuk meniru ketika ujian kerana tidak sempat mengulangkaji. Apakah tindakan yang mencerminkan sifat Amanah dan Taqwa?',
    explanation: 'Meniru dalam ujian ialah perbuatan khianat dan menipu. Rasulullah SAW bersabda: "Siapa yang menipu kami maka bukanlah dia daripada golongan kami."',
    order: 1,
    choices: [
      { id: 'c-akh25c2-1-1', question_id: 'q-akh25c2-1', option_text: 'Menjawab mengikut kemampuan sendiri secara jujur dan bertawakal kepada Allah', is_correct: true },
      { id: 'c-akh25c2-1-2', question_id: 'q-akh25c2-1', option_text: 'Menyalin jawapan rakan di sebelah secara senyap-senyap', is_correct: false },
      { id: 'c-akh25c2-1-3', question_id: 'q-akh25c2-1', option_text: 'Membawa nota kecil ke dalam bilik peperiksaan sebagai sandaran', is_correct: false },
      { id: 'c-akh25c2-1-4', question_id: 'q-akh25c2-1', option_text: 'Pura-pura sakit dan keluar dari bilik ujian untuk mengelak', is_correct: false },
    ],
  },
  {
    id: 'q-akh25c2-2',
    section_id: 'sec-akhlak-2025-C2',
    question_text: 'Mengapakah Islam melarang umatnya bersikap "Ujub" (Berasa kagum dan bangga dengan diri sendiri)?',
    explanation: 'Ujub ialah salah satu daripada penyakit hati yang membinasakan amalan soleh kerana menganggap kebaikan adalah atas kehebatannya sendiri.',
    order: 2,
    choices: [
      { id: 'c-akh25c2-2-1', question_id: 'q-akh25c2-2', option_text: 'Ujub merosakkan pahala amalan, melahirkan sifat takabur & melupakan bantuan Allah', is_correct: true },
      { id: 'c-akh25c2-2-2', question_id: 'q-akh25c2-2', option_text: 'Kerana ujub menjadikan seseorang itu terlalu berani', is_correct: false },
      { id: 'c-akh25c2-2-3', question_id: 'q-akh25c2-2', option_text: 'Kerana ujub menyebabkan tidur seseorang menjadi terlalu lena', is_correct: false },
      { id: 'c-akh25c2-2-4', question_id: 'q-akh25c2-2', option_text: 'Kerana ujub mengurangkan berat badan seseorang', is_correct: false },
    ],
  },
  {
    id: 'q-akh25c2-3',
    section_id: 'sec-akhlak-2025-C2',
    question_text: 'Apakah adab yang betul ketika berkomunikasi dan mengelakkan perpecahan di dalam media sosial?',
    explanation: 'Prinsip Tabayyun (menyemak kebenaran) ditegaskan dalam Surah Al-Hujurat ayat 6 untuk mengelakkan penyesalan dan fitnah.',
    order: 3,
    choices: [
      { id: 'c-akh25c2-3-1', question_id: 'q-akh25c2-3', option_text: 'Menyemak kesahihan maklumat (Tabayyun), bahasa bersopan & menjauhi caci maki', is_correct: true },
      { id: 'c-akh25c2-3-2', question_id: 'q-akh25c2-3', option_text: 'Memuat naik sebarang khabar angin tanpa perlu menyemak kesahihan', is_correct: false },
      { id: 'c-akh25c2-3-3', question_id: 'q-akh25c2-3', option_text: 'Menggunakan nama palsu untuk mengejek dan memaki orang lain', is_correct: false },
      { id: 'c-akh25c2-3-4', question_id: 'q-akh25c2-3', option_text: 'Membocorkan maklumat peribadi rakan untuk dijadikan bahan jenaka', is_correct: false },
    ],
  },
  {
    id: 'q-akh25c2-4',
    section_id: 'sec-akhlak-2025-C2',
    question_text: 'Terangkan cara menghormati dan beradab kepada rakan yang berlainan agama atau bangsa di sekolah.',
    explanation: 'Islam mengajar akhlak rahmatan lil \'alamin iaitu bersikap adil, bertoleransi dan menghormati hak sesama manusia tanpa mengira bangsa atau agama.',
    order: 4,
    choices: [
      { id: 'c-akh25c2-4-1', question_id: 'q-akh25c2-4', option_text: 'Bersikap adil, saling menghormati, tidak menghina kepercayaan mereka & bantu-membantu', is_correct: true },
      { id: 'c-akh25c2-4-2', question_id: 'q-akh25c2-4', option_text: 'Memulau dan enggan bertegur sapa dengan mereka', is_correct: false },
      { id: 'c-akh25c2-4-3', question_id: 'q-akh25c2-4', option_text: 'Menghina dan mengejek amalan keagamaan mereka', is_correct: false },
      { id: 'c-akh25c2-4-4', question_id: 'q-akh25c2-4', option_text: 'Memaksa mereka mengikut amalan agama Islam secara kasar', is_correct: false },
    ],
  },
  {
    id: 'q-akh25c2-5',
    section_id: 'sec-akhlak-2025-C2',
    question_text: 'Bagaimanakah amalan "Sabar" dapat membantu seorang murid tatkala diuji dengan kegagalan atau musibah?',
    explanation: 'Sabar ialah ketabahan jiwa yang melahirkan ketenangan, reda dan daya tahan untuk bangkit mencapai kejayaan dengan bantuan Allah SWT.',
    order: 5,
    choices: [
      { id: 'c-akh25c2-5-1', question_id: 'q-akh25c2-5', option_text: 'Menenangkan emosi, mencegah tindakan terburu-buru & membuka jalan muhasabah untuk bangkit', is_correct: true },
      { id: 'c-akh25c2-5-2', question_id: 'q-akh25c2-5', option_text: 'Menyebabkan murid menangis tanpa henti dan mengurung diri', is_correct: false },
      { id: 'c-akh25c2-5-3', question_id: 'q-akh25c2-5', option_text: 'Mendorong murid untuk melupakan segala impian hidupnya', is_correct: false },
      { id: 'c-akh25c2-5-4', question_id: 'q-akh25c2-5', option_text: 'Menjadikan murid marahkan takdir dan menyalahkan rakan-rakan', is_correct: false },
    ],
  },

  // --- Fekah 2024 Bahagian A: Soalan Objektif (10 Soalan) ---
  {
    id: 'q-fek24a-1',
    section_id: 'sec-fekah-2024-A',
    question_text: 'Manakah antara berikut BUKAN syarat sah wuduk mengikut mazhab Syafi\'i?',
    explanation: 'Mengelap air wuduk dengan kain atau tuala selepas wuduk adalah harus dan bukan syarat sah wuduk.',
    order: 1,
    choices: [
      { id: 'c-fek24a-1-1', question_id: 'q-fek24a-1', option_text: 'Mengelap air wuduk dengan tuala bersih selepas selesai', is_correct: true },
      { id: 'c-fek24a-1-2', question_id: 'q-fek24a-1', option_text: 'Islam dan berakal serta mumayyiz', is_correct: false },
      { id: 'c-fek24a-1-3', question_id: 'q-fek24a-1', option_text: 'Suci daripada haid dan nifas', is_correct: false },
      { id: 'c-fek24a-1-4', question_id: 'q-fek24a-1', option_text: 'Menggunakan air mutlak yang suci lagi menyucikan', is_correct: false },
    ],
  },
  {
    id: 'q-fek24a-2',
    section_id: 'sec-fekah-2024-A',
    question_text: 'Apakah hukum bagi seseorang yang memakan daging unta menurut pendapat muktamad Mazhab Syafi\'i?',
    explanation: 'Mengikut pendapat rasmi Mazhab Syafi\'i, memakan daging unta yang dimasak tidak membatalkan wuduk.',
    order: 2,
    choices: [
      { id: 'c-fek24a-2-1', question_id: 'q-fek24a-2', option_text: 'Tidak membatalkan wuduk', is_correct: true },
      { id: 'c-fek24a-2-2', question_id: 'q-fek24a-2', option_text: 'Membatalkan wuduk serta-merta', is_correct: false },
      { id: 'c-fek24a-2-3', question_id: 'q-fek24a-2', option_text: 'Membatalkan solat tetapi tidak membatalkan wuduk', is_correct: false },
      { id: 'c-fek24a-2-4', question_id: 'q-fek24a-2', option_text: 'Haram dimakan dalam apa jua keadaan', is_correct: false },
    ],
  },
  {
    id: 'q-fek24a-3',
    section_id: 'sec-fekah-2024-A',
    question_text: 'Berapakah jarak minimum perjalanan seorang musafir yang mengharuskan solat Jamak dan Qasar?',
    explanation: 'Jarak mengharuskan Solat Jamak dan Qasar ialah 2 marhalah (dianggarkan kira-kira 81 hingga 89 kilometer).',
    order: 3,
    choices: [
      { id: 'c-fek24a-3-1', question_id: 'q-fek24a-3', option_text: '2 Marhalah (kira-kira 81km - 89km)', is_correct: true },
      { id: 'c-fek24a-3-2', question_id: 'q-fek24a-3', option_text: '1 Marhalah (kira-kira 40km)', is_correct: false },
      { id: 'c-fek24a-3-3', question_id: 'q-fek24a-3', option_text: '100 Miles (kira-kira 160km)', is_correct: false },
      { id: 'c-fek24a-3-4', question_id: 'q-fek24a-3', option_text: '3 Marhalah (kira-kira 150km)', is_correct: false },
    ],
  },
  {
    id: 'q-fek24a-4',
    section_id: 'sec-fekah-2024-A',
    question_text: 'Sujud Sahwi dilakukan sebelum atau selepas salam apabila berlaku kesilapan dalam solat. Berapakah bilangan sujudnya?',
    explanation: 'Sujud Sahwi dilakukan sebanyak dua kali sujud sebelum salam disertai bacaan doa sujud sahwi.',
    order: 4,
    choices: [
      { id: 'c-fek24a-4-1', question_id: 'q-fek24a-4', option_text: 'Dua kali sujud sebelum salam', is_correct: true },
      { id: 'c-fek24a-4-2', question_id: 'q-fek24a-4', option_text: 'Satu kali sujud selepas salam', is_correct: false },
      { id: 'c-fek24a-4-3', question_id: 'q-fek24a-4', option_text: 'Tiga kali sujud berturut-turut', is_correct: false },
      { id: 'c-fek24a-4-4', question_id: 'q-fek24a-4', option_text: 'Empat kali sujud beserta iktidal', is_correct: false },
    ],
  },
  {
    id: 'q-fek24a-5',
    section_id: 'sec-fekah-2024-A',
    question_text: 'Kategori air yang suci pada dirinya tetapi TIDAK boleh digunakan untuk menyucikan hadas atau najis ialah:',
    explanation: 'Air Mutanajjis atau Air Musta\'mal (air yang telah digunakan untuk wuduk/mandi wajib) ialah air suci tetapi tidak menyucikan yang lain.',
    order: 5,
    choices: [
      { id: 'c-fek24a-5-1', question_id: 'q-fek24a-5', option_text: 'Air Musta\'mal & Air Mutaghayyir (Berubah sifat)', is_correct: true },
      { id: 'c-fek24a-5-2', question_id: 'q-fek24a-5', option_text: 'Air Hujan dan Air Embun', is_correct: false },
      { id: 'c-fek24a-5-3', question_id: 'q-fek24a-5', option_text: 'Air Laut dan Air Sungai yang jernih', is_correct: false },
      { id: 'c-fek24a-5-4', question_id: 'q-fek24a-5', option_text: 'Air Perigi dan Air Salji', is_correct: false },
    ],
  },
  {
    id: 'q-fek24a-6',
    section_id: 'sec-fekah-2024-A',
    question_text: 'Apakah syarat wajib puasa Ramadan bagi seseorang Muslim?',
    explanation: 'Syarat wajib puasa ialah Islam, Baligh, Berakal, Mampu (Sihat) dan Sucreation daripada haid/nifas bagi wanita.',
    order: 6,
    choices: [
      { id: 'c-fek24a-6-1', question_id: 'q-fek24a-6', option_text: 'Islam, Baligh, Berakal & Kuat/Mampu berpuasa', is_correct: true },
      { id: 'c-fek24a-6-2', question_id: 'q-fek24a-6', option_text: 'Memiliki harta melebih nisbah zakat', is_correct: false },
      { id: 'c-fek24a-6-3', question_id: 'q-fek24a-6', option_text: 'Sudah menunaikan ibadah umrah atau haji', is_correct: false },
      { id: 'c-fek24a-6-4', question_id: 'q-fek24a-6', option_text: 'Bermustautin di Makkah atau Madinah sahaja', is_correct: false },
    ],
  },
  {
    id: 'q-fek24a-7',
    section_id: 'sec-fekah-2024-A',
    question_text: 'Najis Mutawassitah seperti air kencing atau darah haiwan disucikan dengan cara:',
    explanation: 'Menghilangkan zat, warna, rasa dan bau najis, kemudian membasuhnya dengan air mutlak sehingga bersih.',
    order: 7,
    choices: [
      { id: 'c-fek24a-7-1', question_id: 'q-fek24a-7', option_text: 'Menghilangkan bau, warna & rasa lalu membasuh dengan air mutlak', is_correct: true },
      { id: 'c-fek24a-7-2', question_id: 'q-fek24a-7', option_text: 'Membasuh 7 kali dan salah satunya bercampur tanah', is_correct: false },
      { id: 'c-fek24a-7-3', question_id: 'q-fek24a-7', option_text: 'Merenjis air mutlak sahaja tanpa perlu basuhan mengalir', is_correct: false },
      { id: 'c-fek24a-7-4', question_id: 'q-fek24a-7', option_text: 'Menyapu dengan kain kering tanpa menggunakan air', is_correct: false },
    ],
  },
  {
    id: 'q-fek24a-8',
    section_id: 'sec-fekah-2024-A',
    question_text: 'Apakah hukum membaca doa Qunut dalam Solat Subuh mengikut Mazhab Syafi\'i?',
    explanation: 'Membaca doa Qunut pada iktidal rakaat kedua solat Subuh ialah Sunat Ab\'ad (jika ditinggalkan disunatkan sujud sahwi).',
    order: 8,
    choices: [
      { id: 'c-fek24a-8-1', question_id: 'q-fek24a-8', option_text: 'Sunat Ab\'ad (Diganti Sujud Sahwi jika tertinggal)', is_correct: true },
      { id: 'c-fek24a-8-2', question_id: 'q-fek24a-8', option_text: 'Rukun Solat yang membatalkan solat jika ditinggalkan', is_correct: false },
      { id: 'c-fek24a-8-3', question_id: 'q-fek24a-8', option_text: 'Sunat Hai\'ah yang tidak memerlukan sujud sahwi', is_correct: false },
      { id: 'c-fek24a-8-4', question_id: 'q-fek24a-8', option_text: 'Makruh dibaca secara bersendirian', is_correct: false },
    ],
  },
  {
    id: 'q-fek24a-9',
    section_id: 'sec-fekah-2024-A',
    question_text: 'Seseorang yang terlupa membaca Tahiyyat Awal dan terus berdiri untuk rakaat ketiga hendaklah:',
    explanation: 'Tidak perlu patah balik ke duduk tahiyyat awal jika sudah berdiri sempurna, sebaliknya meneruskan solat dan sujud sahwi sebelum salam.',
    order: 9,
    choices: [
      { id: 'c-fek24a-9-1', question_id: 'q-fek24a-9', option_text: 'Meneruskan solat dan melakukan Sujud Sahwi sebelum salam', is_correct: true },
      { id: 'c-fek24a-9-2', question_id: 'q-fek24a-9', option_text: 'Duduk semula dengan serta-merta dan membatalkan solat jika tidak duduk', is_correct: false },
      { id: 'c-fek24a-9-3', question_id: 'q-fek24a-9', option_text: 'Mengulang semula solat dari rakaat pertama', is_correct: false },
      { id: 'c-fek24a-9-4', question_id: 'q-fek24a-9', option_text: 'Membaca Tahiyyat Awal secara kuat sambil berdiri', is_correct: false },
    ],
  },
  {
    id: 'q-fek24a-10',
    section_id: 'sec-fekah-2024-A',
    question_text: 'Ibadat Zakat Fitrah wajib dikeluarkan pada bulan Ramadan bagi:',
    explanation: 'Wajib ke atas setiap individu Muslim yang hidup dan mempunyai lebihan makanan untuk dirinya dan tanggungannya pada malam Raya.',
    order: 10,
    choices: [
      { id: 'c-fek24a-10-1', question_id: 'q-fek24a-10', option_text: 'Setiap Muslim yang ada lebihan makanan pada malam & hari raya', is_correct: true },
      { id: 'c-fek24a-10-2', question_id: 'q-fek24a-10', option_text: 'Golongan kaya yang memiliki emas lebih 85 gram sahaja', is_correct: false },
      { id: 'c-fek24a-10-3', question_id: 'q-fek24a-10', option_text: 'Orang dewasa yang bekerja dalam sektor kerajaan sahaja', is_correct: false },
      { id: 'c-fek24a-10-4', question_id: 'q-fek24a-10', option_text: 'Para peniaga yang memiliki syarikat besar', is_correct: false },
    ],
  },

  // --- Fekah 2024 Bahagian B (Set 1): Soalan Betul / Salah (5 Soalan) ---
  {
    id: 'q-fek24b1-1',
    section_id: 'sec-fekah-2024-B1',
    question_text: 'Niat mandi wajib (Mandi Hadas Besar) mesti dilafazkan atau dihadirkan dalam hati sewaktu air pertama menyentuh mana-mana anggota badan.',
    explanation: 'BETUL. Niat mandi wajib dihadirkan semasa awal membasuh tubuh badan.',
    order: 1,
    choices: [
      { id: 'c-fek24b1-1-1', question_id: 'q-fek24b1-1', option_text: 'BETUL', is_correct: true },
      { id: 'c-fek24b1-1-2', question_id: 'q-fek24b1-1', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-fek24b1-2',
    section_id: 'sec-fekah-2024-B1',
    question_text: 'Muntah dengan sengaja semasa berpuasa tidak membatalkan puasa sekiranya ditelan semula secara tidak sengaja.',
    explanation: 'SALAH. Muntah secara sengaja adalah membatalkan puasa Ramadan mengikut ijmak ulama.',
    order: 2,
    choices: [
      { id: 'c-fek24b1-2-1', question_id: 'q-fek24b1-2', option_text: 'BETUL', is_correct: false },
      { id: 'c-fek24b1-2-2', question_id: 'q-fek24b1-2', option_text: 'SALAH', is_correct: true },
    ],
  },
  {
    id: 'q-fek24b1-3',
    section_id: 'sec-fekah-2024-B1',
    question_text: 'Syarat sah Solat Jumaat hendaklah didirikan secara berjemaah sekurang-kurangnya 40 orang ahli jemaah yang bermustautin mengikut Mazhab Syafi\'i.',
    explanation: 'BETUL. Syarat standard Solat Jumaat Mazhab Syafi\'i memerlukan 40 orang jemaah lelaki mukallaf bermustautin.',
    order: 3,
    choices: [
      { id: 'c-fek24b1-3-1', question_id: 'q-fek24b1-3', option_text: 'BETUL', is_correct: true },
      { id: 'c-fek24b1-3-2', question_id: 'q-fek24b1-3', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-fek24b1-4',
    section_id: 'sec-fekah-2024-B1',
    question_text: 'Tayamum harus dilakukan sebagai ganti wuduk sekiranya cuaca terlalu sejuk walaupun terdapat air yang mencukupi dan tidak memudaratkan.',
    explanation: 'SALAH. Tayamum hanya harus jika ketiadaan air atau penggunaan air memudaratkan kesihatan berdasarkan pengesahan perubatan.',
    order: 4,
    choices: [
      { id: 'c-fek24b1-4-1', question_id: 'q-fek24b1-4', option_text: 'BETUL', is_correct: false },
      { id: 'c-fek24b1-4-2', question_id: 'q-fek24b1-4', option_text: 'SALAH', is_correct: true },
    ],
  },
  {
    id: 'q-fek24b1-5',
    section_id: 'sec-fekah-2024-B1',
    question_text: 'Solat Sunat Rawatib ialah solat sunat yang mengiringi solat fardu sama ada sebelum (Qabliyyah) atau selepasnya (Ba\'diyyah).',
    explanation: 'BETUL. Solat Rawatib dituntut untuk menampung kekurangan dalam solat fardu.',
    order: 5,
    choices: [
      { id: 'c-fek24b1-5-1', question_id: 'q-fek24b1-5', option_text: 'BETUL', is_correct: true },
      { id: 'c-fek24b1-5-2', question_id: 'q-fek24b1-5', option_text: 'SALAH', is_correct: false },
    ],
  },

  // --- Fekah 2024 Bahagian B (Set 2): Soalan Betul / Salah (5 Soalan) ---
  {
    id: 'q-fek24b2-1',
    section_id: 'sec-fekah-2024-B2',
    question_text: 'Membaca Surah Al-Fatihah dengan tajwid dan makhraj yang betul ialah Rukun Qauli dalam solat.',
    explanation: 'BETUL. Al-Fatihah ialah Rukun Qauli; batal solat jika bacaan Fatihah salah atau terabai rukunnya.',
    order: 1,
    choices: [
      { id: 'c-fek24b2-1-1', question_id: 'q-fek24b2-1', option_text: 'BETUL', is_correct: true },
      { id: 'c-fek24b2-1-2', question_id: 'q-fek24b2-1', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-fek24b2-2',
    section_id: 'sec-fekah-2024-B2',
    question_text: 'Menyapu sebahagian kepala semasa wuduk mengikut Mazhab Syafi\'i memadai walaupun sekadar membasahi beberapa helai rambut di kawasan kepala.',
    explanation: 'BETUL. Mengikut Mazhab Syafi\'i, kadar wajib menyapu kepala ialah membasahi sekurang-kurangnya sebahagian rambut di dalam had kepala.',
    order: 2,
    choices: [
      { id: 'c-fek24b2-2-1', question_id: 'q-fek24b2-2', option_text: 'BETUL', is_correct: true },
      { id: 'c-fek24b2-2-2', question_id: 'q-fek24b2-2', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-fek24b2-3',
    section_id: 'sec-fekah-2024-B2',
    question_text: 'Orang yang uzur syar\'i seperti pesakit di hospital dibolehkan menunaikan solat mengikut kemampuan sama ada secara duduk, berbaring atau isyarat.',
    explanation: 'BETUL. Solat tidak pernah gugur kewajipannya selagi berakal; ditunaikan mengikut kadar kemampuan.',
    order: 3,
    choices: [
      { id: 'c-fek24b2-3-1', question_id: 'q-fek24b2-3', option_text: 'BETUL', is_correct: true },
      { id: 'c-fek24b2-3-2', question_id: 'q-fek24b2-3', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-fek24b2-4',
    section_id: 'sec-fekah-2024-B2',
    question_text: 'Bagi makmum masbuk yang sempat ruku\' bersama imam sebelum imam bangkit iktidal, dia dikira mendapat rakaat tersebut.',
    explanation: 'BETUL. Tumakninah ruku\' bersama imam mengira rakaat tersebut bagi makmum masbuk.',
    order: 4,
    choices: [
      { id: 'c-fek24b2-4-1', question_id: 'q-fek24b2-4', option_text: 'BETUL', is_correct: true },
      { id: 'c-fek24b2-4-2', question_id: 'q-fek24b2-4', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-fek24b2-5',
    section_id: 'sec-fekah-2024-B2',
    question_text: 'Hukum berkhatan (Khitan) bagi anak lelaki Muslim ialah sunat sahaja dan tidak dituntut oleh syarak.',
    explanation: 'SALAH. Berkhatan bagi lelaki Muslim ialah wajib dalam Mazhab Syafi\'i untuk menjaga kesucian dan kebersihan daripada najis.',
    order: 5,
    choices: [
      { id: 'c-fek24b2-5-1', question_id: 'q-fek24b2-5', option_text: 'BETUL', is_correct: false },
      { id: 'c-fek24b2-5-2', question_id: 'q-fek24b2-5', option_text: 'SALAH', is_correct: true },
    ],
  },

  // --- Fekah 2024 Bahagian C (Set 1): Soalan Subjektif Pilihan Berstruktur (5 Soalan) ---
  {
    id: 'q-fek24c1-1',
    section_id: 'sec-fekah-2024-C1',
    question_text: 'Ahmad sedang solat dan dia berasa ragu-ragu sama ada dia berada di rakaat ketiga atau rakaat keempat. Apakah tindakan yang wajib diambil mengikut kaedah Fiqh?',
    explanation: 'Kaedah fiqh menetapkan "Yakin tidak boleh dihilangkan dengan keraguan". Ahmad mesti mengambil bilangan rakaat terendah (iaitu 3) dan sujud sahwi.',
    order: 1,
    choices: [
      { id: 'c-fek24c1-1-1', question_id: 'q-fek24c1-1', option_text: 'Mengambil bilangan rakaat paling yakin/terendah (3 rakaat), menambah 1 rakaat lagi & Sujud Sahwi', is_correct: true },
      { id: 'c-fek24c1-1-2', question_id: 'q-fek24c1-1', option_text: 'Menganggap sudah 4 rakaat dan terus memberi salam tanpa sujud sahwi', is_correct: false },
      { id: 'c-fek24c1-1-3', question_id: 'q-fek24c1-1', option_text: 'Membatalkan solat serta-merta dan bermula semula', is_correct: false },
      { id: 'c-fek24c1-1-4', question_id: 'q-fek24c1-1', option_text: 'Bertanya kepada jemaah berdekatan ketika masih dalam solat', is_correct: false },
    ],
  },
  {
    id: 'q-fek24c1-2',
    section_id: 'sec-fekah-2024-C1',
    question_text: 'Apakah hikmah disyariatkan Solat Jamak Takdim dan Jamak Takhir kepada umat Islam semasa bermusafir?',
    explanation: 'Memberi kemudahan (Rukhsoh) dan mengelakkan kesusahan (Rafa\' al-Haraj) supaya ibadat solat dapat dilaksanakan dalam apa jua keadaan.',
    order: 2,
    choices: [
      { id: 'c-fek24c1-2-1', question_id: 'q-fek24c1-2', option_text: 'Rukhsoh (Keringanan) syarak untuk mengelakkan kesukaran & menjaga kewajipan solat', is_correct: true },
      { id: 'c-fek24c1-2-2', question_id: 'q-fek24c1-2', option_text: 'Membolehkan musafir mempercepatkan perjalanan untuk pulang awal', is_correct: false },
      { id: 'c-fek24c1-2-3', question_id: 'q-fek24c1-2', option_text: 'Mengurangkan pahala solat supaya musafir dapat berehat panjang', is_correct: false },
      { id: 'c-fek24c1-2-4', question_id: 'q-fek24c1-2', option_text: 'Menggantikan kewajipan solat fardu dengan solat sunat', is_correct: false },
    ],
  },
  {
    id: 'q-fek24c1-3',
    section_id: 'sec-fekah-2024-C1',
    question_text: 'Nyatakan perbezaan antara Najis Mughallazah dan Najis Mukhaffafah dari segi cara penyuciannya.',
    explanation: 'Mughallazah (Anjing/Babi) dibasuh 7 kali (1 kali air tanah); Mukhaffafah (kencing bayi lelaki < 2 tahun makan susu ibu) cukup dipercikkan air.',
    order: 3,
    choices: [
      { id: 'c-fek24c1-3-1', question_id: 'q-fek24c1-3', option_text: 'Mughallazah: 7 kali basuhan (1 dengan tanah); Mukhaffafah: dipercikkan air mutlak hingga rata', is_correct: true },
      { id: 'c-fek24c1-3-2', question_id: 'q-fek24c1-3', option_text: 'Mughallazah: dipercikkan air; Mukhaffafah: dibakar dengan api', is_correct: false },
      { id: 'c-fek24c1-3-3', question_id: 'q-fek24c1-3', option_text: 'Mughallazah: dibasuh dengan sabun; Mukhaffafah: direndam 3 hari', is_correct: false },
      { id: 'c-fek24c1-3-4', question_id: 'q-fek24c1-3', option_text: 'Kedua-dua najis disucikan dengan kaedah yang sama sahaja', is_correct: false },
    ],
  },
  {
    id: 'q-fek24c1-4',
    section_id: 'sec-fekah-2024-C1',
    question_text: 'Apakah hukum bagi individu yang tidak sempat berniat puasa Ramadan pada malam hari tetapi berniat pada waktu pagi sebelum Zohor bagi puasa SUNAT?',
    explanation: 'Bagi puasa SUNAT, niat harus dilakukan pada siang hari sebelum Zohor sekiranya belum makan atau minum apa-apa.',
    order: 4,
    choices: [
      { id: 'c-fek24c1-4-1', question_id: 'q-fek24c1-4', option_text: 'Sah puasa sunat tersebut sekiranya belum melakukan perkara yang membatalkan puasa', is_correct: true },
      { id: 'c-fek24c1-4-2', question_id: 'q-fek24c1-4', option_text: 'Tidak sah dan wajib membayar fidyah', is_correct: false },
      { id: 'c-fek24c1-4-3', question_id: 'q-fek24c1-4', option_text: 'Batal serta-merta dan mendapat dosa', is_correct: false },
      { id: 'c-fek24c1-4-4', question_id: 'q-fek24c1-4', option_text: 'Sah untuk puasa Ramadan wajib sahaja', is_correct: false },
    ],
  },
  {
    id: 'q-fek24c1-5',
    section_id: 'sec-fekah-2024-C1',
    question_text: 'Bagaimanakah cara menentukan arah kiblat bagi seseorang yang berada di tempat asing tanpa kompas atau telefon pintar?',
    explanation: 'Menggunakan tanda alam (kedudukan matahari, bintang Kutub) atau bertanya kepada penduduk tempatan yang diyakini.',
    order: 5,
    choices: [
      { id: 'c-akh24c1-5-1', question_id: 'q-fek24c1-5', option_text: 'Ijtihad berdasarkan tanda alam (matahari) atau bertanyakan penduduk Muslim tempatan', is_correct: true },
      { id: 'c-akh24c1-5-2', question_id: 'q-fek24c1-5', option_text: 'Menghadap ke mana-mana arah secara bebas tanpa perlu berusaha', is_correct: false },
      { id: 'c-akh24c1-5-3', question_id: 'q-fek24c1-5', option_text: 'Solat tanpa menghadap kiblat dan mengulangnya di rumah', is_correct: false },
      { id: 'c-akh24c1-5-4', question_id: 'q-fek24c1-5', option_text: 'Menunggu sehingga waktu solat tamat untuk mencari kompas', is_correct: false },
    ],
  },

  // --- Fekah 2024 Bahagian C (Set 2): Soalan Subjektif Pilihan Berstruktur (5 Soalan) ---
  {
    id: 'q-fek24c2-1',
    section_id: 'sec-fekah-2024-C2',
    question_text: 'Ali merupakan seorang pesakit yang patah kaki dan dibalut dengan simen. Bagaimanakah cara Ali bersuci untuk mendirikan solat?',
    explanation: 'Ablusi/Wuduk pada anggota yang sihat dan bertayamum di atas balutan bagi anggota yang tercedera.',
    order: 1,
    choices: [
      { id: 'c-fek24c2-1-1', question_id: 'q-fek24c2-1', option_text: 'Mengambil wuduk pada anggota sihat & bertayamum menyapu air/debu pada anggota balutan', is_correct: true },
      { id: 'c-fek24c2-1-2', question_id: 'q-fek24c2-1', option_text: 'Menyiram air panas ke atas balutan simen sehingga basah lencun', is_correct: false },
      { id: 'c-fek24c2-1-3', question_id: 'q-fek24c2-1', option_text: 'Gugur kewajipan solat sehingga kaki sembuh sepenuhnya', is_correct: false },
      { id: 'c-fek24c2-1-4', question_id: 'q-fek24c2-1', option_text: 'Solat tanpa sebarang wuduk atau tayamum', is_correct: false },
    ],
  },
  {
    id: 'q-fek24c2-2',
    section_id: 'sec-fekah-2024-C2',
    question_text: 'Terangkan perbezaan antara Rukun Solat dan Sunat Ab\'ad dari sudut implikasi hukum jika ditinggalkan.',
    explanation: 'Rukun yang ditinggalkan menyebabkan solat batal/tidak sah jika tidak diganti; Sunat Ab\'ad yang ditinggalkan tidak membatalkan solat tetapi diganti dengan Sujud Sahwi.',
    order: 2,
    choices: [
      { id: 'c-fek24c2-2-1', question_id: 'q-fek24c2-2', option_text: 'Tinggal Rukun: Batal solat jika tidak ditampung; Tinggal Ab\'ad: Solat sah tetapi dituntut Sujud Sahwi', is_correct: true },
      { id: 'c-fek24c2-2-2', question_id: 'q-fek24c2-2', option_text: 'Tinggal Rukun: Boleh ganti dengan fidyah; Tinggal Ab\'ad: Batal solat serta merta', is_correct: false },
      { id: 'c-fek24c2-2-3', question_id: 'q-fek24c2-2', option_text: 'Kedua-duanya jika ditinggalkan wajib diulang solat dari awal', is_correct: false },
      { id: 'c-fek24c2-2-4', question_id: 'q-fek24c2-2', option_text: 'Tiada perbezaan antara Rukun dan Sunat Ab\'ad', is_correct: false },
    ],
  },
  {
    id: 'q-fek24c2-3',
    section_id: 'sec-fekah-2024-C2',
    question_text: 'Apakah hukum perbuatan bercakap-cakap semasa khatib sedang menyampaikan Khutbah Jumaat?',
    explanation: 'Bercakap semasa khutbah adalah makruh/menghilangkan pahala keutamaan Jumaat (Lagha) mengikut hadis Nabi SAW.',
    order: 3,
    choices: [
      { id: 'c-fek24c2-3-1', question_id: 'q-fek24c2-3', option_text: 'Makruh / Hilang pahala keutamaan Jumaat (Menjadi lagha)', is_correct: true },
      { id: 'c-fek24c2-3-2', question_id: 'q-fek24c2-3', option_text: 'Membatalkan solat Jumaat secara automatik', is_correct: false },
      { id: 'c-fek24c2-3-3', question_id: 'q-fek24c2-3', option_text: 'Sunat dilakukan jika memberikan arahan kepada jemaah', is_correct: false },
      { id: 'c-fek24c2-3-4', question_id: 'q-fek24c2-3', option_text: 'Harus tanpa sebarang celaan syarak', is_correct: false },
    ],
  },
  {
    id: 'q-fek24c2-4',
    section_id: 'sec-fekah-2024-C2',
    question_text: 'Apakah syarat utama yang membolehkan seorang makmum mengikut imam dalam solat berjemaah?',
    explanation: 'Niat mengikut imam, mengetahui pergerakan imam, berada di belakang imam dan tiada dinding/penghalang tanpa laluan.',
    order: 4,
    choices: [
      { id: 'c-fek24c2-4-1', question_id: 'q-fek24c2-4', option_text: 'Niat mengikut imam, tahu pergerakan imam & berdiri di belakang/selari dengan kedudukan imam', is_correct: true },
      { id: 'c-fek24c2-4-2', question_id: 'q-fek24c2-4', option_text: 'Mesti mempunyai suara yang sama kuat dengan imam', is_correct: false },
      { id: 'c-fek24c2-4-3', question_id: 'q-fek24c2-4', option_text: 'Memakai pakaian yang sama warna dengan imam', is_correct: false },
      { id: 'c-fek24c2-4-4', question_id: 'q-fek24c2-4', option_text: 'Berdiri di hadapan imam supaya dapat mendahului bacaan', is_correct: false },
    ],
  },
  {
    id: 'q-fek24c2-5',
    section_id: 'sec-fekah-2024-C2',
    question_text: 'Mengapakah Islam melarang bersuci menggunakan bahan yang dimuliakan seperti tulang haiwan atau makanan manusia?',
    explanation: 'Kerana tulang merupakan makanan jin/haiwan dan makanan manusia adalah rezeki yang wajib dihormati serta tidak dibazirkan.',
    order: 5,
    choices: [
      { id: 'c-fek24c2-5-1', question_id: 'q-fek24c2-5', option_text: 'Kerana tulang makanan saudara jin & makanan ialah rezeki yang wajib dihormati', is_correct: true },
      { id: 'c-fek24c2-5-2', question_id: 'q-fek24c2-5', option_text: 'Kerana tulang terlalu keras dan boleh melukai kulit', is_correct: false },
      { id: 'c-fek24c2-5-3', question_id: 'q-fek24c2-5', option_text: 'Kerana makanan mahal harganya di pasaran', is_correct: false },
      { id: 'c-fek24c2-5-4', question_id: 'q-fek24c2-5', option_text: 'Kerana bersuci hanya boleh menggunakan cecair kimia sahaja', is_correct: false },
    ],
  },
  // --- SIRAH 2024 Bahagian A (Soalan Objektif 1-10) ---
  {
    id: 'q-s24a-1',
    section_id: 'sec-sirah-2024-A',
    question_text: 'Nabi Muhammad SAW dilahirkan pada 12 Rabiulawal Tahun Gajah. Mengapakah tahun tersebut dinamakan Tahun Gajah?',
    explanation: 'Tahun tersebut dinamakan Tahun Gajah kerana berlakunya peristiwa serangan tentera gajah pimpinan Abrahah dari Yaman yang ingin memusnahkan Kaabah.',
    order: 1,
    choices: [
      { id: 'c-s24a-1-1', question_id: 'q-s24a-1', option_text: 'Kerana serangan tentera gajah Abrahah untuk meruntuhkan Kaabah', is_correct: true },
      { id: 'c-s24a-1-2', question_id: 'q-s24a-1', option_text: 'Kerana gajah dijadikan haiwan tunggangan rasmi di Makkah', is_correct: false },
      { id: 'c-s24a-1-3', question_id: 'q-s24a-1', option_text: 'Kerana lahirnya seekor gajah putih raksasa di Kota Makkah', is_correct: false },
      { id: 'c-s24a-1-4', question_id: 'q-s24a-1', option_text: 'Kerana perdagangan gajah berkembang pesat pada tahun itu', is_correct: false },
    ],
  },
  {
    id: 'q-s24a-2',
    section_id: 'sec-sirah-2024-A',
    question_text: 'Apakah nama wahyu pertama yang diturunkan kepada Nabi Muhammad SAW di Gua Hira\' menerusi Malaikat Jibril AS?',
    explanation: 'Wahyu pertama ialah 5 ayat pertama Surah Al-\'Alaq yang memerintahkan membaca dan menuntut ilmu.',
    order: 2,
    choices: [
      { id: 'c-s24a-2-1', question_id: 'q-s24a-2', option_text: 'Surah Al-\'Alaq (Ayat 1-5)', is_correct: true },
      { id: 'c-s24a-2-2', question_id: 'q-s24a-2', option_text: 'Surah Al-Fatihah (Ayat 1-7)', is_correct: false },
      { id: 'c-s24a-2-3', question_id: 'q-s24a-2', option_text: 'Surah Al-Muddaththir (Ayat 1-7)', is_correct: false },
      { id: 'c-s24a-2-4', question_id: 'q-s24a-2', option_text: 'Surah Yasin (Ayat 1-5)', is_correct: false },
    ],
  },
  {
    id: 'q-s24a-3',
    section_id: 'sec-sirah-2024-A',
    question_text: 'Apakah gelaran yang diberikan oleh penduduk Makkah kepada Nabi Muhammad SAW kerana sifat kejujuran Baginda sebelum diangkat menjadi Rasul?',
    explanation: 'Baginda digelar Al-Amin yang bermaksud \'Yang Dipercayai\' kerana kejujuran dan amanah Baginda dalam urusan berniaga dan kehidupan.',
    order: 3,
    choices: [
      { id: 'c-s24a-3-1', question_id: 'q-s24a-3', option_text: 'Al-Amin (Yang Dipercayai)', is_correct: true },
      { id: 'c-s24a-3-2', question_id: 'q-s24a-3', option_text: 'As-Siddiq (Yang Membenarkan)', is_correct: false },
      { id: 'c-s24a-3-3', question_id: 'q-s24a-3', option_text: 'Al-Farooq (Pemisah Hak dan Batil)', is_correct: false },
      { id: 'c-s24a-3-4', question_id: 'q-s24a-3', option_text: 'Saifullah (Pedang Allah)', is_correct: false },
    ],
  },
  {
    id: 'q-s24a-4',
    section_id: 'sec-sirah-2024-A',
    question_text: 'Siapakah sahabat rapat yang menemani Nabi Muhammad SAW semasa peristiwa Hijrah dari Makkah ke Madinah dan bersembunyi di Gua Thaur?',
    explanation: 'Saidina Abu Bakar As-Siddiq RA merupakan sahabat setia yang menemani Rasulullah SAW sepanjang perjalanan Hijrah ke Madinah.',
    order: 4,
    choices: [
      { id: 'c-s24a-4-1', question_id: 'q-s24a-4', option_text: 'Saidina Abu Bakar As-Siddiq RA', is_correct: true },
      { id: 'c-s24a-4-2', question_id: 'q-s24a-4', option_text: 'Saidina Umar bin Al-Khattab RA', is_correct: false },
      { id: 'c-s24a-4-3', question_id: 'q-s24a-4', option_text: 'Saidina Ali bin Abi Talib RA', is_correct: false },
      { id: 'c-s24a-4-4', question_id: 'q-s24a-4', option_text: 'Saidina Uthman bin Affan RA', is_correct: false },
    ],
  },
  {
    id: 'q-s24a-5',
    section_id: 'sec-sirah-2024-A',
    question_text: 'Masjid apakah yang pertama dibina oleh Nabi Muhammad SAW sebaik sahaja sampai di pinggir kota Madinah?',
    explanation: 'Masjid Quba merupakan masjid pertama yang dibina atas dasar ketakwaan dalam sejarah Islam.',
    order: 5,
    choices: [
      { id: 'c-s24a-5-1', question_id: 'q-s24a-5', option_text: 'Masjid Quba', is_correct: true },
      { id: 'c-s24a-5-2', question_id: 'q-s24a-5', option_text: 'Masjid Nabawi', is_correct: false },
      { id: 'c-s24a-5-3', question_id: 'q-s24a-5', option_text: 'Masjidil Haram', is_correct: false },
      { id: 'c-s24a-5-4', question_id: 'q-s24a-5', option_text: 'Masjid Aqsa', is_correct: false },
    ],
  },
  {
    id: 'q-s24a-6',
    section_id: 'sec-sirah-2024-A',
    question_text: 'Apakah nama pertempuran besar pertama antara umat Islam Madinah dan musyrikin Makkah pada 17 Ramadan tahun ke-2 Hijrah?',
    explanation: 'Perang Badar berlaku pada 17 Ramadan 2 H di mana 313 tentera Islam dengan pertolongan Allah menang ke atas 1,000 tentera musyrikin.',
    order: 6,
    choices: [
      { id: 'c-s24a-6-1', question_id: 'q-s24a-6', option_text: 'Perang Badar Al-Kubra', is_correct: true },
      { id: 'c-s24a-6-2', question_id: 'q-s24a-6', option_text: 'Perang Uhud', is_correct: false },
      { id: 'c-s24a-6-3', question_id: 'q-s24a-6', option_text: 'Perang Khandaq / Ahzab', is_correct: false },
      { id: 'c-s24a-6-4', question_id: 'q-s24a-6', option_text: 'Perang Hunain', is_correct: false },
    ],
  },
  {
    id: 'q-s24a-7',
    section_id: 'sec-sirah-2024-A',
    question_text: 'Apakah iktibar utama daripada peristiwa kekalahan tentera Islam dalam Perang Uhud?',
    explanation: 'Perang Uhud mengajar iktibar bahawa kepatuhan kepada arahan pemimpin/Rasulullah adalah kunci kejayaan dan kemuliaan.',
    order: 7,
    choices: [
      { id: 'c-s24a-7-1', question_id: 'q-s24a-7', option_text: 'Pentingnya mentaati arahan pemimpin dan berdisiplin', is_correct: true },
      { id: 'c-s24a-7-2', question_id: 'q-s24a-7', option_text: 'Tentera Islam perlu sentiasa berundur jika musuh ramai', is_correct: false },
      { id: 'c-s24a-7-3', question_id: 'c-s24a-7', option_text: 'Harta rampasan perang mestilah diambil secepat mungkin', is_correct: false },
      { id: 'c-s24a-7-4', question_id: 'q-s24a-7', option_text: 'Kekuatan fizikal lebih penting daripada keimanan', is_correct: false },
    ],
  },
  {
    id: 'q-s24a-8',
    section_id: 'sec-sirah-2024-A',
    question_text: 'Perjanjian Hudaibiyah dimeterai pada tahun ke-6 Hijrah. Siapakah wakil musyrikin Makkah dalam rundingan perjanjian tersebut?',
    explanation: 'Suhail bin Amr dilantik oleh musyrikin Makkah untuk berunding dan memeterai Perjanjian Hudaibiyah dengan Rasulullah SAW.',
    order: 8,
    choices: [
      { id: 'c-s24a-8-1', question_id: 'q-s24a-8', option_text: 'Suhail bin Amr', is_correct: true },
      { id: 'c-s24a-8-2', question_id: 'q-s24a-8', option_text: 'Abu Sufyan bin Harb', is_correct: false },
      { id: 'c-s24a-8-3', question_id: 'q-s24a-8', option_text: 'Abu Jahal', is_correct: false },
      { id: 'c-s24a-8-4', question_id: 'q-s24a-8', option_text: 'Walid bin Al-Mughirah', is_correct: false },
    ],
  },
  {
    id: 'q-s24a-9',
    section_id: 'sec-sirah-2024-A',
    question_text: 'Siapakah Khulafa Ar-Rasyidin yang kedua yang terkenal dengan ketegasan membela keadilan dan gelaran Al-Farooq?',
    explanation: 'Saidina Umar bin Al-Khattab RA merupakan Khalifah Ar-Rasyidin kedua yang memerintah selepas kewafatan Saidina Abu Bakar RA.',
    order: 9,
    choices: [
      { id: 'c-s24a-9-1', question_id: 'q-s24a-9', option_text: 'Saidina Umar bin Al-Khattab RA', is_correct: true },
      { id: 'c-s24a-9-2', question_id: 'q-s24a-9', option_text: 'Saidina Abu Bakar As-Siddiq RA', is_correct: false },
      { id: 'c-s24a-9-3', question_id: 'q-s24a-9', option_text: 'Saidina Uthman bin Affan RA', is_correct: false },
      { id: 'c-s24a-9-4', question_id: 'q-s24a-9', option_text: 'Saidina Ali bin Abi Talib RA', is_correct: false },
    ],
  },
  {
    id: 'q-s24a-10',
    section_id: 'sec-sirah-2024-A',
    question_text: 'Apakah dokumen perlembagaan bertulis pertama di dunia yang digubal oleh Rasulullah SAW untuk menyatukan penduduk Madinah?',
    explanation: 'Piagam Madinah (Sahifah Madinah) ialah perlembagaan tertulis pertama di dunia yang menjamin hak umat Islam dan kaum Yahudi.',
    order: 10,
    choices: [
      { id: 'c-s24a-10-1', question_id: 'q-s24a-10', option_text: 'Piagam Madinah (Sahifah Madinah)', is_correct: true },
      { id: 'c-s24a-10-2', question_id: 'q-s24a-10', option_text: 'Perjanjian Aqabah Pertama', is_correct: false },
      { id: 'c-s24a-10-3', question_id: 'q-s24a-10', option_text: 'Perjanjian Hudaibiyah', is_correct: false },
      { id: 'c-s24a-10-4', question_id: 'q-s24a-10', option_text: 'Khutbah Wada\'', is_correct: false },
    ],
  },

  // --- SIRAH 2024 Bahagian B (Set 1) - Betul / Salah ---
  {
    id: 'q-s24b1-1',
    section_id: 'sec-sirah-2024-B1',
    question_text: 'Peristiwa Hijrah berlaku semata-mata kerana umat Islam melarikan diri dan takut menghadapi musyrikin Makkah.',
    explanation: 'SALAH. Hijrah dilakukan atas perintah Allah SWT untuk menyebarkan Islam dan membina peradaban Islam di Madinah, bukan kerana sifat penakut.',
    order: 1,
    choices: [
      { id: 'c-s24b1-1-1', question_id: 'q-s24b1-1', option_text: 'SALAH', is_correct: true },
      { id: 'c-s24b1-1-2', question_id: 'q-s24b1-1', option_text: 'BETUL', is_correct: false },
    ],
  },
  {
    id: 'q-s24b1-2',
    section_id: 'sec-sirah-2024-B1',
    question_text: 'Kaum Muhajirin ialah penduduk tempatan Madinah yang menyambut kedatangan Rasulullah SAW dan memberi bantuan.',
    explanation: 'SALAH. Penduduk Madinah dipanggil kaum Ansar (Penolong), manakala kaum Muhajirin ialah umat Islam yang berhijrah dari Makkah.',
    order: 2,
    choices: [
      { id: 'c-s24b1-2-1', question_id: 'q-s24b1-2', option_text: 'SALAH', is_correct: true },
      { id: 'c-s24b1-2-2', question_id: 'q-s24b1-2', option_text: 'BETUL', is_correct: false },
    ],
  },
  {
    id: 'q-s24b1-3',
    section_id: 'sec-sirah-2024-B1',
    question_text: 'Tindakan pertama Rasulullah SAW apabila tiba di Madinah ialah mempersaudarakan antara kaum Muhajirin dan kaum Ansar.',
    explanation: 'BETUL. Persaudaraan atas dasar akidah Islam ini mengukuhkan perpaduan dan ekonomi masyarakat Islam di Madinah.',
    order: 3,
    choices: [
      { id: 'c-s24b1-3-1', question_id: 'q-s24b1-3', option_text: 'BETUL', is_correct: true },
      { id: 'c-s24b1-3-2', question_id: 'q-s24b1-3', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-s24b1-4',
    section_id: 'sec-sirah-2024-B1',
    question_text: 'Peristiwa Fathu Makkah (Pembukaan Kota Makkah) berlaku tanpa tumpahan darah yang besar kerana sifat pemaaf Rasulullah SAW.',
    explanation: 'BETUL. Rasulullah SAW mengisytiharkan kemaafan umum kepada penduduk Makkah sehingga ramai yang memeluk Islam secara sukarela.',
    order: 4,
    choices: [
      { id: 'c-s24b1-4-1', question_id: 'q-s24b1-4', option_text: 'BETUL', is_correct: true },
      { id: 'c-s24b1-4-2', question_id: 'q-s24b1-4', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-s24b1-5',
    section_id: 'sec-sirah-2024-B1',
    question_text: 'Perjanjian Hudaibiyah memberikan gencatan senjata dan keamanan selama 10 tahun antara umat Islam dan kafir Quraysh.',
    explanation: 'BETUL. Syarat gencatan senjata 10 tahun ini membolehkan dakwah Islam berkembang pesat ke seluruh Semenanjung Tanah Arab.',
    order: 5,
    choices: [
      { id: 'c-s24b1-5-1', question_id: 'q-s24b1-5', option_text: 'BETUL', is_correct: true },
      { id: 'c-s24b1-5-2', question_id: 'q-s24b1-5', option_text: 'SALAH', is_correct: false },
    ],
  },

  // --- SIRAH 2024 Bahagian B (Set 2) - Betul / Salah ---
  {
    id: 'q-s24b2-1',
    section_id: 'sec-sirah-2024-B2',
    question_text: 'Saidina Uthman bin Affan RA digelar Zun-Nurain kerana berkahwin dengan dua orang puteri Rasulullah SAW.',
    explanation: 'BETUL. Gelaran Zun-Nurain bermaksud \'Pemilik Dua Cahaya\' kerana berkahwin dengan Sayyidatuna Ruqayyah dan selepas kewafatannya, Sayyidatuna Umm Kulthum.',
    order: 1,
    choices: [
      { id: 'c-s24b2-1-1', question_id: 'q-s24b2-1', option_text: 'BETUL', is_correct: true },
      { id: 'c-s24b2-1-2', question_id: 'q-s24b2-1', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-s24b2-2',
    section_id: 'sec-sirah-2024-B2',
    question_text: 'Pengumpulan dan pembukuan Al-Quran secara rasmi dalam Mushaf Uthmani dilakukan semasa pemerintahan Saidina Abu Bakar As-Siddiq RA.',
    explanation: 'SALAH. Pembukuan rasmi dan penyatuan penulisan Mushaf (Mushaf Uthmani) dijalankan semasa pemerintahan Khalifah Uthman bin Affan RA.',
    order: 2,
    choices: [
      { id: 'c-s24b2-2-1', question_id: 'q-s24b2-2', option_text: 'SALAH', is_correct: true },
      { id: 'c-s24b2-2-2', question_id: 'q-s24b2-2', option_text: 'BETUL', is_correct: false },
    ],
  },
  {
    id: 'q-s24b2-3',
    section_id: 'sec-sirah-2024-B2',
    question_text: 'Saidina Ali bin Abi Talib RA merupakan kanak-kanak pertama yang memeluk agama Islam.',
    explanation: 'BETUL. Saidina Ali RA memeluk Islam ketika berumur 10 tahun di bawah jagaan dan asuhan Rasulullah SAW.',
    order: 3,
    choices: [
      { id: 'c-s24b2-3-1', question_id: 'q-s24b2-3', option_text: 'BETUL', is_correct: true },
      { id: 'c-s24b2-3-2', question_id: 'q-s24b2-3', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-s24b2-4',
    section_id: 'sec-sirah-2024-B2',
    question_text: 'Dakwah secara bersembunyi di Makkah dijalankan selama 3 tahun di rumah Arqam bin Abi Al-Arqam.',
    explanation: 'BETUL. Rumah Arqam bin Abi Al-Arqam menjadi pusat perjumpaan dan pembinaan akidah terawal umat Islam.',
    order: 4,
    choices: [
      { id: 'c-s24b2-4-1', question_id: 'q-s24b2-4', option_text: 'BETUL', is_correct: true },
      { id: 'c-s24b2-4-2', question_id: 'q-s24b2-4', option_text: 'SALAH', is_correct: false },
    ],
  },
  {
    id: 'q-s24b2-5',
    section_id: 'sec-sirah-2024-B2',
    question_text: 'Perang Khandaq dikenali sebagai Perang Ahzab kerana gabungan pelbagai suku musyrikin dan Yahudi mengepung Madinah.',
    explanation: 'BETUL. Tentera gabungan (Ahzab) digagalkan oleh strategi parit (Khandaq) yang dicadangkan oleh Salman Al-Farisi RA.',
    order: 5,
    choices: [
      { id: 'c-s24b2-5-1', question_id: 'q-s24b2-5', option_text: 'BETUL', is_correct: true },
      { id: 'c-s24b2-5-2', question_id: 'q-s24b2-5', option_text: 'SALAH', is_correct: false },
    ],
  },

  // --- SIRAH 2024 Bahagian C (Set 1) - Subjektif / Pilihan Berstruktur ---
  {
    id: 'q-s24c1-1',
    section_id: 'sec-sirah-2024-C1',
    question_text: 'Apakah faktor utama yang mendorong musyrikin Makkah menentang dakwah Rasulullah SAW pada peringkat awal?',
    explanation: 'Faktor penentangan utama ialah bimbang kehilangan kuasa kepimpinan, gangguan perniagaan patung berhala, dan taasub kepada adat nenek moyang.',
    order: 1,
    choices: [
      { id: 'c-s24c1-1-1', question_id: 'q-s24c1-1', option_text: 'Takut hilang pengaruh, amalan patung berhala & ketaasuban tradisi jahiliyah', is_correct: true },
      { id: 'c-s24c1-1-2', question_id: 'q-s24c1-1', option_text: 'Kerana Rasulullah SAW menuntut pembayaran cukai yang tinggi', is_correct: false },
      { id: 'c-s24c1-1-3', question_id: 'q-s24c1-1', option_text: 'Kerana penduduk Makkah mahu berhijrah ke negara Rom', is_correct: false },
      { id: 'c-s24c1-1-4', question_id: 'q-s24c1-1', option_text: 'Kerana pertukaran mata wang di Kota Makkah', is_correct: false },
    ],
  },
  {
    id: 'q-s24c1-2',
    section_id: 'sec-sirah-2024-C1',
    question_text: 'Apakah strategi berkesan yang dicadangkan oleh Salman Al-Farisi RA dalam Perang Khandaq untuk mempertahankan Madinah?',
    explanation: 'Salman Al-Farisi RA mencadangkan menggali parit besar di sekeliling sempadan Madinah yang terdedah kepada serangan musuh.',
    order: 2,
    choices: [
      { id: 'c-s24c1-2-1', question_id: 'q-s24c1-2', option_text: 'Menggali parit di sekeliling kawasan utara kota Madinah', is_correct: true },
      { id: 'c-s24c1-2-2', question_id: 'q-s24c1-2', option_text: 'Membina kubu bertingkat daripada batu di atas gunung', is_correct: false },
      { id: 'c-s24c1-2-3', question_id: 'q-s24c1-2', option_text: 'Menyerang hendap musuh di padang pasir pada waktu malam', is_correct: false },
      { id: 'c-s24c1-2-4', question_id: 'q-s24c1-2', option_text: 'Melancarkan serangan kapal laut di pantai Red Sea', is_correct: false },
    ],
  },
  {
    id: 'q-s24c1-3',
    section_id: 'sec-sirah-2024-C1',
    question_text: 'Apakah peristiwa penting di mana umat Islam berikrar di bawah pokok untuk menuntut keadilan bagi Saidina Uthman RA sebelum Hudaibiyah?',
    explanation: 'Ikrar tersebut dinamakan Bai\'atur Ridwan (Bai\'ah Ridwan) yang diredhai Allah SWT.',
    order: 3,
    choices: [
      { id: 'c-s24c1-3-1', question_id: 'q-s24c1-3', option_text: 'Bai\'atur Ridwan (Bai\'ah Ridwan)', is_correct: true },
      { id: 'c-s24c1-3-2', question_id: 'q-s24c1-3', option_text: 'Bai\'ah Aqabah Kedua', is_correct: false },
      { id: 'c-s24c1-3-3', question_id: 'q-s24c1-3', option_text: 'Perjanjian Taif', is_correct: false },
      { id: 'c-s24c1-3-4', question_id: 'q-s24c1-3', option_text: 'Sumpah Hilf Al-Fudul', is_correct: false },
    ],
  },
  {
    id: 'q-s24c1-4',
    section_id: 'sec-sirah-2024-C1',
    question_text: 'Manakah antara berikut MERUPAKAN iktibar daripada keperibadian Rasulullah SAW semasa pembukaan Kota Makkah (Fathu Makkah)?',
    explanation: 'Sifat pemaaf, merendah diri dan tidak berniat balas dendam menjadi teladan tertinggi kepimpinan Islam.',
    order: 4,
    choices: [
      { id: 'c-s24c1-4-1', question_id: 'q-s24c1-4', option_text: 'Sifat pemaaf, tawaduk dan menjauhi sifat dendam', is_correct: true },
      { id: 'c-s24c1-4-2', question_id: 'q-s24c1-4', option_text: 'Mengenakan hukuman berat kepada semua bekas musuh', is_correct: false },
      { id: 'c-s24c1-4-3', question_id: 'q-s24c1-4', option_text: 'Merobohkan semua rumah di Kota Makkah', is_correct: false },
      { id: 'c-s24c1-4-4', question_id: 'q-s24c1-4', option_text: 'Memindahkan ibu kota Islam dari Madinah ke Makkah', is_correct: false },
    ],
  },
  {
    id: 'q-s24c1-5',
    section_id: 'sec-sirah-2024-C1',
    question_text: 'Apakah sumbangan terbesar Saidina Abu Bakar As-Siddiq RA semasa menjadi Khalifah pertama?',
    explanation: 'Saidina Abu Bakar RA memerangi golongan murtad/enggan bayar zakat dan memulakan pengumpulan ayat Al-Quran.',
    order: 5,
    choices: [
      { id: 'c-s24c1-5-1', question_id: 'q-s24c1-5', option_text: 'Memerangi golongan murtad & mengumpul naskhah Al-Quran awal', is_correct: true },
      { id: 'c-s24c1-5-2', question_id: 'q-s24c1-5', option_text: 'Menubuhkan polis dan sistem pentadbiran tanah', is_correct: false },
      { id: 'c-s24c1-5-3', question_id: 'q-s24c1-5', option_text: 'Membina armada tentera laut pertama Islam', is_correct: false },
      { id: 'c-s24c1-5-4', question_id: 'q-s24c1-5', option_text: 'Menjadikan Kufah sebagai ibu kota Islam', is_correct: false },
    ],
  },

  // --- SIRAH 2024 Bahagian C (Set 2) - Subjektif / Pilihan Berstruktur ---
  {
    id: 'q-s24c2-1',
    section_id: 'sec-sirah-2024-C2',
    question_text: 'Siapakah wanita pertama yang syahid dalam sejarah Islam mempertahankan akidah daripada seksaan musyrikin Makkah?',
    explanation: 'Sumayyah binti Khayyat (ibu kepada Ammar bin Yasir) ialah wanita pertama yang syahid kerana mempertahankan tauhid.',
    order: 1,
    choices: [
      { id: 'c-s24c2-1-1', question_id: 'q-s24c2-1', option_text: 'Sumayyah binti Khayyat', is_correct: true },
      { id: 'c-s24c2-1-2', question_id: 'q-s24c2-1', option_text: 'Khadijah binti Khuwailid', is_correct: false },
      { id: 'c-s24c2-1-3', question_id: 'q-s24c2-1', option_text: 'Asma\' binti Abu Bakar', is_correct: false },
      { id: 'c-s24c2-1-4', question_id: 'q-s24c2-1', option_text: 'Fatimah binti Muhammad', is_correct: false },
    ],
  },
  {
    id: 'q-s24c2-2',
    section_id: 'sec-sirah-2024-C2',
    question_text: 'Apakah peristiwa berharga di mana Rasulullah SAW diperjalankan dari Masjidil Haram ke Masjidil Aqsa lalu diangkat ke Sidratul Muntaha?',
    explanation: 'Peristiwa Israk dan Mikraj berlaku pada tahun ke-10 kenabian dan murni dikurniakan kewajipan solat 5 waktu.',
    order: 2,
    choices: [
      { id: 'c-s24c2-2-1', question_id: 'q-s24c2-2', option_text: 'Israk dan Mikraj', is_correct: true },
      { id: 'c-s24c2-2-2', question_id: 'q-s24c2-2', option_text: 'Hijrah ke Habeza', is_correct: false },
      { id: 'c-s24c2-2-3', question_id: 'q-s24c2-2', option_text: 'Khutbah Wada\'', is_correct: false },
      { id: 'c-s24c2-2-4', question_id: 'q-s24c2-2', option_text: 'Perjalanan ke Taif', is_correct: false },
    ],
  },
  {
    id: 'q-s24c2-3',
    section_id: 'sec-sirah-2024-C2',
    question_text: 'Apakah pengajaran utama daripada peristiwa Hijrah Pertama umat Islam ke Habsyah (Abyssinia)?',
    explanation: 'Raja Habsyah (Raja Najasyi) seorang yang adil dan bertoleransi serta melindungi umat Islam yang ditindas.',
    order: 3,
    choices: [
      { id: 'c-s24c2-3-1', question_id: 'q-s24c2-3', option_text: 'Mencari tempat perlindungan yang selamat & berwibawa demi menyelamatkan akidah', is_correct: true },
      { id: 'c-s24c2-3-2', question_id: 'q-s24c2-3', option_text: 'Meninggalkan terus Kota Makkah tanpa niat kembali', is_correct: false },
      { id: 'c-s24c2-3-3', question_id: 'q-s24c2-3', option_text: 'Memulakan perniagaan patung di negara asing', is_correct: false },
      { id: 'c-s24c2-3-4', question_id: 'q-s24c2-3', option_text: 'Membeli senjata perang daripada Raja Najasyi', is_correct: false },
    ],
  },
  {
    id: 'q-s24c2-4',
    section_id: 'sec-sirah-2024-C2',
    question_text: 'Apakah pesanan penting Rasulullah SAW dalam Khutbah Wada\' (Khutbah Perpisahan) sebelum Baginda wafat?',
    explanation: 'Rasulullah SAW berpesan berpegang teguh kepada Al-Quran dan Sunnah, serta mengharamkan riba dan amalan kejam jahiliyah.',
    order: 4,
    choices: [
      { id: 'c-s24c2-4-1', question_id: 'q-s24c2-4', option_text: 'Berpegang teguh kepada Al-Quran dan Sunnah serta menjaga hak wanita', is_correct: true },
      { id: 'c-s24c2-4-2', question_id: 'q-s24c2-4', option_text: 'Memperluas wilayah tanpa batasan undang-undang', is_correct: false },
      { id: 'c-s24c2-4-3', question_id: 'q-s24c2-4', option_text: 'Mewajibkan penterjemahan kitab ke dalam bahasa Parsi', is_correct: false },
      { id: 'c-s24c2-4-4', question_id: 'q-s24c2-4', option_text: 'Menghapuskan kuota zakat harta', is_correct: false },
    ],
  },
  {
    id: 'q-s24c2-5',
    section_id: 'sec-sirah-2024-C2',
    question_text: 'Apakah sumbangan besar Khulafa Ar-Rasyidin ketiga, Saidina Uthman bin Affan RA dalam bidang kewangan dan kebajikan?',
    explanation: 'Saidina Uthman RA terkenal dengan kedermawanannya membekalkan kelengkapan perang Tabuk dan membeli Perigi Ruma untuk umat Islam.',
    order: 5,
    choices: [
      { id: 'c-s24c2-5-1', question_id: 'q-s24c2-5', option_text: 'Membeli perigi Ruma & mendermakan harta harta untuk tentera Islam', is_correct: true },
      { id: 'c-s24c2-5-2', question_id: 'q-s24c2-5', option_text: 'Membina empangan terbesar di Kota Makkah', is_correct: false },
      { id: 'c-s24c2-5-3', question_id: 'q-s24c2-5', option_text: 'Menukar mata wang dirham kepada emas murni', is_correct: false },
      { id: 'c-s24c2-5-4', question_id: 'q-s24c2-5', option_text: 'Mewajibkan cukai tambahan bagi golongan kaya', is_correct: false },
    ],
  },
];

export const DEFAULT_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'm-1',
    title: 'Selesaikan 1 Bahagian Soalan',
    reward_coins: 50,
    is_completed: false,
    target: 1,
    current: 0,
  },
  {
    id: 'm-2',
    title: 'Jawab 5 Soalan Fekah Dengan Betul',
    reward_coins: 50,
    is_completed: false,
    target: 5,
    current: 0,
  },
  {
    id: 'm-3',
    title: 'Dapatkan Skor 100% Dalam Mana-mana Bahagian',
    reward_coins: 100,
    is_completed: false,
    target: 1,
    current: 0,
  },
];

export const SUPABASE_SQL_SETUP_DDL = `-- ==========================================
-- SPPIM QUEST - FULL SUPABASE POSTGRES SCHEMA
-- Copy and paste this script directly into Supabase SQL Editor
-- ==========================================

-- 1. Create Public Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  login_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  coin INTEGER DEFAULT 100,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  status TEXT DEFAULT 'active'
);

-- 3. Create Papers Table
CREATE TABLE IF NOT EXISTS public.papers (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active'
);

-- 4. Create Sections Table
CREATE TABLE IF NOT EXISTS public.sections (
  id TEXT PRIMARY KEY,
  paper_id TEXT REFERENCES public.papers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  order_num INTEGER DEFAULT 1
);

-- 5. Create Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  explanation TEXT,
  order_num INTEGER DEFAULT 1,
  difficulty TEXT DEFAULT 'sederhana'
);

-- 6. Create Choices Table
CREATE TABLE IF NOT EXISTS public.choices (
  id TEXT PRIMARY KEY,
  question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

-- 7. Create Progress Table
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE,
  best_score INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  total_questions INTEGER DEFAULT 0,
  UNIQUE(user_id, section_id)
);

-- 8. Create Attempts Table
CREATE TABLE IF NOT EXISTS public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_question INTEGER NOT NULL,
  coins_earned INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8b. Battle Rooms Table (real cross-device 1v1 sync)
CREATE TABLE IF NOT EXISTS public.battle_rooms (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  guest_id TEXT,
  guest_name TEXT,
  status TEXT DEFAULT 'waiting',
  question_ids TEXT[] DEFAULT '{}',
  host_score INTEGER DEFAULT 0,
  guest_score INTEGER DEFAULT 0,
  host_finished BOOLEAN DEFAULT false,
  guest_finished BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Trigger for Auto Creating Profile on Auth Sign-Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, login_id, phone, coin, xp, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Pelajar SPPIM'),
    COALESCE(NEW.raw_user_meta_data->>'login_id', 'STUDENT_' || SUBSTRING(NEW.id::text, 1, 6)),
    NEW.raw_user_meta_data->>'phone',
    100,
    0,
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users: Read/Update own profile, or read all for leaderboard
CREATE POLICY "Users can view own and public stats" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Exam Data: Readable by anyone authenticated or anonymous
CREATE POLICY "Allow public read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read papers" ON public.papers FOR SELECT USING (true);
CREATE POLICY "Allow public read sections" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Allow public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public read choices" ON public.choices FOR SELECT USING (true);

-- Progress & Attempts: Users manage their own
CREATE POLICY "Users can manage own progress" ON public.progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own attempts" ON public.attempts FOR ALL USING (auth.uid() = user_id);

-- Battle rooms are public read/write by design: they're short-lived, low-stakes,
-- and this app's accounts aren't reliably backed by real Supabase Auth sessions
-- (see the local-first hybrid model used throughout), so auth.uid() gating isn't
-- usable here the way it is for progress/attempts above.
CREATE POLICY "Public can read battle rooms" ON public.battle_rooms FOR SELECT USING (true);
CREATE POLICY "Public can create battle rooms" ON public.battle_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update battle rooms" ON public.battle_rooms FOR UPDATE USING (true);
`;
