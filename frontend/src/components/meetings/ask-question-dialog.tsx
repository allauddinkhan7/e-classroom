"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useActiveCall } from "./meeting-context";

export function AskQuestionDialog() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const { triggerPopQuestion } = useActiveCall();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    triggerPopQuestion(question.trim(), answer.trim());
    setOpen(false);
    setQuestion("");
    setAnswer("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="secondary" className="rounded-full" />}>
        <HelpCircle className="mr-2 h-4 w-4" />
        Ask Question
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ask a pop question</DialogTitle>
            <DialogDescription>
              Every student in the call will see this instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="e.g. What's the capital of France?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Correct answer</Label>
              <Input
                id="answer"
                placeholder="e.g. Paris"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!question.trim() || !answer.trim()}>
              Send to class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}