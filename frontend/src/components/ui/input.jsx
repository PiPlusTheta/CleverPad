import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input 
      className={`w-full px-4 py-2 bg-chatgpt-bg-element border border-chatgpt-border rounded-lg text-chatgpt-text-primary placeholder-chatgpt-text-secondary focus:outline-none focus:ring-2 focus:ring-chatgpt-accent focus:border-transparent transition-all duration-200 ${className}`} 
      {...props} 
    />
  );
}
