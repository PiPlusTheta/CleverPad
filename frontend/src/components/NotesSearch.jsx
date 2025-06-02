import React from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

export default function NotesSearch({ search, setSearch }) {
  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-chatgpt-text-secondary">
        <Search className="w-4 h-4" />
      </div>
      <Input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search notes..."
        className="pl-10"
      />
    </div>
  );
}
