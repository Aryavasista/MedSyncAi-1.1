import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Item schema
const medicationItemSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    genericName: { type: Type.STRING },
    dosage: { type: Type.STRING },
    formType: { type: Type.STRING },
    frequency: { type: Type.STRING, description: "Must be in plain English (e.g., 'Twice Daily' instead of 'BID', 'Before bed' instead of 'HS')." },
    mealRelation: { type: Type.STRING },
    totalQuantity: { type: Type.NUMBER, description: "Leave as 0 if not explicitly clear" },
    instructions: { type: Type.STRING, description: "Translate ALL medical abbreviations (BID, TID, PO, PRN, etc) to plain English. Do not use Latin terms." },
    confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 100 based on image clarity and text legibility" }
  },
  required: ["name", "formType", "confidence"]
};

// Response is an array of items
const responseSchema = {
  type: Type.ARRAY,
  items: medicationItemSchema
};

export const analyzePrescription = async (base64Image: string, mimeType: string): Promise<any[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `Analyze this image of a prescription, medication bottle, or list. 
            
            Tasks:
            1. Identify ALL medications present in the image.
            2. For each medication, extract the name, dosage, and form.
            3. CRITICAL: TRANSLATE all medical Latin/abbreviations into plain, easy-to-understand English. 
               - "BID" -> "Twice a day"
               - "TID" -> "Three times a day"
               - "QD" -> "Once daily"
               - "PO" -> "By mouth"
               - "PRN" -> "As needed"
               - "HS" -> "At bedtime"
            4. Assign a confidence score (0-100) for each extracted item based on legibility.
            
            Return a JSON Array of objects.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const text = response.text || '[]';
    // Handle potential markdown wrapping
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error analyzing prescription:", error);
    throw error;
  }
};

export const extractMedicationFromText = async (text: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            text: `Extract medication details from the following user description into a JSON object.
            
            User Description: "${text}"
            
            Fields required:
            - name (string)
            - genericName (string, optional)
            - dosage (string, e.g., "500mg")
            - formType (one of: pill, tablet, capsule, syrup, inhaler, injection, cream, drops, other)
            - frequency (string, e.g., "Daily")
            - mealRelation (one of: Before Meal, After Meal, With Meal, Anytime, Empty Stomach)
            - totalQuantity (number, estimate if mentioned, otherwise default to 30)
            - instructions (string, clean up the user's input into formal medical instructions. Convert abbreviations to plain English.)`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: medicationItemSchema
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error extraction medication from text:", error);
    throw error;
  }
};

export const getMedicalAdvice = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: "You are MedSync AI, a helpful medical medication assistant. Answer questions about medications, interactions, and general health. Keep answers concise and helpful. Disclaimer: You are an AI, not a doctor. Always advise consulting a professional for serious issues.",
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Error getting advice:", error);
    throw error;
  }
};