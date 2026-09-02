"use client";

import { Paperclip, Loader2 } from "lucide-react";
import { useState } from "react";
import { getFileDownloadUrl } from "@/lib/assignments/assignments-api";

export function FileDownloadLink({ fileId, label }: { fileId: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { url } = await getFileDownloadUrl(fileId);
      window.open(url, "_blank");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-primary underline underline-offset-2 hover:no-underline disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
      {label}
    </button>
  );
}