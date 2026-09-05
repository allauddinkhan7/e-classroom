import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

export type ClassroomSectionData = {
  slug: string;
  title: string;
  description: string;
  gradient: string;
  icon: LucideIcon;
};

interface ClassroomSectionProps {
  section: ClassroomSectionData;
  classroomId: string;
}

export default function ClassroomSection({
  section,
  classroomId,
}: ClassroomSectionProps) {
  const Icon = section.icon;

  return (
    <Link
      href={`/classrooms/${classroomId}/${section.slug}`}
      className="group block"
    >
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        {/* Top colored section */}
        <div
          className={`relative h-36 overflow-hidden bg-gradient-to-br ${section.gradient}`}
        >
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 right-12 h-28 w-28 rounded-full bg-white/10" />

          {/* Icon */}
          <div className="relative p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10">
              <Icon className="h-5 w-5 text-white" />
            </div>

            <h2 className="mt-6 text-lg font-semibold text-white">
              {section.title}
            </h2>
          </div>
        </div>

        {/* Bottom section */}
        <div className="bg-white p-5">
          <p className="min-h-[42px] text-sm leading-6 text-slate-600">
            {section.description}
          </p>

          <div className="mt-4 mr-3 flex items-center justify-end border-t border-slate-100 pt-4"> 
            <ArrowRight className={`rounded-full text-slate-700 transition-transform duration-200 group-hover:translate-x-1`} />
          </div>
        </div>
      </div>
    </Link>
  );
}