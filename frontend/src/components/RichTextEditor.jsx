import React, { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import { marked } from 'marked';

import {
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
// Fix for pdfMake fonts
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts) {
  pdfMake.vfs = pdfFonts;
}

// Configure marked to use async rendering
marked.use({ async: true });

const RichTextEditor = ({ content, setContent, title = "Untitled", onContentChange, onCreateNoteFromImport, onAutosave }) => {
  const fileInputRef = useRef();
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());
  const autosaveTimeoutRef = useRef(null);
  
  // Helper function for toolbar button styling
  const getButtonClasses = (isActive = false) => {
    return `p-2 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-chatgpt-accent text-white' 
        : 'bg-chatgpt-bg-element hover:bg-chatgpt-border text-chatgpt-text-secondary hover:text-chatgpt-text-primary'
    }`;
  };  // Autosave functionality
  const triggerAutosave = async (content) => {
    if (!onAutosave || !content.trim()) return;
    
    try {
      setIsAutosaving(true);
      await onAutosave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsAutosaving(false);
    }
  };

  // Debounced autosave
  const debouncedAutosave = (content) => {
    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    
    // Set new timeout
    autosaveTimeoutRef.current = setTimeout(() => {
      triggerAutosave(content);
    }, 2000); // Save after 2 seconds of inactivity
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the default list extensions from StarterKit
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      ListItem,
      BulletList.configure({
        HTMLAttributes: {
          class: 'my-bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'my-ordered-list',
        },
      }),
      FontFamily,
      TextStyle,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start typing here...',
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
    ],
    content: content || '',    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      // Trigger content change callback if provided
      if (onContentChange) {
        onContentChange(newContent);
      }
      // Trigger autosave
      debouncedAutosave(newContent);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-chatgpt focus:outline-none',
      },
    },
  });// Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        editor.commands.setContent(content || '');
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

  const setFont = font => editor.chain().focus().setFontFamily(font).run();

  // Helper function to sanitize filename
  const sanitizeFilename = (filename) => {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters with underscore
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .trim();
  };  const exportPDF = async () => {
    try {
      // Ensure pdfMake is properly initialized
      if (!pdfMake.vfs || Object.keys(pdfMake.vfs).length === 0) {
        console.warn('PDF fonts not loaded, using default fonts');
        // Set a minimal font setup
        pdfMake.vfs = {
          'Roboto-Regular.ttf': '',
          'Roboto-Medium.ttf': '',
          'Roboto-Italic.ttf': '',
          'Roboto-MediumItalic.ttf': ''
        };
        pdfMake.fonts = {
          Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf'
          }
        };
      }
      
      const html = `<div>${editor.getHTML()}</div>`;
      
      // Try to convert HTML to PDF content
      let pdfContent;
      try {
        pdfContent = htmlToPdfmake(html, {
          defaultStyles: {
            h1: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
            h2: { fontSize: 15, bold: true, margin: [0, 10, 0, 5] },
            h3: { fontSize: 13, bold: true, margin: [0, 10, 0, 5] },
            p: { margin: [0, 5, 0, 5] },
            ul: { margin: [0, 5, 0, 5] },
            ol: { margin: [0, 5, 0, 5] },
          }
        });
      } catch (htmlError) {
        console.warn('HTML to PDF conversion failed, using fallback:', htmlError);
        // Fallback: create simple text content
        const textContent = editor.getText();
        pdfContent = [
          { text: title || 'Document', style: 'header' },
          { text: textContent, style: 'normal' }
        ];
      }
      
      const docDefinition = { 
        content: pdfContent,
        defaultStyle: {
          fontSize: 11,
          lineHeight: 1.4
        },
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
          },
          normal: {
            fontSize: 11,
            margin: [0, 5, 0, 5]
          }
        }
      };
      
      const filename = `${sanitizeFilename(title || 'document')}.pdf`;
      pdfMake.createPdf(docDefinition).download(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert(`Could not export PDF: ${err.message}. Please try again or use a different export format.`);
    }
  };const exportMarkdown = () => {
    try {
      // Convert HTML to plain text markdown-like format
      const html = editor.getHTML();
      
      // Basic HTML to Markdown conversion
      let markdown = html
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
        .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
        .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
        .replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~')
        .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
        .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n')
        .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n')
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
        .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
        .trim();

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `${sanitizeFilename(title)}.md`;
      a.click();
      URL.revokeObjectURL(href);
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
  };  const importFile = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        let htmlContent = '';
        let importedTitle = title;
        
        if (file.name.endsWith('.md')) {
          const markdownContent = ev.target.result;
          htmlContent = await marked.parse(markdownContent);
          // Extract title from filename if no title provided
          if (title === 'Untitled' || !title) {
            importedTitle = file.name.replace(/\.md$/, '');
          }
        } else if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(ev.target.result);
          htmlContent = jsonData.content;
          if (jsonData.title && (title === 'Untitled' || !title)) {
            importedTitle = jsonData.title;
          }
        }

        // Check if we need to create a new note
        if (onCreateNoteFromImport && (!title || title === 'Untitled')) {
          // Create a new note with the imported content
          await onCreateNoteFromImport(importedTitle, htmlContent);
        } else {
          // Update existing note
          editor.commands.setContent(htmlContent);
          // Trigger content change callback after import
          if (onContentChange) {
            onContentChange(htmlContent);
          }
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
      <div className="flex-shrink-0 sticky top-0 z-10 bg-chatgpt-bg-secondary border-b border-chatgpt-border py-2 px-3 flex flex-wrap items-center gap-1">
        <div className="flex flex-wrap gap-1">
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
          
          <div className="border-r border-chatgpt-border h-6 mx-1"></div>          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
            className={getButtonClasses(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={!editor.can().chain().focus().toggleOrderedList().run()}
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
          </button>        </div>
        
        <div className="flex flex-wrap gap-1 ml-auto">
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
          </select><button 
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
          </button>          <button 
            onClick={() => setShowPreview(!showPreview)} 
            title="Toggle Preview" 
            className={getButtonClasses()}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Autosave Status Indicator */}
          <div className="flex items-center gap-2 ml-2 px-2 py-1 rounded-lg bg-chatgpt-bg-element border border-chatgpt-border text-xs text-chatgpt-text-secondary">
            {isAutosaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-chatgpt-accent"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>
      </div>      {/* Editor + Preview */}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
        <div 
          className={`flex flex-col flex-1 min-h-0 overflow-hidden ${showPreview ? 'md:w-1/2' : 'w-full'} border-r ${showPreview ? 'md:border-r-chatgpt-border' : 'border-r-0'}`}
        >
          <EditorContent 
            editor={editor} 
            className="flex-1 min-h-0 p-4 focus:outline-none text-chatgpt-text-primary prose prose-chatgpt max-w-none overflow-y-auto custom-scrollbar" 
          />
        </div>

        {showPreview && (
          <div 
            className="flex-1 md:w-1/2 bg-chatgpt-bg-secondary p-4 overflow-auto text-sm prose prose-chatgpt custom-scrollbar min-h-0"
          >
            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;