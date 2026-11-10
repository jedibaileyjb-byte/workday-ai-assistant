import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings, Eye, EyeOff, ExternalLink, Save, Trash2, ShieldCheck, Loader2, CheckCircle2, XCircle, CircleDashed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/app/shared";
import { loadSettings, saveSettings, PROVIDERS, FREE_MODELS, callAI, type AISettings } from "@/lib/ai";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Workplace AI" },
    { name: "description", content: "Connect your Google Gemini API key." },
    { property: "og:title", content: "Settings — Workplace AI" },
    { property: "og:description", content: "Connect your Google Gemini API key." },
  ] }),
  component: SettingsPage,
});

type Status = { kind: "idle" | "testing" | "ok" | "error"; msg?: string };

function SettingsPage() {
  const [s, setS] = useState<AISettings>({ provider: "gemini", apiKey: "", model: PROVIDERS.gemini.defaultModel });
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  useEffect(() => setS(loadSettings()), []);
  const p = PROVIDERS.gemini;

  async function saveAndTest() {
    saveSettings(s);
    if (!s.apiKey) { setStatus({ kind: "idle" }); toast.success("Settings saved"); return; }
    setStatus({ kind: "testing" });
    try { await callAI([{ role: "user", content: "Reply with the single word: OK" }]); setStatus({ kind: "ok" }); toast.success("Connected to Gemini"); }
    catch (e) { const msg = (e as Error).message; setStatus({ kind: "error", msg }); toast.error(msg); }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader icon={<Settings />} title="Settings" desc="Connect Google Gemini using your own free API key." />
      <div className="space-y-5 rounded-2xl border bg-card p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between"><Label htmlFor="k">Gemini API key</Label>
            <a href={p.keyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">Get a free key <ExternalLink className="size-3" /></a></div>
          <div className="flex gap-2">
            <Input id="k" type={show ? "text" : "password"} autoComplete="off" placeholder="AIza…" value={s.apiKey} onChange={(e) => { setS({ ...s, apiKey: e.target.value.trim() }); setStatus({ kind: "idle" }); }} />
            <Button variant="outline" size="icon" onClick={() => setShow(!show)} aria-label="Toggle key visibility">{show ? <EyeOff /> : <Eye />}</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Model (free tier)</Label>
          <Select value={s.model} onValueChange={(v) => setS({ ...s, model: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{FREE_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div role="status" className="flex items-center gap-2 text-sm">
          {status.kind === "testing" && <><Loader2 className="size-4 animate-spin text-primary" /><span>Testing connection…</span></>}
          {status.kind === "ok" && <><CheckCircle2 className="size-4 text-primary" /><span>Connected to Gemini ({s.model})</span></>}
          {status.kind === "error" && <><XCircle className="size-4 shrink-0 text-destructive" /><span className="text-destructive">{status.msg}</span></>}
          {status.kind === "idle" && <><CircleDashed className="size-4 text-muted-foreground" /><span className="text-muted-foreground">{s.apiKey ? "Key entered — save & test to check the connection" : "Not connected"}</span></>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="hero" onClick={saveAndTest} disabled={status.kind === "testing"}>{status.kind === "testing" ? <Loader2 className="animate-spin" /> : <Save />}{status.kind === "testing" ? "Testing…" : "Save & test"}</Button>
          <Button variant="outline" onClick={() => { const n = { ...s, apiKey: "" }; setS(n); saveSettings(n); setStatus({ kind: "idle" }); toast("API key removed"); }}><Trash2 />Remove key</Button>
        </div>
        <div className="flex gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          <p>Your key is kept only for this browser tab session (cleared when you close it) and sent directly to Google. Free-tier keys have usage limits; if you hit them, wait a minute and try again.</p>
        </div>
      </div>
    </div>
  );
}
