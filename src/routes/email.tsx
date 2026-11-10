import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Copy, RefreshCw, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Disclaimer, copyText } from "@/components/app/shared";
import { callAI, useAISettings } from "@/lib/ai";
import { logActivity, useSessionState } from "@/lib/activity";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [
    { title: "Smart Email Generator — Workplace AI" },
    { name: "description", content: "Generate professional, tone-matched workplace emails in seconds." },
    { property: "og:title", content: "Smart Email Generator — Workplace AI" },
    { property: "og:description", content: "Generate professional, tone-matched workplace emails in seconds." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: EmailPage,
});

const TONES = {
  Formal: "Formal: polished, respectful, concise, no slang or exclamation marks.",
  Friendly: "Friendly: warm, approachable and conversational while remaining professional.",
  Persuasive: "Persuasive: confident, benefit-focused, addresses objections, ends with a clear call to action.",
} as const;
type Tone = keyof typeof TONES;

export function EmailPage() {
  const { configured } = useAISettings();
  const [form, setForm] = useSessionState("awpa.email.form", { recipient: "", subject: "", purpose: "", context: "", tone: "Formal" as Tone });
  const [output, setOutput] = useSessionState("awpa.email.out", "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Fold saved details into the single brief so existing drafts remain available.
  const brief = [form.recipient && `Recipient: ${form.recipient}`, form.subject && `Subject: ${form.subject}`, form.purpose, form.context].filter(Boolean).join("\n\n");

  async function generate() {
    if (!configured) { setError("No AI provider connected. Add your API key in Settings to generate an email."); return; }
    if (!brief.trim()) { setError("Please describe what the email is about."); return; }
    setLoading(true); setError(null);
    try {
      const text = await callAI([
        { role: "system", content: "You are an expert business communication writer. Write a complete, ready-to-send email that is specific to the details given — never generic filler. Format: first line 'Subject: ...', blank line, then greeting, body (short paragraphs), and sign-off with a [Your Name] placeholder. Do not invent facts like dates, figures or names not provided; use clear [placeholders] instead. Return only the email." },
        { role: "user", content: `Tone — ${TONES[form.tone]}\nEmail brief: ${brief}` },
      ]);
      setOutput(text);
      logActivity("email", brief);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <header className="mb-5">
          <h1 className="text-xl font-semibold">Smart Email Generator</h1>
          <p className="mt-1 text-sm text-muted-foreground">Draft a professional email in seconds</p>
        </header>
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void generate(); }}>
            <div className="space-y-2">
              <Label htmlFor="email-brief">What is the email about?</Label>
              <Textarea id="email-brief" rows={6} className="min-h-36 resize-y" placeholder="Request approval for the Q3 software budget. Include the recipient, key points, and any deadlines…" value={brief} onChange={(event) => setForm({ ...form, purpose: event.target.value, recipient: "", subject: "", context: "" })} />
            </div>
            <ToggleGroup aria-label="Email tone" type="single" variant="outline" size="sm" value={form.tone} onValueChange={(v) => v && setForm({ ...form, tone: v as Tone })} className="justify-start gap-2">
              {(Object.keys(TONES) as Tone[]).map((t) => <ToggleGroupItem key={t} value={t} className="rounded-md px-3 data-[state=on]:bg-primary/15 data-[state=on]:text-primary">{t}</ToggleGroupItem>)}
            </ToggleGroup>
            <Button type="submit" variant="hero" disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="animate-spin" /> : <Send />}{loading ? "Generating…" : "Generate Email"}
            </Button>
            {error && <div role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></div>}
          </form>
          <div className="mt-6 space-y-3 border-t pt-5">
            <Label htmlFor="generated-email">Generated email</Label>
            <Textarea id="generated-email" rows={10} className="min-h-60 resize-y leading-relaxed" value={output} onChange={(event) => setOutput(event.target.value)} readOnly={loading} aria-busy={loading} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => copyText(output)} disabled={!output || loading}><Copy />Copy</Button>
              <Button size="sm" variant="outline" onClick={generate} disabled={!output || loading}><RefreshCw />Regenerate</Button>
              <Button size="sm" variant="ghost" onClick={() => { setOutput(""); setError(null); }} disabled={(!output && !error) || loading}><Trash2 />Clear</Button>
            </div>
          </div>
        </div>
        <div className="mt-4"><Disclaimer /></div>
      </div>
    </>
  );
}
