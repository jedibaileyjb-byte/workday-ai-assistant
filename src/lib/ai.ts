import { useEffect, useState } from "react";

export type Provider = "openai" | "openrouter" | "groq";
export interface AISettings { provider: Provider; apiKey: string; model: string }
export interface ChatMsg { role: "system" | "user" | "assistant"; content: string }

export const PROVIDERS: Record<Provider, { label: string; url: string; defaultModel: string; keyUrl: string }> = {
  openai: { label: "OpenAI", url: "https://api.openai.com/v1/chat/completions", defaultModel: "gpt-4o-mini", keyUrl: "https://platform.openai.com/api-keys" },
  openrouter: { label: "OpenRouter", url: "https://openrouter.ai/api/v1/chat/completions", defaultModel: "openai/gpt-4o-mini", keyUrl: "https://openrouter.ai/keys" },
  groq: { label: "Groq", url: "https://api.groq.com/openai/v1/chat/completions", defaultModel: "llama-3.3-70b-versatile", keyUrl: "https://console.groq.com/keys" },
};

const KEY = "awpa.settings";
const EVT = "awpa:settings";
const DEFAULT: AISettings = { provider: "openai", apiKey: "", model: PROVIDERS.openai.defaultModel };

export function loadSettings(): AISettings {
  if (typeof window === "undefined") return DEFAULT;
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return DEFAULT; }
}
export function saveSettings(s: AISettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(EVT));
}

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => { setSettings(loadSettings()); setReady(true); };
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return { settings, ready, configured: !!settings.apiKey.trim() };
}

export async function callAI(messages: ChatMsg[], signal?: AbortSignal): Promise<string> {
  const s = loadSettings();
  if (!s.apiKey) throw new Error("No API key configured. Add one in Settings.");
  const p = PROVIDERS[s.provider];
  let res: Response;
  try {
    res = await fetch(p.url, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.apiKey}` },
      body: JSON.stringify({ model: s.model || p.defaultModel, messages, temperature: 0.7 }),
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new Error("Couldn't reach the AI service. Check your internet connection.");
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const j = await res.json(); msg = j?.error?.message || msg; } catch { /* ignore */ }
    if (res.status === 401) msg = "Your API key was rejected. Please check it in Settings.";
    if (res.status === 429) msg = "Rate limit or quota reached. Wait a moment or check your provider billing.";
    throw new Error(msg);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("The AI returned an empty response. Try again.");
  return String(text).trim();
}
