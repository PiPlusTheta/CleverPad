import React, { useMemo } from "react";
import { 
  FileText, 
  Clock, 
  Calendar, 
  BarChart3, 
  TrendingUp,
  Archive,
  Search,
  Bookmark
} from "lucide-react";
import { Card, CardContent } from "./ui/card";

export default function NotesStatistics({ notes, activeNote, search }) {
  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const totalWords = notes.reduce((sum, note) => {
      const textContent = note.content.replace(/<[^>]*>/g, ''); // Strip HTML
      return sum + textContent.split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    
    const totalCharacters = notes.reduce((sum, note) => {
      const textContent = note.content.replace(/<[^>]*>/g, '');
      return sum + textContent.length;
    }, 0);

    // Get recent notes (within last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentNotes = notes.filter(note => {
      const noteDate = new Date(note.created_at || note.updated_at || now);
      return noteDate >= weekAgo;
    });

    // Get today's notes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayNotes = notes.filter(note => {
      const noteDate = new Date(note.created_at || note.updated_at || now);
      return noteDate >= today && noteDate < tomorrow;
    });

    // Average words per note
    const avgWords = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;

    // Longest note
    const longestNote = notes.reduce((longest, note) => {
      const textContent = note.content.replace(/<[^>]*>/g, '');
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
      return wordCount > longest.words ? { note, words: wordCount } : longest;
    }, { note: null, words: 0 });

    // Search results count
    const searchResults = search ? notes.filter(note => 
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
    ).length : null;

    return {
      totalNotes,
      totalWords,
      totalCharacters,
      recentNotes: recentNotes.length,
      todayNotes: todayNotes.length,
      avgWords,
      longestNote,
      searchResults
    };
  }, [notes, search]);

  const currentNoteStats = useMemo(() => {
    if (!activeNote) return null;
    
    const textContent = activeNote.content.replace(/<[^>]*>/g, '');
    const words = textContent.split(/\s+/).filter(word => word.length > 0).length;
    const characters = textContent.length;
    const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    return {
      words,
      characters,
      paragraphs,
      readingTime: Math.ceil(words / 200) // Assuming 200 WPM reading speed
    };
  }, [activeNote]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "text-chatgpt-text-primary" }) => (
    <Card className="bg-chatgpt-bg-element border-chatgpt-border">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-xs font-medium text-chatgpt-text-primary">{title}</span>
        </div>
        <div className="text-lg font-bold text-chatgpt-text-primary">{value}</div>
        {subtitle && (
          <div className="text-xs text-chatgpt-text-secondary">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Search Results */}
      {search && stats.searchResults !== null && (
        <Card className="bg-chatgpt-bg-element border-chatgpt-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Search className="w-4 h-4 text-chatgpt-green" />
              <span className="text-xs font-medium text-chatgpt-text-primary">Search Results</span>
            </div>
            <div className="text-lg font-bold text-chatgpt-text-primary">{stats.searchResults}</div>
            <div className="text-xs text-chatgpt-text-secondary">
              for "{search.length > 15 ? search.substring(0, 15) + '...' : search}"
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Note Stats */}
      {currentNoteStats && (
        <div>
          <h3 className="text-xs font-semibold text-chatgpt-text-primary mb-2 px-1">Current Note</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              icon={FileText}
              title="Words"
              value={currentNoteStats.words.toLocaleString()}
              color="text-chatgpt-green"
            />
            <StatCard
              icon={BarChart3}
              title="Characters"
              value={currentNoteStats.characters.toLocaleString()}
              color="text-blue-500"
            />
            <StatCard
              icon={Archive}
              title="Paragraphs"
              value={currentNoteStats.paragraphs}
              color="text-purple-500"
            />
            <StatCard
              icon={Clock}
              title="Read Time"
              value={`${currentNoteStats.readingTime}m`}
              subtitle="~200 WPM"
              color="text-orange-500"
            />
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div>
        <h3 className="text-xs font-semibold text-chatgpt-text-primary mb-2 px-1">Overview</h3>
        <div className="space-y-2">
          <StatCard
            icon={FileText}
            title="Total Notes"
            value={stats.totalNotes.toLocaleString()}
            subtitle={stats.totalNotes === 1 ? "note" : "notes"}
            color="text-chatgpt-green"
          />
          <StatCard
            icon={BarChart3}
            title="Total Words"
            value={stats.totalWords.toLocaleString()}
            subtitle={`${stats.avgWords} avg per note`}
            color="text-blue-500"
          />
        </div>
      </div>

      {/* Activity Stats */}
      <div>
        <h3 className="text-xs font-semibold text-chatgpt-text-primary mb-2 px-1">Recent Activity</h3>
        <div className="space-y-2">
          <StatCard
            icon={Calendar}
            title="Today"
            value={stats.todayNotes}
            subtitle={stats.todayNotes === 1 ? "note created" : "notes created"}
            color="text-green-500"
          />
          <StatCard
            icon={TrendingUp}
            title="This Week"
            value={stats.recentNotes}
            subtitle={stats.recentNotes === 1 ? "note created" : "notes created"}
            color="text-purple-500"
          />
        </div>
      </div>

      {/* Insights */}
      {stats.longestNote.note && (
        <div>
          <h3 className="text-xs font-semibold text-chatgpt-text-primary mb-2 px-1">Insights</h3>
          <Card className="bg-chatgpt-bg-element border-chatgpt-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Bookmark className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-medium text-chatgpt-text-primary">Longest Note</span>
              </div>
              <div className="text-sm font-semibold text-chatgpt-text-primary truncate">
                {stats.longestNote.note.title || "Untitled"}
              </div>
              <div className="text-xs text-chatgpt-text-secondary">
                {stats.longestNote.words.toLocaleString()} words
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div>
        <h3 className="text-xs font-semibold text-chatgpt-text-primary mb-2 px-1">Quick Facts</h3>
        <Card className="bg-chatgpt-bg-element border-chatgpt-border">
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-chatgpt-text-secondary">Total Characters:</span>
                <span className="font-medium text-chatgpt-text-primary">
                  {stats.totalCharacters.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-chatgpt-text-secondary">Avg Words/Note:</span>
                <span className="font-medium text-chatgpt-text-primary">
                  {stats.avgWords.toLocaleString()}
                </span>
              </div>
              {stats.totalWords > 0 && (
                <div className="flex justify-between">
                  <span className="text-chatgpt-text-secondary">Est. Read Time:</span>
                  <span className="font-medium text-chatgpt-text-primary">
                    {Math.ceil(stats.totalWords / 200)}m
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
