import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletButton } from "@/components/wallet-button";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import HistoryPage from "@/pages/history";
import AlertsPage from "@/pages/alerts";
import SettingsPage from "@/pages/settings";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between h-14 px-4 border-b bg-background shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <WalletButton />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const [location] = useLocation();

  if (location === "/") {
    return <LandingPage />;
  }

  if (location.startsWith("/dashboard")) {
    return (
      <DashboardLayout>
        <Switch>
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/dashboard/history" component={HistoryPage} />
          <Route path="/dashboard/alerts" component={AlertsPage} />
          <Route path="/dashboard/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    );
  }

  return <NotFound />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
