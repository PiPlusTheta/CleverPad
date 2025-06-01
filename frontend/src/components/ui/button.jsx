import React from "react";
export function Button({ className = "", children, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-700 active:bg-black transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
