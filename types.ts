export enum ShapeType {
  BOX = 'BOX',
  SPHERE = 'SPHERE',
  CYLINDER = 'CYLINDER',
  TORUS = 'TORUS',
  PLANE = 'PLANE',
  ICOSAHEDRON = 'ICOSAHEDRON'
}

export enum TransformMode {
  TRANSLATE = 'translate',
  ROTATE = 'rotate',
  SCALE = 'scale'
}

export enum UnitType {
  METER = 'm',
  MILLIMETER = 'mm',
  INCH = 'in',
  FOOT = 'ft'
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface SceneObject {
  id: string;
  name: string;
  type: ShapeType;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  color: string;
  visible: boolean;
}

export interface EditorState {
  selectedId: string | null;
  transformMode: TransformMode;
  objects: SceneObject[];
}
