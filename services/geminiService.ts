import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SceneObject, ShapeType } from "../types";

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

const SCENE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    objects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "A descriptive name for the object" },
          type: { 
            type: Type.STRING, 
            enum: ["BOX", "SPHERE", "CYLINDER", "TORUS", "PLANE", "ICOSAHEDRON"],
            description: "The geometric shape type"
          },
          position: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              z: { type: Type.NUMBER }
            },
            required: ["x", "y", "z"]
          },
          rotation: {
            type: Type.OBJECT,
            description: "Rotation in radians",
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              z: { type: Type.NUMBER }
            },
            required: ["x", "y", "z"]
          },
          scale: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              z: { type: Type.NUMBER }
            },
            required: ["x", "y", "z"]
          },
          color: { type: Type.STRING, description: "Hex color code (e.g. #FF0000)" }
        },
        required: ["name", "type", "position", "rotation", "scale", "color"]
      }
    }
  },
  required: ["objects"]
};

export const generateSceneFromPrompt = async (prompt: string): Promise<SceneObject[]> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert 3D scene composer. 
        Create a scene based on the user's description. 
        Return a JSON object with a list of 3D primitives.
        Coordinates: Y is up. 
        Use mostly Boxes, Spheres, Cylinders. 
        For complex objects (like 'snowman' or 'house'), compose them of multiple primitives.
        Scale should be relative to 1 unit = 1 meter.`,
        responseMimeType: "application/json",
        responseSchema: SCENE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    
    // Map the response to our internal structure with new IDs
    const objects: SceneObject[] = data.objects.map((obj: any) => ({
      id: generateId(),
      name: obj.name,
      type: obj.type as ShapeType, // Schema enum validation ensures this is safe
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
      color: obj.color,
      visible: true
    }));

    return objects;

  } catch (error) {
    console.error("Gemini Scene Generation Error:", error);
    throw error;
  }
};
