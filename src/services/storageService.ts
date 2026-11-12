import {
  LembagaProfile,
  AppSettings,
  TahunPelajaran,
  Ustadz,
  Kelas,
  Santri,
  MetodePembelajaran,
  KomponenPenilaian,
  PredikatRule,
  NilaiSantri,
  CatatanRapor,
  EvaluasiKenaikanJilid,
  RiwayatKenaikanKelas,
  PiagamJuara,
  InternalChat,
  UserSession
} from '../types';

const STORAGE_KEYS = {
  LEMBAGA: 'tpq_lembaga_profile',
  SETTINGS: 'tpq_app_settings',
  TAHUN: 'tpq_tahun_pelajaran',
  USTADZ: 'tpq_ustadz',
  KELAS: 'tpq_kelas',
  SANTRI: 'tpq_santri',
  METODE: 'tpq_metode',
  KOMPONEN: 'tpq_komponen',
  PREDIKAT: 'tpq_predikat',
  NILAI: 'tpq_nilai',
  CATATAN_RAPOR: 'tpq_catatan_rapor',
  KENAIKAN_JILID: 'tpq_kenaikan_jilid',
  KENAIKAN_KELAS: 'tpq_kenaikan_kelas',
  PIAGAM: 'tpq_piagam',
  CHAT: 'tpq_internal_chat',
  USER_SESSION: 'tpq_user_session',
  USERS: 'tpq_all_users'
};

export const defaultLembagaProfile: LembagaProfile = {
  nama: 'TPQ Al-Adzkiyaa’',
  yayasan: 'Yayasan Pendidikan Al Ma’arif Miftahul Huda Singosari',
  nstpq: '411235079034',
  nspq: '411235079034',
  telepon: '0856-0606-4478',
  website: 'https://tpqladzkiyaa.my.id',
  alamat: 'Jl. Patih Gg.I RT.02/RW.02 Dusun Ngujung Toyomarto SIngosari Malang',
  kelurahan: 'Toyomarto',
  kecamatan: 'Singosari',
  kota: 'Kabupaten Malang',
  provinsi: 'Jawa Timur',
  kepalaTpq: 'Ust. Moh. Umar Jaelani, S.Pd.I,.Gr.',
  nipKepala: '',
  jabatanPenandatangan: 'Kepala TPQ',
  kotaPenerbitan: 'Malang',
  logoUrl: '/assets/aistudio/LOGO_TPQ_AL_ADZKIYAA__3D_a517a7be.png',
  stempelUrl: '',
  ttdKepalaUrl: '',
  footnote: 'Copyright © Umar Izzularab 2026 All Rights Reserved'
};

export const defaultAppSettings: AppSettings = {
  appName: 'RAPOR TPQ AL-ADZKIYAA’',
  themeColor: 'emerald',
  paperSize: 'A4',
  orientation: 'portrait',
  footerText: 'Copyright © Umar Izzularab 2026 All Rights Reserved',
  minPassingScore: 70,
  tempatCetakRapor: 'Malang',
  tanggalCetakRaporGanjil: '2025-12-20',
  tanggalCetakRaporGenap: '2026-06-20',
  customTanggalCetak: ''
};

export const defaultTahunList: TahunPelajaran[] = [
  {
    id: 'tp-2025-2026',
    tahun: '2025/2026',
    semesterAktif: 'Ganjil',
    isAktif: true,
    isLocked: false,
    tanggalRaporGanjil: '2025-12-20',
    tanggalRaporGenap: '2026-06-20'
  },
  {
    id: 'tp-2024-2025',
    tahun: '2024/2025',
    semesterAktif: 'Genap',
    isAktif: false,
    isLocked: true,
    tanggalRaporGanjil: '2024-12-21',
    tanggalRaporGenap: '2025-06-21'
  }
];

