
import { GoogleGenAI } from "@google/genai";

// Lazy initialization to prevent crash on module load if key is missing
let aiClient: GoogleGenAI | null = null;

const getApiKey = () => {
  try {
    // Safely check for process.env.API_KEY to avoid ReferenceError if process is undefined
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore errors accessing process
  }
  return undefined;
};

const getAiClient = () => {
  if (!aiClient) {
    const apiKey = getApiKey();
    if (!apiKey) {
      // Throw a specific error code we can catch later
      throw new Error("API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const askExpert = async (prompt: string, imageFile?: File | null): Promise<string> => {
  try {
    const client = getAiClient();
    // Using gemini-2.5-flash as a reliable default for text/image tasks
    const model = 'gemini-2.5-flash'; 
    
    let contents: any;

    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      const textPart = { text: prompt };
      contents = { parts: [textPart, imagePart] };
    } else {
      contents = prompt;
    }

    const response = await client.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: "You are an expert tutor for university-level students in STEM fields. Your goal is to explain complex topics clearly and concisely. If an image is provided, analyze it as part of the student's question. Provide a detailed, step-by-step answer. Use Markdown for formatting where appropriate, such as for code blocks, lists, or emphasis.",
      },
    });
    
    return response.text || "No response generated.";

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Graceful handling for missing API key so the rest of the app works
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
        return "Expert AI features are currently disabled because the Google API Key is not configured. Please continue using the calculators.";
    }

    if (error instanceof Error) {
        return `An error occurred while contacting the expert: ${error.message}. Please check your connection.`;
    }
    return "An unknown error occurred while contacting the expert.";
  }
};
