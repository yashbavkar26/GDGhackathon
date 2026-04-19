import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Leaf, FlaskConical, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const treatments = [
  {
    disease: "Bacterial Leaf Blight",
    crop: "Rice",
    organic: [
      { name: "Neem Oil Spray", dosage: "5ml/L water", frequency: "Every 7 days", effectiveness: 72 },
      { name: "Trichoderma viride", dosage: "4g/kg seed", frequency: "Seed treatment", effectiveness: 68 },
    ],
    chemical: [
      { name: "Streptomycin sulfate", dosage: "300ppm", frequency: "2 sprays at 10-day interval", effectiveness: 92 },
      { name: "Copper oxychloride", dosage: "3g/L", frequency: "Every 15 days", effectiveness: 85 },
    ],
  },
  {
    disease: "Leaf Rust",
    crop: "Wheat",
    organic: [
      { name: "Pseudomonas fluorescens", dosage: "10g/L", frequency: "Foliar spray at tillering", effectiveness: 65 },
    ],
    chemical: [
      { name: "Propiconazole 25EC", dosage: "0.1%", frequency: "At first appearance", effectiveness: 90 },
      { name: "Mancozeb 75WP", dosage: "2.5g/L", frequency: "Every 12 days", effectiveness: 78 },
    ],
  },
  {
    disease: "Bollworm",
    crop: "Cotton",
    organic: [
      { name: "Bt (Bacillus thuringiensis)", dosage: "1g/L", frequency: "At egg hatching", effectiveness: 75 },
      { name: "Neem seed kernel extract", dosage: "5%", frequency: "Every 10 days", effectiveness: 60 },
    ],
    chemical: [
      { name: "Emamectin benzoate", dosage: "0.2g/L", frequency: "At larval stage", effectiveness: 95 },
    ],
  },
  {
    disease: "Red Rot",
    crop: "Sugarcane",
    organic: [
      { name: "Trichoderma harzianum", dosage: "5g/kg sett", frequency: "Sett treatment", effectiveness: 55 },
    ],
    chemical: [
      { name: "Carbendazim 50WP", dosage: "0.1%", frequency: "Sett dipping for 30 min", effectiveness: 88 },
    ],
  },
];

export default function Treatments() {
  const [search, setSearch] = useState("");
  const filtered = treatments.filter(
    (t) => t.disease.toLowerCase().includes(search.toLowerCase()) || t.crop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Treatment Recommendations</h1>
            <p className="text-sm text-muted-foreground mt-1">AI-curated organic & chemical remedies with dosage info</p>
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
          {filtered.map((t, i) => (
            <motion.div key={t.disease} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      {t.disease}
                    </CardTitle>
                    <Badge variant="secondary">{t.crop}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Leaf className="h-4 w-4 text-success" />
                        <span className="text-sm font-semibold text-success">Organic Remedies</span>
                      </div>
                      <div className="space-y-2">
                        {t.organic.map((o) => (
                          <div key={o.name} className="p-3 rounded-lg bg-success/5 border border-success/10">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{o.name}</span>
                              <span className="text-xs text-success font-semibold">{o.effectiveness}% effective</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Dosage: {o.dosage} · {o.frequency}</p>
                            <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                              <div className="h-full bg-success rounded-full" style={{ width: `${o.effectiveness}%` }} />
                            </div>
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
                        {t.chemical.map((c) => (
                          <div key={c.name} className="p-3 rounded-lg bg-info/5 border border-info/10">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{c.name}</span>
                              <span className="text-xs text-info font-semibold">{c.effectiveness}% effective</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Dosage: {c.dosage} · {c.frequency}</p>
                            <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                              <div className="h-full bg-info rounded-full" style={{ width: `${c.effectiveness}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
