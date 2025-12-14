import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Viewport } from './components/Viewport';
import { Inspector } from './components/Inspector';
import { Toolbar } from './components/Toolbar';
import { AIPrompt } from './components/AIPrompt';
import { SceneObject, ShapeType, TransformMode } from './types';
import { generateSceneFromPrompt } from './services/geminiService';

// Helper to generate simple random IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_OBJECTS: SceneObject[] = [
  {
    id: '1',
    name: 'Base Cube',
    type: ShapeType.BOX,
    position: { x: 0, y: 0.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#4299e1',
    visible: true
  },
  {
    id: '2',
    name: 'Floor',
    type: ShapeType.PLANE,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
    scale: { x: 10, y: 10, z: 1 },
    color: '#2d3748',
    visible: true
  }
];

const App: React.FC = () => {
  const [objects, setObjects] = useState<SceneObject[]>(INITIAL_OBJECTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>(TransformMode.TRANSLATE);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Actions ---

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleAddObject = (type: ShapeType) => {
    const newObject: SceneObject = {
      id: generateId(),
      name: `New ${type.toLowerCase()}`,
      type,
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#ffffff',
      visible: true
    };
    setObjects((prev) => [...prev, newObject]);
    setSelectedId(newObject.id);
  };

  const handleDeleteObject = (id: string) => {
    setObjects((prev) => prev.filter(o => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleToggleVisibility = (id: string) => {
    setObjects((prev) => prev.map(obj => 
      obj.id === id ? { ...obj, visible: !obj.visible } : obj
    ));
  };

  const handleUpdateObject = useCallback((id: string, updates: Partial<SceneObject>) => {
    setObjects((prev) => prev.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  }, []);

  const handleGenerateScene = async (prompt: string) => {
    try {
      setIsGenerating(true);
      const newObjects = await generateSceneFromPrompt(prompt);
      // Append new objects to current scene (or replace? Let's append)
      setObjects((prev) => [...prev, ...newObjects]);
      
      // Auto select the first generated object if any
      if (newObjects.length > 0) {
        setSelectedId(newObjects[0].id);
      }
    } catch (error) {
      console.error("Failed to generate scene", error);
      alert("Failed to generate scene. Check your API Key or prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedObject = objects.find(o => o.id === selectedId) || null;

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar 
        objects={objects}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAdd={handleAddObject}
        onDelete={handleDeleteObject}
        onToggleVisibility={handleToggleVisibility}
      />

      {/* Main Viewport Area */}
      <div className="flex-1 relative flex flex-col min-w-0">
        <Toolbar 
          transformMode={transformMode}
          setTransformMode={setTransformMode}
        />
        
        <Viewport 
          objects={objects}
          selectedId={selectedId}
          transformMode={transformMode}
          onSelect={handleSelect}
          onUpdate={handleUpdateObject}
        />

        <AIPrompt 
          onGenerate={handleGenerateScene} 
          isGenerating={isGenerating} 
        />
      </div>

      {/* Right Inspector */}
      <Inspector 
        object={selectedObject}
        onUpdate={handleUpdateObject}
      />
    </div>
  );
};

export default App;
