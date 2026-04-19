import { cn } from "@/lib/utils";

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileFrame({ children, className }: MobileFrameProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-6 bg-muted/50">
      <div className={cn(
        "w-[390px] h-[844px] bg-card rounded-[3rem] border-[8px] border-foreground/10 shadow-2xl overflow-hidden relative",
        className
      )}>
        {/* Status bar */}
        <div className="h-12 flex items-center justify-between px-8 bg-card">
          <span className="text-xs font-medium text-muted-foreground">9:41</span>
          <div className="w-[120px] h-[28px] bg-foreground/10 rounded-full" />
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-muted-foreground/40 rounded-sm" />
            <div className="w-4 h-2 bg-muted-foreground/40 rounded-sm" />
          </div>
        </div>
        <div className="h-[calc(100%-7rem)] overflow-y-auto">
          {children}
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full" />
      </div>
    </div>
  );
}
