
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types";

const ai = new GoogleGenAI({ apiKey: "AIzaSyB3zCPgJHusYQufMRs8PcdGysbsHvZzOnU" });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mainTitle: { type: Type.STRING },
    summary: { type: Type.STRING },
    mcqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING }
        },
        required: ["question", "options", "answer"]
      }
    },
    fillInTheBlanks: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT,
        properties: {
          sentence: { type: Type.STRING },
          answer: { type: Type.STRING }
        },
        required: ["sentence", "answer"]
      } 
    },
    trueFalse: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.BOOLEAN },
          explanation: { type: Type.STRING }
        },
        required: ["question", "answer", "explanation"]
      }
    },
    youtubeLinks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING }
        },
        required: ["title", "url"]
      }
    },
    resources: { type: Type.ARRAY, items: { type: Type.STRING } },
    terminology: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          definition: { type: Type.STRING }
        },
        required: ["term", "definition"]
      }
    }
  },
  required: ["mainTitle", "summary", "mcqs", "fillInTheBlanks", "trueFalse", "youtubeLinks", "resources", "terminology"]
};

export async function analyzeStudyMaterial(
  fileData: string,
  mimeType: string,
  language: 'ar' | 'en' = 'ar'
): Promise<AnalysisResult> {
  const langName = language === 'ar' ? "Arabic" : "English";
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType
          }
        },
        {
          text: `Analyze this study material and provide a professional, deep, and extremely comprehensive educational report in ${langName}. 
          
          Follow the JSON schema exactly:
          1. Summary: Long, structured text with clear headers (minimum 1500 words).
          2. MCQs: Generate 50 questions.
          3. Fill-in-the-blanks: Generate 50 objects, each containing 'sentence' (the question with a blank) and 'answer' (the specific word/phrase that fills the blank).
          4. True/False: Generate 50 questions with explanations.
          5. YouTube: Provide 12 titles and search URLs.
          6. Resources: Provide a list of 8 valid academic URLs.
          7. Terminology: Define every technical term found.
          
          Ensure all generated text is in ${langName}.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA as any,
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function translateText(text: string, targetLang: 'ar' | 'en'): Promise<string> {
  const target = targetLang === 'ar' ? "Arabic" : "English";
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following academic text to ${target}. Maintain technical accuracy and professional tone: \n\n ${text}`,
    config: {
      temperature: 0.3,
    }
  });
  return response.text || "";
}

export async function chatWithAI(
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  message: string,
  context: string
) {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are UNIQUE AI Assistant, a world-class academic tutor. Context: ${context}`,
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text;
}
