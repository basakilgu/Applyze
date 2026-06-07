// types/database.ts
export type StageKey =
  | "applied"
  | "screening"
  | "interview"
  | "manager"
  | "offer"
  | "rejected";

export type Platform =
  | "linkedin"
  | "kariyer"
  | "youthall"
  | "anbean"
  | "other";

export interface Stage {
  id: string;
  name: string;
  key: StageKey;
  order: number;
  is_terminal: boolean;
  is_default: boolean;
  color?: string;
}

export interface Note {
  id: string;
  application_id: string;
  content: string;
  created_at: string;
}

export interface StageHistoryEntry {
  id: string;
  application_id: string;
  stage_key: StageKey;
  stage_name: string;
  changed_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  location?: string;
  platform: Platform;
  source_url?: string;
  current_stage: StageKey;
  stage_history: StageHistoryEntry[];
  notes: Note[];
  applied_at: string;
  updated_at: string;
  deleted_at?: string;
  is_favorite?: boolean;
  fit_score?: number;
  fit?: { skor: number; guven: string; eslesme: string[]; eksikler: string[]; ats: string[]; vurgu: string[] };
  fit_basis?: string;
  fit_at?: string;
  reminder_at?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  notifications_enabled: boolean;
  silent_mode: boolean;
}
