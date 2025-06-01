import React from "react";
import { Input } from "./ui/input";

export default function NotesSearch({ search, setSearch }) {
  return (
    <div className="relative w-full">
      <Input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search notes..."
        className="pr-10 rounded-2xl w-full"
      />
    </div>
  );
}
