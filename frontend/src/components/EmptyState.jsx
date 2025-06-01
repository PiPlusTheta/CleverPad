import React from "react";
import { Notebook } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
      <Notebook size={48} className="mb-4" />
      <p className="text-lg">No note selected.</p>
      <p>Create a new note or select one from the list.</p>
    </div>
  );
}
