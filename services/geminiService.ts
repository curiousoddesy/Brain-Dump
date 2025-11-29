
import { GoogleGenAI, Type } from "@google/genai";
import { AIParseResult, Priority, Status } from "../types";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const parseTaskFromInput = async (input: string): Promise<AIParseResult> => {
  if (!ai) {
    // Return fallback when no API key is configured
    return {
      title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
      description: input,
      priority: Priority.MEDIUM,
      status: Status.TODO,
      tags: [],
      dependencies: [],
      blockers: []
    };
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following user input which describes a work task, issue, or blocker. 
      Extract the core task, suggest a title, a detailed description, a priority level based on urgency, and the most appropriate initial status.
      
      Crucially, identify if there are any 'dependencies' (people or things the user is waiting on) or 'blockers' (issues preventing progress).
      
      User Input: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A concise, action-oriented title." },
            description: { type: Type.STRING, description: "A clear summary of the task and context." },
            priority: { 
              type: Type.STRING, 
              enum: [Priority.HIGH, Priority.MEDIUM, Priority.LOW],
              description: "Urgency level."
            },
            status: {
              type: Type.STRING,
              enum: [Status.TODO, Status.IN_PROGRESS, Status.BLOCKED, Status.DONE],
              description: "Current state. If there are blockers, prefer BLOCKED."
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Keywords like 'Engineering', 'Email', 'Bug', 'Admin'."
            },
            dependencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "External factors or people the task is waiting on (e.g., 'Waiting for design review')."
            },
            blockers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific obstacles preventing progress (e.g., 'API is down', 'Bug #123')."
            }
          },
          required: ["title", "description", "priority", "status", "tags", "dependencies", "blockers"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIParseResult;
    }
    
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Error parsing task with Gemini:", error);
    // Fallback if AI fails
    return {
      title: "New Task",
      description: input,
      priority: Priority.MEDIUM,
      status: Status.TODO,
      tags: ["Manual"],
      dependencies: [],
      blockers: []
    };
  }
};
