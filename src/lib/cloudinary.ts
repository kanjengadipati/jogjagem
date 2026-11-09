interface SignedUploadParams {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}

import { auth } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.jogjagem.com';

export async function getSignedParams(folder?: string): Promise<SignedUploadParams> {
  const token = auth.getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/cloudinary/sign`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ folder }),
  });
  if (!res.ok) throw new Error('Failed to get upload signature');
  return res.json();
}

export async function uploadToCloudinary(
  file: File,
  folder?: string,
): Promise<{ url: string; public_id: string }> {
  const params = await getSignedParams(folder);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', params.api_key);
  formData.append('timestamp', String(params.timestamp));
  formData.append('signature', params.signature);
  formData.append('folder', params.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${params.cloud_name}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!res.ok) throw new Error('Cloudinary upload failed');

  const data = await res.json();
  return { url: data.secure_url, public_id: data.public_id };
}