export const defaultUstadzList: Ustadz[] = [
  {
    id: 'ust-1',
    nip: '19890412201501',
    nama: 'Ust. Moh. Umar Jaelani, S.Pd.I,.Gr.',
    foto: '',
    jk: 'L',
    tempatLahir: 'Malang',
    tanggalLahir: '1989-04-12',
    alamat: 'Dusun Ngujung Toyomarto, Singosari',
    noHp: '0856-0606-4478',
    pendidikan: 'S1 Pendidikan Agama Islam',
    status: 'aktif',
    username: 'kepala',
    password: 'password123',
    role: 'kepala',
    halaqohIds: ['k-1']
  },
  {
    id: 'ust-2',
    nip: '19920815201802',
    nama: 'Ust. Ahmad Fauzi, S.Pd.',
    foto: '',
    jk: 'L',
    tempatLahir: 'Malang',
    tanggalLahir: '1992-08-15',
    alamat: 'Candirenggo, Singosari',
    noHp: '0812-3344-5566',
    pendidikan: 'S1 Bahasa Arab',
    status: 'aktif',
    username: 'ustadz1',
    password: 'password123',
    role: 'ustadz',
    halaqohIds: ['k-1', 'k-2']
  },
  {
    id: 'ust-3',
    nip: '19950320202003',
    nama: 'Ustadzah Siti Aminah, S.Ag.',
    foto: '',
    jk: 'P',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '1995-03-20',
    alamat: 'Toyomarto RT 03, Singosari',
    noHp: '0813-7788-9900',
    pendidikan: 'S1 Ilmu Al-Qur\'an dan Tafsir',
    status: 'aktif',
    username: 'ustadzah1',
    password: 'password123',
    role: 'ustadz',
    halaqohIds: ['k-3']
  }
];

export const defaultKelasList: Kelas[] = [
  {
    id: 'k-1',
    namaKelas: 'Halaqoh Bilqolam Dasar (Abu Bakar)',
    tingkatan: 'Pemula',
    ustadzId: 'ust-2',
    urutan: 1,
    kapasitas: 25,
    keterangan: 'Tingkat dasar pengenalan huruf hijaiyah dan mahroj'
  },
  {
    id: 'k-2',
    namaKelas: 'Halaqoh Juz \'Amma (Umar bin Khattab)',
    tingkatan: 'Menengah',
    ustadzId: 'ust-2',
    urutan: 2,
    kapasitas: 25,
    keterangan: 'Fokus tahfidz juz 30 dan tajwid praktis'
  },
  {
    id: 'k-3',
    namaKelas: 'Halaqoh Al-Qur\'an & Tartil (Utsman bin Affan)',
    tingkatan: 'Lanjutan',
    ustadzId: 'ust-3',
    urutan: 3,
    kapasitas: 20,
    keterangan: 'Tadarus Al-Qur\'an bin-nadzor dan naghom tartil'
  }
];

export const defaultMetodeList: MetodePembelajaran[] = [
  {
    id: 'm-bilqolam',
    nama: 'Metode Bilqolam',
    deskripsi: 'Metode cepat dan tepat membaca Al-Qur\'an dengan kaidah bilqolam yang terstruktur',
    jilidList: [
      { id: 'j-bq-1', nama: 'Bilqolam Jilid 1', urutan: 1, target: 'Mengenal huruf tunggal berharokat fathah', syaratLulus: 'Lancar membaca tanpa dieja' },
      { id: 'j-bq-2', nama: 'Bilqolam Jilid 2', urutan: 2, target: 'Mengenal huruf sambung dan harokat kasroh & dhommah', syaratLulus: 'Membedakan panjang 1 harokat' },
      { id: 'j-bq-3', nama: 'Bilqolam Jilid 3', urutan: 3, target: 'Mad thobi\'i (panjang 2 harokat) dan tanwin', syaratLulus: 'Mampu membedakan mad dan tanwin' },
      { id: 'j-bq-4', nama: 'Bilqolam Jilid 4', urutan: 4, target: 'Sukun, tasydid, dan qolqolah', syaratLulus: 'Membaca mantap tanpa memantulkan selain qolqolah' },
      { id: 'j-bq-5', nama: 'Bilqolam Jilid 5', urutan: 5, target: 'Hukum nun sukun, tanwin & mim sukun (Idghom, Ikhfa, Izhhar)', syaratLulus: 'Menerapkan dengung (ghunnah) dengan tepat' },
      { id: 'j-bq-6', nama: 'Bilqolam Jilid 6 / Ghorib', urutan: 6, target: 'Buku ghorib, waqof wal ibtida, dan mad lazim', syaratLulus: 'Siap masuk jenjang tadarus Al-Qur\'an 30 Juz' }
    ]
  },
  {
    id: 'm-juz-amma',
    nama: 'Tahfidz Juz \'Amma',
    deskripsi: 'Program hafalan surat-surat pendek dalam Juz 30',
    jilidList: [
      { id: 'j-ja-1', nama: 'Tahfidz Level 1 (An-Naas s/d Al-Humazah)', urutan: 1, target: 'Hafal lancar 10 surat terakhir', syaratLulus: 'Setoran mutqin tanpa salah lebih dari 3 kali' },
      { id: 'j-ja-2', nama: 'Tahfidz Level 2 (Al-Ashr s/d Adh-Dhuha)', urutan: 2, target: 'Hafal surat pertengahan juz 30', syaratLulus: 'Tartil dan fashih' },
      { id: 'j-ja-3', nama: 'Tahfidz Level 3 (Al-Lail s/d An-Naba\')', urutan: 3, target: 'Tuntas juz 30 (Surat An-Naba)', syaratLulus: 'Ujian komprehensif juz 30' }
    ]
  },
  {
    id: 'm-alquran',
    nama: 'Al-Qur\'an 30 Juz',
    deskripsi: 'Tadarus Al-Qur\'an tartil dan binnadzor dengan tajwid lengkap',
    jilidList: [
      { id: 'j-q-1', nama: 'Tadarus Juz 1 - 10', urutan: 1, target: 'Kelancaran bacaan dan makharijul huruf', syaratLulus: 'Rata-rata tilawah harian tuntas' },
      { id: 'j-q-2', nama: 'Tadarus Juz 11 - 20', urutan: 2, target: 'Kaidah waqof dan fashohah', syaratLulus: 'Tartil berkaidah' },
      { id: 'j-q-3', nama: 'Tadarus Juz 21 - 30 (Khotam)', urutan: 3, target: 'Khatam 30 Juz Al-Qur\'an', syaratLulus: 'Siap munaqosyah kelulusan TPQ' }
    ]
  }
];

