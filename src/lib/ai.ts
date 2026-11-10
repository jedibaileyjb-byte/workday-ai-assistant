import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";

export type Provider = "gemini";
export interface AISettings { provider: Provider; apiKey: string; model: string }
export interface ChatMsg { role: "system" | "user" | "assistant"; content: string }

export const FREE_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
export const PROVIDERS: Record<Provider, { label: string; defaultModel: string; keyUrl: string }> = {
  gemini: { label: "Google Gemini", defaultModel: "gemini-2.5-flash", keyUrl: "https://aistudio.google.com/app/apikey" },
};

const KEY = "awpa.gemini.settings";
const EVT = "awpa:settings";
const DEFAULT: AISettings = { provider: "gemini", apiKey: "", model: PROVIDERS.gemini.defaultModel };

export function loadSettings(): AISettings {
  if (typeof window === "undefined") return DEFAULT;
  try { return { ...DEFAULT, ...JSON.parse(sessionStorage.getItem(KEY) || "{}"), provider: "gemini" }; } catch { return DEFAULT; }
}
export function saveSettings(s: AISettings) {
  sessionStorage.setItem(KEY, JSON.stringify({ ...s, provider: "gemini" }));
  window.dispatchEvent(new Event(EVT));
}

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => { setSettings(loadSettings()); setReady(true); };
    sync();
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, []);
  return { settings, ready, configured: !!settings.apiKey.trim() };
}

export function friendlyGeminiError(e: unknown): string {
  const raw = (e as Error)?.message || String(e);
  const m = raw.toLowerCase();
  if (m.includes("429") || m.includes("resource_exhausted") || m.includes("quota") || m.includes("rate"))
    return "Gemini free-tier quota or rate limit reached. Wait a minute and try again, or check your usage in Google AI Studio.";
  if (m.includes("api key not valid") || m.includes("api_key_invalid") || m.includes("401") || m.includes("403") || m.includes("permission"))
    return "Your Gemini API key was rejected. Please check it in Settings.";
  if (m.includes("404") || m.includes("not found")) return "That Gemini model isn't available for your key. Choose another model in Settings.";
  if (m.includes("503") || m.includes("overloaded") || m.includes("unavailable")) return "Gemini is busy right now. Please try again in a moment.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Couldn't reach Gemini. Check your internet connection.";
  return raw.length > 220 ? "Gemini request failed. Please try again." : raw;
}

export async function callAI(messages: ChatMsg[], signal?: AbortSignal): Promise<string> {
  const s = loadSettings();
  if (!s.apiKey) throw new Error("No Gemini API key connected. Add one in Settings.");
  const ai = new GoogleGenAI({ apiKey: s.apiKey });
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const contents = messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  let text: string | undefined;
  try {
    const res = await ai.models.generateContent({
      model: s.model || PROVIDERS.gemini.defaultModel,
      contents,
      config: { ...(system ? { systemInstruction: system } : {}), temperature: 0.7, ...(signal ? { abortSignal: signal } : {}) },
    });
    text = res.text;
  } catch (e) {
    if ((e as Error).name === "AbortError" || signal?.aborted) throw e;
    throw new Error(friendlyGeminiError(e));
  }
  if (!text?.trim()) throw new Error("Gemini returned an empty response (it may have been blocked by safety filters). Try rephrasing.");
  return text.trim();
}
