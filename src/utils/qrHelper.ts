import QRCode from 'qrcode';
import { Santri, TahunPelajaran } from '../types';

export interface ValidationPayload {
  nis: string;
  nama: string;
  tahun: string;
  semester: string;
  kelas: string;
  verifyCode: string;
}

/**
 * Generate verification URL and QR code data URL for student Rapor
 */
export const generateRaporQRDataUrl = async (
  santri: Santri,
  tahun: TahunPelajaran,
  semester: string,
  kelasNama: string
): Promise<string> => {
  // Hash code simulation for document verification
  const verifyCode = `ADZ-${tahun.tahun.replace('/', '')}-${semester[0]}-${santri.nis}`;
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://tpq-aladzkiyaa.edu';
  
  const validationUrl = `${origin}/?verify=rapor&nis=${encodeURIComponent(santri.nis)}&nama=${encodeURIComponent(santri.namaLengkap)}&tahun=${encodeURIComponent(tahun.tahun)}&sem=${encodeURIComponent(semester)}&kelas=${encodeURIComponent(kelasNama)}&code=${encodeURIComponent(verifyCode)}`;

  try {
    const dataUrl = await QRCode.toDataURL(validationUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
};
