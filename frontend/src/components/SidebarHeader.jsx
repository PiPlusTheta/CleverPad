import React from "react";

/**
 * Sidebar header with "add note" button.
 *
 * Props:
 *  - addNote(): void
 */
export default function SidebarHeader({ addNote }) {
  return (
    <div className="flex items-center justify-between gap-2 px-0">
      <h1 className="text-xl font-semibold flex items-center gap-2">
        <span className="w-6 h-6 inline-block">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-notebook-pen"
          >
            <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"></path>
            <path d="M6 2v4"></path>
            <path d="M18 2v4"></path>
            <path d="M6 10h4"></path>
            <path d="M6 14h2"></path>
            <path d="M15.4 11.3l-3.6 3.6a1 1 0 0 0-.3.6l-.2 1.6a.5.5 0 0 0 .6.6l1.6-.2a1 1 0 0 0 .6-.3l3.6-3.6a1.4 1.4 0 0 0-2-2Z"></path>
          </svg>
        </span>
        CleverPad
      </h1>

      <div className="flex items-center gap-2">
        <button
          className="px-4 py-2 bg-zinc-800 text-white hover:bg-zinc-700 active:bg-black transition rounded-2xl shadow"
          onClick={addNote}
          aria-label="Add note"
        >
          +
        </button>
      </div>
    </div>
  );
}