export const defaultKomponenList: KomponenPenilaian[] = [
  { id: 'kp-1', nama: 'Kelancaran Membaca', bobot: 20, urutan: 1, kategori: 'Al-Qur\'an & Tajwid', isAktif: true, showInRapor: true, deskripsiDefault: 'Kemampuan membaca tanpa terbata-bata' },
  { id: 'kp-2', nama: 'Tajwid & Makhorijul Huruf', bobot: 20, urutan: 2, kategori: 'Al-Qur\'an & Tajwid', isAktif: true, showInRapor: true, deskripsiDefault: 'Ketepatan bunyi huruf dan hukum bacaan' },
  { id: 'kp-3', nama: 'Fashohah & Irama (Tartil)', bobot: 15, urutan: 3, kategori: 'Al-Qur\'an & Tajwid', isAktif: true, showInRapor: true, deskripsiDefault: 'Keindahan nada dan kerapian waqof' },
  { id: 'kp-4', nama: 'Hafalan Surat Pendek', bobot: 15, urutan: 4, kategori: 'Hafalan', isAktif: true, showInRapor: true, deskripsiDefault: 'Kuantitas dan kelancaran surat' },
  { id: 'kp-5', nama: 'Praktik Ibadah & Doa Harian', bobot: 15, urutan: 5, kategori: 'Praktik Ibadah', isAktif: true, showInRapor: true, deskripsiDefault: 'Gerakan dan bacaan sholat serta hafalan doa' },
  { id: 'kp-6', nama: 'Adab, Akhlak & Kedisiplinan', bobot: 15, urutan: 6, kategori: 'Akhlak & Adab', isAktif: true, showInRapor: true, deskripsiDefault: 'Sopan santun kepada ustadz, teman, dan kebersihan' }
];

export const defaultPredikatList: PredikatRule[] = [
  { id: 'pr-1', predikat: 'A', label: 'Sangat Baik (Mumtaz)', minScore: 86, maxScore: 100, keterangan: 'Sangat memuaskan, menguasai seluruh kompetensi dengan tartil dan adab terpuji' },
  { id: 'pr-2', predikat: 'B', label: 'Baik (Jayyid Jiddan)', minScore: 76, maxScore: 85, keterangan: 'Baik, menguasai materi dengan kelancaran memadai dan disiplin baik' },
  { id: 'pr-3', predikat: 'C', label: 'Cukup (Jayyid)', minScore: 65, maxScore: 75, keterangan: 'Cukup, telah mencapai kriteria ketuntasan minimal namun perlu latihan tambahan' },
  { id: 'pr-4', predikat: 'D', label: 'Perlu Bimbingan (Maqbul)', minScore: 0, maxScore: 64, keterangan: 'Perlu bimbingan intensif dan pendampingan orang tua di rumah' }
];

