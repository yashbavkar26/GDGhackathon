import { AdminLayout } from "@/components/AdminLayout";
import { MobileFrame } from "@/components/MobileFrame";
import { Leaf, Camera, Bell, MapPin, Cloud, ChevronRight, Shield } from "lucide-react";
import logo from "@/assets/logo.png";

const quickActions = [
  { icon: Camera, label: "Scan Crop", color: "bg-primary text-primary-foreground" },
  { icon: MapPin, label: "Report Pest", color: "bg-warning text-warning-foreground" },
  { icon: Cloud, label: "Weather", color: "bg-info text-info-foreground" },
  { icon: Bell, label: "Alerts", color: "bg-destructive text-destructive-foreground" },
];

const alerts = [
  { title: "Leaf Blight Alert", desc: "High risk in your region due to humidity", time: "1h ago", severity: "high" },
  { title: "Treatment Reminder", desc: "Apply Neem Oil spray on rice paddy", time: "3h ago", severity: "medium" },
  { title: "Weather Advisory", desc: "Heavy rain expected — protect crops", time: "5h ago", severity: "low" },
];

export default function AppHome() {
  return (
    <AdminLayout>
      <MobileFrame>
        <div className="px-5 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="CropGuard" className="w-8 h-8" />
              <div>
                <p className="text-xs text-muted-foreground">Good morning,</p>
                <p className="text-sm font-display font-bold">Ramesh Kumar</p>
              </div>
            </div>
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
            </div>
          </div>

          {/* Hero card */}
          <div className="gradient-hero rounded-2xl p-5 mt-2 text-primary-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5" />
              <span className="text-xs font-semibold opacity-80">CROP HEALTH STATUS</span>
            </div>
            <p className="text-2xl font-display font-bold">85% Healthy</p>
            <p className="text-xs opacity-70 mt-1">3 of 20 plots need attention</p>
            <div className="mt-3 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary-foreground/80 rounded-full" style={{ width: "85%" }} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {quickActions.map((a) => (
              <button key={a.label} className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.color}`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{a.label}</span>
              </button>
            ))}
          </div>

          {/* Recent alerts */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-display font-semibold">Recent Alerts</span>
              <span className="text-xs text-primary font-medium">View all</span>
            </div>
            <div className="space-y-2.5">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className={`w-2 h-8 rounded-full ${a.severity === "high" ? "bg-destructive" : a.severity === "medium" ? "bg-warning" : "bg-success"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* My plots */}
          <div className="mt-6">
            <span className="text-sm font-display font-semibold">My Plots</span>
            <div className="mt-3 space-y-2">
              {[
                { name: "Rice Paddy — Block A", status: "Healthy", icon: Leaf, statusColor: "text-success" },
                { name: "Wheat Field — Block B", status: "At Risk", icon: Leaf, statusColor: "text-warning" },
                { name: "Cotton — Block C", status: "Infected", icon: Leaf, statusColor: "text-destructive" },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <p.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className={`text-xs font-semibold ${p.statusColor}`}>{p.status}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </MobileFrame>
    </AdminLayout>
  );
}
