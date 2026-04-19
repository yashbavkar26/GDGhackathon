import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Leaf, FlaskConical, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const staticTreatments = [
  {
    disease: "Bacterial Leaf Blight",
    crop: "Rice",
    organic: [{ name: "Neem Oil Spray", dosage: "5ml/L water", frequency: "Every 7 days", effectiveness: 72 }],
    chemical: [{ name: "Streptomycin sulfate", dosage: "300ppm", frequency: "2 sprays at 10-day interval", effectiveness: 92 }],
  },
  {
    disease: "Leaf Rust",
    crop: "Wheat",
    organic: [{ name: "Pseudomonas fluorescens", dosage: "10g/L", frequency: "Foliar spray at tillering", effectiveness: 65 }],
    chemical: [{ name: "Propiconazole 25EC", dosage: "0.1%", frequency: "At first appearance", effectiveness: 90 }],
  },
];

export default function Treatments() {
  const [search, setSearch] = useState("");
  const [liveTreatments, setLiveTreatments] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cropguard_scans");
      if (saved) {
        const scans = JSON.parse(saved);
        // Extract unique treatments by disease
        const uniqueScans = scans.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.disease === v.disease) === i);
        setLiveTreatments(uniqueScans);
      }
    } catch (e) { }
  }, []);

  const allTreatments = [
    // Standardize live scans
    ...liveTreatments.filter(s => s.disease && s.treatment).map(s => ({
      disease: s.disease,
      crop: s.crop,
      ai_recommendation: s.treatment,
      isLive: true
    })),
    // Standard mock list
    ...staticTreatments.map(s => ({ ...s, isLive: false }))
  ];

  const filtered = allTreatments.filter(
    (t) => t.disease.toLowerCase().includes(search.toLowerCase()) || t.crop?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Treatment Engine</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time AI prescribed treatments alongside standard protocols</p>
          </div>
        </motion.div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by disease or crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-6">
          {filtered.length === 0 && <p className="text-muted-foreground text-sm">No treatments matched.</p>}
          {filtered.map((t, i) => (
            <motion.div key={t.disease + i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className={`overflow-hidden ${t.isLive ? 'border-primary/50 shadow-md ring-1 ring-primary/20 bg-primary/5' : ''}`}>
                <CardHeader className={`pb-3 ${t.isLive ? 'bg-primary/10' : ''}`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      <Pill className={`h-4 w-4 ${t.isLive ? 'text-primary' : 'text-muted-foreground'}`} />
                      {t.disease}
                      {t.isLive && <Badge className="bg-primary hover:bg-primary ml-2">Live AI Scan</Badge>}
                    </CardTitle>
                    <Badge variant="secondary">{t.crop || "Unknown"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {t.isLive ? (
                     <div className="bg-background rounded-lg p-4 border shadow-inner">
                       <h3 className="flex items-center gap-2 text-primary font-bold text-sm mb-2"><AlertCircle className="w-4 h-4"/> Gemma AI Prescription</h3>
                       <p className="text-sm text-foreground/90 leading-relaxed">{t.ai_recommendation}</p>
                     </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Leaf className="h-4 w-4 text-success" />
                          <span className="text-sm font-semibold text-success">Organic Remedies</span>
                        </div>
                        <div className="space-y-2">
                          {(t as any).organic?.map((o: any) => (
                            <div key={o.name} className="p-3 rounded-lg bg-success/5 border border-success/10">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{o.name}</span>
                                <span className="text-xs text-success font-semibold">{o.effectiveness}% effective</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Dosage: {o.dosage} · {o.frequency}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <FlaskConical className="h-4 w-4 text-info" />
                          <span className="text-sm font-semibold text-info">Chemical Remedies</span>
                        </div>
                        <div className="space-y-2">
                          {(t as any).chemical?.map((c: any) => (
                            <div key={c.name} className="p-3 rounded-lg bg-info/5 border border-info/10">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{c.name}</span>
                                <span className="text-xs text-info font-semibold">{c.effectiveness}% effective</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Dosage: {c.dosage} · {c.frequency}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
