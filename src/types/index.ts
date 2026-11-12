export interface LembagaProfile {
  nama: string;
  yayasan: string;
  nstpq: string;
  nspq?: string; // fallback compatibility
  telepon: string;
  website: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kepalaTpq: string;
  nipKepala: string;
  jabatanPenandatangan: string;
  kotaPenerbitan: string;
  logoUrl: string;
  stempelUrl: string;
  ttdKepalaUrl: string;
  footnote: string;
}

export interface AppSettings {
  appName: string;
  themeColor: string;
  paperSize: 'A4' | 'F4';
  orientation: 'portrait' | 'landscape';
  footerText: string;
  minPassingScore: number;
  tempatCetakRapor?: string;
  tanggalCetakRaporGanjil?: string;
  tanggalCetakRaporGenap?: string;
  customTanggalCetak?: string;
}

export interface TahunPelajaran {
  id: string;
  tahun: string; // e.g. "2025/2026"
  semesterAktif: 'Ganjil' | 'Genap';
  isAktif: boolean;
  isLocked: boolean;
  tanggalRaporGanjil: string;
  tanggalRaporGenap: string;
}

export interface Ustadz {
  id: string;
  nip: string;
  nama: string;
  foto: string;
  jk: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  noHp: string;
  pendidikan: string;
  status: 'aktif' | 'nonaktif';
  username: string;
  password?: string;
  role: 'ustadz' | 'kepala' | 'admin';
  halaqohIds: string[];
}

export interface Kelas {
  id: string;
  namaKelas: string;
  tingkatan: string;
  ustadzId: string;
  urutan: number;
  kapasitas: number;
  keterangan?: string;
}

export interface Santri {
  id: string;
  nis: string;
  namaLengkap: string;
  namaPanggilan: string;
  jk: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  namaAyah: string;
  namaIbu: string;
  noHpOrtu: string;
  tanggalMasuk: string;
  foto: string;
  kelasId: string;
  metodeId: string;
  jilidId: string;
  status: 'aktif' | 'lulus' | 'pindah' | 'nonaktif';
  username: string;
  password?: string;
}

export interface JilidItem {
  id: string;
  nama: string;
  urutan: number;
  target: string;
  syaratLulus: string;
}

export interface MetodePembelajaran {
  id: string;
  nama: string;
  deskripsi: string;
  jilidList: JilidItem[];
}

export interface KomponenPenilaian {
  id: string;
  nama: string;
  bobot: number; // in percent
  urutan: number;
  kategori: 'Al-Qur\'an & Tajwid' | 'Hafalan' | 'Akhlak & Adab' | 'Praktik Ibadah' | 'Lainnya';
  isAktif: boolean;
  showInRapor: boolean;
  deskripsiDefault?: string;
}

export interface PredikatRule {
  id: string;
  predikat: string;
  label: string; // e.g. "Sangat Baik (Mumtaz)"
  minScore: number;
  maxScore: number;
  keterangan: string;
}

export interface NilaiSantri {
  id: string;
  santriId: string;
  tahunId: string;
  semester: 'Ganjil' | 'Genap';
  komponenId: string;
  nilaiAngka: number;
  catatan?: string;
  tanggalInput: string;
  ustadzId: string;
}

export interface CatatanRapor {
  id: string;
  santriId: string;
  tahunId: string;
  semester: 'Ganjil' | 'Genap';
  catatanWali: string;
  catatanKepala: string;
  capaianHafalan: string;
  capaianIbadah: string;
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
  keputusanKenaikanKelas?: 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Belum Ditentukan';
  kelasTujuan?: string;
}

export interface EvaluasiKenaikanJilid {
  id: string;
  santriId: string;
  tanggalUjian: string;
  metodeId: string;
  dariJilidId: string;
  keJilidId: string;
  nilaiUjian: number;
  status: 'Lulus (Naik Jilid)' | 'Belum Naik' | 'Ulangi Evaluasi';
  penguji: string;
  catatan: string;
}

export interface RiwayatKenaikanKelas {
  id: string;
  santriId: string;
  dariKelasId: string;
  keKelasId: string;
  tahunAjaran: string;
  status: 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Pindah';
  catatan: string;
  tanggal: string;
}

export interface PiagamJuara {
  id: string;
  nomorPiagam: string;
  santriId: string;
  tahunId: string;
  semester: 'Ganjil' | 'Genap';
  kelasId: string;
  kategori: string;
  juara: 1 | 2 | 3;
  nilaiAkhir: number;
  tanggalTerbit: string;
}

export interface InternalChat {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'ustadz' | 'kepala';
  recipientId: string; // 'all' or specific ustadz id
  recipientName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface UserSession {
  id: string;
  username: string;
  nama: string;
  role: 'admin' | 'ustadz' | 'santri' | 'kepala';
  santriId?: string;
  ustadzId?: string;
}
