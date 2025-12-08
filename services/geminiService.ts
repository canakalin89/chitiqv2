
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EvaluationResultData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const evaluationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: {
      type: Type.STRING,
      description: "The specific topic discussed. If the user selected 'Freestyle', this is the identified topic.",
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
  const isFreestyle = topic === "Freestyle" || topic === "Serbest Konu";
  const targetLanguage = language === 'tr' ? 'Turkish' : 'English';

  const systemInstruction = `You are an expert English Speaking Proficiency Evaluator. 
  Your task is to evaluate a user's spoken English based on an audio recording.

  **Process:**
  1.  **Transcribe**: Accurately transcribe the English speech.
  2.  **Summarize**: Provide a brief summary of the content.
  3.  **Identify Topic**: 
      - The user selected topic is: "${topic}".
      - ${isFreestyle 
        ? 'Since the user chose "Freestyle", analyze the content to IDENTIFY and name the specific topic they are discussing.' 
        : 'Use the selected topic as context. If the speech deviates significantly, note this in the feedback.'}
  4.  **Evaluate**: Score and critique the performance based on these 5 criteria:
      - **Rapport**: Engagement, tone, and connection.
      - **Organisation**: Structure, coherence, and flow.
      - **Delivery**: Fluency, pronunciation, and pacing.
      - **Language Use**: Vocabulary range, grammatical accuracy, and complexity.
      - **Creativity**: Originality of ideas and expression.
  5.  **Output Language**: 
      - The **transcription** must be in **English** (as spoken).
      - The **feedback**, **summary**, and **topic name** (if Freestyle) must be in **${targetLanguage}**.

  **Output Format**:
  Return a raw JSON object adhering strictly to the provided schema. Do not include markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64,
            },
          },
          {
            text: "Evaluate my speaking performance based on the system instructions.",
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
    if (!textResponse) {
      throw new Error("Received empty response from Gemini.");
    }

    const result = JSON.parse(textResponse) as EvaluationResultData;
    return result;

  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    throw error;
  }
};
