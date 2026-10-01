"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActiveCall } from "./meeting-context";

export function PopQuestionPopup() {
  const { pendingPopQuestion, respondToPopQuestion } = useActiveCall();
  const [answer, setAnswer] = useState("");

  if (!pendingPopQuestion) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    respondToPopQuestion(answer.trim());
    setAnswer("");
  }

  return (
    <div className="fixed left-1/2 top-6 z-[60] w-full max-w-sm -translate-x-1/2 rounded-lg border bg-background p-4 shadow-xl">
      <p className="text-sm font-medium">Pop question!</p>
      <p className="mb-3 text-sm text-muted-foreground">{pendingPopQuestion.question}</p>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          placeholder="Your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoFocus
        />
        <Button type="submit" size="icon" disabled={!answer.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  ); 
}