import { useState } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, CheckCircle2, AlertTriangle, Leaf } from "lucide-react";

const sampleResults = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    crop: "Rice",
    disease: "Bacterial Leaf Blight",
    confidence: 94.2,
    severity: "High",
    description: "Bacterial leaf blight caused by Xanthomonas oryzae. Water-soaked lesions on leaf margins turning yellow to white.",
    treatment: "Apply Streptomycin sulfate + Tetracycline at 300ppm. Drain excess water from fields.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
    crop: "Wheat",
    disease: "Leaf Rust (Puccinia triticina)",
    confidence: 89.7,
    severity: "Medium",
    description: "Orange-brown pustules on upper leaf surface, circular to oval shaped. Typical of Puccinia triticina infection.",
    treatment: "Spray Propiconazole 25EC at 0.1%. Remove infected plant debris.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400",
    crop: "Tomato",
    disease: "Early Blight (Alternaria solani)",
    confidence: 91.5,
    severity: "Medium",
    description: "Concentric ring pattern (target spots) on lower leaves. Dark brown lesions with yellow halo.",
    treatment: "Apply Mancozeb 75WP at 2.5g/L. Improve air circulation by pruning.",
  },
];

export default function DiseaseDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResult, setSelectedResult] = useState(sampleResults[0]);

  const handleUpload = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-display font-bold">Disease Detection</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered crop disease identification using Google Gemini Vision</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" /> Upload Crop Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <p className="font-medium text-foreground">Drag & drop crop image here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse — JPG, PNG up to 20MB</p>
                <Button onClick={handleUpload} className="mt-4 gradient-hero text-primary-foreground border-0">
                  {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Camera className="mr-2 h-4 w-4" />Analyze Image</>}
                </Button>
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Scans</p>
                {sampleResults.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResult(r)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedResult.id === r.id ? "bg-accent ring-1 ring-primary/20" : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <img src={r.image} alt={r.crop} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{r.disease}</p>
                      <p className="text-xs text-muted-foreground">{r.crop} · {r.confidence}% confidence</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" /> Detection Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <img src={selectedResult.image} alt={selectedResult.crop} className="w-full h-48 object-cover rounded-lg" loading="lazy" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="font-display font-bold text-lg">{selectedResult.disease}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Crop</p>
                  <p className="text-sm font-semibold mt-0.5">{selectedResult.crop}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-sm font-semibold mt-0.5 text-primary">{selectedResult.confidence}%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Severity</p>
                  <p className={`text-sm font-semibold mt-0.5 ${selectedResult.severity === "High" ? "text-destructive" : "text-warning"}`}>{selectedResult.severity}</p>
                </div>
              </div>
              <div className="bg-accent/50 rounded-lg p-4">
                <p className="text-xs font-medium text-accent-foreground uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-foreground">{selectedResult.description}</p>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Recommended Treatment
                </p>
                <p className="text-sm text-foreground">{selectedResult.treatment}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
