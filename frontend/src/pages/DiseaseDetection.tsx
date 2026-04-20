import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, CheckCircle2, AlertTriangle, Leaf, XCircle, MapPin, History, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";

const DEFAULT_MODEL = "gemma4:latest";

const buildOllamaBaseUrls = () => {
  const configured = (import.meta.env.VITE_OLLAMA_BASE_URL as string | undefined)?.trim();
  const browserHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const candidates = [
    configured,
    `http://${browserHost}:11434`,
    "http://localhost:11434",
    "http://127.0.0.1:11434",
  ].filter(Boolean) as string[];

  return [...new Set(candidates.map((url) => url.replace(/\/+$/, "")))];
};

const resolveModelForBaseUrl = async (baseUrl: string, preferredModel: string) => {
  try {
    const tagsRes = await fetch(`${baseUrl}/api/tags`);
    if (!tagsRes.ok) return preferredModel;

    const tagsData = await tagsRes.json();
    const installedModels: string[] = Array.isArray(tagsData?.models)
      ? tagsData.models.map((m: { name?: string }) => m?.name).filter(Boolean)
      : [];

    if (installedModels.includes(preferredModel)) return preferredModel;
    return installedModels[0] || preferredModel;
  } catch {
    return preferredModel;
  }
};

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
  const { t } = useTranslation();

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

      const preferredModel = ((import.meta.env.VITE_OLLAMA_MODEL as string | undefined)?.trim() || DEFAULT_MODEL);
      const baseUrls = buildOllamaBaseUrls();
      let data: any = null;
      let lastError = "";

      for (const baseUrl of baseUrls) {
        try {
          const modelToUse = await resolveModelForBaseUrl(baseUrl, preferredModel);
          const response = await fetch(`${baseUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: modelToUse,
              stream: false,
              format: "json",
              prompt: `Analyze this image of a crop. Identify the crop and any disease present. Provide a severity level (Low, Medium, High). Provide a confidence score out of 100. Give a brief description and recommended treatment. Output STRICTLY as a JSON object matching this exact schema: {"crop": "string", "disease": "string", "confidence": number, "severity": "string", "description": "string", "treatment": "string"}`,
              images: [base64Image]
            })
          });

          if (!response.ok) {
            throw new Error(`Ollama API error (${response.status}): ${response.statusText}`);
          }

          data = await response.json();
          break;
        } catch (callError: any) {
          lastError = callError?.message || "Unknown connection error";
        }
      }

      if (!data) {
        throw new Error(`Unable to connect to Ollama. Tried: ${baseUrls.join(", ")}. Last error: ${lastError}`);
      }
      
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
      setError(
        err.message ||
          "An error occurred during analysis. Ensure Ollama is running and set VITE_OLLAMA_BASE_URL/VITE_OLLAMA_MODEL if needed."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    setSelectedResult(null);
    localStorage.removeItem("cropguard_scans");
  };

  const loadImageDataUrl = (src: string) =>
    new Promise<{ dataUrl: string; width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to prepare report image."));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.92),
          width: canvas.width,
          height: canvas.height,
        });
      };
      img.onerror = () => reject(new Error("Unable to load scanned image."));
      img.src = src;
    });

  const handleDownloadPdfReport = async () => {
    if (!selectedResult) return;
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const left = 14;
      const right = pageWidth - 14;
      let y = 16;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Crop Disease Detection Report", left, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleString()}`, left, y);
      y += 7;

      const { dataUrl, width, height } = await loadImageDataUrl(selectedResult.image);
      const maxImageWidth = right - left;
      const maxImageHeight = 90;
      const imageRatio = width / height;
      let renderWidth = maxImageWidth;
      let renderHeight = renderWidth / imageRatio;
      if (renderHeight > maxImageHeight) {
        renderHeight = maxImageHeight;
        renderWidth = renderHeight * imageRatio;
      }
      doc.addImage(dataUrl, "JPEG", left, y, renderWidth, renderHeight);
      y += renderHeight + 8;

      const lines = [
        `Crop: ${selectedResult.crop || "Unknown"}`,
        `Detected disease: ${selectedResult.disease || "Unknown"}`,
        `Confidence: ${selectedResult.confidence ?? 0}%`,
        `Severity: ${selectedResult.severity || "Unknown"}`,
        `Scan location: ${selectedResult.location || "Unknown"}`,
        `Scan time: ${selectedResult.timestamp || "Unknown"}`,
        `Description: ${selectedResult.description || "No description provided."}`,
        `Recommended treatment: ${selectedResult.treatment || "No treatment suggestions available."}`,
      ];

      doc.setFontSize(11);
      for (const line of lines) {
        const wrapped = doc.splitTextToSize(line, right - left);
        if (y + wrapped.length * 6 > pageHeight - 14) {
          doc.addPage();
          y = 16;
        }
        doc.text(wrapped, left, y);
        y += wrapped.length * 6;
      }

      const safeCrop = (selectedResult.crop || "crop").toString().replace(/\s+/g, "-").toLowerCase();
      const safeDisease = (selectedResult.disease || "disease").toString().replace(/\s+/g, "-").toLowerCase();
      doc.save(`cropguard-report-${safeCrop}-${safeDisease}.pdf`);
    } catch (pdfError: any) {
      console.error(pdfError);
      setError(pdfError?.message || "Failed to generate PDF report.");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 pt-10 pb-20">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
          <div>
            <h1 className="text-3xl font-display font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-200">
              {t('dd_title')}
            </h1>
            <p className="text-sm text-green-400/70 mt-1 font-medium">{t('dd_subtitle')}</p>
          </div>
          {scanHistory.length > 0 && (
             <Button variant="outline" size="sm" onClick={clearHistory} className="text-white/60 hover:text-white border-white/10 hover:bg-white/10">
               <RefreshCcw className="w-4 h-4 mr-2"/> {t('dd_clear')}
             </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-black/20 border-b border-white/5 pb-4">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="h-4 w-4 text-green-400" /> {t('dd_upload_title')}
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
                className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer group bg-black/20 backdrop-blur-md"
                onClick={handleUploadClick}
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-transform group-hover:scale-110 shadow-inner border border-green-500/20">
                  <Upload className="h-7 w-7 text-green-400" />
                </div>
                <p className="font-semibold text-white/90 text-lg">{t('dd_upload_text')}</p>
                <p className="text-sm text-white/40 mt-1">{t('dd_upload_sub')}</p>
                <Button className="mt-8 w-full max-w-[200px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold border-0 shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-full h-12" disabled={isAnalyzing}>
                  {isAnalyzing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('dd_btn_analyzing')}</> : <><Camera className="mr-2 h-5 w-5" />{t('dd_btn_run')}</>}
                </Button>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {scanHistory.length > 0 && (
                <div className="mt-8 space-y-4">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <History className="h-3.5 w-3.5" /> {t('dd_recent')}
                  </p>
                  <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {scanHistory.map((r, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={r.id}
                        onClick={() => setSelectedResult(r)}
                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border ${
                          selectedResult?.id === r.id ? "bg-green-500/10 border-green-500/30" : "bg-black/20 border-white/5 hover:bg-white/5"
                        }`}
                      >
                        <img src={r.image} alt={r.crop} className="w-16 h-16 rounded-lg object-cover shadow-lg border border-white/10" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold truncate text-white">{r.disease || "Unknown"}</p>
                          <p className="text-xs font-medium text-white/50 mt-1 flex items-center gap-2">
                            <span>{r.crop}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-green-400">{r.confidence}% Match</span>
                          </p>
                          <p className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3"/> {r.location}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-black/20 border-b border-white/5 pb-4">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-400" /> {t('dd_report_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {!selectedResult && !isAnalyzing && (
                <div className="h-[500px] flex flex-col items-center justify-center bg-black/20 rounded-2xl border-2 border-dashed border-white/10">
                  <Leaf className="h-16 w-16 text-white/10 mb-4" />
                  <p className="text-white/40 text-sm font-semibold tracking-wide">{t('dd_awaiting')}</p>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="h-[500px] flex flex-col items-center justify-center bg-green-500/5 rounded-2xl border border-green-500/10 space-y-8 overflow-hidden relative">
                  <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <div className="p-5 bg-green-500/10 rounded-full border border-green-500/20">
                      <Loader2 className="h-12 w-12 text-green-400" />
                    </div>
                  </motion.div>
                  
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentPhrase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-green-300 font-bold tracking-widest text-sm text-center px-4 uppercase"
                    >
                      {analyzingPhrases[currentPhrase]}
                    </motion.p>
                  </AnimatePresence>
                  
                  {/* Futuristic background animations */}
                  <motion.div 
                    className="absolute bottom-6 opacity-30 flex gap-8 whitespace-nowrap text-xs font-bold text-green-500 uppercase tracking-widest"
                    animate={{ x: ["50%", "-100%"] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  >
                    <span>🌾 Calibrating</span> • <span>🛰️ Satellite Fetch</span> • <span>🦠 Processing</span> • <span>🌱 Yield Optimization</span>
                  </motion.div>
                </div>
              )}

              {selectedResult && !isAnalyzing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleDownloadPdfReport}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Download PDF Report
                    </Button>
                  </div>
                  <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <img src={selectedResult.image} alt={selectedResult.crop} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-5 left-5 flex items-center gap-3 text-white">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center blur-[1px] absolute opacity-50 animate-pulse"></div>
                      <CheckCircle2 className="h-7 w-7 text-green-400 relative z-10" />
                      <span className="font-display font-black text-2xl tracking-wide drop-shadow-lg relative z-10">{selectedResult.disease || "Unknown Disease"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center shadow-inner">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1.5">Crop</p>
                      <p className="text-base font-black text-white">{selectedResult.crop || "Unknown"}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center shadow-inner">
                      <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold mb-1.5">{t('dd_match')}</p>
                      <p className="text-base font-black text-green-300">{selectedResult.confidence || 0}%</p>
                    </div>
                    <div className={`bg-black/30 border border-white/5 rounded-xl p-4 text-center shadow-inner border-b-2 ${selectedResult.severity === "High" ? "border-b-red-500 bg-red-500/10" : "border-b-orange-400 bg-orange-500/10"}`}>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1.5">{t('dd_severity')}</p>
                      <p className={`text-base font-black ${selectedResult.severity === "High" ? "text-red-400" : "text-orange-400"}`}>{selectedResult.severity || "Unknown"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-black/40 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                      <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg"><MapPin className="h-5 w-5 text-green-400"/></div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{t('dd_hotspot')}</p>
                        <p className="text-sm font-bold text-white/90 mt-1">{selectedResult.location}</p>
                      </div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                      <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg"><History className="h-5 w-5 text-green-400"/></div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{t('dd_log_time')}</p>
                        <p className="text-sm font-bold text-white/90 mt-1">{selectedResult.timestamp}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-lg">
                    <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-emerald-400"/> {t('dd_profile')}
                    </p>
                    <p className="text-sm text-white/80 leading-relaxed font-medium">{selectedResult.description || "No description provided."}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-5 shadow-lg">
                    <p className="text-[11px] font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> {t('dd_action')}
                    </p>
                    <p className="text-sm text-white/90 leading-relaxed font-medium">{selectedResult.treatment || "No treatment suggestions available."}</p>
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
