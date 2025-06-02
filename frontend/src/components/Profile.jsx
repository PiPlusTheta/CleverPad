import React from "react";
import { User, LogOut } from "lucide-react";

export default function Profile({ user, onLogout }) {
  return (    <div className="flex items-center gap-3 bg-chatgpt-bg-element border border-chatgpt-border rounded-lg shadow-sm px-4 py-3">
      <div className="flex items-center justify-center w-8 h-8 bg-chatgpt-green rounded-full">
        <User className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-chatgpt-text-primary text-xs block truncate">
          {user.name}
        </span>
        <span className="text-xs text-chatgpt-text-secondary">
          {user.name === "Guest" ? "Guest User" : "Logged in"}
        </span>
      </div>
      <button
        onClick={onLogout}
        className="p-2 text-chatgpt-text-secondary hover:text-chatgpt-text-primary hover:bg-chatgpt-bg-primary rounded-lg transition-colors duration-200"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
