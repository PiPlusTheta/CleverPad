import React, { useState, useEffect } from "react";
import SidebarHeader from "./components/SidebarHeader";
import NotesSearch from "./components/NotesSearch";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import EmptyState from "./components/EmptyState";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import ThemeToggle from "./components/ThemeToggle";

export default function NotesApp() {
  // ──────────────────────────────────────────────────────────────────────────────
  // Notes state
  // ──────────────────────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [titleDraft, setTitleDraft] = useState("");
  const [search, setSearch] = useState("");

  // ──────────────────────────────────────────────────────────────────────────────
  // Theme state ("light" | "dark" | "system")
  // ──────────────────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = theme === "dark" || (theme === "system" && prefersDark);

    root.classList.toggle("dark", shouldDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ──────────────────────────────────────────────────────────────────────────────
  // Auth state
  // ──────────────────────────────────────────────────────────────────────────────
  const [user, setUserState] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState("login");
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Persist user to localStorage on login/signup
  const setUser = (userObj) => {
    setUserState(userObj);
    if (userObj) {
      localStorage.setItem("user", JSON.stringify(userObj));
    } else {
      localStorage.removeItem("user");
    }
  };

  const handleLogin = setUser;
  const handleSignup = setUser;
  const handleLogout = () => {
    setUser(null);
    setAuthMode("login");
    setNotes([]);
    setActiveId(null);
    setTitleDraft("");
    setDraft("");
  };
  const handleContinueAsGuest = () => setUser({ name: "Guest" });

  // ──────────────────────────────────────────────────────────────────────────────
  // Fetch notes from backend when user logs in
  // ──────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setActiveId(null);
      setTitleDraft("");
      setDraft("");
      return;
    }
    setLoadingNotes(true);
    const fetchOptions = user.token
      ? { headers: { Authorization: `Bearer ${user.token}` } }
      : {};
    fetch("http://localhost:8000/notes/", fetchOptions)
      .then(res => res.json())
      .then(data => {
        setNotes(data);
        if (data.length > 0) {
          setActiveId(data[0].id);
          setTitleDraft(data[0].title);
          setDraft(data[0].content);
        } else {
          setActiveId(null);
          setTitleDraft("");
          setDraft("");
        }
      })
      .finally(() => setLoadingNotes(false));
  }, [user]);

  // ──────────────────────────────────────────────────────────────────────────────
  // Notes helpers
  // ──────────────────────────────────────────────────────────────────────────────
  const saveNote = async () => {
    if (activeId === null || !user?.token) return;
    await fetch(`http://localhost:8000/notes/${activeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ title: titleDraft, content: draft }),
    });
    const res = await fetch("http://localhost:8000/notes/", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const data = await res.json();
    setNotes(data);
  };
  const addNote = async () => {
    if (!user?.token) return;
    const now = new Date();
    const dateTime = now.toLocaleString();
    const defaultTitle = `Untitled - ${dateTime}`;
    
    const res = await fetch("http://localhost:8000/notes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ title: defaultTitle, content: "" }),
    });
    const newNote = await res.json();
    setNotes(prev => [newNote, ...prev]);
    setActiveId(newNote.id);
    setTitleDraft(newNote.title);
    setDraft(newNote.content);
    setSearch("");
  };

  const deleteNote = async id => {
    if (id === null || !user?.token) return;
    await fetch(`http://localhost:8000/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (id === activeId) {
      const first = remaining[0];
      if (first) {
        setActiveId(first.id);
        setTitleDraft(first.title);
        setDraft(first.content);
      } else {
        setActiveId(null);
        setTitleDraft("");
        setDraft("");
      }
    }
  };

  const openNote = id => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    setActiveId(id);
    setTitleDraft(note.title);
    setDraft(note.content);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-[20rem_1fr_10rem] bg-white dark:bg-zinc-950 text-black dark:text-zinc-100">
      

      {/* Auth Modals */}
      {!user && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-40 p-4">
          {authMode === "login" ? (
            <Login
              onLogin={handleLogin}
              switchToSignup={() => setAuthMode("signup")}
              onContinueAsGuest={handleContinueAsGuest}
            />
          ) : (
            <Signup onSignup={handleSignup} switchToLogin={() => setAuthMode("login")} />
          )}
        </div>
      )}

      {/* Sidebar */}
      <aside className="bg-zinc-100 dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-4 w-full md:w-auto max-h-[70vh] md:max-h-none overflow-y-auto">
        <SidebarHeader addNote={addNote} />
        <NotesSearch search={search} setSearch={setSearch} />
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          <NotesList notes={filteredNotes} activeId={activeId} openNote={openNote} />
        </div>
        <div className="mt-4 md:mt-auto">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </aside>

      {/* Editor */}
      <main className="flex flex-col h-full p-4 sm:p-6 gap-4 overflow-y-auto">
        {activeId !== null ? (
          <div className="flex-1 border rounded-2xl bg-white dark:bg-zinc-900 p-2">
            <NoteEditor
              titleDraft={titleDraft}
              setTitleDraft={setTitleDraft}
              draft={draft}
              setDraft={setDraft}
              saveNote={saveNote}
              deleteNote={deleteNote}
              activeId={activeId}
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
      {/* Profile */}
      {user && (
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 max-w-[10rem] sm:max-w-none">
          <Profile user={user} onLogout={handleLogout} />
        </div>
      )}
    </div>
  );
}
