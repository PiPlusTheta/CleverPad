import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from "lucide-react";
import SidebarHeader from "./components/SidebarHeader";
import NotesSearch from "./components/NotesSearch";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import EmptyState from "./components/EmptyState";
import WelcomeScreen from "./components/WelcomeScreen";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import ThemeToggle from "./components/ThemeToggle";
import NotesStatistics from "./components/NotesStatistics";

export default function NotesApp() {
  // ──────────────────────────────────────────────────────────────────────────────
  // UI State
  // ──────────────────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

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
    setLoadingNotes(true);    const fetchOptions = user.token
      ? { headers: { Authorization: `Bearer ${user.token}` } }
      : {};
    
    fetch("http://localhost:8000/notes/", fetchOptions)
      .then((res) => res.json())
      .then((data) => {
        setNotes(data);
        // Don't automatically select the first note - show welcome screen instead
        setActiveId(null);
        setTitleDraft("");
        setDraft("");
      })
      .finally(() => setLoadingNotes(false));
  }, [user]);

  // ──────────────────────────────────────────────────────────────────────────────
  // Notes helpers
  // ──────────────────────────────────────────────────────────────────────────────
  
  const saveNote = async () => {
    if (activeId === null) return;
    
    if (user?.token) {
      // Authenticated user - save to backend
      try {
        await fetch(`http://localhost:8000/notes/${activeId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ title: titleDraft, content: draft })
        });
        
        // Refresh notes list to ensure consistency
        const res = await fetch("http://localhost:8000/notes/", {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        setNotes(data);
      } catch (error) {
        console.error('Failed to save note:', error);
      }
    } else if (user?.name === "Guest") {
      // Guest user - save to local state
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === activeId 
            ? { 
                ...note, 
                title: titleDraft, 
                content: draft, 
                updated_at: new Date().toISOString() 
              }
            : note
        )
      );
    }
  };

  const addNote = async () => {
    if (user?.token) {
      // Authenticated user
      const now = new Date();
      const dateTime = now.toLocaleString();
      const defaultTitle = `Untitled - ${dateTime}`;

      const res = await fetch("http://localhost:8000/notes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ title: defaultTitle, content: "" })
      });
      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
      setActiveId(newNote.id);
      setTitleDraft(newNote.title);
      setDraft(newNote.content);
      setSearch("");
    } else if (user?.name === "Guest") {
      // Guest user
      const now = new Date();
      const dateTime = now.toLocaleString();
      const defaultTitle = `Untitled - ${dateTime}`;
      
      const newNote = {
        id: Date.now().toString(),
        title: defaultTitle,
        content: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setNotes((prev) => [newNote, ...prev]);
      setActiveId(newNote.id);
      setTitleDraft(newNote.title);
      setDraft(newNote.content);
      setSearch("");
    }
  };
  const addNoteFromImport = async (importTitle, importContent) => {
    if (user?.token) {
      // Authenticated user - save to backend
      const res = await fetch("http://localhost:8000/notes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ title: importTitle, content: importContent })
      });
      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
      setActiveId(newNote.id);
      setTitleDraft(newNote.title);
      setDraft(newNote.content);
      setSearch("");
      
      // Trigger save after a short delay to ensure the content is properly set
      setTimeout(() => {
        saveNote();
      }, 100);
    } else if (user?.name === "Guest") {
      // Guest user - create local note
      const newNote = {
        id: Date.now().toString(),
        title: importTitle,
        content: importContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setNotes((prev) => [newNote, ...prev]);
      setActiveId(newNote.id);
      setTitleDraft(newNote.title);
      setDraft(newNote.content);
      setSearch("");
    }
  };
  const deleteNote = async (id) => {
    if (id === null) return;
    
    if (user?.token) {
      // Authenticated user - delete from backend
      try {
        await fetch(`http://localhost:8000/notes/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
    
    // Update local state for both authenticated and guest users
    const remaining = notes.filter((n) => n.id !== id);
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
  const openNote = (id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setActiveId(id);
    setTitleDraft(note.title);
    setDraft(note.content);
  };

  const showWelcomeScreen = () => {
    setActiveId(null);
    setTitleDraft("");
    setDraft("");
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen overflow-hidden bg-chatgpt-bg-primary text-chatgpt-text-primary flex">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* Left Sidebar */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-screen bg-chatgpt-bg-secondary border-r border-chatgpt-border z-50 transform transition-all duration-300 ease-in-out flex flex-col overflow-hidden justify-between ${
          sidebarOpen
            ? "translate-x-0 w-80"
            : "-translate-x-full lg:translate-x-0 lg:w-16"
        }`}
      >
        <div>          {/* Sidebar header: Only show hamburger when collapsed */}
          <div className="flex items-center justify-between p-4 border-b border-chatgpt-border">
            {sidebarOpen ? (
              <button 
                onClick={showWelcomeScreen}
                className="flex items-center gap-2 hover:bg-chatgpt-bg-element rounded-lg p-2 transition-colors duration-200 -ml-2"
                title="Go to welcome screen"
              >
                <span className="w-4 h-4 inline-block text-chatgpt-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-notebook-pen"
                  >
                    <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"></path>
                    <path d="M6 2v4"></path>
                    <path d="M18 2v4"></path>
                    <path d="M6 10h4"></path>
                    <path d="M6 14h2"></path>
                    <path d="M15.4 11.3l-3.6 3.6a1 1 0 0 0-.3.6l-.2 1.6a.5.5 0 0 0 .6.6l1.6-.2a1 1 0 0 0 .6-.3l3.6-3.6a1.4 1.4 0 0 0-2-2Z"></path>
                  </svg>
                </span>
                <h1 className="text-sm font-medium text-chatgpt-text-primary">CleverPad</h1>
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-chatgpt-bg-element transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-chatgpt-text-secondary" />
            </button>
          </div>
          {/* Sidebar content: Only show when expanded */}
          {sidebarOpen && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                <SidebarHeader addNote={addNote} />
                <NotesSearch search={search} setSearch={setSearch} />
                <NotesList
                  notes={filteredNotes}
                  activeId={activeId}
                  openNote={openNote}
                />
              </div>

              
            </div>
          )}
        </div>
        {/* Theme toggle fixed at bottom */}
        {sidebarOpen && (
          <div className="border-t border-chatgpt-border p-4 mt-auto">
            <ThemeToggle
              theme={theme}
              setTheme={setTheme}
              iconOnly={!sidebarOpen}
            />
          </div>
        )}
      </aside>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* Main Content */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-chatgpt-bg-primary transition-all duration-300 ease-in-out">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-chatgpt-bg-secondary border-b border-chatgpt-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-chatgpt-bg-element transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-chatgpt-text-secondary" />
          </button>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 flex min-h-0">         {/* Editor Area */}          <div className="flex-1 flex flex-col min-h-0">            {activeId !== null ? (
              <div className="flex-1 h-full bg-chatgpt-bg-primary">
                <NoteEditor
                  titleDraft={titleDraft}
                  setTitleDraft={setTitleDraft}
                  draft={draft}
                  setDraft={setDraft}
                  saveNote={saveNote}
                  deleteNote={deleteNote}
                  activeId={activeId}
                  onCreateNoteFromImport={addNoteFromImport}
                />
              </div>
            ) : (
              <WelcomeScreen onCreateNote={addNote} hasNotes={notes.length > 0} />
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────────────── */}
          {/* Right Sidebar (Profile) – collapsible */}
          {/* ──────────────────────────────────────────────────────────────────── */}
          {user && (
            <div
              className={`hidden xl:flex flex-col h-full min-h-0 overflow-y-auto bg-chatgpt-bg-secondary border-l border-chatgpt-border transition-all duration-300 ease-in-out ${rightSidebarOpen ? "w-64" : "w-16"}`}
            >              {/* Header with collapse/expand control */}
              <div className="flex items-center justify-between p-2 border-b border-chatgpt-border">
                {rightSidebarOpen && (
                  <span className="text-sm font-medium text-chatgpt-text-primary">
                    Statistics
                  </span>
                )}
                <button
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-chatgpt-bg-element transition-colors duration-200"
                  aria-label="Toggle statistics panel"
                >
                  {rightSidebarOpen ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              </div>              {/* Collapsed state - show icon */}
              {!rightSidebarOpen && (
                <div className="flex flex-col items-center justify-center flex-1 py-4">
                  <div className="p-3 rounded-lg bg-chatgpt-bg-element border border-chatgpt-border">
                    <BarChart3 className="w-5 h-5 text-chatgpt-text-secondary" />
                  </div>
                </div>
              )}              {rightSidebarOpen && (
                <div className="flex-1 flex flex-col h-full min-h-0">
                  {/* Profile Section - Fixed height */}
                  <div className="flex-shrink-0 p-4 border-b border-chatgpt-border">
                    <h3 className="text-xs font-semibold text-chatgpt-text-primary mb-2 px-1">Profile</h3>
                    <Profile user={user} onLogout={handleLogout} />
                  </div>
                  
                  {/* Statistics Section - Flexible, fills remaining space */}
                  <div className="flex-1 min-h-0 p-4">
                    <NotesStatistics 
                      notes={notes} 
                      activeNote={activeId ? notes.find(n => n.id === activeId) : null}
                      search={search}
                    />
                  </div>
                  
                  {/* Quick Actions - Fixed at bottom */}
                  <div className="flex-shrink-0 p-4 border-t border-chatgpt-border">
                    <h3 className="text-xs font-semibold text-chatgpt-text-primary mb-2 px-1">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left p-2 rounded-lg hover:bg-chatgpt-bg-element transition-colors duration-200 text-xs text-chatgpt-text-secondary hover:text-chatgpt-text-primary">
                        Export All Notes
                      </button>
                      <button className="w-full text-left p-2 rounded-lg hover:bg-chatgpt-bg-element transition-colors duration-200 text-xs text-chatgpt-text-secondary hover:text-chatgpt-text-primary">
                        Import Notes
                      </button>
                      <button className="w-full text-left p-2 rounded-lg hover:bg-chatgpt-bg-element transition-colors duration-200 text-xs text-chatgpt-text-secondary hover:text-chatgpt-text-primary">
                        Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Profile (Floating) */}
      {user && (
        <div className="xl:hidden fixed top-4 right-4 z-30">
          <Profile user={user} onLogout={handleLogout} />
        </div>
      )}

      {/* Auth Modals */}
      {!user && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-chatgpt-bg-primary rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {authMode === "login" ? (
              <Login
                onLogin={handleLogin}
                switchToSignup={() => setAuthMode("signup")}
                onContinueAsGuest={handleContinueAsGuest}
              />
            ) : (
              <Signup
                onSignup={handleSignup}
                switchToLogin={() => setAuthMode("login")}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
