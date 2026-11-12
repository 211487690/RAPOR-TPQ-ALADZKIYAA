import jsPDF from 'jspdf';
import {
  LembagaProfile,
  Santri,
  Kelas,
  Ustadz,
  TahunPelajaran,
  CatatanRapor,
  PiagamJuara,
  MetodePembelajaran,
  KomponenPenilaian
} from '../types';
import { generateRaporQRDataUrl } from '../utils/qrHelper';

interface CalculatedScoreItem {
  komponenId: string;
  nama: string;
  bobot: number;
  nilai: number;
  predikat: string;
  catatan?: string;
}

export interface RaporPrintData {
  santri: Santri;
  kelas?: Kelas;
  ustadz?: Ustadz;
  tahun: TahunPelajaran;
  semester: 'Ganjil' | 'Genap';
  metode?: MetodePembelajaran;
  jilidNama: string;
  catatanRapor?: CatatanRapor;
  lembaga: LembagaProfile;
  ranking?: number;
  totalSantriKelas?: number;
  scores: {
    totalNilai: number;
    rataRata: number;
    predikat: string;
    label: string;
    keterangan: string;
    items: CalculatedScoreItem[];
  };
}

export interface LegerPrintData {
  lembaga: LembagaProfile;
  kelas: Kelas;
  tahun: TahunPelajaran;
  semester: 'Ganjil' | 'Genap';
  ustadz?: Ustadz;
  komponenList: KomponenPenilaian[];
  rankedData: {
    santri: Santri;
    ranking: number;
    totalSantri: number;
    calculation: {
      totalNilai: number;
      rataRata: number;
      predikat: string;
      label: string;
      keterangan: string;
      items: { komponenId: string; nilai: number }[];
    };
  }[];
}

