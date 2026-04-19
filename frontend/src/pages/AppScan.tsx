import { AdminLayout } from "@/components/AdminLayout";
import { MobileFrame } from "@/components/MobileFrame";
import { Camera, ArrowLeft, Zap, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppScan() {
  return (
    <AdminLayout>
      <MobileFrame>
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3 py-3">
            <ArrowLeft className="h-5 w-5 text-foreground" />
            <span className="text-base font-display font-semibold">Scan Crop</span>
          </div>

          {/* Camera viewfinder */}
          <div className="relative bg-foreground/5 rounded-2xl h-[340px] flex items-center justify-center overflow-hidden mt-2">
            <div className="absolute inset-4 border-2 border-dashed border-primary/30 rounded-xl" />
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
            <div className="text-center">
              <Camera className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Point camera at the affected leaf</p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <Button className="flex-1 gradient-hero text-primary-foreground border-0 h-12 rounded-xl gap-2">
              <Camera className="h-5 w-5" />
              Take Photo
            </Button>
            <Button variant="outline" className="h-12 w-12 rounded-xl p-0">
              <ImageIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-accent/50 border border-accent">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-display font-semibold">AI Detection Tips</span>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• Ensure good lighting on the leaf</li>
              <li>• Focus on the affected area</li>
              <li>• Include both healthy & diseased parts</li>
              <li>• Avoid blurry or shaky images</li>
            </ul>
          </div>

          <div className="mt-5">
            <span className="text-sm font-display font-semibold">Recent Scans</span>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {["Rice Leaf", "Cotton Boll", "Wheat Stem"].map((s) => (
                <div key={s} className="min-w-[100px] h-[100px] bg-muted rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </MobileFrame>
    </AdminLayout>
  );
}
