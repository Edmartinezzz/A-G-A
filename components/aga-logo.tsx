import { Box } from "lucide-react";

interface AGALogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function AGALogo({ className, iconOnly = false }: AGALogoProps) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Geometric Background */}
        <div className="absolute inset-0 bg-emerald-500/20 blur-sm rounded-lg" />
        <div className="relative bg-emerald-100 dark:bg-emerald-950/50 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <Box className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      
      {!iconOnly && (
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          A-G-A
        </span>
      )}
    </div>
  );
}
