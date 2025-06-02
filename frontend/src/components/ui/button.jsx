import React from "react";

export function Button({ className = "", variant = "default", size = "default", children, ...props }) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-chatgpt-accent focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
    default: "bg-chatgpt-accent hover:opacity-80 text-white shadow-sm hover:shadow-md",
    ghost: "hover:bg-chatgpt-bg-element text-chatgpt-text-secondary hover:text-chatgpt-text-primary",
    outline: "border border-chatgpt-border bg-transparent hover:bg-chatgpt-bg-element text-chatgpt-text-primary",
    destructive: "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md"
  };
  
  const sizes = {
    default: "px-4 py-2 rounded-lg text-sm",
    sm: "px-3 py-1.5 rounded-md text-xs",
    lg: "px-6 py-3 rounded-lg text-base",
    icon: "p-2 rounded-lg"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