export const defaultSantriList: Santri[] = [
  {
    id: 's-1',
    nis: '2025001',
    namaLengkap: 'Muhammad Rayhan Pratama',
    namaPanggilan: 'Rayhan',
    jk: 'L',
    tempatLahir: 'Malang',
    tanggalLahir: '2017-06-12',
    alamat: 'Dusun Ngujung RT 02 / RW 02 Toyomarto, Singosari',
    namaAyah: 'Budi Santoso',
    namaIbu: 'Siti Rohmah',
    noHpOrtu: '0812-3456-7801',
    tanggalMasuk: '2023-07-15',
    foto: '',
    kelasId: 'k-1',
    metodeId: 'm-bilqolam',
    jilidId: 'j-bq-3',
    status: 'aktif',
    username: 'santri1',
    password: 'password123'
  },
  {
    id: 's-2',
    nis: '2025002',
    namaLengkap: 'Aisyah Nur Kamila',
    namaPanggilan: 'Kamila',
    jk: 'P',
    tempatLahir: 'Malang',
    tanggalLahir: '2016-11-04',
    alamat: 'Jl. Patih RT 01 / RW 02 Toyomarto, Singosari',
    namaAyah: 'Ahmad Fauzi',
    namaIbu: 'Nur Laili',
    noHpOrtu: '0813-9876-5402',
    tanggalMasuk: '2023-07-15',
    foto: '',
    kelasId: 'k-2',
    metodeId: 'm-juz-amma',
    jilidId: 'j-ja-2',
    status: 'aktif',
    username: 'santri2',
    password: 'password123'
  },
  {
    id: 's-3',
    nis: '2025003',
    namaLengkap: 'Fathan Al-Ghifari',
    namaPanggilan: 'Fathan',
    jk: 'L',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2015-08-20',
    alamat: 'Perumahan Singosari Permai Blok C4',
    namaAyah: 'Rahmat Hidayat',
    namaIbu: 'Dewi Sartika',
    noHpOrtu: '0857-1122-3303',
    tanggalMasuk: '2022-07-10',
    foto: '',
    kelasId: 'k-3',
    metodeId: 'm-alquran',
    jilidId: 'j-q-2',
    status: 'aktif',
    username: 'santri3',
    password: 'password123'
  },
  {
    id: 's-4',
    nis: '2025004',
    namaLengkap: 'Zahra Bilqis Maulida',
    namaPanggilan: 'Zahra',
    jk: 'P',
    tempatLahir: 'Malang',
    tanggalLahir: '2017-02-18',
    alamat: 'Dusun Ngujung Toyomarto, Singosari',
    namaAyah: 'Hasan Basri',
    namaIbu: 'Mariam',
    noHpOrtu: '0821-4455-6604',
    tanggalMasuk: '2023-07-15',
    foto: '',
    kelasId: 'k-1',
    metodeId: 'm-bilqolam',
    jilidId: 'j-bq-2',
    status: 'aktif',
    username: 'santri4',
    password: 'password123'
  },
  {
    id: 's-5',
    nis: '2025005',
    namaLengkap: 'Farhan Maulana Hakim',
    namaPanggilan: 'Farhan',
    jk: 'L',
    tempatLahir: 'Malang',
    tanggalLahir: '2016-09-09',
    alamat: 'Candirenggo Singosari RT 04',
    namaAyah: 'Lukman Hakim',
    namaIbu: 'Khotimah',
    noHpOrtu: '0878-5566-7705',
    tanggalMasuk: '2023-07-15',
    foto: '',
    kelasId: 'k-2',
    metodeId: 'm-juz-amma',
    jilidId: 'j-ja-1',
    status: 'aktif',
    username: 'santri5',
    password: 'password123'
  }
];

