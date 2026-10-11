import { useState, useEffect } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { StepHeader, NavButtons } from '@/components/StepShell';
import type { CustomerAddress } from '@/types';
import {
  validateAddress,
  hasErrors,
  getCountryList,
  detectDefaultCountry,
  isSwissCountry,
} from '@/lib/address';

interface AddressFormProps {
  address: CustomerAddress;
  onChange: (addr: CustomerAddress) => void;
  onBack: () => void;
  onNext: () => void;
}

export function AddressForm({ address, onChange, onBack, onNext }: AddressFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerAddress, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerAddress, boolean>>>({});

  useEffect(() => {
    if (!address.country) {
      const detected = detectDefaultCountry();
      if (!isSwissCountry(detected)) {
        onChange({ ...address, country: detected });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (field: keyof CustomerAddress, value: string) => {
    const updated = { ...address, [field]: value };
    onChange(updated);
    if (touched[field] || field === 'country') {
      const fieldErrors = validateAddress(updated);
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const handleBlur = (field: keyof CustomerAddress) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validateAddress(address);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const handleNext = () => {
    const allErrors = validateAddress(address);
    setErrors(allErrors);
    const allTouched: Partial<Record<keyof CustomerAddress, boolean>> = {};
    (Object.keys(address) as (keyof CustomerAddress)[]).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);
    if (!hasErrors(allErrors)) {
      onNext();
    }
  };

  const countryList = getCountryList();
  const isSwiss = isSwissCountry(address.country);

  return (
    <div className="animate-slide-right">
      <StepHeader
        title="Your Address"
        subtitle="Required for the Swiss VAT export refund. Residence must be outside Switzerland."
        icon={<MapPin className="h-5 w-5" />}
      />

      <div className="space-y-4">
        <div>
          <label className="input-label">Full Name *</label>
          <input
            type="text"
            value={address.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            className="input-field"
            placeholder="Jane Doe"
          />
          {touched.fullName && errors.fullName && <p className="input-error">{errors.fullName}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="input-label">Street *</label>
            <input
              type="text"
              value={address.street}
              onChange={(e) => update('street', e.target.value)}
              onBlur={() => handleBlur('street')}
              className="input-field"
              placeholder="Main Street"
            />
            {touched.street && errors.street && <p className="input-error">{errors.street}</p>}
          </div>
          <div>
            <label className="input-label">No. *</label>
            <input
              type="text"
              value={address.houseNumber}
              onChange={(e) => update('houseNumber', e.target.value)}
              onBlur={() => handleBlur('houseNumber')}
              className="input-field"
              placeholder="42"
            />
            {touched.houseNumber && errors.houseNumber && (
              <p className="input-error">{errors.houseNumber}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Postal Code *</label>
            <input
              type="text"
              value={address.postalCode}
              onChange={(e) => update('postalCode', e.target.value)}
              onBlur={() => handleBlur('postalCode')}
              className="input-field"
              placeholder="10115"
            />
            {touched.postalCode && errors.postalCode && (
              <p className="input-error">{errors.postalCode}</p>
            )}
          </div>
          <div>
            <label className="input-label">City *</label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => update('city', e.target.value)}
              onBlur={() => handleBlur('city')}
              className="input-field"
              placeholder="Berlin"
            />
            {touched.city && errors.city && <p className="input-error">{errors.city}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">State / Region</label>
            <input
              type="text"
              value={address.stateRegion}
              onChange={(e) => update('stateRegion', e.target.value)}
              className="input-field"
              placeholder="Berlin"
            />
          </div>
          <div>
            <label className="input-label">Country *</label>
            <select
              value={address.country}
              onChange={(e) => update('country', e.target.value)}
              onBlur={() => handleBlur('country')}
              className="input-field appearance-none"
            >
              <option value="">Select...</option>
              {countryList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            {touched.country && errors.country && (
              <p className="input-error">{errors.country}</p>
            )}
          </div>
        </div>

        {isSwiss && (
          <div className="flex items-start gap-2.5 rounded-xl bg-warning-500/10 border border-warning-500/30 p-3.5">
            <AlertCircle className="h-4 w-4 text-warning-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-warning-300 leading-relaxed">
              Swiss residents do not qualify for VAT export refunds. The customer must reside
              outside Switzerland.
            </p>
          </div>
        )}

        <div>
          <label className="input-label">Phone Number *</label>
          <input
            type="tel"
            value={address.phone}
            onChange={(e) => update('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className="input-field"
            placeholder="+49 30 12345678"
          />
          {touched.phone && errors.phone && <p className="input-error">{errors.phone}</p>}
        </div>

        <div>
          <label className="input-label">Email *</label>
          <input
            type="email"
            value={address.email}
            onChange={(e) => update('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className="input-field"
            placeholder="jane.doe@example.com"
            autoCapitalize="off"
            autoCorrect="off"
          />
          {touched.email && errors.email && <p className="input-error">{errors.email}</p>}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}