export const pdfService = {
  // Helper to load image as base64 or fallback
  async getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  },

  // Helper to render a single complete Rapor page on A4 portrait
  renderRaporPage(doc: jsPDF, data: RaporPrintData, logoData: string | null, qrDataUrl?: string | null): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 14;

    // --- KOP RAPOR ---
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', margin, y - 3, 20, 20);
      } catch (e) {
        console.warn('Could not render logo in PDF:', e);
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(data.lembaga.yayasan.toUpperCase(), pageWidth / 2, y, { align: 'center' });

    y += 5;
    doc.setFontSize(13.5);
    doc.setTextColor(5, 150, 105); // emerald color
    doc.text(data.lembaga.nama.toUpperCase(), pageWidth / 2, y, { align: 'center' });

    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const nstpqValue = data.lembaga.nstpq || data.lembaga.nspq || '-';
    doc.text(`NSTPQ: ${nstpqValue} | Telp/WA: ${data.lembaga.telepon}`, pageWidth / 2, y, { align: 'center' });

    y += 3.8;
    doc.text(`${data.lembaga.alamat}, ${data.lembaga.kota}`, pageWidth / 2, y, { align: 'center' });

    y += 3;
    // Decorative Kop Divider
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 0.8, pageWidth - margin, y + 0.8);

    y += 6.5;
    // Judul Rapor
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(15, 23, 42);
    doc.text('RAPOR HASIL BELAJAR SANTRI', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tahun Pelajaran ${data.tahun.tahun} - Semester ${data.semester}`, pageWidth / 2, y, { align: 'center' });

    y += 5.5;
    // Box Identitas Santri
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

    const col1 = margin + 3.5;
    const col2 = margin + 32;
    const col3 = margin + contentWidth / 2 + 3.5;
    const col4 = col3 + 32;

    doc.setFontSize(7.8);
    doc.setTextColor(71, 85, 105);
    doc.text('Nama Lengkap', col1, y + 4.5);
    doc.text(':', col1 + 25, y + 4.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(data.santri.namaLengkap, col2, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Nomor Induk (NIS)', col1, y + 9.5);
    doc.text(':', col1 + 25, y + 9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(data.santri.nis, col2, y + 9.5);

    doc.setTextColor(71, 85, 105);
    doc.text('Metode / Jilid', col1, y + 14.5);
    doc.text(':', col1 + 25, y + 14.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${data.metode?.nama || 'Bilqolam'} - ${data.jilidNama}`, col2, y + 14.5);

    doc.setTextColor(71, 85, 105);
    doc.text('Status Santri', col1, y + 19.5);
    doc.text(':', col1 + 25, y + 19.5);
    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.text(data.santri.status.toUpperCase(), col2, y + 19.5);

    // Right side
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Kelas / Halaqoh', col3, y + 4.5);
    doc.text(':', col3 + 25, y + 4.5);
    doc.setTextColor(15, 23, 42);
    doc.text(data.kelas?.namaKelas || 'Umum', col4, y + 4.5);

    doc.setTextColor(71, 85, 105);
    doc.text('Wali / Pengampu', col3, y + 9.5);
    doc.text(':', col3 + 25, y + 9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(data.ustadz?.nama || '-', col4, y + 9.5);

    doc.setTextColor(71, 85, 105);
    doc.text('Semester / Tahun', col3, y + 14.5);
    doc.text(':', col3 + 25, y + 14.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${data.semester} (${data.tahun.tahun})`, col4, y + 14.5);

    // Official Ranking Display on Rapor
    doc.setTextColor(71, 85, 105);
    doc.text('Peringkat Kelas', col3, y + 19.5);
    doc.text(':', col3 + 25, y + 19.5);
    doc.setTextColor(217, 119, 6); // amber-600
    doc.setFont('helvetica', 'bold');
    doc.text(
      data.ranking && data.ranking > 0
        ? `Ke-${data.ranking} dari ${data.totalSantriKelas || 0} Santri`
        : 'Belum Ditentukan',
      col4,
      y + 19.5
    );

    y += 28;

    // --- TABEL PENILAIAN HASIL BELAJAR ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('A. PENILAIAN HASIL BELAJAR', margin, y);

    y += 2.5;
    // Table Header
    const rowH = 5.8;
    doc.setFillColor(16, 185, 129); // emerald 500
    doc.rect(margin, y, contentWidth, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(255, 255, 255);

    doc.text('No', margin + 3, y + 4);
    doc.text('Komponen Penilaian', margin + 11, y + 4);
    doc.text('Bobot', margin + 92, y + 4, { align: 'center' });
    doc.text('Nilai', margin + 112, y + 4, { align: 'center' });
    doc.text('Predikat', margin + 132, y + 4, { align: 'center' });
    doc.text('Keterangan / Catatan', margin + 148, y + 4);

    y += rowH;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);

    data.scores.items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, contentWidth, rowH, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, rowH, 'S');

      doc.setTextColor(71, 85, 105);
      doc.text(String(index + 1), margin + 3, y + 4);
      doc.setTextColor(15, 23, 42);
      doc.text(item.nama, margin + 11, y + 4);
      doc.setTextColor(71, 85, 105);
      doc.text(`${item.bobot}%`, margin + 92, y + 4, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(item.nilai), margin + 112, y + 4, { align: 'center' });
      doc.setTextColor(5, 150, 105);
      doc.text(item.predikat, margin + 132, y + 4, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(doc.splitTextToSize(item.catatan || '-', 40)[0] || '-', margin + 148, y + 4);

      y += rowH;
    });

    // Baris Rata-Rata & Nilai Akhir
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, rowH + 0.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('NILAI AKHIR / RATA-RATA', margin + 11, y + 4.5);
    doc.text('100%', margin + 92, y + 4.5, { align: 'center' });
    doc.setTextColor(5, 150, 105);
    doc.text(String(data.scores.rataRata), margin + 112, y + 4.5, { align: 'center' });
    doc.text(data.scores.predikat, margin + 132, y + 4.5, { align: 'center' });
    doc.text(
      `${data.scores.label}${data.ranking && data.ranking > 0 ? ` (Peringkat ${data.ranking}/${data.totalSantriKelas})` : ''}`,
      margin + 148,
      y + 4.5
    );

    y += rowH + 5;

    // --- CAPAIAN & KETIDAKHADIRAN ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('B. CAPAIAN PEMBELAJARAN & KEHADIRAN', margin, y);

    y += 2.5;
    const boxW = (contentWidth - 5) / 2;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, boxW, 23, 1.5, 1.5, 'FD');
    doc.roundedRect(margin + boxW + 5, y, boxW, 23, 1.5, 1.5, 'FD');

    // Box Capaian
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(5, 150, 105);
    doc.text('Capaian Materi & Target:', margin + 3.5, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`• Hafalan: ${data.catatanRapor?.capaianHafalan || 'Sesuai kurikulum target tingkat'}`, margin + 3.5, y + 9.5, { maxWidth: boxW - 7 });
    doc.text(`• Ibadah: ${data.catatanRapor?.capaianIbadah || 'Praktik sholat dan doa harian aktif'}`, margin + 3.5, y + 16, { maxWidth: boxW - 7 });

    // Box Kehadiran & Kenaikan
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('Kehadiran (Absensi) Semester Ini:', margin + boxW + 8.5, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Sakit: ${data.catatanRapor?.sakit || 0} hari  |  Izin: ${data.catatanRapor?.izin || 0} hari  |  Alpa: ${data.catatanRapor?.tanpaKeterangan || 0} hari`, margin + boxW + 8.5, y + 9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Keputusan:', margin + boxW + 8.5, y + 15.5);
    doc.setTextColor(16, 185, 129);
    doc.text(
      data.catatanRapor?.keputusanKenaikanKelas && data.catatanRapor.keputusanKenaikanKelas !== 'Belum Ditentukan'
        ? data.catatanRapor.keputusanKenaikanKelas
        : `Lulus Naik Jilid / Tingkat Selanjutnya (${data.jilidNama})`,
      margin + boxW + 25,
      y + 15.5
    );

    y += 28;

    // --- CATATAN & MOTIVASI ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('C. CATATAN & MOTIVASI USTADZ / KEPALA TPQ', margin, y);

    y += 2.5;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.8);
    doc.setTextColor(71, 85, 105);
    const quote = data.catatanRapor?.catatanWali || 'Terus istiqomah dalam membaca, mempelajari, dan mengamalkan Al-Qur\'anul Karim.';
    doc.text(`"${quote}"`, margin + 3.5, y + 5.5, { maxWidth: contentWidth - 7 });
    if (data.catatanRapor?.catatanKepala) {
      doc.text(`Pesan Pengasuh: "${data.catatanRapor.catatanKepala}"`, margin + 3.5, y + 11.5, { maxWidth: contentWidth - 7 });
    }

    y += 21;

    // --- PENGESAHAN / TANDA TANGAN & QR VALIDASI RESMI ---
    const tglCetak = data.semester === 'Ganjil' ? data.tahun.tanggalRaporGanjil : data.tahun.tanggalRaporGenap;
    const formattedDate = tglCetak || '20 Desember 2025';

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`${data.lembaga.kotaPenerbitan}, ${formattedDate}`, pageWidth - margin - 20, y, { align: 'center' });

    y += 4;
    const sigCol1 = margin + 18;
    const sigCol2 = margin + 60;
    const sigCol3 = margin + 104;
    const sigCol4 = pageWidth - margin - 20;

    doc.text('Orang Tua / Wali', sigCol1, y, { align: 'center' });
    doc.text('Ustadz / Wali Kelas', sigCol2, y, { align: 'center' });
    doc.text('Validasi Keaslian Dokumen', sigCol3, y, { align: 'center' });
    doc.text(`Mengetahui,\n${data.lembaga.jabatanPenandatangan}`, sigCol4, y, { align: 'center' });

    if (qrDataUrl) {
      try {
        doc.addImage(qrDataUrl, 'PNG', sigCol3 - 8, y + 2.5, 16, 16);
      } catch (err) {
        console.warn('QR code failed in PDF:', err);
      }
    }

    y += 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('( .................................... )', sigCol1, y, { align: 'center' });
    doc.text(`( ${data.ustadz?.nama || 'Ustadz Pembimbing'} )`, sigCol2, y, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Scan QR Validasi Digital`, sigCol3, y + 2, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`( ${data.lembaga.kepalaTpq} )`, sigCol4, y, { align: 'center' });

    y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184);
    if (data.lembaga.nipKepala) {
      doc.text(`NIP: ${data.lembaga.nipKepala}`, sigCol4, y, { align: 'center' });
    }

    // Footnote
    doc.setFontSize(7.5);
    doc.text(data.lembaga.footnote, pageWidth / 2, 288, { align: 'center' });
  },

  // 1. Generate Single Rapor PDF
  async generateRaporPDF(data: RaporPrintData, autoDownload = true): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let logoData: string | null = null;
    if (data.lembaga.logoUrl) {
      logoData = await this.getBase64ImageFromUrl(data.lembaga.logoUrl);
    }

    const qrDataUrl = await generateRaporQRDataUrl(
      data.santri,
      data.tahun,
      data.semester,
      data.kelas?.namaKelas || 'Umum'
    );

    this.renderRaporPage(doc, data, logoData, qrDataUrl);

    if (autoDownload) {
      doc.save(`Rapor_${data.santri.nis}_${data.santri.namaPanggilan}.pdf`);
    }

    return doc;
  },

  // 1b. Generate Batch / Multi-Page Rapor PDF (One consolidated document for all students in class)
  async generateBatchRaporPDF(payloadList: RaporPrintData[], filename?: string): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    if (payloadList.length === 0) return doc;

    let logoData: string | null = null;
    if (payloadList[0]?.lembaga.logoUrl) {
      logoData = await this.getBase64ImageFromUrl(payloadList[0].lembaga.logoUrl);
    }

    for (let index = 0; index < payloadList.length; index++) {
      const payload = payloadList[index];
      if (index > 0) {
        doc.addPage('a4', 'portrait');
      }
      const qrDataUrl = await generateRaporQRDataUrl(
        payload.santri,
        payload.tahun,
        payload.semester,
        payload.kelas?.namaKelas || 'Umum'
      );
      this.renderRaporPage(doc, payload, logoData, qrDataUrl);
    }

    const defaultName = `Rapor_Massal_${payloadList[0]?.kelas?.namaKelas || 'Kelas'}_${payloadList[0]?.tahun.tahun.replace('/', '-')}.pdf`;
    doc.save(filename || defaultName);
    return doc;
  },

  // Helper to render a single complete Piagam page
  renderPiagamPage(
    doc: jsPDF,
    piagam: PiagamJuara,
    santri: Santri,
    kelas: Kelas | undefined,
    tahun: TahunPelajaran | undefined,
    lembaga: LembagaProfile,
    orientation: 'landscape' | 'portrait' = 'landscape',
    logoData: string | null = null
  ): void {
    const isPortrait = orientation === 'portrait';
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Clean neutral ivory-white canvas
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, 'F');

    // Modern Elegant Minimalist Double Hairline Border
    const outerMargin = 10;
    const innerMargin = 13;

    // Outer subtle emerald border
    doc.setDrawColor(5, 150, 105); // emerald-600
    doc.setLineWidth(1.2);
    doc.rect(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2);

    // Inner refined gold hairline border
    doc.setDrawColor(217, 119, 6); // amber-600
    doc.setLineWidth(0.4);
    doc.rect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);

    // Modern minimalist corner brackets
    const bracketSize = isPortrait ? 6 : 8;
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(1.2);
    // Top-left
    doc.line(innerMargin, innerMargin + bracketSize, innerMargin, innerMargin);
    doc.line(innerMargin, innerMargin, innerMargin + bracketSize, innerMargin);
    // Top-right
    doc.line(width - innerMargin - bracketSize, innerMargin, width - innerMargin, innerMargin);
    doc.line(width - innerMargin, innerMargin, width - innerMargin, innerMargin + bracketSize);
    // Bottom-left
    doc.line(innerMargin, height - innerMargin - bracketSize, innerMargin, height - innerMargin);
    doc.line(innerMargin, height - innerMargin, innerMargin + bracketSize, height - innerMargin);
    // Bottom-right
    doc.line(width - innerMargin - bracketSize, height - innerMargin, width - innerMargin, height - innerMargin);
    doc.line(width - innerMargin, height - innerMargin, width - innerMargin, height - innerMargin - bracketSize);

    let y = isPortrait ? 24 : 21;

    // Logo TPQ
    if (logoData) {
      try {
        const logoSize = isPortrait ? 22 : 19;
        doc.addImage(logoData, 'PNG', width / 2 - logoSize / 2, y - (isPortrait ? 8 : 7), logoSize, logoSize);
        y += isPortrait ? 18 : 15;
      } catch (e) {
        console.warn('Piagam logo failed:', e);
      }
    }

    // Nama Lembaga & Yayasan (Clean, modern uppercase)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(isPortrait ? 10.5 : 9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(lembaga.yayasan.toUpperCase(), width / 2, y, { align: 'center' });

    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isPortrait ? 17 : 15);
    doc.setTextColor(5, 150, 105);
    doc.text(lembaga.nama.toUpperCase(), width / 2, y, { align: 'center' });

    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(isPortrait ? 9 : 8);
    doc.setTextColor(100, 116, 139);
    const nstpqVal = lembaga.nstpq || lembaga.nspq || '-';
    doc.text(`NSTPQ: ${nstpqVal} · ${lembaga.alamat}`, width / 2, y, { align: 'center' });

    y += isPortrait ? 7 : 6;
    // Elegant separator line
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.4);
    doc.line(width / 2 - (isPortrait ? 60 : 75), y, width / 2 + (isPortrait ? 60 : 75), y);

    y += isPortrait ? 7.5 : 6;
    // Bismillah in Indonesian language (NO ARABIC)
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(isPortrait ? 10.5 : 9.5);
    doc.setTextColor(71, 85, 105);
    doc.text('"Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang"', width / 2, y, { align: 'center' });

    y += isPortrait ? 11 : 9;
    // Header Piagam - Modern & Minimalist
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isPortrait ? 24 : 21);
    doc.setTextColor(15, 23, 42);
    doc.text('PIAGAM PENGHARGAAN', width / 2, y, { align: 'center' });

    y += 5;
    doc.setFontSize(isPortrait ? 9.5 : 8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Nomor: ${piagam.nomorPiagam}`, width / 2, y, { align: 'center' });

    y += isPortrait ? 10 : 8;
    doc.setFontSize(isPortrait ? 11.5 : 10.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Diberikan dengan penuh rasa syukur dan bangga kepada:', width / 2, y, { align: 'center' });

    y += isPortrait ? 11 : 9;
    // NAMA SANTRI MENONJOL (Modern Clean Typography)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isPortrait ? 22 : 19);
    doc.setTextColor(5, 150, 105);
    doc.text(santri.namaLengkap.toUpperCase(), width / 2, y, { align: 'center' });

    // Underline accent
    const nameWidth = doc.getTextWidth(santri.namaLengkap.toUpperCase());
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.8);
    doc.line(width / 2 - nameWidth / 2 - 4, y + 2.5, width / 2 + nameWidth / 2 + 4, y + 2.5);

    y += isPortrait ? 10 : 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(isPortrait ? 10.5 : 9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`NIS: ${santri.nis}  ·  Kelas / Halaqoh: ${kelas?.namaKelas || '-'}`, width / 2, y, { align: 'center' });

    y += isPortrait ? 12 : 9;
    // Juara Badge Container - Clean Minimalist Box
    const badgeW = isPortrait ? 115 : 125;
    const badgeH = isPortrait ? 14 : 12.5;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(width / 2 - badgeW / 2, y - 2, badgeW, badgeH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isPortrait ? 14 : 12.5);
    const juaraColor = piagam.juara === 1 ? [217, 119, 6] : piagam.juara === 2 ? [71, 85, 105] : [180, 83, 9];
    doc.setTextColor(juaraColor[0], juaraColor[1], juaraColor[2]);
    doc.text(`SEBAGAI JUARA ${piagam.juara}`, width / 2, y + (isPortrait ? 6.5 : 6), { align: 'center' });

    y += badgeH + (isPortrait ? 7 : 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(isPortrait ? 11 : 10);
    doc.setTextColor(51, 65, 85);
    doc.text(
      `Atas pencapaian "${piagam.kategori}" dengan Nilai Rata-rata ${piagam.nilaiAkhir.toFixed(1)}`,
      width / 2,
      y,
      { align: 'center' }
    );
    y += 5;
    doc.text(`Tahun Pelajaran ${tahun?.tahun || '2025/2026'} · Semester ${piagam.semester}`, width / 2, y, { align: 'center' });

    // Signatures Section
    y = isPortrait ? height - 62 : height - 48;
    const tgl = piagam.tanggalTerbit || '20 Desember 2025';

    const sigLeft = isPortrait ? 48 : 58;
    const sigRight = width - (isPortrait ? 48 : 58);

    doc.setFontSize(isPortrait ? 9.5 : 8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Mengetahui / Menyetujui,', sigLeft, y, { align: 'center' });
    doc.text(`${lembaga.kotaPenerbitan}, ${tgl}`, sigRight, y, { align: 'center' });

    y += 4.5;
    doc.text('Wali Kelas / Halaqoh', sigLeft, y, { align: 'center' });
    doc.text(lembaga.jabatanPenandatangan, sigRight, y, { align: 'center' });

    y += isPortrait ? 18 : 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isPortrait ? 11.5 : 10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('( .................................... )', sigLeft, y, { align: 'center' });
    doc.text(`( ${lembaga.kepalaTpq} )`, sigRight, y, { align: 'center' });

    // Official Stamp space indicator
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('[ Cap Stempel Lembaga ]', sigRight, y - 7, { align: 'center' });

    // Footnote
    doc.setFontSize(8);
    doc.text(lembaga.footnote, width / 2, height - (outerMargin + 2), { align: 'center' });
  },

  // 2. Generate Piagam Juara 1, 2, 3 PDF (Single)
  async generatePiagamPDF(
    piagam: PiagamJuara,
    santri: Santri,
    kelas: Kelas | undefined,
    tahun: TahunPelajaran | undefined,
    lembaga: LembagaProfile,
    autoDownload = true,
    orientation: 'landscape' | 'portrait' = 'landscape'
  ): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    let logoData: string | null = null;
    if (lembaga.logoUrl) {
      logoData = await this.getBase64ImageFromUrl(lembaga.logoUrl);
    }

    this.renderPiagamPage(doc, piagam, santri, kelas, tahun, lembaga, orientation, logoData);

    if (autoDownload) {
      doc.save(`Piagam_Juara_${piagam.juara}_${santri.namaPanggilan}_${orientation}.pdf`);
    }

    return doc;
  },

  // 2b. Generate Batch / Multi-Page Piagam PDF
  async generateBatchPiagamPDF(
    targets: { piagam: PiagamJuara; santri: Santri; kelas?: Kelas; tahun?: TahunPelajaran }[],
    lembaga: LembagaProfile,
    orientation: 'landscape' | 'portrait' = 'landscape',
    filename?: string
  ): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    if (targets.length === 0) return doc;

    let logoData: string | null = null;
    if (lembaga.logoUrl) {
      logoData = await this.getBase64ImageFromUrl(lembaga.logoUrl);
    }

    targets.forEach((item, index) => {
      if (index > 0) {
        doc.addPage('a4', orientation);
      }
      this.renderPiagamPage(doc, item.piagam, item.santri, item.kelas, item.tahun, lembaga, orientation, logoData);
    });

    const defaultName = `Piagam_Massal_${targets[0]?.kelas?.namaKelas || 'Kelas'}_${orientation}.pdf`;
    doc.save(filename || defaultName);
    return doc;
  },

  // 3. Generate Leger Nilai & Ranking Kelas (A4 Landscape PDF)
  async generateLegerPDF(data: LegerPrintData, autoDownload = true): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const width = doc.internal.pageSize.getWidth(); // 297mm
    const height = doc.internal.pageSize.getHeight(); // 210mm
    const margin = 12;
    let y = 14;

    // Kop Lembaga
    if (data.lembaga.logoUrl) {
      const logo = await this.getBase64ImageFromUrl(data.lembaga.logoUrl);
      if (logo) {
        try {
          doc.addImage(logo, 'PNG', margin, y - 2, 16, 16);
        } catch (e) {
          console.warn('Logo error in leger:', e);
        }
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(data.lembaga.yayasan.toUpperCase(), width / 2, y, { align: 'center' });

    y += 4.5;
    doc.setFontSize(14);
    doc.setTextColor(5, 150, 105); // emerald
    doc.text(data.lembaga.nama.toUpperCase(), width / 2, y, { align: 'center' });

    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const nstpqLeger = data.lembaga.nstpq || data.lembaga.nspq || '-';
    doc.text(`NSTPQ: ${nstpqLeger}  ·  ${data.lembaga.alamat}, ${data.lembaga.kota}  ·  Telp: ${data.lembaga.telepon}`, width / 2, y, { align: 'center' });

    y += 3;
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.8);
    doc.line(margin, y, width - margin, y);

    y += 6;
    // Judul Leger
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('DAFTAR KUMPULAN NILAI & PERINGKAT SANTRI (LEGER NILAI)', width / 2, y, { align: 'center' });

    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Kelas / Halaqoh: ${data.kelas.namaKelas}   |   Wali / Pengampu: ${data.ustadz?.nama || '-'}   |   Tahun Pelajaran: ${data.tahun.tahun} (Semester ${data.semester})`,
      width / 2,
      y,
      { align: 'center' }
    );

    y += 5;

    // Build Table Columns dynamically based on active components
    const activeComps = data.komponenList.filter(k => k.isAktif).slice(0, 7); // max 7 components fit cleanly
    const compColWidth = Math.max(14, Math.min(22, Math.floor(95 / Math.max(activeComps.length, 1))));

    // Table Header
    const rowH = 6.5;
    doc.setFillColor(16, 185, 129); // emerald 500
    doc.rect(margin, y, width - margin * 2, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);

    let x = margin;
    doc.text('No', x + 3, y + 4.5);
    x += 8;
    doc.text('Rank', x + 3, y + 4.5);
    x += 14;
    doc.text('NIS', x + 3, y + 4.5);
    x += 18;
    doc.text('Nama Santri', x + 3, y + 4.5);
    x += 52;

    activeComps.forEach(comp => {
      const shortName = comp.nama.length > 10 ? comp.nama.substring(0, 9) + '.' : comp.nama;
      doc.text(shortName, x + compColWidth / 2, y + 4.5, { align: 'center' });
      x += compColWidth;
    });

    doc.text('Rata-rata', x + 9, y + 4.5, { align: 'center' });
    x += 18;
    doc.text('Predikat', x + 8, y + 4.5, { align: 'center' });
    x += 16;
    doc.text('Keterangan / Capaian', x + 4, y + 4.5);

    y += rowH;

    // Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    data.rankedData.forEach((item, idx) => {
      if (y > height - 38) return; // avoid overflow off-page
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, width - margin * 2, rowH, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, width - margin * 2, rowH, 'S');

      let rx = margin;
      doc.setTextColor(71, 85, 105);
      doc.text(String(idx + 1), rx + 3, y + 4.5);
      rx += 8;

      // Ranking with color for Top 3
      if (item.ranking === 1) {
        doc.setTextColor(217, 119, 6); // gold
        doc.setFont('helvetica', 'bold');
        doc.text(`★ 1`, rx + 3, y + 4.5);
      } else if (item.ranking === 2) {
        doc.setTextColor(71, 85, 105); // silver
        doc.setFont('helvetica', 'bold');
        doc.text(`★ 2`, rx + 3, y + 4.5);
      } else if (item.ranking === 3) {
        doc.setTextColor(180, 83, 9); // bronze
        doc.setFont('helvetica', 'bold');
        doc.text(`★ 3`, rx + 3, y + 4.5);
      } else {
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.text(String(item.ranking), rx + 5, y + 4.5);
      }
      rx += 14;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(item.santri.nis, rx + 3, y + 4.5);
      rx += 18;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(doc.splitTextToSize(item.santri.namaLengkap, 48)[0] || item.santri.namaLengkap, rx + 3, y + 4.5);
      rx += 52;

      // Scores for each component
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      activeComps.forEach(comp => {
        const compScore = item.calculation.items.find(it => it.komponenId === comp.id)?.nilai ?? 0;
        doc.text(String(compScore), rx + compColWidth / 2, y + 4.5, { align: 'center' });
        rx += compColWidth;
      });

      // Rata-rata
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(String(item.calculation.rataRata.toFixed(1)), rx + 9, y + 4.5, { align: 'center' });
      rx += 18;

      // Predikat
      doc.text(item.calculation.predikat, rx + 8, y + 4.5, { align: 'center' });
      rx += 16;

      // Keterangan
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(item.calculation.label || 'Tuntas', rx + 4, y + 4.5);

      y += rowH;
    });

    // Summary Statistics row
    const avgScores = data.rankedData.map(r => r.calculation.rataRata).filter(s => s > 0);
    const classAvg = avgScores.length > 0 ? (avgScores.reduce((a, b) => a + b, 0) / avgScores.length).toFixed(1) : '-';
    const maxScore = avgScores.length > 0 ? Math.max(...avgScores).toFixed(1) : '-';
    const minScore = avgScores.length > 0 ? Math.min(...avgScores).toFixed(1) : '-';

    y += 4;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, width - margin * 2, 7, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `STATISTIK KELAS:   Rata-rata Kelas: ${classAvg}   |   Nilai Tertinggi: ${maxScore}   |   Nilai Terendah: ${minScore}   |   Total Santri: ${data.rankedData.length}`,
      margin + 6,
      y + 4.8
    );

    // Signatures
    y = height - 30;
    const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const colLeft = margin + 35;
    const colRight = width - margin - 35;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Mengetahui / Menyetujui,', colLeft, y, { align: 'center' });
    doc.text(`${data.lembaga.kotaPenerbitan}, ${tgl}`, colRight, y, { align: 'center' });

    y += 4;
    doc.text('Wali Kelas / Halaqoh', colLeft, y, { align: 'center' });
    doc.text(data.lembaga.jabatanPenandatangan, colRight, y, { align: 'center' });

    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`( ${data.ustadz?.nama || 'Wali Kelas'} )`, colLeft, y, { align: 'center' });
    doc.text(`( ${data.lembaga.kepalaTpq} )`, colRight, y, { align: 'center' });

    // Footnote
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(data.lembaga.footnote, width / 2, height - 4, { align: 'center' });

    if (autoDownload) {
      doc.save(`Leger_Nilai_${data.kelas.namaKelas.replace(/\s+/g, '_')}_${data.semester}.pdf`);
    }

    return doc;
  }
};