export const defaultNilaiList: NilaiSantri[] = [
  // Santri 1 (Rayhan)
  { id: 'n-1-1', santriId: 's-1', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-1', nilaiAngka: 88, catatan: 'Lancar dan runtut', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },
  { id: 'n-1-2', santriId: 's-1', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-2', nilaiAngka: 85, catatan: 'Makhorijul huruf mantap', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },
  { id: 'n-1-3', santriId: 's-1', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-3', nilaiAngka: 82, catatan: 'Irama tartil baik', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },
  { id: 'n-1-4', santriId: 's-1', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-4', nilaiAngka: 90, catatan: 'Hafalan surat An-Naas s/d Al-Fil lancar', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },
  { id: 'n-1-5', santriId: 's-1', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-5', nilaiAngka: 86, catatan: 'Doa wudhu dan sholat subuh tuntas', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },
  { id: 'n-1-6', santriId: 's-1', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-6', nilaiAngka: 92, catatan: 'Sangat santun dan rajin hadir', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },

  // Santri 2 (Kamila)
  { id: 'n-2-1', santriId: 's-2', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-1', nilaiAngka: 94, catatan: 'Sangat fasih dan lancar', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },
  { id: 'n-2-2', santriId: 's-2', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-2', nilaiAngka: 95, catatan: 'Tajwid akurat', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },
  { id: 'n-2-3', santriId: 's-2', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-3', nilaiAngka: 92, catatan: 'Suara merdu dan tartil', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },
  { id: 'n-2-4', santriId: 's-2', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-4', nilaiAngka: 96, catatan: 'Hafal s/d surat At-Takatsur', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },
  { id: 'n-2-5', santriId: 's-2', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-5', nilaiAngka: 90, catatan: 'Praktik sholat sempurna', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },
  { id: 'n-2-6', santriId: 's-2', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-6', nilaiAngka: 95, catatan: 'Teladan akhlak di halaqoh', tanggalInput: '2025-11-20', ustadzId: 'ust-2' },

  // Santri 3 (Fathan)
  { id: 'n-3-1', santriId: 's-3', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-1', nilaiAngka: 85, catatan: 'Lancar', tanggalInput: '2025-11-20', ustadzId: 'ust-3' },
  { id: 'n-3-2', santriId: 's-3', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-2', nilaiAngka: 82, catatan: 'Perhatikan ikhfa', tanggalInput: '2025-11-20', ustadzId: 'ust-3' },
  { id: 'n-3-3', santriId: 's-3', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-3', nilaiAngka: 80, catatan: 'Tartil', tanggalInput: '2025-11-20', ustadzId: 'ust-3' },
  { id: 'n-3-4', santriId: 's-3', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-4', nilaiAngka: 88, catatan: 'Hafalan baik', tanggalInput: '2025-11-20', ustadzId: 'ust-3' },
  { id: 'n-3-5', santriId: 's-3', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-5', nilaiAngka: 84, catatan: 'Praktik baik', tanggalInput: '2025-11-20', ustadzId: 'ust-3' },
  { id: 'n-3-6', santriId: 's-3', tahunId: 'tp-2025-2026', semester: 'Ganjil', komponenId: 'kp-6', nilaiAngka: 86, catatan: 'Tertib', tanggalInput: '2025-11-20', ustadzId: 'ust-3' }
];

export const defaultCatatanRaporList: CatatanRapor[] = [
  {
    id: 'cr-1',
    santriId: 's-1',
    tahunId: 'tp-2025-2026',
    semester: 'Ganjil',
    catatanWali: 'Alhamdulillah ananda Rayhan menunjukkan kemajuan pesat dalam metode Bilqolam. Pertahankan semangat belajarnya!',
    catatanKepala: 'Barakallah, teruskan menghafal dan mengamalkan adab Qur\'ani setiap hari.',
    capaianHafalan: 'Hafal Surat An-Naas s/d Al-Fil dengan fashih',
    capaianIbadah: 'Hafal bacaan ruku, sujud, dan doa qunut',
    sakit: 1,
    izin: 1,
    tanpaKeterangan: 0,
    keputusanKenaikanKelas: 'Belum Ditentukan'
  },
  {
    id: 'cr-2',
    santriId: 's-2',
    tahunId: 'tp-2025-2026',
    semester: 'Ganjil',
    catatanWali: 'Prestasi Kamila sangat istimewa, bacaan tartil dan hafalannya sangat mutqin.',
    catatanKepala: 'Pertahankan prestasi gemilang ini, semoga menjadi hafidzah sholehah kebanggaan umat.',
    capaianHafalan: 'Hafal Surat An-Naas s/d Al-A\'la dengan tajwid sempurna',
    capaianIbadah: 'Dapat memimpin doa harian dan sholat dhuha',
    sakit: 0,
    izin: 0,
    tanpaKeterangan: 0,
    keputusanKenaikanKelas: 'Belum Ditentukan'
  }
];

export const defaultEvaluasiJilidList: EvaluasiKenaikanJilid[] = [
  {
    id: 'ev-1',
    santriId: 's-1',
    tanggalUjian: '2025-10-15',
    metodeId: 'm-bilqolam',
    dariJilidId: 'j-bq-2',
    keJilidId: 'j-bq-3',
    nilaiUjian: 88,
    status: 'Lulus (Naik Jilid)',
    penguji: 'Ust. Moh. Umar Jaelani, S.Pd.I,.Gr.',
    catatan: 'Lulus naik ke Bilqolam Jilid 3. Makhroj mantap.'
  },
  {
    id: 'ev-2',
    santriId: 's-2',
    tanggalUjian: '2025-10-18',
    metodeId: 'm-juz-amma',
    dariJilidId: 'j-ja-1',
    keJilidId: 'j-ja-2',
    nilaiUjian: 95,
    status: 'Lulus (Naik Jilid)',
    penguji: 'Ust. Ahmad Fauzi, S.Pd.',
    catatan: 'Hafalan sangat mutqin dan fashih.'
  }
];

export const defaultRiwayatKenaikanKelas: RiwayatKenaikanKelas[] = [
  {
    id: 'rk-1',
    santriId: 's-3',
    dariKelasId: 'k-2',
    keKelasId: 'k-3',
    tahunAjaran: '2024/2025',
    status: 'Naik Kelas',
    catatan: 'Naik ke kelas lanjutan karena kemampuan membaca sudah mencapai tingkatan tartil Al-Qur\'an',
    tanggal: '2025-06-25'
  }
];

export const defaultPiagamList: PiagamJuara[] = [
  {
    id: 'pg-1',
    nomorPiagam: 'PG/TPQ-ADZ/2025/001',
    santriId: 's-2',
    tahunId: 'tp-2025-2026',
    semester: 'Ganjil',
    kelasId: 'k-2',
    kategori: 'Prestasi Akademik Rapor Semester Ganjil',
    juara: 1,
    nilaiAkhir: 94.0,
    tanggalTerbit: '2025-12-20'
  },
  {
    id: 'pg-2',
    nomorPiagam: 'PG/TPQ-ADZ/2025/002',
    santriId: 's-1',
    tahunId: 'tp-2025-2026',
    semester: 'Ganjil',
    kelasId: 'k-1',
    kategori: 'Prestasi Akademik Rapor Semester Ganjil',
    juara: 1,
    nilaiAkhir: 87.8,
    tanggalTerbit: '2025-12-20'
  }
];

export const defaultChatList: InternalChat[] = [
  {
    id: 'chat-1',
    senderId: 'ust-2',
    senderName: 'Ust. Ahmad Fauzi, S.Pd.',
    senderRole: 'ustadz',
    recipientId: 'admin',
    recipientName: 'Administrator TPQ',
    message: 'Assalamu\'alaikum admin, untuk santri ananda Rayhan nilai munaqosyah jilid 3 sudah diinput lengkap ya.',
    timestamp: '2025-11-20 09:30',
    isRead: true
  },
  {
    id: 'chat-2',
    senderId: 'admin',
    senderName: 'Administrator TPQ',
    senderRole: 'admin',
    recipientId: 'ust-2',
    recipientName: 'Ust. Ahmad Fauzi, S.Pd.',
    message: 'Wa\'alaikumsalam ustadz. Syukron, datanya sudah diverifikasi dan siap untuk cetak rapor semester ganjil.',
    timestamp: '2025-11-20 09:45',
    isRead: true
  }
];

// Helper functions for persistent LocalStorage management
export const storageService = {
  getLembagaProfile(): LembagaProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEMBAGA);
      if (data) {
        const parsed = JSON.parse(data);
        const nstpq = parsed.nstpq || parsed.nspq || defaultLembagaProfile.nstpq;
        return { ...defaultLembagaProfile, ...parsed, nstpq, nspq: nstpq };
      }
      return defaultLembagaProfile;
    } catch {
      return defaultLembagaProfile;
    }
  },
  saveLembagaProfile(profile: LembagaProfile): void {
    localStorage.setItem(STORAGE_KEYS.LEMBAGA, JSON.stringify(profile));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getAppSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...defaultAppSettings, ...JSON.parse(data) } : defaultAppSettings;
    } catch {
      return defaultAppSettings;
    }
  },
  saveAppSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getTahunList(): TahunPelajaran[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TAHUN);
      return data ? JSON.parse(data) : defaultTahunList;
    } catch {
      return defaultTahunList;
    }
  },
  saveTahunList(list: TahunPelajaran[]): void {
    localStorage.setItem(STORAGE_KEYS.TAHUN, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },
  getActiveTahun(): TahunPelajaran {
    const list = this.getTahunList();
    return list.find(t => t.isAktif) || list[0] || defaultTahunList[0];
  },

  getUstadzList(): Ustadz[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USTADZ);
      return data ? JSON.parse(data) : defaultUstadzList;
    } catch {
      return defaultUstadzList;
    }
  },
  saveUstadzList(list: Ustadz[]): void {
    localStorage.setItem(STORAGE_KEYS.USTADZ, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getKelasList(): Kelas[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KELAS);
      return data ? JSON.parse(data) : defaultKelasList;
    } catch {
      return defaultKelasList;
    }
  },
  saveKelasList(list: Kelas[]): void {
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getSantriList(): Santri[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SANTRI);
      return data ? JSON.parse(data) : defaultSantriList;
    } catch {
      return defaultSantriList;
    }
  },
  saveSantriList(list: Santri[]): void {
    localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getMetodeList(): MetodePembelajaran[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.METODE);
      return data ? JSON.parse(data) : defaultMetodeList;
    } catch {
      return defaultMetodeList;
    }
  },
  saveMetodeList(list: MetodePembelajaran[]): void {
    localStorage.setItem(STORAGE_KEYS.METODE, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getKomponenList(): KomponenPenilaian[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KOMPONEN);
      return data ? JSON.parse(data) : defaultKomponenList;
    } catch {
      return defaultKomponenList;
    }
  },
  saveKomponenList(list: KomponenPenilaian[]): void {
    localStorage.setItem(STORAGE_KEYS.KOMPONEN, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getPredikatList(): PredikatRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREDIKAT);
      return data ? JSON.parse(data) : defaultPredikatList;
    } catch {
      return defaultPredikatList;
    }
  },
  savePredikatList(list: PredikatRule[]): void {
    localStorage.setItem(STORAGE_KEYS.PREDIKAT, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getNilaiList(): NilaiSantri[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NILAI);
      return data ? JSON.parse(data) : defaultNilaiList;
    } catch {
      return defaultNilaiList;
    }
  },
  saveNilaiList(list: NilaiSantri[]): void {
    localStorage.setItem(STORAGE_KEYS.NILAI, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getCatatanRaporList(): CatatanRapor[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATATAN_RAPOR);
      return data ? JSON.parse(data) : defaultCatatanRaporList;
    } catch {
      return defaultCatatanRaporList;
    }
  },
  saveCatatanRaporList(list: CatatanRapor[]): void {
    localStorage.setItem(STORAGE_KEYS.CATATAN_RAPOR, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getEvaluasiJilidList(): EvaluasiKenaikanJilid[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KENAIKAN_JILID);
      return data ? JSON.parse(data) : defaultEvaluasiJilidList;
    } catch {
      return defaultEvaluasiJilidList;
    }
  },
  saveEvaluasiJilidList(list: EvaluasiKenaikanJilid[]): void {
    localStorage.setItem(STORAGE_KEYS.KENAIKAN_JILID, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getRiwayatKenaikanKelas(): RiwayatKenaikanKelas[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KENAIKAN_KELAS);
      return data ? JSON.parse(data) : defaultRiwayatKenaikanKelas;
    } catch {
      return defaultRiwayatKenaikanKelas;
    }
  },
  saveRiwayatKenaikanKelas(list: RiwayatKenaikanKelas[]): void {
    localStorage.setItem(STORAGE_KEYS.KENAIKAN_KELAS, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getPiagamList(): PiagamJuara[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PIAGAM);
      return data ? JSON.parse(data) : defaultPiagamList;
    } catch {
      return defaultPiagamList;
    }
  },
  savePiagamList(list: PiagamJuara[]): void {
    localStorage.setItem(STORAGE_KEYS.PIAGAM, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getChatList(): InternalChat[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT);
      return data ? JSON.parse(data) : defaultChatList;
    } catch {
      return defaultChatList;
    }
  },
  saveChatList(list: InternalChat[]): void {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(list));
    window.dispatchEvent(new Event('tpq_data_updated'));
  },

  getUserSession(): UserSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveUserSession(session: UserSession | null): void {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    }
  },

  // Calculate student final weighted score & predicate
  calculateSantriNilai(santriId: string, tahunId: string, semester: 'Ganjil' | 'Genap') {
    const nilaiList = this.getNilaiList().filter(
      n => n.santriId === santriId && n.tahunId === tahunId && n.semester === semester
    );
    const komponenList = this.getKomponenList().filter(k => k.isAktif);
    const predikatList = this.getPredikatList();

    if (nilaiList.length === 0) {
      return { totalNilai: 0, rataRata: 0, predikat: '-', label: 'Belum Dinilai', keterangan: 'Belum ada nilai', items: [] };
    }

    let totalBobot = 0;
    let weightedSum = 0;
    let simpleSum = 0;

    const items = komponenList.map(comp => {
      const record = nilaiList.find(n => n.komponenId === comp.id);
      const score = record ? record.nilaiAngka : 0;
      totalBobot += comp.bobot;
      weightedSum += (score * comp.bobot);
      simpleSum += score;
      
      const pred = predikatList.find(p => score >= p.minScore && score <= p.maxScore) || {
        predikat: '-',
        label: '-',
        keterangan: '-'
      };

      return {
        komponenId: comp.id,
        nama: comp.nama,
        kategori: comp.kategori,
        bobot: comp.bobot,
        nilai: score,
        predikat: pred.predikat,
        predikatLabel: pred.label,
        catatan: record?.catatan || ''
      };
    });

    const rataRata = totalBobot > 0 ? (weightedSum / totalBobot) : (komponenList.length > 0 ? simpleSum / komponenList.length : 0);
    const roundedRata = Math.round(rataRata * 10) / 10;
    const finalPred = predikatList.find(p => roundedRata >= p.minScore && roundedRata <= p.maxScore) || {
      predikat: '-',
      label: 'Belum Dinilai',
      keterangan: '-'
    };

    return {
      totalNilai: Math.round(weightedSum / 100),
      rataRata: roundedRata,
      predikat: finalPred.predikat,
      label: finalPred.label,
      keterangan: finalPred.keterangan,
      items
    };
  },

  // Calculate full ranked leaderboard for a specific class & semester
  calculateClassRankings(kelasId: string, tahunId: string, semester: 'Ganjil' | 'Genap') {
    const santriInClass = this.getSantriList().filter(s => s.kelasId === kelasId && s.status === 'aktif');
    const scoredList = santriInClass.map(s => {
      const calculation = this.calculateSantriNilai(s.id, tahunId, semester);
      return {
        santri: s,
        calculation
      };
    });

    // Sort descending by rata-rata, then by totalNilai
    scoredList.sort((a, b) => {
      if (b.calculation.rataRata !== a.calculation.rataRata) {
        return b.calculation.rataRata - a.calculation.rataRata;
      }
      return b.calculation.totalNilai - a.calculation.totalNilai;
    });

    const totalSantri = scoredList.length;
    return scoredList.map((item, index) => ({
      ...item,
      ranking: index + 1,
      totalSantri
    }));
  },

  // Get single student ranking in their class
  getSantriRanking(santriId: string, kelasId: string, tahunId: string, semester: 'Ganjil' | 'Genap') {
    if (!kelasId) return { ranking: 0, totalSantri: 0 };
    const ranked = this.calculateClassRankings(kelasId, tahunId, semester);
    const found = ranked.find(r => r.santri.id === santriId);
    if (!found) return { ranking: 0, totalSantri: ranked.length };
    return { ranking: found.ranking, totalSantri: found.totalSantri };
  },

  // Export full JSON database for backup
  exportFullDatabaseJSON(): string {
    const dump = {
      exportedAt: new Date().toISOString(),
      lembaga: this.getLembagaProfile(),
      settings: this.getAppSettings(),
      tahunPelajaran: this.getTahunList(),
      ustadz: this.getUstadzList(),
      kelas: this.getKelasList(),
      santri: this.getSantriList(),
      metode: this.getMetodeList(),
      komponen: this.getKomponenList(),
      predikat: this.getPredikatList(),
      nilai: this.getNilaiList(),
      catatanRapor: this.getCatatanRaporList(),
      evaluasiJilid: this.getEvaluasiJilidList(),
      kenaikanKelas: this.getRiwayatKenaikanKelas(),
      piagam: this.getPiagamList(),
      chat: this.getChatList()
    };
    return JSON.stringify(dump, null, 2);
  },

  // Import JSON backup
  importFullDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.lembaga) this.saveLembagaProfile(data.lembaga);
      if (data.settings) this.saveAppSettings(data.settings);
      if (data.tahunPelajaran) this.saveTahunList(data.tahunPelajaran);
      if (data.ustadz) this.saveUstadzList(data.ustadz);
      if (data.kelas) this.saveKelasList(data.kelas);
      if (data.santri) this.saveSantriList(data.santri);
      if (data.metode) this.saveMetodeList(data.metode);
      if (data.komponen) this.saveKomponenList(data.komponen);
      if (data.predikat) this.savePredikatList(data.predikat);
      if (data.nilai) this.saveNilaiList(data.nilai);
      if (data.catatanRapor) this.saveCatatanRaporList(data.catatanRapor);
      if (data.evaluasiJilid) this.saveEvaluasiJilidList(data.evaluasiJilid);
      if (data.kenaikanKelas) this.saveRiwayatKenaikanKelas(data.kenaikanKelas);
      if (data.piagam) this.savePiagamList(data.piagam);
      if (data.chat) this.saveChatList(data.chat);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },

  // Reset to default TPQ Al-Adzkiyaa' database
  resetToDefault(): void {
    localStorage.clear();
    this.saveLembagaProfile(defaultLembagaProfile);
    this.saveAppSettings(defaultAppSettings);
    this.saveTahunList(defaultTahunList);
    this.saveUstadzList(defaultUstadzList);
    this.saveKelasList(defaultKelasList);
    this.saveSantriList(defaultSantriList);
    this.saveMetodeList(defaultMetodeList);
    this.saveKomponenList(defaultKomponenList);
    this.savePredikatList(defaultPredikatList);
    this.saveNilaiList(defaultNilaiList);
    this.saveCatatanRaporList(defaultCatatanRaporList);
    this.saveEvaluasiJilidList(defaultEvaluasiJilidList);
    this.saveRiwayatKenaikanKelas(defaultRiwayatKenaikanKelas);
    this.savePiagamList(defaultPiagamList);
    this.saveChatList(defaultChatList);
  }
};
