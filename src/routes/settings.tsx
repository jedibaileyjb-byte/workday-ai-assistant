import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings, Eye, EyeOff, ExternalLink, Save, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/app/shared";
import { loadSettings, saveSettings, PROVIDERS, callAI, type AISettings, type Provider } from "@/lib/ai";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Workplace AI" },
    { name: "description", content: "Connect your AI provider API key." },
    { property: "og:title", content: "Settings — Workplace AI" },
    { property: "og:description", content: "Connect your AI provider API key." },
  ] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [s, setS] = useState<AISettings>({ provider: "openai", apiKey: "", model: "" });
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  useEffect(() => setS(loadSettings()), []);
  const p = PROVIDERS[s.provider];

  async function saveAndTest() {
    saveSettings(s);
    if (!s.apiKey) { toast.success("Settings saved"); return; }
    setTesting(true);
    try { await callAI([{ role: "user", content: "Reply with the single word: OK" }]); toast.success("Connected — your key works"); }
    catch (e) { toast.error((e as Error).message); }
    finally { setTesting(false); }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader icon={<Settings />} title="Settings" desc="Connect an AI provider using your own API key." />
      <div className="space-y-5 rounded-2xl border bg-card p-5">
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={s.provider} onValueChange={(v) => setS({ ...s, provider: v as Provider, model: PROVIDERS[v as Provider].defaultModel })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{(Object.keys(PROVIDERS) as Provider[]).map((k) => <SelectItem key={k} value={k}>{PROVIDERS[k].label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between"><Label htmlFor="k">API key</Label>
            <a href={p.keyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">Get a {p.label} key <ExternalLink className="size-3" /></a></div>
          <div className="flex gap-2">
            <Input id="k" type={show ? "text" : "password"} autoComplete="off" placeholder="sk-…" value={s.apiKey} onChange={(e) => setS({ ...s, apiKey: e.target.value.trim() })} />
            <Button variant="outline" size="icon" onClick={() => setShow(!show)} aria-label="Toggle key visibility">{show ? <EyeOff /> : <Eye />}</Button>
          </div>
        </div>
        <div className="space-y-2"><Label htmlFor="m">Model</Label><Input id="m" value={s.model} placeholder={p.defaultModel} onChange={(e) => setS({ ...s, model: e.target.value })} /></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="hero" onClick={saveAndTest} disabled={testing}><Save />{testing ? "Testing…" : "Save & test"}</Button>
          <Button variant="outline" onClick={() => { const n = { ...s, apiKey: "" }; setS(n); saveSettings(n); toast("API key removed"); }}><Trash2 />Remove key</Button>
        </div>
        <div className="flex gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          <p>Your key is stored only in this browser and sent directly to {p.label}. Anyone using this browser can see it — use a key with spending limits and remove it on shared devices.</p>
        </div>
      </div>
    </div>
  );
}
