import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Viewport } from './components/Viewport';
import { Inspector } from './components/Inspector';
import { Toolbar } from './components/Toolbar';
import { AIPrompt } from './components/AIPrompt';
import { SceneObject, ShapeType, TransformMode, UnitType, MaterialType } from './types';
import { generateSceneFromPrompt } from './services/geminiService';

// Helper to generate simple random IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_OBJECTS: SceneObject[] = [
  {
    id: '1',
    name: 'Plank',
    type: ShapeType.BOX,
    // Positioned so the corner starts at 0,0,0 relative to the Sheet's origin
    // X: Center at half width (0.4572 / 2)
    // Y: Sheet height (0.018) + Half thickness (0.018 / 2) = 0.027. Sits exactly on top.
    // Z: Center at half depth (0.3048 / 2). Depth comes from local Y due to 90deg rotation.
    position: { x: 0.2286, y: 0.027, z: 0.1524 },
    rotation: { x: Math.PI / 2, y: 0, z: 0 },
    // 1.5ft = 0.4572m, 1ft = 0.3048m, 18mm = 0.018m
    scale: { x: 0.4572, y: 0.3048, z: 0.018 },
    color: '#8b5a2b',
    materialType: MaterialType.WOOD,
    visible: true
  },
  {
    id: '2',
    name: 'Sheet',
    type: ShapeType.BOX,
    // Positioned so the corner starts at 0,0,0
    // Width (X) = 2.4384 => Center X = 1.2192
    // Height (Y local -> Z world) = 1.2192 => Center Z = 0.6096
    // Depth (Z local -> Y world) = 0.018 => Center Y = 0.009
    position: { x: 1.2192, y: 0.009, z: 0.6096 },
    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
    // 8ft = 2.4384m, 4ft = 1.2192m, 18mm = 0.018m
    scale: { x: 2.4384, y: 1.2192, z: 0.018 },
    color: '#2d3748',
    materialType: MaterialType.STANDARD,
    visible: true
  }
];

const App: React.FC = () => {
  // History State Management
  const [history, setHistory] = useState<SceneObject[][]>([INITIAL_OBJECTS]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Derived current objects from history
  const objects = history[historyIndex];
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>(TransformMode.TRANSLATE);
  const [unit, setUnit] = useState<UnitType>(UnitType.INCH);
  const [showDimensions, setShowDimensions] = useState(false);
  const [showOrigin, setShowOrigin] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(false);

  // --- History Helpers ---

  // Wrapper for state updates that should be recorded in history
  const setObjectsWithHistory = useCallback((action: React.SetStateAction<SceneObject[]>) => {
    setHistory(prevHistory => {
      const currentObjects = prevHistory[historyIndex];
      const newObjects = typeof action === 'function' 
        ? (action as (prev: SceneObject[]) => SceneObject[])(currentObjects)
        : action;
      
      // Slice history to current point and append new state
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      return [...newHistory, newObjects];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      setHistoryIndex(prev => prev - 1);
    }
  }, [canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(prev => prev + 1);
    }
  }, [canRedo]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Y, Cmd+Shift+Z, or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') || 
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // --- Actions ---

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleAddObject = (type: ShapeType) => {
    // Default values
    let scale = { x: 1, y: 1, z: 1 };
    let position = { x: 0, y: 1, z: 0 };
    let extraProps: Partial<SceneObject> = {};

    // Custom defaults for specific shapes
    if (type === ShapeType.BOX) {
      // 1.5ft = 0.4572m, 1ft = 0.3048m, 18mm = 0.018m
      scale = { x: 0.4572, y: 0.3048, z: 0.018 };
      
      const sheet = objects.find(o => o.name === 'Sheet');
      if (sheet) {
        // Calculate Y to sit exactly on top of the sheet
        // We need to account for the fact that positions are now centers
        const sheetHalfThickness = sheet.scale.z / 2;
        const boxHalfHeight = scale.y / 2;
        
        position = { 
          x: sheet.position.x, 
          y: sheet.position.y + sheetHalfThickness + boxHalfHeight, 
          z: sheet.position.z 
        };
      } else {
        // Fallback if sheet is deleted: place on ground
        position = { x: 0, y: scale.y / 2, z: 0 };
      }
    } else if (type === ShapeType.TEXT) {
      extraProps = { text: 'Text' };
      scale = { x: 1, y: 1, z: 0.2 }; // Give text some default size
    } else if (type === ShapeType.HEART) {
       scale = { x: 1, y: 1, z: 0.2 }; // Default heart size
    }

    const newObject: SceneObject = {
      id: generateId(),
      name: `New ${type.toLowerCase()}`,
      type,
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: scale,
      color: '#ffffff',
      materialType: MaterialType.STANDARD,
      visible: true,
      ...extraProps
    };
    
    setObjectsWithHistory((prev) => [...prev, newObject]);
    setSelectedId(newObject.id);
  };

  const handleDeleteObject = (id: string) => {
    setObjectsWithHistory((prev) => prev.filter(o => o.id !== id));
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

    setObjectsWithHistory((prev) => [...prev, newObject]);
    setSelectedId(newObject.id);
  };

  const handleToggleVisibility = (id: string) => {
    setObjectsWithHistory((prev) => prev.map(obj => 
      obj.id === id ? { ...obj, visible: !obj.visible } : obj
    ));
  };

  const handleUpdateObject = useCallback((id: string, updates: Partial<SceneObject>) => {
    setObjectsWithHistory((prev) => prev.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  }, [setObjectsWithHistory]);

  const handleGenerateScene = async (prompt: string) => {
    try {
      setIsGenerating(true);
      const newObjects = await generateSceneFromPrompt(prompt);
      // Append new objects to current scene, adding default material since API doesn't return it
      const objectsWithMaterial = newObjects.map(obj => ({
        ...obj,
        materialType: MaterialType.STANDARD
      }));
      
      setObjectsWithHistory((prev) => [...prev, ...objectsWithMaterial]);
      
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
          showOrigin={showOrigin}
          setShowOrigin={setShowOrigin}
          showCoordinates={showCoordinates}
          setShowCoordinates={setShowCoordinates}
          snapEnabled={snapEnabled}
          setSnapEnabled={setSnapEnabled}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        
        <Viewport 
          objects={objects}
          selectedId={selectedId}
          transformMode={transformMode}
          onSelect={handleSelect}
          onUpdate={handleUpdateObject}
          showDimensions={showDimensions}
          showOrigin={showOrigin}
          showCoordinates={showCoordinates}
          unit={unit}
          snapEnabled={snapEnabled}
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