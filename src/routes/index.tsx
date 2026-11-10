import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Microscope, MessagesSquare, ArrowRight, Clock, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SetupNotice } from "@/components/app/shared";
import { useAISettings } from "@/lib/ai";
import { useActivity, type ActivityKind } from "@/lib/activity";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "AI Workplace Productivity Assistant — Dashboard" },
    { name: "description", content: "Write emails, research faster and get workplace answers with your AI productivity assistant." },
    { property: "og:title", content: "AI Workplace Productivity Assistant" },
    { property: "og:description", content: "Write emails, research faster and get workplace answers with your AI productivity assistant." },
  ] }),
  component: Dashboard,
});

const FEATURES = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Tone-matched, context-specific emails ready to send." },
  { to: "/research", icon: Microscope, title: "AI Research Assistant", desc: "Summaries, key findings and actionable recommendations." },
  { to: "/chat", icon: MessagesSquare, title: "Workplace Chatbot", desc: "Brainstorm, plan and solve problems in conversation." },
] as const;
const ICON: Record<ActivityKind, typeof Mail> = { email: Mail, research: Microscope, chat: MessagesSquare };
const QUICK = [
  { to: "/email", label: "Draft a follow-up email" },
  { to: "/research", label: "Summarise an article" },
  { to: "/chat", label: "Plan my week" },
] as const;

function ago(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? "just now" : m < 60 ? `${m}m ago` : `${Math.round(m / 60)}h ago`;
}

function Dashboard() {
  const { configured, ready } = useAISettings();
  const activity = useActivity();
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-hero p-6 md:p-10">
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary"><Zap className="size-3" />Your AI co-worker</p>
        <h1 className="max-w-2xl text-3xl font-semibold md:text-5xl">Welcome back. Let's get <span className="text-gradient">more done</span> today.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Write sharper emails, digest research in minutes, and talk through any workplace challenge.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {QUICK.map((q) => <Button key={q.label} asChild variant="outline" size="sm" className="rounded-full bg-background/40"><Link to={q.to}>{q.label}<ArrowRight /></Link></Button>)}
        </div>
      </section>

      {ready && !configured && <SetupNotice />}

      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow">
            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><f.icon className="size-5" /></div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">Open <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-semibold"><Clock className="size-4 text-primary" />Recent activity</h2>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No activity yet this session. Your generated emails, research and chats will show up here.</p>
          ) : (
            <ul className="divide-y">
              {activity.map((a) => { const I = ICON[a.kind]; return (
                <li key={a.id}><Link to={`/${a.kind}`} className="flex items-center gap-3 py-3 hover:text-primary">
                  <span className="grid size-8 place-items-center rounded-lg bg-muted text-primary"><I className="size-4" /></span>
                  <span className="flex-1 truncate text-sm">{a.title}</span>
                  <span className="text-xs text-muted-foreground">{ago(a.at)}</span>
                </Link></li>); })}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><ShieldAlert className="size-4 text-primary" />Responsible AI</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• AI-generated content may contain inaccuracies — always review before professional use.</li>
            <li>• Don't submit confidential, personal or client information.</li>
            <li>• Your work stays in this browser session; prompts go only to Google Gemini.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
