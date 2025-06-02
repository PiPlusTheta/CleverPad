import React, { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
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
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Configure marked to use async rendering
marked.use({ async: true });

const RichTextEditor = ({ content, setContent }) => {
  const fileInputRef = useRef();
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      FontFamily,
      TextStyle,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: content || '<p>Start typing here...</p>',
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  // Update preview content whenever editor content changes
  useEffect(() => {
    const updatePreview = async () => {
      if (editor && showPreview) {
        try {
          const html = editor.getHTML();
          const result = await marked.parse(html);
          setPreviewContent(result);
        } catch (error) {
          console.error('Error generating preview:', error);
          setPreviewContent('<p>Error generating preview</p>');
        }
      }
    };
    
    updatePreview();
  }, [editor, showPreview, content]);

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setFont = font => editor.chain().focus().setFontFamily(font).run();

  const exportPDF = async () => {
    try {
      const html = `<div>${editor.getHTML()}</div>`;
      const pdfContent = htmlToPdfmake(html);
      const docDefinition = { 
        content: pdfContent,
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 15,
            bold: true,
            margin: [0, 10, 0, 5]
          }
        }
      };
      pdfMake.createPdf(docDefinition).download('note.pdf');
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Could not export PDF. Check the console for details.");
    }
  };

  const exportMarkdown = async () => {
    try {
      const markdown = await marked.parse(editor.getHTML());
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = 'note.md';
      a.click();
    } catch (error) {
      console.error('Error exporting Markdown:', error);
      alert('Failed to export as Markdown');
    }
  };

  const exportJSON = () => {
    try {
      const json = JSON.stringify({ content: editor.getHTML() });
      const blob = new Blob([json], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = 'note.json';
      a.click();
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export as JSON');
    }
  };

  const importFile = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        if (file.name.endsWith('.md')) {
          const htmlContent = await marked.parse(ev.target.result);
          editor.commands.setContent(htmlContent);
        } else if (file.name.endsWith('.json')) {
          const { content } = JSON.parse(ev.target.result);
          editor.commands.setContent(content);
        }
      } catch (error) {
        console.error('Error importing file:', error);
        alert('Failed to import file. Check the console for details.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!editor) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-zinc-900 border rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 py-2 px-3 flex flex-wrap items-center gap-1">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded ${
              editor.isActive('bold') 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${
              editor.isActive('italic') 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={`p-2 rounded ${
              editor.isActive('underline') 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`p-2 rounded ${
              editor.isActive('strike') 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          
          <div className="border-r border-zinc-300 dark:border-zinc-600 h-6 mx-1"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded ${
              editor.isActive('heading', { level: 1 }) 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded ${
              editor.isActive('heading', { level: 2 }) 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          
          <div className="border-r border-zinc-300 dark:border-zinc-600 h-6 mx-1"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${
              editor.isActive('bulletList') 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded ${
              editor.isActive('orderedList') 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded ${
              editor.isActive('blockquote') 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          
          <div className="border-r border-zinc-300 dark:border-zinc-600 h-6 mx-1"></div>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded ${
              editor.isActive({ textAlign: 'left' }) 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded ${
              editor.isActive({ textAlign: 'center' }) 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded ${
              editor.isActive({ textAlign: 'right' }) 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded ${
              editor.isActive({ textAlign: 'justify' }) 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
          
          <div className="border-r border-zinc-300 dark:border-zinc-600 h-6 mx-1"></div>
          
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1 ml-auto">
          <button 
            onClick={addImage} 
            title="Add Image" 
            className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <select
            onChange={(e) => setFont(e.target.value)}
            defaultValue=""
            title="Select Font"
            className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-sm"
          >
            <option disabled value="">Font</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>

          <button 
            onClick={exportPDF} 
            title="Export PDF" 
            className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button 
            onClick={exportMarkdown} 
            title="Export Markdown" 
            className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button 
            onClick={exportJSON} 
            title="Export JSON" 
            className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            <FileJson className="w-4 h-4" />
          </button>

          <input
            type="file"
            accept=".md,.json"
            ref={fileInputRef}
            onChange={importFile}
            style={{ display: 'none' }}
          />
          <button 
            onClick={() => fileInputRef.current.click()} 
            title="Import File" 
            className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setShowPreview(!showPreview)} 
            title="Toggle Preview" 
            className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row gap-4 p-4">
        <div 
          className={`overflow-y-auto ${showPreview ? 'md:w-1/2' : 'w-full'} border rounded-lg bg-white dark:bg-zinc-900`}
          style={{ minHeight: '300px' }}
        >
          <EditorContent 
            editor={editor} 
            className="min-h-[300px] p-4 focus:outline-none" 
          />
        </div>

        {showPreview && (
          <div 
            className="flex-1 md:w-1/2 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg overflow-auto text-sm prose dark:prose-invert border border-zinc-200 dark:border-zinc-700"
            style={{ minHeight: '300px' }}
          >
            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;