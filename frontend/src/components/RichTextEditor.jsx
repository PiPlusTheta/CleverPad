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
pdfMake.vfs = pdfFonts?.pdfMake?.vfs;

// Configure marked to use async rendering
marked.use({ async: true });

const RichTextEditor = ({ content, setContent, title = "Untitled" }) => {
  const fileInputRef = useRef();
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  
  // Helper function for toolbar button styling
  const getButtonClasses = (isActive = false) => {
    return `p-2 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-chatgpt-accent text-white' 
        : 'bg-chatgpt-bg-element hover:bg-chatgpt-border text-chatgpt-text-secondary hover:text-chatgpt-text-primary'
    }`;
  };
  
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
  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        editor.commands.setContent(content || '<p>Start typing here...</p>');
      }
    }
  }, [editor, content]);

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

  // Helper function to sanitize filename
  const sanitizeFilename = (filename) => {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters with underscore
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .trim();
  };

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
      const filename = `${sanitizeFilename(title)}.pdf`;
      pdfMake.createPdf(docDefinition).download(filename);
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
      a.download = `${sanitizeFilename(title)}.md`;
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
      a.download = `${sanitizeFilename(title)}.json`;
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
      <div className="flex justify-center items-center h-64 bg-chatgpt-bg-element border border-chatgpt-border rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chatgpt-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-chatgpt-bg-element rounded-lg border border-chatgpt-border shadow-sm">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 bg-chatgpt-bg-secondary border-b border-chatgpt-border py-2 px-3 flex flex-wrap items-center gap-1">        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={getButtonClasses(editor.isActive('bold'))}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={getButtonClasses(editor.isActive('italic'))}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={getButtonClasses(editor.isActive('underline'))}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={getButtonClasses(editor.isActive('strike'))}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          
          <div className="border-r border-chatgpt-border h-6 mx-1"></div>
            <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={getButtonClasses(editor.isActive('heading', { level: 1 }))}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={getButtonClasses(editor.isActive('heading', { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          
          <div className="border-r border-chatgpt-border h-6 mx-1"></div>
            <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={getButtonClasses(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={getButtonClasses(editor.isActive('orderedList'))}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={getButtonClasses(editor.isActive('blockquote'))}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>          
          <div className="border-r border-chatgpt-border h-6 mx-1"></div>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={getButtonClasses(editor.isActive({ textAlign: 'left' }))}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={getButtonClasses(editor.isActive({ textAlign: 'center' }))}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={getButtonClasses(editor.isActive({ textAlign: 'right' }))}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={getButtonClasses(editor.isActive({ textAlign: 'justify' }))}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
          
          <div className="border-r border-chatgpt-border h-6 mx-1"></div>
          
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className={getButtonClasses()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className={getButtonClasses()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1 ml-auto">
          <button 
            onClick={addImage} 
            title="Add Image" 
            className={getButtonClasses()}
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <select
            onChange={(e) => setFont(e.target.value)}
            defaultValue=""
            title="Select Font"
            className="p-2 rounded-lg bg-chatgpt-bg-element border border-chatgpt-border text-chatgpt-text-primary text-sm hover:bg-chatgpt-border transition-colors duration-200"
          >
            <option disabled value="">Font</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>          <button 
            onClick={exportPDF} 
            title="Export PDF" 
            className={getButtonClasses()}
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button 
            onClick={exportMarkdown} 
            title="Export Markdown" 
            className={getButtonClasses()}
          >
            <FileText className="w-4 h-4" />
          </button>
          <button 
            onClick={exportJSON} 
            title="Export JSON" 
            className={getButtonClasses()}
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
            className={getButtonClasses()}
          >
            <Upload className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setShowPreview(!showPreview)} 
            title="Toggle Preview" 
            className={getButtonClasses()}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>      {/* Editor + Preview */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row gap-4 p-4">
        <div 
          className={`overflow-y-auto ${showPreview ? 'md:w-1/2' : 'w-full'} border border-chatgpt-border rounded-lg bg-chatgpt-bg-primary custom-scrollbar`}
          style={{ minHeight: '300px' }}
        >
          <EditorContent 
            editor={editor} 
            className="min-h-[300px] p-4 focus:outline-none text-chatgpt-text-primary prose prose-chatgpt max-w-none" 
          />
        </div>

        {showPreview && (
          <div 
            className="flex-1 md:w-1/2 bg-chatgpt-bg-secondary p-4 rounded-lg overflow-auto text-sm prose prose-chatgpt border border-chatgpt-border custom-scrollbar"
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