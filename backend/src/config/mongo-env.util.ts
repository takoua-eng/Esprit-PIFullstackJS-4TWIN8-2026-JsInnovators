import { ConfigService } from '@nestjs/config';

/**
 * Reads env even if `.env` has a stray leading space on the key (e.g. ` MONGODB_URI=`).
 * That typo makes `ConfigService.get('MONGODB_URI')` undefined and the app falls back to localhost.
 */
export function readEnvTrimmed(
  config: ConfigService,
  key: string,
): string | undefined {
  const candidates = [
    config.get<string>(key),
    process.env[key],
    process.env[` ${key}`],
  ];
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return undefined;
}

/**
 * Atlas strings from the UI often look like `...mongodb.net/?retryWrites=...` with no DB path.
 * Inserts `/dbname` before `?` so the driver targets the same database as Compass.
 */
export function ensureDatabasePathInUri(
  uri: string,
  dbName: string | undefined,
): string {
  if (!dbName || !uri.includes('mongodb.net')) return uri;
  if (/\.mongodb\.net\/[^/?]+\?/.test(uri)) return uri;
  return uri.replace(/(\.mongodb\.net)\/(\?)/, `$1/${encodeURIComponent(dbName)}$2`);
}
