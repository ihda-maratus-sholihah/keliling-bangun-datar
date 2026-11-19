export const DEFAULT_CLASS_OPTIONS: string[] = [
  'Kelas 3A',
  'Kelas 3B',
  'Kelas 4A',
  'Kelas 4B',
  'Kelas 5A',
  'Kelas 5B',
];

export function mergeClassOptions(customClasses: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const item of [...DEFAULT_CLASS_OPTIONS, ...customClasses]) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(trimmed);
    }
  }
  return merged;
}

export type AddClassResult =
  | { ok: true; value: string; updatedCustom: string[] }
  | { ok: false; error: string };

export function validateAndAddClass(
  customClasses: string[],
  rawInput: string
): AddClassResult {
  const trimmed = rawInput.trim().replace(/\s+/g, ' ');
  if (trimmed.length < 2) {
    return {
      ok: false,
      error: 'Nama kelas minimal 2 karakter (contoh: Kelas 4C atau 6A).',
    };
  }
  if (trimmed.length > 30) {
    return {
      ok: false,
      error: 'Nama kelas terlalu panjang (maksimal 30 karakter).',
    };
  }

  // Normalize bare alphanumeric like "4C" -> "Kelas 4C" only if user didn't already include "kelas"
  const normalized = /^kelas\b/i.test(trimmed)
    ? trimmed.replace(/^kelas/i, 'Kelas')
    : /^\d+[a-zA-Z]?$/.test(trimmed)
    ? `Kelas ${trimmed.toUpperCase()}`
    : trimmed;

  const existingAll = mergeClassOptions(customClasses);
  const exists = existingAll.some(
    (item) => item.toLowerCase() === normalized.toLowerCase()
  );

  if (exists) {
    return {
      ok: false,
      error: `"${normalized}" sudah ada di daftar kelas.`,
    };
  }

  return {
    ok: true,
    value: normalized,
    updatedCustom: [...customClasses, normalized],
  };
}
