import * as XLSX from 'xlsx';
import { Santri, Kelas, MetodePembelajaran } from '../types';

export const excelService = {
  // Export Santri list to XLSX
  exportSantriToXLSX(santriList: Santri[], kelasList: Kelas[], metodeList: MetodePembelajaran[], fileName = 'Data_Santri_TPQ.xlsx') {
    const data = santriList.map((s, index) => {
      const kelas = kelasList.find(k => k.id === s.kelasId);
      const metode = metodeList.find(m => m.id === s.metodeId);
      const jilid = metode?.jilidList.find(j => j.id === s.jilidId);

      return {
        'No': index + 1,
        'NIS': s.nis,
        'Nama Lengkap': s.namaLengkap,
        'Nama Panggilan': s.namaPanggilan,
        'Jenis Kelamin (L/P)': s.jk,
        'Tempat Lahir': s.tempatLahir,
        'Tanggal Lahir (YYYY-MM-DD)': s.tanggalLahir,
        'Alamat': s.alamat,
        'Nama Ayah': s.namaAyah,
        'Nama Ibu': s.namaIbu,
        'No. HP / WA Ortu': s.noHpOrtu,
        'Tanggal Masuk': s.tanggalMasuk,
        'Kelas / Halaqoh': kelas?.namaKelas || '-',
        'Metode': metode?.nama || '-',
        'Jilid / Tingkat': jilid?.nama || '-',
        'Status': s.status,
        'Username': s.username
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Santri');
    XLSX.writeFile(workbook, fileName);
  },

  // Download empty XLSX Template for importing Santri
  downloadSantriTemplateXLSX(fileName = 'Template_Import_Santri_TPQ.xlsx') {
    const sampleRows = [
      {
        'NIS': '2025009',
        'Nama Lengkap': 'Ahmad Zaki Al-Mubarak',
        'Nama Panggilan': 'Zaki',
        'Jenis Kelamin (L/P)': 'L',
        'Tempat Lahir': 'Malang',
        'Tanggal Lahir (YYYY-MM-DD)': '2017-05-15',
        'Alamat': 'Jl. Toyomarto RT 01 Singosari',
        'Nama Ayah': 'Sulaiman',
        'Nama Ibu': 'Fatimah',
        'No. HP / WA Ortu': '081234567899',
        'Tanggal Masuk': '2024-07-15',
        'Status (aktif/lulus/pindah/nonaktif)': 'aktif',
        'Username': 'santrizaki',
        'Password': 'password123'
      },
      {
        'NIS': '2025010',
        'Nama Lengkap': 'Khofifah Nur Indah',
        'Nama Panggilan': 'Indah',
        'Jenis Kelamin (L/P)': 'P',
        'Tempat Lahir': 'Malang',
        'Tanggal Lahir (YYYY-MM-DD)': '2016-12-08',
        'Alamat': 'Dusun Ngujung Toyomarto',
        'Nama Ayah': 'Mansyur',
        'Nama Ibu': 'Aminah',
        'No. HP / WA Ortu': '085712345678',
        'Tanggal Masuk': '2024-07-15',
        'Status (aktif/lulus/pindah/nonaktif)': 'aktif',
        'Username': 'santriindah',
        'Password': 'password123'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import');
    XLSX.writeFile(workbook, fileName);
  },

  // Parse uploaded XLSX file into Santri partials
  async parseSantriXLSX(file: File): Promise<Partial<Santri>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

          const parsedList: Partial<Santri>[] = rows.map((row) => {
            const nis = String(row['NIS'] || row['nis'] || '').trim();
            const namaLengkap = String(row['Nama Lengkap'] || row['Nama'] || row['namaLengkap'] || '').trim();
            const jkRaw = String(row['Jenis Kelamin (L/P)'] || row['JK'] || row['jk'] || 'L').toUpperCase();
            const jk: 'L' | 'P' = jkRaw.startsWith('P') ? 'P' : 'L';

            return {
              nis: nis || `S-${Math.floor(100000 + Math.random() * 900000)}`,
              namaLengkap: namaLengkap || 'Santri Baru',
              namaPanggilan: String(row['Nama Panggilan'] || namaLengkap.split(' ')[0] || '').trim(),
              jk,
              tempatLahir: String(row['Tempat Lahir'] || 'Malang').trim(),
              tanggalLahir: String(row['Tanggal Lahir (YYYY-MM-DD)'] || '2017-01-01').trim(),
              alamat: String(row['Alamat'] || '-').trim(),
              namaAyah: String(row['Nama Ayah'] || '-').trim(),
              namaIbu: String(row['Nama Ibu'] || '-').trim(),
              noHpOrtu: String(row['No. HP / WA Ortu'] || row['No HP'] || '-').trim(),
              tanggalMasuk: String(row['Tanggal Masuk'] || new Date().toISOString().split('T')[0]).trim(),
              status: (['aktif', 'lulus', 'pindah', 'nonaktif'].includes(String(row['Status'] || '').toLowerCase())
                ? String(row['Status']).toLowerCase()
                : 'aktif') as 'aktif' | 'lulus' | 'pindah' | 'nonaktif',
              username: String(row['Username'] || nis || `santri_${Math.floor(Math.random() * 9000)}`).trim(),
              password: String(row['Password'] || 'password123').trim()
            };
          });

          resolve(parsedList);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  // Export Rekap Nilai to XLSX
  exportRekapNilaiXLSX(
    rekapData: {
      nis: string;
      nama: string;
      kelas: string;
      rataRata: number;
      predikat: string;
      keterangan: string;
    }[],
    tahun: string,
    semester: string
  ) {
    const formattedData = rekapData.map((item, idx) => ({
      'No': idx + 1,
      'NIS': item.nis,
      'Nama Santri': item.nama,
      'Kelas / Halaqoh': item.kelas,
      'Nilai Rata-rata': item.rataRata,
      'Predikat': item.predikat,
      'Keterangan': item.keterangan
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap Nilai ${semester}`);
    XLSX.writeFile(workbook, `Rekap_Nilai_${tahun.replace('/', '-')}_Semester_${semester}.xlsx`);
  },

  // Export Leger Kumpulan Nilai & Ranking Kelas to XLSX
  exportLegerXLSX(params: {
    kelasNama: string;
    tahun: string;
    semester: string;
    waliKelas: string;
    komponenList: { id: string; nama: string }[];
    rankedData: {
      santri: { nis: string; namaLengkap: string };
      ranking: number;
      calculation: {
        rataRata: number;
        predikat: string;
        label: string;
        items: { komponenId: string; nilai: number }[];
      };
    }[];
  }) {
    const activeComps = params.komponenList;
    const rows = params.rankedData.map((item, idx) => {
      const rowObj: Record<string, any> = {
        'No': idx + 1,
        'Peringkat': item.ranking,
        'NIS': item.santri.nis,
        'Nama Lengkap': item.santri.namaLengkap
      };

      // Component scores
      activeComps.forEach(comp => {
        const val = item.calculation.items.find(it => it.komponenId === comp.id)?.nilai ?? 0;
        rowObj[comp.nama] = val;
      });

      rowObj['Nilai Rata-rata'] = item.calculation.rataRata;
      rowObj['Predikat'] = item.calculation.predikat;
      rowObj['Capaian / Keterangan'] = item.calculation.label;

      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leger Nilai & Ranking');
    XLSX.writeFile(
      workbook,
      `Leger_Nilai_${params.kelasNama.replace(/\s+/g, '_')}_${params.tahun.replace('/', '-')}_Sem_${params.semester}.xlsx`
    );
  }
};
