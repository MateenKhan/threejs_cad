import React from 'react';
import { Move, RotateCw, Scaling, MousePointer2 } from 'lucide-react';
import { TransformMode } from '../types';

interface ToolbarProps {
  transformMode: TransformMode;
  setTransformMode: (mode: TransformMode) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ transformMode, setTransformMode }) => {
  const tools = [
    { mode: TransformMode.TRANSLATE, icon: Move, label: 'Translate' },
    { mode: TransformMode.ROTATE, icon: RotateCw, label: 'Rotate' },
    { mode: TransformMode.SCALE, icon: Scaling, label: 'Scale' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur border border-gray-700 rounded-lg p-1 flex gap-1 shadow-xl z-10">
      {tools.map((tool) => (
        <button
          key={tool.mode}
          onClick={() => setTransformMode(tool.mode)}
          className={`
            p-2 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors relative group
            ${transformMode === tool.mode ? 'bg-blue-600/20 text-blue-400' : ''}
          `}
          title={tool.label}
        >
          <tool.icon size={18} />
          {transformMode === tool.mode && (
             <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};
