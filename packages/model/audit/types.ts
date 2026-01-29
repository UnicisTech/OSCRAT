export type CRUD = 'c' | 'r' | 'u' | 'd';

export interface AuditUser {
  id: string;
  name?: string | null;
}

export interface AuditTeam {
  id: string;
  name: string;
}

export interface AuditTarget {
  id: string;
  name: string;
  type: string;
}

export interface AuditEvent {
  action: string;
  crud: CRUD;
  user: AuditUser;
  team: AuditTeam;
  target: AuditTarget;
  productId?: string;
  versionId?: string;
  metadata?: Record<string, string>;
}

export type AuditLogger = (event: AuditEvent) => Promise<void>;

export interface AuditInfo {
  user: AuditUser;
  team: AuditTeam;
  productId?: string;
  versionId?: string;
}

export interface AuditContext {
  user: AuditUser;
  team: AuditTeam;
  productId?: string;
  versionId?: string;
  log: AuditLogger;
}
