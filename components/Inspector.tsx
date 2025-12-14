import React from 'react';
import { SceneObject, UnitType } from '../types';

interface InspectorProps {
  object: SceneObject | null;
  onUpdate: (id: string, updates: Partial<SceneObject>) => void;
  unit: UnitType;
}

const CONVERSION_FACTORS = {
  [UnitType.METER]: 1,
  [UnitType.MILLIMETER]: 1000,
  [UnitType.INCH]: 39.3701,
  [UnitType.FOOT]: 3.28084
};

const STEP_SIZES = {
  [UnitType.METER]: 0.1,
  [UnitType.MILLIMETER]: 10,
  [UnitType.INCH]: 1,
  [UnitType.FOOT]: 0.1
};

const VectorInput = ({ 
  label, 
  value, 
  onChange, 
  unit,
  step
}: { 
  label: string; 
  value: { x: number; y: number; z: number }; 
  onChange: (val: { x: number; y: number; z: number }) => void;
  unit: UnitType;
  step?: number;
}) => {
  const factor = CONVERSION_FACTORS[unit];
  const effectiveStep = step || STEP_SIZES[unit];

  // Convert generic unit (meters) to display unit
  const toDisplay = (val: number) => Number((val * factor).toFixed(3));
  
  // Convert display unit back to generic unit (meters)
  const fromDisplay = (val: number) => val / factor;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="text-xs text-gray-500 capitalize">{label}</div>
        <div className="text-[10px] text-gray-600 uppercase font-mono">{unit}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div key={axis} className="flex items-center bg-gray-800 rounded px-2 py-1 relative">
            <span className="text-xs text-gray-500 mr-2 uppercase w-2">{axis}</span>
            <input
              type="number"
              step={effectiveStep}
              value={toDisplay(value[axis])}
              onChange={(e) => {
                const newValue = { ...value };
                newValue[axis] = fromDisplay(parseFloat(e.target.value));
                onChange(newValue);
              }}
              className="w-full bg-transparent text-xs text-white focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const Inspector: React.FC<InspectorProps> = ({ object, onUpdate, unit }) => {
  if (!object) {
    return (
      <div className="w-64 bg-gray-900 border-l border-gray-800 p-4 flex flex-col items-center justify-center text-gray-600 text-sm">
        <p>No object selected</p>
      </div>
    );
  }

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Inspector</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <div>
           <label className="text-xs text-gray-500 block mb-1">Name</label>
           <input 
              type="text" 
              value={object.name}
              onChange={(e) => onUpdate(object.id, { name: e.target.value })}
              className="w-full bg-gray-800 text-white text-sm px-2 py-1 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
           />
        </div>
        
         <div>
           <label className="text-xs text-gray-500 block mb-1">Type</label>
           <div className="w-full bg-gray-800/50 text-gray-400 text-sm px-2 py-1 rounded border border-gray-800 cursor-not-allowed">
              {object.type}
           </div>
        </div>

        <div className="h-px bg-gray-800 my-2" />

        {/* Transforms */}
        <VectorInput 
          label="Position" 
          value={object.position} 
          onChange={(val) => onUpdate(object.id, { position: val })} 
          unit={unit}
        />
        
        {/* Rotation */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1 capitalize">Rotation (Rad)</div>
          <div className="grid grid-cols-3 gap-2">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className="flex items-center bg-gray-800 rounded px-2 py-1">
                <span className="text-xs text-gray-500 mr-2 uppercase w-2">{axis}</span>
                <input
                  type="number"
                  step={0.1}
                  value={Number(object.rotation[axis]).toFixed(2)}
                  onChange={(e) => {
                     const newRot = { ...object.rotation, [axis]: parseFloat(e.target.value) };
                     onUpdate(object.id, { rotation: newRot });
                  }}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dimensions - Replaces Scale */}
        <VectorInput 
          label="Dimensions" 
          value={object.scale} 
          onChange={(val) => onUpdate(object.id, { scale: val })} 
          unit={unit} 
        />
        
        <div className="h-px bg-gray-800 my-2" />

        {/* Material */}
        <div>
          <label className="text-xs text-gray-500 block mb-2">Color</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={object.color}
              onChange={(e) => onUpdate(object.id, { color: e.target.value })}
              className="h-8 w-8 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            <input 
              type="text"
              value={object.color}
              onChange={(e) => onUpdate(object.id, { color: e.target.value })}
              className="flex-1 bg-gray-800 text-white text-xs px-2 py-1 rounded focus:outline-none uppercase"
            />
          </div>
        </div>
      </div>
    </div>
  );
};