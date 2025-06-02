import React from "react";

export function Card({ className = "", children }) {
  return (
    <div className={`bg-chatgpt-bg-element border border-chatgpt-border rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
