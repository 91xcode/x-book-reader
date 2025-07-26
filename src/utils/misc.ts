export const uniqueId = () => Math.random().toString(36).substring(2, 9);

// Simple MD5 hash implementation using crypto API
export const md5 = async (content: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data); // Using SHA-256 as substitute
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
};

// Synchronous version for compatibility
export const md5Sync = (content: string): string => {
  // Simple hash using built-in string methods for immediate use
  let hash = 0;
  if (content.length === 0) return hash.toString();
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

export const getContentMd5 = (content: unknown): string => {
  return md5Sync(JSON.stringify(content));
};

export const makeSafeFilename = (filename: string, replacement = '_'): string => {
  // Windows restricted characters + control characters and reserved names
  const unsafeCharacters = /[<>:"\/\\|?*\x00-\x1F]/g;
  const reservedFilenames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
  // Unsafe to use filename including file extensions over 255 bytes on Android
  const maxFilenameBytes = 250;

  let safeName = filename.replace(unsafeCharacters, replacement);

  if (reservedFilenames.test(safeName)) {
    safeName = `${safeName}${replacement}`;
  }

  const encoder = new TextEncoder();
  let utf8Bytes = encoder.encode(safeName);

  while (utf8Bytes.length > maxFilenameBytes) {
    safeName = safeName.slice(0, -1);
    utf8Bytes = encoder.encode(safeName);
  }

  return safeName;
}; 