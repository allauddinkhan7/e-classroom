import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branding panel — hidden on mobile/tablet, shown on large screens */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-10 text-white">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7" />
          <span className="text-lg font-semibold">E-Classroom</span>
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-medium leading-snug">
            Live classrooms, real engagement, built for how you actually teach and learn.
          </p>
          <p className="text-sm text-slate-400">
            Random attendance checks, live Q&amp;A, and group study — all in one place.
          </p>
        </div>
        <p className="text-xs text-slate-500">© 2026 E-Classroom</p>
      </div>

      {/* Form panel — always visible, centered on every screen size */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}