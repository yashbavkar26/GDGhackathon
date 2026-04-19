import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "primary" | "warning" | "danger";
}

const variantStyles = {
  default: "bg-card stat-glow",
  primary: "gradient-hero text-primary-foreground",
  warning: "bg-warning/10 border-warning/20",
  danger: "bg-destructive/10 border-destructive/20",
};

const iconVariants = {
  default: "bg-primary/10 text-primary",
  primary: "bg-primary-foreground/20 text-primary-foreground",
  warning: "bg-warning/20 text-warning",
  danger: "bg-destructive/20 text-destructive",
};

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-lg border p-5 transition-all hover:shadow-lg", variantStyles[variant])}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn("text-xs font-medium uppercase tracking-wider", variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {title}
          </p>
          <p className="text-2xl font-display font-bold">{value}</p>
          {change && (
            <p className={cn("text-xs font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", iconVariants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
