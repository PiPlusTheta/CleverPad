import React from "react";
export function Input({ className = "", ...props }) {
  return <input className={`border rounded p-2 ${className}`} {...props} />;
}
