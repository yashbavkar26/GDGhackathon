import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen flex w-full bg-[#020b06] text-white overflow-hidden selection:bg-green-500/30 font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#020b06] to-[#010603] pointer-events-none" />
        
        <div className="relative z-10 flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl px-4 sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="text-white hover:bg-white/10" />
                <span className="text-sm font-display font-semibold text-white/90">CropGuard AI Portal</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative hover:bg-white/10 text-white/70 hover:text-white">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white/70 hover:text-white">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </header>
            <main className="flex-1 overflow-auto bg-transparent">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
