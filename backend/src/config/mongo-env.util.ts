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

/** Default DB when `MONGODB_DB_NAME` is unset — keep in sync with Compass (e.g. `test`, not `medifollow`). */
export const DEFAULT_MONGODB_DB_NAME = 'test';

/**
 * Forces the connection to use `dbName` so collections (e.g. `alerts`) read/write the same DB as Compass.
 * - Atlas: `...mongodb.net/?` → insert `/dbname`; `...mongodb.net/medifollow?` → replace with `/dbname`
 * - Local: `mongodb://host:port/olddb` → `/dbname`
 */
export function ensureDatabasePathInUri(
  uri: string,
  dbName: string | undefined,
): string {
  const name = dbName?.trim();
  if (!name) return uri;
  const enc = encodeURIComponent(name);

  if (uri.includes('mongodb.net')) {
    if (/\.mongodb\.net\/\?/.test(uri)) {
      return uri.replace(/(\.mongodb\.net)\/(\?)/, `$1/${enc}$2`);
    }
    const m = uri.match(/^(.+mongodb\.net)\/([^/?]+)(\?.*)?$/i);
    if (m && m[2] && !m[2].includes('=')) {
      return `${m[1]}/${enc}${m[3] ?? ''}`;
    }
    return uri;
  }

  const local = uri.match(/^(mongodb:\/\/[^/?]+)\/([^/?]*)(\?.*)?$/i);
  if (local) {
    return `${local[1]}/${enc}${local[3] ?? ''}`;
  }
  return uri;
}
