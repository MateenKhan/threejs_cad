import React from 'react';
import { Move, RotateCw, Scaling, Settings2 } from 'lucide-react';
import { TransformMode, UnitType } from '../types';

interface ToolbarProps {
  transformMode: TransformMode;
  setTransformMode: (mode: TransformMode) => void;
  unit: UnitType;
  setUnit: (unit: UnitType) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ transformMode, setTransformMode, unit, setUnit }) => {
  const tools = [
    { mode: TransformMode.TRANSLATE, icon: Move, label: 'Translate' },
    { mode: TransformMode.ROTATE, icon: RotateCw, label: 'Rotate' },
    { mode: TransformMode.SCALE, icon: Scaling, label: 'Scale' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
      {/* Tools */}
      <div className="bg-gray-800/90 backdrop-blur border border-gray-700 rounded-lg p-1 flex gap-1 shadow-xl">
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

      {/* Unit Selector */}
      <div className="bg-gray-800/90 backdrop-blur border border-gray-700 rounded-lg p-1 shadow-xl flex items-center">
         <div className="px-2 text-gray-500">
            <Settings2 size={14} />
         </div>
         <select 
            value={unit} 
            onChange={(e) => setUnit(e.target.value as UnitType)}
            className="bg-transparent text-gray-300 text-xs font-medium py-2 pr-2 focus:outline-none cursor-pointer hover:text-white"
         >
            <option value={UnitType.METER}>Meters (m)</option>
            <option value={UnitType.MILLIMETER}>Millimeters (mm)</option>
            <option value={UnitType.INCH}>Inches (in)</option>
            <option value={UnitType.FOOT}>Feet (ft)</option>
         </select>
      </div>
    </div>
  );
};
