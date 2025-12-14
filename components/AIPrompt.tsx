import React, { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';

interface AIPromptProps {
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

export const AIPrompt: React.FC<AIPromptProps> = ({ onGenerate, isGenerating }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onGenerate(prompt);
    setPrompt('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-full shadow-lg shadow-blue-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 z-10"
      >
        <Sparkles size={18} />
        <span className="font-medium text-sm">Generate with Gemini</span>
      </button>
    );
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-10">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Sparkles size={16} />
            <span className="text-sm font-semibold uppercase tracking-wide">Gemini Scene Creator</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-gray-500 hover:text-white"
            disabled={isGenerating}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a scene (e.g., 'A red cube on a blue table', 'A snowman in a forest')"
            className="w-full bg-gray-900 text-white text-sm p-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-24 mb-3"
            disabled={isGenerating}
          />
          <div className="flex justify-end">
             <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isGenerating || !prompt.trim() 
                   ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                   : 'bg-blue-600 text-white hover:bg-blue-500'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
