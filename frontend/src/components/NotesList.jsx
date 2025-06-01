import React from "react";
import { motion } from "framer-motion";

export default function NotesList({ notes, activeId, openNote }) {
  return (
    <nav className="overflow-y-auto flex-1 flex flex-col gap-2">
      {notes.map(note => (
        <motion.button
          key={note.id}
          whileHover={{ scale: 1.02 }}
          className={`w-full text-left p-3 rounded-2xl transition ${
            note.id === activeId ? "bg-zinc-900 text-white shadow" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
          onClick={() => openNote(note.id)}
        >
          <div className="line-clamp-1 font-medium">{note.title || "Untitled"}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
            {note.content || "Empty note"}
          </div>
        </motion.button>
      ))}
    </nav>
  );
}
