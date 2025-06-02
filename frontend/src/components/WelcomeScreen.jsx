import React from "react";
import { Edit3, Save, Download, Plus } from "lucide-react";

export default function WelcomeScreen({ onCreateNote, hasNotes = false }) {
  const features = [
    {
      icon: Edit3,
      title: "Rich Text Editor",
      description: "Write with style using our powerful rich text editor with formatting options, image support, and more."
    },
    {
      icon: Save,
      title: "Auto-Save",
      description: "Never lose your work again. Your notes are automatically saved as you type, ensuring your ideas are always protected."
    },
    {
      icon: Download,
      title: "Export Options",
      description: "Export your notes in multiple formats including PDF, Markdown, and HTML for easy sharing and archiving."
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
      {/* Logo/Icon */}      <div className="mb-8">        <div className="w-16 h-16 bg-chatgpt-green rounded-2xl flex items-center justify-center mb-4">
          <Edit3 className="w-8 h-8 text-white" />
        </div>
      </div>      {/* Main Content */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-chatgpt-text-primary mb-4">
          {hasNotes ? "Welcome back to CleverPad" : "Welcome to CleverPad"}
        </h1>
        <p className="text-base text-chatgpt-text-secondary mb-8">
          {hasNotes 
            ? "Select a note from the sidebar to continue editing, or create a new one to capture fresh ideas."
            : "Your ideas deserve a beautiful home. Create, edit, and organize your notes with our intuitive and powerful editor."
          }
        </p>
        {onCreateNote && (
          <button
            onClick={onCreateNote}
            className="inline-flex items-center gap-2 px-6 py-3 bg-chatgpt-green hover:opacity-80 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            {hasNotes ? "Create New Note" : "Create Your First Note"}
          </button>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="w-full max-w-4xl">        <h2 className="text-lg font-semibold text-chatgpt-text-primary text-center mb-8">
          Everything you need to capture your thoughts
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="bg-chatgpt-bg-element border border-chatgpt-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-200"
              >                <div className="inline-flex items-center justify-center w-12 h-12 bg-chatgpt-bg-secondary rounded-lg mb-4">
                  <IconComponent className="w-6 h-6 text-chatgpt-green" />
                </div><h3 className="text-sm font-semibold text-chatgpt-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-chatgpt-text-secondary text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}