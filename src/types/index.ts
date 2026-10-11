export type DeviceType = 'phone' | 'tablet';

export type StepId =
  | 'qr-scan'
  | 'welcome'
  | 'address'
  | 'consents'
  | 'document'
  | 'signature'
  | 'review'
  | 'submitting'
  | 'success'
  | 'error';

export interface CustomerAddress {
  fullName: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  stateRegion: string;
  country: string;
  phone: string;
  email: string;
}

export interface ConsentItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  accepted: boolean;
  acceptedAt: string | null;
}

export interface MRZData {
  documentType: string;
  documentNumber: string;
  name: string;
  nationality: string;
  dateOfBirth: string;
  expiryDate: string;
  gender: string;
  issuingState: string;
}

export interface SessionInfo {
  keyId: string;
  encryptionKey: string;
  stationLabel: string | null;
  transactionRef: string | null;
  purchaseTotal: string | null;
  goodsDescription: string | null;
}

export interface CapturedImages {
  rectifiedDocumentImage: string | null;
  originalFrameImage: string | null;
  signatureImage: string | null;
}

export interface SubmissionPayload {
  customer: CustomerAddress;
  consents: ConsentItem[];
  mrzData: MRZData | null;
  rectifiedDocumentImage: string | null;
  signatureImage: string | null;
  keyId: string;
  submittedAt: string;
  deviceType: DeviceType;
}

export interface SubmissionResponse {
  status: 'accepted' | 'rejected';
  exportDocRef?: string;
  crmRef?: string;
  reason?: string;
}
