/**
 * Converts a Base64 string into a Blob
 * @param base64 Base64 encoded string
 * @param contentType MIME type (e.g. application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
 */
export function base64ToBlob(
  base64: string,
  contentType: string
): Blob {

  // Remove data URL prefix if present
  const cleanBase64 = base64.includes(',')
    ? base64.substring(base64.indexOf(',') + 1)
    : base64;

  const byteCharacters = atob(cleanBase64);
  const byteLength = byteCharacters.length;
  const byteArray = new Uint8Array(byteLength);

  for (let i = 0; i < byteLength; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }

  return new Blob([byteArray], { type: contentType });
}

/**
 * Triggers browser download for a Blob
 * @param blob File blob
 * @param fileName Name of the file to download
 */
export function downloadBlob(
  blob: Blob,
  fileName: string
): void {

  if (!blob) {
    console.error('downloadBlob: Blob is null or undefined');
    return;
  }

  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
