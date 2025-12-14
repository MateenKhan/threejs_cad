import React from 'react';
import { Box, Circle, Disc, Eye, EyeOff, Trash2, BoxSelect } from 'lucide-react';
import { SceneObject, ShapeType } from '../types';

interface SidebarProps {
  objects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (type: ShapeType) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

const SHAPES = [
  { type: ShapeType.BOX, icon: Box, label: 'Box' },
  { type: ShapeType.SPHERE, icon: Circle, label: 'Sphere' },
  { type: ShapeType.CYLINDER, icon: BoxSelect, label: 'Cylinder' }, // lucide doesn't have cylinder perfectly, using generic
  { type: ShapeType.TORUS, icon: Disc, label: 'Torus' },
  { type: ShapeType.PLANE, icon: Box, label: 'Plane' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  objects,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onToggleVisibility,
}) => {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full select-none">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Hierarchy</h1>
      </div>

      {/* Object List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {objects.length === 0 ? (
          <div className="text-gray-600 text-xs text-center mt-10 italic">
            No objects in scene
          </div>
        ) : (
          objects.map((obj) => (
            <div
              key={obj.id}
              onClick={() => onSelect(obj.id)}
              className={`
                group flex items-center justify-between p-2 rounded cursor-pointer text-sm transition-colors
                ${selectedId === obj.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}
              `}
            >
              <div className="flex items-center gap-2 truncate">
                <Box size={14} className={selectedId === obj.id ? 'text-blue-200' : 'text-gray-500'} />
                <span className="truncate">{obj.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(obj.id);
                  }}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                >
                  {obj.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(obj.id);
                  }}
                  className="p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Menu */}
      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Add Object</h2>
        <div className="grid grid-cols-2 gap-2">
          {SHAPES.map((shape) => (
            <button
              key={shape.type}
              onClick={() => onAdd(shape.type)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
            >
              <shape.icon size={14} />
              <span>{shape.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};