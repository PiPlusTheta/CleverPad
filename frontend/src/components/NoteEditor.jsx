import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Trash2, Save } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

export default function NoteEditor({
  titleDraft,
  setTitleDraft,
  draft,
  setDraft,
  saveNote,
  deleteNote,
  activeId
}) {
  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Header with Title and Actions */}
      <div className="flex items-center gap-3">
        <Input
          value={titleDraft}
          onChange={e => setTitleDraft(e.target.value)}
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
        </Button>
        <Button onClick={saveNote} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>

      {/* Editor Card */}
      <Card className="flex flex-col flex-1 overflow-hidden">
        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
          <RichTextEditor content={draft} setContent={setDraft} title={titleDraft} />
        </CardContent>
      </Card>
    </div>
  );
}
