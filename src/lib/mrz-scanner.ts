import { MRZScanner, EnumDocumentSide, EnumMRZDocumentType, type MRZResult, type MRZData } from 'dynamsoft-mrz-scanner';
import type { MRZData as AppMRZData } from '@/types';

const LICENSE_KEY = import.meta.env.VITE_DYNAMSOFT_LICENSE as string | undefined;

export function isMRZScannerAvailable(): boolean {
  return !!LICENSE_KEY;
}

function mrzDateToString(date: { year: number; month: number; day: number }): string {
  const y = String(date.year).padStart(2, '0');
  const m = String(date.month).padStart(2, '0');
  const d = String(date.day).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function mapMRZData(data: MRZData): AppMRZData {
  const docType = data.documentType;
  let documentType = 'P';
  if (docType === 'td1_id' || docType === 'td2_id') {
    documentType = 'I';
  }

  const firstName = data.firstName ?? '';
  const lastName = data.lastName ?? '';
  const name = [lastName, firstName].filter(Boolean).join(', ').trim() || [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    documentType,
    documentNumber: data.documentNumber ?? '',
    name,
    nationality: data.nationality ?? '',
    dateOfBirth: data.dateOfBirth ? mrzDateToString(data.dateOfBirth) : '',
    expiryDate: data.dateOfExpiry ? mrzDateToString(data.dateOfExpiry) : '',
    gender: data.sex ?? '',
    issuingState: data.issuingState ?? '',
  };
}

export async function scanDocument(
  container: HTMLElement
): Promise<{ mrz: AppMRZData | null; rectifiedImage: string | null } | null> {
  if (!LICENSE_KEY) return null;

  const scanner = new MRZScanner({
    license: LICENSE_KEY,
    mrzFormatType: [EnumMRZDocumentType.Passport, EnumMRZDocumentType.TD1, EnumMRZDocumentType.TD2],
    returnDocumentImage: true,
    returnOriginalImage: false,
    returnPortraitImage: false,
    container,
    engineResourcePaths: {
      dcvBundle: '/dynamsoft-capture-vision-bundle-dist/',
      dcvData: '/dynamsoft-capture-vision-data/',
    },
    scannerViewConfig: {
      showLoadImageButton: true,
      showFormatSelector: true,
      enableScanRegion: true,
    },
  });

  const result: MRZResult = await scanner.launch();

  scanner.dispose();

  if (result.status !== undefined && result.status !== 0) {
    return null;
  }

  if (!result.data) {
    return null;
  }

  const mrz = mapMRZData(result.data);

  let rectifiedImage: string | null = null;
  const docImage = result.getDocumentImage(EnumDocumentSide.MRZ);
  if (docImage) {
    const canvas = docImage.toCanvas();
    rectifiedImage = canvas.toDataURL('image/jpeg', 0.92);
  }

  return { mrz, rectifiedImage };
}
