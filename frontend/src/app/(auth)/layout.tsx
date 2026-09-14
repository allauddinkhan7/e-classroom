import { GraduationCap } from "lucide-react";
import Image from "next/image";
import displayPic from "./displayPic.png";
import Typing from "@/components/auth/Typing";

export default function AuthLayout({ children } : { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1fr_1.25fr_1fr]">
      <div className="hidden min-h-screen flex-col justify-between p-8 lg:flex xl:p-10">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-tight">
            E-Classroom
          </span>
        </div>

        {/* Marketing text */}
        <div className="max-w-md space-y-3">
          {/* Typing */}
          <Typing/>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            
          </h1>

          <p className="text-sm leading-6 text-slate-500">
            Random attendance checks, live Q&amp;A, and group study — all in one
            place.
          </p>
        </div>

        <p className="text-xs text-slate-400">© 2026 E-Classroom</p>
      </div>

      <div className="hidden min-h-screen items-center justify-center lg:flex">
        <Image
          src={displayPic}
          alt="E-Classroom"
          width={900}
          height={900}
          priority
          className="w-[820px] xl:w-[800px]"
        />
      </div>

      <div className="flex min-h-screen items-center justify-center border-l px-6 py-10 sm:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}