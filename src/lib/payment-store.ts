import { useSyncExternalStore } from "react";

export type FailureReason =
  | "server_issue"
  | "incorrect_pin"
  | "bank_issue"
  | "insufficient_funds";

export const FAILURE_REASONS: { id: FailureReason; label: string; detail: string }[] = [
  { id: "server_issue", label: "Server issue", detail: "We're unable to reach the server. Please try again." },
  { id: "incorrect_pin", label: "Incorrect UPI PIN", detail: "The UPI PIN you entered is incorrect." },
  { id: "bank_issue", label: "Bank issue", detail: "Your bank is currently facing issues. Try again later." },
  { id: "insufficient_funds", label: "Insufficient funds", detail: "You don't have enough balance for this transaction." },
];

export interface PaymentSettings {
  outcome: "success" | "failure";
  failureReason: FailureReason;
  merchantName: string;
  merchantUpi: string;
  merchantImage: string; // data URL or remote URL
  userName: string;
  userBank: string;
  userAccountMasked: string;
  processingDelayMs: number;
}

const DEFAULT: PaymentSettings = {
  outcome: "success",
  failureReason: "incorrect_pin",
  merchantName: "Cafe Mocha",
  merchantUpi: "cafemocha@ybl",
  merchantImage: "",
  userName: "Aarav Sharma",
  userBank: "HDFC Bank",
  userAccountMasked: "XXXX1234",
  processingDelayMs: 1800,
};

const KEY = "ppay.settings.v1";

function load(): PaymentSettings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

let state: PaymentSettings = DEFAULT;
let initialized = false;
const listeners = new Set<() => void>();

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    state = load();
    initialized = true;
  }
}

export function getSettings(): PaymentSettings {
  ensureInit();
  return state;
}

export function setSettings(patch: Partial<PaymentSettings>) {
  ensureInit();
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((l) => l());
}

export function resetSettings() {
  state = DEFAULT;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSettings(): PaymentSettings {
  return useSyncExternalStore(subscribe, getSettings, () => DEFAULT);
}

// Per-transaction draft (in-memory) ------------------------------------------
export interface TxDraft {
  amount: number;
  note: string;
  merchantName: string;
  merchantUpi: string;
  merchantImage: string;
}

let draft: TxDraft = { amount: 0, note: "", merchantName: "", merchantUpi: "", merchantImage: "" };
export function setDraft(d: Partial<TxDraft>) { draft = { ...draft, ...d }; }
export function getDraft(): TxDraft { return draft; }
