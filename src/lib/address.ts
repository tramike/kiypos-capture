import type { CustomerAddress } from '@/types';

export function createEmptyAddress(): CustomerAddress {
  return {
    fullName: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    stateRegion: '',
    country: '',
    phone: '',
    email: '',
  };
}

const SWISS_COUNTRY_CODES = ['CH', 'CHE', 'SUI', 'SWITZERLAND', 'SCHWEIZ'];

export function isSwissCountry(country: string): boolean {
  const normalized = country.trim().toUpperCase();
  return SWISS_COUNTRY_CODES.includes(normalized);
}

interface CountryEntry {
  code: string;
  name: string;
}

const COUNTRY_LIST: CountryEntry[] = [
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'CN', name: 'China' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TR', name: 'Türkiye' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'VN', name: 'Vietnam' },
];

export function getCountryList(): CountryEntry[] {
  return COUNTRY_LIST;
}

export function detectDefaultCountry(): string {
  const lang = navigator.language || 'en-US';
  const parts = lang.split('-');
  if (parts.length >= 2) {
    const code = parts[1].toUpperCase();
    if (COUNTRY_LIST.some((c) => c.code === code)) {
      return code;
    }
  }
  return 'DE';
}

export function validateAddress(addr: CustomerAddress): Partial<Record<keyof CustomerAddress, string>> {
  const errors: Partial<Record<keyof CustomerAddress, string>> = {};

  if (!addr.fullName.trim()) errors.fullName = 'Full name is required';
  if (!addr.street.trim()) errors.street = 'Street is required';
  if (!addr.houseNumber.trim()) errors.houseNumber = 'House number is required';
  if (!addr.postalCode.trim()) errors.postalCode = 'Postal code is required';
  if (!addr.city.trim()) errors.city = 'City is required';
  if (!addr.country.trim()) errors.country = 'Country is required';
  else if (isSwissCountry(addr.country))
    errors.country = 'Swiss residents do not qualify for VAT export refunds. The customer must reside outside Switzerland.';

  if (!addr.phone.trim()) errors.phone = 'Phone number is required';
  if (!addr.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email)) errors.email = 'Please enter a valid email address';

  return errors;
}

export function hasErrors(errors: Partial<Record<keyof CustomerAddress, string>>): boolean {
  return Object.keys(errors).length > 0;
}
