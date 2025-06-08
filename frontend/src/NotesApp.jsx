import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Download,
  Upload,
  Settings,
  FileDown,
  FolderOpen
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
import { ToastContainer } from "./components/Toast";

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
  const [search, setSearch] = useState("");  // ──────────────────────────────────────────────────────────────────────────────
  // Theme state ("light" | "dark" | "system")
  // ──────────────────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  // ──────────────────────────────────────────────────────────────────────────────
  // Quick Actions state
  // ──────────────────────────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const importAllNotesRef = useRef();

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = theme === "dark" || (theme === "system" && prefersDark);

    root.classList.toggle("dark", shouldDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ──────────────────────────────────────────────────────────────────────────────
  // Keyboard shortcuts for Quick Actions
  // ──────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeydown = (event) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd) {
        switch (event.key) {
          case 'e':
            // Ctrl+E or Cmd+E: Export all notes
            if (notes.length > 0 && !isExporting) {
              event.preventDefault();
              exportAllNotesAsZip();
            }
            break;
          case 'i':
            // Ctrl+I or Cmd+I: Import notes
            if (!isImporting) {
              event.preventDefault();
              importAllNotesRef.current?.click();
            }
            break;
          case ',':
            // Ctrl+, or Cmd+,: Open settings (common convention)
            event.preventDefault();
            setShowSettings(true);
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [notes.length, isExporting, isImporting]);

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
  // ──────────────────────────────────────────────────────────────────────────────
  // Quick Actions functionality  // ──────────────────────────────────────────────────────────────────────────────
  const exportAllNotesAsZip = async () => {
    if (notes.length === 0) {
      alert('No notes to export');
      return;
    }

    setIsExporting(true);
    try {
      // Import JSZip dynamically
      const JSZip = (await import('jszip')).default;
      
      const zip = new JSZip();
      const notesFolder = zip.folder("CleverPad_Notes");
      
      // Helper function to sanitize filename
      const sanitizeFilename = (name) => {
        return name.replace(/[<>:"/\\|?*]/g, '_').trim();
      };

      // Create a summary file
      let summary = `# CleverPad Export Summary\n\n`;
      summary += `**Export Date:** ${new Date().toLocaleString()}\n`;
      summary += `**Total Notes:** ${notes.length}\n`;
      summary += `**User:** ${user?.name || 'Guest'}\n\n`;
      summary += `## Notes List\n\n`;

      notes.forEach((note, index) => {
        const title = note.title || `Untitled_${index + 1}`;
        const sanitizedTitle = sanitizeFilename(title);
        
        // Add to summary
        summary += `${index + 1}. **${title}**\n`;
        summary += `   - Created: ${new Date(note.created_at).toLocaleString()}\n`;
        summary += `   - Modified: ${new Date(note.updated_at).toLocaleString()}\n`;
        summary += `   - Word Count: ${note.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length}\n\n`;
        
        // Export as markdown
        let markdown = note.content
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
          .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
          .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
          .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
          .replace(/<u[^>]*>(.*?)<\/u>/gi, '$1')
          .replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
          .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
          .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n')
          .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n')
          .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        
        // Add metadata header to markdown file
        const markdownWithMetadata = `---
title: "${title}"
created: ${note.created_at}
updated: ${note.updated_at}
exported: ${new Date().toISOString()}
---

# ${title}

${markdown}`;
        
        notesFolder.file(`${sanitizedTitle}.md`, markdownWithMetadata);
        
        // Also export as JSON with metadata
        const noteData = {
          title: note.title,
          content: note.content,
          created_at: note.created_at,
          updated_at: note.updated_at,
          exported_at: new Date().toISOString(),
          word_count: note.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length
        };
        notesFolder.file(`${sanitizedTitle}.json`, JSON.stringify(noteData, null, 2));
      });

      // Add summary file
      zip.file("README.md", summary);

      // Generate and download zip
      const content = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      });
      
      const href = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = href;
      a.download = `CleverPad_Export_${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(href);
        alert(`Successfully exported ${notes.length} notes with summary!`);
    } catch (error) {
      console.error('Error exporting notes:', error);
      alert('Failed to export notes. Make sure you have an internet connection for the first export.');
    } finally {
      setIsExporting(false);
    }
  };  const importAllNotes = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;
    const maxFiles = 50; // Limit to prevent overwhelming the system

    if (files.length > maxFiles) {
      alert(`Too many files selected. Please select no more than ${maxFiles} files at once.`);
      setIsImporting(false);
      return;
    }

    // Show progress for large imports
    if (files.length > 5) {
      console.log(`Starting import of ${files.length} files...`);
    }

    for (const file of files) {
      try {
        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (ev) => {
            try {
              let htmlContent = '';
              let importedTitle = file.name.replace(/\.(md|json)$/, '');
              
              if (file.name.endsWith('.md')) {
                // Import marked dynamically
                const { marked } = await import('marked');
                const markdownContent = ev.target.result;
                
                // Extract title from markdown if available
                const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
                if (titleMatch) {
                  importedTitle = titleMatch[1].trim();
                }
                
                htmlContent = await marked.parse(markdownContent);
              } else if (file.name.endsWith('.json')) {
                const jsonData = JSON.parse(ev.target.result);
                htmlContent = jsonData.content || '';
                importedTitle = jsonData.title || importedTitle;
              } else {
                reject(new Error('Unsupported file type'));
                return;
              }

              // Ensure we don't import empty notes
              if (!htmlContent.trim() && !importedTitle.trim()) {
                reject(new Error('Empty note content'));
                return;
              }

              // Create new note
              if (user?.token) {
                // Authenticated user
                const res = await fetch("http://localhost:8000/notes/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                  },
                  body: JSON.stringify({ title: importedTitle, content: htmlContent })
                });
                
                if (!res.ok) {
                  throw new Error(`Server error: ${res.status}`);
                }
                
                const newNote = await res.json();
                setNotes((prev) => [newNote, ...prev]);
              } else if (user?.name === "Guest") {
                // Guest user
                const newNote = {
                  id: Date.now().toString() + Math.random(),
                  title: importedTitle,
                  content: htmlContent,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                setNotes((prev) => [newNote, ...prev]);
              }
              
              successCount++;
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
      } catch (error) {
        console.error(`Error importing ${file.name}:`, error);
        errorCount++;
      }
    }

    // Reset file input
    event.target.value = '';
    
    // Show detailed result
    if (successCount > 0 && errorCount === 0) {
      alert(`Successfully imported ${successCount} notes!`);
    } else if (successCount > 0 && errorCount > 0) {
      alert(`Import completed: ${successCount} successful, ${errorCount} failed.\nCheck console for error details.`);
    } else {
      alert('Failed to import any notes. Please check the file formats and try again.');
    }
    
    setIsImporting(false);
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
                  </div>                    {/* Quick Actions - Fixed at bottom */}
                  <div className="flex-shrink-0 p-4 border-t border-chatgpt-border">
                    <h3 className="text-xs font-semibold text-chatgpt-text-primary mb-2 px-1">Quick Actions</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={exportAllNotesAsZip}
                        disabled={notes.length === 0 || isExporting}
                        className={`w-full text-left p-2 rounded-lg transition-colors duration-200 text-xs flex items-center gap-2 ${
                          notes.length === 0 || isExporting
                            ? 'opacity-50 cursor-not-allowed text-chatgpt-text-secondary'
                            : 'hover:bg-chatgpt-bg-element text-chatgpt-text-secondary hover:text-chatgpt-text-primary'
                        }`}
                        title={notes.length === 0 ? 'No notes to export' : 'Export all notes as ZIP'}
                      >
                        <Download className="w-3 h-3" />
                        {isExporting ? 'Exporting...' : 'Export All Notes'}
                      </button>
                      <button 
                        onClick={() => importAllNotesRef.current?.click()}
                        disabled={isImporting}
                        className={`w-full text-left p-2 rounded-lg transition-colors duration-200 text-xs flex items-center gap-2 ${
                          isImporting
                            ? 'opacity-50 cursor-not-allowed text-chatgpt-text-secondary'
                            : 'hover:bg-chatgpt-bg-element text-chatgpt-text-secondary hover:text-chatgpt-text-primary'
                        }`}
                        title="Import multiple .md or .json files"
                      >
                        <Upload className="w-3 h-3" />
                        {isImporting ? 'Importing...' : 'Import Notes'}
                      </button>
                      <button 
                        onClick={() => setShowSettings(true)}
                        className="w-full text-left p-2 rounded-lg hover:bg-chatgpt-bg-element transition-colors duration-200 text-xs text-chatgpt-text-secondary hover:text-chatgpt-text-primary flex items-center gap-2"
                        title="Open application settings"
                      >
                        <Settings className="w-3 h-3" />
                        Settings
                      </button>
                    </div>
                    
                    {/* Hidden file input for importing multiple notes */}
                    <input
                      type="file"
                      accept=".md,.json"
                      multiple
                      ref={importAllNotesRef}
                      onChange={importAllNotes}
                      style={{ display: 'none' }}
                    />
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
      )}      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-chatgpt-bg-primary rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-chatgpt-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-chatgpt-text-primary">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-chatgpt-bg-element transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-chatgpt-text-secondary" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Theme Settings */}
                <div>
                  <h3 className="text-sm font-medium text-chatgpt-text-primary mb-3">Appearance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-chatgpt-text-secondary">Theme</span>
                      <ThemeToggle theme={theme} setTheme={setTheme} />
                    </div>
                  </div>
                </div>
                
                {/* Data Management */}
                <div>
                  <h3 className="text-sm font-medium text-chatgpt-text-primary mb-3">Data Management</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-chatgpt-text-secondary">Total Notes</div>
                        <div className="text-xs text-chatgpt-text-secondary opacity-70">{notes.length} notes stored</div>
                      </div>
                      <span className="text-sm font-medium text-chatgpt-text-primary">{notes.length}</span>
                    </div>
                    
                    {user?.name === "Guest" && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="text-sm text-orange-800 dark:text-orange-200 font-medium mb-1">Guest Mode</div>
                        <div className="text-xs text-orange-600 dark:text-orange-300">
                          Your notes are stored locally. Create an account to sync across devices.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                  {/* Export Options */}
                <div>
                  <h3 className="text-sm font-medium text-chatgpt-text-primary mb-3">Export & Import</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        exportAllNotesAsZip();
                        setShowSettings(false);
                      }}
                      disabled={notes.length === 0 || isExporting}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 text-sm flex items-center gap-3 ${
                        notes.length === 0 || isExporting
                          ? 'opacity-50 cursor-not-allowed text-chatgpt-text-secondary'
                          : 'hover:bg-chatgpt-bg-element text-chatgpt-text-secondary hover:text-chatgpt-text-primary'
                      }`}
                    >
                      <FileDown className="w-4 h-4" />
                      <div>
                        <div className="font-medium">
                          {isExporting ? 'Exporting...' : 'Export All Notes'}
                        </div>
                        <div className="text-xs opacity-70">
                          {notes.length === 0 
                            ? 'No notes available to export' 
                            : `Download ${notes.length} notes as ZIP archive`
                          }
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        importAllNotesRef.current?.click();
                        setShowSettings(false);
                      }}
                      disabled={isImporting}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 text-sm flex items-center gap-3 ${
                        isImporting
                          ? 'opacity-50 cursor-not-allowed text-chatgpt-text-secondary'
                          : 'hover:bg-chatgpt-bg-element text-chatgpt-text-secondary hover:text-chatgpt-text-primary'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4" />
                      <div>
                        <div className="font-medium">
                          {isImporting ? 'Importing...' : 'Import Notes'}
                        </div>
                        <div className="text-xs opacity-70">Import multiple .md or .json files</div>
                      </div>
                    </button>
                  </div>
                </div>
                  {/* Storage Information */}
                <div>
                  <h3 className="text-sm font-medium text-chatgpt-text-primary mb-3">Storage</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-chatgpt-bg-element rounded-lg">
                      <div className="text-xs text-chatgpt-text-secondary space-y-1">
                        <div className="flex justify-between">
                          <span>Storage Type:</span>
                          <span className="font-medium">
                            {user?.name === "Guest" ? "Local Browser" : "Cloud Sync"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Notes Count:</span>
                          <span className="font-medium">{notes.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Size:</span>
                          <span className="font-medium">
                            {(JSON.stringify(notes).length / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Keyboard Shortcuts */}
                <div>
                  <h3 className="text-sm font-medium text-chatgpt-text-primary mb-3">Keyboard Shortcuts</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-chatgpt-bg-element rounded-lg">
                      <div className="text-xs text-chatgpt-text-secondary space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Export All Notes</span>
                          <code className="px-2 py-1 bg-chatgpt-bg-primary rounded text-xs font-mono">
                            {navigator.platform.includes('Mac') ? '⌘E' : 'Ctrl+E'}
                          </code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Import Notes</span>
                          <code className="px-2 py-1 bg-chatgpt-bg-primary rounded text-xs font-mono">
                            {navigator.platform.includes('Mac') ? '⌘I' : 'Ctrl+I'}
                          </code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Open Settings</span>
                          <code className="px-2 py-1 bg-chatgpt-bg-primary rounded text-xs font-mono">
                            {navigator.platform.includes('Mac') ? '⌘,' : 'Ctrl+,'}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* App Info */}
                <div className="pt-4 border-t border-chatgpt-border">
                  <div className="text-center">
                    <div className="text-sm font-medium text-chatgpt-text-primary mb-1">CleverPad</div>
                    <div className="text-xs text-chatgpt-text-secondary">
                      A modern note-taking application
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
