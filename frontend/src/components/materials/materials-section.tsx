"use client";

import { AlertCircle, FileText, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMaterials, useDeleteMaterial } from "@/lib/materials/use-materials";
import { CreateMaterialDialog } from "./create-material-dialog";
import { FileDownloadLink } from "@/lib/files/file-download-link";

export function MaterialsSection({
  classroomId,
  isTeacher,
}: {
  classroomId: string;
  isTeacher: boolean;
}) {
  const { data: materials, isLoading, isError } = useMaterials(classroomId);
  const deleteMaterial = useDeleteMaterial(classroomId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Materials</h2>
        {isTeacher && <CreateMaterialDialog classroomId={classroomId} />}
      </div>

      {isLoading && (
        <div className="flex min-h-[100px] items-center justify-center rounded-lg border">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-lg border text-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-sm text-muted-foreground">Couldn&apos;t load materials</p>
        </div>
      )}

      {!isLoading && !isError && materials?.length === 0 && (
        <div className="flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-center">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No materials posted yet</p>
        </div>
      )}

      {!isLoading && !isError && materials && materials.length > 0 && (
        <div className="space-y-2">
          {materials.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">{m.title}</p>
                  {m.file && <FileDownloadLink fileId={m.file.id} label={m.file.originalName} />}
                </div>
                {isTeacher && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMaterial.mutate(m.id)}
                    disabled={deleteMaterial.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}