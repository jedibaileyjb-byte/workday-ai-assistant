import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { KeyRound, ShieldAlert, Copy, RefreshCw, Pencil, Eye, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PageHeader({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center">
      <KeyRound className="size-5 shrink-0 text-primary" />
      <p className="flex-1 text-sm">
        <span className="font-semibold">Connect an AI provider to start.</span>{" "}
        <span className="text-muted-foreground">This app shows only real AI responses — no simulated output. Add your API key in Settings.</span>
      </p>
      <Button asChild variant="hero" size="sm"><Link to="/settings">Open Settings</Link></Button>
    </div>
  );
}

export function Disclaimer() {
  return (
    <div className="flex gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
      <ShieldAlert className="size-4 shrink-0 text-primary" />
      <p>AI output may be inaccurate or incomplete — review before professional use. Don't paste confidential, personal or client data.</p>
    </div>
  );
}

export function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => toast.success("Copied to clipboard"), () => toast.error("Copy failed"));
}

export function OutputPanel(props: {
  output: string; setOutput: (s: string) => void; loading: boolean; error: string | null;
  editing: boolean; setEditing: (b: boolean) => void; onRegenerate: () => void;
  emptyIcon: ReactNode; emptyText: string; markdown?: boolean; canRegenerate: boolean;
}) {
  const { output, setOutput, loading, error, editing, setEditing, onRegenerate, markdown } = props;
  return (
    <div className="flex min-h-[420px] flex-col rounded-2xl border bg-card">
      <div className="flex items-center gap-1 border-b px-4 py-2.5">
        <span className="mr-auto text-sm font-medium">Output</span>
        {output && !loading && (
          <>
            {markdown && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>
                {editing ? <Eye /> : <Pencil />}{editing ? "Preview" : "Edit"}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => copyText(output)}><Copy />Copy</Button>
          </>
        )}
        {props.canRegenerate && (
          <Button size="sm" variant="ghost" onClick={onRegenerate} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} />Regenerate</Button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />Generating…
          </div>
        ) : error ? (
          <div className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" /><span>{error}</span>
          </div>
        ) : !output ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
            <div className="grid size-12 place-items-center rounded-full bg-muted text-primary">{props.emptyIcon}</div>
            <p className="max-w-xs">{props.emptyText}</p>
          </div>
        ) : markdown && !editing ? (
          <div className="prose-ai text-sm"><ReactMarkdown>{output}</ReactMarkdown></div>
        ) : (
          <Textarea value={output} onChange={(e) => setOutput(e.target.value)} className="min-h-[360px] flex-1 resize-y border-0 bg-transparent p-0 text-sm leading-relaxed focus-visible:ring-0" />
        )}
      </div>
    </div>
  );
}
