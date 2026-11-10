import { useEffect, useState } from "react";

export type ActivityKind = "email" | "research" | "chat";
export interface Activity { id: string; kind: ActivityKind; title: string; at: number }
const KEY = "awpa.activity";
const EVT = "awpa:activity";

export function logActivity(kind: ActivityKind, title: string) {
  const list: Activity[] = JSON.parse(sessionStorage.getItem(KEY) || "[]");
  list.unshift({ id: crypto.randomUUID(), kind, title: title.slice(0, 80), at: Date.now() });
  sessionStorage.setItem(KEY, JSON.stringify(list.slice(0, 12)));
  window.dispatchEvent(new Event(EVT));
}

export function useActivity() {
  const [list, setList] = useState<Activity[]>([]);
  useEffect(() => {
    const sync = () => setList(JSON.parse(sessionStorage.getItem(KEY) || "[]"));
    sync();
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, []);
  return list;
}

/** sessionStorage-backed state, read after hydration. */
export function useSessionState<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try { const raw = sessionStorage.getItem(key); if (raw) setVal(JSON.parse(raw)); } catch { /* ignore */ }
    setLoaded(true);
  }, [key]);
  useEffect(() => { if (loaded) sessionStorage.setItem(key, JSON.stringify(val)); }, [key, val, loaded]);
  return [val, setVal] as const;
}
