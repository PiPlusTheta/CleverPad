import React from "react";
export function Card({ className = "", children }) {
  return <div className={`bg-white dark:bg-zinc-900 border rounded-lg shadow ${className}`}>{children}</div>;
}
export function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}
