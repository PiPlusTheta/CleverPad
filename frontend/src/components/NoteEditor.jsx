import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Trash2 } from "lucide-react";
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
      <Card className="flex flex-col flex-1 rounded-2xl shadow bg-white dark:bg-zinc-900">
        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
          <RichTextEditor content={draft} setContent={setDraft} />
        </CardContent>
      </Card>
    </>
  );
}
