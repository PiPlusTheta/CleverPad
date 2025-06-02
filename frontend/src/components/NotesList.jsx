import React from "react";
import { motion } from "framer-motion";

export default function NotesList({ notes, activeId, openNote }) {
  return (
    <nav className="overflow-y-auto flex-1 flex flex-col gap-1">
      {notes.map(note => (
        <motion.button
          key={note.id}
          whileHover={{ scale: 1.01 }}
          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
            note.id === activeId 
              ? "bg-chatgpt-accent text-white shadow-sm" 
              : "hover:bg-chatgpt-bg-element text-chatgpt-text-primary border border-transparent hover:border-chatgpt-border"
          }`}
          onClick={() => openNote(note.id)}
        >          <div className={`line-clamp-1 font-medium text-xs ${
            note.id === activeId ? "text-white" : "text-chatgpt-text-primary"
          }`}>
            {note.title || "Untitled"}
          </div>
          <div className={`text-xs line-clamp-2 mt-1 ${
            note.id === activeId ? "text-white opacity-80" : "text-chatgpt-text-secondary"
          }`}>
            {note.content ? note.content.replace(/<[^>]*>/g, '').substring(0, 80) : "Empty note"}
          </div>
        </motion.button>
      ))}
    </nav>
  );
}
