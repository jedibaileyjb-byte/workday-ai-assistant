import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Microscope, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, SetupNotice, Disclaimer, OutputPanel } from "@/components/app/shared";
import { callAI, useAISettings } from "@/lib/ai";
import { logActivity, useSessionState } from "@/lib/activity";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [
    { title: "AI Research Assistant — Workplace AI" },
    { name: "description", content: "Turn topics and articles into structured summaries, findings and recommendations." },
    { property: "og:title", content: "AI Research Assistant — Workplace AI" },
    { property: "og:description", content: "Turn topics and articles into structured summaries, findings and recommendations." },
  ] }),
  component: ResearchPage,
});

function ResearchPage() {
  const { configured, ready } = useAISettings();
  const [form, setForm] = useSessionState("awpa.research.form", { topic: "", article: "", url: "" });
  const [output, setOutput] = useSessionState("awpa.research.out", "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  async function generate() {
    if (!form.topic.trim() && !form.article.trim() && !form.url.trim()) { setError("Enter a topic, paste an article, or add a URL."); return; }
    setLoading(true); setError(null); setEditing(false);
    try {
      const text = await callAI([
        { role: "system", content: "You are a senior research analyst for business professionals. Produce a rigorous, specific analysis in Markdown with exactly these sections: ## Summary (3-5 sentences), ## Key Findings (bulleted, specific), ## Insights (implications, patterns, risks), ## Actionable Recommendations (numbered, concrete next steps), ## Caveats (limitations, what to verify). Base the analysis on provided material when given; clearly flag anything from general knowledge. You cannot open web links — if only a URL is supplied, say so and analyse only what the URL itself implies, recommending the user paste the content." },
        { role: "user", content: `Topic / question: ${form.topic || "(derive from material)"}\nURL: ${form.url || "none"}\nPasted material:\n${form.article || "none"}` },
      ]);
      setOutput(text);
      logActivity("research", form.topic || form.url || form.article.slice(0, 60));
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <>
      <PageHeader icon={<Microscope />} title="AI Research Assistant" desc="Get structured summaries, findings, insights and next steps." />
      {ready && !configured && <SetupNotice />}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="space-y-2"><Label htmlFor="t">Research topic or question</Label><Input id="t" placeholder="e.g. Impact of hybrid work on team productivity" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="u">Website URL</Label><Input id="u" type="url" placeholder="https://…" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            <p className="text-xs text-muted-foreground">The AI can't open links — paste the article text below for an accurate analysis.</p></div>
          <div className="space-y-2"><Label htmlFor="a">Pasted article or notes</Label><Textarea id="a" rows={9} placeholder="Paste article text, report excerpts, meeting notes…" value={form.article} onChange={(e) => setForm({ ...form, article: e.target.value })} /></div>
          <Button variant="hero" className="w-full" onClick={generate} disabled={loading || !configured}><Sparkle />Analyse</Button>
          <Disclaimer />
        </div>
        <OutputPanel markdown output={output} setOutput={setOutput} loading={loading} error={error} editing={editing} setEditing={setEditing}
          onRegenerate={generate} canRegenerate={!!output && configured} emptyIcon={<Microscope className="size-5" />} emptyText="Your structured research brief will appear here." />
      </div>
    </>
  );
}
