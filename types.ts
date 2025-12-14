
export enum ShapeType {
  BOX = 'BOX',
  SPHERE = 'SPHERE',
  CYLINDER = 'CYLINDER',
  TORUS = 'TORUS',
  PLANE = 'PLANE',
  ICOSAHEDRON = 'ICOSAHEDRON',
  HEART = 'HEART',
  TEXT = 'TEXT'
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

export enum MaterialType {
  STANDARD = 'STANDARD',
  METAL = 'METAL',
  WOOD = 'WOOD',
  GLASS = 'GLASS',
  PLASTIC = 'PLASTIC'
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
  materialType: MaterialType;
  visible: boolean;
  text?: string;
}

export interface EditorState {
  selectedId: string | null;
  transformMode: TransformMode;
  objects: SceneObject[];
}
