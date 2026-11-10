import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, Mail, Microscope, MessagesSquare, Settings, Workflow, KeyRound, CheckCircle2 } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarFooter,
} from "@/components/ui/sidebar";
import { useAISettings, PROVIDERS } from "@/lib/ai";

const nav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Research Assistant", url: "/research", icon: Microscope },
  { title: "Workplace Chat", url: "/chat", icon: MessagesSquare },
] as const;

function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-1 py-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
            <Workflow className="size-4" />
          </span>
          <span className="truncate font-display text-sm font-semibold group-data-[collapsible=icon]:hidden">Workplace AI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((n) => (
                <SidebarMenuItem key={n.url}>
                  <SidebarMenuButton asChild isActive={path === n.url} tooltip={n.title}>
                    <Link to={n.url}><n.icon /><span>{n.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={path === "/settings"} tooltip="Settings">
              <Link to="/settings"><Settings /><span>Settings</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { settings, configured, ready } = useAISettings();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur md:px-6">
            <SidebarTrigger />
            <span className="font-display text-sm font-medium text-muted-foreground max-sm:hidden">AI Workplace Productivity Assistant</span>
            <div className="ml-auto">
              {ready && (
                <Link to="/settings" className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${configured ? "border-primary/30 text-primary" : "border-destructive/40 text-destructive"}`}>
                  {configured ? <CheckCircle2 className="size-3.5" /> : <KeyRound className="size-3.5" />}
                  {configured ? `${PROVIDERS[settings.provider].label} connected` : "Add API key"}
                </Link>
              )}
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
          <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
            AI-generated content may contain inaccuracies — review before professional use. Do not submit confidential workplace information.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
