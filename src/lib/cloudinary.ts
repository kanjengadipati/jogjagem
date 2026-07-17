interface SignedUploadParams {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}

export async function getSignedParams(folder?: string): Promise<SignedUploadParams> {
  const res = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
