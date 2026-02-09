
import { GoogleGenAI, Modality } from "@google/genai";
import { TTSParameters } from "../types";
import { VOICES } from "../constants";

export const generateSpeech = async (params: TTSParameters): Promise<{ audioBase64: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const selectedVoice = VOICES.find(v => v.id === params.voiceId) || VOICES[0];
  
  const fullPrompt = `Actúa como un locutor profesional. Lee el siguiente texto en ESPAÑOL con estas especificaciones:
- Acento: ${params.accent}
- Género de la voz: ${selectedVoice.gender}
- Estilo: ${params.style}
- Tono: ${params.pitch > 1.1 ? 'agudo' : params.pitch < 0.9 ? 'grave' : 'normal'}
- Velocidad: ${params.speed}x

Interpretación de etiquetas especiales:
- [pausa]: Haz un silencio absoluto de 2 segundos.
- [risa]: Emite una risa breve y natural.
- [grito]: Habla de forma enérgica, exclamativa y con volumen alto.
- [llanto]: Emite un sonido de sollozo o llanto breve.

Texto a sintetizar:
${params.text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice.apiVoice },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioBase64) {
      throw new Error("El modelo no devolvió contenido de audio. Por favor, intenta de nuevo.");
    }

    return { audioBase64 };
  } catch (error: any) {
    console.error("Error en la llamada a Gemini TTS:", error);
    if (error?.message?.includes('500')) {
      throw new Error("Error interno del servidor (500). Esto suele ser un problema temporal del modelo. Intenta simplificar el texto o cambiar la voz.");
    }
    throw error;
  }
};
