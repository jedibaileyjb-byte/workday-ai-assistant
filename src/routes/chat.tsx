import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessagesSquare, ArrowUp, Bot, Copy, RotateCcw, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, SetupNotice, copyText } from "@/components/app/shared";
import { callAI, useAISettings, type ChatMsg } from "@/lib/ai";
import { logActivity, useSessionState } from "@/lib/activity";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [
    { title: "Workplace Chat — Workplace AI" },
    { name: "description", content: "Chat with an AI assistant for writing, brainstorming, planning and problem-solving." },
    { property: "og:title", content: "Workplace Chat — Workplace AI" },
    { property: "og:description", content: "Chat with an AI assistant for writing, brainstorming, planning and problem-solving." },
  ] }),
  component: ChatPage,
});

const SYSTEM = "You are a senior workplace productivity advisor. Help with workplace questions, writing, brainstorming, planning and problem-solving. Give contextual, detailed, practical answers tailored to what the user said earlier in the conversation. Use Markdown with headings or lists where useful. Ask a brief clarifying question when the request is ambiguous. Never fabricate facts; flag uncertainty. Remind users not to share confidential information if they appear to.";
const SUGGESTIONS = ["Help me plan my week around 3 big deadlines", "Brainstorm ideas to improve team meetings", "How do I give constructive feedback to a peer?", "Draft an agenda for a project kickoff"];

function ChatPage() {
  const { configured, ready } = useAISettings();
  const [msgs, setMsgs] = useSessionState<ChatMsg[]>("awpa.chat", []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  useEffect(() => { if (!loading) inputRef.current?.focus(); }, [loading]);

  async function run(history: ChatMsg[]) {
    setMsgs(history); setLoading(true); setError(null);
    try {
      const reply = await callAI([{ role: "system", content: SYSTEM }, ...history.slice(-20)]);
      setMsgs([...history, { role: "assistant", content: reply }]);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }
  function send(text = input) {
    const t = text.trim();
    if (!t || loading || !configured) return;
    setInput("");
    if (!msgs.length) logActivity("chat", t);
    run([...msgs, { role: "user", content: t }]);
  }
  function regenerate() {
    const last = msgs[msgs.length - 1]?.role === "assistant" ? msgs.slice(0, -1) : msgs;
    if (last.length) run(last);
  }

  return (
    <>
      <div className="flex items-start gap-2">
        <div className="flex-1"><PageHeader icon={<MessagesSquare />} title="Workplace Chat" desc="Your assistant for writing, planning and problem-solving. History is kept for this session." /></div>
        {msgs.length > 0 && <Button variant="ghost" size="sm" onClick={() => { setMsgs([]); setError(null); }}><Trash2 />Clear</Button>}
      </div>
      {ready && !configured && <SetupNotice />}
      <div className="flex h-[calc(100vh-17rem)] min-h-[460px] flex-col rounded-2xl border bg-card">
        <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
          {msgs.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow"><Bot className="size-7" /></div>
              <p className="text-sm text-muted-foreground">Ask anything about your work. Try one of these:</p>
              <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => <button key={s} disabled={!configured} onClick={() => send(s)} className="rounded-xl border bg-muted/40 p-3 text-left text-sm transition hover:border-primary/40 hover:bg-accent disabled:opacity-50">{s}</button>)}
              </div>
            </div>
          )}
          {msgs.map((m, i) => m.role === "user" ? (
            <div key={i} className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div></div>
          ) : (
            <div key={i} className="group flex gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Bot className="size-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="prose-ai text-sm"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                <div className="mt-1 flex gap-1 opacity-60 transition group-hover:opacity-100">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => copyText(m.content)}><Copy />Copy</Button>
                  {i === msgs.length - 1 && <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={regenerate} disabled={loading || !configured}><RotateCcw />Regenerate</Button>}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3"><div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Bot className="size-4" /></div>
              <div className="flex items-center gap-1 pt-2">{[0, 1, 2].map((d) => <span key={d} className="size-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${d * 150}ms` }} />)}</div></div>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" /><span className="flex-1">{error}</span>
              <Button size="sm" variant="ghost" onClick={regenerate}>Retry</Button>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t p-3">
          <div className="flex items-end gap-2 rounded-xl border bg-background/50 p-2 focus-within:border-primary/50">
            <Textarea ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={configured ? "Message your assistant… (Shift+Enter for new line)" : "Add an API key in Settings to start chatting"}
              disabled={!configured} className="max-h-40 min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0" />
            <Button size="icon" variant="hero" onClick={() => send()} disabled={!input.trim() || loading || !configured} aria-label="Send"><ArrowUp /></Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">AI can make mistakes. Verify important information and avoid sharing confidential data.</p>
        </div>
      </div>
    </>
  );
}
