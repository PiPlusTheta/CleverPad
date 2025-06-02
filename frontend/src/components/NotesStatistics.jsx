import React, { useMemo } from "react";
import {
  FileText,
  Clock,
  Calendar,
  BarChart3,
  TrendingUp,
  Search
} from "lucide-react";
import { Card, CardContent } from "./ui/card";

export default function NotesStatistics({ notes, activeNote, search }) {
  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const totalWords = notes.reduce((sum, note) => {
      const textContent = note.content.replace(/<[^>]*>/g, '');
      return sum + textContent.split(/\s+/).filter(word => word.length > 0).length;
    }, 0);

    const totalCharacters = notes.reduce((sum, note) => {
      const textContent = note.content.replace(/<[^>]*>/g, '');
      return sum + textContent.length;
    }, 0);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentNotes = notes.filter(note => {
      const noteDate = new Date(note.created_at || note.updated_at || now);
      return noteDate >= weekAgo;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayNotes = notes.filter(note => {
      const noteDate = new Date(note.created_at || note.updated_at || now);
      return noteDate >= today && noteDate < tomorrow;
    });

    const avgWords = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;

    const longestNote = notes.reduce((longest, note) => {
      const textContent = note.content.replace(/<[^>]*>/g, '');
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
      return wordCount > longest.words ? { note, words: wordCount } : longest;
    }, { note: null, words: 0 });

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
      readingTime: Math.ceil(words / 200)
    };
  }, [activeNote]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "text-chatgpt-text-primary" }) => (
    <Card className="h-full bg-chatgpt-bg-element border-chatgpt-border">
      <CardContent className="h-full p-1 text-[10px] flex flex-col justify-between">
        <div className="flex items-center gap-1 mb-0.5">
          <Icon className={`w-[10px] h-[10px] ${color}`} />
          <span className="font-medium text-chatgpt-text-primary">{title}</span>
        </div>
        <div className="text-[11px] font-semibold text-chatgpt-text-primary leading-tight">{value}</div>
        {subtitle && (
          <div className="text-[9px] text-chatgpt-text-secondary mt-0.5">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col space-y-1 min-h-0">
      {/* Search Results */}
      {search && stats.searchResults !== null && (
        <Card className="bg-chatgpt-bg-element border-chatgpt-border flex-shrink-0">
          <CardContent className="p-1 text-[10px]">
            <div className="flex items-center gap-1 mb-0.5">
              <Search className="w-[10px] h-[10px] text-chatgpt-green" />
              <span className="font-medium text-chatgpt-text-primary">Search Results</span>
            </div>
            <div className="text-[11px] font-semibold text-chatgpt-text-primary">
              {stats.searchResults}
            </div>
            <div className="text-[9px] text-chatgpt-text-secondary">
              for "{search.length > 15 ? search.substring(0, 15) + '...' : search}"
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-[10px] font-semibold text-chatgpt-text-primary mb-1 px-1 flex-shrink-0">Overview</h3>
        <div className="grid grid-cols-2 gap-1 items-stretch flex-shrink-0">
          <StatCard icon={FileText} title="Notes" value={stats.totalNotes.toLocaleString()} color="text-chatgpt-green" />
          <StatCard icon={BarChart3} title="Words" value={stats.totalWords.toLocaleString()} color="text-blue-500" />
          <StatCard icon={Calendar} title="This Week" value={stats.recentNotes.toLocaleString()} color="text-purple-500" />
          <StatCard icon={TrendingUp} title="Today" value={stats.todayNotes.toLocaleString()} color="text-orange-500" />
        </div>

        {/* Current Note Stats */}
        {currentNoteStats && (
          <>
            <h4 className="text-[10px] font-semibold text-chatgpt-text-primary mb-1 px-1">Current Note</h4>
            <div className="grid grid-cols-2 gap-1 items-stretch">
              <StatCard
                icon={FileText}
                title="Words"
                value={currentNoteStats.words.toLocaleString()}
                color="text-chatgpt-green"
              />
              <StatCard
                icon={Clock}
                title="Read"
                value={`${currentNoteStats.readingTime}m`}
                color="text-orange-500"
              />
            </div>
          </>
        )}
      </div>

      {/* Quick Facts */}
      <div className="flex-shrink-0">
        <h4 className="text-[10px] font-semibold text-chatgpt-text-primary mb-1 px-1">Quick Facts</h4>
        <Card className="bg-chatgpt-bg-element border-chatgpt-border">
          <CardContent className="p-1 text-[10px]">
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-chatgpt-text-secondary">Avg Words:</span>
                <span className="font-medium text-chatgpt-text-primary">
                  {stats.avgWords.toLocaleString()}
                </span>
              </div>
              {stats.longestNote.note && (
                <div className="flex justify-between">
                  <span className="text-chatgpt-text-secondary">Longest:</span>
                  <span className="font-medium text-chatgpt-text-primary">
                    {stats.longestNote.words}w
                  </span>
                </div>
              )}
              {stats.totalWords > 0 && (
                <div className="flex justify-between">
                  <span className="text-chatgpt-text-secondary">Read Time:</span>
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
