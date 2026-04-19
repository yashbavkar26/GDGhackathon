import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Bug, AlertTriangle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const regions = [
  { name: "Punjab", lat: 31, lng: 75, outbreaks: 12, risk: "High", pests: ["Stem Borer", "Leaf Folder"], color: "bg-destructive" },
  { name: "Gujarat", lat: 22, lng: 72, outbreaks: 8, risk: "Medium", pests: ["Bollworm", "Whitefly"], color: "bg-warning" },
  { name: "Haryana", lat: 29, lng: 76, outbreaks: 5, risk: "Medium", pests: ["Aphids", "Rust"], color: "bg-warning" },
  { name: "UP", lat: 27, lng: 80, outbreaks: 15, risk: "Critical", pests: ["Red Rot", "Top Borer"], color: "bg-destructive" },
  { name: "Maharashtra", lat: 19, lng: 76, outbreaks: 6, risk: "Low", pests: ["Pod Borer"], color: "bg-success" },
  { name: "Karnataka", lat: 15, lng: 76, outbreaks: 3, risk: "Low", pests: ["Mealybug"], color: "bg-success" },
  { name: "MP", lat: 23, lng: 78, outbreaks: 9, risk: "Medium", pests: ["Termites", "Shoot Fly"], color: "bg-warning" },
  { name: "Rajasthan", lat: 26, lng: 74, outbreaks: 4, risk: "Low", pests: ["Locust"], color: "bg-success" },
];

const riskColor: Record<string, string> = {
  Low: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning",
  High: "bg-destructive/15 text-destructive",
  Critical: "bg-destructive text-destructive-foreground",
};

export default function PestHeatmap() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-display font-bold">Pest Outbreak Heatmap</h1>
            <p className="text-sm text-muted-foreground mt-1">Crowd-sourced pest reports mapped region-wise for spread prediction</p>
          </motion.div>
          <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filter</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> India — Regional Outbreak Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simplified visual map */}
              <div className="relative bg-accent/30 rounded-xl h-[480px] overflow-hidden">
                <svg viewBox="0 0 400 500" className="w-full h-full opacity-20">
                  <path d="M200 50 Q300 80 320 180 Q340 280 300 350 Q260 420 200 460 Q140 420 100 350 Q60 280 80 180 Q100 80 200 50Z" fill="hsl(145,63%,32%)" stroke="hsl(145,63%,25%)" strokeWidth="2" />
                </svg>
                {regions.map((r, i) => {
                  const x = 20 + ((r.lng - 68) / 30) * 60;
                  const y = 10 + ((35 - r.lat) / 25) * 80;
                  return (
                    <motion.div
                      key={r.name}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="absolute"
                      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                    >
                      <div className="relative group cursor-pointer">
                        <div className={`w-8 h-8 rounded-full ${r.color} opacity-30 animate-pulse-glow absolute -inset-2`} />
                        <div className={`w-4 h-4 rounded-full ${r.color} relative z-10 ring-2 ring-card`} />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-card border border-border rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap pointer-events-none">
                          <p className="text-xs font-bold">{r.name}</p>
                          <p className="text-[10px] text-muted-foreground">{r.outbreaks} outbreaks · {r.risk} risk</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 justify-center">
                {["Low", "Medium", "High", "Critical"].map((level) => (
                  <span key={level} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`w-3 h-3 rounded-full ${level === "Low" ? "bg-success" : level === "Medium" ? "bg-warning" : "bg-destructive"}`} />
                    {level}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Bug className="h-4 w-4 text-destructive" /> Active Outbreaks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                {regions.sort((a, b) => b.outbreaks - a.outbreaks).map((r) => (
                  <div key={r.name} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{r.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskColor[r.risk]}`}>{r.risk}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.outbreaks} outbreaks · {r.pests.join(", ")}</p>
                    <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${r.color}`} style={{ width: `${(r.outbreaks / 15) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="gradient-hero text-primary-foreground">
              <CardContent className="p-5">
                <AlertTriangle className="h-5 w-5 mb-2" />
                <p className="font-display font-bold text-sm">Spread Alert</p>
                <p className="text-xs mt-1 opacity-80">UP region shows 40% increase in Red Rot cases. Predicted to spread to neighboring Bihar within 2 weeks.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
