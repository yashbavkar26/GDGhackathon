import { AdminLayout } from "@/components/AdminLayout";
import { MobileFrame } from "@/components/MobileFrame";
import { ArrowLeft, Bell, AlertTriangle, Cloud, Pill, MapPin } from "lucide-react";

const alerts = [
  {
    type: "outbreak",
    icon: AlertTriangle,
    title: "Leaf Blight Outbreak",
    desc: "New outbreak detected 5km from your farm. Take preventive measures immediately.",
    time: "30 min ago",
    color: "bg-destructive/10 text-destructive",
    iconColor: "text-destructive",
  },
  {
    type: "weather",
    icon: Cloud,
    title: "Heavy Rain Warning",
    desc: "72h continuous rain expected. Risk of fungal infection increases to 85%.",
    time: "2h ago",
    color: "bg-info/10 text-info",
    iconColor: "text-info",
  },
  {
    type: "treatment",
    icon: Pill,
    title: "Treatment Due Today",
    desc: "Apply Neem Oil spray (5ml/L) on Rice Paddy — Block A. Last applied 7 days ago.",
    time: "6h ago",
    color: "bg-primary/10 text-primary",
    iconColor: "text-primary",
  },
  {
    type: "spread",
    icon: MapPin,
    title: "Pest Spread Alert",
    desc: "Bollworm detected in neighboring district. Expected to reach your area in 5-7 days.",
    time: "1 day ago",
    color: "bg-warning/10 text-warning",
    iconColor: "text-warning",
  },
  {
    type: "treatment",
    icon: Pill,
    title: "Treatment Reminder",
    desc: "Second spray of Propiconazole 25EC on wheat field due tomorrow.",
    time: "1 day ago",
    color: "bg-primary/10 text-primary",
    iconColor: "text-primary",
  },
];

export default function AppAlerts() {
  return (
    <AdminLayout>
      <MobileFrame>
        <div className="px-5 pb-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <ArrowLeft className="h-5 w-5 text-foreground" />
              <span className="text-base font-display font-semibold">Alerts</span>
            </div>
            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-semibold">5 new</span>
          </div>

          <div className="flex gap-2 mt-2 mb-4 overflow-x-auto pb-1">
            {["All", "Outbreaks", "Weather", "Treatments"].map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${a.color}`}>
                    <a.icon className={`h-4 w-4 ${a.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{a.title}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{a.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MobileFrame>
    </AdminLayout>
  );
}
