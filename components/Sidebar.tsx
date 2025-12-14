import React, { useState } from 'react';
import { Box, Circle, Disc, Eye, EyeOff, Trash2, BoxSelect, Square, Copy, Heart, Type } from 'lucide-react';
import { SceneObject, ShapeType } from '../types';

interface SidebarProps {
  objects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (type: ShapeType) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onUpdate: (id: string, updates: Partial<SceneObject>) => void;
}

const SHAPES = [
  { type: ShapeType.BOX, icon: Box, label: 'Box' },
  { type: ShapeType.SPHERE, icon: Circle, label: 'Sphere' },
  { type: ShapeType.CYLINDER, icon: BoxSelect, label: 'Cylinder' },
  { type: ShapeType.TORUS, icon: Disc, label: 'Torus' },
  { type: ShapeType.PLANE, icon: Square, label: 'Plane' },
  { type: ShapeType.HEART, icon: Heart, label: 'Heart' },
  { type: ShapeType.TEXT, icon: Type, label: 'Text' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  objects,
  selectedId,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onUpdate,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (e: React.MouseEvent, obj: SceneObject) => {
    e.stopPropagation(); // Prevent selection conflicts
    setEditingId(obj.id);
    setEditName(obj.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdate(editingId, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const getIcon = (type: ShapeType) => {
    const shape = SHAPES.find(s => s.type === type);
    return shape ? shape.icon : Box;
  };

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
          objects.map((obj) => {
            const Icon = getIcon(obj.type);
            return (
              <div
                key={obj.id}
                onClick={() => onSelect(obj.id)}
                className={`
                  group flex items-center justify-between p-2 rounded cursor-pointer text-sm transition-colors
                  ${selectedId === obj.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}
                `}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <Icon size={14} className={selectedId === obj.id ? 'text-blue-200' : 'text-gray-500'} />
                  
                  {editingId === obj.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gray-700 text-white text-xs px-1 py-0.5 rounded border border-blue-500 outline-none w-full mr-2"
                    />
                  ) : (
                    <span 
                      className="truncate flex-1"
                      onDoubleClick={(e) => handleStartEdit(e, obj)}
                      title="Double click to rename"
                    >
                      {obj.name}
                    </span>
                  )}
                </div>

                {editingId !== obj.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(obj.id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(obj.id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                      title={obj.visible ? "Hide" : "Show"}
                    >
                      {obj.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(obj.id);
                      }}
                      className="p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
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