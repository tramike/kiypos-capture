import { supabase } from './supabase';
import type { EncryptedPayload } from './crypto';
import type { SubmissionResponse, DeviceType } from '@/types';

const EDGE_FUNCTION_PATH = 'submit-payload';

export async function submitEncryptedPayload(
  encrypted: EncryptedPayload,
  deviceType: DeviceType
): Promise<SubmissionResponse> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${EDGE_FUNCTION_PATH}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...encrypted,
      deviceType,
    }),
  });

  if (!response.ok) {
    let reason = `Request failed (${response.status})`;
    try {
      const errorBody = await response.json();
      if (errorBody?.error) reason = errorBody.error;
    } catch {
      /* response had no JSON body */
    }
    return { status: 'rejected', reason };
  }

  const body = await response.json();

  if (!body || typeof body.status !== 'string') {
    return { status: 'rejected', reason: 'Invalid response from server' };
  }

  return body as SubmissionResponse;
}
