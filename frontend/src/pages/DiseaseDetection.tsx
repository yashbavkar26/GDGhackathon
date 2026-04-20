import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, CheckCircle2, AlertTriangle, Leaf, XCircle, MapPin, History, RefreshCcw } from "lucide-react";

const analyzingPhrases = [
  "Examining leaf patterns...",
  "Running pixel analysis...",
  "Consulting agricultural data...",
  "Cross-referencing disease patterns...",
  "Generating treatment plan...",
  "Finalizing AI diagnosis..."
];

export default function DiseaseDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPhrase, setCurrentPhrase] = useState(0);

  // Load persistent data from localStorage
  const [scanHistory, setScanHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("cropguard_scans");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Cycle through Zomato-style phrases while analyzing
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setCurrentPhrase((prev) => (prev + 1) % analyzingPhrases.length);
      }, 1500);
    } else {
      setCurrentPhrase(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Set the most recent scan if available on load
  useEffect(() => {
    if (scanHistory.length > 0 && !selectedResult) {
      setSelectedResult(scanHistory[0]);
    }
  }, [scanHistory, selectedResult]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsAnalyzing(true);
    
    const imageUrl = URL.createObjectURL(file);
    
    try {
      // Convert file to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Get accurate GPS location for "hotspot" detection
      let location = "Unknown Location Data";
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 });
        });
        location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
      } catch (geoError) {
        console.warn("Location access denied or unavailable. Using fallback.");
      }

      // Send to local Ollama instance running Gemma 4
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma4:latest", 
          stream: false,
          format: "json",
          prompt: `Analyze this image of a crop. Identify the crop and any disease present. Provide a severity level (Low, Medium, High). Provide a confidence score out of 100. Give a brief description and recommended treatment. Output STRICTLY as a JSON object matching this exact schema: {"crop": "string", "disease": "string", "confidence": number, "severity": "string", "description": "string", "treatment": "string"}`,
          images: [base64Image]
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      let parsedResult;
      try {
        parsedResult = JSON.parse(data.response);
      } catch (parseError) {
        throw new Error("Failed to parse the JSON returned by the AI.");
      }

      const newScan = {
        id: Date.now(),
        image: imageUrl,
        location,
        timestamp: new Date().toLocaleTimeString() + ', ' + new Date().toLocaleDateString(),
        ...parsedResult
      };

      setSelectedResult(newScan);
      
      // Update global context / local persistence
      const newHistory = [newScan, ...scanHistory];
      setScanHistory(newHistory);
      localStorage.setItem("cropguard_scans", JSON.stringify(newHistory));

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis. Make sure Ollama is running locally.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    setSelectedResult(null);
    localStorage.removeItem("cropguard_scans");
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-green-50/50 via-background to-emerald-100/30 dark:from-green-950/20 dark:via-background dark:to-emerald-900/10 rounded-xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-black bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-400">Disease Detection</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time local AI analysis & geo-spatial hotspot tracking</p>
          </div>
          {scanHistory.length > 0 && (
             <Button variant="outline" size="sm" onClick={clearHistory} className="text-muted-foreground">
               <RefreshCcw className="w-4 h-4 mr-2"/> Clear Data
             </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          <Card className="shadow-lg border-primary/10 overflow-hidden backdrop-blur-sm bg-background/80">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" /> Upload & Analyze
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={onFileSelected} 
              />
              <div 
                className="border-2 border-dashed border-primary/20 rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer group bg-primary/5 backdrop-blur-md"
                onClick={handleUploadClick}
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-transform hover:scale-110 shadow-inner">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <p className="font-semibold text-foreground">Tap to open camera or browse</p>
                <p className="text-sm text-muted-foreground mt-1">Live data & hotspot detection active</p>
                <Button className="mt-6 w-full max-w-[200px] gradient-hero text-primary-foreground border-0 shadow-lg" disabled={isAnalyzing}>
                  {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Camera className="mr-2 h-4 w-4" />Run Agent</>}
                </Button>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-3">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {scanHistory.length > 0 && (
                <div className="mt-8 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <History className="h-3 w-3" /> Recent Live Scans
                  </p>
                  <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {scanHistory.map((r, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={r.id}
                        onClick={() => setSelectedResult(r)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          selectedResult?.id === r.id ? "bg-primary/10 border-primary/30 shadow-sm" : "bg-muted/20 border-transparent hover:bg-muted/40"
                        }`}
                      >
                        <img src={r.image} alt={r.crop} className="w-14 h-14 rounded-lg object-cover shadow-sm bg-background" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate text-foreground">{r.disease || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground flex justify-between">
                            <span>{r.crop} • {r.confidence}%</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 opacity-70">
                            <MapPin className="h-2 w-2"/> {r.location}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/10 overflow-hidden backdrop-blur-sm bg-background/80">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" /> Intelligence Report
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {!selectedResult && !isAnalyzing && (
                <div className="h-64 flex flex-col items-center justify-center bg-muted/20 rounded-xl border-2 border-dashed border-border/50">
                  <Leaf className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm font-medium">Awaiting live feed input...</p>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="h-64 flex flex-col items-center justify-center bg-primary/5 rounded-xl border border-primary/10 space-y-6 overflow-hidden relative">
                  <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Loader2 className="h-10 w-10 text-primary" />
                    </div>
                  </motion.div>
                  
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentPhrase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-primary font-bold tracking-wide text-sm text-center px-4"
                    >
                      {analyzingPhrases[currentPhrase]}
                    </motion.p>
                  </AnimatePresence>
                  
                  {/* Zomato-style background animations */}
                  <motion.div 
                    className="absolute bottom-4 opacity-40 flex gap-8 whitespace-nowrap text-xs font-medium text-emerald-600 dark:text-emerald-400"
                    animate={{ x: ["50%", "-100%"] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  >
                    <span>🌾 Calibrating Crop Data</span> • <span>🛰️ Fetching Satellite Weather</span> • <span>🦠 Comparing Pathogens</span> • <span>🌱 Yield Optimization</span>
                  </motion.div>
                </div>
              )}

              {selectedResult && !isAnalyzing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="relative group rounded-xl overflow-hidden shadow-md">
                    <img src={selectedResult.image} alt={selectedResult.crop} className="w-full h-56 object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span className="font-display font-bold text-xl drop-shadow-md">{selectedResult.disease || "Unknown Disease"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/40 border border-border/50 rounded-xl p-3 text-center shadow-sm">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Crop</p>
                      <p className="text-sm font-bold mt-1 text-foreground">{selectedResult.crop || "Unknown"}</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center shadow-sm">
                      <p className="text-[11px] text-primary uppercase tracking-wider font-semibold">Match</p>
                      <p className="text-sm font-bold mt-1 text-primary">{selectedResult.confidence || 0}%</p>
                    </div>
                    <div className={`bg-muted/40 border border-border/50 rounded-xl p-3 text-center shadow-sm border-b-2 ${selectedResult.severity === "High" ? "border-b-destructive bg-destructive/5" : "border-b-warning bg-warning/5"}`}>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Severity</p>
                      <p className={`text-sm font-bold mt-1 ${selectedResult.severity === "High" ? "text-destructive" : "text-warning"}`}>{selectedResult.severity || "Unknown"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                    <div className="bg-background rounded-lg p-3 flex items-center gap-3 border shadow-sm">
                      <div className="p-2 bg-primary/10 rounded-full"><MapPin className="h-4 w-4 text-primary"/></div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Hotspot Sector</p>
                        <p className="text-xs font-bold text-foreground mt-0.5">{selectedResult.location}</p>
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3 flex items-center gap-3 border shadow-sm">
                      <div className="p-2 bg-primary/10 rounded-full"><History className="h-4 w-4 text-primary"/></div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Log Time</p>
                        <p className="text-xs font-bold text-foreground mt-0.5">{selectedResult.timestamp}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/40 border border-accent rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-accent-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Leaf className="h-3 w-3"/> Pathological Profile
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{selectedResult.description || "No description provided."}</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" /> Prescribed Action Plan
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{selectedResult.treatment || "No treatment suggestions available."}</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
