
import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationResultData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    topic: {
      type: Type.STRING,
      description: "The specific topic discussed. If the user selected 'Freestyle', identify the topic. Otherwise, MUST match the input topic EXACTLY.",
    },
    scores: {
      type: Type.OBJECT,
      properties: {
        rapport: { type: Type.NUMBER, description: "Score from 0 to 100." },
        organisation: { type: Type.NUMBER, description: "Score from 0 to 100." },
        delivery: { type: Type.NUMBER, description: "Score from 0 to 100." },
        languageUse: { type: Type.NUMBER, description: "Score from 0 to 100." },
        creativity: { type: Type.NUMBER, description: "Score from 0 to 100." },
      },
      required: ["rapport", "organisation", "delivery", "languageUse", "creativity"],
    },
    overallScore: {
      type: Type.NUMBER,
      description: "The calculated overall score from 0 to 100.",
    },
    feedback: {
      type: Type.OBJECT,
      properties: {
        rapport: { type: Type.STRING, description: "Detailed feedback on rapport." },
        organisation: { type: Type.STRING, description: "Detailed feedback on organisation." },
        delivery: { type: Type.STRING, description: "Detailed feedback on delivery." },
        languageUse: { type: Type.STRING, description: "Detailed feedback on language use." },
        creativity: { type: Type.STRING, description: "Detailed feedback on creativity." },
        pronunciation: { type: Type.STRING, description: "Specific feedback on pronunciation." },
        summary: { type: Type.STRING, description: "A concise summary of the speech." },
        transcription: { type: Type.STRING, description: "Verbatim transcription of the speech in English." },
      },
      required: [
        "rapport",
        "organisation",
        "delivery",
        "languageUse",
        "creativity",
        "pronunciation",
        "summary",
        "transcription",
      ],
    },
  },
  required: ["topic", "scores", "overallScore", "feedback"],
};

export const evaluateSpeech = async (
  audioBase64: string,
  mimeType: string,
  topic: string,
  allTopics: string[],
  language: 'en' | 'tr'
): Promise<EvaluationResultData> => {
  const isFreestyle = topic === "Freestyle" || topic === "Serbest Konuşma (İstediğiniz bir konu hakkında konuşun)";
  const targetLanguage = language === 'tr' ? 'Turkish' : 'English';

  const systemInstruction = `You are an expert English Speaking Proficiency Evaluator.
  Your task is to evaluate spoken English based on an audio recording.

  **CRITICAL RULE FOR TOPIC**: 
  - The input topic provided by the user is: "${topic}".
  - IF the input is NOT "Freestyle" (or the Turkish equivalent), you MUST return the EXACT string "${topic}" in the "topic" field of the JSON. Do not summarize or rename it.
  - IF the input IS "Freestyle", analyze the content and identify the specific topic discussed.

  **Evaluation Process:**
  1. **Transcribe**: VERBATIM transcription of the speech in English.
  2. **Summarize**: Brief summary of content in ${targetLanguage}.
  3. **Evaluate**: Score 0-100 and provide constructive feedback in ${targetLanguage} for:
     - Rapport (engagement/tone)
     - Organisation (structure/flow)
     - Delivery (fluency/pronunciation)
     - Language Use (vocabulary/grammar)
     - Creativity (originality)

  Return raw JSON only. No markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64,
            },
          },
          {
            text: `Evaluate this speaking session. The user is supposed to talk about: "${topic}".`,
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: evaluationSchema,
      },
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("Received empty response from Gemini.");

    const result = JSON.parse(textResponse) as EvaluationResultData;
    
    // Safety check: force correct topic name if AI deviated
    if (!isFreestyle) {
      result.topic = topic;
    }
    
    return result;

  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    throw error;
  }
};
