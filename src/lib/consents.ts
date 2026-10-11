import type { ConsentItem } from '@/types';

export function createDefaultConsents(): ConsentItem[] {
  return [
    {
      id: 'consent-1',
      title: 'Consent 1',
      description: '[Placeholder — replace with actual consent text before production use.]',
      required: true,
      accepted: false,
      acceptedAt: null,
    },
    {
      id: 'consent-2',
      title: 'Consent 2',
      description: '[Placeholder — replace with actual consent text before production use.]',
      required: true,
      accepted: false,
      acceptedAt: null,
    },
    {
      id: 'consent-3',
      title: 'Consent 3',
      description: '[Placeholder — replace with actual consent text before production use.]',
      required: false,
      accepted: false,
      acceptedAt: null,
    },
    {
      id: 'consent-customs',
      title: 'Customs Export Declaration',
      description:
        'I confirm that the data and signature I have provided will be used to generate a Swiss customs export document, and that my signature is legally binding for this purpose.',
      required: true,
      accepted: false,
      acceptedAt: null,
    },
  ];
}

export function allRequiredAccepted(consents: ConsentItem[]): boolean {
  return consents.filter((c) => c.required).every((c) => c.accepted);
}

export function remainingRequiredCount(consents: ConsentItem[]): number {
  return consents.filter((c) => c.required && !c.accepted).length;
}
