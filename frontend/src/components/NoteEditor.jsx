import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Trash2 } from "lucide-react";

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
    <>
      <div className="flex items-center gap-2">
        <Input
          value={titleDraft}
          onChange={e => setTitleDraft(e.target.value)}
          placeholder="Note title"
          className="text-xl font-semibold flex-grow bg-white dark:bg-zinc-900 text-black dark:text-zinc-100"
        />
        <Button
          size="icon"
          variant="ghost"
          className="ml-auto flex-shrink-0"
          onClick={() => deleteNote(activeId)}
          aria-label="Delete note"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
        <Button onClick={saveNote} className="rounded-2xl shadow flex-shrink-0">
          Save
        </Button>
      </div>
      <Card className="flex-1 rounded-2xl shadow bg-white dark:bg-zinc-900">
        <CardContent className="h-full p-0">
          <Textarea
            className="h-full w-full resize-none border-none rounded-2xl focus:ring-0 p-6 text-base bg-white dark:bg-zinc-900 text-black dark:text-zinc-100"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Start writing..."
          />
        </CardContent>
      </Card>
    </>
  );
}
