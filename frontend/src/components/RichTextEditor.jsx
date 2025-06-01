import React, { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import { marked } from 'marked';

import {
  Image as ImageIcon,
  FileDown,
  Upload,
  FileText,
  FileJson,
  Eye,
  EyeOff,
} from 'lucide-react';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


const RichTextEditor = ({ content, setContent }) => {
  const fileInputRef = useRef();
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image, FontFamily, TextStyle],
    content,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setFont = font => editor.chain().focus().setFontFamily(font).run();

  const exportPDF = () => {
    try {
        const html = `<div>${editor.getHTML()}</div>`; // Ensure valid HTML wrapping
        const pdfContent = htmlToPdfmake(html);
        const docDefinition = { content: pdfContent };
        pdfMake.createPdf(docDefinition).download('note.pdf');
    } catch (err) {
        console.error("PDF export failed:", err);
        alert("Could not export PDF. Check the console for details.");
    }
    };


  const exportMarkdown = () => {
    const markdown = marked.parse(editor.getHTML());
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'note.md';
    a.click();
  };

  const exportJSON = () => {
    const json = JSON.stringify({ content: editor.getHTML() });
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'note.json';
    a.click();
  };

  const importFile = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      if (file.name.endsWith('.md')) {
        const htmlContent = marked.parse(ev.target.result);
        editor.commands.setContent(htmlContent);
      } else if (file.name.endsWith('.json')) {
        const { content } = JSON.parse(ev.target.result);
        editor.commands.setContent(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b py-2 px-2 flex gap-2 flex-wrap items-center">
        <button onClick={addImage} title="Add Image" className="p-2 rounded bg-zinc-200 dark:bg-zinc-700">
          <ImageIcon className="w-4 h-4" />
        </button>

        <select
          onChange={(e) => setFont(e.target.value)}
          defaultValue=""
          title="Select Font"
          className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 text-sm"
        >
          <option disabled value="">Font</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
        </select>

        <button onClick={exportPDF} title="Export PDF" className="p-2 rounded bg-zinc-200 dark:bg-zinc-700">
          <FileDown className="w-4 h-4" />
        </button>
        <button onClick={exportMarkdown} title="Export Markdown" className="p-2 rounded bg-zinc-200 dark:bg-zinc-700">
          <FileText className="w-4 h-4" />
        </button>
        <button onClick={exportJSON} title="Export JSON" className="p-2 rounded bg-zinc-200 dark:bg-zinc-700">
          <FileJson className="w-4 h-4" />
        </button>

        <input
          type="file"
          accept=".md,.json"
          ref={fileInputRef}
          onChange={importFile}
          style={{ display: 'none' }}
        />
        <button onClick={() => fileInputRef.current.click()} title="Import File" className="p-2 rounded bg-zinc-200 dark:bg-zinc-700">
          <Upload className="w-4 h-4" />
        </button>

        <button onClick={() => setShowPreview(!showPreview)} title="Toggle Preview" className="p-2 rounded bg-zinc-200 dark:bg-zinc-700">
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row gap-4 p-2">
        <div className={`flex-1 overflow-y-auto ${showPreview ? 'md:w-1/2' : 'w-full'}`}>
          <EditorContent editor={editor} className="min-h-[200px] h-full" />
        </div>

        {showPreview && (
          <div className="flex-1 md:w-1/2 bg-zinc-100 dark:bg-zinc-800 p-4 rounded overflow-auto text-sm prose dark:prose-invert max-h-[600px]">
            <div dangerouslySetInnerHTML={{ __html: marked.parse(editor.getHTML()) }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
