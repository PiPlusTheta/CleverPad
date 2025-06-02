import React from "react";
import { Notebook } from "lucide-react";

export default function EmptyState() {
  return (    <div className="flex-1 flex flex-col items-center justify-center text-chatgpt-text-secondary min-h-[60vh]">
      <div className="bg-chatgpt-bg-element p-6 rounded-2xl border border-chatgpt-border mb-6">
        <Notebook size={48} className="text-chatgpt-green" />
      </div>
      <h2 className="text-xl font-semibold text-chatgpt-text-primary mb-2">No note selected</h2>
      <p className="text-chatgpt-text-secondary text-center max-w-md">
        Choose a note from the sidebar to start editing, or create a new note to begin writing.
      </p>
    </div>
  );
}
