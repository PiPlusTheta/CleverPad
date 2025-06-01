import React from "react";
import { User } from "lucide-react";

export default function Profile({ user, onLogout }) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-2xl shadow px-4 py-2">
      <User className="w-5 h-5 text-zinc-500" />
      <span className="font-medium text-zinc-800 dark:text-zinc-100">
        {user.name.split(' ')[0]}
      </span>
      <button
        onClick={onLogout}
        className="ml-2 text-xs text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        Logout
      </button>
    </div>
  );
}
