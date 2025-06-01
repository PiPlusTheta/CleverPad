import React from "react";
export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`border border-zinc-400 dark:border-zinc-700 rounded-2xl p-4 bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm transition-all ${className}`}
      {...props}
    />
  );
}
