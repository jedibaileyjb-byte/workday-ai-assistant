import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PageHeader, SetupNotice, Disclaimer, OutputPanel } from "@/components/app/shared";
import { callAI, useAISettings } from "@/lib/ai";
import { logActivity, useSessionState } from "@/lib/activity";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [
    { title: "Smart Email Generator — Workplace AI" },
    { name: "description", content: "Generate professional, tone-matched workplace emails in seconds." },
    { property: "og:title", content: "Smart Email Generator — Workplace AI" },
    { property: "og:description", content: "Generate professional, tone-matched workplace emails in seconds." },
  ] }),
  component: EmailPage,
});

const TONES = {
  Formal: "Formal: polished, respectful, concise, no slang or exclamation marks.",
  Friendly: "Friendly: warm, approachable and conversational while remaining professional.",
  Persuasive: "Persuasive: confident, benefit-focused, addresses objections, ends with a clear call to action.",
} as const;
type Tone = keyof typeof TONES;

function EmailPage() {
  const { configured, ready } = useAISettings();
  const [form, setForm] = useSessionState("awpa.email.form", { recipient: "", subject: "", purpose: "", context: "", tone: "Formal" as Tone });
  const [output, setOutput] = useSessionState("awpa.email.out", "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(true);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function generate() {
    if (!form.purpose.trim()) { setError("Please describe the purpose of the email."); return; }
    setLoading(true); setError(null);
    try {
      const text = await callAI([
        { role: "system", content: "You are an expert business communication writer. Write a complete, ready-to-send email that is specific to the details given — never generic filler. Format: first line 'Subject: ...', blank line, then greeting, body (short paragraphs), and sign-off with a [Your Name] placeholder. Do not invent facts like dates, figures or names not provided; use clear [placeholders] instead. Return only the email." },
        { role: "user", content: `Tone — ${TONES[form.tone]}\nRecipient: ${form.recipient || "not specified"}\nSubject: ${form.subject || "suggest a clear subject"}\nPurpose: ${form.purpose}\nAdditional context: ${form.context || "none"}` },
      ]);
      setOutput(text);
      logActivity("email", form.subject || form.purpose);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <>
      <PageHeader icon={<Mail />} title="Smart Email Generator" desc="Describe what you need — get a polished, context-aware email." />
      {ready && !configured && <SetupNotice />}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="space-y-2">
            <Label>Tone</Label>
            <ToggleGroup type="single" variant="outline" value={form.tone} onValueChange={(v) => v && setForm({ ...form, tone: v as Tone })} className="w-full">
              {(Object.keys(TONES) as Tone[]).map((t) => <ToggleGroupItem key={t} value={t} className="flex-1 data-[state=on]:bg-primary/15 data-[state=on]:text-primary">{t}</ToggleGroupItem>)}
            </ToggleGroup>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="r">Recipient</Label><Input id="r" placeholder="e.g. Sarah, Head of Finance" value={form.recipient} onChange={set("recipient")} /></div>
            <div className="space-y-2"><Label htmlFor="s">Subject</Label><Input id="s" placeholder="Optional" value={form.subject} onChange={set("subject")} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="p">Purpose *</Label><Textarea id="p" rows={3} placeholder="e.g. Request approval for Q3 software budget increase" value={form.purpose} onChange={set("purpose")} /></div>
          <div className="space-y-2"><Label htmlFor="c">Additional context</Label><Textarea id="c" rows={4} placeholder="Key points, deadlines, background…" value={form.context} onChange={set("context")} /></div>
          <Button variant="hero" className="w-full" onClick={generate} disabled={loading || !configured}><Send />Generate email</Button>
          <Disclaimer />
        </div>
        <OutputPanel output={output} setOutput={setOutput} loading={loading} error={error} editing={editing} setEditing={setEditing}
          onRegenerate={generate} canRegenerate={!!output && configured} emptyIcon={<Mail className="size-5" />} emptyText="Your generated email will appear here, ready to edit and copy." />
      </div>
    </>
  );
}
