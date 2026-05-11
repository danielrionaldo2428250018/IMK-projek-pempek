/**
 * Username + password utama (disimpan lokal di perangkat).
 */

import { clearSession } from "./session";

const MASTER_KEY = "pempek_novi_master_auth_v1";
const LEGACY_CRED_KEY = "pempek_novi_credentials_v1";
const LEGACY_AUTH_KEY = "pempek_novi_auth_v1";

export type MasterAuthFile = {
  username: string;
  masterPassword: string;
};

const DEFAULT_USERNAME = "admin";
const DEFAULT_MASTER = "admin";

function defaultFile(): MasterAuthFile {
  return { username: DEFAULT_USERNAME, masterPassword: DEFAULT_MASTER };
}

type ParsedAuth = Partial<MasterAuthFile> & { displayName?: string };

function migrateFromLegacy(): MasterAuthFile | null {
  try {
    const raw = localStorage.getItem(LEGACY_CRED_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as { passwords?: Record<string, string> };
    const adminPass = j?.passwords?.admin;
    if (typeof adminPass === "string" && adminPass.length > 0) {
      let username = DEFAULT_USERNAME;
      try {
        const a = JSON.parse(localStorage.getItem(LEGACY_AUTH_KEY) || "{}") as { username?: string };
        if (typeof a.username === "string" && a.username.trim()) username = a.username.trim();
      } catch {
        /* ignore */
      }
      return { masterPassword: adminPass, username };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function normalizeFromJson(j: ParsedAuth): MasterAuthFile | null {
  const pass =
    typeof j.masterPassword === "string" && j.masterPassword.length > 0 ? j.masterPassword : null;
  if (!pass) return null;
  let username = DEFAULT_USERNAME;
  if (typeof j.username === "string" && j.username.trim()) username = j.username.trim();
  else if (typeof j.displayName === "string" && j.displayName.trim()) username = j.displayName.trim();
  return { masterPassword: pass, username };
}

export function loadMasterAuth(): MasterAuthFile {
  try {
    const raw = localStorage.getItem(MASTER_KEY);
    if (raw) {
      const j = JSON.parse(raw) as ParsedAuth;
      const n = normalizeFromJson(j);
      if (n) {
        if ("displayName" in j && !("username" in j && typeof j.username === "string" && j.username.trim())) {
          saveMasterAuth(n);
        }
        return n;
      }
    }
  } catch {
    /* ignore */
  }
  const migrated = migrateFromLegacy();
  if (migrated) {
    saveMasterAuth(migrated);
    return migrated;
  }
  return defaultFile();
}

export function saveMasterAuth(f: MasterAuthFile) {
  localStorage.setItem(
    MASTER_KEY,
    JSON.stringify({
      masterPassword: f.masterPassword,
      username: f.username.trim() || DEFAULT_USERNAME,
    }),
  );
}

export function verifyCredentials(username: string, password: string): boolean {
  const u = username.trim();
  const p = password;
  if (!u || !p) return false;
  const f = loadMasterAuth();
  return f.username === u && f.masterPassword === p;
}

export function verifyMasterPassword(candidate: string): boolean {
  const f = loadMasterAuth();
  return f.masterPassword === candidate;
}

export function setMasterPassword(newPassword: string) {
  const f = loadMasterAuth();
  f.masterPassword = newPassword;
  saveMasterAuth(f);
}

export function getUsername(): string {
  return loadMasterAuth().username;
}

export function setUsername(name: string) {
  const f = loadMasterAuth();
  f.username = name.trim() || DEFAULT_USERNAME;
  saveMasterAuth(f);
}

/** Reset username & password ke bawaan, hapus file legacy, tutup sesi. */
export function clearAllCredentials() {
  localStorage.removeItem(LEGACY_CRED_KEY);
  localStorage.removeItem(LEGACY_AUTH_KEY);
  saveMasterAuth(defaultFile());
  clearSession();
}
