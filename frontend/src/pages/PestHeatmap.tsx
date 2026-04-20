import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Bug, AlertTriangle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "480px",
  borderRadius: "12px",
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India

export default function PestHeatmap() {
  const [scans, setScans] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "[GCP_KEY]",
  });

  
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cropguard_scans");
      if (saved) {
        setScans(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load scan history.");
    }
  }, []);

  const parseLocation = (locStr: string) => {
    if (!locStr || locStr === "Unknown Location Data") return null;
    const parts = locStr.split(", ");
    if (parts.length === 2) {
      return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
    }
    return null;
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case "Low": return "text-success bg-success/10";
      case "Medium": return "text-warning bg-warning/10";
      case "High": return "text-destructive bg-destructive/10";
      default: return "text-destructive bg-destructive/10";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-display font-bold">Pest Outbreak Map</h1>
            <p className="text-sm text-muted-foreground mt-1">Live locations sourced directly from recent AI diagnoses</p>
          </motion.div>
          <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filter</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-lg border-primary/10 overflow-hidden backdrop-blur-sm bg-background/80">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Live Outbreak Hotspots (Google Maps)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={scans.length > 0 && parseLocation(scans[0].location) ? parseLocation(scans[0].location)! : defaultCenter}
                  zoom={scans.length > 0 ? 6 : 4}
                  options={{ styles: [{ featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] }, { featureType: "landscape", stylers: [{ color: "#1e293b" }] }, { featureType: "water", stylers: [{ color: "#0f172a" }] }] }}
                >
                  {scans.map((scan) => {
                    const pos = parseLocation(scan.location);
                    if (!pos) return null;
                    return (
                      <Marker
                        key={scan.id}
                        position={pos}
                        onClick={() => setSelectedScan(scan)}
                      />
                    );
                  })}

                  {selectedScan && parseLocation(selectedScan.location) && (
                    <InfoWindow
                      position={parseLocation(selectedScan.location)!}
                      onCloseClick={() => setSelectedScan(null)}
                    >
                      <div className="p-1 max-w-[200px] text-black">
                        <img src={selectedScan.image} className="w-full h-24 object-cover rounded mb-2" alt="Crop" />
                        <p className="font-bold text-sm">{selectedScan.disease || "Unknown"}</p>
                        <p className="text-xs text-gray-700">Crop: {selectedScan.crop}</p>
                        <p className="text-[10px] text-gray-500">{selectedScan.timestamp}</p>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              ) : (
                <div className="h-[480px] w-full flex items-center justify-center bg-muted/20">
                  <p className="text-muted-foreground flex items-center"><MapPin className="mr-2 animate-bounce" /> Loading Google Maps...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="shadow-lg border-primary/10 backdrop-blur-sm bg-background/80">
              <CardHeader className="bg-muted/30 border-b border-border/50">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Bug className="h-4 w-4 text-destructive" /> Scanned Outbreaks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {scans.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center border-dashed border-2 rounded">No live scans available. Upload an image in the Detection tab to log a hotspot.</p>
                ) : (
                  scans.map((r, i) => (
                    <div key={r.id + i} className="p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm truncate pr-2" title={r.disease}>{r.disease || "Unknown"}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${getRiskColor(r.severity)}`}>
                          {r.severity || "Medium"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex justify-between mt-1">
                        <span>{r.crop}</span>
                        <span>{r.location !== "Unknown Location Data" ? r.location : "No GPS"}</span>
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="gradient-hero text-primary-foreground shadow-lg border-0">
              <CardContent className="p-5">
                <AlertTriangle className="h-5 w-5 mb-2 text-white" />
                <p className="font-display font-bold text-sm text-white drop-shadow">Active Spread Alert</p>
                <p className="text-xs mt-1 text-white/90 drop-shadow">Based on latest real-time scans, there's a localized cluster of reports in your mapped area. Consider preventive cross-regional isolations.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
