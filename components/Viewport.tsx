import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Environment, GizmoHelper, GizmoViewport, ContactShadows, Html, Text, Center } from '@react-three/drei';
import * as THREE from 'three';
import { SceneObject, ShapeType, TransformMode, UnitType } from '../types';

interface ViewportProps {
  objects: SceneObject[];
  selectedId: string | null;
  transformMode: TransformMode;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<SceneObject>) => void;
  showDimensions: boolean;
  unit: UnitType;
}

interface SceneItemProps {
  object: SceneObject;
  isSelected: boolean;
  onSelect: () => void;
  transformMode: TransformMode;
  onUpdate: (id: string, updates: Partial<SceneObject>) => void;
  showDimensions: boolean;
  unit: UnitType;
}

const CONVERSION_FACTORS = {
  [UnitType.METER]: 1,
  [UnitType.MILLIMETER]: 1000,
  [UnitType.INCH]: 39.3701,
  [UnitType.FOOT]: 3.28084
};

const formatDim = (val: number, unit: UnitType) => {
  const factor = CONVERSION_FACTORS[unit];
  return (val * factor).toFixed(2) + unit;
};

// Heart Shape Generator
const useHeartShape = () => {
  return useMemo(() => {
    const x = 0, y = 0;
    const shape = new THREE.Shape();
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.20, y, x, y);
    shape.bezierCurveTo(x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35);
    shape.bezierCurveTo(x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35);
    shape.bezierCurveTo(x + 0.80, y + 0.35, x + 0.80, y, x + 0.50, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
    return shape;
  }, []);
};

const SceneItem: React.FC<SceneItemProps> = ({ 
  object, 
  isSelected, 
  onSelect, 
  transformMode, 
  onUpdate,
  showDimensions,
  unit
}) => {
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);
  const heartShape = useHeartShape();

  // For geometries that don't support simple scaling args nicely (like ExtrudeGeometry),
  // we handle scale via the group or mesh scale property, which is passed to the mesh component below.
  
  const renderGeometry = () => {
    switch (object.type) {
      case ShapeType.BOX:
        return <boxGeometry args={[1, 1, 1]} />;
      case ShapeType.SPHERE:
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case ShapeType.CYLINDER:
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case ShapeType.TORUS:
        return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      case ShapeType.PLANE:
        return <planeGeometry args={[1, 1]} />;
      case ShapeType.ICOSAHEDRON:
        return <icosahedronGeometry args={[0.5, 0]} />;
      case ShapeType.HEART:
        return (
          <extrudeGeometry 
            args={[heartShape, { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 }]} 
          />
        );
      case ShapeType.TEXT:
         return null; // Handled specially
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const material = (
    <meshStandardMaterial 
        color={object.color} 
        roughness={0.3} 
        metalness={0.2}
    />
  );

  if (object.type === ShapeType.TEXT) {
    return (
      <>
        {isSelected && mesh ? (
          <TransformControls
            object={mesh}
            mode={transformMode}
            onMouseUp={() => {
               if (mesh) {
                  const { position, rotation, scale } = mesh;
                  onUpdate(object.id, {
                    position: { x: position.x, y: position.y, z: position.z },
                    rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
                    scale: { x: scale.x, y: scale.y, z: scale.z }
                  });
               }
            }}
          />
        ) : null}
        <Text
          ref={setMesh as any}
          position={[object.position.x, object.position.y, object.position.z]}
          rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
          scale={[object.scale.x, object.scale.y, object.scale.z]}
          color={object.color}
          fontSize={1}
          anchorX="center"
          anchorY="middle"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {object.text || 'Text'}
        </Text>
      </>
    );
  }

  return (
    <>
      {isSelected && mesh ? (
        <TransformControls
          object={mesh}
          mode={transformMode}
          onMouseUp={() => {
             // Sync back the final transform to state when drag ends
             if (mesh) {
                const { position, rotation, scale } = mesh;
                onUpdate(object.id, {
                  position: { x: position.x, y: position.y, z: position.z },
                  rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
                  scale: { x: scale.x, y: scale.y, z: scale.z }
                });
             }
          }}
        />
      ) : null}

      <mesh
        ref={setMesh}
        visible={object.visible}
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
        scale={[object.scale.x, object.scale.y, object.scale.z]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {renderGeometry()}
        {material}
        
        {isSelected && showDimensions && (
          <Html position={[0, 1.2, 0]} center className="pointer-events-none select-none z-0">
             <div className="bg-gray-900/90 text-gray-200 text-[10px] p-2 rounded border border-gray-700 shadow-xl backdrop-blur-sm whitespace-nowrap font-mono leading-tight">
               <div className="flex justify-between gap-3"><span className="text-red-400 font-bold">X</span> <span>{formatDim(object.scale.x, unit)}</span></div>
               <div className="flex justify-between gap-3"><span className="text-green-400 font-bold">Y</span> <span>{formatDim(object.scale.y, unit)}</span></div>
               <div className="flex justify-between gap-3"><span className="text-blue-400 font-bold">Z</span> <span>{formatDim(object.scale.z, unit)}</span></div>
             </div>
          </Html>
        )}
      </mesh>
    </>
  );
};

export const Viewport: React.FC<ViewportProps> = ({
  objects,
  selectedId,
  transformMode,
  onSelect,
  onUpdate,
  showDimensions,
  unit
}) => {
  return (
    <div className="flex-1 h-full bg-gray-950 relative overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 50 }}
        className="touch-none"
      >
        <color attach="background" args={['#0d1117']} />
        
        <OrbitControls makeDefault />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
        />
        
        <Environment preset="city" />

        <Grid 
            args={[10, 10]} 
            cellSize={0.5} 
            cellThickness={0.5} 
            cellColor="#4a5568" 
            sectionSize={2} 
            sectionThickness={1}
            sectionColor="#718096"
            fadeDistance={25}
            infiniteGrid
        />
        
        {/* Selection click handler (background) */}
        <group onPointerMissed={(e) => e.type === 'click' && onSelect(null)}>
           {objects.map((obj) => (
            <SceneItem
              key={obj.id}
              object={obj}
              isSelected={selectedId === obj.id}
              onSelect={() => onSelect(obj.id)}
              transformMode={transformMode}
              onUpdate={onUpdate}
              showDimensions={showDimensions}
              unit={unit}
            />
          ))}
        </group>

        <ContactShadows opacity={0.4} scale={20} blur={2} far={4.5} />

        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['#e53e3e', '#38a169', '#3182ce']} labelColor="white" />
        </GizmoHelper>

      </Canvas>
    </div>
  );
};