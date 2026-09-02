import Link from "next/link";
import { Users, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Classroom } from "@/lib/classrooms/classrooms-api";

export function ClassroomCard({ classroom }: { classroom: Classroom }) {
  const isCourse = classroom.type === "COURSE";
 

  return (
    <Link href={`/classrooms/${classroom.id}`}>

      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <CardTitle className="text-base leading-snug">{classroom.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isCourse ? "default" : "secondary"} className="shrink-0"> {isCourse ? "Course" : "Study Group"} </Badge>
          </div>
        </CardHeader>



        <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            {isCourse ? <BookOpen className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
            {classroom._count.enrollments}{" "}
            {classroom._count.enrollments === 1 ? "member" : "members"}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}