import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Viewport } from './components/Viewport';
import { Inspector } from './components/Inspector';
import { Toolbar } from './components/Toolbar';
import { AIPrompt } from './components/AIPrompt';
import { SceneObject, ShapeType, TransformMode, UnitType } from './types';
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
  const [unit, setUnit] = useState<UnitType>(UnitType.METER);
  const [showDimensions, setShowDimensions] = useState(false);
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

  const handleDuplicateObject = (id: string) => {
    const original = objects.find((o) => o.id === id);
    if (!original) return;

    const newObject: SceneObject = {
      ...original,
      id: generateId(),
      name: `${original.name} (Copy)`,
      position: { 
        x: original.position.x + 0.5, 
        y: original.position.y, 
        z: original.position.z + 0.5 
      },
      // Ensure we deep copy objects if necessary, though simple spreads work for this structure
      rotation: { ...original.rotation },
      scale: { ...original.scale }
    };

    setObjects((prev) => [...prev, newObject]);
    setSelectedId(newObject.id);
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
      // Append new objects to current scene
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
        onDuplicate={handleDuplicateObject}
        onDelete={handleDeleteObject}
        onToggleVisibility={handleToggleVisibility}
        onUpdate={handleUpdateObject}
      />

      {/* Main Viewport Area */}
      <div className="flex-1 relative flex flex-col min-w-0">
        <Toolbar 
          transformMode={transformMode}
          setTransformMode={setTransformMode}
          unit={unit}
          setUnit={setUnit}
          showDimensions={showDimensions}
          setShowDimensions={setShowDimensions}
        />
        
        <Viewport 
          objects={objects}
          selectedId={selectedId}
          transformMode={transformMode}
          onSelect={handleSelect}
          onUpdate={handleUpdateObject}
          showDimensions={showDimensions}
          unit={unit}
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
        unit={unit}
      />
    </div>
  );
};

export default App;