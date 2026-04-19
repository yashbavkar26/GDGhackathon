import { AdminLayout } from "@/components/AdminLayout";
import { MobileFrame } from "@/components/MobileFrame";
import { ArrowLeft, Bug, ChevronRight, Calendar } from "lucide-react";

const reports = [
  { id: 1, disease: "Leaf Blight", crop: "Rice", date: "Apr 3", severity: "High", result: "Confirmed", color: "bg-destructive" },
  { id: 2, disease: "Rust", crop: "Wheat", date: "Apr 1", severity: "Medium", result: "Confirmed", color: "bg-warning" },
  { id: 3, disease: "Healthy", crop: "Cotton", date: "Mar 28", severity: "None", result: "No disease", color: "bg-success" },
  { id: 4, disease: "Red Rot", crop: "Sugarcane", date: "Mar 25", severity: "Critical", result: "Confirmed", color: "bg-destructive" },
  { id: 5, disease: "Powdery Mildew", crop: "Tomato", date: "Mar 22", severity: "Low", result: "Mild", color: "bg-success" },
];

export default function AppReports() {
  return (
    <AdminLayout>
      <MobileFrame>
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3 py-3">
            <ArrowLeft className="h-5 w-5 text-foreground" />
            <span className="text-base font-display font-semibold">My Reports</span>
          </div>

          <div className="flex gap-2 mt-2 mb-4">
            {["All", "Confirmed", "Pending"].map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border">
                <div className={`w-1.5 h-12 rounded-full ${r.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.disease}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{r.crop}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5" />{r.date}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold mt-1 inline-block ${
                    r.severity === "High" || r.severity === "Critical" ? "text-destructive" :
                    r.severity === "Medium" ? "text-warning" :
                    r.severity === "None" ? "text-success" : "text-muted-foreground"
                  }`}>
                    {r.severity} · {r.result}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </MobileFrame>
    </AdminLayout>
  );
}
