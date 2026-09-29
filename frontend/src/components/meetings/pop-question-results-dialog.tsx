"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchPopQuestionResults } from "@/lib/engagement/engagement-api";
import { useActiveCall } from "./meeting-context";

export function PopQuestionResultsDialog() {
  const { lastPopQuestionId } = useActiveCall();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pop-question-results", lastPopQuestionId],
    queryFn: () => fetchPopQuestionResults(lastPopQuestionId!),
    enabled: !!lastPopQuestionId,
  });

  if (!lastPopQuestionId) return null;

  return (
    <Dialog onOpenChange={(open) => open && refetch()}>
      <DialogTrigger render={ <Button variant="ghost" size="sm" className="rounded-full text-black"/> }>
        <HelpCircle className="mr-1 h-3.5 w-3.5" />
        Question Results
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pop question results</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border p-2 text-sm">
              <p className="font-medium">{data?.question}</p>
              <p className="text-xs text-muted-foreground">
                Correct answer: {data?.correctAnswer}
              </p>
            </div>
            <div>
              {data?.responses.map((r) => (
                <p key={r.user.id} className="flex items-center gap-2 text-sm">
                  {r.isCorrect ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                  )}
                  {r.user.fullName}
                  <span className="text-xs text-muted-foreground">
                    — &quot;{r.answer}&quot;
                  </span>
                </p>
              ))}
            </div>
            {data && data.missing.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Didn&apos;t answer
                </p>
                {data.missing.map((u) => (
                  <p key={u.id} className="text-sm text-muted-foreground">
                    {u.fullName}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}