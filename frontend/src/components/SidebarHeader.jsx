import React from "react";
import { Plus } from "lucide-react";

/**
 * Sidebar header with "add note" button.
 *
 * Props:
 *  - addNote(): void
 */
export default function SidebarHeader({ addNote }) {
  return (
    <div className="flex items-center justify-center">      <button
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-chatgpt-green hover:opacity-80 text-white transition-all duration-200 rounded-lg text-xs font-medium shadow-sm hover:shadow-md w-full justify-center"
        onClick={addNote}
        aria-label="Add note"
      >
        <Plus className="w-3 h-3" />
        New Note
      </button>
    </div>
  );
}
