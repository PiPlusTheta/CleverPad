import React, { useCallback, useRef, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Trash2, Save, Check, Clock } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

export default function NoteEditor({
  titleDraft,
  setTitleDraft,
  draft,
  setDraft,
  saveNote,
  deleteNote,
  activeId,
  onCreateNoteFromImport
}) {
  const saveTimeoutRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'pending'

  // Debounced auto-save function
  const triggerAutoSave = useCallback(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setSaveStatus('pending');
    
    // Set new timeout to save after 1 second of no changes
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await saveNote();
        setSaveStatus('saved');
      } catch (error) {
        console.error('Autosave failed:', error);
        setSaveStatus('pending');
      }
    }, 1000);
  }, [saveNote]);

  // Auto-save when content changes (debounced)
  const handleContentChange = useCallback((newContent) => {
    setDraft(newContent);
    triggerAutoSave();
  }, [setDraft, triggerAutoSave]);

  // Auto-save when title changes (debounced)
  const handleTitleChange = useCallback((e) => {
    setTitleDraft(e.target.value);
    triggerAutoSave();
  }, [setTitleDraft, triggerAutoSave]);

  // Manual save function
  const handleManualSave = useCallback(async () => {
    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setSaveStatus('saving');
    try {
      await saveNote();
      setSaveStatus('saved');
    } catch (error) {
      console.error('Manual save failed:', error);
      setSaveStatus('pending');
    }
  }, [saveNote]);

  // Reset save status when switching notes
  useEffect(() => {
    setSaveStatus('saved');
  }, [activeId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Render save status icon
  const renderSaveIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Clock className="w-4 h-4 animate-pulse" />;
      case 'saved':
        return <Check className="w-4 h-4" />;
      case 'pending':
      default:
        return <Save className="w-4 h-4" />;
    }
  };

  // Get save button text and color
  const getSaveButtonProps = () => {
    switch (saveStatus) {
      case 'saving':
        return { 
          text: 'Saving...', 
          className: 'flex items-center gap-2 opacity-70 cursor-not-allowed',
          disabled: true
        };
      case 'saved':
        return { 
          text: 'Saved', 
          className: 'flex items-center gap-2 bg-green-600 hover:bg-green-700',
          disabled: false
        };
      case 'pending':
      default:
        return { 
          text: 'Save', 
          className: 'flex items-center gap-2',
          disabled: false
        };
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Title and Actions */}
      <div className="flex items-center gap-3 p-6 pb-0">        <Input
          value={titleDraft}
          onChange={handleTitleChange}
          placeholder="Note title"
          className="text-lg font-semibold flex-grow"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => deleteNote(activeId)}
          aria-label="Delete note"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
        </Button>        <Button
          onClick={handleManualSave}
          className={getSaveButtonProps().className}
          disabled={getSaveButtonProps().disabled}
        >
          {renderSaveIcon()}
          {getSaveButtonProps().text}
        </Button>
      </div>

      {/* Editor */}      <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">        <RichTextEditor 
          content={draft} 
          setContent={setDraft} 
          title={titleDraft}
          onContentChange={handleContentChange}
          onCreateNoteFromImport={onCreateNoteFromImport}
          onAutosave={saveNote}
        />
      </div>
    </div>
  );
}
