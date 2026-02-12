import { GoogleGenAI, Type, FunctionDeclaration, Modality, LiveServerMessage } from "@google/genai";
import { SYSTEM_INSTRUCTION_CHAT } from "../constants";

// Initialize AI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const MODEL_CHAT_REASONING = 'gemini-3-pro-preview';
const MODEL_CHAT_FAST = 'gemini-3-flash-preview'; // Updated to valid fast model
const MODEL_SEARCH = 'gemini-3-flash-preview';
const MODEL_MAPS = 'gemini-2.5-flash';
const MODEL_IMAGE_GEN = 'gemini-3-pro-image-preview'; // Nano Banana Pro
const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image'; // Nano Banana
const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-12-2025';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';
const MODEL_VISION = 'gemini-3-pro-preview'; // For Video and complex image

/**
 * Chat with Thinking or Tools
 */
export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  mode: 'reasoning' | 'fast' | 'search' | 'maps',
  mediaPart?: { inlineData: { data: string; mimeType: string } }
) => {
  let model = MODEL_CHAT_FAST;
  let tools: any[] | undefined = undefined;
  let toolConfig: any | undefined = undefined;
  let thinkingConfig: any | undefined = undefined;

  // Logic to select model based on content and mode
  if (mediaPart) {
      // Always use Vision Pro for media analysis (required for Video)
      model = MODEL_VISION;
      // If the user selected reasoning mode, apply thinking budget to the Pro model
      if (mode === 'reasoning') {
        thinkingConfig = { thinkingBudget: 32768 };
      }
  } else if (mode === 'reasoning') {
    model = MODEL_CHAT_REASONING;
    // Max thinking budget for Pro
    thinkingConfig = { thinkingBudget: 32768 }; 
  } else if (mode === 'search') {
    model = MODEL_SEARCH;
    tools = [{ googleSearch: {} }];
  } else if (mode === 'maps') {
    model = MODEL_MAPS;
    tools = [{ googleMaps: {} }];
    // Get user location if possible (mocked for simplicity here, or real usage)
    if (navigator.geolocation) {
       try {
         const pos: any = await new Promise((resolve, reject) => {
           navigator.geolocation.getCurrentPosition(resolve, reject);
         });
         toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              }
            }
         };
       } catch (e) {
         console.warn("Location denied for maps", e);
       }
    }
  }

  const contents: any = {
    role: 'user',
    parts: [{ text: message }]
  };

  if (mediaPart) {
    contents.parts.unshift(mediaPart);
  }

  // Construct full history for context
  const historyParts = history.map(h => ({ role: h.role, parts: h.parts }));
  historyParts.push(contents);

  const config: any = {
    tools,
    toolConfig,
    thinkingConfig,
    systemInstruction: SYSTEM_INSTRUCTION_CHAT
  };
  
  const response = await ai.models.generateContent({
    model,
    contents: historyParts,
    config
  });

  return response;
};

/**
 * Generate Image (SpringBloom Visuals)
 */
export const generateImage = async (prompt: string, size: '1K' | '2K' | '4K') => {
  const response = await ai.models.generateContent({
    model: MODEL_IMAGE_GEN,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: '1:1' // Square for cards
      }
    }
  });
  
  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * Edit Image (Nano Banana)
 */
export const editImage = async (base64Image: string, prompt: string) => {
  const response = await ai.models.generateContent({
    model: MODEL_IMAGE_EDIT,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image
          }
        },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
      }
  }
  return null;
};

/**
 * Text to Speech
 */
export const generateSpeech = async (text: string) => {
    const response = await ai.models.generateContent({
        model: MODEL_TTS,
        contents: { parts: [{ text }] },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }, // Gentle voice
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return base64Audio;
    }
    return null;
};

/**
 * Live API Connection
 */
export const connectLiveSession = async (
    onAudioData: (base64: string) => void,
    onClose: () => void
) => {
    return ai.live.connect({
        model: MODEL_LIVE,
        callbacks: {
            onopen: () => console.log('Live Session Opened'),
            onmessage: (msg: LiveServerMessage) => {
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                    onAudioData(audioData);
                }
                if (msg.serverContent?.turnComplete) {
                    // Turn complete logic if needed
                }
            },
            onclose: () => {
                console.log('Live Session Closed');
                onClose();
            },
            onerror: (err) => console.error('Live Error', err)
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } // Motherly, soothing voice
            },
            systemInstruction: "You are SpringBloom, a warm, empathetic, and observant AI companion for parents. You can SEE the user through their camera. \n\nYOUR GOAL: Provide emotional support, parenting advice (VB-MAPP/ESDM), and friendly companionship. \n\nBEHAVIOR:\n1. Be observant. If you see the user, comment warmly (e.g., 'It's good to see you smiling', 'You look a bit tired, are you okay?').\n2. If the user shows you a toy or an item, acknowledge it.\n3. Speak in a soothing, non-judgmental tone. \n4. Keep responses concise and natural (like a video call).\n5. You are NOT a doctor."
        }
    });
};

// Helper for PCM Blob creation (for Live API input)
export function createPcmBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    const base64 = btoa(binary);

    return {
        data: base64,
        mimeType: 'audio/pcm;rate=16000',
    } as any; // Type casting as genai Blob type is slightly different from DOM Blob
}